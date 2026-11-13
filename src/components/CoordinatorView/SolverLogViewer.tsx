import React, { useState } from 'react';
import { Terminal, Filter, Search, Download } from 'lucide-react';
import { SolverLogEntry } from '../../types';

interface SolverLogViewerProps {
  logs: SolverLogEntry[];
}

export const SolverLogViewer: React.FC<SolverLogViewerProps> = ({ logs }) => {
  const [levelFilter, setLevelFilter] = useState<'ALL' | SolverLogEntry['level']>('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(l => {
    const matchesLevel = levelFilter === 'ALL' || l.level === levelFilter;
    const matchesSearch =
      l.message.toLowerCase().includes(search.toLowerCase()) ||
      (l.studentName && l.studentName.toLowerCase().includes(search.toLowerCase())) ||
      (l.tripName && l.tripName.toLowerCase().includes(search.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  const exportLogs = () => {
    const text = logs
      .map(l => `[${l.timestamp}] [${l.level}] ${l.studentName ? '(' + l.studentName + ') ' : ''}${l.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `routeless-solver-log-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="card-header" style={{ background: '#0f172a', color: '#f8fafc', borderBottom: '1px solid #1e293b' }}>
        <h3 className="card-title" style={{ color: '#f8fafc' }}>
          <Terminal size={18} className="text-primary" />
          Deterministic Solver Audit & Execution Logs ({filteredLogs.length})
        </h3>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="form-select"
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value as any)}
            style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#1e293b', color: '#f8fafc', borderColor: '#334155' }}
          >
            <option value="ALL">All Levels</option>
            <option value="DECISION">Decisions Only</option>
            <option value="ALERT">Alerts Only</option>
            <option value="WARNING">Warnings Only</option>
            <option value="INFO">Info Only</option>
          </select>

          <input
            type="text"
            className="form-control"
            placeholder="Search logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontSize: '0.75rem', padding: '4px 8px', width: '130px', background: '#1e293b', color: '#f8fafc', borderColor: '#334155' }}
          />

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={exportLogs}
            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            title="Download plain text log audit"
          >
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      <div className="card-body" style={{ background: '#090d16', padding: '14px' }}>
        <div className="log-terminal">
          {filteredLogs.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
              No solver logs match the current filters. Run an allocation to generate fresh trace events.
            </div>
          ) : (
            filteredLogs.map(l => (
              <div key={l.id} className="log-line">
                <span className="log-time">{l.timestamp}</span>
                <span className={`log-level-${l.level}`}>[{l.level}]</span>
                <span style={{ color: '#f1f5f9' }}>{l.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
