import React from 'react';
import {
  BarChart3,
  PieChart,
  Bus,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import {
  VehicleTrip,
  StudentRequest,
  AllocationResult,
  Village,
  TransportConnection
} from '../../types';

interface TransportOverviewProps {
  trips: VehicleTrip[];
  requests: StudentRequest[];
  allocationResult: AllocationResult | null;
  villages: Village[];
  connections: TransportConnection[];
}

export const TransportOverview: React.FC<TransportOverviewProps> = ({
  trips,
  requests,
  allocationResult,
  villages,
  connections
}) => {
  // 1. Vehicle Capacity & Seat Utilization
  const tripUtils = allocationResult?.tripUtilization || [];

  // 2. Village-wise demand vs assigned
  const demandByVillage = new Map<string, number>();
  requests.forEach(r => {
    demandByVillage.set(r.originVillageId, (demandByVillage.get(r.originVillageId) || 0) + 1);
  });

  const assignedByVillage = new Map<string, number>();
  allocationResult?.assignments.forEach(a => {
    assignedByVillage.set(a.pickupVillageId, (assignedByVillage.get(a.pickupVillageId) || 0) + 1);
  });

  // 3. Priority categories count
  const priorityCounts = {
    CRITICAL_EXAM: requests.filter(r => r.priorityCategory === 'CRITICAL_EXAM').length,
    LAB_PRACTICAL: requests.filter(r => r.priorityCategory === 'LAB_PRACTICAL').length,
    REGULAR_ATTENDANCE: requests.filter(r => r.priorityCategory === 'REGULAR_ATTENDANCE').length
  };

  const assignedPriorityCounts = {
    CRITICAL_EXAM: allocationResult?.assignments.filter(a => a.priorityCategory === 'CRITICAL_EXAM').length || 0,
    LAB_PRACTICAL: allocationResult?.assignments.filter(a => a.priorityCategory === 'LAB_PRACTICAL').length || 0,
    REGULAR_ATTENDANCE: allocationResult?.assignments.filter(a => a.priorityCategory === 'REGULAR_ATTENDANCE').length || 0
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* 2-Column Grid: Fleet Utilization Chart + Demand Fulfillment Chart */}
      <div className="grid-2" style={{ marginBottom: '20px' }}>
        {/* Chart 1: Vehicle Capacity & Utilization */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Bus size={18} className="text-primary" />
              Vehicle Capacity & Seat Load Breakdown
            </h3>
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Real-time Load</span>
          </div>

          <div className="card-body">
            {trips.map(trip => {
              const util = tripUtils.find(u => u.tripId === trip.id);
              const allocated = util?.allocatedSeats || 0;
              const cap = trip.capacity;
              const pct = cap > 0 ? Math.round((allocated / cap) * 100) : 0;
              const isCancelled = trip.isCancelled;

              return (
                <div key={trip.id} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: isCancelled ? '#ef4444' : '#f8fafc' }}>
                      {trip.vehicleName.split('—')[0]}
                      {isCancelled && <span className="badge badge-danger" style={{ marginLeft: 6, fontSize: '0.65rem' }}>DISABLED</span>}
                    </span>
                    <span style={{ color: '#94a3b8' }}>
                      <b>{allocated}</b> / {cap} seats ({pct}%)
                    </span>
                  </div>

                  <div style={{ width: '100%', height: 10, background: '#1e293b', borderRadius: 5, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: isCancelled ? '0%' : `${pct}%`,
                        height: '100%',
                        background: isCancelled ? '#ef4444' : pct >= 100 ? '#f59e0b' : '#0ea5e9',
                        borderRadius: 5,
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Village-Wise Fulfillment Rates */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Users size={18} className="text-primary" />
              Village Demand vs Verified Allocation
            </h3>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Corridor Equity</span>
          </div>

          <div className="card-body">
            {villages.map(v => {
              const dem = demandByVillage.get(v.id) || 0;
              const ass = assignedByVillage.get(v.id) || 0;
              const pct = dem > 0 ? Math.round((ass / dem) * 100) : 100;

              return (
                <div key={v.id} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>
                      {v.name}
                    </span>
                    <span style={{ color: '#94a3b8' }}>
                      <b style={{ color: pct === 100 ? '#10b981' : pct < 50 ? '#ef4444' : '#f59e0b' }}>{ass}</b> / {dem} students ({pct}%)
                    </span>
                  </div>

                  <div style={{ width: '100%', height: 10, background: '#1e293b', borderRadius: 5, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: pct === 100 ? '#10b981' : pct < 50 ? '#ef4444' : '#f59e0b',
                        borderRadius: 5,
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority Triage Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <ShieldCheck size={18} className="text-primary" />
            Academic Priority Triage Roster
          </h3>
          <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
            Board Exams Prioritised by Policy
          </span>
        </div>

        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Priority 1 */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>Priority 1</span>
                <span style={{ fontWeight: 700, color: '#f87171' }}>
                  {assignedPriorityCounts.CRITICAL_EXAM} / {priorityCounts.CRITICAL_EXAM}
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                Critical Board Examinations
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                SSLC / PUC / BTE Final & Preparatory candidates receive absolute first seating claim.
              </div>
            </div>

            {/* Priority 2 */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>Priority 2</span>
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>
                  {assignedPriorityCounts.LAB_PRACTICAL} / {priorityCounts.LAB_PRACTICAL}
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                Lab Practicals & Technical Workshops
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                Science laboratory and KPT engineering machinery workshops graded internally.
              </div>
            </div>

            {/* Priority 3 */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>Priority 3</span>
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                  {assignedPriorityCounts.REGULAR_ATTENDANCE} / {priorityCounts.REGULAR_ATTENDANCE}
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                Regular Academic Attendance
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                Standard classroom syllabus attendance; seated on remaining vehicle capacity.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
