import React, { useState } from 'react';
import { Search, CheckCircle, AlertTriangle, Clock, MapPin, School, Award, AlertCircle } from 'lucide-react';
import { StudentRequest, AllocationResult } from '../../types';

interface StudentRequestListProps {
  requests: StudentRequest[];
  latestAllocation: AllocationResult | null;
}

export const StudentRequestList: React.FC<StudentRequestListProps> = ({
  requests,
  latestAllocation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVillage, setFilterVillage] = useState('ALL');
  const [filterExamOnly, setFilterExamOnly] = useState(false);

  const assignmentsMap = new Map(
    latestAllocation?.assignments.map(a => [a.requestId, a]) || []
  );

  const unmetMap = new Map(
    latestAllocation?.unmetRequests.map(u => [u.requestId, u]) || []
  );

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.originVillageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.examSubject && req.examSubject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesVillage = filterVillage === 'ALL' || req.originVillageId === filterVillage;
    const matchesExam = !filterExamOnly || req.isExamStudent;
    return matchesSearch && matchesVillage && matchesExam;
  });

  const villages = Array.from(
    new Set(requests.map(r => JSON.stringify({ id: r.originVillageId, name: r.originVillageName })))
  ).map(s => JSON.parse(s) as { id: string; name: string });

  const totalExams = requests.filter(r => r.isExamStudent).length;

  return (
    <div className="card">
      <div className="card-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <h3 className="card-title">
            <Clock size={18} className="text-teal" />
            Registered Student Transport Roster ({filteredRequests.length})
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
            {totalExams} students appearing for critical examinations today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#d97706', cursor: 'pointer', background: '#fffbeb', padding: '4px 10px', borderRadius: '6px', border: '1px solid #fde68a' }}>
            <input
              type="checkbox"
              checked={filterExamOnly}
              onChange={e => setFilterExamOnly(e.target.checked)}
              style={{ accentColor: '#d97706' }}
            />
            Exam Students Only ({totalExams})
          </label>

          <div style={{ position: 'relative', minWidth: '170px' }}>
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
            value={filterVillage}
            onChange={e => setFilterVillage(e.target.value)}
            style={{ fontSize: '0.8rem', width: 'auto' }}
          >
            <option value="ALL">All Villages</option>
            {villages.map(v => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card-body" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Origin Hamlet</th>
                <th>Destination Institution</th>
                <th>Exam & Arrival Deadlines</th>
                <th>Transport Status</th>
                <th>Allocated Trip / Honest Failure Reason</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => {
                const assignment = assignmentsMap.get(req.id);
                const unmet = unmetMap.get(req.id);

                return (
                  <tr key={req.id} style={{ background: req.isExamStudent ? '#fffdf7' : 'inherit' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{req.studentName}</span>
                        {req.isExamStudent && (
                          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                            <Award size={10} /> EXAM
                          </span>
                        )}
                        {req.isCrisisAdded && (
                          <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                            +40% Surge
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.gradeOrStream}</div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} className="text-muted" />
                        <span>{req.originVillageName}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <School size={13} className="text-muted" />
                        <span>{req.destinationInstitutionName || req.destinationName}</span>
                      </div>
                    </td>

                    <td>
                      {req.isExamStudent ? (
                        <div>
                          <div style={{ fontWeight: 700, color: '#b45309', fontSize: '0.8rem' }}>
                            Exam: {req.examStartTime}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                            Required Arrival: <strong>{req.requiredArrivalTime}</strong> (15m buffer)
                          </div>
                          {req.examSubject && (
                            <div style={{ fontSize: '0.7rem', color: '#78350f', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {req.examSubject}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                            Must arrive by: <strong>{req.requiredArrivalTime}</strong>
                          </span>
                        </div>
                      )}
                    </td>

                    <td>
                      {assignment ? (
                        <span className="badge badge-success">
                          <CheckCircle size={12} /> Assigned (On-Time)
                        </span>
                      ) : unmet?.hasLateAlternative ? (
                        <span className="badge badge-warning">
                          <AlertCircle size={12} /> Late Alternative
                        </span>
                      ) : unmet ? (
                        <span className="badge badge-danger">
                          <AlertTriangle size={12} /> Unassigned
                        </span>
                      ) : (
                        <span className="badge badge-neutral">Pending Solver Run</span>
                      )}
                    </td>

                    <td style={{ maxWidth: '340px' }}>
                      {assignment && (
                        <div>
                          <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.825rem' }}>
                            {assignment.vehicleName} [Seat #{assignment.seatNumber}]
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#334155' }}>
                            Pickup: {assignment.pickupTime} → Estimated Arrival: <strong>{assignment.dropoffTime}</strong> (On-time)
                          </div>
                          {assignment.routeDetails?.hasDetour && (
                            <span className="badge badge-info" style={{ fontSize: '0.65rem', marginTop: '2px' }}>
                              Alternative Bypass Route (+{assignment.routeDetails.detourMinutesAdded}m detour)
                            </span>
                          )}
                        </div>
                      )}

                      {unmet?.hasLateAlternative && unmet.lateAlternativeDetails && (
                        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '4px', padding: '4px 8px' }}>
                          <div style={{ fontWeight: 700, color: '#b45309', fontSize: '0.775rem' }}>
                            ⚠️ Late Alternative Available ({unmet.lateAlternativeDetails.tripName.split('—')[0]})
                          </div>
                          <div style={{ fontSize: '0.725rem', color: '#78350f' }}>
                            Arrives at {unmet.lateAlternativeDetails.estimatedArrival} ({unmet.lateAlternativeDetails.minutesLate}m after deadline). Not counted as on-time.
                          </div>
                        </div>
                      )}

                      {unmet && !unmet.hasLateAlternative && (
                        <div>
                          <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.775rem' }}>
                            {unmet.primaryReasonCode.replace(/_/g, ' ')}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#7f1d1d', lineHeight: 1.3 }}>
                            {unmet.honestExplanation}
                          </div>
                        </div>
                      )}

                      {!assignment && !unmet && (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Awaiting coordinator recovery run
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
