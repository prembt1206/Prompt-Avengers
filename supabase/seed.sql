-- ==============================================================================
-- RouteLess: The Last Mile — Seed Data for Mangaluru Rural Suburban Corridor
-- File: supabase/seed.sql
-- ==============================================================================

-- 1. Create Default Scenario
INSERT INTO public.scenarios (id, name, description, is_active_crisis, simulation_clock, version)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Mangaluru Rural Suburban Transit Corridor (Default Demo Scenario)',
  'Covers Pavoor riverine fringe, Kalladka foothills, Ganjimutt valley, and Gurupura riverbank connecting to St. Aloysius and KPT Polytechnic.',
  false,
  '06:45 AM',
  1
)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Villages
INSERT INTO public.villages (scenario_id, id, name, panchayat, coord_x, coord_y, connectivity_type)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'vil-pavoor', 'Pavoor Riverine Fringe', 'Pavoor Grama Panchayat, Mangaluru Taluq', 90, 120, 'Fair-Weather'),
  ('a0000000-0000-0000-0000-000000000001', 'vil-farangipete', 'Farangipete Junction', 'Bantwal Mandal / Mangaluru East Arterial', 300, 220, 'All-Weather'),
  ('a0000000-0000-0000-0000-000000000001', 'vil-kalladka', 'Kalladka Foothills', 'Golthamajalu / Kalladka Grama Panchayat', 120, 350, 'Fair-Weather'),
  ('a0000000-0000-0000-0000-000000000001', 'vil-ganjimutt', 'Ganjimutt Valley', 'Ganjimutt Grama Panchayat, Mangaluru North', 500, 340, 'All-Weather'),
  ('a0000000-0000-0000-0000-000000000001', 'vil-gurupura', 'Gurupura Riverbank', 'Gurupura Grama Panchayat, Mangaluru', 680, 220, 'Vulnerable River Crossing'),
  ('a0000000-0000-0000-0000-000000000001', 'vil-adyar', 'Adyar Ridge Waypoint', 'Adyar Grama Panchayat, Mangaluru East', 410, 270, 'All-Weather')
ON CONFLICT (scenario_id, id) DO NOTHING;

-- 3. Seed Institutions
INSERT INTO public.institutions (scenario_id, id, name, code, school_start_time, address)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'inst-aloysius', 'St. Aloysius High School & PU College', 'ST-ALOYSIUS-MLR', '08:30', 'Light House Hill Road, Hampankatta, Mangaluru — 575001'),
  ('a0000000-0000-0000-0000-000000000001', 'inst-kpt', 'Karnataka (Govt) Polytechnic (KPT)', 'KPT-KADRI-MLR', '08:45', 'KPT Junction, Kadri Hills, Mangaluru — 575004')
ON CONFLICT (scenario_id, id) DO NOTHING;

-- 4. Seed Route Connections
INSERT INTO public.route_connections (scenario_id, id, from_id, to_id, from_name, to_name, distance_km, travel_minutes, road_type, is_blocked, blocked_reason)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'seg-pav-far', 'vil-pavoor', 'vil-farangipete', 'Pavoor Fringe', 'Farangipete Junction', 12.0, 25, 'Gravel Corridor', false, null),
  ('a0000000-0000-0000-0000-000000000001', 'seg-far-aloysius', 'vil-farangipete', 'inst-aloysius', 'Farangipete Junction', 'St. Aloysius School, Light House Hill', 14.0, 25, 'All-Weather Tar', false, null),
  ('a0000000-0000-0000-0000-000000000001', 'seg-kal-far', 'vil-kalladka', 'vil-farangipete', 'Kalladka Foothills', 'Farangipete Junction', 10.0, 20, 'Gravel Corridor', false, null),
  ('a0000000-0000-0000-0000-000000000001', 'seg-far-kpt', 'vil-farangipete', 'inst-kpt', 'Farangipete Junction', 'Karnataka Polytechnic (KPT), Kadri', 16.0, 30, 'All-Weather Tar', false, null),
  ('a0000000-0000-0000-0000-000000000001', 'seg-guru-ganji', 'vil-gurupura', 'vil-ganjimutt', 'Gurupura Riverbank', 'Ganjimutt Valley', 8.0, 20, 'Low-Lying Causeway', false, null),
  ('a0000000-0000-0000-0000-000000000001', 'seg-ganji-far', 'vil-ganjimutt', 'vil-farangipete', 'Ganjimutt Valley', 'Farangipete Junction', 11.0, 20, 'Gravel Corridor', false, null),
  ('a0000000-0000-0000-0000-000000000001', 'seg-ganji-adyar', 'vil-ganjimutt', 'vil-adyar', 'Ganjimutt Valley', 'Adyar Ridge Waypoint', 6.0, 12, 'Detour Bypass', false, null),
  ('a0000000-0000-0000-0000-000000000001', 'seg-adyar-far', 'vil-adyar', 'vil-farangipete', 'Adyar Ridge Waypoint', 'Farangipete Junction', 8.0, 16, 'Detour Bypass', false, null)
