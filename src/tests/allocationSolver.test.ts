import { describe, it, expect } from 'vitest';
import { runAllocationSolver, computeAllocationDiff } from '../services/allocationSolver';
import {
  SEEDED_STUDENT_REQUESTS,
  SEEDED_VEHICLE_TRIPS,
  SEEDED_CONNECTIONS
} from '../models/seedData';
import { VehicleTrip, TransportConnection, StudentRequest } from '../types';

describe('RouteLess Pure Allocation Solver (Mangaluru Suburban Region)', () => {
  it('should run deterministic baseline allocation respecting vehicle capacities', () => {
    const result1 = runAllocationSolver(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS,
      'BASELINE'
    );

    const result2 = runAllocationSolver(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS,
      'BASELINE'
    );

    // Determinism test
    expect(result1.assignedCount).toBe(result2.assignedCount);
    expect(result1.unmetCount).toBe(result2.unmetCount);
    expect(result1.assignments.map(a => a.requestId)).toEqual(result2.assignments.map(a => a.requestId));

    // Capacity constraint: no vehicle should exceed its capacity
    result1.tripUtilization.forEach(util => {
      expect(util.allocatedSeats).toBeLessThanOrEqual(util.capacity);
    });

    // Seeded data has 20 requests and 24 total vehicle seats (7 + 6 + 5 + 6)
    expect(result1.totalCapacity).toBe(24);
    expect(result1.assignedCount).toBe(18);
    expect(result1.unmetCount).toBe(2);

    // Unmet requests must have honest explanations
    expect(result1.unmetRequests.length).toBe(2);
    result1.unmetRequests.forEach(unmet => {
      expect(unmet.honestExplanation).toBeTruthy();
      expect(unmet.primaryReasonCode).toBe('CAPACITY_EXCEEDED');
      expect(unmet.evaluatedTrips.length).toBeGreaterThan(0);
    });
  });

  it('should handle vehicle cancellation with feasible alternatives for some and honest unmet explanations for others', () => {
    // Cancel Trip 01 (KSRTC Mini-Bus serving Pavoor & Farangipete -> St. Aloysius)
    const cancelledTrips: VehicleTrip[] = SEEDED_VEHICLE_TRIPS.map(trip =>
      trip.id === 'trip-01'
        ? { ...trip, isCancelled: true, cancelReason: 'Depot radiator crack & cooling failure' }
        : trip
    );

    const recoveryResult = runAllocationSolver(
      SEEDED_STUDENT_REQUESTS,
      cancelledTrips,
      SEEDED_CONNECTIONS,
      'RECOVERY'
    );

    // No student should be assigned to the cancelled Trip 01
    const trip1Assignments = recoveryResult.assignments.filter(a => a.tripId === 'trip-01');
    expect(trip1Assignments.length).toBe(0);

    // Pavoor has no alternative vehicle -> all Pavoor students must be unmet
    const pavoorRequests = SEEDED_STUDENT_REQUESTS.filter(r => r.originVillageId === 'vil-pavoor');
    pavoorRequests.forEach(pReq => {
      const unmet = recoveryResult.unmetRequests.find(u => u.requestId === pReq.id);
      expect(unmet).toBeDefined();
      expect(unmet?.primaryReasonCode).toBe('TRIP_CANCELLED');
      expect(unmet?.honestExplanation).toContain('CANCELLED');
    });

    // Compare with baseline
    const baselineResult = runAllocationSolver(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS,
      'BASELINE'
    );

    const diff = computeAllocationDiff(baselineResult, recoveryResult);
    expect(diff.displacedAssignments.length).toBeGreaterThan(0);
  });

  it('should reroute via bypass when direct valley road is flooded', () => {
    // Block Ganjimutt - Farangipete direct road (seg-ganji-far)
    const blockedConnections: TransportConnection[] = SEEDED_CONNECTIONS.map(conn =>
      conn.id === 'seg-ganji-far'
        ? { ...conn, isBlocked: true, blockedReason: 'River overflow across valley corridor' }
        : conn
    );

    const result = runAllocationSolver(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      blockedConnections,
      'RECOVERY'
    );

    // Cruiser 04 should detect detour via Adyar Ridge (+8 min)
    const cruiser = result.tripUtilization.find(t => t.tripId === 'trip-04');
    expect(cruiser).toBeDefined();
    expect(cruiser?.hasDetour).toBe(true);
    expect(cruiser?.detourMinutesAdded).toBe(8);
    expect(cruiser?.activeRouteConnectionIds).toContain('seg-ganji-adyar');
    expect(cruiser?.activeRouteConnectionIds).toContain('seg-adyar-far');
    expect(cruiser?.activeRouteConnectionIds).not.toContain('seg-ganji-far');
  });

  it('should immediately update allocations when vehicle capacity is dynamically edited', () => {
    // Increase Trip 04 (Cruiser 04) capacity from 6 to 8 to accommodate unmet students
    const expandedTrips: VehicleTrip[] = SEEDED_VEHICLE_TRIPS.map(trip => {
      if (trip.id === 'trip-04') return { ...trip, capacity: 8 };
      return trip;
    });

    const result = runAllocationSolver(
      SEEDED_STUDENT_REQUESTS,
      expandedTrips,
      SEEDED_CONNECTIONS,
      'BASELINE'
    );

    // Total capacity increased to 26 (7 + 6 + 5 + 8)
    expect(result.totalCapacity).toBe(26);
    expect(result.assignedCount).toBe(19); // Accommodated 1 additional student
  });

  it('should reject requests with arrival deadlines earlier than trip arrival time', () => {
    const earlyRequests: StudentRequest[] = [
      {
        id: 'req-early-01',
        studentName: 'Early Bird',
        gradeOrStream: 'Grade 10',
        originVillageId: 'vil-pavoor',
        originVillageName: 'Pavoor Riverine Fringe',
        destinationInstitutionId: 'inst-aloysius',
        destinationInstitutionName: 'St. Aloysius High School & PU College',
        destinationName: 'St. Aloysius High School & PU College',
        requiredArrivalTime: '07:00', // Earliest trip arrives at 08:10!
        priorityCategory: 'CRITICAL_EXAM',
        submissionTimestamp: '2026-11-13T06:00:00Z',
        submissionOrder: 99,
        isExamStudent: true,
        examStartTime: '07:15',
        examSubject: 'English'
      }
    ];

    const result = runAllocationSolver(
      earlyRequests,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS,
      'BASELINE'
    );

    expect(result.assignedCount).toBe(0);
    expect(result.unmetCount).toBe(1);
    expect(result.unmetRequests[0].evaluatedTrips[0].reachesInTime).toBe(false);
  });
});
