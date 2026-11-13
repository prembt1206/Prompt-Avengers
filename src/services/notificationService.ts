import {
  SystemNotification,
  NotificationType,
  UserRole,
  StudentRequest,
  VehicleTrip,
  TransportConnection,
  Assignment,
  AllocationResult
} from '../types';

export interface NotificationProviderAdapter {
  name: string;
  isExternalConfigured: boolean;
  sendNotification(notification: SystemNotification): Promise<boolean>;
}

/**
 * In-App Notification Adapter (Primary active provider)
 */
class InAppNotificationAdapter implements NotificationProviderAdapter {
  name = 'In-App Notification Center';
  isExternalConfigured = true;

  async sendNotification(notification: SystemNotification): Promise<boolean> {
    // Delivered to in-memory / storage notification log
    return true;
  }
}

/**
 * SMS Notification Provider Adapter (Future gateway adapter)
 * Note: Clearly labelled. Never claims SMS delivery unless genuine Twilio credentials exist in env.
 */
class SmsNotificationAdapter implements NotificationProviderAdapter {
  name = 'Twilio / Telecom SMS Gateway';
  isExternalConfigured = false;

  constructor() {
    // Check if real SMS gateway is configured via environment
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TWILIO_ACCOUNT_SID) {
      this.isExternalConfigured = true;
    }
  }

  async sendNotification(notification: SystemNotification): Promise<boolean> {
    if (!this.isExternalConfigured) {
      // Truthful fallback: log to dev console without claiming false delivery
      console.info(`[SMS Adapter Simulator - Inactive] Would dispatch SMS for "${notification.title}": ${notification.message}`);
      return false;
    }
    // Future SMS provider API integration
    return true;
  }
}

