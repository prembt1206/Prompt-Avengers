import React from 'react';
import { ArrowRight, ArrowLeftRight, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { AllocationResult } from '../../types';
import { computeAllocationDiff } from '../../services/allocationSolver';

interface ComparisonViewProps {
  baselineResult: AllocationResult | null;
  recoveryResult: AllocationResult | null;
  onRunRecovery: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  baselineResult,
  recoveryResult,
  onRunRecovery
}) => {
  if (!baselineResult) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
        Please run <strong>Baseline Allocation</strong> first to establish the initial benchmark before comparing.
      </div>
    );
  }

  if (!recoveryResult) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
        <p style={{ marginBottom: '14px' }}>
          Baseline allocation established ({baselineResult.assignedCount} assigned, {baselineResult.unmetCount} unmet).
          Now trigger a vehicle breakdown or route closure and run <strong>Recovery Allocation</strong> to view comparative analysis.
        </p>
        <button type="button" className="btn btn-warning" onClick={onRunRecovery}>
          <RefreshCw size={14} /> Run Recovery Allocation Now
        </button>
      </div>
    );
  }

  const diff = computeAllocationDiff(baselineResult, recoveryResult);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <ArrowLeftRight size={18} className="text-primary" />
          Baseline vs Recovery Comparative Analysis (P1)
        </h3>
        <span className="badge badge-info">Differential Audit</span>
      </div>

      <div className="card-body">
        {/* Metric Deltas */}
        <div className="grid-3" style={{ marginBottom: '20px' }}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Assigned Seat Delta</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#334155' }}>
                {baselineResult.assignedCount}
              </span>
              <ArrowRight size={14} className="text-muted" />
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: recoveryResult.assignedCount < baselineResult.assignedCount ? '#dc2626' : '#10b981' }}>
                {recoveryResult.assignedCount}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                ({recoveryResult.assignedCount - baselineResult.assignedCount > 0 ? '+' : ''}{recoveryResult.assignedCount - baselineResult.assignedCount})
              </span>
            </div>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '2px' }}>Baseline → Recovery</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Unmet Demand Delta</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#334155' }}>
                {baselineResult.unmetCount}
              </span>
              <ArrowRight size={14} className="text-muted" />
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: recoveryResult.unmetCount > baselineResult.unmetCount ? '#dc2626' : '#10b981' }}>
                {recoveryResult.unmetCount}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                ({recoveryResult.unmetCount - baselineResult.unmetCount > 0 ? '+' : ''}{recoveryResult.unmetCount - baselineResult.unmetCount})
              </span>
            </div>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '2px' }}>Increased unmet due to physical constraints</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Fleet Seat Utilization</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#334155' }}>
                {baselineResult.capacityUtilizationPct}%
              </span>
              <ArrowRight size={14} className="text-muted" />
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>
                {recoveryResult.capacityUtilizationPct}%
              </span>
            </div>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '2px' }}>Operational load efficiency</div>
          </div>
        </div>

        {/* Displaced / Rerouted students list */}
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
          Displaced or Rerouted Students ({diff.displacedAssignments.length})
        </h4>

        {diff.displacedAssignments.length === 0 ? (
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.825rem', color: '#64748b' }}>
            No students were displaced or rerouted between these runs.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Baseline Assignment</th>
                  <th>Recovery Status</th>
                  <th>Impact & Explanation</th>
                </tr>
              </thead>
              <tbody>
                {diff.displacedAssignments.map((disp, i) => (
                  <tr key={i} style={{ background: disp.newStatus === 'UNMET' ? '#fff5f5' : '#eff6ff' }}>
                    <td style={{ fontWeight: 600 }}>{disp.studentName}</td>
                    <td>
                      <span className="badge badge-neutral">{disp.previousTripName}</span>
                    </td>
                    <td>
                      {disp.newStatus === 'UNMET' ? (
                        <span className="badge badge-danger">Lost Transport</span>
                      ) : (
                        <span className="badge badge-info">Rerouted → {disp.newTripName}</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: disp.newStatus === 'UNMET' ? '#991b1b' : '#1e3a8a' }}>
                      {disp.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
