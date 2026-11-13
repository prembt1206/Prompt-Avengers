/**
 * RouteLess Local Storage & State Persistence Service
 * 
 * IMPORTANT DISCLAIMER:
 * LocalStorage persists data solely within the current browser's local origin.
 * It is NOT shared multi-user storage, is NOT an authenticated backend,
 * and MUST NEVER hold real, sensitive personal student information.
 * All data in this application is strictly synthetic demonstration data.
 */

import {
  StudentRequest,
  VehicleTrip,
  TransportConnection,
  AllocationResult
} from '../types';
import {
  SEEDED_STUDENT_REQUESTS,
  SEEDED_VEHICLE_TRIPS,
  SEEDED_CONNECTIONS
} from '../models/seedData';

const KEYS = {
  REQUESTS: 'routeless_mangaluru_requests_v2',
  TRIPS: 'routeless_mangaluru_trips_v2',
  CONNECTIONS: 'routeless_mangaluru_connections_v2',
  BASELINE: 'routeless_mangaluru_baseline_v2',
  RECOVERY: 'routeless_mangaluru_recovery_v2',
  USER_VIEW: 'routeless_mangaluru_user_view_v2'
};

export const StorageService = {
  getRequests(): StudentRequest[] {
    try {
      const data = localStorage.getItem(KEYS.REQUESTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Could not read requests from localStorage', e);
    }
    return [...SEEDED_STUDENT_REQUESTS];
  },

  saveRequests(requests: StudentRequest[]): void {
    try {
      localStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.warn('Could not save requests to localStorage', e);
    }
  },

  getTrips(): VehicleTrip[] {
    try {
      const data = localStorage.getItem(KEYS.TRIPS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Could not read trips from localStorage', e);
    }
    return JSON.parse(JSON.stringify(SEEDED_VEHICLE_TRIPS));
  },

  saveTrips(trips: VehicleTrip[]): void {
    try {
      localStorage.setItem(KEYS.TRIPS, JSON.stringify(trips));
    } catch (e) {
      console.warn('Could not save trips to localStorage', e);
    }
  },

  getConnections(): TransportConnection[] {
    try {
      const data = localStorage.getItem(KEYS.CONNECTIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Could not read connections from localStorage', e);
    }
    return JSON.parse(JSON.stringify(SEEDED_CONNECTIONS));
  },

  saveConnections(connections: TransportConnection[]): void {
    try {
      localStorage.setItem(KEYS.CONNECTIONS, JSON.stringify(connections));
    } catch (e) {
      console.warn('Could not save connections to localStorage', e);
    }
  },

  getBaselineResult(): AllocationResult | null {
    try {
      const data = localStorage.getItem(KEYS.BASELINE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Could not read baseline result from localStorage', e);
    }
    return null;
  },

  saveBaselineResult(result: AllocationResult | null): void {
    try {
      if (result) {
        localStorage.setItem(KEYS.BASELINE, JSON.stringify(result));
      } else {
        localStorage.removeItem(KEYS.BASELINE);
      }
    } catch (e) {
      console.warn('Could not save baseline result to localStorage', e);
    }
  },

  getRecoveryResult(): AllocationResult | null {
    try {
      const data = localStorage.getItem(KEYS.RECOVERY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Could not read recovery result from localStorage', e);
    }
    return null;
  },

  saveRecoveryResult(result: AllocationResult | null): void {
    try {
      if (result) {
        localStorage.setItem(KEYS.RECOVERY, JSON.stringify(result));
      } else {
        localStorage.removeItem(KEYS.RECOVERY);
      }
    } catch (e) {
      console.warn('Could not save recovery result to localStorage', e);
    }
  },

  getUserView(): 'COORDINATOR' | 'STUDENT' {
    try {
      const data = localStorage.getItem(KEYS.USER_VIEW);
      if (data === 'STUDENT' || data === 'COORDINATOR') return data;
    } catch (e) {
      console.warn('Could not read view mode from localStorage', e);
    }
    return 'COORDINATOR';
  },

  saveUserView(view: 'COORDINATOR' | 'STUDENT'): void {
    try {
      localStorage.setItem(KEYS.USER_VIEW, view);
    } catch (e) {
      console.warn('Could not save view mode to localStorage', e);
    }
  },

  resetAllToDefaults(): {
    requests: StudentRequest[];
    trips: VehicleTrip[];
    connections: TransportConnection[];
  } {
    try {
      localStorage.removeItem(KEYS.REQUESTS);
      localStorage.removeItem(KEYS.TRIPS);
      localStorage.removeItem(KEYS.CONNECTIONS);
      localStorage.removeItem(KEYS.BASELINE);
      localStorage.removeItem(KEYS.RECOVERY);
    } catch (e) {
      console.warn('Could not clear localStorage', e);
    }

    return {
      requests: JSON.parse(JSON.stringify(SEEDED_STUDENT_REQUESTS)),
      trips: JSON.parse(JSON.stringify(SEEDED_VEHICLE_TRIPS)),
      connections: JSON.parse(JSON.stringify(SEEDED_CONNECTIONS))
    };
  }
};

