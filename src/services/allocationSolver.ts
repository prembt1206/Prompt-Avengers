/**
 * RouteLess Pure Allocation Solver
 * 
 * Pure TypeScript module with ZERO UI dependencies.
 * Deterministic capacity-aware matching and recovery re-allocation.
 * Enforces all physical constraints: capacity, cancellations, blocked links, arrival deadlines.
 * Integrates Dijkstra shortest-path route search to discover alternative detour paths.
 * Prioritizes exam students with imminent deadlines.
 * Distinguishes on-time assignments, unmet requests, and late alternatives.
 */

import {
  StudentRequest,
  VehicleTrip,
  TransportConnection,
  Assignment,
  UnmetRequest,
  EvaluatedTripCandidate,
  AllocationResult,
  TripUtilization,
  SolverLogEntry,
  PriorityCategory,
  UnmetReasonCode
} from '../types';
import { TransportNetworkGraph } from './routingEngine';

/**
 * Compares two HH:MM time strings.
 * Returns true if timeA <= timeB
 */
export function isTimeBeforeOrEqual(timeA: string, timeB: string): boolean {
  const [hA, mA] = timeA.split(':').map(Number);
  const [hB, mB] = timeB.split(':').map(Number);
  if (hA !== hB) return hA < hB;
  return mA <= mB;
}

/**
 * Adds minutes to an HH:MM time string.
 */
