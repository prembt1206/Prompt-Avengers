import React, { useState } from 'react';
import { CheckCircle2, Search, Filter, Bus, MapPin, School } from 'lucide-react';
import { Assignment } from '../../types';

interface AssignmentTableProps {
  assignments: Assignment[];
}

export const AssignmentTable: React.FC<AssignmentTableProps> = ({ assignments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('ALL');

  const vehicles = Array.from(new Set(assignments.map(a => a.vehicleName)));

  const filtered = assignments.filter(a => {
    const matchesSearch =
      a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.pickupVillageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.vehicleName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicle = filterVehicle === 'ALL' || a.vehicleName === filterVehicle;
    return matchesSearch && matchesVehicle;
  });

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <CheckCircle2 size={18} className="text-success" />
          Validated Student Assignments ({filtered.length})
        </h3>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '180px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search student or village..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.8rem', paddingLeft: '28px' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>

          <select
            className="form-select"
            value={filterVehicle}
            onChange={e => setFilterVehicle(e.target.value)}
            style={{ fontSize: '0.8rem', width: 'auto' }}
          >
            <option value="ALL">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v} value={v}>
                {v.split('—')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card-body" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
            No students currently assigned under these filter criteria. Run an allocation or adjust filters.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Seat #</th>
                  <th>Student</th>
                  <th>Assigned Vehicle</th>
                  <th>Pickup (Village)</th>
                  <th>Drop-off (Institution)</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={`${a.requestId}-${a.tripId}`}>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          background: '#ecfdf5',
                          border: '1px solid #10b981',
                          borderRadius: '50%',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          color: '#065f46'
                        }}
                      >
                        {a.seatNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.gradeOrStream}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Bus size={14} className="text-primary" />
                        <span style={{ fontWeight: 600, color: '#1e3a8a' }}>{a.vehicleName}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} className="text-muted" />
                        <span>{a.pickupVillageName}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Depart: <strong>{a.pickupTime}</strong>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <School size={13} className="text-muted" />
                        <span>{a.dropoffInstitutionName}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Arrive: <strong>{a.dropoffTime}</strong>
                      </div>
                    </td>
                    <td>
                      {a.priorityCategory === 'CRITICAL_EXAM' && (
                        <span className="badge badge-danger">Exam Priority</span>
                      )}
                      {a.priorityCategory === 'LAB_PRACTICAL' && (
                        <span className="badge badge-warning">Lab Practical</span>
                      )}
                      {a.priorityCategory === 'REGULAR_ATTENDANCE' && (
                        <span className="badge badge-neutral">Regular</span>
                      )}
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
