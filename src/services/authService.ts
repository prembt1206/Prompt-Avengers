import { UserProfile, UserRole } from '../types';
import { SEEDED_USERS } from '../models/seedData';
import { AuditService } from './auditService';

class AuthServiceImpl {
  private currentUser: UserProfile;
  private users: UserProfile[] = [...SEEDED_USERS];
  private listeners: Set<(user: UserProfile) => void> = new Set();

  constructor() {
    this.currentUser = this.loadInitialUser();
  }

  private loadInitialUser(): UserProfile {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('routeless_current_user_v2');
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {
      // safe fallback
    }
    // Default to Coordinator for evaluator cockpit
    return SEEDED_USERS[0];
  }

  public getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  public setCurrentUser(user: UserProfile) {
    this.currentUser = user;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('routeless_current_user_v2', JSON.stringify(user));
      }
    } catch (e) {
      // safe fallback
    }
    AuditService.record(
      user.name,
      user.role,
      'USER_SWITCHED',
      `Active user session changed to ${user.name} (${user.role}).`
    );
    this.notifyListeners();
  }

  public getUsers(): UserProfile[] {
    return [...this.users];
  }

  public registerUser(profile: Omit<UserProfile, 'id'>): UserProfile {
    const newUser: UserProfile = {
      ...profile,
      id: `usr-${Date.now()}`
    };
    this.users.push(newUser);
    AuditService.record(
      newUser.name,
      newUser.role,
      'USER_REGISTERED',
      `New ${newUser.role.toLowerCase()} account created for ${newUser.name}.`
    );
    return newUser;
  }

  public switchRole(role: UserRole) {
    const target = this.users.find(u => u.role === role) || {
      id: `usr-${role.toLowerCase()}`,
      username: role.toLowerCase(),
      name: role === 'COORDINATOR' ? 'Pooja Hegde (Coordinator)' : role === 'ADMINISTRATOR' ? 'Regional Admin' : 'Student User',
      role
    };
    this.setCurrentUser(target);
  }

  // Permission checkers
  public canManageFleet(user: UserProfile = this.currentUser): boolean {
    return user.role === 'COORDINATOR' || user.role === 'ADMINISTRATOR';
  }

  public canReportDisruptions(user: UserProfile = this.currentUser): boolean {
    return user.role === 'COORDINATOR' || user.role === 'ADMINISTRATOR';
  }

  public canRunSolver(user: UserProfile = this.currentUser): boolean {
    return user.role === 'COORDINATOR' || user.role === 'ADMINISTRATOR';
  }

  public canAccessAuditLogs(user: UserProfile = this.currentUser): boolean {
    return user.role === 'ADMINISTRATOR' || user.role === 'COORDINATOR';
  }

  public canAccessAdminSettings(user: UserProfile = this.currentUser): boolean {
    return user.role === 'ADMINISTRATOR';
  }

  public canViewAllStudentRequests(user: UserProfile = this.currentUser): boolean {
    return user.role === 'COORDINATOR' || user.role === 'ADMINISTRATOR';
  }

  public subscribe(listener: (user: UserProfile) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => {
      try {
        l(this.currentUser);
      } catch (e) {
        console.error('Auth listener error', e);
      }
    });
  }
}

export const AuthService = new AuthServiceImpl();
