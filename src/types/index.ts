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
  roadType: 'Paved Highway' | 'All-Weather Tar' | 'Gravel Corridor' | 'Low-Lying Causeway';
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
  vehicleType: 'Mini-Bus' | 'Maxi-Cab Van' | 'Rural Cruiser';
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
  requiredArrivalTime: string; // e.g. "08:30"
  priorityCategory: PriorityCategory;
  submissionTimestamp: string;
  notes?: string;
  isCustom?: boolean; // True if created by user via request form during demo
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
  evaluatedTrips: EvaluatedTripCandidate[];
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
  mode: 'BASELINE' | 'RECOVERY';
  generatedAt: string;
  totalRequests: number;
  assignedCount: number;
  unmetCount: number;
  totalCapacity: number;
  allocatedCapacity: number;
  capacityUtilizationPct: number;
  assignments: Assignment[];
  unmetRequests: UnmetRequest[];
  tripUtilization: TripUtilization[];
  solverLogs: SolverLogEntry[];
}

export interface ComparisonDiff {
  newlyAssigned: Assignment[];
  displacedAssignments: {
    studentName: string;
    previousTripName: string;
    newStatus: 'UNMET' | 'REROUTED';
    newTripName?: string;
    reason: string;
  }[];
  unmetStatusChange: {
    studentName: string;
    wasUnmetInBaseline: boolean;
    isUnmetInRecovery: boolean;
    explanation: string;
  }[];
  capacityDelta: {
    tripId: string;
    vehicleName: string;
    baselineAllocated: number;
    recoveryAllocated: number;
  }[];
}