ON CONFLICT (scenario_id, id) DO NOTHING;

-- 5. Seed Vehicle Trips
INSERT INTO public.vehicle_trips (
  scenario_id, id, vehicle_name, registration_number, vehicle_type, capacity,
  is_cancelled, cancel_reason, is_government_bus, destination_institution_id,
  destination_name, departure_time, final_arrival_time, stops, path_connection_ids
)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'trip-01',
    'Bus 01 — KSRTC Rural Sarige (Govt Mini-Bus)',
    'KA-19-F-1044',
    'Mini-Bus',
    7,
    false,
    null,
    true,
    'inst-aloysius',
    'St. Aloysius High School & PU College',
    '07:15',
    '08:15',
    '[{"villageId": "vil-pavoor", "villageName": "Pavoor Riverine Fringe", "arrivalTime": "07:15", "departureTime": "07:20", "order": 1}, {"villageId": "vil-farangipete", "villageName": "Farangipete Junction", "arrivalTime": "07:45", "departureTime": "07:50", "order": 2}]'::jsonb,
    '["seg-pav-far", "seg-far-aloysius"]'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'trip-02',
    'Bus 02 — KSRTC JnNURM Suburban (Govt Bus)',
    'KA-19-F-3280',
    'City Bus',
    6,
    false,
    null,
    true,
    'inst-aloysius',
    'St. Aloysius High School & PU College',
    '07:10',
    '08:10',
    '[{"villageId": "vil-kalladka", "villageName": "Kalladka Foothills", "arrivalTime": "07:10", "departureTime": "07:15", "order": 1}, {"villageId": "vil-farangipete", "villageName": "Farangipete Junction", "arrivalTime": "07:40", "departureTime": "07:45", "order": 2}]'::jsonb,
    '["seg-kal-far", "seg-far-aloysius"]'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'trip-03',
    'Van 03 — Dakshina Kannada ZP Feeder (Govt/ZP Van)',
    'KA-19-VA-5012',
    'Maxi-Cab Van',
    5,
    false,
    null,
    false,
    'inst-kpt',
    'Karnataka (Govt) Polytechnic (KPT)',
    '07:20',
    '08:25',
    '[{"villageId": "vil-kalladka", "villageName": "Kalladka Foothills", "arrivalTime": "07:20", "departureTime": "07:25", "order": 1}, {"villageId": "vil-farangipete", "villageName": "Farangipete Junction", "arrivalTime": "07:50", "departureTime": "07:55", "order": 2}]'::jsonb,
    '["seg-kal-far", "seg-far-kpt"]'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'trip-04',
    'Cruiser 04 — Kudla Community Rural Cruiser',
    'KA-19-CR-8821',
    'Rural Cruiser',
    6,
    false,
    null,
    false,
    'inst-aloysius',
    'St. Aloysius High School & PU College',
    '07:05',
    '08:15',
    '[{"villageId": "vil-gurupura", "villageName": "Gurupura Riverbank", "arrivalTime": "07:05", "departureTime": "07:10", "order": 1}, {"villageId": "vil-ganjimutt", "villageName": "Ganjimutt Valley", "arrivalTime": "07:30", "departureTime": "07:30", "order": 2}, {"villageId": "vil-farangipete", "villageName": "Farangipete Junction", "arrivalTime": "07:50", "departureTime": "07:50", "order": 3}]'::jsonb,
    '["seg-guru-ganji", "seg-ganji-far", "seg-far-aloysius"]'::jsonb
  )
