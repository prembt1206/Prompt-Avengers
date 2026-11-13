import React, { useState } from 'react';
import { Bus, Users, Clock, AlertTriangle, CheckCircle, Edit3, XCircle } from 'lucide-react';
import { VehicleTrip, TripUtilization } from '../../types';

interface VehicleTripListProps {
  trips: VehicleTrip[];
  tripUtilizations?: TripUtilization[];
  onUpdateCapacity: (tripId: string, newCapacity: number) => void;
  onToggleCancellation: (tripId: string, cancelReason?: string) => void;
}

export const VehicleTripList: React.FC<VehicleTripListProps> = ({
  trips,
  tripUtilizations = [],
  onUpdateCapacity,
  onToggleCancellation
}) => {
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [cancelModalTrip, setCancelModalTrip] = useState<VehicleTrip | null>(null);
  const [customReason, setCustomReason] = useState('Radiator crack & engine overheat');

  const utilMap = new Map(tripUtilizations.map(u => [u.tripId, u]));

  const handleCapacityChange = (tripId: string, delta: number, currentCap: number) => {
    const nextCap = Math.max(0, Math.min(20, currentCap + delta));
    onUpdateCapacity(tripId, nextCap);
  };

  const confirmCancel = () => {
    if (cancelModalTrip) {
      onToggleCancellation(cancelModalTrip.id, customReason);
      setCancelModalTrip(null);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Bus size={18} className="text-primary" />
          Fleet & Vehicle Trips ({trips.length})
        </h3>
        <span className="badge badge-neutral">Capacity Editable</span>
      </div>
      <div className="card-body">
        <div className="grid-3">
          {trips.map(trip => {
            const util = utilMap.get(trip.id);
            const allocated = util?.allocatedSeats || 0;
            const cap = trip.capacity;
            const pct = cap > 0 ? Math.round((allocated / cap) * 100) : 0;
            const isFull = allocated >= cap && cap > 0;

            return (
              <div
                key={trip.id}
                style={{
                  border: trip.isCancelled
                    ? '2px solid #ef4444'
                    : util?.isBlocked
                    ? '2px solid #f59e0b'
                    : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  background: trip.isCancelled ? '#fff5f5' : '#ffffff',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* Status header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                        {trip.vehicleName}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {trip.registrationNumber} • {trip.vehicleType}
                      </p>
                    </div>
                    {trip.isCancelled ? (
                      <span className="badge badge-danger">
                        <XCircle size={12} /> Cancelled
                      </span>
                    ) : util?.isBlocked ? (
                      <span className="badge badge-warning">
                        <AlertTriangle size={12} /> Route Blocked
                      </span>
                    ) : isFull ? (
                      <span className="badge badge-warning">Full ({allocated}/{cap})</span>
                    ) : (
                      <span className="badge badge-success">Active</span>
                    )}
                  </div>

                  {trip.isCancelled && (
                    <div style={{ background: '#fee2e2', color: '#991b1b', padding: '6px 8px', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '10px' }}>
                      <strong>Reason:</strong> {trip.cancelReason || 'Vehicle unavailable'}
                    </div>
                  )}

                  {/* Destination & schedule */}
                  <div style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '12px', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Clock size={13} className="text-muted" />
                      <span><strong>Departs:</strong> {trip.departureTime} → <strong>Arrives:</strong> {trip.finalArrivalTime}</span>
                    </div>
                    <div>
                      <strong>Destination:</strong> {trip.destinationName}
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '0.75rem', color: '#64748b' }}>
                      <strong>Stops:</strong> {trip.stops.map(s => `${s.villageName} (${s.departureTime})`).join(' → ')}
                    </div>
                  </div>

                  {/* Capacity Control */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={14} /> Seat Capacity:
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '2px 8px', fontWeight: 'bold' }}
                          onClick={() => handleCapacityChange(trip.id, -1, trip.capacity)}
                          disabled={trip.capacity <= 1}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', minWidth: '24px', textAlign: 'center' }}>
                          {trip.capacity}
                        </span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '2px 8px', fontWeight: 'bold' }}
                          onClick={() => handleCapacityChange(trip.id, +1, trip.capacity)}
                          disabled={trip.capacity >= 20}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Occupancy bar */}
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min(100, pct)}%`,
                          background: trip.isCancelled ? '#94a3b8' : isFull ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: '#64748b', marginTop: '2px' }}>
                      <span>{allocated} allocated</span>
                      <span>{pct}% utilized</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  {trip.isCancelled ? (
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => onToggleCancellation(trip.id)}
                    >
                      <CheckCircle size={14} /> Restore Vehicle
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => {
                        setCancelModalTrip(trip);
                        setCustomReason('Radiator crack & engine overheat during depot pre-trip check');
                      }}
                    >
                      <XCircle size={14} /> Cancel Vehicle Trip
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalTrip && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="card-title">
                <AlertTriangle size={18} className="text-danger" />
                Cancel Vehicle Trip: {cancelModalTrip.vehicleName}
              </h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '12px' }}>
                Marking this vehicle unavailable will remove all of its scheduled seats.
                Run Recovery Allocation afterwards to transparently reroute eligible students or flag unmet demand.
              </p>
              <div className="form-group">
                <label className="form-label">Disruption / Cancellation Reason *</label>
                <input
                  type="text"
                  className="form-control"
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  placeholder="e.g. Broken leaf spring / Driver unwell"
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCancelModalTrip(null)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmCancel}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

