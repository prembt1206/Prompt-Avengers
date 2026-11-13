/**
 * RouteLess Local Storage & State Persistence Service
 * 
 * Manages local persistence with zero-dependency browser fallback,
 * while safely isolating demonstration records.
 */

import {
  StudentRequest,
  VehicleTrip,
  TransportConnection,
  AllocationResult,
  UserProfile,
  UserRole
} from '../types';
import {
  SEEDED_STUDENT_REQUESTS,
  SEEDED_VEHICLE_TRIPS,
  SEEDED_CONNECTIONS,
  SEEDED_USERS
} from '../models/seedData';

const KEYS = {
  REQUESTS: 'routeless_mangaluru_requests_v2',
  TRIPS: 'routeless_mangaluru_trips_v2',
  CONNECTIONS: 'routeless_mangaluru_connections_v2',
  BASELINE: 'routeless_mangaluru_baseline_v2',
  RECOVERY: 'routeless_mangaluru_recovery_v2',
  USER_VIEW: 'routeless_mangaluru_user_view_v2',
  USERS: 'routeless_users_v2',
  ACTIVE_USER: 'routeless_current_user_v2'
};

export const StorageService = {
  getRequests(): StudentRequest[] {
    if (typeof localStorage === 'undefined') return [...SEEDED_STUDENT_REQUESTS];
    try {
      const data = localStorage.getItem(KEYS.REQUESTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Could not read requests from localStorage', e);
    }
    return [...SEEDED_STUDENT_REQUESTS];
  },

  saveRequests(requests: StudentRequest[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.warn('Could not save requests to localStorage', e);
    }
  },

  getTrips(): VehicleTrip[] {
    if (typeof localStorage === 'undefined') return JSON.parse(JSON.stringify(SEEDED_VEHICLE_TRIPS));
    try {
      const data = localStorage.getItem(KEYS.TRIPS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Could not read trips from localStorage', e);
    }
    return JSON.parse(JSON.stringify(SEEDED_VEHICLE_TRIPS));
  },

  saveTrips(trips: VehicleTrip[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(KEYS.TRIPS, JSON.stringify(trips));
    } catch (e) {
      console.warn('Could not save trips to localStorage', e);
    }
  },

  getConnections(): TransportConnection[] {
    if (typeof localStorage === 'undefined') return JSON.parse(JSON.stringify(SEEDED_CONNECTIONS));
    try {
      const data = localStorage.getItem(KEYS.CONNECTIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Could not read connections from localStorage', e);
    }
    return JSON.parse(JSON.stringify(SEEDED_CONNECTIONS));
  },

  saveConnections(connections: TransportConnection[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(KEYS.CONNECTIONS, JSON.stringify(connections));
    } catch (e) {
      console.warn('Could not save connections to localStorage', e);
    }
  },

  getBaselineResult(): AllocationResult | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const data = localStorage.getItem(KEYS.BASELINE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Could not read baseline result from localStorage', e);
    }
    return null;
  },

  saveBaselineResult(result: AllocationResult | null): void {
    if (typeof localStorage === 'undefined') return;
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
    if (typeof localStorage === 'undefined') return null;
    try {
      const data = localStorage.getItem(KEYS.RECOVERY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Could not read recovery result from localStorage', e);
    }
    return null;
  },

  saveRecoveryResult(result: AllocationResult | null): void {
    if (typeof localStorage === 'undefined') return;
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

  getUserView(): 'COORDINATOR' | 'STUDENT' | 'ADMINISTRATOR' {
    if (typeof localStorage === 'undefined') return 'COORDINATOR';
    try {
      const data = localStorage.getItem(KEYS.USER_VIEW);
      if (data === 'COORDINATOR' || data === 'STUDENT' || data === 'ADMINISTRATOR') return data;
    } catch (e) {
      console.warn('Could not read user view from localStorage', e);
    }
    return 'COORDINATOR';
  },

  saveUserView(view: 'COORDINATOR' | 'STUDENT' | 'ADMINISTRATOR'): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(KEYS.USER_VIEW, view);
    } catch (e) {
      console.warn('Could not save user view to localStorage', e);
    }
  },

  getUsers(): UserProfile[] {
    if (typeof localStorage === 'undefined') return [...SEEDED_USERS];
    try {
      const data = localStorage.getItem(KEYS.USERS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Could not read users from storage', e);
    }
    return [...SEEDED_USERS];
  },

  saveUsers(users: UserProfile[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('Could not save users to storage', e);
    }
  },

  /**
   * Resets all entities back to clean initial seed data.
   */
  resetAllToDefaults(): {
    requests: StudentRequest[];
    trips: VehicleTrip[];
    connections: TransportConnection[];
  } {
    const cleanRequests = [...SEEDED_STUDENT_REQUESTS];
    const cleanTrips = JSON.parse(JSON.stringify(SEEDED_VEHICLE_TRIPS));
    const cleanConnections = JSON.parse(JSON.stringify(SEEDED_CONNECTIONS));

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(KEYS.REQUESTS, JSON.stringify(cleanRequests));
        localStorage.setItem(KEYS.TRIPS, JSON.stringify(cleanTrips));
        localStorage.setItem(KEYS.CONNECTIONS, JSON.stringify(cleanConnections));
        localStorage.removeItem(KEYS.BASELINE);
        localStorage.removeItem(KEYS.RECOVERY);
        localStorage.removeItem('routeless_audit_logs_v2');
        localStorage.removeItem('routeless_notifications_v2');
      } catch (e) {
        console.warn('Could not reset localStorage data', e);
      }
    }

    return {
      requests: cleanRequests,
      trips: cleanTrips,
      connections: cleanConnections
    };
  }
};
