import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { NoticeBanner } from './components/NoticeBanner';
import { StudentRequestForm } from './components/StudentView/StudentRequestForm';
import { StudentRequestList } from './components/StudentView/StudentRequestList';
import { CoordinatorDashboard } from './components/CoordinatorView/CoordinatorDashboard';
import { DemoScriptModal } from './components/CoordinatorView/DemoScriptModal';
import { AuthModal } from './components/Auth/AuthModal';
import { SupabaseConfigModal } from './components/Auth/SupabaseConfigModal';
import { StorageService } from './services/storageService';
import { SupabaseService, DEFAULT_SCENARIO_ID } from './services/supabaseService';
import { runAllocationSolver } from './services/allocationSolver';
import { SkyscannerHero } from './components/Skyscanner/SkyscannerHero';
import { SkyscannerCrisisBanner } from './components/Skyscanner/SkyscannerCrisisBanner';
import { SkyscannerFaq } from './components/Skyscanner/SkyscannerFaq';
import { SkyscannerFooter } from './components/Skyscanner/SkyscannerFooter';
import { SignupPage } from './components/Auth/SignupPage';
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
  CrisisComparisonMetrics,
  UserProfile,
  ScenarioMeta
} from './types';
import { Zap, Send, ShieldAlert, Cloud, CheckCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'COORDINATOR' | 'STUDENT' | 'SIGNUP'>(() =>
    StorageService.getUserView()
  );

  const [villages, setVillages] = useState(SEEDED_VILLAGES);
  const [institutions, setInstitutions] = useState(SEEDED_INSTITUTIONS);

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

  // Supabase Auth & Cloud State
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [scenarioMeta, setScenarioMeta] = useState<ScenarioMeta | null>(null);
  const [isSyncingWithCloud, setIsSyncingWithCloud] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // 1. Check Supabase Configuration & Listen for Auth changes
  useEffect(() => {
    const configured = SupabaseService.isConfigured();
    setIsSupabaseReady(configured);

    if (configured) {
      SupabaseService.getCurrentUserProfile().then(profile => {
        setCurrentUser(profile);
      });

      const unsubscribe = SupabaseService.onAuthStateChange(profile => {
        setCurrentUser(profile);
        if (profile) {
          showToast(`Signed in as ${profile.fullName || profile.email} (${profile.role === 'coordinator' ? 'Coordinator' : 'Student'}).`);
          loadCloudData();
        }
      });

      return () => unsubscribe();
    }
  }, []);

  // 2. Load Cloud Data when Supabase is active
  const loadCloudData = useCallback(async () => {
    if (!SupabaseService.isConfigured()) return;

    setIsSyncingWithCloud(true);
    try {
      const [meta, remoteVillages, remoteInstitutions, remoteConnections, remoteTrips, remoteRequests] =
        await Promise.all([
          SupabaseService.loadScenario(DEFAULT_SCENARIO_ID),
          SupabaseService.loadVillages(DEFAULT_SCENARIO_ID),
          SupabaseService.loadInstitutions(DEFAULT_SCENARIO_ID),
          SupabaseService.loadRouteConnections(DEFAULT_SCENARIO_ID),
          SupabaseService.loadVehicleTrips(DEFAULT_SCENARIO_ID),
          SupabaseService.loadTransportRequests(DEFAULT_SCENARIO_ID)
        ]);

      if (meta) setScenarioMeta(meta);
      if (remoteVillages.length > 0) setVillages(remoteVillages);
      if (remoteInstitutions.length > 0) setInstitutions(remoteInstitutions);
      if (remoteConnections.length > 0) setConnections(remoteConnections);
      if (remoteTrips.length > 0) setTrips(remoteTrips);
      if (remoteRequests.length > 0) setRequests(remoteRequests);

      // Attempt to load latest allocation run
      const latestRun = await SupabaseService.loadLatestAllocationRun(DEFAULT_SCENARIO_ID);
      if (latestRun) {
        if (latestRun.mode === 'BASELINE') setBaselineResult(latestRun);
        else setRecoveryResult(latestRun);
        setCurrentResult(latestRun);
      }
    } catch (err) {
      console.warn('[RouteLess] Cloud sync notice:', err);
    } finally {
      setIsSyncingWithCloud(false);
    }
  }, []);

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

  const handleViewChange = (view: 'COORDINATOR' | 'STUDENT' | 'SIGNUP') => {
    // If signed in as a student in cloud mode, alert them of permission boundaries
    if (isSupabaseReady && currentUser && currentUser.role === 'student' && view === 'COORDINATOR') {
      showToast('⚠️ Note: You are logged in as a Student. Database RLS prevents student accounts from modifying fleet or road records.');
    }
    setCurrentView(view);
    if (view !== 'SIGNUP') {
      StorageService.saveUserView(view);
    }
  };

  const handleRunBaseline = async () => {
    const res = runAllocationSolver(requests, trips, connections, 'BASELINE');
    setBaselineResult(res);
    StorageService.saveBaselineResult(res);
    setCurrentResult(res);

    // If Supabase is connected and user is coordinator, save run to database
    if (isSupabaseReady && currentUser?.role === 'coordinator' && scenarioMeta) {
      const saveRes = await SupabaseService.saveAllocationRun(
        DEFAULT_SCENARIO_ID,
        scenarioMeta.version,
        res
      );
      if (saveRes.error) {
        showToast(`Baseline computed locally. (Cloud save notice: ${saveRes.error})`);
        return;
      }
    }

    showToast(`✓ Baseline Allocation completed: ${res.assignedCount} assigned, ${res.unmetCount} unmet.`);
  };

  const handleRunRecovery = async () => {
    const res = runAllocationSolver(requests, trips, connections, 'RECOVERY');
    setRecoveryResult(res);
    StorageService.saveRecoveryResult(res);
    setCurrentResult(res);

    // If Supabase is connected and user is coordinator, save run to database
    if (isSupabaseReady && currentUser?.role === 'coordinator' && scenarioMeta) {
      const saveRes = await SupabaseService.saveAllocationRun(
        DEFAULT_SCENARIO_ID,
        scenarioMeta.version,
        res
      );
      if (saveRes.error) {
        showToast(`Recovery computed locally. (Cloud save notice: ${saveRes.error})`);
        return;
      }
    }

    showToast(`✓ Recovery Allocation completed: ${res.assignedCount} assigned, ${res.unmetCount} unmet.`);
  };

  // Official Exam Day Crisis Activation
  const handleActivateExamCrisis = async () => {
    // If Supabase is connected, enforce database RLS
    if (isSupabaseReady) {
      if (!currentUser) {
        showToast('🔒 Please sign in as a Coordinator to activate the Exam Day Crisis in Supabase Cloud.');
        setIsAuthModalOpen(true);
        return;
      }
      if (currentUser.role !== 'coordinator') {
        showToast('⛔ Access Denied (RLS): Only registered transport coordinators can activate crisis scenarios.');
        return;
      }

      // Execute atomic database RPC
      const rpcResult = await SupabaseService.activateExamCrisis(DEFAULT_SCENARIO_ID);
      if (!rpcResult.success) {
        showToast(`Crisis activation failed: ${rpcResult.error}`);
        return;
      }
      // Refresh scenario data from cloud
      await loadCloudData();
    }

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
  const handleGenerateCrisisRecovery = async () => {
    const res = runAllocationSolver(requests, trips, connections, 'RECOVERY');
    setRecoveryResult(res);
    StorageService.saveRecoveryResult(res);

    if (crisisState) {
      const updatedCrisisState = { ...crisisState, isStale: false };
      setCrisisState(updatedCrisisState);
      StorageService.saveCrisisState(updatedCrisisState);
    }

    // Cloud save with concurrency protection
    if (isSupabaseReady && currentUser?.role === 'coordinator' && scenarioMeta) {
      const saveRes = await SupabaseService.saveAllocationRun(
        DEFAULT_SCENARIO_ID,
        scenarioMeta.version,
        res
      );
      if (saveRes.error) {
        showToast(`Recovery computed locally. (Notice: ${saveRes.error})`);
      }
    }

    setCurrentResult(res);
    showToast(
      `✓ Emergency Recovery Plan Generated: ${res.assignedCount} students assigned on time (${res.examAssignedOnTimeCount} exam candidates prioritized).`
    );
  };

  // Reset Crisis to Normal Baseline
  const handleResetExamCrisis = async () => {
    // If Supabase is connected, enforce authorization
    if (isSupabaseReady) {
      if (currentUser?.role !== 'coordinator') {
        showToast('⛔ Access Denied (RLS): Only registered transport coordinators can reset the scenario in Supabase Cloud.');
        return;
      }

      const resetRes = await SupabaseService.resetScenario(DEFAULT_SCENARIO_ID);
      if (!resetRes.success) {
        showToast(`Reset failed: ${resetRes.error}`);
        return;
      }
      await loadCloudData();
    }

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

  const handleUpdateTripCapacity = async (tripId: string, newCapacity: number) => {
    // If Supabase is connected, verify authorization
    if (isSupabaseReady) {
      if (!currentUser || currentUser.role !== 'coordinator') {
        showToast('⛔ Access Denied (RLS): Only registered transport coordinators can update vehicle capacity.');
        return;
      }
      const updateRes = await SupabaseService.updateTripCapacity(tripId, newCapacity);
      if (!updateRes.success) {
        showToast(`Database write error: ${updateRes.error}`);
        return;
      }
    }

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

  const handleToggleTripCancellation = async (tripId: string, cancelReason?: string) => {
    const target = trips.find(t => t.id === tripId);
    const newIsCancelled = !target?.isCancelled;

    // If Supabase is connected, check authorization
    if (isSupabaseReady) {
      if (!currentUser || currentUser.role !== 'coordinator') {
        showToast('⛔ Access Denied (RLS): Only registered transport coordinators can cancel or reinstate vehicles.');
        return;
      }
      const res = await SupabaseService.toggleTripCancellation(tripId, newIsCancelled, cancelReason);
      if (!res.success) {
        showToast(`Database write error: ${res.error}`);
        return;
      }
    }

    const updated = trips.map(t =>
      t.id === tripId
        ? {
            ...t,
            isCancelled: newIsCancelled,
            cancelReason: newIsCancelled ? (cancelReason || 'Vehicle breakdown') : undefined
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

  const handleToggleConnectionBlocked = async (connectionId: string, blockedReason?: string) => {
    const target = connections.find(c => c.id === connectionId);
    const newIsBlocked = !target?.isBlocked;

    // If Supabase is connected, check authorization
    if (isSupabaseReady) {
      if (!currentUser || currentUser.role !== 'coordinator') {
        showToast('⛔ Access Denied (RLS): Only registered transport coordinators can block or reopen road corridors.');
        return;
      }
      const res = await SupabaseService.toggleRouteConnectionBlocked(connectionId, newIsBlocked, blockedReason);
      if (!res.success) {
        showToast(`Database write error: ${res.error}`);
        return;
      }
    }

    const updated = connections.map(c =>
      c.id === connectionId
        ? {
            ...c,
            isBlocked: newIsBlocked,
            blockedReason: newIsBlocked ? (blockedReason || 'Flooded causeway') : undefined
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

  const handleSubmitStudentRequest = async (newRequest: StudentRequest) => {
    // If Supabase is connected, submit via Supabase
    if (isSupabaseReady) {
      const submitRes = await SupabaseService.submitTransportRequest(newRequest);
      if (!submitRes.success) {
        showToast(`Database error submitting request: ${submitRes.error}`);
        return;
      }
    }

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
    showToast(`✓ New transport request registered for ${newRequest.studentName}!`);
  };

  const handleResetDemo = async () => {
    if (isSupabaseReady && currentUser?.role === 'coordinator') {
      await SupabaseService.resetScenario(DEFAULT_SCENARIO_ID);
      await loadCloudData();
    }

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

  const handleSignOut = async () => {
    await SupabaseService.signOut();
    setCurrentUser(null);
    showToast('Signed out of Supabase session.');
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
        currentUser={currentUser}
        isSupabaseConfigured={isSupabaseReady}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
      />

      {/* Signature Skyscanner Hero with Segmented Search Bar & Quick Navigation */}
      {currentView !== 'SIGNUP' && (
        <SkyscannerHero
          currentView={currentView}
          onViewChange={handleViewChange}
          villages={villages}
          institutions={institutions}
          onQuickSearchOrSubmit={(vId, iId, isExam) => {
            handleViewChange('STUDENT');
          }}
          onActivateCrisis={handleActivateExamCrisis}
          isCrisisActive={Boolean(crisisState?.isActive)}
        />
      )}

      {/* Floating Contextual Primary Action Button */}
      {currentView === 'COORDINATOR' && crisisState?.isStale && (
        <button
          type="button"
          className="floating-action-btn pulse-glow"
          onClick={handleGenerateCrisisRecovery}
          aria-label="Generate Recovery Plan for active crisis"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 99,
            background: '#0770e3',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            padding: '14px 22px',
            boxShadow: '0 8px 24px rgba(7, 112, 227, 0.45)',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <Zap size={18} />
          <span>Generate Recovery Plan</span>
        </button>
      )}

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div
          className="toast-notification"
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: '#05203c',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            fontSize: '0.9rem',
            fontWeight: 600,
            maxWidth: '90vw'
          }}
        >
          {toastMessage}
        </div>
      )}

      <main className="main-content">
        {currentView === 'SIGNUP' ? (
          <SignupPage
            villages={villages}
            institutions={institutions}
            onAuthSuccess={user => {
              setCurrentUser(user);
              showToast(`Welcome, ${user.fullName || user.email}! Account authenticated.`);
              handleViewChange(user.role === 'coordinator' ? 'COORDINATOR' : 'STUDENT');
            }}
            onNavigateHome={() => handleViewChange('COORDINATOR')}
          />
        ) : currentView === 'STUDENT' ? (
          <div className="student-view-container">
            <div className="view-header" style={{ marginBottom: '18px' }}>
              <h2 className="view-title" style={{ fontSize: '1.4rem' }}>Student Transport Request Portal</h2>
              <p className="view-subtitle" style={{ fontSize: '0.85rem' }}>
                Request guaranteed morning transport from rural Mangalore villages to St. Aloysius or KPT. Fictional simulation.
              </p>
            </div>

            <div className="student-layout">
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
          </div>
        ) : (
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
        )}

        {/* Collapsible FAQ at bottom */}
        {currentView !== 'SIGNUP' && <SkyscannerFaq />}
      </main>

      {/* Step-by-step evaluator walkthrough script modal */}
      <DemoScriptModal
        isOpen={isDemoScriptOpen}
        onClose={() => setIsDemoScriptOpen(false)}
        onSwitchToStudentView={() => handleViewChange('STUDENT')}
        onSwitchToCoordinatorView={() => handleViewChange('COORDINATOR')}
        onRunBaseline={handleRunBaseline}
        onTriggerDisruption={() => handleToggleTripCancellation('trip-01', 'Radiator crack')}
        onRunRecovery={handleRunRecovery}
        onReset={handleResetDemo}
      />

      {/* Supabase Authentication Dialog */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={user => {
          setCurrentUser(user);
          showToast(`Welcome, ${user.fullName || user.email}!`);
        }}
      />

      {/* Supabase Setup / Connection Guide Modal */}
      <SupabaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />

      {/* Skyscanner Midnight Navy Footer */}
      <SkyscannerFooter />
    </div>
  );
};

export default App;
