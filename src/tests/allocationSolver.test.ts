import { describe, it, expect } from 'vitest';
import { runAllocationSolver, computeAllocationDiff } from '../services/allocationSolver';
import {
  SEEDED_STUDENT_REQUESTS,
  SEEDED_VEHICLE_TRIPS,
  SEEDED_CONNECTIONS
} from '../models/seedData';
import { VehicleTrip, TransportConnection, StudentRequest } from '../types';

describe('RouteLess Pure Allocation Solver', () => {
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

    // Seeded data has 17 requests and 15 total vehicle seats (6 + 4 + 5)
    expect(result1.totalCapacity).toBe(15);
    expect(result1.assignedCount).toBe(15);
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
    // Cancel Trip 01 (Yellow Mini-Bus serving Kallupatti & Badepalli -> Govt HSS)
    const cancelledTrips: VehicleTrip[] = SEEDED_VEHICLE_TRIPS.map(trip =>
      trip.id === 'trip-01'
        ? { ...trip, isCancelled: true, cancelReason: 'Radiator crack & engine overheat' }
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

    // Kallupatti has no alternative vehicle -> all Kallupatti students must be unmet
    const kallupattiRequests = SEEDED_STUDENT_REQUESTS.filter(r => r.originVillageId === 'vil-kallupatti');
    kallupattiRequests.forEach(kReq => {
      const unmet = recoveryResult.unmetRequests.find(u => u.requestId === kReq.id);
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

  it('should handle blocked route segment (causeway flooding)', () => {
    // Block Sirikonda causeway (seg-siri-mal)
    const blockedConnections: TransportConnection[] = SEEDED_CONNECTIONS.map(conn =>
      conn.id === 'seg-siri-mal'
        ? { ...conn, isBlocked: true, blockedReason: 'River causeway submerged under 2 feet of flash floodwater' }
        : conn
    );

    const result = runAllocationSolver(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      blockedConnections,
      'RECOVERY'
    );

    // All Sirikonda students attempting to reach Govt HSS via Trip 03 must be unmet due to route block
    const sirikondaRequests = SEEDED_STUDENT_REQUESTS.filter(r => r.originVillageId === 'vil-sirikonda');
    sirikondaRequests.forEach(sReq => {
      const unmet = result.unmetRequests.find(u => u.requestId === sReq.id);
      expect(unmet).toBeDefined();
      expect(unmet?.primaryReasonCode).toBe('ROUTE_BLOCKED');
      expect(unmet?.honestExplanation).toContain('impassable');
    });

    // Mallareddy and Badepalli students can still board Trip 03 because their legs are not blocked
    const mallareddyAssigned = result.assignments.filter(a => a.pickupVillageId === 'vil-mallareddy');
    expect(mallareddyAssigned.length).toBeGreaterThan(0);
  });

  it('should immediately update allocations when vehicle capacity is dynamically edited', () => {
    // Increase Trip 01 capacity from 6 to 7, and Trip 02 capacity from 4 to 5
    const expandedTrips: VehicleTrip[] = SEEDED_VEHICLE_TRIPS.map(trip => {
      if (trip.id === 'trip-01') return { ...trip, capacity: 7 };
      if (trip.id === 'trip-02') return { ...trip, capacity: 5 };
      return trip;
    });

    const result = runAllocationSolver(
      SEEDED_STUDENT_REQUESTS,
      expandedTrips,
      SEEDED_CONNECTIONS,
      'BASELINE'
    );

    // Total capacity increased to 17 (7 + 5 + 5), which matches total requests of 17
    expect(result.totalCapacity).toBe(17);
    expect(result.assignedCount).toBe(16); // 16 assigned (one remaining unmet due to destination/timing or distribution)
  });

  it('should reject requests with arrival deadlines earlier than trip arrival time', () => {
    const earlyRequests: StudentRequest[] = [
      {
        id: 'req-early-01',
        studentName: 'Early Bird',
        gradeOrStream: 'Grade 10',
        originVillageId: 'vil-kallupatti',
        originVillageName: 'Kallupatti',
        destinationInstitutionId: 'inst-ghss',
        destinationInstitutionName: 'Govt Higher Secondary School',
        destinationName: 'Govt Higher Secondary School',
        requiredArrivalTime: '07:45', // Trip 01 arrives at 08:15!
        priorityCategory: 'CRITICAL_EXAM',
        submissionTimestamp: '2026-11-13T06:00:00Z'
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
