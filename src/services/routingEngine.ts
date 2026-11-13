/**
 * RouteLess Network Graph & Shortest-Path Routing Engine
 * 
 * Implements deterministic shortest-path route search (Dijkstra) over the rural transport graph.
 * Dynamically avoids blocked connections (e.g. flooded river corridors) and discovers
 * feasible alternative bypass routes with calculated detour travel times.
 */

import { TransportConnection } from '../types';

export interface RouteEdge {
  connectionId: string;
  fromNode: string;
  toNode: string;
  distanceKm: number;
  travelMinutes: number;
  roadType: string;
  isBlocked: boolean;
  blockedReason?: string;
}

export interface PathSearchResult {
  isAccessible: boolean;
  pathNodeIds: string[];
  connectionsUsed: TransportConnection[];
  totalDistanceKm: number;
  totalTravelMinutes: number;
  hasDetour: boolean;
  detourMinutesAdded: number;
  reason?: string;
}

export class TransportNetworkGraph {
  private adjacencyList: Map<string, RouteEdge[]> = new Map();
  private connectionMap: Map<string, TransportConnection> = new Map();

  constructor(connections: TransportConnection[]) {
    this.buildGraph(connections);
  }

  public buildGraph(connections: TransportConnection[]): void {
    this.adjacencyList.clear();
    this.connectionMap.clear();

    connections.forEach(conn => {
      this.connectionMap.set(conn.id, conn);

      // Add forward edge
      const forwardEdge: RouteEdge = {
        connectionId: conn.id,
        fromNode: conn.fromId,
        toNode: conn.toId,
        distanceKm: conn.distanceKm,
        travelMinutes: conn.travelMinutes,
        roadType: conn.roadType,
        isBlocked: conn.isBlocked,
        blockedReason: conn.blockedReason
      };

      if (!this.adjacencyList.has(conn.fromId)) {
        this.adjacencyList.set(conn.fromId, []);
      }
      this.adjacencyList.get(conn.fromId)!.push(forwardEdge);

      // Rural roads are bidirectional corridors
      const backwardEdge: RouteEdge = {
        connectionId: conn.id,
        fromNode: conn.toId,
        toNode: conn.fromId,
        distanceKm: conn.distanceKm,
        travelMinutes: conn.travelMinutes,
        roadType: conn.roadType,
        isBlocked: conn.isBlocked,
        blockedReason: conn.blockedReason
      };

      if (!this.adjacencyList.has(conn.toId)) {
        this.adjacencyList.set(conn.toId, []);
      }
      this.adjacencyList.get(conn.toId)!.push(backwardEdge);
    });
  }

  /**
   * Deterministic Dijkstra shortest path search between startNode and endNode.
   * Excludes any blocked connections.
   * 
   * @param startNode Origin village or waypoint ID
   * @param endNode Destination institution or waypoint ID
   * @param blockedConnectionIds Set of connection IDs currently impassable
   * @param baselineMinutes Optional baseline minutes without disruptions for detour calculation
   */
  public findShortestPath(
    startNode: string,
    endNode: string,
    blockedConnectionIds: Set<string>,
    baselineMinutes?: number
  ): PathSearchResult {
    if (startNode === endNode) {
      return {
        isAccessible: true,
        pathNodeIds: [startNode],
        connectionsUsed: [],
        totalDistanceKm: 0,
        totalTravelMinutes: 0,
        hasDetour: false,
        detourMinutesAdded: 0
      };
    }

    interface NodeQueueItem {
      node: string;
      minutes: number;
      distance: number;
      prevNode: string | null;
      prevEdge: RouteEdge | null;
    }

    const distances = new Map<string, number>();
    const prevNodes = new Map<string, { node: string; edge: RouteEdge } | null>();
    const unvisited = new Set<string>();

    this.adjacencyList.forEach((_, node) => {
      distances.set(node, Infinity);
      prevNodes.set(node, null);
      unvisited.add(node);
    });

    distances.set(startNode, 0);

    while (unvisited.size > 0) {
      // Find node with minimum distance deterministically
      let currNode: string | null = null;
      let minMinutes = Infinity;

      unvisited.forEach(node => {
        const d = distances.get(node) ?? Infinity;
        if (d < minMinutes) {
          minMinutes = d;
          currNode = node;
        } else if (d === minMinutes && currNode !== null && node < currNode) {
          // Stable tie-breaker by node ID
          currNode = node;
        }
      });

      if (!currNode || minMinutes === Infinity) {
        break; // Remaining nodes are unreachable
      }

      if (currNode === endNode) {
        break; // Destination reached
      }

      unvisited.delete(currNode);

      const edges = this.adjacencyList.get(currNode) || [];
      // Sort edges deterministically by connection ID
      const sortedEdges = [...edges].sort((a, b) => a.connectionId.localeCompare(b.connectionId));

      for (const edge of sortedEdges) {
        if (!unvisited.has(edge.toNode)) continue;
        // If blockedConnectionIds is provided, respect it; otherwise fallback to edge.isBlocked
        const isImpassable = blockedConnectionIds
          ? blockedConnectionIds.has(edge.connectionId)
          : edge.isBlocked;
        if (isImpassable) continue;

        const newDist = minMinutes + edge.travelMinutes;
        const currentDist = distances.get(edge.toNode) ?? Infinity;

        if (newDist < currentDist) {
          distances.set(edge.toNode, newDist);
          prevNodes.set(edge.toNode, { node: currNode, edge });
        }
      }
    }

    const totalMinutes = distances.get(endNode) ?? Infinity;
    if (totalMinutes === Infinity) {
      return {
        isAccessible: false,
        pathNodeIds: [],
        connectionsUsed: [],
        totalDistanceKm: 0,
        totalTravelMinutes: 0,
        hasDetour: false,
        detourMinutesAdded: 0,
        reason: 'No accessible route is available. All corridors to destination are impassable or cut off by flooding.'
      };
    }

    // Reconstruct path
    const pathNodeIds: string[] = [];
    const connectionsUsed: TransportConnection[] = [];
    let totalKm = 0;
    let curr: string | null = endNode;

    while (curr && curr !== startNode) {
      pathNodeIds.unshift(curr);
      const prev = prevNodes.get(curr);
      if (prev) {
        const fullConn = this.connectionMap.get(prev.edge.connectionId);
        if (fullConn) {
          connectionsUsed.unshift(fullConn);
          totalKm += prev.edge.distanceKm;
        }
        curr = prev.node;
      } else {
        break;
      }
    }
    pathNodeIds.unshift(startNode);

    const hasDetour = baselineMinutes !== undefined && totalMinutes > baselineMinutes;
    const detourMinutesAdded = hasDetour ? totalMinutes - baselineMinutes! : 0;

    return {
      isAccessible: true,
      pathNodeIds,
      connectionsUsed,
      totalDistanceKm: Math.round(totalKm * 10) / 10,
      totalTravelMinutes: totalMinutes,
      hasDetour,
      detourMinutesAdded
    };
  }
}
