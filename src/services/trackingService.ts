import { VehicleTrip, VehicleStatus, TransportConnection, TripStop } from '../types';

export interface TelemetryUpdate {
  tripId: string;
  lat: number;
  lng: number;
  speedKmh: number;
  status: VehicleStatus;
  progress: number; // 0.0 to 1.0
  currentStopName: string;
  estimatedArrivalMinutes: number;
  timestamp: string;
  isSimulated: boolean;
}

export type TelemetryListener = (updates: Map<string, TelemetryUpdate>) => void;

/**
 * Vehicle Tracking & Telematics Service
 * 
 * Provides live fleet telemetry, ETA calculations, and a simulated GPS playback engine
 * for demonstration and evaluation. Built with an adapter pattern for seamless
 * plug-in of genuine AIS-140 GPS or Traccar endpoints.
 */
class VehicleTrackingServiceImpl {
  private listeners: Set<TelemetryListener> = new Set();
  private telemetryState: Map<string, TelemetryUpdate> = new Map();
  private isSimulationRunning: boolean = false;
  private simulationIntervalId: any = null;
  private playbackSpeedMultiplier: number = 1;

  /**
   * Calculates estimated arrival time (ETA) in minutes
   * based on route distance (km) and operational travel speed (km/h).
   */
  calculateETA(
    remainingDistanceKm: number,
    averageSpeedKmh: number = 38
  ): number {
    if (averageSpeedKmh <= 0 || remainingDistanceKm <= 0) return 0;
    const hours = remainingDistanceKm / averageSpeedKmh;
    return Math.max(1, Math.round(hours * 60));
  }

  /**
   * Interpolates coordinates along waypoints array given a progress value [0.0 - 1.0].
   */
  interpolatePosition(
    waypoints: [number, number][],
    progress: number
  ): { lat: number; lng: number } {
    if (!waypoints || waypoints.length === 0) {
      return { lat: 12.8718, lng: 74.8436 };
    }
    if (waypoints.length === 1 || progress <= 0) {
      return { lat: waypoints[0][0], lng: waypoints[0][1] };
    }
    if (progress >= 1) {
      const last = waypoints[waypoints.length - 1];
      return { lat: last[0], lng: last[1] };
    }

    const totalSegments = waypoints.length - 1;
    const segmentProgress = progress * totalSegments;
    const segmentIndex = Math.min(Math.floor(segmentProgress), totalSegments - 1);
    const localT = segmentProgress - segmentIndex;

    const [lat1, lng1] = waypoints[segmentIndex];
    const [lat2, lng2] = waypoints[segmentIndex + 1];

    return {
      lat: Number((lat1 + (lat2 - lat1) * localT).toFixed(6)),
      lng: Number((lng1 + (lng2 - lng1) * localT).toFixed(6))
    };
  }

  /**
   * Initializes or updates telemetry state for all vehicle trips.
   */
  syncWithTrips(trips: VehicleTrip[], connections: TransportConnection[]): void {
    const connMap = new Map(connections.map(c => [c.id, c]));

    trips.forEach(trip => {
      // Gather all waypoints along this trip's path
      const allWaypoints: [number, number][] = [];
      trip.pathConnectionIds.forEach(connId => {
        const conn = connMap.get(connId);
        if (conn?.waypoints) {
          allWaypoints.push(...conn.waypoints);
        }
      });

      const currentProgress = trip.simulatedProgress ?? 0.15;
      const pos = allWaypoints.length > 0
        ? this.interpolatePosition(allWaypoints, currentProgress)
        : trip.currentLocation
          ? { lat: trip.currentLocation.lat, lng: trip.currentLocation.lng }
          : { lat: 12.8680, lng: 74.9602 };

      let status: VehicleStatus = trip.status || (trip.isCancelled ? 'Breakdown' : 'On Route');

      this.telemetryState.set(trip.id, {
        tripId: trip.id,
        lat: pos.lat,
        lng: pos.lng,
        speedKmh: trip.isCancelled ? 0 : (trip.speedKmh || 38),
        status,
        progress: currentProgress,
        currentStopName: trip.currentLocation?.description || trip.stops[0]?.villageName || 'In Transit',
        estimatedArrivalMinutes: trip.estimatedArrivalMinutes || 35,
        timestamp: new Date().toISOString(),
        isSimulated: true
      });
    });

    this.notifyListeners();
  }

  /**
   * Starts or stops the simulated GPS tracking loop.
   */
  setSimulationRunning(running: boolean, trips: VehicleTrip[], connections: TransportConnection[]) {
    this.isSimulationRunning = running;
    if (this.simulationIntervalId) {
      clearInterval(this.simulationIntervalId);
      this.simulationIntervalId = null;
    }

    if (running) {
      const connMap = new Map(connections.map(c => [c.id, c]));

      this.simulationIntervalId = setInterval(() => {
        trips.forEach(trip => {
          if (trip.isCancelled) return; // Do not move broken down vehicles

          const current = this.telemetryState.get(trip.id);
          if (!current) return;

          // Gather waypoints
          const allWaypoints: [number, number][] = [];
          trip.pathConnectionIds.forEach(connId => {
            const conn = connMap.get(connId);
            if (conn?.waypoints) allWaypoints.push(...conn.waypoints);
          });

          // Increment progress smoothly
          let nextProgress = current.progress + (0.015 * this.playbackSpeedMultiplier);
          if (nextProgress > 1.0) nextProgress = 0.05; // Loop back for demo

          const newPos = this.interpolatePosition(allWaypoints, nextProgress);
          const remainingPct = 1 - nextProgress;
          const totalDistanceKm = 24; // Average rural trip distance
          const remainingKm = Math.max(0, totalDistanceKm * remainingPct);
          const etaMins = this.calculateETA(remainingKm, trip.speedKmh || 38);

          this.telemetryState.set(trip.id, {
            ...current,
            lat: newPos.lat,
            lng: newPos.lng,
            progress: nextProgress,
            estimatedArrivalMinutes: etaMins,
            timestamp: new Date().toISOString()
          });
        });

        this.notifyListeners();
      }, 1000);
    }
  }

  setSpeedMultiplier(multiplier: number) {
    this.playbackSpeedMultiplier = multiplier;
  }

  getSpeedMultiplier(): number {
    return this.playbackSpeedMultiplier;
  }

  isSimulating(): boolean {
    return this.isSimulationRunning;
  }

  getTelemetry(tripId: string): TelemetryUpdate | undefined {
    return this.telemetryState.get(tripId);
  }

  getAllTelemetry(): Map<string, TelemetryUpdate> {
    return new Map(this.telemetryState);
  }

  subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    // Send immediate snapshot
    listener(new Map(this.telemetryState));
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(new Map(this.telemetryState));
      } catch (err) {
        console.error('Error in telemetry listener:', err);
      }
    });
  }
}

export const TrackingService = new VehicleTrackingServiceImpl();
