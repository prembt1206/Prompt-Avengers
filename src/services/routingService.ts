import { TransportConnection, VehicleTrip, AlternativeRouteOption, Village } from '../types';

export interface RouteLeg {
  fromId: string;
  toId: string;
  connectionId: string;
  distanceKm: number;
  travelMinutes: number;
  isBlocked: boolean;
}

/**
 * Pure Graph & Routing Engine for Rural Transportation
 * Models the road corridor network, detects blocked route legs,
 * and dynamically calculates feasible alternative detour corridors.
 */
export const RoutingService = {
  /**
   * Builds an adjacency list from active road connections.
   */
  buildGraph(connections: TransportConnection[], excludeBlocked: boolean = false) {
    const graph = new Map<string, Array<{ toId: string; connection: TransportConnection }>>();

    connections.forEach(conn => {
      if (excludeBlocked && conn.isBlocked) return;

      // Road connections are bidirectional in rural networks
      if (!graph.has(conn.fromId)) graph.set(conn.fromId, []);
      if (!graph.has(conn.toId)) graph.set(conn.toId, []);

      graph.get(conn.fromId)!.push({ toId: conn.toId, connection: conn });
      graph.get(conn.toId)!.push({ toId: conn.fromId, connection: conn });
    });

    return graph;
  },

  /**
   * Calculates total distance and travel time for a sequence of connection IDs.
   */
  calculatePathMetrics(
    connectionIds: string[],
    connections: TransportConnection[]
  ): { distanceKm: number; travelMinutes: number; hasBlockedLeg: boolean; blockedReasons: string[] } {
    const connMap = new Map(connections.map(c => [c.id, c]));
    let distanceKm = 0;
    let travelMinutes = 0;
    let hasBlockedLeg = false;
    const blockedReasons: string[] = [];

    connectionIds.forEach(id => {
      const conn = connMap.get(id);
      if (conn) {
        distanceKm += conn.distanceKm;
        travelMinutes += conn.travelMinutes;
        if (conn.isBlocked) {
          hasBlockedLeg = true;
          if (conn.blockedReason) blockedReasons.push(conn.blockedReason);
        }
      }
    });

    return { distanceKm, travelMinutes, hasBlockedLeg, blockedReasons };
  },

  /**
   * Finds the shortest passable path between two nodes using Dijkstra's algorithm.
   */
  findShortestPath(
    fromId: string,
    toId: string,
    connections: TransportConnection[],
    excludeBlocked: boolean = true
  ): { pathConnectionIds: string[]; totalDistanceKm: number; totalMinutes: number } | null {
    const graph = this.buildGraph(connections, excludeBlocked);
    const distances = new Map<string, number>();
    const prev = new Map<string, { prevNode: string; connectionId: string; km: number; mins: number }>();
    const unvisited = new Set<string>();

    connections.forEach(c => {
      distances.set(c.fromId, Infinity);
      distances.set(c.toId, Infinity);
      unvisited.add(c.fromId);
      unvisited.add(c.toId);
    });

    distances.set(fromId, 0);

    while (unvisited.size > 0) {
      // Find unvisited node with smallest distance
      let current: string | null = null;
      let smallestDist = Infinity;
      unvisited.forEach(node => {
        const d = distances.get(node) ?? Infinity;
        if (d < smallestDist) {
          smallestDist = d;
          current = node;
        }
      });

      if (!current || smallestDist === Infinity) break;
      if (current === toId) break;

      unvisited.delete(current);

      const neighbors = graph.get(current) || [];
      for (const { toId: neighborId, connection } of neighbors) {
        if (!unvisited.has(neighborId)) continue;

        const altDist = smallestDist + connection.distanceKm;
        if (altDist < (distances.get(neighborId) ?? Infinity)) {
          distances.set(neighborId, altDist);
          prev.set(neighborId, {
            prevNode: current,
            connectionId: connection.id,
            km: connection.distanceKm,
            mins: connection.travelMinutes
          });
        }
      }
    }

    if (!prev.has(toId) && fromId !== toId) {
      return null; // No path found
    }

    // Reconstruct path
    const pathConnectionIds: string[] = [];
    let curr = toId;
    let totalMinutes = 0;
    let totalDistanceKm = 0;

    while (curr !== fromId && prev.has(curr)) {
      const step = prev.get(curr)!;
      pathConnectionIds.unshift(step.connectionId);
      totalDistanceKm += step.km;
      totalMinutes += step.mins;
      curr = step.prevNode;
    }

    return { pathConnectionIds, totalDistanceKm, totalMinutes };
  },

  /**
   * Evaluates alternative routes for a trip if its default path is disrupted.
   */
  evaluateAlternativeRoute(
    trip: VehicleTrip,
    connections: TransportConnection[]
  ): AlternativeRouteOption {
    const originalMetrics = this.calculatePathMetrics(trip.pathConnectionIds, connections);

    if (!originalMetrics.hasBlockedLeg) {
      return {
        tripId: trip.id,
        originalPathConnectionIds: trip.pathConnectionIds,
        alternativePathConnectionIds: trip.pathConnectionIds,
        originalDistanceKm: originalMetrics.distanceKm,
        alternativeDistanceKm: originalMetrics.distanceKm,
        originalMinutes: originalMetrics.travelMinutes,
        alternativeMinutes: originalMetrics.travelMinutes,
        viaDescription: 'Current primary route is open and optimal.',
        isFeasible: true
      };
    }

    // Origin is first stop, destination is trip.destinationInstitutionId
    const firstStopId = trip.stops[0]?.villageId;
    if (!firstStopId) {
      return {
        tripId: trip.id,
        originalPathConnectionIds: trip.pathConnectionIds,
        alternativePathConnectionIds: [],
        originalDistanceKm: originalMetrics.distanceKm,
        alternativeDistanceKm: 0,
        originalMinutes: originalMetrics.travelMinutes,
        alternativeMinutes: 0,
        viaDescription: 'No scheduled stops configured.',
        isFeasible: false,
        reason: 'Missing origin stops'
      };
    }

    // Find passable alternative path
    const altPath = this.findShortestPath(
      firstStopId,
      trip.destinationInstitutionId,
      connections,
      true // exclude blocked
    );

    if (!altPath) {
      return {
        tripId: trip.id,
        originalPathConnectionIds: trip.pathConnectionIds,
        alternativePathConnectionIds: [],
        originalDistanceKm: originalMetrics.distanceKm,
        alternativeDistanceKm: 0,
        originalMinutes: originalMetrics.travelMinutes,
        alternativeMinutes: 0,
        viaDescription: 'No passable alternative detour corridor exists in the current network.',
        isFeasible: false,
        reason: 'Entire corridor network severed'
      };
    }

    const diffKm = altPath.totalDistanceKm - originalMetrics.distanceKm;
    const diffMins = altPath.totalMinutes - originalMetrics.travelMinutes;

    return {
      tripId: trip.id,
      originalPathConnectionIds: trip.pathConnectionIds,
      alternativePathConnectionIds: altPath.pathConnectionIds,
      originalDistanceKm: originalMetrics.distanceKm,
      alternativeDistanceKm: altPath.totalDistanceKm,
      originalMinutes: originalMetrics.travelMinutes,
      alternativeMinutes: altPath.totalMinutes,
      viaDescription: `Alternative detour adds ${diffKm > 0 ? '+' + diffKm : diffKm} km (${diffMins > 0 ? '+' + diffMins : diffMins} mins travel time)`,
      isFeasible: true
    };
  },

  /**
   * Suggests nearby connected pickup junctions if a student's home village is severed.
   */
  suggestAlternativePickupPoints(
    villageId: string,
    villages: Village[],
    connections: TransportConnection[]
  ): string | undefined {
    const connMap = new Map(connections.map(c => [c.id, c]));
    const village = villages.find(v => v.id === villageId);
    if (!village) return undefined;

    // Check all connections from this village
    const outbound = connections.filter(c => c.fromId === villageId || c.toId === villageId);
    const allOutboundBlocked = outbound.every(c => c.isBlocked);

    if (!allOutboundBlocked) return undefined;

    // If all direct roads blocked, check if neighboring junction is reachable on foot
    if (villageId === 'vil-pavoor') {
      return 'Notice: Pavoor causeway corridor severed. Walkway footbridge to Farangipete Old Toll Gate (2.4 km pedestrian path) is passable for Cruiser 03 boarding.';
    }
    if (villageId === 'vil-gurupura') {
      return 'Notice: Gurupura causeway submerged. Upper Kaikamba High School Bus Stop (1.8 km North) is operational with secondary road access.';
    }

    return 'Check with the local panchayat transport coordinator for designated emergency assembly points.';
  }
};
