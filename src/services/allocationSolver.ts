/**
 * RouteLess Pure Allocation Solver
 * 
 * Pure TypeScript module with ZERO UI dependencies.
 * Deterministic capacity-aware matching and recovery re-allocation.
 * Enforces all physical constraints: capacity, cancellations, blocked links, arrival deadlines.
 * Produces honest, detailed audit logs and explanations for every unmet request.
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

interface LegSegmentMapping {
  fromStopId: string;
  toStopOrDestId: string;
  connectionId: string;
}

// Maps each trip's consecutive stops & final destination to their corresponding connection segments
const TRIP_LEG_MAPPINGS: Record<string, LegSegmentMapping[]> = {
  'trip-01': [
    { fromStopId: 'vil-kallupatti', toStopOrDestId: 'vil-badepalli', connectionId: 'seg-kal-bad' },
    { fromStopId: 'vil-badepalli', toStopOrDestId: 'inst-ghss', connectionId: 'seg-bad-ghss' }
  ],
  'trip-02': [
    { fromStopId: 'vil-devarkonda', toStopOrDestId: 'vil-badepalli', connectionId: 'seg-dev-bad' },
    { fromStopId: 'vil-badepalli', toStopOrDestId: 'inst-poly', connectionId: 'seg-bad-poly' }
  ],
  'trip-03': [
    { fromStopId: 'vil-sirikonda', toStopOrDestId: 'vil-mallareddy', connectionId: 'seg-siri-mal' },
    { fromStopId: 'vil-mallareddy', toStopOrDestId: 'vil-badepalli', connectionId: 'seg-mal-bad' },
    { fromStopId: 'vil-badepalli', toStopOrDestId: 'inst-ghss', connectionId: 'seg-bad-ghss' }
  ]
};

// Numerical priority rank (lower is higher priority)
const PRIORITY_WEIGHTS: Record<PriorityCategory, number> = {
  CRITICAL_EXAM: 1,
  LAB_PRACTICAL: 2,
  REGULAR_ATTENDANCE: 3
};

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
 * Checks if the route legs from a student's pickup stop to the final destination
 * contain any blocked road connection.
 */
export function checkTripLegsForBlockedRoute(
  tripId: string,
  pickupVillageId: string,
  blockedConnectionMap: Map<string, TransportConnection>
): { hasBlockedLeg: boolean; blockedSegment?: TransportConnection } {
  const legs = TRIP_LEG_MAPPINGS[tripId];
  if (!legs) {
    return { hasBlockedLeg: false };
  }

  // Find index of the pickup stop
  let pickupIndex = legs.findIndex(l => l.fromStopId === pickupVillageId);
  if (pickupIndex === -1) {
    // Stop not found in known legs
    return { hasBlockedLeg: false };
  }

  // Check all legs from pickup to destination
  for (let i = pickupIndex; i < legs.length; i++) {
    const connId = legs[i].connectionId;
    const blockedConn = blockedConnectionMap.get(connId);
    if (blockedConn && blockedConn.isBlocked) {
      return {
        hasBlockedLeg: true,
        blockedSegment: blockedConn
      };
    }
  }

  return { hasBlockedLeg: false };
}

/**
 * Pure deterministic allocation solver.
 * 
 * @param requests Array of student transport requests
 * @param trips Array of vehicle trips with current capacities and cancellation states
 * @param connections Array of road connections with blocked statuses
 * @param mode 'BASELINE' or 'RECOVERY'
 * @returns Complete AllocationResult with assignments, honest unmet reasons, and solver logs
 */
