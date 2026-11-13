import { AuditLogEntry, UserRole } from '../types';

class AuditServiceImpl {
  private logs: AuditLogEntry[] = [];
  private listeners: Set<(logs: AuditLogEntry[]) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('routeless_audit_logs_v2');
        if (saved) {
          this.logs = JSON.parse(saved);
          return;
        }
      }
    } catch (e) {
      // safe fallback
    }
    // Initial audit record
    this.logs = [
      {
        id: 'audit-init',
        timestamp: new Date().toISOString(),
        actor: 'System Bootstrap',
        role: 'ADMINISTRATOR',
        action: 'SYSTEM_INITIALIZED',
        details: 'RouteLess Mangaluru Regional Transportation Platform initialized with 5 hamlets, 2 institutions, and 3 baseline fleet trips.'
      }
    ];
  }

  private persist() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('routeless_audit_logs_v2', JSON.stringify(this.logs.slice(0, 200)));
      }
    } catch (e) {
      // safe fallback
    }
    this.notifyListeners();
  }

  public record(actor: string, role: UserRole, action: string, details: string) {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor,
      role,
      action,
      details
    };
    this.logs.unshift(entry);
    this.persist();
  }

  public getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    this.persist();
  }

  public subscribe(listener: (logs: AuditLogEntry[]) => void): () => void {
    this.listeners.add(listener);
    listener([...this.logs]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => {
      try {
        l([...this.logs]);
      } catch (e) {
        console.error('Audit listener error', e);
      }
    });
  }
}

export const AuditService = new AuditServiceImpl();