export function addMinutesToTimeString(timeStr: string, minutesToAdd: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutesToAdd;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

/**
 * Computes minutes difference: timeA - timeB (returns positive if timeA is later than timeB)
 */
export function minutesDiff(timeA: string, timeB: string): number {
  const [hA, mA] = timeA.split(':').map(Number);
  const [hB, mB] = timeB.split(':').map(Number);
  return (hA * 60 + mA) - (hB * 60 + mB);
}

/**
 * Trip leg mapping table for known route legs
 */
interface TripRouteLegDef {
  tripId: string;
  fromStopId: string;
  toStopOrDestId: string;
  normalMinutes: number;
}

const TRIP_LEG_DEFINITIONS: Record<string, TripRouteLegDef[]> = {
  'trip-01': [
    { tripId: 'trip-01', fromStopId: 'vil-pavoor', toStopOrDestId: 'vil-farangipete', normalMinutes: 25 },
    { tripId: 'trip-01', fromStopId: 'vil-farangipete', toStopOrDestId: 'inst-aloysius', normalMinutes: 25 }
  ],
  'trip-02': [
    { tripId: 'trip-02', fromStopId: 'vil-kalladka', toStopOrDestId: 'vil-farangipete', normalMinutes: 20 },
    { tripId: 'trip-02', fromStopId: 'vil-farangipete', toStopOrDestId: 'inst-aloysius', normalMinutes: 25 }
  ],
  'trip-03': [
    { tripId: 'trip-03', fromStopId: 'vil-kalladka', toStopOrDestId: 'vil-farangipete', normalMinutes: 20 },
    { tripId: 'trip-03', fromStopId: 'vil-farangipete', toStopOrDestId: 'inst-kpt', normalMinutes: 30 }
  ],
  'trip-04': [
    { tripId: 'trip-04', fromStopId: 'vil-gurupura', toStopOrDestId: 'vil-ganjimutt', normalMinutes: 20 },
    { tripId: 'trip-04', fromStopId: 'vil-ganjimutt', toStopOrDestId: 'vil-farangipete', normalMinutes: 20 },
    { tripId: 'trip-04', fromStopId: 'vil-farangipete', toStopOrDestId: 'inst-aloysius', normalMinutes: 25 }
  ]
};

/**
 * Pure deterministic allocation solver.
 */
export function runAllocationSolver(
  requests: StudentRequest[],
  trips: VehicleTrip[],
  connections: TransportConnection[],
  mode: 'BASELINE' | 'RECOVERY' | 'CRISIS_BEFORE_RECOVERY' = 'BASELINE'
): AllocationResult {
  const logs: SolverLogEntry[] = [];
  let logCounter = 1;

  const addLog = (
    level: SolverLogEntry['level'],
    message: string,
    studentName?: string,
    tripName?: string
  ) => {
    logs.push({
      id: `log-${logCounter++}`,
      timestamp: new Date().toISOString().substring(11, 19),
      level,
      message,
      studentName,
      tripName
    });
  };

  addLog(
    'INFO',
    `Initializing ${mode} allocation engine: ${requests.length} requests, ${trips.length} vehicle trips, ${connections.length} corridors.`
  );

  // Initialize network graph
  const networkGraph = new TransportNetworkGraph(connections);
  const blockedConnectionSet = new Set(connections.filter(c => c.isBlocked).map(c => c.id));

  if (blockedConnectionSet.size > 0) {
    const blockedDesc = connections
      .filter(c => c.isBlocked)
      .map(c => `${c.fromName} ↔ ${c.toName} (${c.blockedReason || 'Blocked'})`)
      .join('; ');
    addLog('ALERT', `Active network corridor blockages detected: ${blockedDesc}`);
  }

  // Pre-calculate effective trip routes and travel times with Dijkstra
  interface EvaluatedTripState {
    trip: VehicleTrip;
    capacity: number;
    allocatedSeats: number;
    assignedStudents: Assignment[];
    isAvailable: boolean;
    computedArrivalTimes: Map<string, string>; // stopId -> arrival at destination
    activeConnectionIds: string[];
    hasDetour: boolean;
    detourMinutesAdded: number;
    isSevered: boolean;
    severedReason?: string;
  }

  const tripStates = new Map<string, EvaluatedTripState>();

  trips.forEach(trip => {
    if (trip.isCancelled) {
      tripStates.set(trip.id, {
        trip,
        capacity: Math.max(0, trip.capacity),
        allocatedSeats: 0,
        assignedStudents: [],
        isAvailable: false,
        computedArrivalTimes: new Map(),
        activeConnectionIds: [],
        hasDetour: false,
        detourMinutesAdded: 0,
        isSevered: true,
        severedReason: `Vehicle cancelled: ${trip.cancelReason || 'Out of service'}`
      });
      addLog('WARNING', `Trip ${trip.vehicleName} is disabled: ${trip.cancelReason || 'Technical issue'}.`, undefined, trip.vehicleName);
      return;
    }

    // Check routing for each pickup stop to destination
    const legs = TRIP_LEG_DEFINITIONS[trip.id] || [];
    let isSevered = false;
    let severedReason: string | undefined = undefined;
    let totalDetourMinutes = 0;
    const computedArrivalTimes = new Map<string, string>();
    const allActiveConnIds = new Set<string>();

    for (const stop of trip.stops) {
      // Find normal baseline shortest path without blockages to detect detours
      const baselinePath = networkGraph.findShortestPath(
        stop.villageId,
        trip.destinationInstitutionId,
        new Set<string>()
      );

      // Find shortest path avoiding active blocked roads
      const pathResult = networkGraph.findShortestPath(
        stop.villageId,
        trip.destinationInstitutionId,
        blockedConnectionSet,
        baselinePath.isAccessible ? baselinePath.totalTravelMinutes : undefined
      );

      if (!pathResult.isAccessible) {
        isSevered = true;
        severedReason = pathResult.reason || 'No accessible route is available to destination.';
        break;
      }

      pathResult.connectionsUsed.forEach(c => allActiveConnIds.add(c.id));

      if (pathResult.hasDetour) {
        totalDetourMinutes = Math.max(totalDetourMinutes, pathResult.detourMinutesAdded);
      }

      // Compute arrival time from this stop: departure time + total path minutes
      const arrivalTime = addMinutesToTimeString(stop.departureTime, pathResult.totalTravelMinutes);
      computedArrivalTimes.set(stop.villageId, arrivalTime);
    }

    const hasDetour = totalDetourMinutes > 0;
    const finalArrivalTime = hasDetour
      ? addMinutesToTimeString(trip.finalArrivalTime, totalDetourMinutes)
      : trip.finalArrivalTime;

    tripStates.set(trip.id, {
      trip,
      capacity: Math.max(0, trip.capacity),
      allocatedSeats: 0,
      assignedStudents: [],
      isAvailable: !isSevered,
      computedArrivalTimes,
      activeConnectionIds: Array.from(allActiveConnIds),
      hasDetour,
      detourMinutesAdded: totalDetourMinutes,
      isSevered,
      severedReason
    });

    if (isSevered) {
      addLog('WARNING', `Trip ${trip.vehicleName} route severed: ${severedReason}`, undefined, trip.vehicleName);
    } else if (hasDetour) {
      addLog('INFO', `Trip ${trip.vehicleName} routed via alternative bypass (+${totalDetourMinutes} min detour, arrives ${finalArrivalTime}).`, undefined, trip.vehicleName);
    } else {
      addLog('INFO', `Trip ${trip.vehicleName} operational on normal corridor (${trip.capacity} seats, arrives ${finalArrivalTime}).`, undefined, trip.vehicleName);
    }
  });

  // Prioritize requests strictly according to requirements:
  // 1. Exam students with imminent deadlines (exam start <= 08:45 AM within 2h of 06:45 AM clock)
  // 2. Earlier required arrival deadlines within that group
  // 3. Other exam students by deadline
  // 4. Remaining students by deadline
  // 5. Stable submission order as final deterministic tie-breaker
  const sortedRequests = [...requests].sort((a, b) => {
    // Group rank: 0 = Imminent exam (<= 08:45 AM), 1 = Other exam, 2 = Non-exam
    const isImminentA = a.isExamStudent && a.examStartTime && isTimeBeforeOrEqual(a.examStartTime, '08:45');
    const isImminentB = b.isExamStudent && b.examStartTime && isTimeBeforeOrEqual(b.examStartTime, '08:45');

    let groupA = 2;
    if (isImminentA) groupA = 0;
    else if (a.isExamStudent) groupA = 1;

    let groupB = 2;
    if (isImminentB) groupB = 0;
    else if (b.isExamStudent) groupB = 1;

    if (groupA !== groupB) return groupA - groupB;

    // Earlier required arrival deadline first
    const deadlineDiff = a.requiredArrivalTime.localeCompare(b.requiredArrivalTime);
    if (deadlineDiff !== 0) return deadlineDiff;

    // Academic category
    const catWeightA = a.priorityCategory === 'CRITICAL_EXAM' ? 1 : a.priorityCategory === 'LAB_PRACTICAL' ? 2 : 3;
    const catWeightB = b.priorityCategory === 'CRITICAL_EXAM' ? 1 : b.priorityCategory === 'LAB_PRACTICAL' ? 2 : 3;
    if (catWeightA !== catWeightB) return catWeightA - catWeightB;

    // Stable submission order
    const orderA = a.submissionOrder ?? 999;
    const orderB = b.submissionOrder ?? 999;
    if (orderA !== orderB) return orderA - orderB;

    return a.id.localeCompare(b.id);
  });

  const assignments: Assignment[] = [];
  const unmetRequests: UnmetRequest[] = [];
  let lateAlternativesCount = 0;

  // First pass: Capacity-aware Greedy Allocation with Alternative Routes & Deadline Verification
  for (const req of sortedRequests) {
    const evaluatedCandidates: EvaluatedTripCandidate[] = [];
    let bestTripState: EvaluatedTripState | null = null;
    let chosenPickupStop: VehicleTrip['stops'][0] | null = null;
    let bestArrivalTime: string | null = null;
    let potentialLateAlternative: {
      trip: VehicleTrip;
      estimatedArrival: string;
      minutesLate: number;
    } | null = null;

    for (const trip of trips) {
      const state = tripStates.get(trip.id)!;
      const destinationMatch = trip.destinationInstitutionId === req.destinationInstitutionId;
      const stop = trip.stops.find(s => s.villageId === req.originVillageId);
      const servesOrigin = Boolean(stop);
      const capacityAvailable = state.allocatedSeats < state.capacity;

      const computedArrival = servesOrigin
        ? (state.computedArrivalTimes.get(req.originVillageId) || trip.finalArrivalTime)
        : trip.finalArrivalTime;

      const reachesInTime = isTimeBeforeOrEqual(computedArrival, req.requiredArrivalTime);

      let rejectionReason = '';
      if (trip.isCancelled) {
        rejectionReason = `Vehicle cancelled: ${trip.cancelReason || 'Technical issue'}`;
      } else if (state.isSevered) {
        rejectionReason = state.severedReason || 'No accessible route is available.';
      } else if (!destinationMatch) {
        rejectionReason = `Heads to ${trip.destinationName}, not requested ${req.destinationName}`;
      } else if (!servesOrigin) {
        rejectionReason = `No scheduled stop at ${req.originVillageName}`;
      } else if (!reachesInTime) {
        const lateMins = minutesDiff(computedArrival, req.requiredArrivalTime);
        rejectionReason = `Arrives at ${computedArrival} (${lateMins}m after required deadline ${req.requiredArrivalTime})`;
        if (capacityAvailable && !potentialLateAlternative) {
          potentialLateAlternative = {
            trip,
            estimatedArrival: computedArrival,
            minutesLate: lateMins
          };
        }
      } else if (!capacityAvailable) {
        rejectionReason = `Capacity exhausted (${state.allocatedSeats}/${state.capacity} seats filled)`;
      } else {
        rejectionReason = state.hasDetour
          ? `Feasible via alternative bypass (+${state.detourMinutesAdded}m detour, arrives ${computedArrival})`
          : 'Feasible and on-time';
      }

      evaluatedCandidates.push({
        tripId: trip.id,
        vehicleName: trip.vehicleName,
        isCancelled: trip.isCancelled,
        isBlocked: state.isSevered,
        blockedReason: state.severedReason,
        destinationMatch,
        servesOrigin,
        reachesInTime,
        capacityAvailable,
        rejectionReason,
        alternativeRouteFound: state.hasDetour,
        alternativeMinutesAdded: state.detourMinutesAdded,
        estimatedArrival: computedArrival
      });

      // Valid on-time candidate check
      if (
        !trip.isCancelled &&
        !state.isSevered &&
        destinationMatch &&
        servesOrigin &&
        reachesInTime &&
        capacityAvailable
      ) {
        if (!bestTripState) {
          bestTripState = state;
          chosenPickupStop = stop!;
          bestArrivalTime = computedArrival;
        } else {
          // Prefer trip with more available seats for load balance
          const currAvail = bestTripState.capacity - bestTripState.allocatedSeats;
          const candidateAvail = state.capacity - state.allocatedSeats;
          if (candidateAvail > currAvail) {
            bestTripState = state;
            chosenPickupStop = stop!;
            bestArrivalTime = computedArrival;
          }
        }
      }
    }

    if (bestTripState && chosenPickupStop && bestArrivalTime) {
      bestTripState.allocatedSeats += 1;
      const seatNumber = bestTripState.allocatedSeats;

      const assignment: Assignment = {
        requestId: req.id,
        studentName: req.studentName,
        gradeOrStream: req.gradeOrStream,
        tripId: bestTripState.trip.id,
        vehicleName: bestTripState.trip.vehicleName,
        pickupVillageId: req.originVillageId,
        pickupVillageName: req.originVillageName,
        dropoffInstitutionId: req.destinationInstitutionId,
        dropoffInstitutionName: req.destinationName,
        pickupTime: chosenPickupStop.departureTime,
        dropoffTime: bestArrivalTime,
        seatNumber,
        priorityCategory: req.priorityCategory,
        isExamStudent: req.isExamStudent,
        examStartTime: req.examStartTime,
        isOnTime: true,
        routeDetails: {
          connectionIds: bestTripState.activeConnectionIds,
          hasDetour: bestTripState.hasDetour,
          detourMinutesAdded: bestTripState.detourMinutesAdded,
          pathNodeNames: bestTripState.trip.stops.map(s => s.villageName)
        }
      };

      assignments.push(assignment);
      bestTripState.assignedStudents.push(assignment);

      addLog(
        'DECISION',
        `Assigned ${req.studentName} (${req.isExamStudent ? 'EXAM: ' + req.examSubject : req.priorityCategory}) to ${bestTripState.trip.vehicleName} [Seat ${seatNumber}/${bestTripState.capacity}]. Arrives on-time at ${bestArrivalTime}.${bestTripState.hasDetour ? ' (Using alternative bypass route)' : ''}`,
        req.studentName,
        bestTripState.trip.vehicleName
      );
    } else {
      // Unmet request - determine honest specific reason
      const originTrips = evaluatedCandidates.filter(t => t.servesOrigin);
      const matchingTrips = evaluatedCandidates.filter(t => t.servesOrigin && t.destinationMatch);

      let primaryReasonCode: UnmetReasonCode = 'CAPACITY_EXCEEDED';
      let honestExplanation = '';

      if (originTrips.length === 0) {
        primaryReasonCode = 'NO_CONNECTING_ROUTE';
        honestExplanation = `No transport service is scheduled through ${req.originVillageName} to ${req.destinationName}.`;
      } else if (matchingTrips.length === 0) {
        primaryReasonCode = 'NO_CONNECTING_ROUTE';
        honestExplanation = `Vehicles serving ${req.originVillageName} do not travel to ${req.destinationName}.`;
      } else {
        const allCancelled = matchingTrips.every(t => t.isCancelled);
        const allBlocked = matchingTrips.every(t => t.isBlocked);
        const allTimingFailed = matchingTrips.every(t => !t.reachesInTime && !t.isCancelled && !t.isBlocked);

        if (allCancelled) {
          primaryReasonCode = 'TRIP_CANCELLED';
          honestExplanation = `The only scheduled transport serving ${req.originVillageName} has been CANCELLED due to emergency breakdown. No alternative vehicle exists for this sector.`;
        } else if (allBlocked) {
          primaryReasonCode = 'ROUTE_BLOCKED';
          honestExplanation = `No accessible route is available. All corridors from ${req.originVillageName} are impassable or cut off by flooding.`;
        } else if (allTimingFailed) {
          primaryReasonCode = 'TIMING_INCOMPATIBLE';
          honestExplanation = `Surviving vehicle(s) arrive after required deadline (${req.requiredArrivalTime}). Detour route cannot meet the exam buffer.`;
        } else {
          primaryReasonCode = 'CAPACITY_EXCEEDED';
          honestExplanation = `All feasible vehicles reaching ${req.destinationName} on time are at maximum capacity. Remaining seats were prioritised for earlier/higher-urgency exam candidates.`;
        }
      }

      const hasLateAlt = Boolean(potentialLateAlternative);
      if (hasLateAlt) {
        lateAlternativesCount++;
      }

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
        primaryReasonCode,
        honestExplanation,
        isExamStudent: req.isExamStudent,
        examStartTime: req.examStartTime,
        evaluatedTrips: evaluatedCandidates,
        hasLateAlternative: hasLateAlt,
        lateAlternativeDetails: potentialLateAlternative
          ? {
              tripName: potentialLateAlternative.trip.vehicleName,
              estimatedArrival: potentialLateAlternative.estimatedArrival,
              deadline: req.requiredArrivalTime,
              minutesLate: potentialLateAlternative.minutesLate
            }
          : undefined
      });

      addLog(
        'WARNING',
        `Unmet demand for ${req.studentName} (${req.isExamStudent ? 'EXAM CANDIDATE' : 'Regular'}): ${honestExplanation}`,
        req.studentName
      );
    }
  }

  // Calculate metrics
  const tripUtilization: TripUtilization[] = [];
  let totalCapacity = 0;
  let allocatedCapacity = 0;

  tripStates.forEach(state => {
    totalCapacity += state.isAvailable ? state.capacity : 0;
    allocatedCapacity += state.allocatedSeats;
    const utilizationPct = state.capacity > 0
      ? Math.round((state.allocatedSeats / state.capacity) * 100)
      : 0;

    let status: TripUtilization['status'] = 'ACTIVE';
    if (state.trip.isCancelled) status = 'CANCELLED';
    else if (state.isSevered) status = 'BLOCKED';
    else if (state.allocatedSeats >= state.capacity) status = 'FULL';

    tripUtilization.push({
      tripId: state.trip.id,
      vehicleName: state.trip.vehicleName,
      capacity: state.capacity,
      allocatedSeats: state.allocatedSeats,
      isCancelled: state.trip.isCancelled,
      isBlocked: state.isSevered,
      blockedConnectionIds: state.trip.pathConnectionIds.filter(id => blockedConnectionSet.has(id)),
      utilizationPct,
      status,
      activeRouteConnectionIds: state.activeConnectionIds,
      hasDetour: state.hasDetour,
      detourMinutesAdded: state.detourMinutesAdded
    });
  });

  const capacityUtilizationPct = totalCapacity > 0
    ? Math.round((allocatedCapacity / totalCapacity) * 100)
    : 0;

  const examRequestsCount = requests.filter(r => r.isExamStudent).length;
  const examAssignedOnTimeCount = assignments.filter(a => a.isExamStudent && a.isOnTime).length;

  addLog(
    'INFO',
    `${mode} allocation completed: ${assignments.length} on-time assignments (${examAssignedOnTimeCount}/${examRequestsCount} exam students on time), ${unmetRequests.length} unmet, ${lateAlternativesCount} late alternatives.`
  );

  return {
    mode,
    generatedAt: new Date().toISOString(),
    totalRequests: requests.length,
    assignedCount: assignments.length,
    unmetCount: unmetRequests.length,
    examRequestsCount,
    examAssignedOnTimeCount,
    totalCapacity,
    allocatedCapacity,
    capacityUtilizationPct,
    assignments,
    unmetRequests,
    tripUtilization,
    solverLogs: logs,
    lateAlternativesCount
  };
}

