-- ==============================================================================
-- RouteLess: The Last Mile — Comprehensive Supabase Database Schema & RLS Policies
-- Migration: 20261113000000_routeless_schema.sql
-- ==============================================================================

-- 1. Profiles Table (Extending auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on auth.users sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Scenarios Table (Multi-scenario isolation for demos & production)
CREATE TABLE IF NOT EXISTS public.scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active_crisis BOOLEAN DEFAULT false NOT NULL,
  simulation_clock TEXT DEFAULT '06:45 AM' NOT NULL,
  version INT DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- 3. Scenario Memberships (Strict RBAC: 'coordinator' vs 'student')
CREATE TABLE IF NOT EXISTS public.scenario_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('coordinator', 'student')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (scenario_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.scenario_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_scenario ON public.scenario_memberships(scenario_id);
ALTER TABLE public.scenario_memberships ENABLE ROW LEVEL SECURITY;

-- Security Definer Role Checker (Prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.is_scenario_coordinator(p_scenario_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.scenario_memberships
    WHERE scenario_id = p_scenario_id
      AND user_id = auth.uid()
      AND role = 'coordinator'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_scenario_member(p_scenario_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.scenario_memberships
    WHERE scenario_id = p_scenario_id
      AND user_id = auth.uid()
  );
END;
$$;

-- 4. Villages Reference Table
CREATE TABLE IF NOT EXISTS public.villages (
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  panchayat TEXT,
  coord_x INT NOT NULL,
  coord_y INT NOT NULL,
  connectivity_type TEXT NOT NULL,
  PRIMARY KEY (scenario_id, id)
);

ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;

-- 5. Institutions Reference Table
CREATE TABLE IF NOT EXISTS public.institutions (
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  school_start_time TEXT NOT NULL,
  address TEXT,
  PRIMARY KEY (scenario_id, id)
);

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

-- 6. Route Connections (Network Corridors)
CREATE TABLE IF NOT EXISTS public.route_connections (
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  from_id TEXT NOT NULL,
  to_id TEXT NOT NULL,
  from_name TEXT NOT NULL,
  to_name TEXT NOT NULL,
  distance_km NUMERIC(5, 2) NOT NULL,
  travel_minutes INT NOT NULL,
  road_type TEXT NOT NULL,
  is_blocked BOOLEAN DEFAULT false NOT NULL,
  blocked_reason TEXT,
  PRIMARY KEY (scenario_id, id)
);

ALTER TABLE public.route_connections ENABLE ROW LEVEL SECURITY;

-- 7. Vehicle Trips
CREATE TABLE IF NOT EXISTS public.vehicle_trips (
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  vehicle_name TEXT NOT NULL,
  registration_number TEXT,
  vehicle_type TEXT NOT NULL,
  capacity INT NOT NULL CHECK (capacity >= 0),
  is_cancelled BOOLEAN DEFAULT false NOT NULL,
  cancel_reason TEXT,
  is_government_bus BOOLEAN DEFAULT false NOT NULL,
  destination_institution_id TEXT NOT NULL,
  destination_name TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  final_arrival_time TEXT NOT NULL,
  stops JSONB NOT NULL DEFAULT '[]'::jsonb,
  path_connection_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  PRIMARY KEY (scenario_id, id)
);

ALTER TABLE public.vehicle_trips ENABLE ROW LEVEL SECURITY;

-- 8. Transport Requests (Student transport bookings)
CREATE TABLE IF NOT EXISTS public.transport_requests (
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  grade_or_stream TEXT,
  origin_village_id TEXT NOT NULL,
  origin_village_name TEXT NOT NULL,
  destination_institution_id TEXT NOT NULL,
  destination_name TEXT NOT NULL,
  required_arrival_time TEXT NOT NULL,
  priority_category TEXT NOT NULL,
  is_exam_student BOOLEAN DEFAULT false NOT NULL,
  exam_start_time TEXT,
  exam_subject TEXT,
  submission_order INT NOT NULL,
  submission_timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_crisis_added BOOLEAN DEFAULT false NOT NULL,
  notes TEXT,
  PRIMARY KEY (scenario_id, id)
);

CREATE INDEX IF NOT EXISTS idx_requests_scenario ON public.transport_requests(scenario_id);
CREATE INDEX IF NOT EXISTS idx_requests_user ON public.transport_requests(user_id);
ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;

-- 9. Allocation Runs (Saved runs)
CREATE TABLE IF NOT EXISTS public.allocation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('BASELINE', 'RECOVERY', 'CRISIS_BEFORE_RECOVERY')),
  scenario_version INT NOT NULL,
  total_requests INT NOT NULL,
  assigned_count INT NOT NULL,
  unmet_count INT NOT NULL,
  total_capacity INT NOT NULL,
  allocated_capacity INT NOT NULL,
  capacity_utilization_pct INT NOT NULL,
  exam_requests_count INT NOT NULL,
  exam_assigned_on_time_count INT NOT NULL,
  trip_utilization JSONB NOT NULL DEFAULT '[]'::jsonb,
  solver_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_allocation_runs_scenario ON public.allocation_runs(scenario_id, created_at DESC);
ALTER TABLE public.allocation_runs ENABLE ROW LEVEL SECURITY;

-- 10. Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allocation_run_id UUID NOT NULL REFERENCES public.allocation_runs(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  trip_id TEXT NOT NULL,
  vehicle_name TEXT NOT NULL,
  pickup_village_id TEXT NOT NULL,
  pickup_time TEXT NOT NULL,
  dropoff_institution_id TEXT NOT NULL,
  estimated_arrival_time TEXT NOT NULL,
  seat_number INT NOT NULL,
  is_on_time BOOLEAN NOT NULL,
  is_exam_student BOOLEAN NOT NULL,
  UNIQUE (allocation_run_id, request_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_run ON public.assignments(allocation_run_id);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Profiles: Users can select their own profile.
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Scenarios: Members can read scenario details.
CREATE POLICY "Members can view their scenario"
  ON public.scenarios FOR SELECT
  USING (auth.uid() IS NOT NULL AND (public.is_scenario_member(id) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Coordinators can update their scenario"
  ON public.scenarios FOR UPDATE
  USING (public.is_scenario_coordinator(id));

-- Scenario Memberships: Users can see their own membership; coordinators can see all memberships in their scenario.
CREATE POLICY "Users can read own scenario membership"
  ON public.scenario_memberships FOR SELECT
  USING (auth.uid() = user_id OR public.is_scenario_coordinator(scenario_id));

-- Villages & Institutions: Read-only for authenticated scenario members, manageable by coordinators
CREATE POLICY "Authenticated users can view villages"
  ON public.villages FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coordinators can manage villages"
  ON public.villages FOR ALL
  USING (public.is_scenario_coordinator(scenario_id));

CREATE POLICY "Authenticated users can view institutions"
  ON public.institutions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coordinators can manage institutions"
  ON public.institutions FOR ALL
  USING (public.is_scenario_coordinator(scenario_id));

-- Route Connections: Read by authenticated users; update by coordinators only
CREATE POLICY "Authenticated users can view route connections"
  ON public.route_connections FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coordinators can manage route connections"
  ON public.route_connections FOR ALL
  USING (public.is_scenario_coordinator(scenario_id));

-- Vehicle Trips: Read by authenticated users; update by coordinators only
CREATE POLICY "Authenticated users can view vehicle trips"
  ON public.vehicle_trips FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coordinators can manage vehicle trips"
  ON public.vehicle_trips FOR ALL
  USING (public.is_scenario_coordinator(scenario_id));

-- Transport Requests:
-- Students may view ONLY their own requests.
-- Coordinators may view ALL requests in the scenario.
CREATE POLICY "Students can view own requests, coordinators view all"
  ON public.transport_requests FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    public.is_scenario_coordinator(scenario_id)
  );

CREATE POLICY "Students can insert their own request"
  ON public.transport_requests FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (user_id = auth.uid() OR public.is_scenario_coordinator(scenario_id))
  );

CREATE POLICY "Coordinators can manage all requests"
  ON public.transport_requests FOR ALL
  USING (public.is_scenario_coordinator(scenario_id));

-- Allocation Runs & Assignments:
-- Authenticated members can view allocation runs and assignments.
-- Only coordinators can save new allocation runs or modify them.
CREATE POLICY "Authenticated users can view allocation runs"
  ON public.allocation_runs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coordinators can insert allocation runs"
  ON public.allocation_runs FOR INSERT
  WITH CHECK (public.is_scenario_coordinator(scenario_id));

CREATE POLICY "Authenticated users can view assignments"
  ON public.assignments FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.allocation_runs r
      WHERE r.id = allocation_run_id
    )
  );

CREATE POLICY "Coordinators can insert assignments"
  ON public.assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.allocation_runs r
      WHERE r.id = allocation_run_id
        AND public.is_scenario_coordinator(r.scenario_id)
    )
  );

-- ==============================================================================
-- DATABASE FUNCTIONS / ATOMIC RPCS
-- ==============================================================================

-- Atomic Crisis Activation Procedure
CREATE OR REPLACE FUNCTION public.activate_exam_crisis_rpc(p_scenario_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_scenario RECORD;
  v_added_count INT := 0;
BEGIN
  -- 1. Verify coordinator authorization
  IF NOT public.is_scenario_coordinator(p_scenario_id) THEN
    RAISE EXCEPTION 'Access Denied: Only authorized coordinators can activate the Exam Day Crisis.';
  END IF;

  SELECT * INTO v_scenario FROM public.scenarios WHERE id = p_scenario_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Scenario not found.';
  END IF;

  -- 2. Disable two government buses
  UPDATE public.vehicle_trips
  SET is_cancelled = true,
      cancel_reason = CASE
        WHEN id = 'trip-01' THEN 'Depot mechanical air-brake valve failure during 06:30 pre-trip check'
        WHEN id = 'trip-02' THEN 'Alternator burnout and electrical short-circuit; out of commission'
        ELSE cancel_reason
      END
  WHERE scenario_id = p_scenario_id
    AND id IN ('trip-01', 'trip-02');

  -- 3. Block major connecting road between Ganjimutt and Farangipete
  UPDATE public.route_connections
  SET is_blocked = true,
      blocked_reason = 'Phalguni-Netravati river overflow; 3ft flash flood runoff across valley corridor'
  WHERE scenario_id = p_scenario_id
    AND id = 'seg-ganji-far';

  -- 4. Idempotently insert deterministic 40% surge requests (8 requests for 20 baseline)
  INSERT INTO public.transport_requests (
    scenario_id, id, student_name, grade_orStream, origin_village_id, origin_village_name,
    destination_institution_id, destination_name, required_arrival_time, priority_category,
    is_exam_student, exam_start_time, exam_subject, submission_order, is_crisis_added, notes
  )
  VALUES
    (p_scenario_id, 'req-crisis-01', 'Bhavya Hegde', 'Grade 12 - Science (PUC)', 'vil-ganjimutt', 'Ganjimutt Valley', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:15', 'CRITICAL_EXAM', true, '08:30', 'PUC II State Physics Board Exam', 21, true, 'Crisis surge exam candidate; needs urgent transport'),
    (p_scenario_id, 'req-crisis-02', 'Chetan Kulal', 'Grade 10', 'vil-gurupura', 'Gurupura Riverbank', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:15', 'CRITICAL_EXAM', true, '08:30', 'SSLC Mathematics Board Exam', 22, true, 'Causeway affected; board exam student'),
    (p_scenario_id, 'req-crisis-03', 'Deepthi Poojary', '2nd Year Diploma (Mech)', 'vil-kalladka', 'Kalladka Foothills', 'inst-kpt', 'Karnataka (Govt) Polytechnic (KPT)', '08:25', 'CRITICAL_EXAM', true, '08:40', 'DTE Applied Thermodynamics Practical Exam', 23, true, 'Stranded by Bus 02 failure'),
    (p_scenario_id, 'req-crisis-04', 'Eshwar Naik', 'Grade 12 - Commerce (PUC)', 'vil-pavoor', 'Pavoor Riverine Fringe', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:15', 'CRITICAL_EXAM', true, '08:30', 'PUC II Business Studies State Exam', 24, true, 'Remote riverine student; Bus 01 cancelled'),
    (p_scenario_id, 'req-crisis-05', 'Farzana Banu', 'Grade 10', 'vil-farangipete', 'Farangipete Junction', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:15', 'CRITICAL_EXAM', true, '08:30', 'SSLC Social Science Board Exam', 25, true, 'Transfer waypoint passenger'),
    (p_scenario_id, 'req-crisis-06', 'Gautham Adiga', '1st Year ITI (Electrical)', 'vil-ganjimutt', 'Ganjimutt Valley', 'inst-kpt', 'Karnataka (Govt) Polytechnic (KPT)', '08:45', 'REGULAR_ATTENDANCE', false, null, null, 26, true, 'Vocational workshop practical assessment'),
    (p_scenario_id, 'req-crisis-07', 'Harshitha Rai', 'Grade 11 - Science', 'vil-kalladka', 'Kalladka Foothills', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:30', 'REGULAR_ATTENDANCE', false, null, null, 27, true, 'Physics laboratory experiment test'),
    (p_scenario_id, 'req-crisis-08', 'Irfan Sheikh', 'Grade 9', 'vil-gurupura', 'Gurupura Riverbank', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:30', 'REGULAR_ATTENDANCE', false, null, null, 28, true, 'Midterm evaluation session')
  ON CONFLICT (scenario_id, id) DO NOTHING;

  GET DIAGNOSTICS v_added_count = ROW_COUNT;

  -- 5. Bump scenario version & set is_active_crisis = true
  UPDATE public.scenarios
  SET is_active_crisis = true,
      version = version + 1,
      updated_at = now()
  WHERE id = p_scenario_id;

  RETURN jsonb_build_object(
    'success', true,
    'scenario_id', p_scenario_id,
    'is_active_crisis', true,
    'new_requests_added', v_added_count,
    'message', 'Exam Day Crisis activated successfully.'
  );
END;
$$;

-- Atomic Scenario Reset Procedure
CREATE OR REPLACE FUNCTION public.reset_scenario_rpc(p_scenario_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- 1. Verify coordinator authorization
  IF NOT public.is_scenario_coordinator(p_scenario_id) THEN
    RAISE EXCEPTION 'Access Denied: Only authorized coordinators can reset the scenario.';
  END IF;

  -- 2. Restore vehicles to active status
  UPDATE public.vehicle_trips
  SET is_cancelled = false,
      cancel_reason = null
  WHERE scenario_id = p_scenario_id;

  -- 3. Unblock all route connections
  UPDATE public.route_connections
  SET is_blocked = false,
      blocked_reason = null
  WHERE scenario_id = p_scenario_id;

  -- 4. Remove synthetic crisis requests (leaving student-submitted requests intact!)
  DELETE FROM public.transport_requests
  WHERE scenario_id = p_scenario_id
    AND is_crisis_added = true;

  -- 5. Mark crisis inactive and bump version
  UPDATE public.scenarios
  SET is_active_crisis = false,
      version = version + 1,
      updated_at = now()
  WHERE id = p_scenario_id;

  RETURN jsonb_build_object(
    'success', true,
    'scenario_id', p_scenario_id,
    'is_active_crisis', false,
    'message', 'Scenario reset to normal baseline successfully.'
  );
END;
$$;

-- Atomic Allocation Save with Concurrency / Stale-check Protection
CREATE OR REPLACE FUNCTION public.save_allocation_run_rpc(
  p_scenario_id UUID,
  p_mode TEXT,
  p_expected_version INT,
  p_total_requests INT,
  p_assigned_count INT,
  p_unmet_count INT,
  p_total_capacity INT,
  p_allocated_capacity INT,
  p_capacity_utilization_pct INT,
  p_exam_requests_count INT,
  p_exam_assigned_on_time_count INT,
  p_trip_utilization JSONB,
  p_solver_logs JSONB,
  p_assignments JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_current_version INT;
  v_run_id UUID;
  v_assignment JSONB;
BEGIN
  -- 1. Check authorization
  IF NOT public.is_scenario_coordinator(p_scenario_id) THEN
    RAISE EXCEPTION 'Access Denied: Only authorized coordinators can save allocation plans.';
  END IF;

  -- 2. Concurrency / Stale check
  SELECT version INTO v_current_version FROM public.scenarios WHERE id = p_scenario_id;
  IF v_current_version <> p_expected_version THEN
    RAISE EXCEPTION 'Stale State Conflict: The scenario was modified (version % vs expected %). Please recompute the allocation with current data.', v_current_version, p_expected_version;
  END IF;

  -- 3. Insert allocation run
  INSERT INTO public.allocation_runs (
    scenario_id, mode, scenario_version, total_requests, assigned_count, unmet_count,
    total_capacity, allocated_capacity, capacity_utilization_pct,
    exam_requests_count, exam_assigned_on_time_count, trip_utilization, solver_logs
  )
  VALUES (
    p_scenario_id, p_mode, v_current_version, p_total_requests, p_assigned_count, p_unmet_count,
    p_total_capacity, p_allocated_capacity, p_capacity_utilization_pct,
    p_exam_requests_count, p_exam_assigned_on_time_count, p_trip_utilization, p_solver_logs
  )
  RETURNING id INTO v_run_id;

  -- 4. Bulk insert assignments
  FOR v_assignment IN SELECT * FROM jsonb_array_elements(p_assignments)
  LOOP
    INSERT INTO public.assignments (
      allocation_run_id, request_id, student_name, trip_id, vehicle_name,
      pickup_village_id, pickup_time, dropoff_institution_id,
      estimated_arrival_time, seat_number, is_on_time, is_exam_student
    )
    VALUES (
      v_run_id,
      v_assignment->>'requestId',
      v_assignment->>'studentName',
      v_assignment->>'tripId',
      v_assignment->>'vehicleName',
      v_assignment->>'pickupVillageId',
      v_assignment->>'pickupTime',
      v_assignment->>'dropoffInstitutionId',
      v_assignment->>'estimatedArrivalTime',
      (v_assignment->>'seatNumber')::INT,
      (v_assignment->>'isOnTime')::BOOLEAN,
      (v_assignment->>'isExamStudent')::BOOLEAN
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'allocation_run_id', v_run_id,
    'scenario_id', p_scenario_id,
    'assigned_count', p_assigned_count,
    'unmet_count', p_unmet_count
  );
END;
$$;

