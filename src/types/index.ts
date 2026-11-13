/**
 * RouteLess Domain Models & Type Definitions
 * 
 * Rural Student Transport Resilience & Recovery Allocation
 * Comprehensive domain model with GIS, Fleet Telematics, RBAC, Notifications, and Audit Trails.
 */

export interface Village {
  id: string;
  name: string;
  panchayat: string;
  coordinates: { x: number; y: number }; // For schematic network visualizer
  geoCoordinates?: { lat: number; lng: number }; // Real GIS coordinates for Leaflet OSM map
  description: string;
  connectivityType: 'All-Weather' | 'Fair-Weather' | 'Vulnerable River Crossing';
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  type: 'Higher Secondary School' | 'Polytechnic & Vocational ITI';
  coordinates: { x: number; y: number };
  geoCoordinates?: { lat: number; lng: number }; // Real GIS coordinates
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
  waypoints?: [number, number][]; // Array of [lat, lng] for accurate road geometry
}

export interface TripStop {
  villageId: string;
  villageName: string;
  arrivalTime: string; // "07:15"
  departureTime: string; // "07:20"
  order: number;
  geoCoordinates?: { lat: number; lng: number };
}

export type VehicleStatus =
  | 'Available'
  | 'Assigned'
  | 'On Route'
  | 'Delayed'
  | 'Breakdown'
  | 'Out of Service';

export interface VehicleTrip {
  id: string;
  vehicleName: string;
  registrationNumber: string;
  vehicleType: 'Mini-Bus' | 'Maxi-Cab Van' | 'Rural Cruiser';
  driverName: string;
  driverPhone?: string;
  capacity: number; // Editable by coordinator
  isCancelled: boolean;
  cancelReason?: string;
  destinationInstitutionId: string;
  destinationName: string;
  departureTime: string;
  finalArrivalTime: string; // Arrival at destination
  stops: TripStop[];
  pathConnectionIds: string[]; // Connections traversed in sequence
  // Extended telemetry & tracking fields
  status?: VehicleStatus;
  occupiedSeats?: number;
  availableSeats?: number;
  currentLocation?: {
    lat: number;
    lng: number;
    description: string;
  };
  simulatedProgress?: number; // 0.0 to 1.0 along route
  estimatedArrivalMinutes?: number;
  speedKmh?: number;
}

export type PriorityCategory = 'CRITICAL_EXAM' | 'LAB_PRACTICAL' | 'REGULAR_ATTENDANCE';

export type StudentRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Assigned'
  | 'On Route'
  | 'Delayed'
  | 'Cancelled'
  | 'Unassigned';

export type TravelType =
  | 'Regular school travel'
  | 'Examination travel'
  | 'Practical examination travel';

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
  isCustom?: boolean;
  // Extended fields
  studentId?: string;
  travelDate?: string;
  travelType?: TravelType;
  status?: StudentRequestStatus;
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
  driverName?: string;
  driverPhone?: string;
  registrationNumber?: string;
  pickupPointName?: string;
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
  suggestedAlternativePickup?: string;
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

// --- USER & AUTHENTICATION TYPES ---
export type UserRole = 'STUDENT' | 'COORDINATOR' | 'ADMINISTRATOR';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
  villageId?: string;
  villageName?: string;
  destinationInstitutionId?: string;
  destinationName?: string;
  grade?: string;
  phone?: string;
}

// --- NOTIFICATION TYPES ---
export type NotificationType =
  | 'ROAD_CLOSURE'
  | 'VEHICLE_BREAKDOWN'
  | 'ROUTE_CHANGE'
  | 'PICKUP_POINT_CHANGE'
  | 'TRANSPORT_DELAY'
  | 'VEHICLE_REASSIGNMENT'
  | 'TRANSPORT_CANCELLATION'
  | 'ALLOCATION_CONFIRMED';

export interface SystemNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRole?: UserRole | 'ALL';
  targetStudentName?: string;
  targetStudentId?: string;
  targetTripId?: string;
  severity: 'info' | 'warning' | 'alert' | 'success';
  suggestedAction?: string;
}

// --- AUDIT LOG TYPES ---
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  details: string;
  ipAddress?: string;
}

// --- ALTERNATIVE ROUTE TYPES ---
export interface AlternativeRouteOption {
  tripId: string;
  originalPathConnectionIds: string[];
  alternativePathConnectionIds: string[];
  originalDistanceKm: number;
  alternativeDistanceKm: number;
  originalMinutes: number;
  alternativeMinutes: number;
  viaDescription: string;
  isFeasible: boolean;
  reason?: string;
}

// --- FAIRNESS & EQUITY TYPES ---
export interface VillageFairnessMetric {
  villageId: string;
  villageName: string;
  panchayat: string;
  totalDemand: number;
  assignedCount: number;
  unmetCount: number;
  fulfillmentPct: number;
  connectivityType: string;
  vulnerabilityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  vulnerabilityReasons: string[];
  recommendation: string;
}

// --- WHAT-IF SIMULATION TYPES ---
export interface WhatIfScenarioConfig {
  id: string;
  name: string;
  description: string;
  category: 'BREAKDOWN' | 'CLOSURE' | 'DEMAND_SURGE' | 'CAPACITY_CUT' | 'MULTI_DISRUPTION';
  breakdownTripIds: string[];
  blockedConnectionIds: string[];
  demandSurgeCount?: number;
  capacityReductionPct?: number;
}

export interface SimulationResult {
  scenarioName: string;
  baseline: AllocationResult;
  simulated: AllocationResult;
  strandedStudents: UnmetRequest[];
  recoveredStudents: Assignment[];
  recoveryRatePct: number;
  capacityLossPct: number;
}
