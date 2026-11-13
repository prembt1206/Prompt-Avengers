import React from 'react';
import { UserProfile } from '../../types';
import { Shield, User, LogIn, LogOut, Database, HardDrive, UserPlus } from 'lucide-react';

interface UserSessionBadgeProps {
  currentUser: UserProfile | null;
  isConfigured: boolean;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  onOpenConfigModal: () => void;
  onNavigateSignup?: () => void;
}

export const UserSessionBadge: React.FC<UserSessionBadgeProps> = ({
  currentUser,
  isConfigured,
  onOpenAuthModal,
  onSignOut,
  onOpenConfigModal,
  onNavigateSignup = onOpenAuthModal
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {/* Mode Indicator Badge */}
      {isConfigured ? (
        <div
          className="badge"
          style={{
            background: '#0b2a4a',
            color: '#38bdf8',
            border: '1px solid #0770e3',
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
            background: 'rgba(255, 123, 89, 0.15)',
            color: '#ff7b59',
            border: '1px solid #ffd5cc',
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

      {/* User Session Info or Sign Up / Sign In Actions */}
      {currentUser ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f1f2f6',
              border: '1px solid #d2d8e0',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.8rem'
            }}
          >
            <User size={13} color="#0770e3" />
            <span style={{ fontWeight: 700, color: '#111215' }}>
              {currentUser.fullName || currentUser.email}
            </span>
            <span
              className={`badge ${currentUser.role === 'coordinator' ? 'badge-primary' : 'badge-neutral'}`}
              style={{ fontSize: '0.65rem', padding: '1px 6px' }}
            >
              {currentUser.role === 'coordinator' ? 'Coordinator (RLS)' : 'Student'}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNavigateSignup}
            style={{
              padding: '5px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              gap: '5px',
              background: '#0770e3',
              borderColor: '#0770e3'
            }}
          >
            <UserPlus size={13} />
            <span>Sign Up</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenAuthModal}
            style={{ padding: '5px 10px', fontSize: '0.8rem', gap: '4px' }}
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>
        </div>
      )}
    </div>
  );
};
