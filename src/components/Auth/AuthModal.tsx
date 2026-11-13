import React, { useState } from 'react';
import { SupabaseService } from '../../services/supabaseService';
import { UserProfile, UserRole } from '../../types';
import { Lock, Mail, User, Shield, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [desiredRole, setDesiredRole] = useState<UserRole>('student');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);
    setIsLoading(true);

    try {
      if (mode === 'SIGN_IN') {
        const { user, error } = await SupabaseService.signIn(email, password);
        if (error) {
          setErrorMsg(error);
        } else if (user) {
          onAuthSuccess(user);
          onClose();
        }
      } else {
        const { user, error, emailConfirmationRequired } = await SupabaseService.signUp(
          email,
          password,
          fullName,
          desiredRole
        );

        if (error) {
          setErrorMsg(error);
        } else if (emailConfirmationRequired) {
          setSuccessNotice(
            `Registration initiated for ${email}! A confirmation link has been sent to your email. Please verify your address, then sign in.`
          );
        } else if (user) {
          onAuthSuccess(user);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '0', overflow: 'hidden' }}
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
            <Shield size={20} color="#2dd4bf" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f0fdfa' }}>
              {mode === 'SIGN_IN' ? 'Supabase Cloud Sign In' : 'Create RouteLess Account'}
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

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => { setMode('SIGN_IN'); setErrorMsg(null); setSuccessNotice(null); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: mode === 'SIGN_IN' ? '#ffffff' : 'transparent',
              fontWeight: mode === 'SIGN_IN' ? 700 : 500,
              color: mode === 'SIGN_IN' ? '#0f766e' : '#64748b',
              borderBottom: mode === 'SIGN_IN' ? '2px solid #0d9488' : 'none',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('SIGN_UP'); setErrorMsg(null); setSuccessNotice(null); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: mode === 'SIGN_UP' ? '#ffffff' : 'transparent',
              fontWeight: mode === 'SIGN_UP' ? 700 : 500,
              color: mode === 'SIGN_UP' ? '#0f766e' : '#64748b',
              borderBottom: mode === 'SIGN_UP' ? '2px solid #0d9488' : 'none',
              cursor: 'pointer'
            }}
          >
            Register / Sign Up
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                padding: '10px 12px',
                color: '#991b1b',
                fontSize: '0.85rem',
                marginBottom: '16px'
              }}
            >
              <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {successNotice && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                padding: '10px 12px',
                color: '#166534',
                fontSize: '0.85rem',
                marginBottom: '16px'
              }}
            >
              <CheckCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>{successNotice}</div>
            </div>
          )}

          {mode === 'SIGN_UP' && (
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="#64748b" /> Full Name
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Ramesh Bhandary"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} color="#64748b" /> Email Address
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. coordinator@routeless.local"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} color="#64748b" /> Password
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {mode === 'SIGN_UP' && (
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label">Select Initial Account Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label
                  style={{
                    border: desiredRole === 'student' ? '2px solid #0d9488' : '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    background: desiredRole === 'student' ? '#f0fdfa' : '#ffffff',
                    fontSize: '0.85rem'
                  }}
                >
                  <input
                    type="radio"
                    name="desiredRole"
                    checked={desiredRole === 'student'}
                    onChange={() => setDesiredRole('student')}
                    style={{ marginRight: '6px' }}
                  />
                  <strong>Student</strong>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    Request transport; view own status
                  </div>
                </label>

                <label
                  style={{
                    border: desiredRole === 'coordinator' ? '2px solid #0d9488' : '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    background: desiredRole === 'coordinator' ? '#f0fdfa' : '#ffffff',
                    fontSize: '0.85rem'
                  }}
                >
                  <input
                    type="radio"
                    name="desiredRole"
                    checked={desiredRole === 'coordinator'}
                    onChange={() => setDesiredRole('coordinator')}
                    style={{ marginRight: '6px' }}
                  />
                  <strong>Coordinator</strong>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    Manage fleet & run recovery
                  </div>
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isLoading && <Loader2 size={16} className="spin" />}
            {mode === 'SIGN_IN' ? 'Sign In to Supabase' : 'Create Account'}
          </button>
        </form>

        {/* Footer info notice */}
        <div
          style={{
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '12px 24px',
            fontSize: '0.75rem',
            color: '#64748b'
          }}
        >
          <strong>Security Notice:</strong> Coordinator permissions are enforced via database Row Level Security (RLS) policies.
        </div>
      </div>
    </div>
  );
};
