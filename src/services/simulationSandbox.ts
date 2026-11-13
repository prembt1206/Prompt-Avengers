import {
  StudentRequest,
  VehicleTrip,
  TransportConnection,
  AllocationResult,
  WhatIfScenarioConfig,
  SimulationResult
} from '../types';
import { runAllocationSolver } from './allocationSolver';

export const PRESET_WHAT_IF_SCENARIOS: WhatIfScenarioConfig[] = [
  {
    id: 'scen-single-breakdown',
    name: '1. Single Breakdown: Bus 01 Engine Seizure',
    description: 'KSRTC Bus 01 suffers cooling radiator failure at Pavoor terminal depot.',
    category: 'BREAKDOWN',
    breakdownTripIds: ['trip-01'],
    blockedConnectionIds: []
  },
  {
    id: 'scen-multi-breakdown',
    name: '2. Multi-Breakdown: Fleet Depletion (Bus 01 + Van 02)',
    description: 'Simultaneous mechanical failure of Bus 01 and Van 02, leaving only Cruiser 03 (5 seats) operational.',
    category: 'BREAKDOWN',
    breakdownTripIds: ['trip-01', 'trip-02'],
    blockedConnectionIds: []
  },
  {
    id: 'scen-single-roadblock',
    name: '3. Single Roadblock: Gurupura River Causeway Submerged',
    description: 'Flash monsoon runoff submerges the Phalguni river crossing (seg-guru-ganji) under 2.5 ft of water.',
    category: 'CLOSURE',
    breakdownTripIds: [],
    blockedConnectionIds: ['seg-guru-ganji']
  },
  {
    id: 'scen-multi-roadblock',
    name: '4. Dual Roadblock: River Valleys Severed (Gurupura + Pavoor)',
    description: 'Simultaneous mudslide on Pavoor gravel corridor and flooding on Gurupura causeway.',
    category: 'CLOSURE',
    breakdownTripIds: [],
    blockedConnectionIds: ['seg-guru-ganji', 'seg-pav-far']
  },
  {
    id: 'scen-demand-surge',
    name: '5. Student Demand Surge: State Board Exam Day (+6 Requests)',
    description: 'Surge of 6 additional urgent examination candidates from Farangipete and Kalladka.',
    category: 'DEMAND_SURGE',
    breakdownTripIds: [],
    blockedConnectionIds: [],
    demandSurgeCount: 6
  },
  {
    id: 'scen-capacity-cut',
    name: '6. Capacity Curtailment: Fuel Rationing (-30% Seats)',
    description: 'Severe diesel rationing reduces allowable passenger load on all vehicles by 30%.',
    category: 'CAPACITY_CUT',
    breakdownTripIds: [],
    blockedConnectionIds: [],
    capacityReductionPct: 30
  },
  {
    id: 'scen-compound',
    name: '7. Compound Crisis: Flooded Causeway + Bus 01 Breakdown',
    description: 'Worst-case emergency: Gurupura causeway is impassable AND KSRTC Bus 01 is out of commission.',
    category: 'MULTI_DISRUPTION',
    breakdownTripIds: ['trip-01'],
    blockedConnectionIds: ['seg-guru-ganji']
  }
];

export const SimulationSandboxService = {
  /**
   * Executes a what-if disruption simulation without mutating live production state.
   */
  runSimulation(
    scenario: WhatIfScenarioConfig,
    baseRequests: StudentRequest[],
    baseTrips: VehicleTrip[],
    baseConnections: TransportConnection[]
  ): SimulationResult {
    // 1. Deep clone baseline entities
    let simRequests: StudentRequest[] = JSON.parse(JSON.stringify(baseRequests));
    let simTrips: VehicleTrip[] = JSON.parse(JSON.stringify(baseTrips));
    let simConnections: TransportConnection[] = JSON.parse(JSON.stringify(baseConnections));

    // 2. Compute true baseline
    const baselineResult = runAllocationSolver(baseRequests, baseTrips, baseConnections, 'BASELINE');

    // 3. Apply scenario modifications to simulated copy
    if (scenario.breakdownTripIds.length > 0) {
      simTrips = simTrips.map(t => {
        if (scenario.breakdownTripIds.includes(t.id)) {
          return {
            ...t,
            isCancelled: true,
            cancelReason: `What-If Simulation: ${scenario.name}`
          };
        }
        return t;
      });
    }

    if (scenario.blockedConnectionIds.length > 0) {
      simConnections = simConnections.map(c => {
        if (scenario.blockedConnectionIds.includes(c.id)) {
          return {
            ...c,
            isBlocked: true,
            blockedReason: `What-If Simulation: ${scenario.name}`
          };
        }
        return c;
      });
    }

    if (scenario.capacityReductionPct && scenario.capacityReductionPct > 0) {
      const factor = (100 - scenario.capacityReductionPct) / 100;
      simTrips = simTrips.map(t => ({
        ...t,
        capacity: Math.max(1, Math.floor(t.capacity * factor))
      }));
    }

    if (scenario.demandSurgeCount && scenario.demandSurgeCount > 0) {
      const surgeStudents: StudentRequest[] = [];
      for (let i = 1; i <= scenario.demandSurgeCount; i++) {
        surgeStudents.push({
          id: `req-surge-${i}`,
          studentName: `Surge Candidate ${i} (Farangipete)`,
          gradeOrStream: 'Grade 10 (SSLC Exam)',
          originVillageId: 'vil-farangipete',
          originVillageName: 'Farangipete Junction',
          destinationInstitutionId: 'inst-aloysius',
          destinationName: 'St. Aloysius High School & PU College',
          destinationInstitutionName: 'St. Aloysius High School & PU College',
          requiredArrivalTime: '08:30',
          priorityCategory: 'CRITICAL_EXAM',
          submissionTimestamp: new Date().toISOString(),
          notes: 'Emergency walk-in board exam candidate'
        });
      }
      simRequests = [...surgeStudents, ...simRequests];
    }

    // 4. Run recovery solver on simulated sandbox
    const simulatedResult = runAllocationSolver(simRequests, simTrips, simConnections, 'RECOVERY');

    // 5. Calculate comparison deltas
    const baselineAssignedMap = new Map(baselineResult.assignments.map(a => [a.requestId, a]));
    const simulatedAssignedMap = new Map(simulatedResult.assignments.map(a => [a.requestId, a]));

    // Stranded students: was assigned in baseline, now unmet in simulation
    const stranded = simulatedResult.unmetRequests.filter(u => baselineAssignedMap.has(u.requestId));

    // Recovered / newly routed students
    const recovered = simulatedResult.assignments.filter(a => {
      const bAss = baselineAssignedMap.get(a.requestId);
      return !bAss || bAss.tripId !== a.tripId;
    });

    const recoveryRatePct = baselineResult.assignedCount > 0
      ? Math.round((simulatedResult.assignedCount / baselineResult.assignedCount) * 100)
      : 100;

    const baselineActiveCapacity = baseTrips.filter(t => !t.isCancelled).reduce((sum, t) => sum + t.capacity, 0);
    const simulatedActiveCapacity = simTrips.filter(t => !t.isCancelled).reduce((sum, t) => sum + t.capacity, 0);

    const capacityLossPct = baselineActiveCapacity > 0
      ? Math.round(((baselineActiveCapacity - simulatedActiveCapacity) / baselineActiveCapacity) * 100)
      : 0;

    return {
      scenarioName: scenario.name,
      baseline: baselineResult,
      simulated: simulatedResult,
      strandedStudents: stranded,
      recoveredStudents: recovered,
      recoveryRatePct,
      capacityLossPct
    };
  }
};
