/**
 * RouteLess Typed Supabase Data Access Layer
 * 
 * Provides robust, typed CRUD operations, Auth session management, and RPC wrappers.
 * Enforces Row Level Security (RLS) boundaries in the database:
 * - Students can only create and view their own requests.
 * - Coordinators have database-verified scenario permissions.
 * - Concurrency protection prevents stale allocation saves.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  StudentRequest,
  VehicleTrip,
  TransportConnection,
  Village,
  Institution,
  AllocationResult,
  Assignment,
  UserProfile,
  UserRole,
  ScenarioMeta
} from '../types';

export const DEFAULT_SCENARIO_ID = 'a0000000-0000-0000-0000-000000000001';

export const SupabaseService = {
  isConfigured(): boolean {
    return isSupabaseConfigured && supabase !== null;
  },

  // ---------------------------------------------------------------------------
  // AUTHENTICATION & SESSIONS
  // ---------------------------------------------------------------------------

  async getCurrentSession() {
    if (!supabase) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('[SupabaseService] getSession error:', error.message);
      return null;
    }
    return session;
  },

  async getCurrentUserProfile(scenarioId: string = DEFAULT_SCENARIO_ID): Promise<UserProfile | null> {
    if (!supabase) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Fetch role from scenario_memberships
    let role: UserRole = 'student';
    try {
      const { data: membership } = await supabase
        .from('scenario_memberships')
        .select('role')
        .eq('scenario_id', scenarioId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (membership?.role) {
        role = membership.role as UserRole;
      }
    } catch {
      // Fallback to student if membership check fails
      role = 'student';
    }

    return {
      id: user.id,
      email: user.email || '',
      fullName: user.user_metadata?.full_name || user.email?.split('@')[0],
      role
    };
  },

  async signIn(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
    if (!supabase) {
      return { user: null, error: 'Supabase credentials are not configured in .env' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Sign in succeeded but user object was not returned.' };
    }

    const profile = await this.getCurrentUserProfile();
    return { user: profile, error: null };
  },

  async signUp(
    email: string,
    password: string,
    fullName: string,
    desiredRole: UserRole = 'student',
    scenarioId: string = DEFAULT_SCENARIO_ID
  ): Promise<{ user: UserProfile | null; error: string | null; emailConfirmationRequired: boolean }> {
    if (!supabase) {
      return { user: null, error: 'Supabase credentials are not configured in .env', emailConfirmationRequired: false };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });

    if (error) {
      return { user: null, error: error.message, emailConfirmationRequired: false };
    }

    if (!data.user) {
      return { user: null, error: 'Registration failed; user could not be created.', emailConfirmationRequired: false };
    }

    const emailConfirmationRequired = Boolean(!data.session);

    // If an active session exists (email confirmation disabled or auto-confirmed in local setup),
    // register initial scenario membership
    if (data.session) {
      try {
        await supabase
          .from('scenario_memberships')
          .insert({
            scenario_id: scenarioId,
            user_id: data.user.id,
            role: desiredRole
          });
      } catch (membershipErr) {
        console.warn('[SupabaseService] Membership registration notice:', membershipErr);
      }
    }

    const userProfile: UserProfile = {
      id: data.user.id,
      email: data.user.email || '',
      fullName,
      role: desiredRole
    };

    return { user: userProfile, error: null, emailConfirmationRequired };
  },

  async signOut(): Promise<{ error: string | null }> {
    if (!supabase) return { error: null };
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  },

  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    if (!supabase) return () => {};

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await this.getCurrentUserProfile();
        callback(profile);
      } else {
        callback(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  // ---------------------------------------------------------------------------
  // SCENARIO METADATA & DATA LOADING
  // ---------------------------------------------------------------------------

  async loadScenario(scenarioId: string = DEFAULT_SCENARIO_ID): Promise<ScenarioMeta | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      isActiveCrisis: data.is_active_crisis,
      simulationClock: data.simulation_clock,
      version: data.version
    };
  },

  async loadVillages(scenarioId: string = DEFAULT_SCENARIO_ID): Promise<Village[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('villages')
      .select('*')
      .eq('scenario_id', scenarioId);

    if (error || !data) return [];

    return data.map(v => ({
      id: v.id,
      name: v.name,
      panchayat: v.panchayat || '',
      coordinates: { x: v.coord_x, y: v.coord_y },
      description: '',
      connectivityType: v.connectivity_type as Village['connectivityType']
    }));
  },

  async loadInstitutions(scenarioId: string = DEFAULT_SCENARIO_ID): Promise<Institution[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .eq('scenario_id', scenarioId);

    if (error || !data) return [];

    return data.map(i => ({
      id: i.id,
      name: i.name,
      code: i.code || '',
      type: 'Higher Secondary School',
      coordinates: { x: 300, y: 40 },
      schoolStartTime: i.school_start_time,
      address: i.address || ''
    }));
  },

  async loadRouteConnections(scenarioId: string = DEFAULT_SCENARIO_ID): Promise<TransportConnection[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('route_connections')
      .select('*')
      .eq('scenario_id', scenarioId);

    if (error || !data) return [];

    return data.map(c => ({
      id: c.id,
      fromId: c.from_id,
      toId: c.to_id,
      fromName: c.from_name,
      toName: c.to_name,
      distanceKm: Number(c.distance_km),
      travelMinutes: Number(c.travel_minutes),
      roadType: c.road_type as TransportConnection['roadType'],
      isBlocked: Boolean(c.is_blocked),
      blockedReason: c.blocked_reason || undefined
    }));
  },

  async loadVehicleTrips(scenarioId: string = DEFAULT_SCENARIO_ID): Promise<VehicleTrip[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('vehicle_trips')
      .select('*')
      .eq('scenario_id', scenarioId);

    if (error || !data) return [];

    return data.map(t => ({
      id: t.id,
      vehicleName: t.vehicle_name,
      registrationNumber: t.registration_number || '',
      vehicleType: t.vehicle_type as VehicleTrip['vehicleType'],
      driverName: '',
      capacity: Number(t.capacity),
      isCancelled: Boolean(t.is_cancelled),
      cancelReason: t.cancel_reason || undefined,
      isGovernmentBus: Boolean(t.is_government_bus),
      destinationInstitutionId: t.destination_institution_id,
      destinationName: t.destination_name,
      departureTime: t.departure_time,
      finalArrivalTime: t.final_arrival_time,
      stops: (t.stops as VehicleTrip['stops']) || [],
      pathConnectionIds: (t.path_connection_ids as string[]) || []
    }));
  },

  async loadTransportRequests(scenarioId: string = DEFAULT_SCENARIO_ID): Promise<StudentRequest[]> {
    if (!supabase) return [];
    // RLS in Postgres automatically filters:
    // - Students see only their own requests
    // - Coordinators see all requests in the scenario
    const { data, error } = await supabase
      .from('transport_requests')
      .select('*')
      .eq('scenario_id', scenarioId)
      .order('submission_order', { ascending: true });

    if (error || !data) {
      console.warn('[SupabaseService] loadTransportRequests:', error?.message);
      return [];
    }

    return data.map(r => ({
      id: r.id,
      studentName: r.student_name,
      gradeOrStream: r.grade_or_stream || '',
      originVillageId: r.origin_village_id,
      originVillageName: r.origin_village_name,
      destinationInstitutionId: r.destination_institution_id,
      destinationName: r.destination_name,
      destinationInstitutionName: r.destination_name,
      requiredArrivalTime: r.required_arrival_time,
      priorityCategory: r.priority_category as StudentRequest['priorityCategory'],
      isExamStudent: Boolean(r.is_exam_student),
      examStartTime: r.exam_start_time || undefined,
      examSubject: r.exam_subject || undefined,
      submissionOrder: Number(r.submission_order),
      submissionTimestamp: r.submission_timestamp,
      isCrisisAdded: Boolean(r.is_crisis_added),
      notes: r.notes || undefined
    }));
  },

  // ---------------------------------------------------------------------------
  // MUTATIONS (Protected by RLS)
  // ---------------------------------------------------------------------------

  async submitTransportRequest(
    request: StudentRequest,
    scenarioId: string = DEFAULT_SCENARIO_ID
  ): Promise<{ success: boolean; error: string | null }> {
    if (!supabase) {
      return { success: false, error: 'Supabase client is not configured.' };
    }

    const { data: { user } } = await supabase.auth.getUser();

    const row = {
      scenario_id: scenarioId,
      id: request.id,
      user_id: user?.id || null,
      student_name: request.studentName,
      grade_or_stream: request.gradeOrStream || null,
      origin_village_id: request.originVillageId,
      origin_village_name: request.originVillageName,
      destination_institution_id: request.destinationInstitutionId,
      destination_name: request.destinationName,
      required_arrival_time: request.requiredArrivalTime,
      priority_category: request.priorityCategory,
      is_exam_student: Boolean(request.isExamStudent),
      exam_start_time: request.examStartTime || null,
      exam_subject: request.examSubject || null,
      submission_order: request.submissionOrder,
      submission_timestamp: request.submissionTimestamp || new Date().toISOString(),
      is_crisis_added: Boolean(request.isCrisisAdded),
      notes: request.notes || null
    };

    const { error } = await supabase
      .from('transport_requests')
      .insert(row);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  },

  async updateTripCapacity(
    tripId: string,
    newCapacity: number,
    scenarioId: string = DEFAULT_SCENARIO_ID
  ): Promise<{ success: boolean; error: string | null }> {
    if (!supabase) return { success: false, error: 'Database not connected' };

    const { error } = await supabase
      .from('vehicle_trips')
      .update({ capacity: Math.max(0, newCapacity) })
      .eq('scenario_id', scenarioId)
      .eq('id', tripId);

    if (error) return { success: false, error: error.message };

    // Increment scenario version to mark cached allocations stale
    try {
      await supabase.rpc('increment_scenario_version', { p_scenario_id: scenarioId });
    } catch {
      // Ignore if optional RPC not defined
    }
    return { success: true, error: null };
  },

  async toggleTripCancellation(
    tripId: string,
    isCancelled: boolean,
    cancelReason?: string,
    scenarioId: string = DEFAULT_SCENARIO_ID
  ): Promise<{ success: boolean; error: string | null }> {
    if (!supabase) return { success: false, error: 'Database not connected' };

    const { error } = await supabase
      .from('vehicle_trips')
      .update({
        is_cancelled: isCancelled,
        cancel_reason: isCancelled ? (cancelReason || 'Vehicle breakdown') : null
      })
      .eq('scenario_id', scenarioId)
      .eq('id', tripId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },

  async toggleRouteConnectionBlocked(
    connectionId: string,
    isBlocked: boolean,
    blockedReason?: string,
    scenarioId: string = DEFAULT_SCENARIO_ID
  ): Promise<{ success: boolean; error: string | null }> {
    if (!supabase) return { success: false, error: 'Database not connected' };

    const { error } = await supabase
      .from('route_connections')
      .update({
        is_blocked: isBlocked,
        blocked_reason: isBlocked ? (blockedReason || 'Road blocked') : null
      })
      .eq('scenario_id', scenarioId)
      .eq('id', connectionId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },

  // ---------------------------------------------------------------------------
  // ATOMIC CRISIS SCENARIO PROCEDURES
  // ---------------------------------------------------------------------------

  async activateExamCrisis(scenarioId: string = DEFAULT_SCENARIO_ID): Promise<{ success: boolean; error: string | null }> {
    if (!supabase) return { success: false, error: 'Database not connected' };

    const { data, error } = await supabase.rpc('activate_exam_crisis_rpc', {
      p_scenario_id: scenarioId
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: Boolean(data?.success), error: null };
  },

  async resetScenario(scenarioId: string = DEFAULT_SCENARIO_ID): Promise<{ success: boolean; error: string | null }> {
    if (!supabase) return { success: false, error: 'Database not connected' };

    const { data, error } = await supabase.rpc('reset_scenario_rpc', {
      p_scenario_id: scenarioId
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: Boolean(data?.success), error: null };
  },

  // ---------------------------------------------------------------------------
  // ALLOCATION SAVING & CONCURRENCY
  // ---------------------------------------------------------------------------

  async saveAllocationRun(
    scenarioId: string = DEFAULT_SCENARIO_ID,
    expectedVersion: number,
    result: AllocationResult
  ): Promise<{ success: boolean; runId: string | null; error: string | null }> {
    if (!supabase) return { success: false, runId: null, error: 'Database not connected' };

    const { data, error } = await supabase.rpc('save_allocation_run_rpc', {
      p_scenario_id: scenarioId,
      p_mode: result.mode,
      p_expected_version: expectedVersion,
      p_total_requests: result.totalRequests,
      p_assigned_count: result.assignedCount,
      p_unmet_count: result.unmetCount,
      p_total_capacity: result.totalCapacity,
      p_allocated_capacity: result.allocatedCapacity,
      p_capacity_utilization_pct: result.capacityUtilizationPct,
      p_exam_requests_count: result.examRequestsCount,
      p_exam_assigned_on_time_count: result.examAssignedOnTimeCount,
      p_trip_utilization: result.tripUtilization,
      p_solver_logs: result.solverLogs,
      p_assignments: result.assignments
    });

    if (error) {
      return { success: false, runId: null, error: error.message };
    }

    return {
      success: Boolean(data?.success),
      runId: data?.allocation_run_id || null,
      error: null
    };
  },

  async loadLatestAllocationRun(
    scenarioId: string = DEFAULT_SCENARIO_ID,
    mode?: 'BASELINE' | 'RECOVERY' | 'CRISIS_BEFORE_RECOVERY'
  ): Promise<AllocationResult | null> {
    if (!supabase) return null;

    let query = supabase
      .from('allocation_runs')
      .select('*')
      .eq('scenario_id', scenarioId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (mode) {
      query = query.eq('mode', mode);
    }

    const { data: runs, error } = await query;
    if (error || !runs || runs.length === 0) return null;

    const run = runs[0];

    // Load assignments for this run
    const { data: assignmentsData } = await supabase
      .from('assignments')
      .select('*')
      .eq('allocation_run_id', run.id);

    const assignments: Assignment[] = (assignmentsData || []).map(a => ({
      requestId: a.request_id,
      studentName: a.student_name,
      gradeOrStream: 'Grade 10',
      tripId: a.trip_id,
      vehicleName: a.vehicle_name,
      pickupVillageId: a.pickup_village_id,
      pickupVillageName: a.pickup_village_id,
      dropoffInstitutionId: a.dropoff_institution_id,
      dropoffInstitutionName: a.dropoff_institution_id,
      pickupTime: a.pickup_time,
      dropoffTime: a.estimated_arrival_time,
      estimatedArrivalTime: a.estimated_arrival_time,
      seatNumber: a.seat_number,
      priorityCategory: 'REGULAR_ATTENDANCE',
      isOnTime: a.is_on_time,
      isExamStudent: a.is_exam_student
    }));

    return {
      mode: run.mode as AllocationResult['mode'],
      generatedAt: run.created_at || new Date().toISOString(),
      totalRequests: run.total_requests,
      assignedCount: run.assigned_count,
      unmetCount: run.unmet_count,
      totalCapacity: run.total_capacity,
      allocatedCapacity: run.allocated_capacity,
      capacityUtilizationPct: run.capacity_utilization_pct,
      assignments,
      unmetRequests: [], // Recomputed by solver when rendering details
      tripUtilization: run.trip_utilization || [],
      solverLogs: run.solver_logs || [],
      examRequestsCount: run.exam_requests_count,
      examAssignedOnTimeCount: run.exam_assigned_on_time_count,
      lateAlternativesCount: 0
    };
  }
};
