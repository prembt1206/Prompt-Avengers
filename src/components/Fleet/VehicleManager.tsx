import React, { useState } from 'react';
import {
  Bus,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Shield,
  Gauge
} from 'lucide-react';
import { VehicleTrip, VehicleStatus, AllocationResult, Village, Institution } from '../../types';
import { TrackingService, TelemetryUpdate } from '../../services/trackingService';
import { AuditService } from '../../services/auditService';
import { AuthService } from '../../services/authService';

interface VehicleManagerProps {
  trips: VehicleTrip[];
  allocationResult: AllocationResult | null;
  villages: Village[];
  institutions: Institution[];
  onAddVehicle: (newTrip: VehicleTrip) => void;
  onUpdateVehicle: (updatedTrip: VehicleTrip) => void;
  onDeleteVehicle: (tripId: string) => void;
  onToggleCancellation: (tripId: string, reason?: string) => void;
}

export const VehicleManager: React.FC<VehicleManagerProps> = ({
  trips,
  allocationResult,
  villages,
  institutions,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onToggleCancellation
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<VehicleTrip | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);

  // Form states for Add / Edit
  const [vehicleName, setVehicleName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleTrip['vehicleType']>('Mini-Bus');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [capacity, setCapacity] = useState(6);
  const [destInstitutionId, setDestInstitutionId] = useState(institutions[0]?.id || '');
  const [speedKmh, setSpeedKmh] = useState(40);

  const currentUser = AuthService.getCurrentUser();
  const canEdit = AuthService.canManageFleet(currentUser);

  const openAddModal = () => {
    setVehicleName('');
    setRegNumber('KA-19-');
    setVehicleType('Mini-Bus');
    setDriverName('');
    setDriverPhone('+91 9');
    setCapacity(6);
    setDestInstitutionId(institutions[0]?.id || '');
    setSpeedKmh(40);
    setIsAddModalOpen(true);
  };

  const openEditModal = (trip: VehicleTrip) => {
    setEditingTrip(trip);
    setVehicleName(trip.vehicleName);
    setRegNumber(trip.registrationNumber);
    setVehicleType(trip.vehicleType);
    setDriverName(trip.driverName);
    setDriverPhone(trip.driverPhone || '+91 ');
    setCapacity(trip.capacity);
    setDestInstitutionId(trip.destinationInstitutionId);
    setSpeedKmh(trip.speedKmh || 40);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleName.trim() || !regNumber.trim() || !driverName.trim()) return;

    const dest = institutions.find(i => i.id === destInstitutionId);
    const newTrip: VehicleTrip = {
      id: `trip-${Date.now()}`,
      vehicleName: vehicleName.trim(),
      registrationNumber: regNumber.trim().toUpperCase(),
      vehicleType,
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      capacity: Number(capacity),
      isCancelled: false,
      destinationInstitutionId: destInstitutionId,
      destinationName: dest ? dest.name : 'Unknown Destination',
      departureTime: '07:30',
      finalArrivalTime: '08:25',
      status: 'Available',
      speedKmh: Number(speedKmh),
      stops: [
        {
          villageId: villages[0]?.id || 'vil-farangipete',
          villageName: villages[0]?.name || 'Farangipete Junction',
          arrivalTime: '07:30',
          departureTime: '07:35',
          order: 1
        }
      ],
      pathConnectionIds: ['seg-far-aloysius']
    };

    onAddVehicle(newTrip);
    AuditService.record(
      currentUser.name,
      currentUser.role,
      'VEHICLE_ADDED',
      `Added new vehicle ${newTrip.vehicleName} (${newTrip.registrationNumber}) with capacity ${newTrip.capacity}.`
    );
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;

    const dest = institutions.find(i => i.id === destInstitutionId);
    const updated: VehicleTrip = {
      ...editingTrip,
      vehicleName: vehicleName.trim(),
      registrationNumber: regNumber.trim().toUpperCase(),
      vehicleType,
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      capacity: Number(capacity),
      destinationInstitutionId: destInstitutionId,
      destinationName: dest ? dest.name : editingTrip.destinationName,
      speedKmh: Number(speedKmh)
    };

    onUpdateVehicle(updated);
    AuditService.record(
      currentUser.name,
      currentUser.role,
      'VEHICLE_UPDATED',
      `Updated vehicle ${updated.vehicleName}: Capacity ${updated.capacity}, Driver ${updated.driverName}.`
    );
    setEditingTrip(null);
  };

  const confirmDelete = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    onDeleteVehicle(tripId);
    AuditService.record(
      currentUser.name,
      currentUser.role,
      'VEHICLE_DELETED',
      `Deleted vehicle ${trip?.vehicleName || tripId} from active fleet.`
    );
    setDeletingTripId(null);
  };

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bus size={18} className="text-primary" />
          <h3 className="card-title" style={{ margin: 0 }}>
            Fleet Telematics & Vehicle Registry ({trips.length} Vehicles)
          </h3>
        </div>

        {canEdit && (
          <button
            type="button"
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={openAddModal}
          >
            <Plus size={15} />
            <span>Add Vehicle</span>
          </button>
        )}
      </div>

      <div className="card-body" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle & Reg Number</th>
                <th>Type</th>
                <th>Driver & Contact</th>
                <th>Destination</th>
                <th>Seats (Allocated / Cap)</th>
                <th>Telematics Status</th>
                <th>ETA</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(trip => {
                const util = allocationResult?.tripUtilization.find(u => u.tripId === trip.id);
                const occupied = util?.allocatedSeats || 0;
                const capacity = trip.capacity;
                const available = Math.max(0, capacity - occupied);
                const telem = TrackingService.getTelemetry(trip.id);

                let statusText: VehicleStatus = trip.isCancelled ? 'Breakdown' : (trip.status || 'Available');
                let badgeClass = 'badge-success';
                if (trip.isCancelled) badgeClass = 'badge-danger';
                else if (occupied >= capacity) badgeClass = 'badge-warning';

                return (
                  <tr key={trip.id} style={{ opacity: trip.isCancelled ? 0.75 : 1 }}>
                    <td>
                      <div style={{ fontWeight: 600, color: trip.isCancelled ? '#ef4444' : '#f8fafc' }}>
                        {trip.vehicleName}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                        {trip.registrationNumber}
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                        {trip.vehicleType}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{trip.driverName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={11} />
                        {trip.driverPhone || '+91 94480 00000'}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{trip.destinationName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Dep: {trip.departureTime} · Arr: {trip.finalArrivalTime}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{occupied} / {capacity}</span>
                        <span style={{ fontSize: '0.75rem', color: available > 0 ? '#10b981' : '#ef4444' }}>
                          ({available} free)
                        </span>
                      </div>
                      <div style={{ width: '100%', height: 4, background: '#334155', borderRadius: 2, marginTop: 4 }}>
                        <div
                          style={{
                            width: `${Math.min(100, Math.round((occupied / capacity) * 100))}%`,
                            height: '100%',
                            background: occupied >= capacity ? '#ef4444' : '#0ea5e9',
                            borderRadius: 2
                          }}
                        />
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${badgeClass}`}>
                        {statusText}
                      </span>
                      {trip.isCancelled && trip.cancelReason && (
                        <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '2px' }}>
                          {trip.cancelReason}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} className="text-primary" />
                        {trip.isCancelled ? '—' : `${telem?.estimatedArrivalMinutes || 35} mins`}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        @{trip.speedKmh || 38} km/h
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {canEdit && (
                          <>
                            <button
                              type="button"
                              className={`btn ${trip.isCancelled ? 'btn-success' : 'btn-danger'}`}
                              style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                              onClick={() => onToggleCancellation(trip.id)}
                              title={trip.isCancelled ? 'Restore Vehicle' : 'Report Breakdown'}
                            >
                              {trip.isCancelled ? 'Restore' : 'Breakdown'}
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ fontSize: '0.7rem', padding: '3px 6px' }}
                              onClick={() => openEditModal(trip)}
                              title="Edit Vehicle"
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ fontSize: '0.7rem', padding: '3px 6px', color: '#ef4444' }}
                              onClick={() => setDeletingTripId(trip.id)}
                              title="Remove Vehicle"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '520px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={20} className="text-primary" />
              Register New Fleet Vehicle
            </h3>

            <form onSubmit={handleSaveAdd}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Vehicle Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Cruiser 04 — Mangalore Feeder Shuttle"
                  value={vehicleName}
                  onChange={e => setVehicleName(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Registration Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="KA-19-XX-0000"
                    value={regNumber}
                    onChange={e => setRegNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vehicle Type *</label>
                  <select
                    className="form-select"
                    value={vehicleType}
                    onChange={e => setVehicleType(e.target.value as any)}
                  >
                    <option value="Mini-Bus">Mini-Bus</option>
                    <option value="Maxi-Cab Van">Maxi-Cab Van</option>
                    <option value="Rural Cruiser">Rural Cruiser</option>
                  </select>
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Driver Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Full driver name"
                    value={driverName}
                    onChange={e => setDriverName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Driver Mobile *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+91 98450 XXXXX"
                    value={driverPhone}
                    onChange={e => setDriverPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Seating Capacity *</label>
                  <input
                    type="number"
                    min={2}
                    max={30}
                    className="form-control"
                    value={capacity}
                    onChange={e => setCapacity(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Operating Speed (km/h)</label>
                  <input
                    type="number"
                    min={20}
                    max={60}
                    className="form-control"
                    value={speedKmh}
                    onChange={e => setSpeedKmh(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Destination School *</label>
                <select
                  className="form-select"
                  value={destInstitutionId}
                  onChange={e => setDestInstitutionId(e.target.value)}
                >
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.schoolStartTime})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {editingTrip && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '520px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit2 size={20} className="text-primary" />
              Modify Vehicle Configuration
            </h3>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Vehicle Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={vehicleName}
                  onChange={e => setVehicleName(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Registration Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={regNumber}
                    onChange={e => setRegNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Seating Capacity *</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    className="form-control"
                    value={capacity}
                    onChange={e => setCapacity(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Driver Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={driverName}
                    onChange={e => setDriverName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Driver Mobile</label>
                  <input
                    type="text"
                    className="form-control"
                    value={driverPhone}
                    onChange={e => setDriverPhone(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingTrip(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTripId && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '440px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} />
              Confirm Vehicle Removal
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
              Are you sure you want to permanently remove this vehicle from the active regional fleet? Any assigned students will be unseated and require re-allocation.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeletingTripId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => confirmDelete(deletingTripId)}
              >
                Yes, Remove Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
