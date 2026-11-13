/**
 * RouteLess Domain Models & Type Definitions
 * 
 * Rural Student Transport Resilience & Recovery Allocation
 * Pure domain model representations for deterministic simulation.
 */

export interface Village {
  id: string;
  name: string;
  panchayat: string;
  coordinates: { x: number; y: number }; // For schematic network visualizer
  description: string;
  connectivityType: 'All-Weather' | 'Fair-Weather' | 'Vulnerable River Crossing';
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  type: 'Higher Secondary School' | 'Polytechnic & Vocational ITI';
  coordinates: { x: number; y: number };
  schoolStartTime: string; // e.g. "08:30"
  address: string;
}

export interface TransportConnection {
  id: string;
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  distanceKm: number;
  travelMinutes: number;
  roadType: 'Paved Highway' | 'All-Weather Tar' | 'Gravel Corridor' | 'Low-Lying Causeway' | 'Detour Bypass';
  isBlocked: boolean;
  blockedReason?: string;
}

export interface TripStop {
  villageId: string;
  villageName: string;
  arrivalTime: string; // "07:15"
  departureTime: string; // "07:20"
  order: number;
}

export interface VehicleTrip {
  id: string;
  vehicleName: string;
  registrationNumber: string;
  vehicleType: 'Mini-Bus' | 'City Bus' | 'Maxi-Cab Van' | 'Rural Cruiser';
  driverName: string;
  capacity: number; // Editable by coordinator
  isCancelled: boolean;
  cancelReason?: string;
  destinationInstitutionId: string;
  destinationName: string;
  departureTime: string;
  finalArrivalTime: string; // Arrival at destination
  stops: TripStop[];
  pathConnectionIds: string[]; // Connections traversed in sequence
  isGovernmentBus?: boolean;
}

export type PriorityCategory = 'CRITICAL_EXAM' | 'LAB_PRACTICAL' | 'REGULAR_ATTENDANCE';

export interface StudentRequest {
  id: string;
  studentName: string;
  gradeOrStream: string;
  originVillageId: string;
  originVillageName: string;
  destinationInstitutionId: string;
  destinationName: string;
  destinationInstitutionName?: string;
  requiredArrivalTime: string; // e.g. "08:15"
  priorityCategory: PriorityCategory;
  submissionTimestamp: string;
  submissionOrder: number; // Stable order 1..N for deterministic tie-breaking
  isExamStudent: boolean; // Flagged if student is appearing for exam today
  examStartTime?: string; // e.g. "08:30"
  examSubject?: string; // e.g. "Karnataka SSLC Board Exam", "BTE Diploma Practical"
  notes?: string;
  isCustom?: boolean; // True if created by user via request form during demo
  isCrisisAdded?: boolean; // True if generated as part of 40% surge
}

export interface Assignment {
  requestId: string;
  studentName: string;
  gradeOrStream: string;
  tripId: string;
  vehicleName: string;
  pickupVillageId: string;
  pickupVillageName: string;
  dropoffInstitutionId: string;
  dropoffInstitutionName: string;
  pickupTime: string;
  dropoffTime: string;
  seatNumber: number;
  priorityCategory: PriorityCategory;
  isExamStudent: boolean;
  examStartTime?: string;
  isOnTime: boolean;
  routeDetails?: {
    connectionIds: string[];
    hasDetour: boolean;
    detourMinutesAdded: number;
    pathNodeNames: string[];
  };
}

export type UnmetReasonCode =
  | 'TRIP_CANCELLED'
  | 'ROUTE_BLOCKED'
  | 'CAPACITY_EXCEEDED'
  | 'NO_CONNECTING_ROUTE'
  | 'TIMING_INCOMPATIBLE';

export interface EvaluatedTripCandidate {
  tripId: string;
  vehicleName: string;
  isCancelled: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  destinationMatch: boolean;
  servesOrigin: boolean;
  reachesInTime: boolean;
  capacityAvailable: boolean;
  rejectionReason: string;
  alternativeRouteFound?: boolean;
  alternativeMinutesAdded?: number;
  estimatedArrival?: string;
}