export function runAllocationSolver(
  requests: StudentRequest[],
  trips: VehicleTrip[],
  connections: TransportConnection[],
  mode: 'BASELINE' | 'RECOVERY' = 'BASELINE'
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
    `Initializing ${mode} allocation solver with ${requests.length} student requests and ${trips.length} vehicle trips.`
  );

  // Map of blocked connections for O(1) lookup
  const blockedConnectionMap = new Map<string, TransportConnection>();
  connections.forEach(conn => {
    if (conn.isBlocked) {
      blockedConnectionMap.set(conn.id, conn);
    }
  });

  if (blockedConnectionMap.size > 0) {
    const blockedNames = Array.from(blockedConnectionMap.values())
      .map(c => `${c.fromName} ↔ ${c.toName} (${c.blockedReason || 'Blocked'})`)
      .join('; ');
    addLog('ALERT', `Active network disruptions detected: ${blockedNames}`);
  }

  // Track remaining seats and assignments per trip
  interface TripSeatTracker {
    trip: VehicleTrip;
    capacity: number;
    allocatedSeats: number;
    assignedStudents: Assignment[];
    isBlocked: boolean;
    blockedSegments: string[];
  }

  const tripTrackers = new Map<string, TripSeatTracker>();

  trips.forEach(trip => {
    // Check if entire trip is blocked (any of its legs blocked)
    const blockedSegmentsForTrip: string[] = [];
    trip.pathConnectionIds.forEach(connId => {
      const conn = blockedConnectionMap.get(connId);
      if (conn) {
        blockedSegmentsForTrip.push(`${conn.fromName} ↔ ${conn.toName}`);
      }
    });

    const isBlocked = blockedSegmentsForTrip.length > 0;

    tripTrackers.set(trip.id, {
      trip,
      capacity: Math.max(0, trip.capacity),
      allocatedSeats: 0,
      assignedStudents: [],
      isBlocked,
      blockedSegments: blockedSegmentsForTrip
    });

    if (trip.isCancelled) {
      addLog('WARNING', `Trip ${trip.vehicleName} is marked CANCELLED: ${trip.cancelReason || 'Vehicle out of service'}.`, undefined, trip.vehicleName);
    } else if (isBlocked) {
      addLog('WARNING', `Trip ${trip.vehicleName} has blocked segments: ${blockedSegmentsForTrip.join(', ')}.`, undefined, trip.vehicleName);
    } else {
      addLog('INFO', `Trip ${trip.vehicleName} active with capacity ${trip.capacity} seats to ${trip.destinationName}.`, undefined, trip.vehicleName);
    }
  });

  // Sort requests deterministically:
  // 1. Priority Category (CRITICAL_EXAM -> LAB_PRACTICAL -> REGULAR_ATTENDANCE)
  // 2. Submission timestamp ascending (first-come)
  // 3. Stable tie-breaker by student ID
  const sortedRequests = [...requests].sort((a, b) => {
    const pA = PRIORITY_WEIGHTS[a.priorityCategory] ?? 99;
    const pB = PRIORITY_WEIGHTS[b.priorityCategory] ?? 99;
    if (pA !== pB) return pA - pB;

    const timeDiff = a.submissionTimestamp.localeCompare(b.submissionTimestamp);
    if (timeDiff !== 0) return timeDiff;

    return a.id.localeCompare(b.id);
  });

  const assignments: Assignment[] = [];
  const unmetRequests: UnmetRequest[] = [];

  // Process each request
  for (const req of sortedRequests) {
    const evaluatedTrips: EvaluatedTripCandidate[] = [];
    let assignedTripTracker: TripSeatTracker | null = null;
    let chosenPickupStop: VehicleTrip['stops'][0] | null = null;

    // Filter and score candidate trips
    for (const trip of trips) {
      const tracker = tripTrackers.get(trip.id)!;
      const destinationMatch = trip.destinationInstitutionId === req.destinationInstitutionId;
      const stop = trip.stops.find(s => s.villageId === req.originVillageId);
      const servesOrigin = Boolean(stop);
      const reachesInTime = isTimeBeforeOrEqual(trip.finalArrivalTime, req.requiredArrivalTime);
      
      const { hasBlockedLeg, blockedSegment } = checkTripLegsForBlockedRoute(
        trip.id,
        req.originVillageId,
        blockedConnectionMap
      );

      const capacityAvailable = tracker.allocatedSeats < tracker.capacity;

      let rejectionReason = '';
      if (trip.isCancelled) {
        rejectionReason = `Trip cancelled: ${trip.cancelReason || 'Vehicle unavailable'}`;
      } else if (!destinationMatch) {
        rejectionReason = `Heads to ${trip.destinationName}, not requested ${req.destinationName}`;
      } else if (!servesOrigin) {
        rejectionReason = `No scheduled stop at ${req.originVillageName}`;
      } else if (hasBlockedLeg && blockedSegment) {
        rejectionReason = `Route blocked between ${blockedSegment.fromName} and ${blockedSegment.toName} (${blockedSegment.blockedReason || 'Road impassable'})`;
      } else if (!reachesInTime) {
        rejectionReason = `Arrives at ${trip.finalArrivalTime}, after requested deadline ${req.requiredArrivalTime}`;
      } else if (!capacityAvailable) {
        rejectionReason = `Capacity exhausted (${tracker.allocatedSeats}/${tracker.capacity} seats filled)`;
      } else {
        rejectionReason = 'Feasible and available';
      }

      const candidate: EvaluatedTripCandidate = {
        tripId: trip.id,
        vehicleName: trip.vehicleName,
        isCancelled: trip.isCancelled,
        isBlocked: hasBlockedLeg,
        blockedReason: blockedSegment?.blockedReason,
        destinationMatch,
        servesOrigin,
        reachesInTime,
        capacityAvailable,
        rejectionReason
      };

      evaluatedTrips.push(candidate);

      // Check if this candidate is feasible right now
      if (
        !trip.isCancelled &&
        destinationMatch &&
        servesOrigin &&
        !hasBlockedLeg &&
        reachesInTime &&
        capacityAvailable
      ) {
        // If we haven't selected a trip yet, or this trip has more available seats, choose it
        if (!assignedTripTracker) {
          assignedTripTracker = tracker;
          chosenPickupStop = stop!;
        } else {
          // Tie-break: prefer trip with more remaining seats for load balance
          const currentRemaining = assignedTripTracker.capacity - assignedTripTracker.allocatedSeats;
          const candidateRemaining = tracker.capacity - tracker.allocatedSeats;
          if (candidateRemaining > currentRemaining) {
            assignedTripTracker = tracker;
            chosenPickupStop = stop!;
          }
        }
      }
    }

    if (assignedTripTracker && chosenPickupStop) {
      // Allocate seat
      assignedTripTracker.allocatedSeats += 1;
      const seatNumber = assignedTripTracker.allocatedSeats;

      const assignment: Assignment = {
        requestId: req.id,
        studentName: req.studentName,
        gradeOrStream: req.gradeOrStream,
        tripId: assignedTripTracker.trip.id,
        vehicleName: assignedTripTracker.trip.vehicleName,
        pickupVillageId: req.originVillageId,
        pickupVillageName: req.originVillageName,
        dropoffInstitutionId: req.destinationInstitutionId,
        dropoffInstitutionName: req.destinationName,
        pickupTime: chosenPickupStop.departureTime,
        dropoffTime: assignedTripTracker.trip.finalArrivalTime,
        seatNumber,
        priorityCategory: req.priorityCategory
      };

      assignments.push(assignment);
      assignedTripTracker.assignedStudents.push(assignment);

      addLog(
        'DECISION',
        `Assigned ${req.studentName} (${req.priorityCategory}) to ${assignedTripTracker.trip.vehicleName} [Seat ${seatNumber}/${assignedTripTracker.capacity}] at ${chosenPickupStop.departureTime}.`,
        req.studentName,
        assignedTripTracker.trip.vehicleName
      );
    } else {
      // Student is UNMET. Formulate honest, specific explanation.
      const originTrips = evaluatedTrips.filter(t => t.servesOrigin);
      const destinationAndOriginTrips = evaluatedTrips.filter(t => t.servesOrigin && t.destinationMatch);

      let primaryReasonCode: UnmetReasonCode = 'CAPACITY_EXCEEDED';
      let honestExplanation = '';

      if (originTrips.length === 0) {
        primaryReasonCode = 'NO_CONNECTING_ROUTE';
        honestExplanation = `No transport service is scheduled through ${req.originVillageName} for ${req.destinationName}.`;
      } else if (destinationAndOriginTrips.length === 0) {
        primaryReasonCode = 'NO_CONNECTING_ROUTE';
        honestExplanation = `Vehicles serving ${req.originVillageName} do not travel to ${req.destinationName}.`;
      } else {
        const allCancelled = destinationAndOriginTrips.every(t => t.isCancelled);
        const allBlocked = destinationAndOriginTrips.every(t => t.isBlocked);
        const allCapacityFull = destinationAndOriginTrips.every(t => !t.capacityAvailable && !t.isCancelled && !t.isBlocked);

        if (allCancelled) {
          primaryReasonCode = 'TRIP_CANCELLED';
          const tripNames = destinationAndOriginTrips.map(t => t.vehicleName).join(', ');
          honestExplanation = `The only scheduled transport serving ${req.originVillageName} (${tripNames}) has been CANCELLED. No active alternative vehicle exists for this sector.`;
        } else if (allBlocked) {
          primaryReasonCode = 'ROUTE_BLOCKED';
          const reasons = destinationAndOriginTrips.map(t => t.blockedReason || 'road obstruction').join(', ');
          honestExplanation = `The transport corridor from ${req.originVillageName} to ${req.destinationName} is impassable due to a blocked route segment (${reasons}).`;
        } else if (allCapacityFull) {
          primaryReasonCode = 'CAPACITY_EXCEEDED';
          const tripDetails = destinationAndOriginTrips
            .map(t => `${t.vehicleName} (${tripTrackers.get(t.tripId)?.capacity} seats)`)
            .join(', ');
          honestExplanation = `All feasible trips reaching ${req.destinationName} before ${req.requiredArrivalTime} (${tripDetails}) are at maximum capacity. Remaining seats were prioritised for earlier/higher-priority requests.`;
        } else {
          // Mixed reasons
          const hasCancelled = destinationAndOriginTrips.some(t => t.isCancelled);
          const hasBlocked = destinationAndOriginTrips.some(t => t.isBlocked);
          if (hasBlocked) {
            primaryReasonCode = 'ROUTE_BLOCKED';
            honestExplanation = `Connecting route from ${req.originVillageName} is blocked, and alternate vehicles lack sufficient remaining capacity.`;
          } else if (hasCancelled) {
            primaryReasonCode = 'TRIP_CANCELLED';
            honestExplanation = `Primary trip serving ${req.originVillageName} was cancelled, and remaining feasible trips are fully booked.`;
          } else {
            primaryReasonCode = 'CAPACITY_EXCEEDED';
            honestExplanation = `No remaining unallocated seat on any vehicle operating from ${req.originVillageName} to ${req.destinationName} before ${req.requiredArrivalTime}.`;
          }
        }
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
        evaluatedTrips
      });

      addLog(
        'WARNING',
        `Could not allocate transport for ${req.studentName}: ${honestExplanation}`,
        req.studentName
      );
    }
  }

  // Calculate utilization metrics
  const tripUtilization: TripUtilization[] = [];
  let totalCapacity = 0;
  let allocatedCapacity = 0;

  tripTrackers.forEach(tracker => {
    totalCapacity += tracker.capacity;
    allocatedCapacity += tracker.allocatedSeats;
    const utilizationPct = tracker.capacity > 0
      ? Math.round((tracker.allocatedSeats / tracker.capacity) * 100)
      : 0;

    let status: TripUtilization['status'] = 'ACTIVE';
    if (tracker.trip.isCancelled) status = 'CANCELLED';
    else if (tracker.isBlocked) status = 'BLOCKED';
    else if (tracker.allocatedSeats >= tracker.capacity) status = 'FULL';

    tripUtilization.push({
      tripId: tracker.trip.id,
      vehicleName: tracker.trip.vehicleName,
      capacity: tracker.capacity,
      allocatedSeats: tracker.allocatedSeats,
      isCancelled: tracker.trip.isCancelled,
      isBlocked: tracker.isBlocked,
      blockedConnectionIds: tracker.blockedSegments,
      utilizationPct,
      status
    });
  });

  const capacityUtilizationPct = totalCapacity > 0
    ? Math.round((allocatedCapacity / totalCapacity) * 100)
    : 0;

  addLog(
    'INFO',
    `${mode} allocation completed: ${assignments.length} assigned (${capacityUtilizationPct}% seat utilization), ${unmetRequests.length} unmet.`
  );

  return {
    mode,
    generatedAt: new Date().toISOString(),
    totalRequests: requests.length,
    assignedCount: assignments.length,
    unmetCount: unmetRequests.length,
    totalCapacity,
    allocatedCapacity,
    capacityUtilizationPct,
    assignments,
    unmetRequests,
    tripUtilization,
    solverLogs: logs
  };
}

/**
 * Computes difference between baseline and recovery results for P1 comparison view.
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
      // Was assigned, now unmet
      const unmet = recovery.unmetRequests.find(u => u.requestId === baseAssign.requestId);
      displacedAssignments.push({
        studentName: baseAssign.studentName,
        previousTripName: baseAssign.vehicleName,
        newStatus: 'UNMET',
        reason: unmet?.honestExplanation || 'Displaced due to capacity reallocation or cancellation'
      });
    } else if (recoveryAssign.tripId !== baseAssign.tripId) {
      // Rerouted to a different vehicle
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
