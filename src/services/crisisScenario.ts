/**
 * RouteLess Exam Day Crisis Scenario Manager
 * 
 * Implements the Official Surprise Hurdle:
 * 1. Disables exactly two government buses simultaneously.
 * 2. Surges student transport demand by 40% (deterministic requests with exam deadlines).
 * 3. Blocks a major village-connecting road corridor due to coastal river flooding.
 * 4. Manages the 3-state lifecycle (State A: Normal Baseline -> State B: Crisis Before Recovery -> State C: Recovery).
 */

import {
  StudentRequest,
  VehicleTrip,
  TransportConnection,
  AllocationResult,
  ExamCrisisState,
  CrisisComparisonMetrics,
  PreCrisisSnapshot
} from '../types';
import {
  SIMULATION_CLOCK,
  EXAM_ARRIVAL_BUFFER_MINUTES,
  DETERMINISTIC_CRISIS_SURGE_REQUESTS
} from '../models/seedData';

export const CRISIS_BLOCKED_CONNECTION_ID = 'seg-ganji-far';
export const CRISIS_DISABLED_BUS_IDS = ['trip-01', 'trip-02'];

/**
 * Activates the Exam Day Crisis atomically and deterministically.
 */
export function activateExamCrisisScenario(
  currentRequests: StudentRequest[],
  currentTrips: VehicleTrip[],
  currentConnections: TransportConnection[],
  currentBaselineResult: AllocationResult | null,
  existingSnapshot?: PreCrisisSnapshot
): {
  updatedRequests: StudentRequest[];
  updatedTrips: VehicleTrip[];
  updatedConnections: TransportConnection[];
  crisisState: ExamCrisisState;
  stateBResult: AllocationResult;
} {
  // 1. Save immutable pre-crisis snapshot if not already saved
  const snapshot: PreCrisisSnapshot = existingSnapshot || {
    requests: JSON.parse(JSON.stringify(currentRequests)),
    trips: JSON.parse(JSON.stringify(currentTrips)),
    connections: JSON.parse(JSON.stringify(currentConnections)),
    baselineResult: currentBaselineResult ? JSON.parse(JSON.stringify(currentBaselineResult)) : null,
    savedAt: new Date().toISOString()
  };

  // 2. Disable two government buses
  const updatedTrips = currentTrips.map(trip => {
    if (trip.id === 'trip-01') {
      return {
        ...trip,
        isCancelled: true,
        cancelReason: 'Depot mechanical air-brake valve failure during 06:30 pre-trip check'
      };
    }
    if (trip.id === 'trip-02') {
      return {
        ...trip,
        isCancelled: true,
        cancelReason: 'Alternator burnout and electrical short-circuit; out of commission'
      };
    }
    return trip;
  });

  // 3. Calculate 40% surge: additionalRequests = ceil(originalRequestCount * 0.40)
  const baseRequests = snapshot.requests;
  const originalRequestCount = baseRequests.length;
  const additionalRequestCount = Math.ceil(originalRequestCount * 0.40);
  const actualPercentageIncrease = originalRequestCount > 0
    ? Math.round((additionalRequestCount / originalRequestCount) * 1000) / 10
    : 40.0;

  // Merge crisis requests deterministically without duplicates
  const baseIdSet = new Set(baseRequests.map(r => r.id));
  const newCrisisRequestsToAdd = DETERMINISTIC_CRISIS_SURGE_REQUESTS
    .slice(0, additionalRequestCount)
    .filter(r => !baseIdSet.has(r.id));

  const updatedRequests = [...baseRequests, ...newCrisisRequestsToAdd];

  // 4. Block major connecting road between Ganjimutt and Farangipete
  const updatedConnections = currentConnections.map(conn => {
    if (conn.id === CRISIS_BLOCKED_CONNECTION_ID) {
      return {
        ...conn,
        isBlocked: true,
        blockedReason: 'Phalguni-Netravati river overflow; 3ft flash flood runoff across valley corridor'
      };
    }
    return conn;
  });

  const crisisState: ExamCrisisState = {
    isActive: true,
    activatedAt: new Date().toISOString(),
    simulationClock: SIMULATION_CLOCK,
    originalRequestCount,
    additionalRequestCount,
    totalRequestCount: updatedRequests.length,
    actualPercentageIncrease,
    disabledBusIds: CRISIS_DISABLED_BUS_IDS,
    disabledBusNames: [
      'Bus 01 — KSRTC Rural Sarige (Govt)',
      'Bus 02 — KSRTC JnNURM Suburban (Govt)'
    ],
    blockedConnectionId: CRISIS_BLOCKED_CONNECTION_ID,
    blockedConnectionName: 'Ganjimutt Valley ↔ Farangipete Junction',
    examWindowHours: 2.0,
    examBufferMinutes: EXAM_ARRIVAL_BUFFER_MINUTES,
    isStale: true,
    preCrisisSnapshot: snapshot
  };

  // 5. Construct State B: Crisis Before Recovery
  // Surviving original assignments revalidated against surviving fleet & unblocked paths.
  // Invalid assignments removed; new requests remain unassigned; DO NOT run recovery here.
  const stateBResult = buildStateBCrisisBeforeRecovery(
    snapshot.baselineResult,
    updatedRequests,
    updatedTrips,
    updatedConnections
  );

  return {
    updatedRequests,
    updatedTrips,
    updatedConnections,
    crisisState,
    stateBResult
  };
}

