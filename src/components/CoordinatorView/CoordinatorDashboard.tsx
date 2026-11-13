import React, { useState } from 'react';
import {
  MapPin,
  Bus,
  Route,
  CheckCircle2,
  AlertTriangle,
  ArrowLeftRight,
  Terminal,
  Activity,
  FlaskConical,
  Scale,
  Map as MapIcon,
  Layers,
  HelpCircle
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
import { TransportOverview } from './TransportOverview';
import { InteractiveLeafletMap } from '../Map/InteractiveLeafletMap';
import { NetworkMapSvg } from './NetworkMapSvg';
import { VehicleManager } from '../Fleet/VehicleManager';
import { RoadConnectionsList } from './RoadConnectionsList';
import { AssignmentTable } from './AssignmentTable';
import { UnmetDemandTable } from './UnmetDemandTable';
import { DecisionExplanationPanel } from './DecisionExplanationPanel';
import { WhatIfSimulator } from './WhatIfSimulator';
import { FairnessAnalytics } from './FairnessAnalytics';
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
  onApplyScenario: (
    updatedTrips: VehicleTrip[],
    updatedConnections: TransportConnection[],
    scenarioName: string,
    updatedRequests?: StudentRequest[]
  ) => void;
  onAddVehicle: (newTrip: VehicleTrip) => void;
  onUpdateVehicle: (updatedTrip: VehicleTrip) => void;
  onDeleteVehicle: (tripId: string) => void;
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
  onApplyScenario,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle
}) => {
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'MAP' | 'FLEET' | 'ROADS' | 'ALLOCATIONS' | 'EXPLANATIONS' | 'SIMULATOR' | 'FAIRNESS' | 'DIFF' | 'LOGS'
  >('OVERVIEW');

  const [mapMode, setMapMode] = useState<'LEAFLET' | 'TOPOLOGY'>('LEAFLET');

  const blockedCount = connections.filter(c => c.isBlocked).length;
  const breakdownCount = trips.filter(t => t.isCancelled).length;

  return (
    <div>
      {/* 1. Predefined Demonstration Scenarios Bar */}
      <DisruptionPresets
        trips={trips}
        connections={connections}
        requests={requests}
        onApplyScenario={onApplyScenario}
      />

      {/* 2. Professional KPI Cards & Solver Engine Cockpit */}
      <AllocationSummary
        currentResult={currentResult}
        baselineResult={baselineResult}
        recoveryResult={recoveryResult}
        trips={trips}
        connections={connections}
        onRunBaseline={onRunBaseline}
        onRunRecovery={onRunRecovery}
      />

      {/* 3. Comprehensive Navigation Tabs */}
      <div className="tabs-nav" style={{ overflowX: 'auto', flexWrap: 'nowrap', marginBottom: '16px' }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'OVERVIEW' ? 'active' : ''}`}
          onClick={() => setActiveTab('OVERVIEW')}
        >
          <Activity size={16} />
          <span>Transport Overview</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'MAP' ? 'active' : ''}`}
          onClick={() => setActiveTab('MAP')}
        >
          <MapPin size={16} />
          <span>Interactive GIS Map</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'FLEET' ? 'active' : ''}`}
          onClick={() => setActiveTab('FLEET')}
        >
          <Bus size={16} />
          <span>Fleet Registry ({trips.length})</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'ROADS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ROADS')}
        >
          <Route size={16} />
          <span>Road Corridors {blockedCount > 0 && `(${blockedCount} Blocked)`}</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'ALLOCATIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALLOCATIONS')}
        >
          <CheckCircle2 size={16} />
          <span>Assignments & Demand ({currentResult ? currentResult.assignedCount + '/' + currentResult.totalRequests : requests.length})</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'EXPLANATIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('EXPLANATIONS')}
        >
          <HelpCircle size={16} />
          <span>Decision Audit & Proof</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'SIMULATOR' ? 'active' : ''}`}
          onClick={() => setActiveTab('SIMULATOR')}
        >
          <FlaskConical size={16} />
          <span>What-If Simulator</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'FAIRNESS' ? 'active' : ''}`}
          onClick={() => setActiveTab('FAIRNESS')}
        >
          <Scale size={16} />
          <span>Fairness & Vulnerability</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'DIFF' ? 'active' : ''}`}
          onClick={() => setActiveTab('DIFF')}
        >
          <ArrowLeftRight size={16} />
          <span>Recovery Diff (P1)</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('LOGS')}
        >
          <Terminal size={16} />
          <span>Solver Logs</span>
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB A: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <TransportOverview
          trips={trips}
          requests={requests}
          allocationResult={currentResult}
          villages={villages}
          connections={connections}
        />
      )}

      {/* TAB B: INTERACTIVE MAP (LEAFLET GIS + TOPOLOGY TOGGLE) */}
      {activeTab === 'MAP' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px', gap: '8px' }}>
            <button
              type="button"
              className={`btn ${mapMode === 'LEAFLET' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setMapMode('LEAFLET')}
            >
              <MapIcon size={14} />
              <span>Geographical Map (Leaflet OSM)</span>
            </button>
            <button
              type="button"
              className={`btn ${mapMode === 'TOPOLOGY' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setMapMode('TOPOLOGY')}
            >
              <Layers size={14} />
              <span>Topological Schematic (SVG)</span>
            </button>
          </div>

          {mapMode === 'LEAFLET' ? (
            <InteractiveLeafletMap
              villages={villages}
              institutions={institutions}
              connections={connections}
              trips={trips}
              requests={requests}
              allocationResult={currentResult}
              onToggleConnection={onToggleConnectionBlocked}
              onToggleTrip={onToggleTripCancellation}
            />
          ) : (
            <NetworkMapSvg
              villages={villages}
              institutions={institutions}
              connections={connections}
              trips={trips}
              requests={requests}
              allocationResult={currentResult}
              onToggleConnection={onToggleConnectionBlocked}
              onToggleTrip={onToggleTripCancellation}
            />
          )}
        </div>
      )}

      {/* TAB C: FLEET TELEMATICS & VEHICLE REGISTRY */}
      {activeTab === 'FLEET' && (
        <VehicleManager
          trips={trips}
          allocationResult={currentResult}
          villages={villages}
          institutions={institutions}
          onAddVehicle={onAddVehicle}
          onUpdateVehicle={onUpdateVehicle}
          onDeleteVehicle={onDeleteVehicle}
          onToggleCancellation={onToggleTripCancellation}
        />
      )}

      {/* TAB D: ROAD CORRIDORS */}
      {activeTab === 'ROADS' && (
        <RoadConnectionsList
          connections={connections}
          trips={trips}
          onToggleConnection={onToggleConnectionBlocked}
        />
      )}

      {/* TAB E: ASSIGNMENTS & UNMET DEMAND */}
      {activeTab === 'ALLOCATIONS' && (
        <div>
          <AssignmentTable assignments={currentResult?.assignments || []} />
          <UnmetDemandTable unmetRequests={currentResult?.unmetRequests || []} />
        </div>
      )}

      {/* TAB F: INTELLIGENT DECISION EXPLANATIONS */}
      {activeTab === 'EXPLANATIONS' && (
        <DecisionExplanationPanel
          requests={requests}
          allocationResult={currentResult}
          trips={trips}
        />
      )}

      {/* TAB G: WHAT-IF SIMULATOR */}
      {activeTab === 'SIMULATOR' && (
        <WhatIfSimulator
          requests={requests}
          trips={trips}
          connections={connections}
        />
      )}

      {/* TAB H: FAIRNESS & VULNERABILITY */}
      {activeTab === 'FAIRNESS' && (
        <FairnessAnalytics
          villages={villages}
          requests={requests}
          allocationResult={currentResult}
        />
      )}

      {/* TAB I: BASELINE VS RECOVERY DIFF */}
      {activeTab === 'DIFF' && (
        <ComparisonView
          baselineResult={baselineResult}
          recoveryResult={recoveryResult}
          onRunRecovery={onRunRecovery}
        />
      )}

      {/* TAB J: SOLVER LOGS */}
      {activeTab === 'LOGS' && (
        <SolverLogViewer logs={currentResult?.solverLogs || []} />
      )}
    </div>
  );
};
