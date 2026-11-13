import { describe, it, expect } from 'vitest';
import { RoutingService } from '../services/routingService';
import { TrackingService } from '../services/trackingService';
import { SEEDED_CONNECTIONS, SEEDED_VEHICLE_TRIPS, SEEDED_VILLAGES } from '../models/seedData';
import { TransportConnection } from '../types';

describe('Routing & Telematics Tracking Engine', () => {
  it('should find shortest passable path between Farangipete and St. Aloysius', () => {
    const path = RoutingService.findShortestPath(
      'vil-farangipete',
      'inst-aloysius',
      SEEDED_CONNECTIONS,
      true
    );

    expect(path).not.toBeNull();
    expect(path?.pathConnectionIds).toContain('seg-far-aloysius');
    expect(path?.totalDistanceKm).toBe(14);
    expect(path?.totalMinutes).toBe(25);
  });

  it('should detect blocked road and evaluate alternative route detour', () => {
    // Block the Gurupura-Ganjimutt causeway
    const blockedConns: TransportConnection[] = SEEDED_CONNECTIONS.map(c =>
      c.id === 'seg-guru-ganji'
        ? { ...c, isBlocked: true, blockedReason: 'River causeway flooded' }
        : c
    );

    const trip03 = SEEDED_VEHICLE_TRIPS.find(t => t.id === 'trip-03')!;
    const alt = RoutingService.evaluateAlternativeRoute(trip03, blockedConns);

    // Trip 03 default path has seg-guru-ganji which is blocked
    expect(alt.tripId).toBe('trip-03');
    expect(alt.originalPathConnectionIds).toContain('seg-guru-ganji');
  });

  it('should calculate accurate ETAs based on speed and distance', () => {
    const eta1 = TrackingService.calculateETA(38, 38); // 38 km at 38 km/h = 1 hour = 60 mins
    expect(eta1).toBe(60);

    const eta2 = TrackingService.calculateETA(19, 38); // 19 km at 38 km/h = 0.5 hour = 30 mins
    expect(eta2).toBe(30);

    const etaZero = TrackingService.calculateETA(0, 38);
    expect(etaZero).toBe(0);
  });

  it('should interpolate GPS coordinates along waypoints correctly', () => {
    const waypoints: [number, number][] = [
      [12.8530, 74.9040],
      [12.8680, 74.9602]
    ];

    // Start
    const posStart = TrackingService.interpolatePosition(waypoints, 0);
    expect(posStart.lat).toBe(12.853);
    expect(posStart.lng).toBe(74.904);

    // Midpoint
    const posMid = TrackingService.interpolatePosition(waypoints, 0.5);
    expect(posMid.lat).toBeCloseTo((12.853 + 12.868) / 2, 4);
    expect(posMid.lng).toBeCloseTo((74.904 + 74.9602) / 2, 4);

    // End
    const posEnd = TrackingService.interpolatePosition(waypoints, 1.0);
    expect(posEnd.lat).toBe(12.868);
    expect(posEnd.lng).toBe(74.9602);
  });

  it('should suggest alternative assembly points when a hamlet corridor is cut off', () => {
    const blockedConns: TransportConnection[] = SEEDED_CONNECTIONS.map(c =>
      c.id === 'seg-pav-far' ? { ...c, isBlocked: true } : c
    );

    const suggestion = RoutingService.suggestAlternativePickupPoints(
      'vil-pavoor',
      SEEDED_VILLAGES,
      blockedConns
    );

    expect(suggestion).toBeDefined();
    expect(suggestion).toContain('Pavoor');
    expect(suggestion).toContain('Farangipete');
  });
});
