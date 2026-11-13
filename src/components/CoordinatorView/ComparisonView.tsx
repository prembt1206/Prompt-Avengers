import React from 'react';
import {
  ArrowRight,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Bus,
  Users
} from 'lucide-react';
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
      <div className="card" style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
        <BarChart3 size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
        <h4 style={{ color: '#f8fafc', margin: '0 0 6px 0' }}>Baseline Allocation Required</h4>
        <p style={{ fontSize: '0.85rem', maxWidth: '480px', margin: '0 auto' }}>
          Please execute <strong>1. Run Baseline Allocation</strong> first to establish the operational benchmark before running comparison analysis.
        </p>
      </div>
    );
  }

  if (!recoveryResult) {
    return (
      <div className="card" style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
        <AlertTriangle size={36} style={{ margin: '0 auto 12px auto', color: '#f59e0b', opacity: 0.8 }} />
        <h4 style={{ color: '#f8fafc', margin: '0 0 6px 0' }}>Baseline Benchmark Established</h4>
        <p style={{ fontSize: '0.85rem', maxWidth: '540px', margin: '0 auto 16px auto' }}>
          Baseline allocation established ({baselineResult.assignedCount} assigned, {baselineResult.unmetCount} unmet).
          Now trigger a vehicle breakdown or road closure above and click below to view comparative analysis.
        </p>
        <button
          type="button"
          className="btn btn-warning"
          onClick={onRunRecovery}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={15} />
          <span>Execute Recovery Allocation Now</span>
        </button>
      </div>
    );
  }

  const diff = computeAllocationDiff(baselineResult, recoveryResult);

  const displacedCount = diff.displacedAssignments.filter(d => d.newStatus === 'UNMET').length;
  const reroutedCount = diff.displacedAssignments.filter(d => d.newStatus === 'REROUTED').length;

  const assignedDelta = recoveryResult.assignedCount - baselineResult.assignedCount;
  const unmetDelta = recoveryResult.unmetCount - baselineResult.unmetCount;

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeftRight size={18} className="text-primary" />
          <h3 className="card-title" style={{ margin: 0 }}>
            Before-and-After Analysis (Baseline vs Recovery Delta)
          </h3>
        </div>
        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
          Empirical Disruption Impact Audit
        </span>
      </div>

      <div className="card-body">
        {/* KPI Delta Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {/* Card 1: Assigned Seats Delta */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Assigned Students
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8' }}>
                {baselineResult.assignedCount}
              </span>
              <ArrowRight size={16} className="text-muted" />
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: assignedDelta < 0 ? '#ef4444' : '#10b981' }}>
                {recoveryResult.assignedCount}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: assignedDelta < 0 ? '#ef4444' : '#10b981' }}>
                ({assignedDelta > 0 ? '+' : ''}{assignedDelta})
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              Baseline $\to$ Recovery Allocation
            </div>
          </div>

          {/* Card 2: Unmet Demand Delta */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Unmet Demand
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#94a3b8' }}>
                {baselineResult.unmetCount}
              </span>
              <ArrowRight size={16} className="text-muted" />
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: unmetDelta > 0 ? '#ef4444' : '#10b981' }}>
                {recoveryResult.unmetCount}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: unmetDelta > 0 ? '#ef4444' : '#10b981' }}>
                ({unmetDelta > 0 ? '+' : ''}{unmetDelta})
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              {unmetDelta > 0 ? 'Surge in stranded students' : 'Demand stabilized'}
            </div>
          </div>

          {/* Card 3: Displaced Students */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Displaced Students
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', marginTop: '6px' }}>
              {displacedCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              Had seats in baseline, now unmet
            </div>
          </div>

          {/* Card 4: Rerouted Students */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Rerouted Students
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>
              {reroutedCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              Reassigned to alternative surviving vehicles
            </div>
          </div>
        </div>

        {/* Visual Comparison Charts Grid */}
        <div className="grid-2" style={{ marginBottom: '20px' }}>
          {/* Chart 1: Student Accommodation Visual Bar Comparison */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} className="text-primary" />
              Student Accommodation Comparison
            </div>

            {/* Baseline Bars */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '3px' }}>
                <span>Baseline ({baselineResult.totalRequests} Requests)</span>
                <span>{baselineResult.assignedCount} Assigned · {baselineResult.unmetCount} Unmet</span>
              </div>
              <div style={{ width: '100%', height: 16, background: '#1e293b', borderRadius: 4, display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: `${(baselineResult.assignedCount / baselineResult.totalRequests) * 100}%`, background: '#10b981' }} title={`Assigned: ${baselineResult.assignedCount}`} />
                <div style={{ width: `${(baselineResult.unmetCount / baselineResult.totalRequests) * 100}%`, background: '#ef4444' }} title={`Unmet: ${baselineResult.unmetCount}`} />
              </div>
            </div>

            {/* Recovery Bars */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '3px' }}>
                <span>Recovery ({recoveryResult.totalRequests} Requests)</span>
                <span>{recoveryResult.assignedCount} Assigned · {recoveryResult.unmetCount} Unmet</span>
              </div>
              <div style={{ width: '100%', height: 16, background: '#1e293b', borderRadius: 4, display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: `${(recoveryResult.assignedCount / recoveryResult.totalRequests) * 100}%`, background: '#10b981' }} title={`Assigned: ${recoveryResult.assignedCount}`} />
                <div style={{ width: `${(recoveryResult.unmetCount / recoveryResult.totalRequests) * 100}%`, background: '#ef4444' }} title={`Unmet: ${recoveryResult.unmetCount}`} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 10, height: 10, background: '#10b981', borderRadius: 2 }} />
                Assigned
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: 2 }} />
                Unmet Demand
              </span>
            </div>
          </div>

          {/* Chart 2: Vehicle-by-Vehicle Capacity Delta */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bus size={16} className="text-primary" />
              Vehicle Capacity Load Comparison
            </div>

            {diff.capacityDelta.map(c => {
              const utilBase = baselineResult.tripUtilization.find(u => u.tripId === c.tripId);
              const utilRec = recoveryResult.tripUtilization.find(u => u.tripId === c.tripId);
              const capacity = utilBase?.capacity || 5;

              return (
                <div key={c.tripId} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                    <span style={{ color: utilRec?.isCancelled ? '#ef4444' : '#f8fafc', fontWeight: 600 }}>
                      {c.vehicleName.split('—')[0]}
                      {utilRec?.isCancelled && <span className="badge badge-danger" style={{ marginLeft: 6, fontSize: '0.65rem' }}>DISABLED</span>}
                    </span>
                    <span style={{ color: '#94a3b8' }}>
                      {c.baselineAllocated} $\to$ <b>{c.recoveryAllocated}</b> / {capacity} seats
                    </span>
                  </div>

                  <div style={{ width: '100%', height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: utilRec?.isCancelled ? '0%' : `${(c.recoveryAllocated / capacity) * 100}%`,
                        height: '100%',
                        background: utilRec?.isCancelled ? '#ef4444' : c.recoveryAllocated >= capacity ? '#f59e0b' : '#38bdf8',
                        borderRadius: 4
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Displaced / Rerouted Students Breakdown Table */}
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={16} className="text-warning" />
          Displaced or Rerouted Student Audit Roster ({diff.displacedAssignments.length})
        </h4>

        {diff.displacedAssignments.length === 0 ? (
          <div style={{ padding: '16px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', fontSize: '0.825rem', color: '#10b981', textAlign: 'center' }}>
            ✓ No students were displaced or rerouted between baseline and recovery.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Baseline Assignment</th>
                  <th>Recovery Status</th>
                  <th>Root Cause & Operational Explanation</th>
                </tr>
              </thead>
              <tbody>
                {diff.displacedAssignments.map((disp, i) => (
                  <tr key={i} style={{ background: disp.newStatus === 'UNMET' ? '#450a0a25' : '#0f172a' }}>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{disp.studentName}</td>
                    <td>
                      <span className="badge badge-secondary">{disp.previousTripName}</span>
                    </td>
                    <td>
                      {disp.newStatus === 'UNMET' ? (
                        <span className="badge badge-danger">Displaced (Unmet)</span>
                      ) : (
                        <span className="badge badge-success">Rerouted $\to$ {disp.newTripName}</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: disp.newStatus === 'UNMET' ? '#fca5a5' : '#7dd3fc' }}>
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
