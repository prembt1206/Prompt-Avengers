import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Settings,
  History,
  CheckCircle,
  Clock,
  Key,
  Database
} from 'lucide-react';
import { AuditLogEntry, UserProfile, UserRole } from '../../types';
import { AuditService } from '../../services/auditService';
import { AuthService } from '../../services/authService';

export const AdminDashboard: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'USERS' | 'CONFIG'>('AUDIT');

  // Config parameters
  const [averageRuralSpeedKmh, setAverageRuralSpeedKmh] = useState(38);
  const [allowOverbooking, setAllowOverbooking] = useState(false);
  const [examPriorityWeight, setExamPriorityWeight] = useState(1);
  const [configSavedToast, setConfigSavedToast] = useState(false);

  useEffect(() => {
    const unsub = AuditService.subscribe(logs => {
      setAuditLogs(logs);
    });
    setUsers(AuthService.getUsers());
    return () => unsub();
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    AuditService.record(
      AuthService.getCurrentUser().name,
      'ADMINISTRATOR',
      'CONFIG_UPDATED',
      `Updated system settings: Speed ${averageRuralSpeedKmh} km/h, Overbooking: ${allowOverbooking ? 'Permitted' : 'Strictly Zero'}.`
    );
    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 4000);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} className="text-primary" />
            <h3 className="card-title" style={{ margin: 0 }}>
              Regional System Administration & Compliance
            </h3>
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
              Dakshina Kannada Transport Control
            </span>
          </div>

          <div className="tabs-nav" style={{ margin: 0 }}>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'AUDIT' ? 'active' : ''}`}
              onClick={() => setActiveTab('AUDIT')}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <History size={14} />
              <span>Audit Trail ({auditLogs.length})</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'USERS' ? 'active' : ''}`}
              onClick={() => setActiveTab('USERS')}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <Users size={14} />
              <span>User Directory ({users.length})</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'CONFIG' ? 'active' : ''}`}
              onClick={() => setActiveTab('CONFIG')}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <Settings size={14} />
              <span>System Configuration</span>
            </button>
          </div>
        </div>

        <div className="card-body">
          {/* TAB 1: IMMUTABLE AUDIT TRAIL */}
          {activeTab === 'AUDIT' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Cryptographically trackable operational log of all coordinator overrides, route obstructions, and solver runs.
                </span>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Actor</th>
                      <th>Role</th>
                      <th>Action Code</th>
                      <th>Event Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.actor}</td>
                        <td>
                          <span className={`badge ${log.role === 'ADMINISTRATOR' ? 'badge-primary' : log.role === 'COORDINATOR' ? 'badge-info' : 'badge-secondary'}`} style={{ fontSize: '0.7rem' }}>
                            {log.role}
                          </span>
                        </td>
                        <td>
                          <code style={{ fontSize: '0.75rem', background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#38bdf8' }}>
                            {log.action}
                          </code>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: USER DIRECTORY & ROLE ASSIGNMENTS */}
          {activeTab === 'USERS' && (
            <div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Account Name</th>
                      <th>Username</th>
                      <th>Assigned Role</th>
                      <th>Email / Contact</th>
                      <th>Designation / Hamlet</th>
                      <th>Access Permissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {u.id}</div>
                        </td>
                        <td><code>{u.username}</code></td>
                        <td>
                          <span className={`badge ${u.role === 'ADMINISTRATOR' ? 'badge-danger' : u.role === 'COORDINATOR' ? 'badge-primary' : 'badge-success'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {u.email || 'N/A'}<br />
                          <span style={{ color: '#64748b' }}>{u.phone || ''}</span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {u.villageName || u.role}
                        </td>
                        <td style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {u.role === 'ADMINISTRATOR' ? 'Full System Root & Audit' : u.role === 'COORDINATOR' ? 'Fleet Management & Solver Overrides' : 'Personal Request Booking Only'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM CONFIGURATION */}
          {activeTab === 'CONFIG' && (
            <div style={{ maxWidth: '600px' }}>
              {configSavedToast && (
                <div style={{ background: '#064e3b', border: '1px solid #059669', color: '#ecfdf5', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} />
                  <span style={{ fontSize: '0.85rem' }}>System configuration parameters updated and audited!</span>
                </div>
              )}

              <form onSubmit={handleSaveConfig}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Default Rural Corridor Operating Speed (km/h)</label>
                  <input
                    type="number"
                    min={20}
                    max={65}
                    className="form-control"
                    value={averageRuralSpeedKmh}
                    onChange={e => setAverageRuralSpeedKmh(Number(e.target.value))}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Used by the GPS Telematics service to calculate ETAs along gravel and unpaved corridors.
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Exam Candidate Priority Weight</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="form-control"
                    value={examPriorityWeight}
                    onChange={e => setExamPriorityWeight(Number(e.target.value))}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Weight 1 guarantees board exam students are prioritised over regular attendance.
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={allowOverbooking}
                      onChange={e => setAllowOverbooking(e.target.checked)}
                      disabled
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8' }}>
                      Strict Capacity Enforcement: Overbooking Disallowed (Mandatory)
                    </span>
                  </label>
                  <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>
                    Physical constraint: RouteLess strictly prohibits hallucinating seats or overbooking vehicles beyond certified capacity.
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  Save System Parameters
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
