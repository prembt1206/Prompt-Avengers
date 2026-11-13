import React, { useState } from 'react';
import {
  MapPin,
  Bus,
  Route,
  CheckCircle2,
  TrendingUp,
  Terminal,
  Zap
} from 'lucide-react';
import {
  Village,
  Institution,
  TransportConnection,
  VehicleTrip,
  StudentRequest,
  AllocationResult,
  ExamCrisisState,
  CrisisComparisonMetrics
} from '../../types';
import { ExamCrisisControl } from './ExamCrisisControl';
import { CrisisComparisonPanel } from './CrisisComparisonPanel';
import { AllocationSummary } from './AllocationSummary';
import { DisruptionPresets } from './DisruptionPresets';
import { NetworkMapSvg } from './NetworkMapSvg';
import { VehicleTripList } from './VehicleTripList';
import { RoadConnectionsList } from './RoadConnectionsList';
import { AssignmentTable } from './AssignmentTable';
import { UnmetDemandTable } from './UnmetDemandTable';
import { SolverLogViewer } from './SolverLogViewer';

interface CoordinatorDashboardProps {
  villages: Village[];
  institutions: Institution[];
  connections: TransportConnection[];
  trips: VehicleTrip[];
  requests: StudentRequest[];
  currentResult: AllocationResult | null;
  baselineResult: AllocationResult | null;
  recoveryResult: AllocationResult | null;
  stateBResult: AllocationResult | null;
  crisisState: ExamCrisisState | null;
  crisisMetrics: CrisisComparisonMetrics | null;
  onRunBaseline: () => void;
  onRunRecovery: () => void;
  onActivateExamCrisis: () => void;
  onGenerateCrisisRecovery: () => void;
  onResetExamCrisis: () => void;
  onUpdateTripCapacity: (tripId: string, newCapacity: number) => void;
  onToggleTripCancellation: (tripId: string, cancelReason?: string) => void;
  onToggleConnectionBlocked: (connectionId: string, blockedReason?: string) => void;
  onApplyScenario: (updatedTrips: VehicleTrip[], updatedConnections: TransportConnection[], scenarioName: string) => void;
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({
  villages,
  institutions,
  connections,
  trips,
  requests,
  currentResult,
  baselineResult,
  recoveryResult,
  stateBResult,
  crisisState,
  crisisMetrics,
  onRunBaseline,
  onRunRecovery,
  onActivateExamCrisis,
  onGenerateCrisisRecovery,
  onResetExamCrisis,
  onUpdateTripCapacity,
  onToggleTripCancellation,
  onToggleConnectionBlocked,
  onApplyScenario
}) => {
  const [activeTab, setActiveTab] = useState<'ALLOCATIONS' | 'CRISIS_AUDIT' | 'MAP' | 'FLEET' | 'ROADS' | 'LOGS'>('ALLOCATIONS');

  const isCrisisActive = Boolean(crisisState?.isActive);

  return (
    <div>
      {/* 1. Official Exam Day Crisis Simulator Control Strip */}
      <ExamCrisisControl
        crisisState={crisisState}
        comparisonMetrics={crisisMetrics}
        onActivateCrisis={onActivateExamCrisis}
        onGenerateRecoveryPlan={onGenerateCrisisRecovery}
        onResetToNormal={onResetExamCrisis}
      />

      {/* 2. Disruption Quick Presets */}
      {!isCrisisActive && (
        <DisruptionPresets
          trips={trips}
          connections={connections}
          onApplyScenario={onApplyScenario}
        />
      )}

      {/* 3. Allocation Summary & Engine Run Controls */}
      <AllocationSummary
        currentResult={currentResult}
        baselineResult={baselineResult}
        recoveryResult={recoveryResult}
        trips={trips}
        connections={connections}
        onRunBaseline={onRunBaseline}
        onRunRecovery={isCrisisActive ? onGenerateCrisisRecovery : onRunRecovery}
      />

      {/* 4. Tab Navigation */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'ALLOCATIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALLOCATIONS')}
        >
          <CheckCircle2 size={16} />
          <span>
            Assignments & Unmet Demand ({currentResult ? `${currentResult.assignedCount}/${currentResult.totalRequests}` : requests.length})
          </span>
        </button>

        {isCrisisActive && (
          <button
            type="button"
            className={`tab-btn ${activeTab === 'CRISIS_AUDIT' ? 'active' : ''}`}
            onClick={() => setActiveTab('CRISIS_AUDIT')}
            style={{ color: activeTab === 'CRISIS_AUDIT' ? '#d97706' : '#92400e', fontWeight: 700 }}
          >
            <TrendingUp size={16} />
            <span>Crisis Impact & 3-State Audit</span>
          </button>
        )}

        <button
          type="button"
          className={`tab-btn ${activeTab === 'MAP' ? 'active' : ''}`}
          onClick={() => setActiveTab('MAP')}
        >
          <MapPin size={16} />
          <span>Network Topology & Alternative Routes</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'FLEET' ? 'active' : ''}`}
          onClick={() => setActiveTab('FLEET')}
        >
          <Bus size={16} />
          <span>Fleet Controls ({trips.filter(t => !t.isCancelled).length} Active / {trips.filter(t => t.isCancelled).length} Disabled)</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'ROADS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ROADS')}
        >
          <Route size={16} />
          <span>Road Corridors ({connections.filter(c => c.isBlocked).length} Flooded)</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('LOGS')}
        >
          <Terminal size={16} />
          <span>Solver Trace Logs</span>
        </button>
      </div>

      {/* 5. Tab Contents */}
      {activeTab === 'ALLOCATIONS' && (
        <div>
          {/* Stale result notice if crisis active and not yet recovered */}
          {crisisState?.isStale && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>
                ⚠️ <strong>Crisis Triggered — Allocations Stale:</strong> The network has changed. Click <strong>"Generate Recovery Plan"</strong> above to compute the emergency on-time allocation.
              </span>
              <button type="button" className="btn btn-warning btn-sm" onClick={onGenerateCrisisRecovery}>
                <Zap size={14} /> Generate Recovery Plan
              </button>
            </div>
          )}

          {/* Assigned Students */}
          <AssignmentTable assignments={currentResult?.assignments || []} />

          {/* Unmet Demand with Honest Explanations */}
          <UnmetDemandTable unmetRequests={currentResult?.unmetRequests || []} />
        </div>
      )}

      {activeTab === 'CRISIS_AUDIT' && (
        <CrisisComparisonPanel
          baselineResult={baselineResult}
          stateBResult={stateBResult}
          stateCResult={recoveryResult}
          metrics={crisisMetrics}
        />
      )}

      {activeTab === 'MAP' && (
        <NetworkMapSvg
          villages={villages}
          institutions={institutions}
          connections={connections}
          trips={trips}
          requests={requests}
          onToggleConnection={onToggleConnectionBlocked}
          onToggleTrip={onToggleTripCancellation}
          isCrisisActive={isCrisisActive}
        />
      )}

      {activeTab === 'FLEET' && (
        <VehicleTripList
          trips={trips}
          tripUtilizations={currentResult?.tripUtilization}
          onUpdateCapacity={onUpdateTripCapacity}
          onToggleCancellation={onToggleTripCancellation}
        />
      )}

      {activeTab === 'ROADS' && (
        <RoadConnectionsList
          connections={connections}
          trips={trips}
          onToggleConnection={onToggleConnectionBlocked}
        />
      )}

      {activeTab === 'LOGS' && (
        <SolverLogViewer logs={currentResult?.solverLogs || []} />
      )}
    </div>
  );
};