ON CONFLICT (scenario_id, id) DO NOTHING;

-- 6. Seed Baseline Student Requests (20 Requests)
INSERT INTO public.transport_requests (
  scenario_id, id, student_name, grade_or_stream, origin_village_id, origin_village_name,
  destination_institution_id, destination_name, required_arrival_time, priority_category,
  is_exam_student, exam_start_time, exam_subject, submission_order, is_crisis_added, notes
)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'req-pav-01', 'Deeksha Poojary', 'Grade 10', 'vil-pavoor', 'Pavoor Riverine Fringe', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:15', 'CRITICAL_EXAM', true, '08:30', 'Karnataka SSLC Science Board Practical', 1, false, 'Physics practical session'),
  ('a0000000-0000-0000-0000-000000000001', 'req-pav-02', 'Naveen Kumar', 'Grade 12 - Science (PUC)', 'vil-pavoor', 'Pavoor Riverine Fringe', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:15', 'CRITICAL_EXAM', true, '08:30', 'PUC II Chemistry State Practical Board Exam', 2, false, 'Chemistry laboratory practicals'),
  ('a0000000-0000-0000-0000-000000000001', 'req-pav-03', 'Ranjitha Shetty', 'Grade 10', 'vil-pavoor', 'Pavoor Riverine Fringe', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:30', 'REGULAR_ATTENDANCE', false, null, null, 3, false, 'Morning assembly & class'),
  ('a0000000-0000-0000-0000-000000000001', 'req-pav-04', 'Kishore Alva', 'Grade 9', 'vil-pavoor', 'Pavoor Riverine Fringe', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:30', 'REGULAR_ATTENDANCE', false, null, null, 4, false, 'Secondary classroom session'),
  ('a0000000-0000-0000-0000-000000000001', 'req-kal-01', 'Yogesh Bangera', '3rd Year Diploma (Civil)', 'vil-kalladka', 'Kalladka Foothills', 'inst-kpt', 'Karnataka (Govt) Polytechnic (KPT)', '08:30', 'CRITICAL_EXAM', true, '08:45', 'DTE Fluid Mechanics Lab Examination', 5, false, 'Mandatory practical board lab'),
  ('a0000000-0000-0000-0000-000000000001', 'req-kal-02', 'Rakshith Gowda', '1st Year ITI (Machinist)', 'vil-kalladka', 'Kalladka Foothills', 'inst-kpt', 'Karnataka (Govt) Polytechnic (KPT)', '08:45', 'REGULAR_ATTENDANCE', false, null, null, 6, false, 'Workshop machining lesson'),
  ('a0000000-0000-0000-0000-000000000001', 'req-kal-03', 'Ashwini Rai', 'Grade 12 - Commerce (PUC)', 'vil-kalladka', 'Kalladka Foothills', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:15', 'CRITICAL_EXAM', true, '08:30', 'PUC II Accountancy Mid-Term Test', 7, false, 'Internal assessment series'),
  ('a0000000-0000-0000-0000-000000000001', 'req-kal-04', 'Sandeep D’Souza', 'Grade 10', 'vil-kalladka', 'Kalladka Foothills', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:30', 'REGULAR_ATTENDANCE', false, null, null, 8, false, 'Language theory classes'),
  ('a0000000-0000-0000-0000-000000000001', 'req-far-01', 'Harish Poojary', '2nd Year Diploma (Auto)', 'vil-farangipete', 'Farangipete Junction', 'inst-kpt', 'Karnataka (Govt) Polytechnic (KPT)', '08:30', 'CRITICAL_EXAM', true, '08:45', 'Internal Combustion Engines Lab Exam', 9, false, 'Automobile shop grading test'),
  ('a0000000-0000-0000-0000-000000000001', 'req-far-02', 'Meghana Acharya', 'Grade 11 - Science (PUC)', 'vil-farangipete', 'Farangipete Junction', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:30', 'REGULAR_ATTENDANCE', false, null, null, 10, false, 'Mathematics calculus tutorial'),
  ('a0000000-0000-0000-0000-000000000001', 'req-far-03', 'Sumithra Rao', 'Grade 10', 'vil-farangipete', 'Farangipete Junction', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:30', 'REGULAR_ATTENDANCE', false, null, null, 11, false, 'General studies session'),
  ('a0000000-0000-0000-0000-000000000001', 'req-far-04', 'Tanmay Prabhu', 'Grade 12 - Science (PUC)', 'vil-farangipete', 'Farangipete Junction', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:15', 'CRITICAL_EXAM', true, '08:30', 'State Computer Science Practical Exam', 12, false, 'C++ laboratory board exam'),
  ('a0000000-0000-0000-0000-000000000001', 'req-far-05', 'Vinay Kumar', '1st Year Diploma (E&C)', 'vil-farangipete', 'Farangipete Junction', 'inst-kpt', 'Karnataka (Govt) Polytechnic (KPT)', '08:45', 'REGULAR_ATTENDANCE', false, null, null, 13, false, 'Basic electronics session'),
  ('a0000000-0000-0000-0000-000000000001', 'req-ganji-01', 'Divya Shenoy', 'Grade 12 - Science (PUC)', 'vil-ganjimutt', 'Ganjimutt Valley', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:15', 'CRITICAL_EXAM', true, '08:30', 'PUC II Chemistry State Practical Board Exam', 14, false, 'Chemistry Board Practical Internal Grading'),
  ('a0000000-0000-0000-0000-000000000001', 'req-ganji-02', 'Karthik Bhandary', 'Grade 10', 'vil-ganjimutt', 'Ganjimutt Valley', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:15', 'CRITICAL_EXAM', true, '08:30', 'SSLC Kannada First Language Board Exam', 15, false, 'Kannada Language Unit Test'),
  ('a0000000-0000-0000-0000-000000000001', 'req-ganji-03', 'Ananya Nayak', 'Grade 11 - Arts (PUC)', 'vil-ganjimutt', 'Ganjimutt Valley', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:30', 'REGULAR_ATTENDANCE', false, null, null, 16, false, 'History & Sociology lecture'),
  ('a0000000-0000-0000-0000-000000000001', 'req-ganji-04', 'Girish Kudroli', 'Grade 9', 'vil-ganjimutt', 'Ganjimutt Valley', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:30', 'REGULAR_ATTENDANCE', false, null, null, 17, false, 'Regular classroom attendance'),
  ('a0000000-0000-0000-0000-000000000001', 'req-guru-01', 'Prathiksha Prabhu', 'Grade 10', 'vil-gurupura', 'Gurupura Riverbank', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:15', 'CRITICAL_EXAM', true, '08:30', 'SSLC Biology State Practical Exam', 18, false, 'Biology Board Practical Exam'),
  ('a0000000-0000-0000-0000-000000000001', 'req-guru-02', 'Mohammed Shafi', 'Grade 10', 'vil-gurupura', 'Gurupura Riverbank', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:15', 'CRITICAL_EXAM', true, '08:30', 'English Pre-Final Examination', 19, false, 'English Pre-Final Exam'),
  ('a0000000-0000-0000-0000-000000000001', 'req-guru-03', 'Swathi Salian', 'Grade 9', 'vil-gurupura', 'Gurupura Riverbank', 'inst-aloysius', 'St. Aloysius High School & PU College', '08:30', 'REGULAR_ATTENDANCE', false, null, null, 20, false, 'Secondary science lesson')
ON CONFLICT (scenario_id, id) DO NOTHING;

