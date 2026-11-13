import { Village, StudentRequest, AllocationResult, VillageFairnessMetric } from '../types';

export interface RegionalFairnessSummary {
  metrics: VillageFairnessMetric[];
  overallFulfillmentPct: number;
  mostVulnerableVillageName: string;
  equityGiniScore: number; // 0 = perfectly equal, 1 = extreme inequality
  systemRecommendations: string[];
}

export const FairnessService = {
  /**
   * Evaluates village-level transport equity from allocation results.
   */
  evaluateFairness(
    villages: Village[],
    requests: StudentRequest[],
    allocationResult: AllocationResult | null
  ): RegionalFairnessSummary {
    const assignments = allocationResult?.assignments || [];
    const unmet = allocationResult?.unmetRequests || [];

    const assignedByVillage = new Map<string, number>();
    assignments.forEach(a => {
      assignedByVillage.set(a.pickupVillageId, (assignedByVillage.get(a.pickupVillageId) || 0) + 1);
    });

    const unmetByVillage = new Map<string, number>();
    unmet.forEach(u => {
      unmetByVillage.set(u.originVillageId, (unmetByVillage.get(u.originVillageId) || 0) + 1);
    });

    const demandByVillage = new Map<string, number>();
    requests.forEach(r => {
      demandByVillage.set(r.originVillageId, (demandByVillage.get(r.originVillageId) || 0) + 1);
    });

    const metrics: VillageFairnessMetric[] = villages.map(village => {
      const totalDemand = demandByVillage.get(village.id) || 0;
      const assignedCount = assignedByVillage.get(village.id) || 0;
      const unmetCount = unmetByVillage.get(village.id) || 0;
      const fulfillmentPct = totalDemand > 0 ? Math.round((assignedCount / totalDemand) * 100) : 100;

      const vulnerabilityReasons: string[] = [];
      let vulnerabilityLevel: VillageFairnessMetric['vulnerabilityLevel'] = 'LOW';
      let recommendation = 'Adequate fleet coverage currently maintained.';

      if (village.connectivityType === 'Vulnerable River Crossing') {
        vulnerabilityReasons.push('Submersible river causeway is prone to monsoon inundation');
      } else if (village.connectivityType === 'Fair-Weather') {
        vulnerabilityReasons.push('Single unpaved gravel corridor with high transit risk');
      }

      if (village.id === 'vil-pavoor') {
        vulnerabilityReasons.push('Single-point-of-failure: served by only 1 scheduled mini-bus trip (Bus 01)');
      }

      if (totalDemand > 0 && fulfillmentPct < 50) {
        vulnerabilityLevel = 'CRITICAL';
        vulnerabilityReasons.push(`Severe seat deficit: ${unmetCount} out of ${totalDemand} students stranded`);
        recommendation = `CRITICAL PRIORITY: Station a dedicated secondary feeder shuttle or re-route spare Maxi-Cab capacity to ${village.name}.`;
      } else if (totalDemand > 0 && fulfillmentPct < 100) {
        vulnerabilityLevel = 'HIGH';
        vulnerabilityReasons.push(`Partial deficit: ${unmetCount} unassigned student requests`);
        recommendation = `Increase morning departure capacity by at least ${unmetCount} seats during peak board examination cycles.`;
      } else if (village.connectivityType === 'Vulnerable River Crossing' || village.id === 'vil-pavoor') {
        vulnerabilityLevel = 'MEDIUM';
        recommendation = `Pre-position emergency backup vehicle near ${village.name} causeway during rainfall alerts.`;
      }

      return {
        villageId: village.id,
        villageName: village.name,
        panchayat: village.panchayat,
        totalDemand,
        assignedCount,
        unmetCount,
        fulfillmentPct,
        connectivityType: village.connectivityType,
        vulnerabilityLevel,
        vulnerabilityReasons,
        recommendation
      };
    });

    // Calculate overall fulfillment
    const totalDem = requests.length;
    const totalAssigned = assignments.length;
    const overallFulfillmentPct = totalDem > 0 ? Math.round((totalAssigned / totalDem) * 100) : 100;

    // Find most vulnerable
    let mostVulnerable = metrics[0]?.villageName || 'None';
    const critical = metrics.filter(m => m.vulnerabilityLevel === 'CRITICAL');
    if (critical.length > 0) {
      mostVulnerable = critical.sort((a, b) => a.fulfillmentPct - b.fulfillmentPct)[0].villageName;
    } else {
      const high = metrics.filter(m => m.vulnerabilityLevel === 'HIGH');
      if (high.length > 0) mostVulnerable = high[0].villageName;
    }

    // Calculate Gini equity coefficient across fulfilled proportions
    const fulfillmentRates = metrics.map(m => m.fulfillmentPct / 100);
    let diffSum = 0;
    for (let i = 0; i < fulfillmentRates.length; i++) {
      for (let j = 0; j < fulfillmentRates.length; j++) {
        diffSum += Math.abs(fulfillmentRates[i] - fulfillmentRates[j]);
      }
    }
    const n = fulfillmentRates.length;
    const meanRate = fulfillmentRates.reduce((a, b) => a + b, 0) / (n || 1);
    const gini = meanRate > 0 ? Math.round((diffSum / (2 * n * n * meanRate)) * 100) / 100 : 0;

    const systemRecommendations: string[] = [];
    if (gini > 0.25) {
      systemRecommendations.push(`Elevated geographic inequality detected (Gini index: ${gini}). Fleet resources are disproportionately concentrated in central corridor nodes.`);
    }
    if (metrics.some(m => m.villageId === 'vil-pavoor' && m.fulfillmentPct === 0)) {
      systemRecommendations.push('Pavoor Riverine Fringe is completely cut off from all educational institutions. Emergency liaison with Gram Panchayat boat crossing advised.');
    }
    if (metrics.some(m => m.villageId === 'vil-gurupura' && m.unmetCount > 0)) {
      systemRecommendations.push('Gurupura riverbank students require high-chassis rural cruiser re-assignment due to low causeway clearance.');
    }

    return {
      metrics,
      overallFulfillmentPct,
      mostVulnerableVillageName: mostVulnerable,
      equityGiniScore: Math.min(1, Math.max(0, gini)),
      systemRecommendations
    };
  }
};
