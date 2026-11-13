import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Users,
  Bus,
  TrendingDown,
  Info
} from 'lucide-react';
import {
  StudentRequest,
  VehicleTrip,
  TransportConnection,
  WhatIfScenarioConfig,
  SimulationResult
} from '../../types';
import {
  PRESET_WHAT_IF_SCENARIOS,
  SimulationSandboxService
} from '../../services/simulationSandbox';

interface WhatIfSimulatorProps {
  requests: StudentRequest[];
  trips: VehicleTrip[];
  connections: TransportConnection[];
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  requests,
  trips,
  connections
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(PRESET_WHAT_IF_SCENARIOS[0].id);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const selectedScenario = PRESET_WHAT_IF_SCENARIOS.find(s => s.id === selectedScenarioId) || PRESET_WHAT_IF_SCENARIOS[0];

  const handleRunSimulation = () => {
    const res = SimulationSandboxService.runSimulation(
      selectedScenario,
      requests,
      trips,
      connections
    );
    setSimulationResult(res);
  };

  const handleResetSimulation = () => {
    setSimulationResult(null);
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FlaskConical size={18} className="text-primary" />
          <h3 className="card-title" style={{ margin: 0 }}>
            What-If Disruption Simulator (Sandbox)
          </h3>
          <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
            Isolated Simulation Mode — Zero Risk to Live Operations
          </span>
        </div>

        {simulationResult && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={handleResetSimulation}
          >
            <RotateCcw size={14} />
            <span>Reset Simulation</span>
          </button>
        )}
      </div>

      <div className="card-body">
        {/* Scenario Selector & Run Bar */}
        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
            <div>
              <label className="form-label" style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                Select Emergency What-If Hypothesis
              </label>
              <select
                className="form-select"
                value={selectedScenarioId}
                onChange={e => setSelectedScenarioId(e.target.value)}
                style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' }}
              >
                {PRESET_WHAT_IF_SCENARIOS.map(scen => (
                  <option key={scen.id} value={scen.id}>
                    {scen.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '8px' }}>
                <b>Hypothesis:</b> {selectedScenario.description}
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleRunSimulation}
              >
                <Play size={16} />
                <span>Execute Sandbox Disruption Test</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Comparison View */}
        {simulationResult ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Baseline Accommodated</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#38bdf8' }}>
                  {simulationResult.baseline.assignedCount} / {simulationResult.baseline.totalRequests}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {simulationResult.baseline.capacityUtilizationPct}% seat utilization
                </div>
              </div>

              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Post-Disruption Recovery</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: simulationResult.recoveryRatePct > 70 ? '#10b981' : '#f59e0b' }}>
                  {simulationResult.simulated.assignedCount} / {simulationResult.simulated.totalRequests}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Recovery rate: <b>{simulationResult.recoveryRatePct}%</b>
                </div>
              </div>

              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Newly Stranded Students</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ef4444' }}>
                  {simulationResult.strandedStudents.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Displaced from original buses
                </div>
              </div>

              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fleet Capacity Loss</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b' }}>
                  -{simulationResult.capacityLossPct}%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {simulationResult.simulated.totalCapacity} active seats remaining
                </div>
              </div>
            </div>

            {/* Side-by-side comparison tables */}
            <div className="grid-2">
              {/* Stranded Students Roster */}
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} />
                  Stranded Students & Honest Root Causes ({simulationResult.strandedStudents.length})
                </h4>
                {simulationResult.strandedStudents.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: '#10b981', padding: '12px' }}>
                    ✓ Remarkable Resilience: 0 students lost their transport in this scenario!
                  </div>
                ) : (
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {simulationResult.strandedStudents.map(s => (
                      <div key={s.requestId} style={{ borderBottom: '1px solid #1e293b', padding: '8px 0', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                          {s.studentName} ({s.originVillageName})
                        </div>
                        <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '2px' }}>
                          {s.honestExplanation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rerouted & Recovered Students */}
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} />
                  Dynamic Rerouting & Surviving Capacity ({simulationResult.recoveredStudents.length})
                </h4>
                {simulationResult.recoveredStudents.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '12px' }}>
                    No students required vehicle rerouting.
                  </div>
                ) : (
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {simulationResult.recoveredStudents.map(r => (
                      <div key={r.requestId} style={{ borderBottom: '1px solid #1e293b', padding: '8px 0', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                          {r.studentName} → {r.vehicleName}
                        </div>
                        <div style={{ color: '#38bdf8', fontSize: '0.75rem', marginTop: '2px' }}>
                          Reassigned to Seat #{r.seatNumber} at {r.pickupTime} ({r.pickupVillageName})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 16px', color: '#64748b' }}>
            <Info size={32} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#94a3b8' }}>
              Choose a scenario above and execute a what-if disruption test
            </div>
            <div style={{ fontSize: '0.8rem', maxWidth: '500px', margin: '6px auto 0 auto' }}>
              Simulates real-world rural transportation failures (floods, breakdowns, demand surges) against your current network topology without altering live transport allocations.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
