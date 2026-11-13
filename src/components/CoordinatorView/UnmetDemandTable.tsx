import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, MapPin, School, ShieldAlert, X } from 'lucide-react';
import { UnmetRequest, UnmetReasonCode } from '../../types';

interface UnmetDemandTableProps {
  unmetRequests: UnmetRequest[];
}

export const UnmetDemandTable: React.FC<UnmetDemandTableProps> = ({ unmetRequests }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getReasonBadge = (code: UnmetReasonCode) => {
    switch (code) {
      case 'TRIP_CANCELLED':
        return <span className="badge badge-danger">Vehicle Cancelled</span>;
      case 'ROUTE_BLOCKED':
        return <span className="badge badge-danger">Route Blocked</span>;
      case 'CAPACITY_EXCEEDED':
        return <span className="badge badge-warning">Capacity Exhausted</span>;
      case 'TIMING_INCOMPATIBLE':
        return <span className="badge badge-neutral">Late Arrival</span>;
      case 'NO_CONNECTING_ROUTE':
        return <span className="badge badge-neutral">No Service Link</span>;
      default:
        return <span className="badge badge-danger">Unmet</span>;
    }
  };

  return (
    <div className="card" style={{ border: '1px solid #fca5a5' }}>
      <div className="card-header" style={{ background: '#fef2f2' }}>
        <div>
          <h3 className="card-title" style={{ color: '#991b1b' }}>
            <AlertTriangle size={18} className="text-danger" />
            Unmet Student Demand & Deficit Roster ({unmetRequests.length})
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#7f1d1d', marginTop: '2px' }}>
            Honest accounting of unallocated requests. Zero artificial inflation of transport capacity.
          </p>
        </div>
        <span className="badge badge-danger" style={{ fontWeight: 700 }}>
          {unmetRequests.length} Students Without Transport
        </span>
      </div>

      <div className="card-body" style={{ padding: 0 }}>
        {unmetRequests.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#065f46', background: '#ecfdf5' }}>
            🎉 All requested student transports were successfully allocated under current fleet capacity and route conditions.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Origin → Destination</th>
                  <th>Priority Category</th>
                  <th>Primary Reason</th>
                  <th>Honest Operational Explanation</th>
                  <th>Audit</th>
                </tr>
              </thead>
              <tbody>
                {unmetRequests.map(unmet => {
                  const isExpanded = expandedId === unmet.requestId;

                  return (
                    <React.Fragment key={unmet.requestId}>
                      <tr style={{ background: '#fff5f5' }}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{unmet.studentName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{unmet.gradeOrStream}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} className="text-muted" />
                            <strong>{unmet.originVillageName}</strong>
                          </div>
                          <div style={{ fontSize: '0.775rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <School size={12} className="text-muted" />
                            <span>{unmet.destinationInstitutionName}</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Must arrive by {unmet.requiredArrivalTime}</div>
                        </td>
                        <td>
                          {unmet.priorityCategory === 'CRITICAL_EXAM' && (
                            <span className="badge badge-danger">Exam Priority</span>
                          )}
                          {unmet.priorityCategory === 'LAB_PRACTICAL' && (
                            <span className="badge badge-warning">Lab Mandatory</span>
                          )}
                          {unmet.priorityCategory === 'REGULAR_ATTENDANCE' && (
                            <span className="badge badge-neutral">Regular</span>
                          )}
                        </td>
                        <td>{getReasonBadge(unmet.primaryReasonCode)}</td>
                        <td style={{ maxWidth: '340px' }}>
                          <div style={{ fontSize: '0.825rem', color: '#7f1d1d', lineHeight: 1.35, fontWeight: 500 }}>
                            {unmet.honestExplanation}
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => toggleExpand(unmet.requestId)}
                            title="Inspect why every vehicle trip in the fleet was disqualified"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp size={13} /> Close
                              </>
                            ) : (
                              <>
                                <ChevronDown size={13} /> Evaluated Trips
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable row showing trip-by-trip disqualification audit */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '2px solid #e2e8f0' }}>
                            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                              <h5 style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ShieldAlert size={14} className="text-primary" />
                                Solver Vehicle Trip Evaluation Audit for {unmet.studentName}:
                              </h5>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {unmet.evaluatedTrips.map(candidate => (
                                  <div
                                    key={candidate.tripId}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 12px',
                                      background: '#ffffff',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '6px',
                                      fontSize: '0.775rem'
                                    }}
                                  >
                                    <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                      {candidate.vehicleName}
                                    </span>
                                    <span style={{ color: candidate.rejectionReason.includes('Feasible') ? '#10b981' : '#b91c1c' }}>
                                      {candidate.rejectionReason}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
