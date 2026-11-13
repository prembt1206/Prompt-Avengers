import React, { useState, useEffect } from 'react';
import {
  Bus,
  Users,
  Shield,
  RotateCcw,
  BookOpen,
  Bell,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { UserRole, UserProfile, SystemNotification } from '../types';
import { AuthService } from '../services/authService';
import { NotificationService } from '../services/notificationService';

interface NavbarProps {
  currentView: 'COORDINATOR' | 'STUDENT' | 'ADMINISTRATOR';
  onViewChange: (view: 'COORDINATOR' | 'STUDENT' | 'ADMINISTRATOR') => void;
  onResetDemo: () => void;
  onOpenDemoScript: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onResetDemo,
  onOpenDemoScript,
  onOpenNotifications
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => AuthService.getCurrentUser());
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  useEffect(() => {
    const unsubAuth = AuthService.subscribe(u => {
      setCurrentUser(u);
    });
    const unsubNotif = NotificationService.subscribe(notifications => {
      setUnreadCount(notifications.filter(n => !n.read).length);
    });
    return () => {
      unsubAuth();
      unsubNotif();
    };
  }, []);

  const handleRoleClick = (role: 'COORDINATOR' | 'STUDENT' | 'ADMINISTRATOR') => {
    onViewChange(role);
    AuthService.switchRole(role);
  };

  return (
    <>
      <header className="app-navbar">
        <div className="nav-brand">
          <div className="nav-logo-icon">
            <Bus size={22} />
          </div>
          <div>
            <h1 className="nav-title">
              RouteLess
              <span
                style={{
                  fontSize: '0.65rem',
                  background: '#0284c7',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginLeft: 6
                }}
              >
                The Last Mile
              </span>
            </h1>
            <p className="nav-tagline">When a bus stops, learning should not.</p>
          </div>
        </div>

        <div className="nav-actions">
          {/* Multi-Role Switcher */}
          <div className="mode-toggle-group" aria-label="Role Switcher">
            <button
              type="button"
              className={`mode-toggle-btn ${currentView === 'COORDINATOR' ? 'active' : ''}`}
              onClick={() => handleRoleClick('COORDINATOR')}
              title="Coordinator Cockpit: fleet management, routing & allocation"
            >
              <Shield size={14} />
              <span>Coordinator</span>
            </button>

            <button
              type="button"
              className={`mode-toggle-btn ${currentView === 'STUDENT' ? 'active' : ''}`}
              onClick={() => handleRoleClick('STUDENT')}
              title="Student Portal: request transit, view assigned bus & personal ETA"
            >
              <Users size={14} />
              <span>Student Portal</span>
            </button>

            <button
              type="button"
              className={`mode-toggle-btn ${currentView === 'ADMINISTRATOR' ? 'active' : ''}`}
              onClick={() => handleRoleClick('ADMINISTRATOR')}
              title="Administrator Dashboard: security audit trail and user roles"
            >
              <ShieldAlert size={14} />
              <span>Admin</span>
            </button>
          </div>

          {/* Emergency Notifications Bell Button */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenNotifications}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Open Emergency Disruption Notifications"
          >
            <Bell size={15} />
            <span>Alerts</span>
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  padding: '1px 5px',
                  border: '2px solid #0f172a'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Demo Script Walkthrough Button */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenDemoScript}
            title="Open step-by-step evaluator challenge walkthrough"
          >
            <BookOpen size={14} />
            <span>Guide</span>
          </button>

          {/* Reset Demo Button */}
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => setConfirmResetOpen(true)}
            title="Reset all vehicles, roads, and requests to default seeded state"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {confirmResetOpen && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '420px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#f8fafc' }}>
              Reset Demonstration State?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
              This will return all 3 vehicle trips, 7 road connections, 17 student requests, and notifications back to the initial seeded baseline state.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '18px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmResetOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setConfirmResetOpen(false);
                  onResetDemo();
                }}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
