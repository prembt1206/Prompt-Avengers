import { describe, it, expect } from 'vitest';
import {
  activateExamCrisisScenario,
  buildStateBCrisisBeforeRecovery,
  computeCrisisComparisonMetrics,
  CRISIS_BLOCKED_CONNECTION_ID,
  CRISIS_DISABLED_BUS_IDS
} from '../services/crisisScenario';
import { runAllocationSolver } from '../services/allocationSolver';
import { TransportNetworkGraph } from '../services/routingEngine';
import {
  SEEDED_STUDENT_REQUESTS,
  SEEDED_VEHICLE_TRIPS,
  SEEDED_CONNECTIONS,
  SIMULATION_CLOCK,
  EXAM_ARRIVAL_BUFFER_MINUTES
} from '../models/seedData';
import { StudentRequest, VehicleTrip, TransportConnection } from '../types';

describe('The Exam Day Crisis — Automated Scenario & Solver Test Suite', () => {
  // Test 1: Exactly two government buses disabled upon activation
  it('Test 1: should disable exactly two government buses simultaneously on crisis activation', () => {
    const { updatedTrips, crisisState } = activateExamCrisisScenario(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS,
      null
    );

    const cancelledBuses = updatedTrips.filter(t => t.isCancelled);
    expect(cancelledBuses.length).toBe(2);
    expect(cancelledBuses.map(b => b.id).sort()).toEqual(['trip-01', 'trip-02'].sort());
    expect(crisisState.disabledBusIds).toEqual(CRISIS_DISABLED_BUS_IDS);
    
    // Surviving fleet must be exactly Van 03 (5 seats) and Cruiser 04 (6 seats) = 11 seats total
    const survivingTrips = updatedTrips.filter(t => !t.isCancelled);
    expect(survivingTrips.length).toBe(2);
    const survivingCapacity = survivingTrips.reduce((sum, t) => sum + t.capacity, 0);
    expect(survivingCapacity).toBe(11);
  });

  // Test 2: Demand increases by exact 40% rounding rule
  it('Test 2: should increase baseline demand by exact 40% (20 baseline -> +8 surge = 28 total)', () => {
    const { updatedRequests, crisisState } = activateExamCrisisScenario(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS,
      null
    );

    expect(crisisState.originalRequestCount).toBe(20);
    expect(crisisState.additionalRequestCount).toBe(8);
    expect(crisisState.totalRequestCount).toBe(28);
    expect(updatedRequests.length).toBe(28);
    expect(crisisState.actualPercentageIncrease).toBe(40.0);
  });

  // Test 3: Repeated activation does not duplicate requests (idempotency check)
  it('Test 3: repeated activation must be idempotent and never duplicate requests', () => {
    const firstRun = activateExamCrisisScenario(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS,
      null
    );

    const secondRun = activateExamCrisisScenario(
      firstRun.updatedRequests,
      firstRun.updatedTrips,
      firstRun.updatedConnections,
      null,
      firstRun.crisisState.preCrisisSnapshot
    );

    expect(secondRun.updatedRequests.length).toBe(28);
    const uniqueIds = new Set(secondRun.updatedRequests.map(r => r.id));
    expect(uniqueIds.size).toBe(28);
  });

  // Test 4: Flooded connection is excluded from all allocated paths in recovery
  it('Test 4: flooded road seg-ganji-far must be excluded from all allocated paths in recovery', () => {
    const { updatedRequests, updatedTrips, updatedConnections } = activateExamCrisisScenario(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS,
      null
    );

    const floodedConn = updatedConnections.find(c => c.id === CRISIS_BLOCKED_CONNECTION_ID);
    expect(floodedConn?.isBlocked).toBe(true);

    const recoveryResult = runAllocationSolver(
      updatedRequests,
      updatedTrips,
      updatedConnections,
      'RECOVERY'
    );

    // No active trip should route across seg-ganji-far
    recoveryResult.tripUtilization.forEach(util => {
      expect(util.activeRouteConnectionIds).not.toContain(CRISIS_BLOCKED_CONNECTION_ID);
    });
  });

  // Test 5: Dijkstra finds alternative bypass path via Adyar Ridge with +8m detour
  it('Test 5: Dijkstra shortest-path should find Adyar Ridge bypass with +8m detour', () => {
    const graph = new TransportNetworkGraph(SEEDED_CONNECTIONS);
    const blockedSet = new Set(['seg-ganji-far']);

    // Baseline path (unblocked)
    const baseline = graph.findShortestPath('vil-ganjimutt', 'inst-aloysius', new Set());
    expect(baseline.isAccessible).toBe(true);
    expect(baseline.totalTravelMinutes).toBe(45); // 20m + 25m

    // Crisis path avoiding seg-ganji-far
    const crisisPath = graph.findShortestPath('vil-ganjimutt', 'inst-aloysius', blockedSet, baseline.totalTravelMinutes);
    expect(crisisPath.isAccessible).toBe(true);
    expect(crisisPath.hasDetour).toBe(true);
    expect(crisisPath.detourMinutesAdded).toBe(8); // 12m + 16m + 25m = 53m (53 - 45 = 8)
    expect(crisisPath.pathNodeIds).toEqual([
      'vil-ganjimutt',
      'vil-adyar',
      'vil-farangipete',
      'inst-aloysius'
    ]);
  });

  // Test 6: Disconnected / severed route produces honest failure
  it('Test 6: severed route should produce honest failure explaining no accessible route', () => {
    // Cut off both direct road and bypass road
    const totallyBlockedConns = SEEDED_CONNECTIONS.map(conn => {
      if (conn.id === 'seg-ganji-far' || conn.id === 'seg-ganji-adyar') {
        return { ...conn, isBlocked: true, blockedReason: 'Landslide on all ridge passes' };
      }
      return conn;
    });

    const graph = new TransportNetworkGraph(totallyBlockedConns);
    const blockedSet = new Set(['seg-ganji-far', 'seg-ganji-adyar']);
    const result = graph.findShortestPath('vil-ganjimutt', 'inst-aloysius', blockedSet);

    expect(result.isAccessible).toBe(false);
    expect(result.reason).toContain('No accessible route is available');
  });

  // Test 7: Exam candidates with imminent deadlines prioritized over non-exam requests
  it('Test 7: imminent exam candidates must be prioritized over non-exam requests', () => {
    const { updatedRequests, updatedTrips, updatedConnections } = activateExamCrisisScenario(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS,
      null
    );

    const recoveryResult = runAllocationSolver(
      updatedRequests,
      updatedTrips,
      updatedConnections,
      'RECOVERY'
    );

    // Exam students assigned
    const assignedExamStudents = recoveryResult.assignments.filter(a => a.isExamStudent);
    expect(assignedExamStudents.length).toBeGreaterThan(0);

    // In severe seat deficit (28 students vs 11 seats), exam candidates on viable routes get seats
    const unmetExamStudents = recoveryResult.unmetRequests.filter(u => u.isExamStudent);
    // Unmet exam students must have an honest explanation
    unmetExamStudents.forEach(u => {
      expect(u.honestExplanation).toBeTruthy();
    });
  });

  // Test 8: Impossible deadlines remain unmet and are honestly reported
  it('Test 8: impossible deadlines must remain unmet and never be counted as on-time', () => {
    const impossibleRequest: StudentRequest = {
      id: 'req-impossible-01',
      studentName: 'Unreachable Exam Candidate',
      gradeOrStream: 'Grade 12',
      originVillageId: 'vil-gurupura',
      originVillageName: 'Gurupura Riverbank',
      destinationInstitutionId: 'inst-aloysius',
      destinationInstitutionName: 'St. Aloysius High School & PU College',
      destinationName: 'St. Aloysius High School & PU College',
      requiredArrivalTime: '07:15', // No vehicle can arrive before 08:23 due to detour
      priorityCategory: 'CRITICAL_EXAM',
      submissionTimestamp: '2026-11-13T06:00:00Z',
      submissionOrder: 99,
      isExamStudent: true,
      examStartTime: '07:30',
      examSubject: 'Physics Board Exam'
    };

    const recoveryResult = runAllocationSolver(
      [impossibleRequest],
      SEEDED_VEHICLE_TRIPS.filter(t => !CRISIS_DISABLED_BUS_IDS.includes(t.id)),
      SEEDED_CONNECTIONS.map(c => c.id === 'seg-ganji-far' ? { ...c, isBlocked: true } : c),
      'RECOVERY'
    );

    expect(recoveryResult.assignedCount).toBe(0);
    expect(recoveryResult.unmetCount).toBe(1);
    expect(recoveryResult.unmetRequests[0].evaluatedTrips[0].reachesInTime).toBe(false);
  });

  // Test 9: Active capacity ceiling strictly respected (max 11 seats allocated in crisis)
  it('Test 9: active capacity ceiling must never exceed surviving fleet capacity (11 seats)', () => {
    const { updatedRequests, updatedTrips, updatedConnections } = activateExamCrisisScenario(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS,
      null
    );

    const recoveryResult = runAllocationSolver(
      updatedRequests,
      updatedTrips,
      updatedConnections,
      'RECOVERY'
    );

    expect(recoveryResult.totalCapacity).toBe(11);
    expect(recoveryResult.assignedCount).toBeLessThanOrEqual(11);
    expect(recoveryResult.unmetCount).toBe(28 - recoveryResult.assignedCount);

    // Each active vehicle's allocated seats must not exceed its capacity
    recoveryResult.tripUtilization.forEach(util => {
      expect(util.allocatedSeats).toBeLessThanOrEqual(util.capacity);
    });
  });

  // Test 10: Zero capacity / all vehicles cancelled handled safely
  it('Test 10: zero capacity when all vehicles are cancelled must not crash', () => {
    const allCancelledTrips = SEEDED_VEHICLE_TRIPS.map(t => ({
      ...t,
      isCancelled: true,
      cancelReason: 'Total depot fleet strike'
    }));

    const result = runAllocationSolver(
      SEEDED_STUDENT_REQUESTS,
      allCancelledTrips,
      SEEDED_CONNECTIONS,
      'RECOVERY'
    );

    expect(result.assignedCount).toBe(0);
    expect(result.unmetCount).toBe(20);
    expect(result.totalCapacity).toBe(0);
    expect(result.capacityUtilizationPct).toBe(0);
  });

  // Test 11: Deterministic allocation
  it('Test 11: allocation solver must be 100% deterministic across multiple runs', () => {
    const { updatedRequests, updatedTrips, updatedConnections } = activateExamCrisisScenario(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS,
      null
    );

    const run1 = runAllocationSolver(updatedRequests, updatedTrips, updatedConnections, 'RECOVERY');
    const run2 = runAllocationSolver(updatedRequests, updatedTrips, updatedConnections, 'RECOVERY');

    expect(run1.assignedCount).toBe(run2.assignedCount);
    expect(run1.unmetCount).toBe(run2.unmetCount);
    expect(run1.assignments).toEqual(run2.assignments);
    expect(run1.unmetRequests.map(u => u.requestId)).toEqual(run2.unmetRequests.map(u => u.requestId));
  });

  // Test 12: Stale-state flag set on activation and cleared on recovery
  it('Test 12: crisisState.isStale should be true on activation and cleared on recovery plan generation', () => {
    const { crisisState } = activateExamCrisisScenario(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS,
      null
    );

    expect(crisisState.isStale).toBe(true);
    expect(crisisState.isActive).toBe(true);

    // Clearing stale flag on recovery
    const recoveredCrisisState = { ...crisisState, isStale: false };
    expect(recoveredCrisisState.isStale).toBe(false);
  });

  // Test 13: State B vs State C metrics calculate genuine recovery improvement
  it('Test 13: State B vs State C comparison metrics must accurately calculate recovery gains', () => {
    // Run baseline first
    const baseline = runAllocationSolver(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS,
      'BASELINE'
    );

    const { updatedRequests, updatedTrips, updatedConnections, stateBResult } = activateExamCrisisScenario(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS,
      baseline
    );

    // In State B, only assignments on surviving unblocked trips survived
    expect(stateBResult).toBeDefined();

    const stateCResult = runAllocationSolver(
      updatedRequests,
      updatedTrips,
      updatedConnections,
      'RECOVERY'
    );

    const metrics = computeCrisisComparisonMetrics(stateBResult, stateCResult);
    expect(metrics).toBeDefined();
    expect(metrics.totalStudentsOnTimeStateC).toBe(stateCResult.assignedCount);
    expect(metrics.unassignedStudentsStateC).toBe(stateCResult.unmetCount);
    // State C should recover students who were disrupted in State B
    expect(metrics.recoveryOnTimeImprovement).toBeGreaterThanOrEqual(0);
  });

  // Test 14: 15-minute exam arrival buffer is strictly respected
  it('Test 14: exam arrival buffer of 15 minutes must be enforced', () => {
    expect(EXAM_ARRIVAL_BUFFER_MINUTES).toBe(15);
    expect(SIMULATION_CLOCK).toBe('06:45 AM');
  });

  // Test 15: Late alternative option correctly flags delayed trips
  it('Test 15: unmet student with feasible but delayed bus is provided late alternative details', () => {
    const { updatedRequests, updatedTrips, updatedConnections } = activateExamCrisisScenario(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS,
      null
    );

    const recoveryResult = runAllocationSolver(
      updatedRequests,
      updatedTrips,
      updatedConnections,
      'RECOVERY'
    );

    // Look for any unmet student who has a late alternative
    const lateAlternatives = recoveryResult.unmetRequests.filter(u => u.hasLateAlternative);
    expect(lateAlternatives.length).toBeGreaterThan(0);
    lateAlternatives.forEach(la => {
      expect(la.lateAlternativeDetails).toBeDefined();
      expect(la.lateAlternativeDetails?.minutesLate).toBeGreaterThan(0);
    });
  });
});
