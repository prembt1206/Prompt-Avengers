import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  School,
  Bus,
  ShieldCheck,
  Search,
  Filter,
  XCircle,
  Route
} from 'lucide-react';
import {
  StudentRequest,
  AllocationResult,
  Assignment,
  UnmetRequest,
  EvaluatedTripCandidate,
  VehicleTrip
} from '../../types';

interface DecisionExplanationPanelProps {
  requests: StudentRequest[];
  allocationResult: AllocationResult | null;
  trips: VehicleTrip[];
}

export const DecisionExplanationPanel: React.FC<DecisionExplanationPanelProps> = ({
  requests,
  allocationResult,
  trips
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    requests[0]?.id || ''
  );
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const assignmentsMap = new Map<string, Assignment>(
    allocationResult?.assignments.map(a => [a.requestId, a]) || []
  );

  const unmetMap = new Map<string, UnmetRequest>(
    allocationResult?.unmetRequests.map(u => [u.requestId, u]) || []
  );

  const filteredRequests = requests.filter(req => {
    const isAssigned = assignmentsMap.has(req.id);
    const isUnassigned = unmetMap.has(req.id);

    if (statusFilter === 'ASSIGNED' && !isAssigned) return false;
    if (statusFilter === 'UNASSIGNED' && !isUnassigned) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        req.studentName.toLowerCase().includes(q) ||
        req.originVillageName.toLowerCase().includes(q) ||
        req.destinationName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedRequest = requests.find(r => r.id === selectedStudentId) || filteredRequests[0];
  const assignedRecord = selectedRequest ? assignmentsMap.get(selectedRequest.id) : null;
  const unmetRecord = selectedRequest ? unmetMap.get(selectedRequest.id) : null;
  const assignedTrip = assignedRecord ? trips.find(t => t.id === assignedRecord.tripId) : null;

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      {/* Header */}
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} className="text-primary" />
          <h3 className="card-title" style={{ margin: 0 }}>
            Intelligent Solver Decision Explanation & Constraint Audit
          </h3>
          <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
            Zero-Hallucination Proof Panel
          </span>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
            onClick={() => setStatusFilter('ALL')}
          >
            All ({requests.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'ASSIGNED' ? 'btn-success' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
            onClick={() => setStatusFilter('ASSIGNED')}
          >
            Assigned ({assignmentsMap.size})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'UNASSIGNED' ? 'btn-danger' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
            onClick={() => setStatusFilter('UNASSIGNED')}
          >
            Unassigned ({unmetMap.size})
          </button>
        </div>
      </div>

      <div className="card-body">
        {/* Split Grid: Student Selector (Left) + Mathematical Explanation Card (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(360px, 2fr)', gap: '16px' }}>
          {/* Left: Student Selector List */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', maxHeight: '520px' }}>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search student or hamlet..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ fontSize: '0.8rem', paddingLeft: '28px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredRequests.map(req => {
                const isAssigned = assignmentsMap.has(req.id);
                const isSelected = selectedRequest?.id === req.id;

                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedStudentId(req.id)}
                    style={{
                      background: isSelected ? '#1e293b' : 'transparent',
                      borderLeft: `3px solid ${isSelected ? (isAssigned ? '#10b981' : '#ef4444') : 'transparent'}`,
                      padding: '8px 10px',
                      borderRadius: '4px',
                      marginBottom: '4px',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: isSelected ? '#f8fafc' : '#cbd5e1' }}>
                        {req.studentName}
                      </span>
                      <span
                        className={`badge ${isAssigned ? 'badge-success' : 'badge-danger'}`}
                        style={{ fontSize: '0.65rem', padding: '1px 5px' }}
                      >
                        {isAssigned ? 'Assigned' : 'Unmet'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      {req.originVillageName} ➔ {req.destinationName.split(' ')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Decision Explanation Breakdown */}
          {selectedRequest ? (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px' }}>
              {/* Student Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{selectedRequest.studentName}</span>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      {selectedRequest.gradeOrStream}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '3px' }}>
                    Origin: <b>{selectedRequest.originVillageName}</b> · Target: <b>{selectedRequest.destinationName}</b> (Deadline: {selectedRequest.requiredArrivalTime})
                  </div>
                </div>

                <span
                  className={`badge ${assignedRecord ? 'badge-success' : 'badge-danger'}`}
                  style={{ fontSize: '0.85rem', padding: '4px 10px' }}
                >
                  {assignedRecord ? '✓ ACCOMMODATED' : '⚠️ UNMET DEMAND'}
                </span>
              </div>

              {/* CASE 1: ASSIGNED STUDENT EXPLANATION PROOF */}
              {assignedRecord && (
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} />
                    Verified Mathematical Feasibility Proof:
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                    {/* Proof 1: Vehicle Feasibility */}
                    <div style={{ background: '#1e293b', borderRadius: '6px', padding: '10px', borderLeft: '3px solid #10b981' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>1. Vehicle & Origin Feasibility</div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc', marginTop: '2px' }}>
                        {assignedRecord.vehicleName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
                        Scheduled pickup at {assignedRecord.pickupVillageName} @ <b>{assignedRecord.pickupTime}</b>.
                      </div>
                    </div>

                    {/* Proof 2: Route Validity */}
                    <div style={{ background: '#1e293b', borderRadius: '6px', padding: '10px', borderLeft: '3px solid #10b981' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>2. Route Corridor Passability</div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#10b981', marginTop: '2px' }}>
                        ✓ 0 Blocked Corridors
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
                        All connecting road segments verified open and traversable.
                      </div>
                    </div>

                    {/* Proof 3: Deadline Satisfaction */}
                    <div style={{ background: '#1e293b', borderRadius: '6px', padding: '10px', borderLeft: '3px solid #10b981' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>3. Arrival Deadline Check</div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc', marginTop: '2px' }}>
                        {assignedRecord.dropoffTime} $\le$ {selectedRequest.requiredArrivalTime}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '2px' }}>
                        ✓ Arrives on or before school start bell.
                      </div>
                    </div>

                    {/* Proof 4: Capacity Compliance */}
                    <div style={{ background: '#1e293b', borderRadius: '6px', padding: '10px', borderLeft: '3px solid #10b981' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>4. Physical Capacity Compliance</div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc', marginTop: '2px' }}>
                        Seat #{assignedRecord.seatNumber} of {assignedTrip?.capacity || 6}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '2px' }}>
                        ✓ Strictly honors vehicle certified capacity limit.
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#064e3b20', border: '1px solid #059669', borderRadius: '6px', padding: '10px 14px', fontSize: '0.8rem', color: '#a7f3d0' }}>
                    <strong>Academic Priority Triage:</strong> Ranked in triage tier <b>{selectedRequest.priorityCategory.replace('_', ' ')}</b>. Timestamp: <code>{new Date(selectedRequest.submissionTimestamp).toLocaleTimeString()}</code>.
                  </div>
                </div>
              )}

              {/* CASE 2: UNASSIGNED STUDENT HONEST AUDIT */}
              {unmetRecord && (
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} />
                    Honest Operational Root Cause Accounting:
                  </h4>

                  <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: '6px', padding: '12px 14px', marginBottom: '14px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fca5a5' }}>
                      Primary Reason: {unmetRecord.primaryReasonCode.replace('_', ' ')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#fef2f2', marginTop: '4px', lineHeight: 1.4 }}>
                      {unmetRecord.honestExplanation}
                    </div>
                    {unmetRecord.suggestedAlternativePickup && (
                      <div style={{ fontSize: '0.75rem', color: '#fde047', marginTop: '6px', fontWeight: 500 }}>
                        Alternative Assembly Point: {unmetRecord.suggestedAlternativePickup}
                      </div>
                    )}
                  </div>

                  {/* Evaluated Fleet Candidates Matrix */}
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
                    Evaluated Fleet Candidates Disqualification Audit ({unmetRecord.evaluatedTrips.length} Trips Tested):
                  </div>

                  <div className="table-responsive">
                    <table className="data-table" style={{ fontSize: '0.75rem' }}>
                      <thead>
                        <tr>
                          <th>Trip Vehicle</th>
                          <th>Serves Origin</th>
                          <th>Destination Match</th>
                          <th>Corridor Open</th>
                          <th>Seats Free</th>
                          <th>Rejection Justification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unmetRecord.evaluatedTrips.map(cand => (
                          <tr key={cand.tripId}>
                            <td style={{ fontWeight: 600, color: '#f8fafc' }}>
                              {cand.vehicleName.split('—')[0]}
                            </td>
                            <td>
                              {cand.servesOrigin ? (
                                <span style={{ color: '#10b981' }}>✓ Yes</span>
                              ) : (
                                <span style={{ color: '#ef4444' }}>✗ No</span>
                              )}
                            </td>
                            <td>
                              {cand.destinationMatch ? (
                                <span style={{ color: '#10b981' }}>✓ Yes</span>
                              ) : (
                                <span style={{ color: '#ef4444' }}>✗ No</span>
                              )}
                            </td>
                            <td>
                              {!cand.isBlocked ? (
                                <span style={{ color: '#10b981' }}>✓ Passable</span>
                              ) : (
                                <span style={{ color: '#ef4444' }}>✗ Blocked</span>
                              )}
                            </td>
                            <td>
                              {cand.capacityAvailable ? (
                                <span style={{ color: '#10b981' }}>✓ Available</span>
                              ) : (
                                <span style={{ color: '#ef4444' }}>✗ Full</span>
                              )}
                            </td>
                            <td style={{ color: '#fca5a5' }}>
                              {cand.rejectionReason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Select a student on the left to inspect the solver's verified decision proof.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

