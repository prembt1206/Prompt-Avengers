import React from 'react';
import { Bus, Users, Shield, RotateCcw, BookOpen } from 'lucide-react';
import { UserSessionBadge } from './Auth/UserSessionBadge';
import { UserProfile } from '../types';

interface NavbarProps {
  currentView: 'COORDINATOR' | 'STUDENT';
  onViewChange: (view: 'COORDINATOR' | 'STUDENT') => void;
  onResetDemo: () => void;
  onOpenDemoScript: () => void;
  currentUser?: UserProfile | null;
  isSupabaseConfigured?: boolean;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  onOpenConfigModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onResetDemo,
  onOpenDemoScript,
  currentUser = null,
  isSupabaseConfigured = false,
  onOpenAuthModal = () => {},
  onSignOut = () => {},
  onOpenConfigModal = () => {}
}) => {
  return (
    <header className="app-navbar">
      <div className="nav-brand">
        <div className="nav-logo-icon">
          <Bus size={22} />
        </div>
        <div>
          <h1 className="nav-title">
            RouteLess
            <span style={{ fontSize: '0.65rem', background: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
              Prototype
            </span>
          </h1>
          <p className="nav-tagline">When a bus stops, learning should not.</p>
        </div>
      </div>

      <div className="nav-actions">
        {/* Supabase Authentication & Session Badge */}
        <UserSessionBadge
          currentUser={currentUser}
          isConfigured={isSupabaseConfigured}
          onOpenAuthModal={onOpenAuthModal}
          onSignOut={onSignOut}
          onOpenConfigModal={onOpenConfigModal}
        />

        {/* Demo Mode Toggle */}
        <div className="mode-toggle-group" aria-label="Demo Role Switcher">
          <button
            type="button"
            className={`mode-toggle-btn ${currentView === 'COORDINATOR' ? 'active' : ''}`}
            onClick={() => onViewChange('COORDINATOR')}
            title="Coordinator dashboard: fleet control, route blocking, and allocation"
          >
            <Shield size={14} />
            <span>Coordinator View</span>
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${currentView === 'STUDENT' ? 'active' : ''}`}
            onClick={() => onViewChange('STUDENT')}
            title="Student view: request morning transport from village"
          >
            <Users size={14} />
            <span>Student View</span>
          </button>
        </div>

        {/* Demo Script Walkthrough Button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onOpenDemoScript}
          title="Open step-by-step evaluator challenge walkthrough"
        >
          <BookOpen size={14} />
          <span>Demo Guide</span>
        </button>

        {/* Reset Demo Button */}
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={onResetDemo}
          title="Reset all vehicles, roads, and requests to default seeded state"
        >
          <RotateCcw size={14} />
          <span>Reset Demo</span>
        </button>
      </div>
    </header>
  );
};
