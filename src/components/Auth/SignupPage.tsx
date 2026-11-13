import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Bus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  School,
  MapPin,
  Award,
  Sparkles,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { SupabaseService } from '../../services/supabaseService';
import { UserProfile, UserRole, Village, Institution } from '../../types';

interface SignupPageProps {
  initialMode?: 'SIGN_UP' | 'SIGN_IN';
  villages: Village[];
  institutions: Institution[];
  onAuthSuccess: (user: UserProfile) => void;
  onNavigateHome: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  initialMode = 'SIGN_UP',
  villages,
  institutions,
  onAuthSuccess,
  onNavigateHome
}) => {
  const [mode, setMode] = useState<'SIGN_UP' | 'SIGN_IN'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [desiredRole, setDesiredRole] = useState<UserRole>('student');
  const [selectedVillageId, setSelectedVillageId] = useState(villages[0]?.id || '');
  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.id || '');
  const [isExamCandidate, setIsExamCandidate] = useState(true);
  const [agreedToNotice, setAgreedToNotice] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string): { label: string; percent: number; color: string } => {
    if (!pass) return { label: 'None', percent: 0, color: '#e2e4e8' };
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 8) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;

    if (score <= 25) return { label: 'Weak', percent: 25, color: '#d93b3b' };
    if (score <= 50) return { label: 'Fair', percent: 50, color: '#ff7b59' };
    if (score <= 75) return { label: 'Good', percent: 75, color: '#0770e3' };
    return { label: 'Strong', percent: 100, color: '#00a698' };
  };

  const passStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (mode === 'SIGN_UP') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify both entries.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (!agreedToNotice) {
        setErrorMessage('Please acknowledge the simulation disclaimer to proceed.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'SIGN_IN') {
        const { user, error } = await SupabaseService.signIn(email.trim(), password);
        if (error) {
          setErrorMessage(error);
        } else if (user) {
          onAuthSuccess(user);
        }
      } else {
        const { user, error, emailConfirmationRequired } = await SupabaseService.signUp(
          email.trim(),
          password,
          fullName.trim(),
          desiredRole
        );

        if (error) {
          setErrorMessage(error);
        } else if (emailConfirmationRequired) {
          setSuccessNotice(
            `Account created for ${email}! A confirmation link has been sent. Please confirm your email address, or test immediately using the Instant Demo buttons below.`
          );
        } else if (user) {
          onAuthSuccess(user);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Instant demo sign-in for frictionless evaluator testing
  const handleDemoSignIn = (role: UserRole) => {
    const demoUser: UserProfile = {
      id: role === 'coordinator' ? 'demo-coord-01' : 'demo-student-01',
      email: role === 'coordinator' ? 'coordinator.mangaluru@routeless.local' : 'prathiksha.student@routeless.local',
      fullName: role === 'coordinator' ? 'Mangaluru Transit Coordinator' : 'Prathiksha Poojary (SSLC)',
      role
    };
    onAuthSuccess(demoUser);
  };

  return (
    <div style={{ padding: '16px', background: '#f1f2f6', minHeight: 'calc(100vh - 120px)' }}>
      {/* Return to Dashboard Header */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 12px auto' }}>
        <button
          type="button"
          onClick={onNavigateHome}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#0770e3',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to RouteLess Dashboard</span>
        </button>
      </div>

      <div className="signup-page-container">
        {/* Left Column: Educational Resilience Showcase */}
        <div className="signup-showcase">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#0770e3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <Bus size={22} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                RouteLess
              </h3>
            </div>

            <h2 className="signup-showcase-title">
              When a bus stops, learning should not.
            </h2>
            <p className="signup-showcase-subtitle">
              Join the intelligent rural transport network protecting educational mobility for secondary and polytechnic students across Dakshina Kannada.
            </p>

            <div className="signup-feature-list">
              <div className="signup-feature-item">
                <div className="signup-feature-icon">
                  <Award size={18} />
                </div>
                <div className="signup-feature-text">
                  <h4>15-Minute Exam Arrival Priority</h4>
                  <p>Guaranteed on-time routing with mandatory safety buffer before the exam bell rings.</p>
                </div>
              </div>

              <div className="signup-feature-item">
                <div className="signup-feature-icon">
                  <Bus size={18} />
                </div>
                <div className="signup-feature-text">
                  <h4>Deterministic Seat Allocation</h4>
                  <p>Pure mathematical solver maximizes seat occupancy without fabricating fake capacity.</p>
                </div>
              </div>

              <div className="signup-feature-item">
                <div className="signup-feature-icon">
                  <Shield size={18} />
                </div>
                <div className="signup-feature-text">
                  <h4>Supabase Row Level Security</h4>
                  <p>Student privacy protected with Postgres authorization rules and secure session handling.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="signup-corridor-pill">
              <MapPin size={14} color="#38bdf8" />
              <span>Mangaluru Corridor: Ganjimutt • Gurupura • Bajpe • Polali</span>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.72rem', color: '#7b8ba5' }}>
              Built for ROUTELESS: THE LAST MILE Challenge
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Registration & Sign In */}
        <div className="signup-form-panel">
          {/* Mode Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e4e8', marginBottom: '28px' }}>
            <button
              type="button"
              onClick={() => { setMode('SIGN_UP'); setErrorMessage(null); }}
              style={{
                padding: '10px 18px',
                fontSize: '0.95rem',
                fontWeight: 700,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: mode === 'SIGN_UP' ? '#0770e3' : '#686974',
                borderBottom: mode === 'SIGN_UP' ? '3px solid #0770e3' : '3px solid transparent',
                marginBottom: '-2px'
              }}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => { setMode('SIGN_IN'); setErrorMessage(null); }}
              style={{
                padding: '10px 18px',
                fontSize: '0.95rem',
                fontWeight: 700,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: mode === 'SIGN_IN' ? '#0770e3' : '#686974',
                borderBottom: mode === 'SIGN_IN' ? '3px solid #0770e3' : '3px solid transparent',
                marginBottom: '-2px'
              }}
            >
              Sign In
            </button>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div
              style={{
                background: '#fde8e8',
                border: '1px solid #fecaca',
                color: '#901b1b',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div
              style={{
                background: '#e6f6f5',
                border: '1px solid #00a698',
                color: '#05655d',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <CheckCircle2 size={18} color="#00a698" />
              <span>{successNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* If Sign Up Mode, Role Selection Cards */}
            {mode === 'SIGN_UP' && (
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Select Your Account Role *
                </label>
                <div className="role-card-grid">
                  <div
                    className={`role-selector-card ${desiredRole === 'student' ? 'selected' : ''}`}
                    onClick={() => setDesiredRole('student')}
                  >
                    <input
                      type="radio"
                      name="role"
                      checked={desiredRole === 'student'}
                      onChange={() => setDesiredRole('student')}
                      style={{ marginTop: '3px', accentColor: '#0770e3' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111215' }}>
                        Student / Parent
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#686974', marginTop: '2px' }}>
                        Request transport, track exam boarding pass & routes
                      </div>
                    </div>
                  </div>

                  <div
                    className={`role-selector-card ${desiredRole === 'coordinator' ? 'selected' : ''}`}
                    onClick={() => setDesiredRole('coordinator')}
                  >
                    <input
                      type="radio"
                      name="role"
                      checked={desiredRole === 'coordinator'}
                      onChange={() => setDesiredRole('coordinator')}
                      style={{ marginTop: '3px', accentColor: '#0770e3' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111215' }}>
                        Transport Coordinator
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#686974', marginTop: '2px' }}>
                        Manage fleet, block roads, and execute crisis recovery
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Full Name (Sign Up only) */}
            {mode === 'SIGN_UP' && (
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Prathiksha Poojary"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8f929d' }} />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                  required
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8f929d' }} />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '36px', paddingRight: '36px' }}
                  required
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8f929d' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#8f929d'
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength indicator for signup */}
              {mode === 'SIGN_UP' && password && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#686974' }}>
                    <span>Password Strength:</span>
                    <strong style={{ color: passStrength.color }}>{passStrength.label}</strong>
                  </div>
                  <div style={{ height: '4px', background: '#e2e4e8', borderRadius: '2px', overflow: 'hidden', marginTop: '3px' }}>
                    <div style={{ height: '100%', width: `${passStrength.percent}%`, background: passStrength.color, transition: 'all 0.3s' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password (Sign Up only) */}
            {mode === 'SIGN_UP' && (
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8f929d' }} />
                </div>
              </div>
            )}

            {/* If Student role on Signup, show optional corridor affiliations */}
            {mode === 'SIGN_UP' && desiredRole === 'student' && (
              <div className="grid-2" style={{ marginBottom: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Home Village</label>
                  <select
                    className="form-select"
                    value={selectedVillageId}
                    onChange={e => setSelectedVillageId(e.target.value)}
                  >
                    {villages.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Target College</label>
                  <select
                    className="form-select"
                    value={selectedInstId}
                    onChange={e => setSelectedInstId(e.target.value)}
                  >
                    {institutions.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Checkbox: Exam Candidate (Sign Up only) */}
            {mode === 'SIGN_UP' && desiredRole === 'student' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  checked={isExamCandidate}
                  onChange={e => setIsExamCandidate(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0770e3' }}
                />
                <span style={{ fontSize: '0.825rem', color: '#334155', fontWeight: 600 }}>
                  I am a State Board Examination (SSLC / PUC) or Polytechnic Candidate
                </span>
              </label>
            )}

            {/* Checkbox: Simulation Notice (Sign Up only) */}
            {mode === 'SIGN_UP' && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', marginBottom: '24px' }}>
                <input
                  type="checkbox"
                  checked={agreedToNotice}
                  onChange={e => setAgreedToNotice(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0770e3', marginTop: '2px' }}
                />
                <span style={{ fontSize: '0.775rem', color: '#686974', lineHeight: 1.4 }}>
                  I understand RouteLess is a synthetic operational research simulation prototype without live GPS or real emergency dispatch.
                </span>
              </label>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: '8px',
                background: '#0770e3',
                borderColor: '#0770e3',
                boxShadow: '0 4px 14px rgba(7, 112, 227, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Processing {mode === 'SIGN_UP' ? 'Registration' : 'Sign In'}...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'SIGN_UP' ? 'Create RouteLess Account' : 'Sign In to Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Frictionless One-Click Demo Login */}
          <div style={{ marginTop: '28px', borderTop: '1px solid #e2e4e8', paddingTop: '20px' }}>
            <div style={{ fontSize: '0.775rem', fontWeight: 700, color: '#686974', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center' }}>
              Instant Demo Access (Zero Credentials Needed)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleDemoSignIn('student')}
                style={{ fontSize: '0.785rem', padding: '8px 12px', justifyContent: 'center' }}
              >
                <User size={13} color="#0770e3" />
                <span>Demo Student</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleDemoSignIn('coordinator')}
                style={{ fontSize: '0.785rem', padding: '8px 12px', justifyContent: 'center' }}
              >
                <Shield size={13} color="#00a698" />
                <span>Demo Coordinator</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
