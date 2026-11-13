import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { SystemNotification, UserRole } from '../../types';
import { NotificationService } from '../../services/notificationService';
import { AuthService } from '../../services/authService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose
}) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    const unsub = NotificationService.subscribe(nList => {
      setNotifications(nList);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    NotificationService.markAllAsRead();
  };

  const handleClearAll = () => {
    NotificationService.clearAll();
  };

  const handleMarkOne = (id: string) => {
    NotificationService.markAsRead(id);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div className="modal-box" style={{ maxWidth: '640px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} className="text-primary" />
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
              Emergency Disruption Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                {unreadCount} Unread
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {notifications.length > 0 && (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={handleMarkAllRead}
                  title="Mark all notifications as read"
                >
                  <CheckCheck size={14} />
                  <span>Mark Read</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '4px 8px', color: '#ef4444' }}
                  onClick={handleClearAll}
                  title="Clear all notifications"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Adapter Status Notice */}
        <div style={{ background: '#0f172a', padding: '8px 12px', fontSize: '0.75rem', color: '#94a3b8', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            <b>Notification Adapter:</b> Real-time In-App Engine Active
          </span>
          <span style={{ color: '#38bdf8' }}>
            SMS Gateway: Configurable via TWILIO_ACCOUNT_SID
          </span>
        </div>

        {/* Notifications Scrollable List */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px 0' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
              <Bell size={32} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
              <div>No notifications at this time.</div>
              <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                Disruptions, breakdowns, and schedule changes will appear here in real-time.
              </div>
            </div>
          ) : (
            notifications.map(n => {
              const isAlert = n.severity === 'alert';
              const isWarning = n.severity === 'warning';
              const isSuccess = n.severity === 'success';

              const icon = isAlert ? (
                <AlertOctagon size={18} style={{ color: '#ef4444' }} />
              ) : isWarning ? (
                <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
              ) : isSuccess ? (
                <CheckCircle2 size={18} style={{ color: '#10b981' }} />
              ) : (
                <Info size={18} style={{ color: '#38bdf8' }} />
              );

              return (
                <div
                  key={n.id}
                  onClick={() => handleMarkOne(n.id)}
                  style={{
                    background: n.read ? '#0f172a' : '#1e293b',
                    borderLeft: `4px solid ${isAlert ? '#ef4444' : isWarning ? '#f59e0b' : isSuccess ? '#10b981' : '#38bdf8'}`,
                    padding: '12px 14px',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {icon}
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: n.read ? '#cbd5e1' : '#f8fafc' }}>
                        {n.title}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', paddingLeft: '26px' }}>
                    {n.message}
                  </div>

                  {n.suggestedAction && (
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '6px', paddingLeft: '26px', fontWeight: 500 }}>
                      Action: {n.suggestedAction}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ borderTop: '1px solid #334155', paddingTop: '10px', textAlign: 'right' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem' }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
