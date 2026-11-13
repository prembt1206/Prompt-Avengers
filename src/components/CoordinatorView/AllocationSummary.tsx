import React from 'react';
import {
  Play,
  RotateCw,
  Users,
  CheckCircle,
  AlertTriangle,
  Bus,
  Armchair,
  Route,
  Ban,
  ShieldAlert,
  Percent
} from 'lucide-react';
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
  // 1. Dynamic Metric Calculations directly from actual application state
  const totalRequests = currentResult ? currentResult.totalRequests : 0;
  const assignedCount = currentResult ? currentResult.assignedCount : 0;
  const unmetCount = currentResult ? currentResult.unmetCount : 0;

  const activeVehicles = trips.filter(t => !t.isCancelled);
  const cancelledVehicles = trips.filter(t => t.isCancelled);
  const blockedRoutes = connections.filter(c => c.isBlocked);

  // Active seat calculation
  const totalActiveSeats = activeVehicles.reduce((sum, t) => sum + t.capacity, 0);
  const occupiedSeats = currentResult?.allocatedCapacity || 0;
  const availableSeats = Math.max(0, totalActiveSeats - occupiedSeats);

  const totalDisruptions = cancelledVehicles.length + blockedRoutes.length;
  const hasDisruptions = totalDisruptions > 0;

  const recoveryPct = totalRequests > 0 ? Math.round((assignedCount / totalRequests) * 100) : 100;

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div
        className="card-header"
        style={{
          background: 'linear-gradient(to right, #1e293b, #0f172a)',
          color: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h3 className="card-title" style={{ color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Play size={18} className="text-primary" />
            Deterministic Allocation Cockpit & Disruption Controls
          </h3>
          <p style={{ fontSize: '0.775rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
            Zero-hallucination transportation resilience · Strictly capacity-bound matching
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onRunBaseline}
            title="Compute baseline allocation for current fleet and demand"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Play size={15} />
            <span>1. Run Baseline Allocation</span>
          </button>

          <button
            type="button"
            className={`btn ${hasDisruptions ? 'btn-warning' : 'btn-secondary'}`}
            onClick={onRunRecovery}
            title="Execute dynamic recovery solver under current vehicle cancellations and route blocks"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCw size={15} />
            <span>2. Run Recovery Allocation</span>
          </button>
        </div>
      </div>

      <div className="card-body">
        {/* Active Disruption Strip */}
        {hasDisruptions && (
          <div
            style={{
              background: '#451a03',
              border: '1px solid #d97706',
              color: '#fef3c7',
              padding: '10px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <span>
                <strong>Active Fleet & Route Disruptions ({totalDisruptions}):</strong>{' '}
                {cancelledVehicles.length > 0 && `${cancelledVehicles.length} vehicle(s) disabled (${cancelledVehicles.map(t => t.vehicleName.split('—')[0]).join(', ')}); `}
                {blockedRoutes.length > 0 && `${blockedRoutes.length} corridor(s) impassable (${blockedRoutes.map(c => `${c.fromName}↔${c.toName}`).join(', ')}).`}
              </span>
            </div>
            <span className="badge badge-warning" style={{ background: '#f59e0b', color: '#000000', fontWeight: 700 }}>
              Run Recovery Allocation Required
            </span>
          </div>
        )}

        {/* Phase 2: All 8 Required KPI Analytics Cards Calculated Dynamically */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {/* 1. Total Student Requests */}
          <div className="kpi-card">
            <div className="kpi-icon-box" style={{ background: '#0284c720', color: '#38bdf8' }}>
              <Users size={20} />
            </div>
            <div>
              <div className="kpi-val">{totalRequests}</div>
              <div className="kpi-label">Total Requests</div>
              <div className="kpi-subtext">Registered students</div>
            </div>
          </div>

          {/* 2. Successfully Allocated Students */}
          <div className="kpi-card">
            <div className="kpi-icon-box" style={{ background: '#05966920', color: '#34d399' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <div className="kpi-val" style={{ color: '#10b981' }}>{assignedCount}</div>
              <div className="kpi-label">Allocated Students</div>
              <div className="kpi-subtext">{recoveryPct}% success rate</div>
            </div>
          </div>

          {/* 3. Unmet Student Demand */}
          <div className="kpi-card">
            <div className="kpi-icon-box" style={{ background: '#dc262620', color: '#f87171' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="kpi-val" style={{ color: unmetCount > 0 ? '#ef4444' : '#94a3b8' }}>{unmetCount}</div>
              <div className="kpi-label">Unmet Demand</div>
              <div className="kpi-subtext">Honest constraint deficit</div>
            </div>
          </div>

          {/* 4. Active Vehicles */}
          <div className="kpi-card">
            <div className="kpi-icon-box" style={{ background: '#4f46e520', color: '#818cf8' }}>
              <Bus size={20} />
            </div>
            <div>
              <div className="kpi-val" style={{ color: '#818cf8' }}>{activeVehicles.length}</div>
              <div className="kpi-label">Active Vehicles</div>
              <div className="kpi-subtext">Operating on corridors</div>
            </div>
          </div>

          {/* 5. Occupied Seats */}
          <div className="kpi-card">
            <div className="kpi-icon-box" style={{ background: '#d9770620', color: '#fbbf24' }}>
              <Armchair size={20} />
            </div>
            <div>
              <div className="kpi-val" style={{ color: '#f59e0b' }}>{occupiedSeats}</div>
              <div className="kpi-label">Occupied Seats</div>
              <div className="kpi-subtext">Boarding pass issued</div>
            </div>
          </div>

          {/* 6. Available Seats */}
          <div className="kpi-card">
            <div className="kpi-icon-box" style={{ background: '#0284c720', color: '#38bdf8' }}>
              <Percent size={20} />
            </div>
            <div>
              <div className="kpi-val" style={{ color: availableSeats > 0 ? '#38bdf8' : '#94a3b8' }}>{availableSeats}</div>
              <div className="kpi-label">Available Seats</div>
              <div className="kpi-subtext">Surplus active capacity</div>
            </div>
          </div>

          {/* 7. Blocked Routes */}
          <div className="kpi-card">
            <div className="kpi-icon-box" style={{ background: blockedRoutes.length > 0 ? '#dc262620' : '#05966920', color: blockedRoutes.length > 0 ? '#f87171' : '#34d399' }}>
              <Route size={20} />
            </div>
            <div>
              <div className="kpi-val" style={{ color: blockedRoutes.length > 0 ? '#ef4444' : '#10b981' }}>{blockedRoutes.length}</div>
              <div className="kpi-label">Blocked Routes</div>
              <div className="kpi-subtext">{blockedRoutes.length > 0 ? 'Obstruction active' : 'All corridors open'}</div>
            </div>
          </div>

          {/* 8. Cancelled Vehicles */}
          <div className="kpi-card">
            <div className="kpi-icon-box" style={{ background: cancelledVehicles.length > 0 ? '#dc262620' : '#05966920', color: cancelledVehicles.length > 0 ? '#f87171' : '#34d399' }}>
              <Ban size={20} />
            </div>
            <div>
              <div className="kpi-val" style={{ color: cancelledVehicles.length > 0 ? '#ef4444' : '#10b981' }}>{cancelledVehicles.length}</div>
              <div className="kpi-label">Cancelled Vehicles</div>
              <div className="kpi-subtext">{cancelledVehicles.length > 0 ? 'Out of service' : 'Full fleet available'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
