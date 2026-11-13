import React, { useState } from 'react';
import {
  CheckCircle2,
  Search,
  Bus,
  MapPin,
  School,
  Award,
  Route,
  LayoutGrid,
  List,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Assignment } from '../../types';

interface AssignmentTableProps {
  assignments: Assignment[];
}

export const AssignmentTable: React.FC<AssignmentTableProps> = ({ assignments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

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
      <div className="card-header" style={{ background: '#f8f9fa', borderBottom: '1px solid #e2e4e8' }}>
        <div>
          <h3 className="card-title">
            <CheckCircle2 size={18} color="#00a698" />
            Confirmed Transport Assignments ({filtered.length})
          </h3>
          <p style={{ fontSize: '0.775rem', color: '#686974', marginTop: '2px' }}>
            Capacity-bound boarding passes and vehicle seat allocations reaching institutions on time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'inline-flex', background: '#e2e4e8', borderRadius: '6px', padding: '2px' }}>
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              style={{
                background: viewMode === 'CARDS' ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: viewMode === 'CARDS' ? '#0770e3' : '#686974',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <LayoutGrid size={13} />
              <span>Tickets</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              style={{
                background: viewMode === 'TABLE' ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: viewMode === 'TABLE' ? '#0770e3' : '#686974',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <List size={13} />
              <span>Table</span>
            </button>
          </div>

          <div style={{ position: 'relative', minWidth: '180px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search student or village..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.8rem', paddingLeft: '28px', padding: '6px 10px 6px 28px' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#8f929d' }} />
          </div>

          <select
            className="form-select"
            value={filterVehicle}
            onChange={e => setFilterVehicle(e.target.value)}
            style={{ fontSize: '0.8rem', width: 'auto', padding: '6px 12px' }}
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

      <div className="card-body" style={{ padding: viewMode === 'CARDS' ? '20px' : 0 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#686974' }}>
            No students currently assigned under these filter criteria. Run an allocation or adjust filters.
          </div>
        ) : viewMode === 'CARDS' ? (
          /* Skyscanner Boarding Pass Ticket Cards */
          <div>
            {filtered.map(a => (
              <div className="ticket-card" key={`${a.requestId}-${a.tripId}`}>
                <div className="ticket-main">
                  {/* Vehicle & Seat info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        background: '#e8f3fe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0770e3',
                        flexShrink: 0
                      }}
                    >
                      <Bus size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111215' }}>
                        {a.vehicleName.split('—')[0]}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#686974' }}>
                        Seat <strong>#{a.seatNumber}</strong> • {a.studentName}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#8f929d' }}>{a.gradeOrStream}</div>
                    </div>
                  </div>

                  {/* Flight/Bus Route Segment Bar */}
                  <div className="ticket-flight-segment">
                    <div className="ticket-time-col">
                      <div className="ticket-time-val">{a.pickupTime}</div>
                      <div className="ticket-station-code">{a.pickupVillageName}</div>
                    </div>

                    <div className="ticket-duration-bar">
                      <div className="ticket-duration-text">
                        {a.routeDetails?.hasDetour ? `+${a.routeDetails.detourMinutesAdded}m Detour` : 'Direct Route'}
                      </div>
                      <div className="ticket-route-line"></div>
                      <div className={`ticket-stops-text ${a.routeDetails?.hasDetour ? 'detour' : ''}`}>
                        {a.routeDetails?.hasDetour ? 'Via Adyar Ridge' : 'On-Time Guaranteed'}
                      </div>
                    </div>

                    <div className="ticket-time-col" style={{ textAlign: 'right' }}>
                      <div className="ticket-time-val" style={{ color: '#00a698' }}>{a.dropoffTime}</div>
                      <div className="ticket-station-code">{a.dropoffInstitutionName}</div>
                    </div>
                  </div>

                  {/* Priority Badge */}
                  <div className="ticket-actions-col">
                    {a.isExamStudent ? (
                      <span className="badge badge-warning" style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <Award size={12} /> EXAM BUFFER (08:15)
                      </span>
                    ) : (
                      <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <CheckCircle2 size={12} /> ON-TIME ASSIGNED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
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
                          background: '#e6f6f5',
                          border: '1px solid #00a698',
                          borderRadius: '50%',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          color: '#05655d'
                        }}
                      >
                        {a.seatNumber}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#111215' }}>{a.studentName}</span>
                        {a.isExamStudent && (
                          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                            <Award size={10} /> EXAM
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#686974' }}>{a.gradeOrStream}</div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Bus size={14} color="#0770e3" />
                        <span style={{ fontWeight: 700, color: '#05203c' }}>{a.vehicleName}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="#8f929d" />
                        <span>{a.pickupVillageName}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                        Depart: <strong>{a.pickupTime}</strong>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <School size={13} color="#8f929d" />
                        <span>{a.dropoffInstitutionName}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#05655d' }}>
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
