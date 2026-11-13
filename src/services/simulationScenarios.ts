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
    name: 'Scenario A: Bus 01 Engine Breakdown',
    badge: 'Vehicle Cancellation',
    description: 'Yellow Mini-Bus (Trip 01) fails morning start with an overheated radiator. Leaves Kallupatti with no service and Badepalli students seeking alternate seats.',
    apply: (trips, connections) => {
      const updatedTrips = trips.map(t =>
        t.id === 'trip-01'
          ? {
              ...t,
              isCancelled: true,
              cancelReason: 'Radiator crack & engine overheat during depot pre-trip check'
            }
          : t
      );
      return { updatedTrips, updatedConnections: [...connections] };
    }
  },
  {
    id: 'causeway-flood',
    name: 'Scenario B: Sirikonda Causeway Flash Flood',
    badge: 'Route Blocked',
    description: 'Heavy overnight hill runoff submerges the Sirikonda–Mallareddy low-lying causeway under 2 feet of water. Vehicles cannot reach Sirikonda hamlet.',
    apply: (trips, connections) => {
      const updatedConnections = connections.map(c =>
        c.id === 'seg-siri-mal'
          ? {
              ...c,
              isBlocked: true,
              blockedReason: 'River causeway submerged under 2ft runoff; bridge impassable for low-clearance vehicles'
            }
          : c
      );
      return { updatedTrips: [...trips], updatedConnections };
    }
  },
  {
    id: 'cascading-both',
    name: 'Scenario C: Dual Crisis (Bus Breakdown + Flash Flood)',
    badge: 'Cascading Failure',
    description: 'Combined morning crisis: Bus 01 is non-operational AND the Sirikonda river crossing is inundated. Tests maximum resilience triage under severe seat deficits.',
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
        c.id === 'seg-siri-mal'
          ? {
              ...c,
              isBlocked: true,
              blockedReason: 'River causeway submerged under 2ft flood runoff'
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
    description: 'Clears all vehicle cancellation flags and reopens all blocked road connections across the network.',
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