/**
 * Computes difference between baseline and recovery results for comparison views.
 */
export function computeAllocationDiff(
  baseline: AllocationResult,
  recovery: AllocationResult
) {
  const baselineAssignmentsMap = new Map(baseline.assignments.map(a => [a.requestId, a]));
  const recoveryAssignmentsMap = new Map(recovery.assignments.map(a => [a.requestId, a]));

  const displacedAssignments: {
    studentName: string;
    previousTripName: string;
    newStatus: 'UNMET' | 'REROUTED';
    newTripName?: string;
    reason: string;
  }[] = [];

  baseline.assignments.forEach(baseAssign => {
    const recoveryAssign = recoveryAssignmentsMap.get(baseAssign.requestId);
    if (!recoveryAssign) {
      const unmet = recovery.unmetRequests.find(u => u.requestId === baseAssign.requestId);
      displacedAssignments.push({
        studentName: baseAssign.studentName,
        previousTripName: baseAssign.vehicleName,
        newStatus: 'UNMET',
        reason: unmet?.honestExplanation || 'Displaced due to capacity deficit or route blockage'
      });
    } else if (recoveryAssign.tripId !== baseAssign.tripId) {
      displacedAssignments.push({
        studentName: baseAssign.studentName,
        previousTripName: baseAssign.vehicleName,
        newStatus: 'REROUTED',
        newTripName: recoveryAssign.vehicleName,
        reason: `Reassigned from ${baseAssign.vehicleName} to ${recoveryAssign.vehicleName} [Seat ${recoveryAssign.seatNumber}]`
      });
    }
  });

  const newlyAssigned = recovery.assignments.filter(
    r => !baselineAssignmentsMap.has(r.requestId)
  );

  return {
    displacedAssignments,
    newlyAssigned
  };
}