/**
 * Builds State B (Crisis Before Recovery):
 * - Keeps ONLY original baseline assignments whose vehicle is still active AND route is unblocked.
 * - Removes invalid assignments (those on disabled buses or blocked roads).
 * - Leaves newly added requests unassigned.
 */
export function buildStateBCrisisBeforeRecovery(
  baselineResult: AllocationResult | null,
  crisisRequests: StudentRequest[],
  crisisTrips: VehicleTrip[],
  crisisConnections: TransportConnection[]
): AllocationResult {
  const activeTripMap = new Map(crisisTrips.filter(t => !t.isCancelled).map(t => [t.id, t]));
  const blockedConnSet = new Set(crisisConnections.filter(c => c.isBlocked).map(c => c.id));

  const validAssignments: AllocationResult['assignments'] = [];
  const unmetRequests: AllocationResult['unmetRequests'] = [];

  const baselineAssignments = baselineResult?.assignments || [];
  const assignedRequestIds = new Set<string>();

  baselineAssignments.forEach(assign => {
    const trip = activeTripMap.get(assign.tripId);
    if (!trip) {
      // Vehicle disabled in crisis
      const req = crisisRequests.find(r => r.id === assign.requestId);
      if (req) {
        unmetRequests.push({
          requestId: req.id,
          studentName: req.studentName,
          gradeOrStream: req.gradeOrStream,
          originVillageId: req.originVillageId,
          originVillageName: req.originVillageName,
          destinationInstitutionId: req.destinationInstitutionId,
          destinationInstitutionName: req.destinationName,
          requiredArrivalTime: req.requiredArrivalTime,
          priorityCategory: req.priorityCategory,
          primaryReasonCode: 'TRIP_CANCELLED',
          honestExplanation: `Assigned vehicle (${assign.vehicleName}) became unavailable due to emergency technical breakdown. Recovery plan pending.`,
          isExamStudent: req.isExamStudent,
          examStartTime: req.examStartTime,
          evaluatedTrips: []
        });
      }
    } else {
      // Check if trip passes blocked connection
      const usesBlocked = trip.pathConnectionIds.some(cid => blockedConnSet.has(cid));
      if (usesBlocked) {
        const req = crisisRequests.find(r => r.id === assign.requestId);
        if (req) {
          unmetRequests.push({
            requestId: req.id,
            studentName: req.studentName,
            gradeOrStream: req.gradeOrStream,
            originVillageId: req.originVillageId,
            originVillageName: req.originVillageName,
            destinationInstitutionId: req.destinationInstitutionId,
            destinationInstitutionName: req.destinationName,
            requiredArrivalTime: req.requiredArrivalTime,
            priorityCategory: req.priorityCategory,
            primaryReasonCode: 'ROUTE_BLOCKED',
            honestExplanation: `Scheduled corridor between Ganjimutt and Farangipete is flooded and impassable. Route recovery required.`,
            isExamStudent: req.isExamStudent,
            examStartTime: req.examStartTime,
            evaluatedTrips: []
          });
        }
      } else {
        // Assignment survives!
        validAssignments.push(assign);
        assignedRequestIds.add(assign.requestId);
      }
    }
  });

  // Any crisis request not in validAssignments is unmet in State B
  crisisRequests.forEach(req => {
    if (!assignedRequestIds.has(req.id) && !unmetRequests.some(u => u.requestId === req.id)) {
      unmetRequests.push({
        requestId: req.id,
        studentName: req.studentName,
        gradeOrStream: req.gradeOrStream,
        originVillageId: req.originVillageId,
        originVillageName: req.originVillageName,
        destinationInstitutionId: req.destinationInstitutionId,
        destinationInstitutionName: req.destinationName,
        requiredArrivalTime: req.requiredArrivalTime,
        priorityCategory: req.priorityCategory,
        primaryReasonCode: req.isCrisisAdded ? 'CAPACITY_EXCEEDED' : 'TRIP_CANCELLED',
        honestExplanation: req.isCrisisAdded
          ? 'Emergency crisis surge request; waiting for recovery allocation dispatch.'
          : 'Original transport assignment invalidated by morning fleet/route crisis.',
        isExamStudent: req.isExamStudent,
        examStartTime: req.examStartTime,
        evaluatedTrips: []
      });
    }
  });

  const totalCapacity = crisisTrips.filter(t => !t.isCancelled).reduce((sum, t) => sum + t.capacity, 0);
  const examRequestsCount = crisisRequests.filter(r => r.isExamStudent).length;
  const examAssignedOnTimeCount = validAssignments.filter(a => a.isExamStudent && a.isOnTime).length;

  return {
    mode: 'CRISIS_BEFORE_RECOVERY',
    generatedAt: new Date().toISOString(),
    totalRequests: crisisRequests.length,
    assignedCount: validAssignments.length,
    unmetCount: unmetRequests.length,
    examRequestsCount,
    examAssignedOnTimeCount,
    totalCapacity,
    allocatedCapacity: validAssignments.length,
    capacityUtilizationPct: totalCapacity > 0 ? Math.round((validAssignments.length / totalCapacity) * 100) : 0,
    assignments: validAssignments,
    unmetRequests,
    tripUtilization: crisisTrips.map(t => ({
      tripId: t.id,
      vehicleName: t.vehicleName,
      capacity: t.capacity,
      allocatedSeats: validAssignments.filter(a => a.tripId === t.id).length,
      isCancelled: t.isCancelled,
      isBlocked: t.pathConnectionIds.some(cid => blockedConnSet.has(cid)),
      blockedConnectionIds: t.pathConnectionIds.filter(cid => blockedConnSet.has(cid)),
      utilizationPct: t.capacity > 0 ? Math.round((validAssignments.filter(a => a.tripId === t.id).length / t.capacity) * 100) : 0,
      status: t.isCancelled ? 'CANCELLED' : 'ACTIVE'
    })),
    solverLogs: [
      {
        id: 'state-b-init',
        timestamp: SIMULATION_CLOCK,
        level: 'ALERT',
        message: 'State B established: 2 government buses disabled, major road flooded, 40% surge added. Surviving assignments revalidated without recovery.'
      }
    ],
    lateAlternativesCount: 0
  };
}

