import React from 'react';
import { UserProfile } from '../../types';
import { Shield, User, LogIn, LogOut, Database, CloudCheck, HardDrive } from 'lucide-react';

interface UserSessionBadgeProps {
  currentUser: UserProfile | null;
  isConfigured: boolean;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  onOpenConfigModal: () => void;
}

export const UserSessionBadge: React.FC<UserSessionBadgeProps> = ({
  currentUser,
  isConfigured,
  onOpenAuthModal,
  onSignOut,
  onOpenConfigModal
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {/* Mode Indicator Badge */}
      {isConfigured ? (
        <div
          className="badge"
          style={{
            background: '#042f2e',
            color: '#2dd4bf',
            border: '1px solid #0f766e',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            padding: '4px 8px'
          }}
          title="Connected to Supabase PostgreSQL with Row Level Security"
        >
          <Database size={13} />
          <span>Cloud Mode (Supabase)</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenConfigModal}
          style={{
            background: 'rgba(217, 119, 6, 0.15)',
            color: '#b45309',
            border: '1px solid #fde68a',
            borderRadius: '9999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.75rem',
            padding: '3px 9px',
            cursor: 'pointer',
            fontWeight: 600
          }}
          title="Running in single-browser local storage demo mode. Click to view Supabase setup instructions."
        >
          <HardDrive size={13} />
          <span>Local Demo Mode</span>
        </button>
      )}

      {/* User Session Info or Sign In Action */}
      {currentUser ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.8rem'
            }}
          >
            <User size={13} color="#475569" />
            <span style={{ fontWeight: 600, color: '#1e293b' }}>
              {currentUser.fullName || currentUser.email}
            </span>
            <span
              className={`badge ${currentUser.role === 'coordinator' ? 'badge-primary' : 'badge-neutral'}`}
              style={{ fontSize: '0.65rem', padding: '1px 6px' }}
            >
              {currentUser.role === 'coordinator' ? 'Coordinator (RLS Admin)' : 'Student'}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onSignOut}
            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
            title="Sign out of Supabase"
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      ) : (
        isConfigured && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAuthModal}
            style={{ padding: '4px 10px', fontSize: '0.8rem', gap: '5px' }}
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>
        )
      )}
    </div>
  );
};
