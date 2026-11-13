import React from 'react';
import {
  Scale,
  ShieldAlert,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Village, StudentRequest, AllocationResult } from '../../types';
import { FairnessService } from '../../services/fairnessService';

interface FairnessAnalyticsProps {
  villages: Village[];
  requests: StudentRequest[];
  allocationResult: AllocationResult | null;
}

export const FairnessAnalytics: React.FC<FairnessAnalyticsProps> = ({
  villages,
  requests,
  allocationResult
}) => {
  const fairnessSummary = FairnessService.evaluateFairness(
    villages,
    requests,
    allocationResult
  );

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scale size={18} className="text-primary" />
          <h3 className="card-title" style={{ margin: 0 }}>
            Village-Wise Transport Equity & Vulnerability Index
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
            Regional Gini Score: <b>{fairnessSummary.equityGiniScore}</b>
          </span>
          <span className={`badge ${fairnessSummary.overallFulfillmentPct > 80 ? 'badge-success' : 'badge-warning'}`}>
            Overall Fulfillment: {fairnessSummary.overallFulfillmentPct}%
          </span>
        </div>
      </div>

      <div className="card-body">
        {/* Top Vulnerability Banner if any village is underserved */}
        {fairnessSummary.systemRecommendations.length > 0 && (
          <div style={{ background: '#1e1b4b', border: '1px solid #4338ca', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
              <Sparkles size={16} />
              <span>Algorithmic Equity Recommendations for Coordinators:</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.8rem', color: '#e0e7ff' }}>
              {fairnessSummary.systemRecommendations.map((rec, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Village Fairness Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Village Hamlet</th>
                <th>Panchayat</th>
                <th>Connectivity Type</th>
                <th>Demand</th>
                <th>Assigned</th>
                <th>Unmet</th>
                <th>Fulfillment Rate</th>
                <th>Vulnerability Status</th>
                <th>Prescribed Fleet Action</th>
              </tr>
            </thead>
            <tbody>
              {fairnessSummary.metrics.map(m => {
                let badgeClass = 'badge-success';
                if (m.vulnerabilityLevel === 'CRITICAL') badgeClass = 'badge-danger';
                else if (m.vulnerabilityLevel === 'HIGH') badgeClass = 'badge-warning';
                else if (m.vulnerabilityLevel === 'MEDIUM') badgeClass = 'badge-info';

                return (
                  <tr key={m.villageId}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.villageName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.villageId}</div>
                    </td>

                    <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {m.panchayat}
                    </td>

                    <td>
                      <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                        {m.connectivityType}
                      </span>
                    </td>

                    <td style={{ fontWeight: 700 }}>{m.totalDemand}</td>
                    <td style={{ color: '#10b981', fontWeight: 700 }}>{m.assignedCount}</td>
                    <td style={{ color: m.unmetCount > 0 ? '#ef4444' : '#64748b', fontWeight: 700 }}>
                      {m.unmetCount}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{m.fulfillmentPct}%</span>
                      </div>
                      <div style={{ width: '100%', height: 4, background: '#334155', borderRadius: 2, marginTop: 4 }}>
                        <div
                          style={{
                            width: `${m.fulfillmentPct}%`,
                            height: '100%',
                            background: m.fulfillmentPct < 50 ? '#ef4444' : m.fulfillmentPct < 100 ? '#f59e0b' : '#10b981',
                            borderRadius: 2
                          }}
                        />
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${badgeClass}`}>
                        {m.vulnerabilityLevel}
                      </span>
                    </td>

                    <td style={{ fontSize: '0.75rem', color: '#cbd5e1', maxWidth: '280px' }}>
                      {m.recommendation}
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
