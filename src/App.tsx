import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { NoticeBanner } from './components/NoticeBanner';
import { StudentRequestForm } from './components/StudentView/StudentRequestForm';
import { StudentRequestList } from './components/StudentView/StudentRequestList';
import { CoordinatorDashboard } from './components/CoordinatorView/CoordinatorDashboard';
import { DemoScriptModal } from './components/CoordinatorView/DemoScriptModal';
import { StorageService } from './services/storageService';
import { runAllocationSolver } from './services/allocationSolver';
import {
  activateExamCrisisScenario,
  computeCrisisComparisonMetrics
} from './services/crisisScenario';
import { SEEDED_VILLAGES, SEEDED_INSTITUTIONS } from './models/seedData';
import {
  StudentRequest,
  VehicleTrip,
  TransportConnection,
  AllocationResult,
  ExamCrisisState,
  CrisisComparisonMetrics
} from './types';
import { Zap, Send } from 'lucide-react';

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
  const [stateBResult, setStateBResult] = useState<AllocationResult | null>(() =>
    StorageService.getStateBResult()
  );

  const [crisisState, setCrisisState] = useState<ExamCrisisState | null>(() =>
    StorageService.getCrisisState()
  );

  const [currentResult, setCurrentResult] = useState<AllocationResult | null>(null);
  const [isDemoScriptOpen, setIsDemoScriptOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      if (crisisState?.isActive) {
        setCurrentResult(recoveryResult || stateBResult || baselineResult);
      } else {
        setCurrentResult(recoveryResult || baselineResult);
      }
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

  // Official Exam Day Crisis Activation
  const handleActivateExamCrisis = () => {
    const {
      updatedRequests,
      updatedTrips,
      updatedConnections,
      crisisState: newCrisisState,
      stateBResult: newStateB
    } = activateExamCrisisScenario(
      requests,
      trips,
      connections,
      baselineResult,
      crisisState?.preCrisisSnapshot
    );

    setRequests(updatedRequests);
    setTrips(updatedTrips);
    setConnections(updatedConnections);
    setCrisisState(newCrisisState);
    setStateBResult(newStateB);
    setCurrentResult(newStateB); // Enters State B: allocations stale, recovery pending

    StorageService.saveRequests(updatedRequests);
    StorageService.saveTrips(updatedTrips);
    StorageService.saveConnections(updatedConnections);
    StorageService.saveCrisisState(newCrisisState);
    StorageService.saveStateBResult(newStateB);
    StorageService.saveRecoveryResult(null);

    showToast(
      '🚨 EXAM DAY CRISIS ACTIVATED: 2 Govt buses disabled, Ganjimutt road flooded, +40% demand surge added. Click "Generate Recovery Plan".'
    );
  };

  // Official Crisis Recovery Generation
  const handleGenerateCrisisRecovery = () => {
    const res = runAllocationSolver(requests, trips, connections, 'RECOVERY');
    setRecoveryResult(res);
    StorageService.saveRecoveryResult(res);

    if (crisisState) {
      const updatedCrisisState = { ...crisisState, isStale: false };
      setCrisisState(updatedCrisisState);
      StorageService.saveCrisisState(updatedCrisisState);
    }

    setCurrentResult(res);
    showToast(
      `✓ Emergency Recovery Plan Generated: ${res.assignedCount} students assigned on time (${res.examAssignedOnTimeCount} exam candidates prioritized).`
    );
  };

  // Reset Crisis to Normal Baseline
  const handleResetExamCrisis = () => {
    if (crisisState?.preCrisisSnapshot) {
      const snap = crisisState.preCrisisSnapshot;
      setRequests(snap.requests);
      setTrips(snap.trips);
      setConnections(snap.connections);
      setBaselineResult(snap.baselineResult);
      setRecoveryResult(null);
      setStateBResult(null);
      setCrisisState(null);
      setCurrentResult(snap.baselineResult);

      StorageService.saveRequests(snap.requests);
      StorageService.saveTrips(snap.trips);
      StorageService.saveConnections(snap.connections);
      StorageService.saveBaselineResult(snap.baselineResult);
      StorageService.saveRecoveryResult(null);
      StorageService.saveStateBResult(null);
      StorageService.saveCrisisState(null);
    } else {
      handleResetDemo();
    }
    showToast('✓ Restored to Normal Baseline scenario (all buses operational, corridors passable).');
  };

  const handleUpdateTripCapacity = (tripId: string, newCapacity: number) => {
    const updated = trips.map(t =>
      t.id === tripId ? { ...t, capacity: newCapacity } : t
    );
    setTrips(updated);
    StorageService.saveTrips(updated);

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
            blockedReason: !c.isBlocked ? (blockedReason || 'Flooded causeway') : undefined
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
    showToast(`New request registered for ${newRequest.studentName}!`);
  };

  const handleResetDemo = () => {
    const { requests: defReqs, trips: defTrips, connections: defConns } =
      StorageService.resetAllToDefaults();
    setRequests(defReqs);
    setTrips(defTrips);
    setConnections(defConns);
    setRecoveryResult(null);
    setStateBResult(null);
    setCrisisState(null);

    const initialBaseline = runAllocationSolver(defReqs, defTrips, defConns, 'BASELINE');
    setBaselineResult(initialBaseline);
    StorageService.saveBaselineResult(initialBaseline);
    setCurrentResult(initialBaseline);

    showToast('✓ Demo reset to initial seeded state (20 requests, 4 trips, 0 road blocks).');
  };

  // Compute crisis metrics if State B and Recovery Result are present
  const crisisMetrics: CrisisComparisonMetrics | null =
    stateBResult && recoveryResult
      ? computeCrisisComparisonMetrics(stateBResult, recoveryResult, trips)
      : null;

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

      {/* Floating Contextual Primary Action Button */}
      {currentView === 'COORDINATOR' && crisisState?.isStale && (
        <button
          type="button"
          className="floating-action-btn pulse-glow"
          onClick={handleGenerateCrisisRecovery}
          aria-label="Generate Recovery Plan for active crisis"
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            background: '#0d9488',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '50px',
            boxShadow: '0 8px 24px rgba(13, 148, 136, 0.45)',
            border: '2px solid #5eead4',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 800,
            fontSize: '0.9rem',
            zIndex: 900,
            cursor: 'pointer'
          }}
        >
          <Zap size={18} />
          <span>Generate Recovery Plan</span>
        </button>
      )}

      {currentView === 'STUDENT' && (
        <button
          type="button"
          className="floating-action-btn"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="Jump to transport request form"
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            background: '#042f2e',
            color: '#5eead4',
            padding: '10px 18px',
            borderRadius: '50px',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid #0f766e',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            fontSize: '0.85rem',
            zIndex: 900,
            cursor: 'pointer'
          }}
        >
          <Send size={15} />
          <span>Request Seat</span>
        </button>
      )}

      {/* Floating feedback toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            left: '28px',
            background: '#0f172a',
            color: '#f8fafc',
            padding: '12px 18px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 9999,
            fontSize: '0.85rem',
            fontWeight: 600,
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
            stateBResult={stateBResult}
            crisisState={crisisState}
            crisisMetrics={crisisMetrics}
            onRunBaseline={handleRunBaseline}
            onRunRecovery={handleRunRecovery}
            onActivateExamCrisis={handleActivateExamCrisis}
            onGenerateCrisisRecovery={handleGenerateCrisisRecovery}
            onResetExamCrisis={handleResetExamCrisis}
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

      {/* Walkthrough guide modal */}
      <DemoScriptModal
        isOpen={isDemoScriptOpen}
        onClose={() => setIsDemoScriptOpen(false)}
        onSwitchToStudentView={() => handleViewChange('STUDENT')}
        onSwitchToCoordinatorView={() => handleViewChange('COORDINATOR')}
        onRunBaseline={handleRunBaseline}
        onTriggerDisruption={handleActivateExamCrisis}
        onRunRecovery={handleGenerateCrisisRecovery}
        onReset={handleResetDemo}
      />
    </div>
  );
};

export default App;
