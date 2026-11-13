import React from 'react';
import { Play, RotateCw, Users, CheckCircle, AlertTriangle, Bus, Percent } from 'lucide-react';
import { AllocationResult, VehicleTrip, TransportConnection } from '../../types';

interface AllocationSummaryProps {
  currentResult: AllocationResult | null;
  baselineResult: AllocationResult | null;
  recoveryResult: AllocationResult | null;
  trips: VehicleTrip[];
  connections: TransportConnection[];
  onRunBaseline: () => void;
  onRunRecovery: () => void;
}

export const AllocationSummary: React.FC<AllocationSummaryProps> = ({
  currentResult,
  baselineResult,
  recoveryResult,
  trips,
  connections,
  onRunBaseline,
  onRunRecovery
}) => {
  const cancelledTrips = trips.filter(t => t.isCancelled);
  const blockedConns = connections.filter(c => c.isBlocked);
  const hasDisruptions = cancelledTrips.length > 0 || blockedConns.length > 0;

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div className="card-header" style={{ background: '#f8fafc' }}>
        <div>
          <h3 className="card-title">
            <Play size={18} className="text-primary" />
            Allocation Engine Cockpit
          </h3>
          <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '2px' }}>
            Deterministic, capacity-bound solver executing pure topological matching
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onRunBaseline}
            title="Compute baseline allocation for current fleet and demand"
          >
            <Play size={15} />
            <span>1. Run Baseline Allocation</span>
          </button>

          <button
            type="button"
            className={`btn ${hasDisruptions ? 'btn-warning' : 'btn-secondary'}`}
            onClick={onRunRecovery}
            title="Execute dynamic recovery solver under current vehicle cancellations and route blocks"
          >
            <RotateCw size={15} />
            <span>2. Run Recovery Allocation</span>
          </button>
        </div>
      </div>

      <div className="card-body">
        {/* Network & Fleet Alert Strip if disruptions active */}
        {hasDisruptions && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <AlertTriangle size={18} />
              <span>
                <strong>Active Fleet & Route Disruptions:</strong>{' '}
                {cancelledTrips.length > 0 && `${cancelledTrips.length} vehicle(s) cancelled (${cancelledTrips.map(t => t.vehicleName.split('—')[0]).join(', ')}); `}
                {blockedConns.length > 0 && `${blockedConns.length} route corridor(s) impassable.`}
              </span>
            </div>
            <span className="badge badge-warning">Recovery Required</span>
          </div>
        )}

        {/* KPIs */}
        <div className="grid-4">
          <div className="kpi-card">
            <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="kpi-val">{currentResult ? currentResult.totalRequests : trips.reduce((sum, t) => sum + t.capacity, 0)}</div>
              <div className="kpi-label">Total Student Demand</div>
              <div className="kpi-subtext">Compromised rural requests</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="kpi-val" style={{ color: '#065f46' }}>
                {currentResult ? currentResult.assignedCount : '—'}
              </div>
              <div className="kpi-label">Successfully Assigned</div>
              <div className="kpi-subtext">Capacity & route validated</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="kpi-val" style={{ color: '#b91c1c' }}>
                {currentResult ? currentResult.unmetCount : '—'}
              </div>
              <div className="kpi-label">Unmet Student Demand</div>
              <div className="kpi-subtext">Honest deficit (No fake fixes)</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box" style={{ background: '#f8fafc', color: '#475569' }}>
              <Percent size={24} />
            </div>
            <div>
              <div className="kpi-val">
                {currentResult ? `${currentResult.capacityUtilizationPct}%` : '—'}
              </div>
              <div className="kpi-label">Seat Utilization</div>
              <div className="kpi-subtext">
                {currentResult ? `${currentResult.allocatedCapacity} / ${currentResult.totalCapacity} seats filled` : 'Fleet capacity'}
              </div>
            </div>
          </div>
        </div>

        {currentResult && (
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
            <div>
              Current Mode:{' '}
              <span className={`badge ${currentResult.mode === 'RECOVERY' ? 'badge-warning' : 'badge-info'}`}>
                {currentResult.mode} RUN
              </span>
              <span style={{ marginLeft: '10px' }}>
                Generated at: {currentResult.generatedAt.replace('T', ' ').substring(0, 19)} UTC
              </span>
            </div>
            <div>
              {baselineResult && recoveryResult && (
                <span style={{ color: '#0284c7', fontWeight: 600 }}>
                  ✓ Both Baseline and Recovery runs available for comparison
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
