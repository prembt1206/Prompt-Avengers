import React, { useState } from 'react';
import { Search, CheckCircle, AlertTriangle, Clock, MapPin, School } from 'lucide-react';
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

  const assignmentsMap = new Map(
    latestAllocation?.assignments.map(a => [a.requestId, a]) || []
  );

  const unmetMap = new Map(
    latestAllocation?.unmetRequests.map(u => [u.requestId, u]) || []
  );

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.originVillageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVillage = filterVillage === 'ALL' || req.originVillageId === filterVillage;
    return matchesSearch && matchesVillage;
  });

  const villages = Array.from(
    new Set(requests.map(r => JSON.stringify({ id: r.originVillageId, name: r.originVillageName })))
  ).map(s => JSON.parse(s) as { id: string; name: string });

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Clock size={18} className="text-primary" />
          Active Transport Requests ({filteredRequests.length})
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
                <th>Origin</th>
                <th>Destination</th>
                <th>Category</th>
                <th>Allocation Status</th>
                <th>Trip Details / Honest Reason</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => {
                const assignment = assignmentsMap.get(req.id);
                const unmet = unmetMap.get(req.id);

                return (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.gradeOrStream}</div>
                      {req.isCustom && (
                        <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '1px 5px', marginTop: '2px' }}>
                          User Added
                        </span>
                      )}
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
                        <span>{req.destinationInstitutionName}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Due: {req.requiredArrivalTime}</div>
                    </td>
                    <td>
                      {req.priorityCategory === 'CRITICAL_EXAM' && (
                        <span className="badge badge-danger">Board Exam</span>
                      )}
                      {req.priorityCategory === 'LAB_PRACTICAL' && (
                        <span className="badge badge-warning">Lab Mandatory</span>
                      )}
                      {req.priorityCategory === 'REGULAR_ATTENDANCE' && (
                        <span className="badge badge-neutral">Regular</span>
                      )}
                    </td>
                    <td>
                      {assignment ? (
                        <span className="badge badge-success">
                          <CheckCircle size={12} /> Assigned
                        </span>
                      ) : unmet ? (
                        <span className="badge badge-danger">
                          <AlertTriangle size={12} /> Unassigned
                        </span>
                      ) : (
                        <span className="badge badge-neutral">Pending Run</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '320px' }}>
                      {assignment && (
                        <div>
                          <div style={{ fontWeight: 600, color: '#065f46' }}>
                            {assignment.vehicleName} [Seat #{assignment.seatNumber}]
                          </div>
                          <div style={{ fontSize: '0.775rem', color: '#475569' }}>
                            Pickup at {assignment.pickupTime} → Arrive {assignment.dropoffTime}
                          </div>
                        </div>
                      )}
                      {unmet && (
                        <div>
                          <div style={{ fontWeight: 600, color: '#991b1b', fontSize: '0.8rem' }}>
                            {unmet.primaryReasonCode.replace('_', ' ')}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#7f1d1d', lineHeight: 1.3 }}>
                            {unmet.honestExplanation}
                          </div>
                        </div>
                      )}
                      {!assignment && !unmet && (
                        <span style={{ fontSize: '0.775rem', color: '#94a3b8' }}>
                          Awaiting coordinator allocation run
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
