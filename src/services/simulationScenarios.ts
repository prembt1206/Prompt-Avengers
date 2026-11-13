import { VehicleTrip, TransportConnection } from '../types';

export interface DisruptionScenario {
  id: string;
  name: string;
  badge: string;
  description: string;
  apply: (
    trips: VehicleTrip[],
    connections: TransportConnection[]
  ) => { updatedTrips: VehicleTrip[]; updatedConnections: TransportConnection[] };
}

export const DISRUPTION_SCENARIOS: DisruptionScenario[] = [
  {
    id: 'bus-breakdown',
    name: 'Scenario A: KSRTC Bus 01 Engine Breakdown',
    badge: 'Vehicle Cancellation',
    description: 'KSRTC Sarige Mini-Bus (Trip 01) fails morning start at Farangipete depot with an overheated radiator. Leaves Pavoor Fringe with no service and Farangipete students seeking alternate seats.',
    apply: (trips, connections) => {
      const updatedTrips = trips.map(t =>
        t.id === 'trip-01'
          ? {
              ...t,
              isCancelled: true,
              cancelReason: 'Depot radiator crack & cooling system failure during morning pre-trip check'
            }
          : t
      );
      return { updatedTrips, updatedConnections: [...connections] };
    }
  },
  {
    id: 'causeway-flood',
    name: 'Scenario B: Gurupura Causeway Flash Flood',
    badge: 'Route Blocked',
    description: 'Heavy coastal Western Ghat runoff submerges the Gurupura–Ganjimutt river causeway under 2.5 feet of water. Vehicles cannot reach Gurupura Riverbank settlement.',
    apply: (trips, connections) => {
      const updatedConnections = connections.map(c =>
        c.id === 'seg-guru-ganji'
          ? {
              ...c,
              isBlocked: true,
              blockedReason: 'Phalguni (Gurupura) river causeway submerged under 2.5ft flood runoff; road impassable'
            }
          : c
      );
      return { updatedTrips: [...trips], updatedConnections };
    }
  },
  {
    id: 'cascading-both',
    name: 'Scenario C: Dual Coastal Crisis (Bus Failure + River Flood)',
    badge: 'Cascading Failure',
    description: 'Combined morning coastal monsoon crisis: KSRTC Bus 01 is non-operational AND the Gurupura river causeway is completely flooded. Tests emergency triage under extreme seat deficits.',
    apply: (trips, connections) => {
      const updatedTrips = trips.map(t =>
        t.id === 'trip-01'
          ? {
              ...t,
              isCancelled: true,
              cancelReason: 'Depot engine failure & driver medical emergency'
            }
          : t
      );
      const updatedConnections = connections.map(c =>
        c.id === 'seg-guru-ganji'
          ? {
              ...c,
              isBlocked: true,
              blockedReason: 'Gurupura river causeway submerged under 2.5ft flood runoff'
            }
          : c
      );
      return { updatedTrips, updatedConnections };
    }
  },
  {
    id: 'clear-all',
    name: 'Clear All Disruptions',
    badge: 'Normal Fleet',
    description: 'Clears all vehicle cancellation flags and reopens all blocked road corridors across the Mangaluru suburban network.',
    apply: (trips, connections) => {
      const updatedTrips = trips.map(t => ({
        ...t,
        isCancelled: false,
        cancelReason: undefined
      }));
      const updatedConnections = connections.map(c => ({
        ...c,
        isBlocked: false,
        blockedReason: undefined
      }));
      return { updatedTrips, updatedConnections };
    }
  }
];