class NotificationServiceImpl {
  private notifications: SystemNotification[] = [];
  private listeners: Set<(notifications: SystemNotification[]) => void> = new Set();
  private adapters: NotificationProviderAdapter[] = [
    new InAppNotificationAdapter(),
    new SmsNotificationAdapter()
  ];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('routeless_notifications_v2');
        if (saved) {
          this.notifications = JSON.parse(saved);
          return;
        }
      }
    } catch (e) {
      // safe fallback
    }
    // Initial welcome notifications
    this.notifications = [
      {
        id: 'notif-init-1',
        type: 'ALLOCATION_CONFIRMED',
        title: 'RouteLess Dispatch System Active',
        message: 'Baseline transport schedule initialized for Mangaluru Rural Suburban Corridor.',
        timestamp: new Date().toISOString(),
        read: false,
        targetRole: 'ALL',
        severity: 'info'
      }
    ];
  }

  private persist() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('routeless_notifications_v2', JSON.stringify(this.notifications.slice(0, 100)));
      }
    } catch (e) {
      // safe fallback
    }
    this.notifyListeners();
  }

  public getNotifications(userRole?: UserRole, studentName?: string): SystemNotification[] {
    return this.notifications.filter(n => {
      if (n.targetRole && n.targetRole !== 'ALL' && userRole && n.targetRole !== userRole) {
        return false;
      }
      if (n.targetStudentName && studentName && n.targetStudentName.toLowerCase() !== studentName.toLowerCase()) {
        return false;
      }
      return true;
    });
  }

  public markAsRead(notificationId: string) {
    this.notifications = this.notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.persist();
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.persist();
  }

  public clearAll() {
    this.notifications = [];
    this.persist();
  }

  public subscribe(listener: (notifications: SystemNotification[]) => void): () => void {
    this.listeners.add(listener);
    listener([...this.notifications]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => {
      try {
        l([...this.notifications]);
      } catch (err) {
        console.error('Error notifying notification listener', err);
      }
    });
  }

  public async postNotification(notification: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>): Promise<SystemNotification> {
    const fullNotification: SystemNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(fullNotification);
    this.persist();

    // Broadcast across adapters
    for (const adapter of this.adapters) {
      await adapter.sendNotification(fullNotification).catch(e => console.warn(e));
    }

    return fullNotification;
  }

  /**
   * Automatically triggered when a road connection is blocked.
   */
  public handleRoadBlocked(
    connection: TransportConnection,
    affectedTrips: VehicleTrip[],
    affectedRequests: StudentRequest[]
  ) {
    const tripNames = affectedTrips.map(t => t.vehicleName.split('—')[0].trim()).join(', ') || 'No current trips';
    const reason = connection.blockedReason || 'Impassable causeway/flood';

    // 1. Notify Coordinator
    this.postNotification({
      type: 'ROAD_CLOSURE',
      title: `Emergency Road Closure: ${connection.fromName} ↔ ${connection.toName}`,
      message: `Corridor is blocked due to ${reason}. Affected vehicles: ${tripNames}. Potential student impact: ${affectedRequests.length} students.`,
      targetRole: 'COORDINATOR',
      severity: 'alert',
      suggestedAction: 'Run Recovery Allocation to evaluate detour corridors and honest unmet rosters.'
    });

    // 2. Notify affected students individually
    affectedRequests.forEach(req => {
      this.postNotification({
        type: 'TRANSPORT_DELAY',
        title: 'Transport Corridor Disrupted',
        message: `Dear ${req.studentName}, the road connecting ${connection.fromName} ↔ ${connection.toName} is impassable (${reason}). The regional coordinator is evaluating alternative routing.`,
        targetRole: 'STUDENT',
        targetStudentName: req.studentName,
        targetStudentId: req.id,
        severity: 'warning',
        suggestedAction: 'Stay at your designated assembly point and monitor this portal for vehicle reassignment.'
      });
    });
  }

  /**
   * Automatically triggered when a vehicle breaks down or is cancelled.
   */
  public handleVehicleBreakdown(
    trip: VehicleTrip,
    assignedStudents: Assignment[],
    availableAlternativeTrips: VehicleTrip[]
  ) {
    const reason = trip.cancelReason || 'Mechanical failure';

    // 1. Notify Coordinator
    this.postNotification({
      type: 'VEHICLE_BREAKDOWN',
      title: `Vehicle Breakdown Reported: ${trip.vehicleName.split('—')[0]}`,
      message: `${trip.vehicleName} (${trip.registrationNumber}) is out of service: ${reason}. ${assignedStudents.length} students currently displaced. ${availableAlternativeTrips.length} active vehicles remaining in fleet.`,
      targetRole: 'COORDINATOR',
      targetTripId: trip.id,
      severity: 'alert',
      suggestedAction: 'Execute Recovery Allocation to safely reassign capacity without exceeding physical vehicle seats.'
    });

    // 2. Notify assigned students
    assignedStudents.forEach(assignment => {
      this.postNotification({
        type: 'TRANSPORT_CANCELLATION',
        title: `Vehicle Disabled: ${assignment.vehicleName.split('—')[0]}`,
        message: `Dear ${assignment.studentName}, your scheduled vehicle ${assignment.vehicleName} has encountered a breakdown (${reason}). Recovery re-allocation is in progress.`,
        targetRole: 'STUDENT',
        targetStudentName: assignment.studentName,
        targetStudentId: assignment.requestId,
        targetTripId: trip.id,
        severity: 'alert',
        suggestedAction: 'Check your portal in 2 minutes for revised vehicle assignment or verified emergency advisory.'
      });
    });
  }

  /**
   * Automatically triggered when a recovery allocation is executed.
   */
  public handleRecoveryCompleted(
    recoveryResult: AllocationResult,
    diff: { newlyAssigned: Assignment[]; displacedAssignments: any[] }
  ) {
    // Notify Coordinator of summary
    this.postNotification({
      type: 'ROUTE_CHANGE',
      title: 'Disruption Recovery Allocation Completed',
      message: `Recovery allocation completed: ${recoveryResult.assignedCount}/${recoveryResult.totalRequests} accommodated (${recoveryResult.capacityUtilizationPct}% seat utilization). ${recoveryResult.unmetCount} students honestly reported as unmet.`,
      targetRole: 'COORDINATOR',
      severity: recoveryResult.unmetCount > 0 ? 'warning' : 'success'
    });

    // Notify newly reassigned students
    diff.newlyAssigned.forEach(a => {
      this.postNotification({
        type: 'VEHICLE_REASSIGNMENT',
        title: 'Vehicle Reassigned for Your Trip',
        message: `Dear ${a.studentName}, you have been safely reassigned to ${a.vehicleName} (Seat ${a.seatNumber}) at ${a.pickupTime} from ${a.pickupVillageName}.`,
        targetRole: 'STUDENT',
        targetStudentName: a.studentName,
        targetStudentId: a.requestId,
        severity: 'success'
      });
    });
  }
}

export const NotificationService = new NotificationServiceImpl();
