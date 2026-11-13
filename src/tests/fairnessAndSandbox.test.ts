import { describe, it, expect } from 'vitest';
import { FairnessService } from '../services/fairnessService';
import { SimulationSandboxService, PRESET_WHAT_IF_SCENARIOS } from '../services/simulationSandbox';
import { runAllocationSolver } from '../services/allocationSolver';
import {
  SEEDED_VILLAGES,
  SEEDED_STUDENT_REQUESTS,
  SEEDED_VEHICLE_TRIPS,
  SEEDED_CONNECTIONS
} from '../models/seedData';

describe('Fairness Monitoring & What-If Disruption Sandbox', () => {
  it('should compute village-wise equity metrics and Gini coefficient', () => {
    const baseline = runAllocationSolver(
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS,
      'BASELINE'
    );

    const fairness = FairnessService.evaluateFairness(
      SEEDED_VILLAGES,
      SEEDED_STUDENT_REQUESTS,
      baseline
    );

    expect(fairness.metrics.length).toBe(SEEDED_VILLAGES.length);
    expect(fairness.overallFulfillmentPct).toBeGreaterThan(80);
    expect(fairness.equityGiniScore).toBeGreaterThanOrEqual(0);
    expect(fairness.equityGiniScore).toBeLessThanOrEqual(1);

    // Each village metric must have demand and assigned counts
    fairness.metrics.forEach(m => {
      expect(m.totalDemand).toBeGreaterThan(0);
      expect(m.assignedCount + m.unmetCount).toBe(m.totalDemand);
    });
  });

  it('should run isolated what-if simulation without mutating baseline data', () => {
    const singleBreakdownScenario = PRESET_WHAT_IF_SCENARIOS[0]; // Bus 01 breakdown

    // Snapshot trips count and cancellation states before
    const beforeCancelled = SEEDED_VEHICLE_TRIPS.filter(t => t.isCancelled).length;

    const simResult = SimulationSandboxService.runSimulation(
      singleBreakdownScenario,
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS
    );

    // Baseline inputs must not be mutated!
    const afterCancelled = SEEDED_VEHICLE_TRIPS.filter(t => t.isCancelled).length;
    expect(afterCancelled).toBe(beforeCancelled);

    // Simulation result must report breakdown impact
    expect(simResult.simulated.assignedCount).toBeLessThan(simResult.baseline.assignedCount);
    expect(simResult.strandedStudents.length).toBeGreaterThan(0);
    expect(simResult.capacityLossPct).toBeGreaterThan(0);
  });

  it('should accurately simulate demand surge on exam day', () => {
    const demandSurgeScenario = PRESET_WHAT_IF_SCENARIOS.find(s => s.category === 'DEMAND_SURGE')!;

    const simResult = SimulationSandboxService.runSimulation(
      demandSurgeScenario,
      SEEDED_STUDENT_REQUESTS,
      SEEDED_VEHICLE_TRIPS,
      SEEDED_CONNECTIONS
    );

    expect(simResult.simulated.totalRequests).toBe(
      SEEDED_STUDENT_REQUESTS.length + (demandSurgeScenario.demandSurgeCount || 0)
    );
  });
});
