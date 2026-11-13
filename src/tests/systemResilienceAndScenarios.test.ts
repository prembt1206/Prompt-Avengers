import { describe, it, expect, beforeEach } from 'vitest';
import { runAllocationSolver, computeAllocationDiff } from '../services/allocationSolver';
import { StorageService } from '../services/storageService';
import {
  SEEDED_STUDENT_REQUESTS,
  SEEDED_VEHICLE_TRIPS,
  SEEDED_CONNECTIONS,
  SEEDED_VILLAGES,
  SEEDED_INSTITUTIONS
} from '../models/seedData';
import { VehicleTrip, TransportConnection, StudentRequest } from '../types';

describe('System Resilience, Multi-Disruptions, and Hackathon Benchmark Tests', () => {
  beforeEach(() => {
    // Clean reset before each test
    StorageService.resetAllToDefaults();
  });

  it('should strictly enforce vehicle capacity constraints under extreme demand load (50 requests)', () => {
    // Generate 50 synthetic requests competing for the 15 fleet seats
    const heavyDemand: StudentRequest[] = [];
    for (let i = 1; i <= 50; i++) {
      heavyDemand.push({
        id: `req-heavy-${i}`,
        studentName: `Candidate ${i}`,
        gradeOrStream: 'Grade 10',
        originVillageId: 'vil-farangipete',
        originVillageName: 'Farangipete Junction',
        destinationInstitutionId: 'inst-aloysius',
        destinationName: 'St. Aloysius High School & PU College',
        destinationInstitutionName: 'St. Aloysius High School & PU College',
        requiredArrivalTime: '08:30',
        priorityCategory: i <= 10 ? 'CRITICAL_EXAM' : i <= 25 ? 'LAB_PRACTICAL' : 'REGULAR_ATTENDANCE',
        submissionTimestamp: `2026-11-13T06:${String(i).padStart(2, '0')}:00Z`
      });
    }

    const result = runAllocationSolver(heavyDemand, SEEDED_VEHICLE_TRIPS, SEEDED_CONNECTIONS, 'BASELINE');

    // Total physical fleet capacity is 15
    expect(result.totalCapacity).toBe(15);
    // Accommodated students must NOT exceed 15
    expect(result.assignedCount).toBeLessThanOrEqual(15);
    // Every single vehicle must strictly respect capacity
    result.tripUtilization.forEach(util => {
      expect(util.allocatedSeats).toBeLessThanOrEqual(util.capacity);
    });

    // Unmet demand must be honest and exact
    expect(result.unmetCount).toBe(50 - result.assignedCount);
    result.unmetRequests.forEach(unmet => {
      expect(unmet.primaryReasonCode).toBe('CAPACITY_EXCEEDED');
      expect(unmet.honestExplanation).toBeTruthy();
    });
  });

  it('should handle multiple simultaneous vehicle cancellations safely', () => {
    // Cancel Bus 01 (6 seats) and Van 02 (4 seats) -> only Cruiser 03 (5 seats) active
    const multiCancelledTrips: VehicleTrip[] = SEEDED_VEHICLE_TRIPS.map(trip => {
      if (trip.id === 'trip-01' || trip.id === 'trip-02') {
        return {
          ...trip,
          isCancelled: true,
          cancelReason: 'Dual depot mechanical failure'
        };
      }
      return trip;
    });

    const recoveryResult = runAllocationSolver(
      SEEDED_STUDENT_REQUESTS,
      multiCancelledTrips,
      SEEDED_CONNECTIONS,
      'RECOVERY'
    );

    // Exactly 0 students assigned to cancelled trips
    const trip1Assignments = recoveryResult.assignments.filter(a => a.tripId === 'trip-01');
    const trip2Assignments = recoveryResult.assignments.filter(a => a.tripId === 'trip-02');
    expect(trip1Assignments.length).toBe(0);
    expect(trip2Assignments.length).toBe(0);

    // Only surviving Cruiser 03 can take students (max 5)
    const trip3Assignments = recoveryResult.assignments.filter(a => a.tripId === 'trip-03');
    expect(trip3Assignments.length).toBeLessThanOrEqual(5);
    expect(recoveryResult.assignedCount).toBe(trip3Assignments.length);

    // Stranded students receive honest cancellation explanations
    const pavoorRequests = SEEDED_STUDENT_REQUESTS.filter(r => r.originVillageId === 'vil-pavoor');
    pavoorRequests.forEach(pReq => {
      const unmet = recoveryResult.unmetRequests.find(u => u.requestId === pReq.id);
      expect(unmet).toBeDefined();
      expect(unmet?.primaryReasonCode).toBe('TRIP_CANCELLED');
    });
  });

  it('should handle multiple simultaneous road corridor obstructions', () => {
    // Sever both the Gurupura causeway AND the Pavoor unpaved corridor
    const multiBlockedConns: TransportConnection[] = SEEDED_CONNECTIONS.map(conn => {
      if (conn.id === 'seg-guru-ganji' || conn.id === 'seg-pav-far') {
        return {
          ...conn,
          isBlocked: true,
          blockedReason: 'Simultaneous landslide and flash flood runoff'
        };
      }
      return conn;
    });

    const recoveryResult = runAllocationSolver(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      multiBlockedConns,
      'RECOVERY'
    );

    // All Pavoor and Gurupura students must be unmet due to severed corridors
    const cutOffRequests = SEEDED_STUDENT_REQUESTS.filter(
      r => r.originVillageId === 'vil-pavoor' || r.originVillageId === 'vil-gurupura'
    );

    cutOffRequests.forEach(req => {
      const unmet = recoveryResult.unmetRequests.find(u => u.requestId === req.id);
      expect(unmet).toBeDefined();
      expect(unmet?.primaryReasonCode).toBe('ROUTE_BLOCKED');
    });

    // Students at Kalladka and Farangipete can still be accommodated on unblocked routes
    const unblockedAssignments = recoveryResult.assignments.filter(
      a => a.pickupVillageId === 'vil-farangipete' || a.pickupVillageId === 'vil-kalladka'
    );
    expect(unblockedAssignments.length).toBeGreaterThan(0);
  });

  it('should strictly prioritize Board Exam candidates over regular attendance under contention', () => {
    // Single vehicle with only 2 seats
    const tinyFleet: VehicleTrip[] = [
      {
        ...SEEDED_VEHICLE_TRIPS[0],
        capacity: 2
      }
    ];

    // 4 requests from Pavoor to St. Aloysius with different priorities
    const contendingRequests: StudentRequest[] = [
      {
        id: 'req-reg',
        studentName: 'Regular Student',
        gradeOrStream: 'Grade 9',
        originVillageId: 'vil-pavoor',
        originVillageName: 'Pavoor Riverine Fringe',
        destinationInstitutionId: 'inst-aloysius',
        destinationName: 'St. Aloysius High School & PU College',
        requiredArrivalTime: '08:30',
        priorityCategory: 'REGULAR_ATTENDANCE',
        submissionTimestamp: '2026-11-13T05:00:00Z' // Earlier submission timestamp!
      },
      {
        id: 'req-exam',
        studentName: 'Exam Candidate',
        gradeOrStream: 'Grade 10',
        originVillageId: 'vil-pavoor',
        originVillageName: 'Pavoor Riverine Fringe',
        destinationInstitutionId: 'inst-aloysius',
        destinationName: 'St. Aloysius High School & PU College',
        requiredArrivalTime: '08:30',
        priorityCategory: 'CRITICAL_EXAM',
        submissionTimestamp: '2026-11-13T06:30:00Z' // Later submission timestamp
      },
      {
        id: 'req-lab',
        studentName: 'Lab Candidate',
        gradeOrStream: 'Grade 11',
        originVillageId: 'vil-pavoor',
        originVillageName: 'Pavoor Riverine Fringe',
        destinationInstitutionId: 'inst-aloysius',
        destinationName: 'St. Aloysius High School & PU College',
        requiredArrivalTime: '08:30',
        priorityCategory: 'LAB_PRACTICAL',
        submissionTimestamp: '2026-11-13T06:15:00Z'
      }
    ];

    const result = runAllocationSolver(contendingRequests, tinyFleet, SEEDED_CONNECTIONS, 'BASELINE');

    // Exactly 2 seats allocated
    expect(result.assignedCount).toBe(2);

    const assignedNames = result.assignments.map(a => a.studentName);
    // CRITICAL_EXAM candidate must receive a seat regardless of later timestamp
    expect(assignedNames).toContain('Exam Candidate');
    // LAB_PRACTICAL candidate must receive the second seat
    expect(assignedNames).toContain('Lab Candidate');
    // REGULAR_ATTENDANCE must be unmet due to capacity
    expect(assignedNames).not.toContain('Regular Student');
  });

  it('should guarantee deterministic reproducibility across 10 repeated runs', () => {
    const results = [];
    for (let i = 0; i < 10; i++) {
      results.push(runAllocationSolver(SEEDED_STUDENT_REQUESTS, SEEDED_VEHICLE_TRIPS, SEEDED_CONNECTIONS, 'BASELINE'));
    }

    const first = results[0];
    results.forEach(res => {
      expect(res.assignedCount).toBe(first.assignedCount);
      expect(res.unmetCount).toBe(first.unmetCount);
      expect(res.assignments.map(a => a.requestId)).toEqual(first.assignments.map(a => a.requestId));
      expect(res.unmetRequests.map(u => u.requestId)).toEqual(first.unmetRequests.map(u => u.requestId));
    });
  });

  it('should disqualify trips arriving after student required deadline with honest timing explanation', () => {
    // Student requires arrival by 07:30 (all trips arrive 08:15 - 08:25)
    const earlyRequests: StudentRequest[] = [
      {
        id: 'req-early-01',
        studentName: 'Early Bird Student',
        gradeOrStream: 'Grade 10',
        originVillageId: 'vil-farangipete',
        originVillageName: 'Farangipete Junction',
        destinationInstitutionId: 'inst-aloysius',
        destinationName: 'St. Aloysius High School & PU College',
        requiredArrivalTime: '07:30', // Earlier than trip arrival 08:15
        priorityCategory: 'CRITICAL_EXAM',
        submissionTimestamp: '2026-11-13T06:00:00Z'
      }
    ];

    const result = runAllocationSolver(earlyRequests, SEEDED_VEHICLE_TRIPS, SEEDED_CONNECTIONS, 'BASELINE');

    expect(result.assignedCount).toBe(0);
    expect(result.unmetCount).toBe(1);
    const unmet = result.unmetRequests[0];
    expect(unmet.primaryReasonCode).toBe('TIMING_INCOMPATIBLE');
    expect(unmet.honestExplanation).toContain('07:30');
  });

  it('should safely handle requests to disconnected or non-existent destinations without errors', () => {
    const disconnectedReq: StudentRequest = {
      id: 'req-unconnected',
      studentName: 'Isolated Student',
      gradeOrStream: 'Grade 10',
      originVillageId: 'vil-pavoor',
      originVillageName: 'Pavoor Riverine Fringe',
      destinationInstitutionId: 'inst-remote-unknown',
      destinationName: 'Non-Existent Remote College',
      requiredArrivalTime: '08:30',
      priorityCategory: 'REGULAR_ATTENDANCE',
      submissionTimestamp: '2026-11-13T06:00:00Z'
    };

    const result = runAllocationSolver([disconnectedReq], SEEDED_VEHICLE_TRIPS, SEEDED_CONNECTIONS, 'BASELINE');

    expect(result.assignedCount).toBe(0);
    expect(result.unmetCount).toBe(1);
    expect(result.unmetRequests[0].primaryReasonCode).toBe('NO_CONNECTING_ROUTE');
  });

  it('should reset all entities and state cleanly to default seed values', () => {
    const { requests, trips, connections } = StorageService.resetAllToDefaults();

    expect(requests.length).toBe(17);
    expect(trips.length).toBe(3);
    expect(connections.length).toBe(7);

    // No trips cancelled, no roads blocked
    expect(trips.every(t => !t.isCancelled)).toBe(true);
    expect(connections.every(c => !c.isBlocked)).toBe(true);
  });

  it('should produce consistent before-and-after comparison diffs', () => {
    const baseline = runAllocationSolver(SEEDED_STUDENT_REQUESTS, SEEDED_VEHICLE_TRIPS, SEEDED_CONNECTIONS, 'BASELINE');

    // Cancel Trip 01
    const cancelledTrips = SEEDED_VEHICLE_TRIPS.map(t =>
      t.id === 'trip-01' ? { ...t, isCancelled: true, cancelReason: 'Breakdown' } : t
    );

    const recovery = runAllocationSolver(SEEDED_STUDENT_REQUESTS, cancelledTrips, SEEDED_CONNECTIONS, 'RECOVERY');

    const diff = computeAllocationDiff(baseline, recovery);

    expect(diff.displacedAssignments.length).toBeGreaterThan(0);
    expect(diff.capacityDelta.length).toBe(SEEDED_VEHICLE_TRIPS.length);
  });
});

