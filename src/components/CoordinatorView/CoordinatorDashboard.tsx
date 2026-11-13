import React, { useState } from 'react';
import {
  MapPin,
  Bus,
  Route,
  CheckCircle2,
  AlertTriangle,
  ArrowLeftRight,
  Terminal
} from 'lucide-react';
import {
  Village,
  Institution,
  TransportConnection,
  VehicleTrip,
  StudentRequest,
  AllocationResult
} from '../../types';
import { AllocationSummary } from './AllocationSummary';
import { DisruptionPresets } from './DisruptionPresets';
import { NetworkMapSvg } from './NetworkMapSvg';
import { VehicleTripList } from './VehicleTripList';
import { RoadConnectionsList } from './RoadConnectionsList';
import { AssignmentTable } from './AssignmentTable';
import { UnmetDemandTable } from './UnmetDemandTable';
import { ComparisonView } from './ComparisonView';
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
  onRunBaseline: () => void;
  onRunRecovery: () => void;
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
  onRunBaseline,
  onRunRecovery,
  onUpdateTripCapacity,
  onToggleTripCancellation,
  onToggleConnectionBlocked,
  onApplyScenario
}) => {
  const [activeTab, setActiveTab] = useState<'MAP' | 'FLEET' | 'ROADS' | 'ALLOCATIONS' | 'DIFF' | 'LOGS'>('ALLOCATIONS');

  return (
    <div>
      {/* Disruption Presets Bar */}
      <DisruptionPresets
        trips={trips}
        connections={connections}
        onApplyScenario={onApplyScenario}
      />

      {/* Allocation Summary & Run Controls */}
      <AllocationSummary
        currentResult={currentResult}
        baselineResult={baselineResult}
        recoveryResult={recoveryResult}
        trips={trips}
        connections={connections}
        onRunBaseline={onRunBaseline}
        onRunRecovery={onRunRecovery}
      />

      {/* Tab Navigation */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'ALLOCATIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALLOCATIONS')}
        >
          <CheckCircle2 size={16} />
          <span>Assignments & Unmet Demand ({currentResult ? currentResult.assignedCount + '/' + currentResult.totalRequests : requests.length})</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'MAP' ? 'active' : ''}`}
          onClick={() => setActiveTab('MAP')}
        >
          <MapPin size={16} />
          <span>Interactive Network Topology</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'FLEET' ? 'active' : ''}`}
          onClick={() => setActiveTab('FLEET')}
        >
          <Bus size={16} />
          <span>Fleet & Capacity Controls ({trips.length})</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'ROADS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ROADS')}
        >
          <Route size={16} />
          <span>Road Corridors ({connections.filter(c => c.isBlocked).length} Blocked)</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'DIFF' ? 'active' : ''}`}
          onClick={() => setActiveTab('DIFF')}
        >
          <ArrowLeftRight size={16} />
          <span>Baseline vs Recovery Diff (P1)</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('LOGS')}
        >
          <Terminal size={16} />
          <span>Solver Trace Logs (P1)</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'MAP' && (
        <NetworkMapSvg
          villages={villages}
          institutions={institutions}
          connections={connections}
          trips={trips}
          requests={requests}
          onToggleConnection={onToggleConnectionBlocked}
          onToggleTrip={onToggleTripCancellation}
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

      {activeTab === 'ALLOCATIONS' && (
        <div>
          {/* Assigned Students */}
          <AssignmentTable assignments={currentResult?.assignments || []} />

          {/* Unmet Demand with Honest Explanations */}
          <UnmetDemandTable unmetRequests={currentResult?.unmetRequests || []} />
        </div>
      )}

      {activeTab === 'DIFF' && (
        <ComparisonView
          baselineResult={baselineResult}
          recoveryResult={recoveryResult}
          onRunRecovery={onRunRecovery}
        />
      )}

      {activeTab === 'LOGS' && (
        <SolverLogViewer logs={currentResult?.solverLogs || []} />
      )}
    </div>
  );
};