export interface UnmetRequest {
  requestId: string;
  studentName: string;
  gradeOrStream: string;
  originVillageId: string;
  originVillageName: string;
  destinationInstitutionId: string;
  destinationInstitutionName: string;
  requiredArrivalTime: string;
  priorityCategory: PriorityCategory;
  primaryReasonCode: UnmetReasonCode;
  honestExplanation: string;
  isExamStudent: boolean;
  examStartTime?: string;
  evaluatedTrips: EvaluatedTripCandidate[];
  hasLateAlternative?: boolean;
  lateAlternativeDetails?: {
    tripName: string;
    estimatedArrival: string;
    deadline: string;
    minutesLate: number;
  };
}

export interface TripUtilization {
  tripId: string;
  vehicleName: string;
  capacity: number;
  allocatedSeats: number;
  isCancelled: boolean;
  isBlocked: boolean;
  blockedConnectionIds: string[];
  utilizationPct: number;
  status: 'ACTIVE' | 'FULL' | 'CANCELLED' | 'BLOCKED';
  activeRouteConnectionIds?: string[];
  hasDetour?: boolean;
  detourMinutesAdded?: number;
}

export interface SolverLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'DECISION' | 'WARNING' | 'ALERT';
  studentName?: string;
  tripName?: string;
  message: string;
}

export interface AllocationResult {
  mode: 'BASELINE' | 'RECOVERY' | 'CRISIS_BEFORE_RECOVERY';
  generatedAt: string;
  totalRequests: number;
  assignedCount: number;
  unmetCount: number;
  examRequestsCount: number;
  examAssignedOnTimeCount: number;
  totalCapacity: number;
  allocatedCapacity: number;
  capacityUtilizationPct: number;
  assignments: Assignment[];
  unmetRequests: UnmetRequest[];
  tripUtilization: TripUtilization[];
  solverLogs: SolverLogEntry[];
  lateAlternativesCount: number;
}

export interface PreCrisisSnapshot {
  requests: StudentRequest[];
  trips: VehicleTrip[];
  connections: TransportConnection[];
  baselineResult: AllocationResult | null;
  savedAt: string;
}

export interface ExamCrisisState {
  isActive: boolean;
  activatedAt?: string;
  simulationClock: string; // e.g. "06:45 AM"
  originalRequestCount: number;
  additionalRequestCount: number;
  totalRequestCount: number;
  actualPercentageIncrease: number; // 40.0%
  disabledBusIds: string[];
  disabledBusNames: string[];
  blockedConnectionId: string;
  blockedConnectionName: string;
  examWindowHours: number; // 2.0 hours
  examBufferMinutes: number; // 15 minutes
  isStale: boolean;
  preCrisisSnapshot?: PreCrisisSnapshot;
}

export interface CrisisComparisonMetrics {
  totalCrisisRequests: number;
  totalExamRequests: number;
  // State B (Crisis Before Recovery)
  examStudentsOnTimeStateB: number;
  totalStudentsOnTimeStateB: number;
  unassignedStudentsStateB: number;
  activeCapacityStateB: number;
  assignedSeatsStateB: number;
  // State C (Crisis After Recovery)
  examStudentsOnTimeStateC: number;
  totalStudentsOnTimeStateC: number;
  unassignedStudentsStateC: number;
  activeCapacityStateC: number;
  assignedSeatsStateC: number;
  // Deliberate Deltas (Improvement metrics)
  recoveryOnTimeImprovement: number;
  recoveryExamImprovement: number;
  lateAlternativesCount: number;
  activeVehiclesCount: number;
  disabledVehiclesCount: number;
}

export type UserRole = 'coordinator' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  role?: UserRole;
}

export interface AuthSessionState {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
}

export type AppDataSourceMode = 'LOCAL_DEMO' | 'SUPABASE_CLOUD';

export interface ScenarioMeta {
  id: string;
  name: string;
  description?: string;
  isActiveCrisis: boolean;
  simulationClock: string;
  version: number;
}