/**
 * Computes comparative metrics between State B (Crisis Before Recovery)
 * and State C (Crisis After Recovery).
 */
export function computeCrisisComparisonMetrics(
  stateB: AllocationResult,
  stateC: AllocationResult,
  trips?: VehicleTrip[]
): CrisisComparisonMetrics {
  const activeVehiclesCount = trips
    ? trips.filter(t => !t.isCancelled).length
    : stateC.tripUtilization.filter(t => !t.isCancelled).length;
  const disabledVehiclesCount = trips
    ? trips.filter(t => t.isCancelled).length
    : stateC.tripUtilization.filter(t => t.isCancelled).length;

  const recoveryOnTimeImprovement = Math.max(0, stateC.assignedCount - stateB.assignedCount);
  const recoveryExamImprovement = Math.max(0, stateC.examAssignedOnTimeCount - stateB.examAssignedOnTimeCount);

  return {
    totalCrisisRequests: stateC.totalRequests,
    totalExamRequests: stateC.examRequestsCount,
    examStudentsOnTimeStateB: stateB.examAssignedOnTimeCount,
    totalStudentsOnTimeStateB: stateB.assignedCount,
    unassignedStudentsStateB: stateB.unmetCount,
    activeCapacityStateB: stateB.totalCapacity,
    assignedSeatsStateB: stateB.allocatedCapacity,
    examStudentsOnTimeStateC: stateC.examAssignedOnTimeCount,
    totalStudentsOnTimeStateC: stateC.assignedCount,
    unassignedStudentsStateC: stateC.unmetCount,
    activeCapacityStateC: stateC.totalCapacity,
    assignedSeatsStateC: stateC.allocatedCapacity,
    recoveryOnTimeImprovement,
    recoveryExamImprovement,
    lateAlternativesCount: stateC.lateAlternativesCount,
    activeVehiclesCount,
    disabledVehiclesCount
  };
}
