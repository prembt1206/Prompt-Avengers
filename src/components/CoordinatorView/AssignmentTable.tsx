import React, { useState } from 'react';
import { CheckCircle2, Search, Bus, MapPin, School, Award, Route } from 'lucide-react';
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
      <div className="card-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <h3 className="card-title">
            <CheckCircle2 size={18} className="text-success" />
            Validated On-Time Student Assignments ({filtered.length})
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
            Capacity-bound physical seat allocations reaching institutions on time.
          </p>
        </div>

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
            <option value="ALL">All Active Vehicles</option>
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
                  <th>Pickup Stop & Departure</th>
                  <th>Destination & Estimated Arrival</th>
                  <th>Routing & Category</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={`${a.requestId}-${a.tripId}`} style={{ background: a.isExamStudent ? '#fffdf7' : 'inherit' }}>
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
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          color: '#065f46'
                        }}
                      >
                        {a.seatNumber}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{a.studentName}</span>
                        {a.isExamStudent && (
                          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                            <Award size={10} /> EXAM
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.gradeOrStream}</div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Bus size={14} className="text-teal" />
                        <span style={{ fontWeight: 700, color: '#042f2e' }}>{a.vehicleName}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} className="text-muted" />
                        <span>{a.pickupVillageName}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                        Depart: <strong>{a.pickupTime}</strong>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <School size={13} className="text-muted" />
                        <span>{a.dropoffInstitutionName}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#065f46' }}>
                        Arrive: <strong>{a.dropoffTime}</strong> (On-Time)
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {a.isExamStudent ? (
                          <span className="badge badge-danger" style={{ alignSelf: 'flex-start' }}>
                            Exam Candidate ({a.examStartTime})
                          </span>
                        ) : (
                          <span className="badge badge-neutral" style={{ alignSelf: 'flex-start' }}>
                            Regular Student
                          </span>
                        )}

                        {a.routeDetails?.hasDetour && (
                          <span
                            className="badge badge-info"
                            style={{ alignSelf: 'flex-start', fontSize: '0.65rem' }}
                            title="Rerouted around flooded road corridor using Adyar Ridge bypass"
                          >
                            <Route size={10} /> Alternative Bypass (+{a.routeDetails.detourMinutesAdded}m detour)
                          </span>
                        )}
                      </div>
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
