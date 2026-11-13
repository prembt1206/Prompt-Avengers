import { describe, it, expect } from 'vitest';
import { AuthService } from '../services/authService';
import { NotificationService } from '../services/notificationService';
import { AuditService } from '../services/auditService';
import { SEEDED_CONNECTIONS, SEEDED_VEHICLE_TRIPS, SEEDED_STUDENT_REQUESTS } from '../models/seedData';

describe('RBAC Authentication, Notifications, and Audit Trail', () => {
  it('should enforce proper role-based permissions', () => {
    // Switch to Student
    AuthService.switchRole('STUDENT');
    const studentUser = AuthService.getCurrentUser();
    expect(studentUser.role).toBe('STUDENT');
    expect(AuthService.canManageFleet(studentUser)).toBe(false);
    expect(AuthService.canReportDisruptions(studentUser)).toBe(false);
    expect(AuthService.canAccessAdminSettings(studentUser)).toBe(false);

    // Switch to Coordinator
    AuthService.switchRole('COORDINATOR');
    const coordUser = AuthService.getCurrentUser();
    expect(coordUser.role).toBe('COORDINATOR');
    expect(AuthService.canManageFleet(coordUser)).toBe(true);
    expect(AuthService.canReportDisruptions(coordUser)).toBe(true);
    expect(AuthService.canRunSolver(coordUser)).toBe(true);
    expect(AuthService.canAccessAdminSettings(coordUser)).toBe(false);

    // Switch to Administrator
    AuthService.switchRole('ADMINISTRATOR');
    const adminUser = AuthService.getCurrentUser();
    expect(adminUser.role).toBe('ADMINISTRATOR');
    expect(AuthService.canManageFleet(adminUser)).toBe(true);
    expect(AuthService.canAccessAdminSettings(adminUser)).toBe(true);
    expect(AuthService.canAccessAuditLogs(adminUser)).toBe(true);
  });

  it('should generate emergency notifications when a road is blocked', () => {
    const conn = SEEDED_CONNECTIONS.find(c => c.id === 'seg-guru-ganji')!;
    const affectedTrips = [SEEDED_VEHICLE_TRIPS[2]];
    const affectedReqs = SEEDED_STUDENT_REQUESTS.filter(r => r.originVillageId === 'vil-gurupura');

    NotificationService.handleRoadBlocked(conn, affectedTrips, affectedReqs);

    const coordNotifs = NotificationService.getNotifications('COORDINATOR');
    expect(coordNotifs.some(n => n.type === 'ROAD_CLOSURE')).toBe(true);

    const studentNotifs = NotificationService.getNotifications('STUDENT', 'Prathiksha Prabhu');
    expect(studentNotifs.some(n => n.type === 'TRANSPORT_DELAY')).toBe(true);
  });

  it('should generate breakdown notifications when a vehicle fails', () => {
    const trip = SEEDED_VEHICLE_TRIPS[0];
    const assignments = [
      {
        requestId: 'req-pav-01',
        studentName: 'Deeksha Poojary',
        gradeOrStream: 'Grade 10',
        tripId: 'trip-01',
        vehicleName: 'Bus 01',
        pickupVillageId: 'vil-pavoor',
        pickupVillageName: 'Pavoor',
        dropoffInstitutionId: 'inst-aloysius',
        dropoffInstitutionName: 'St. Aloysius',
        pickupTime: '07:20',
        dropoffTime: '08:15',
        seatNumber: 1,
        priorityCategory: 'CRITICAL_EXAM' as const
      }
    ];

    NotificationService.handleVehicleBreakdown(trip, assignments, [SEEDED_VEHICLE_TRIPS[1], SEEDED_VEHICLE_TRIPS[2]]);

    const studentNotifs = NotificationService.getNotifications('STUDENT', 'Deeksha Poojary');
    expect(studentNotifs.some(n => n.type === 'TRANSPORT_CANCELLATION')).toBe(true);
  });

  it('should record immutable audit logs with role and action details', () => {
    AuditService.record('Test Actor', 'COORDINATOR', 'TEST_DISRUPTION', 'Testing audit log creation.');
    const logs = AuditService.getLogs();
    const testEntry = logs.find(l => l.action === 'TEST_DISRUPTION');

    expect(testEntry).toBeDefined();
    expect(testEntry?.actor).toBe('Test Actor');
    expect(testEntry?.role).toBe('COORDINATOR');
    expect(testEntry?.details).toBe('Testing audit log creation.');
    expect(testEntry?.timestamp).toBeTruthy();
  });
});
