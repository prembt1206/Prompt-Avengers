import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { NoticeBanner } from './components/NoticeBanner';
import { StudentPortal } from './components/StudentView/StudentPortal';
import { CoordinatorDashboard } from './components/CoordinatorView/CoordinatorDashboard';
import { AdminDashboard } from './components/AdminView/AdminDashboard';
import { DemoScriptModal } from './components/CoordinatorView/DemoScriptModal';
import { NotificationCenterModal } from './components/Notifications/NotificationCenterModal';
import { StorageService } from './services/storageService';
import { runAllocationSolver, computeAllocationDiff } from './services/allocationSolver';
import { AuthService } from './services/authService';
import { AuditService } from './services/auditService';
import { NotificationService } from './services/notificationService';
import { SEEDED_VILLAGES, SEEDED_INSTITUTIONS } from './models/seedData';
import {
  StudentRequest,
  VehicleTrip,
  TransportConnection,
  AllocationResult,
  UserRole
} from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'COORDINATOR' | 'STUDENT' | 'ADMINISTRATOR'>(() =>
    StorageService.getUserView()
  );

  const [villages] = useState(SEEDED_VILLAGES);
  const [institutions] = useState(SEEDED_INSTITUTIONS);

  const [requests, setRequests] = useState<StudentRequest[]>(() =>
    StorageService.getRequests()
  );
  const [trips, setTrips] = useState<VehicleTrip[]>(() =>
    StorageService.getTrips()
  );
  const [connections, setConnections] = useState<TransportConnection[]>(() =>
    StorageService.getConnections()
  );

  const [baselineResult, setBaselineResult] = useState<AllocationResult | null>(() =>
    StorageService.getBaselineResult()
  );
  const [recoveryResult, setRecoveryResult] = useState<AllocationResult | null>(() =>
    StorageService.getRecoveryResult()
  );

  const [currentResult, setCurrentResult] = useState<AllocationResult | null>(null);
  const [isDemoScriptOpen, setIsDemoScriptOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentUser = AuthService.getCurrentUser();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Run initial baseline allocation on first load if none exists
  useEffect(() => {
    if (!baselineResult) {
      const initialBaseline = runAllocationSolver(requests, trips, connections, 'BASELINE');
      setBaselineResult(initialBaseline);
      StorageService.saveBaselineResult(initialBaseline);
      setCurrentResult(initialBaseline);
    } else {
      setCurrentResult(recoveryResult || baselineResult);
    }
  }, []);

  const handleViewChange = (view: 'COORDINATOR' | 'STUDENT' | 'ADMINISTRATOR') => {
    setCurrentView(view);
    StorageService.saveUserView(view);
  };

  const handleRunBaseline = () => {
    const res = runAllocationSolver(requests, trips, connections, 'BASELINE');
    setBaselineResult(res);
    StorageService.saveBaselineResult(res);
    setCurrentResult(res);

    AuditService.record(
      currentUser.name,
      currentUser.role,
      'BASELINE_SOLVER_RUN',
      `Executed deterministic baseline allocation: ${res.assignedCount}/${res.totalRequests} accommodated, ${res.unmetCount} unmet demand.`
    );

    showToast(`✓ Baseline Allocation completed: ${res.assignedCount} assigned, ${res.unmetCount} unmet.`);
  };

  const handleRunRecovery = () => {
    const res = runAllocationSolver(requests, trips, connections, 'RECOVERY');
    setRecoveryResult(res);
    StorageService.saveRecoveryResult(res);
    setCurrentResult(res);

    // Compute diff and trigger emergency notifications
    if (baselineResult) {
      const diff = computeAllocationDiff(baselineResult, res);
      NotificationService.handleRecoveryCompleted(res, diff);
    }

    AuditService.record(
      currentUser.name,
      currentUser.role,
      'RECOVERY_SOLVER_RUN',
      `Executed disruption recovery allocation: ${res.assignedCount}/${res.totalRequests} accommodated (${res.capacityUtilizationPct}% seat utilization).`
    );

    showToast(`✓ Recovery Allocation completed: ${res.assignedCount} assigned, ${res.unmetCount} unmet.`);
  };

  const handleUpdateTripCapacity = (tripId: string, newCapacity: number) => {
    const updated = trips.map(t =>
      t.id === tripId ? { ...t, capacity: newCapacity } : t
    );
    setTrips(updated);
    StorageService.saveTrips(updated);

    AuditService.record(
      currentUser.name,
      currentUser.role,
      'VEHICLE_CAPACITY_UPDATED',
      `Capacity adjusted to ${newCapacity} seats for ${trips.find(t => t.id === tripId)?.vehicleName}.`
    );

    // Auto-update current allocation dynamically
    const mode = currentResult?.mode || 'BASELINE';
    const res = runAllocationSolver(requests, updated, connections, mode);
    if (mode === 'BASELINE') {
      setBaselineResult(res);
      StorageService.saveBaselineResult(res);
    } else {
      setRecoveryResult(res);
      StorageService.saveRecoveryResult(res);
    }
    setCurrentResult(res);
    showToast(`Capacity updated to ${newCapacity} seats for ${trips.find(t => t.id === tripId)?.vehicleName.split('—')[0]}.`);
  };

  const handleToggleTripCancellation = (tripId: string, cancelReason?: string) => {
    const targetTrip = trips.find(t => t.id === tripId);
    if (!targetTrip) return;

    const willBeCancelled = !targetTrip.isCancelled;
    const reasonText = willBeCancelled ? (cancelReason || 'Mechanical radiator failure / breakdown') : undefined;

    const updated = trips.map(t =>
      t.id === tripId
        ? {
            ...t,
            isCancelled: willBeCancelled,
            cancelReason: reasonText
          }
        : t
    );
    setTrips(updated);
    StorageService.saveTrips(updated);

    // Trigger Notification & Audit
    if (willBeCancelled) {
      const currentAssignments = currentResult?.assignments.filter(a => a.tripId === tripId) || [];
      const survivingTrips = updated.filter(t => !t.isCancelled);
      NotificationService.handleVehicleBreakdown(targetTrip, currentAssignments, survivingTrips);

      AuditService.record(
        currentUser.name,
        currentUser.role,
        'VEHICLE_BREAKDOWN_REPORTED',
        `Vehicle ${targetTrip.vehicleName} reported as disabled: ${reasonText}. Displaced ${currentAssignments.length} student(s).`
      );
    } else {
      AuditService.record(
        currentUser.name,
        currentUser.role,
        'VEHICLE_RESTORED',
        `Vehicle ${targetTrip.vehicleName} repaired and restored to operational service.`
      );
    }

    showToast(
      willBeCancelled
        ? `⚠️ ${targetTrip.vehicleName.split('—')[0]} marked CANCELLED. Click 'Run Recovery Allocation' to reroute.`
        : `✓ ${targetTrip.vehicleName.split('—')[0]} restored to active fleet.`
    );
  };

  const handleToggleConnectionBlocked = (connectionId: string, blockedReason?: string) => {
    const targetConn = connections.find(c => c.id === connectionId);
    if (!targetConn) return;

    const willBeBlocked = !targetConn.isBlocked;
    const reasonText = willBeBlocked ? (blockedReason || 'Phalguni / Netravati river causeway flooded') : undefined;

    const updated = connections.map(c =>
      c.id === connectionId
        ? {
            ...c,
            isBlocked: willBeBlocked,
            blockedReason: reasonText
          }
        : c
    );
    setConnections(updated);
    StorageService.saveConnections(updated);

    // Trigger Notification & Audit
    if (willBeBlocked) {
      const affectedTrips = trips.filter(t => t.pathConnectionIds.includes(connectionId));
      const affectedReqs = requests.filter(r => r.originVillageId === targetConn.fromId || r.originVillageId === targetConn.toId);
      NotificationService.handleRoadBlocked(targetConn, affectedTrips, affectedReqs);

      AuditService.record(
        currentUser.name,
        currentUser.role,
        'ROAD_CORRIDOR_BLOCKED',
        `Corridor ${targetConn.fromName} ↔ ${targetConn.toName} marked blocked: ${reasonText}.`
      );
    } else {
      AuditService.record(
        currentUser.name,
        currentUser.role,
        'ROAD_CORRIDOR_REOPENED',
        `Corridor ${targetConn.fromName} ↔ ${targetConn.toName} reopened to transit.`
      );
    }

    showToast(
      willBeBlocked
        ? `⛔ Corridor ${targetConn.fromName} ↔ ${targetConn.toName} marked BLOCKED. Click 'Run Recovery Allocation' to reroute.`
        : `✓ Corridor ${targetConn.fromName} ↔ ${targetConn.toName} reopened.`
    );
  };

  const handleApplyScenario = (
    updatedTrips: VehicleTrip[],
    updatedConnections: TransportConnection[],
    scenarioName: string,
    updatedRequests?: StudentRequest[]
  ) => {
    setTrips(updatedTrips);
    setConnections(updatedConnections);
    StorageService.saveTrips(updatedTrips);
    StorageService.saveConnections(updatedConnections);

    let activeRequests = requests;
    if (updatedRequests) {
      activeRequests = updatedRequests;
      setRequests(updatedRequests);
      StorageService.saveRequests(updatedRequests);
    }

    AuditService.record(
      currentUser.name,
      currentUser.role,
      'DISRUPTION_PRESET_APPLIED',
      `Applied emergency preset: ${scenarioName}.`
    );

    showToast(`Applied preset: ${scenarioName}. Click 'Run Recovery Allocation' to execute.`);
  };

  const handleSubmitStudentRequest = (newRequest: StudentRequest) => {
    const updated = [newRequest, ...requests];
    setRequests(updated);
    StorageService.saveRequests(updated);

    AuditService.record(
      newRequest.studentName,
      'STUDENT',
      'STUDENT_REQUEST_SUBMITTED',
      `New request submitted from ${newRequest.originVillageName} to ${newRequest.destinationName} (${newRequest.priorityCategory}).`
    );

    // Re-run current allocation with new request
    const mode = currentResult?.mode || 'BASELINE';
    const res = runAllocationSolver(updated, trips, connections, mode);
    if (mode === 'BASELINE') {
      setBaselineResult(res);
      StorageService.saveBaselineResult(res);
    } else {
      setRecoveryResult(res);
      StorageService.saveRecoveryResult(res);
    }
    setCurrentResult(res);
    showToast(`✓ Transport request registered for ${newRequest.studentName}!`);
  };

  // Fleet CRUD Handlers
  const handleAddVehicle = (newTrip: VehicleTrip) => {
    const updated = [...trips, newTrip];
    setTrips(updated);
    StorageService.saveTrips(updated);

    showToast(`✓ Vehicle ${newTrip.vehicleName} added to fleet with ${newTrip.capacity} seats.`);
  };

  const handleUpdateVehicle = (updatedTrip: VehicleTrip) => {
    const updated = trips.map(t => (t.id === updatedTrip.id ? updatedTrip : t));
    setTrips(updated);
    StorageService.saveTrips(updated);

    // Re-run allocation
    const mode = currentResult?.mode || 'BASELINE';
    const res = runAllocationSolver(requests, updated, connections, mode);
    if (mode === 'BASELINE') {
      setBaselineResult(res);
      StorageService.saveBaselineResult(res);
    } else {
      setRecoveryResult(res);
      StorageService.saveRecoveryResult(res);
    }
    setCurrentResult(res);
    showToast(`✓ Vehicle ${updatedTrip.vehicleName} configuration updated.`);
  };

  const handleDeleteVehicle = (tripId: string) => {
    const updated = trips.filter(t => t.id !== tripId);
    setTrips(updated);
    StorageService.saveTrips(updated);

    // Re-run allocation
    const mode = currentResult?.mode || 'BASELINE';
    const res = runAllocationSolver(requests, updated, connections, mode);
    if (mode === 'BASELINE') {
      setBaselineResult(res);
      StorageService.saveBaselineResult(res);
    } else {
      setRecoveryResult(res);
      StorageService.saveRecoveryResult(res);
    }
    setCurrentResult(res);
    showToast(`✓ Vehicle removed from active fleet.`);
  };

  const handleResetDemo = () => {
    const { requests: defReqs, trips: defTrips, connections: defConns } =
      StorageService.resetAllToDefaults();
    setRequests(defReqs);
    setTrips(defTrips);
    setConnections(defConns);
    setRecoveryResult(null);

    const initialBaseline = runAllocationSolver(defReqs, defTrips, defConns, 'BASELINE');
    setBaselineResult(initialBaseline);
    StorageService.saveBaselineResult(initialBaseline);
    setCurrentResult(initialBaseline);

    AuditService.record(
      currentUser.name,
      currentUser.role,
      'DEMO_RESET',
      'Reset all fleet, roads, and requests back to default seed data.'
    );

    showToast('✓ Demo reset to seeded initial state (17 requests, 3 trips, 0 road blocks).');
  };

  return (
    <div className="app-container">
      {/* Simulation Notice Disclaimer */}
      <NoticeBanner />

      {/* Main Navigation Header */}
      <Navbar
        currentView={currentView}
        onViewChange={handleViewChange}
        onResetDemo={handleResetDemo}
        onOpenDemoScript={() => setIsDemoScriptOpen(true)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#f8fafc',
            padding: '12px 18px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            border: '1px solid #334155',
            zIndex: 9999,
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Main View Router */}
      <main className="main-content" style={{ padding: '20px' }}>
        {currentView === 'COORDINATOR' && (
          <CoordinatorDashboard
            villages={villages}
            institutions={institutions}
            connections={connections}
            trips={trips}
            requests={requests}
            currentResult={currentResult}
            baselineResult={baselineResult}
            recoveryResult={recoveryResult}
            onRunBaseline={handleRunBaseline}
            onRunRecovery={handleRunRecovery}
            onUpdateTripCapacity={handleUpdateTripCapacity}
            onToggleTripCancellation={handleToggleTripCancellation}
            onToggleConnectionBlocked={handleToggleConnectionBlocked}
            onApplyScenario={handleApplyScenario}
            onAddVehicle={handleAddVehicle}
            onUpdateVehicle={handleUpdateVehicle}
            onDeleteVehicle={handleDeleteVehicle}
          />
        )}

        {currentView === 'STUDENT' && (
          <StudentPortal
            villages={villages}
            institutions={institutions}
            requests={requests}
            allocationResult={currentResult}
            onSubmitRequest={handleSubmitStudentRequest}
          />
        )}

        {currentView === 'ADMINISTRATOR' && (
          <AdminDashboard />
        )}
      </main>

      {/* Emergency Notifications Modal */}
      <NotificationCenterModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />

      {/* Evaluator Demo Guide Modal */}
      <DemoScriptModal
        isOpen={isDemoScriptOpen}
        onClose={() => setIsDemoScriptOpen(false)}
        onSwitchToStudentView={() => handleViewChange('STUDENT')}
        onSwitchToCoordinatorView={() => handleViewChange('COORDINATOR')}
        onRunBaseline={handleRunBaseline}
        onTriggerDisruption={() => handleToggleTripCancellation('trip-01', 'Depot radiator crack & cooling failure')}
        onRunRecovery={handleRunRecovery}
        onReset={handleResetDemo}
      />
    </div>
  );
};

export default App;
