import React from 'react';
import { Database, Shield, Key, CheckCircle, ExternalLink, X, FileCode } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '620px', padding: '0', overflow: 'hidden' }}
      >
        {/* Header */}
        <div
          style={{
            background: '#042f2e',
            color: '#f0fdfa',
            padding: '18px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="#2dd4bf" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f0fdfa' }}>
              Supabase Integration Setup Guide
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#99f6e4',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px'
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '14px',
              marginBottom: '18px'
            }}
          >
            <div style={{ fontWeight: 700, color: '#0f766e', marginBottom: '4px' }}>
              Currently in Local Demo Mode
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
              The application is running in isolated single-browser local storage mode. To activate multi-user cloud persistence, database authentication, and Row Level Security, connect a Supabase project.
            </p>
          </div>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            1. Configure Environment Variables
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
            Copy <code>.env.example</code> to <code>.env</code> in the project root and enter your Supabase project credentials (from <em>Project Settings → API</em>):
          </p>
          <pre
            style={{
              background: '#1e293b',
              color: '#e2e8f0',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              overflowX: 'auto',
              marginBottom: '18px'
            }}
          >
{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
          </pre>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            2. Run Database Migrations
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
            Execute the versioned migration in the Supabase SQL Editor:
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f1f5f9',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: '#334155',
              marginBottom: '18px'
            }}
          >
            <FileCode size={16} color="#0d9488" />
            <code>supabase/migrations/20261113000000_routeless_schema.sql</code>
          </div>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            3. Apply Seed Data
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
            Populate the default Mangaluru transit corridor fixture by executing:
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f1f5f9',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: '#334155',
              marginBottom: '18px'
            }}
          >
            <FileCode size={16} color="#0d9488" />
            <code>supabase/seed.sql</code>
          </div>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            4. Row Level Security & Roles
          </h4>
          <ul style={{ fontSize: '0.85rem', color: '#475569', paddingLeft: '20px', margin: 0 }}>
            <li>Students may only create and view their own transport requests.</li>
            <li>Transport coordinators are authorized via <code>scenario_memberships</code> table.</li>
            <li>All atomic crisis procedures and concurrency checks are enforced server-side.</li>
          </ul>
        </div>

        {/* Footer */}
        <div
          style={{
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '14px 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
