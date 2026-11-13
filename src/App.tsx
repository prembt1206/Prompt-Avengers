import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { NoticeBanner } from './components/NoticeBanner';
import { StudentRequestForm } from './components/StudentView/StudentRequestForm';
import { StudentRequestList } from './components/StudentView/StudentRequestList';
import { CoordinatorDashboard } from './components/CoordinatorView/CoordinatorDashboard';
import { DemoScriptModal } from './components/CoordinatorView/DemoScriptModal';
import { StorageService } from './services/storageService';
import { runAllocationSolver } from './services/allocationSolver';
import { SEEDED_VILLAGES, SEEDED_INSTITUTIONS } from './models/seedData';
import {
  StudentRequest,
  VehicleTrip,
  TransportConnection,
  AllocationResult
} from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'COORDINATOR' | 'STUDENT'>(() =>
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Run initial baseline allocation on first load if none exists
  useEffect(() => {
    if (!baselineResult) {
      const initialBaseline = runAllocationSolver(requests, trips, connections, 'BASELINE');
      setBaselineResult(initialBaseline);
      StorageService.saveBaselineResult(initialBaseline);
      setCurrentResult(initialBaseline);
    } else {
      // Pick recovery result if it exists, otherwise baseline
      setCurrentResult(recoveryResult || baselineResult);
    }
  }, []);

  const handleViewChange = (view: 'COORDINATOR' | 'STUDENT') => {
    setCurrentView(view);
    StorageService.saveUserView(view);
  };

  const handleRunBaseline = () => {
    const res = runAllocationSolver(requests, trips, connections, 'BASELINE');
    setBaselineResult(res);
    StorageService.saveBaselineResult(res);
    setCurrentResult(res);
    showToast(`✓ Baseline Allocation completed: ${res.assignedCount} assigned, ${res.unmetCount} unmet.`);
  };

  const handleRunRecovery = () => {
    const res = runAllocationSolver(requests, trips, connections, 'RECOVERY');
    setRecoveryResult(res);
    StorageService.saveRecoveryResult(res);
    setCurrentResult(res);
    showToast(`✓ Recovery Allocation completed: ${res.assignedCount} assigned, ${res.unmetCount} unmet.`);
  };

  const handleUpdateTripCapacity = (tripId: string, newCapacity: number) => {
    const updated = trips.map(t =>
      t.id === tripId ? { ...t, capacity: newCapacity } : t
    );
    setTrips(updated);
    StorageService.saveTrips(updated);

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
    const updated = trips.map(t =>
      t.id === tripId
        ? {
            ...t,
            isCancelled: !t.isCancelled,
            cancelReason: !t.isCancelled ? (cancelReason || 'Vehicle breakdown') : undefined
          }
        : t
    );
    setTrips(updated);
    StorageService.saveTrips(updated);

    const changed = updated.find(t => t.id === tripId);
    showToast(
      changed?.isCancelled
        ? `Vehicle ${changed.vehicleName.split('—')[0]} marked CANCELLED. Click 'Run Recovery Allocation' to reroute.`
        : `Vehicle ${changed?.vehicleName.split('—')[0]} restored to active fleet.`
    );
  };

  const handleToggleConnectionBlocked = (connectionId: string, blockedReason?: string) => {
    const updated = connections.map(c =>
      c.id === connectionId
        ? {
            ...c,
            isBlocked: !c.isBlocked,
            blockedReason: !c.isBlocked ? (blockedReason || 'Impassable causeway') : undefined
          }
        : c
    );
    setConnections(updated);
    StorageService.saveConnections(updated);

    const changed = updated.find(c => c.id === connectionId);
    showToast(
      changed?.isBlocked
        ? `Corridor ${changed.fromName} ↔ ${changed.toName} marked BLOCKED. Click 'Run Recovery Allocation' to reroute.`
        : `Corridor ${changed?.fromName} ↔ ${changed?.toName} reopened.`
    );
  };

  const handleApplyScenario = (
    updatedTrips: VehicleTrip[],
    updatedConnections: TransportConnection[],
    scenarioName: string
  ) => {
    setTrips(updatedTrips);
    setConnections(updatedConnections);
    StorageService.saveTrips(updatedTrips);
    StorageService.saveConnections(updatedConnections);
    showToast(`Applied preset: ${scenarioName}. Click 'Run Recovery Allocation' to execute.`);
  };

  const handleSubmitStudentRequest = (newRequest: StudentRequest) => {
    const updated = [newRequest, ...requests];
    setRequests(updated);
    StorageService.saveRequests(updated);

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
    showToast(`New request submitted for ${newRequest.studentName}!`);
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

    showToast('✓ Demo reset to initial seeded state (17 requests, 3 trips, 0 road blocks).');
  };

  return (
    <div className="app-container">
      {/* Required simulation disclaimer on every screen */}
      <NoticeBanner />

      {/* Main navigation & view mode switcher */}
      <Navbar
        currentView={currentView}
        onViewChange={handleViewChange}
        onResetDemo={handleResetDemo}
        onOpenDemoScript={() => setIsDemoScriptOpen(true)}
      />

      {/* Floating feedback toast */}
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
            boxShadow: 'var(--shadow-lg)',
            zIndex: 9999,
            fontSize: '0.85rem',
            fontWeight: 500,
            border: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Main content body */}
      <main className="main-content">
        {currentView === 'COORDINATOR' ? (
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
          />
        ) : (
          <div>
            <StudentRequestForm
              villages={villages}
              institutions={institutions}
              onSubmitRequest={handleSubmitStudentRequest}
            />
            <StudentRequestList
              requests={requests}
              latestAllocation={currentResult}
            />
          </div>
        )}
      </main>

      {/* Walkthrough modal */}
      <DemoScriptModal
        isOpen={isDemoScriptOpen}
        onClose={() => setIsDemoScriptOpen(false)}
        onSwitchToStudentView={() => handleViewChange('STUDENT')}
        onSwitchToCoordinatorView={() => handleViewChange('COORDINATOR')}
        onRunBaseline={handleRunBaseline}
        onTriggerDisruption={() => {
          handleToggleTripCancellation('trip-01', 'Radiator crack & engine overheat during morning depot check');
          handleRunRecovery();
        }}
        onRunRecovery={handleRunRecovery}
        onReset={handleResetDemo}
      />
    </div>
  );
};

export default App;
