import React, { useState } from 'react';
import { Route, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { TransportConnection, VehicleTrip } from '../../types';

interface RoadConnectionsListProps {
  connections: TransportConnection[];
  trips: VehicleTrip[];
  onToggleConnection: (connectionId: string, blockedReason?: string) => void;
}

export const RoadConnectionsList: React.FC<RoadConnectionsListProps> = ({
  connections,
  trips,
  onToggleConnection
}) => {
  const [modalConn, setModalConn] = useState<TransportConnection | null>(null);
  const [reason, setReason] = useState('River causeway submerged under 2 feet of water');

  const getTripsUsingConnection = (connId: string) => {
    return trips.filter(t => t.pathConnectionIds.includes(connId));
  };

  const handleConfirmBlock = () => {
    if (modalConn) {
      onToggleConnection(modalConn.id, reason);
      setModalConn(null);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Route size={18} className="text-primary" />
          Transport Corridors & Road Connections ({connections.length})
        </h3>
        <span className="badge badge-neutral">Interactive Road Closures</span>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Corridor Segment</th>
                <th>Distance / Time</th>
                <th>Road Surface Type</th>
                <th>Dependent Trips</th>
                <th>Corridor Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {connections.map(conn => {
                const affectedTrips = getTripsUsingConnection(conn.id);
                return (
                  <tr key={conn.id} style={{ background: conn.isBlocked ? '#fff5f5' : 'inherit' }}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {conn.fromName} ↔ {conn.toName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ID: {conn.id}
                      </div>
                    </td>
                    <td>
                      <div>{conn.distanceKm} km</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>~{conn.travelMinutes} mins</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                        {conn.roadType}
                      </span>
                    </td>
                    <td>
                      {affectedTrips.map(t => (
                        <span
                          key={t.id}
                          className="badge badge-info"
                          style={{ fontSize: '0.65rem', marginRight: '4px', display: 'inline-block' }}
                        >
                          {t.vehicleName.split('—')[0]}
                        </span>
                      ))}
                    </td>
                    <td>
                      {conn.isBlocked ? (
                        <div>
                          <span className="badge badge-danger">
                            <AlertOctagon size={12} /> Impassable
                          </span>
                          <div style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '2px', maxWidth: '240px' }}>
                            {conn.blockedReason || 'Blocked'}
                          </div>
                        </div>
                      ) : (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> Passable
                        </span>
                      )}
                    </td>
                    <td>
                      {conn.isBlocked ? (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onToggleConnection(conn.id)}
                        >
                          Reopen Road
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => {
                            setModalConn(conn);
                            setReason(
                              conn.id === 'seg-siri-mal'
                                ? 'River causeway submerged under 2ft runoff'
                                : 'Culvert damage & road washout'
                            );
                          }}
                        >
                          Simulate Block
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalConn && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="card-title">
                <AlertOctagon size={18} className="text-danger" />
                Block Corridor: {modalConn.fromName} ↔ {modalConn.toName}
              </h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '12px' }}>
                Simulating a road closure will invalidate all trip legs attempting to traverse this segment.
                Students relying on this path will be flagged as unmet due to road blockage.
              </p>
              <div className="form-group">
                <label className="form-label">Road Obstruction Reason *</label>
                <input
                  type="text"
                  className="form-control"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Flash flood on river causeway"
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalConn(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmBlock}
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
