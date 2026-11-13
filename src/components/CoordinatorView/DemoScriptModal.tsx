import React from 'react';
import { BookOpen, X, Play, RotateCw, AlertTriangle, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface DemoScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToStudentView: () => void;
  onSwitchToCoordinatorView: () => void;
  onRunBaseline: () => void;
  onTriggerDisruption: () => void;
  onRunRecovery: () => void;
  onReset: () => void;
}

export const DemoScriptModal: React.FC<DemoScriptModalProps> = ({
  isOpen,
  onClose,
  onSwitchToStudentView,
  onSwitchToCoordinatorView,
  onRunBaseline,
  onTriggerDisruption,
  onRunRecovery,
  onReset
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        <div className="modal-header" style={{ background: '#042f2e', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} className="text-teal" />
            <h3 className="card-title" style={{ color: 'white' }}>
              Evaluator Guide: "The Exam Day Crisis" Walkthrough
            </h3>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ borderRadius: '50%', width: 28, height: 28, padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px', padding: '12px 16px', marginBottom: '18px', fontSize: '0.85rem', color: '#042f2e' }}>
            <strong>Official Surprise Hurdle:</strong> Test the four simultaneous crisis events: 2 government buses disabled, student demand surges by 40%, valley road flooded, and students facing imminent exams within 2 hours. Follow these exact steps:
          </div>

          <div className="step-item" style={{ display: 'flex', gap: '16px', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0d9488', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              1
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                Verify Normal Baseline Operations
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                20 baseline requests (divisible by 5) are registered across 4 vehicles (24 seats total). Click "Run Baseline Allocation" to observe clean, capacity-safe initial distribution.
              </p>
              <div style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    onRunBaseline();
                    onClose();
                  }}
                >
                  <Play size={12} /> Run Baseline Allocation
                </button>
              </div>
            </div>
          </div>

          <div className="step-item" style={{ display: 'flex', gap: '16px', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#d97706', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              2
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                Activate "The Exam Day Crisis"
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                Click the prominent "Activate Exam Day Crisis" button. Notice:
                Bus 01 & Bus 02 are disabled (-13 seats), Ganjimutt road is flooded, and demand surges by +40% (+8 exam students, total 28 requests).
              </p>
              <div style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-warning btn-sm"
                  onClick={() => {
                    onTriggerDisruption();
                    onClose();
                  }}
                >
                  <Zap size={12} /> Activate Exam Day Crisis Now
                </button>
              </div>
            </div>
          </div>

          <div className="step-item" style={{ display: 'flex', gap: '16px', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0d9488', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              3
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                Inspect State B: Crisis Before Recovery
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                Inspect the system in its collapsed state. Surviving assignments are re-validated, disabled bus seats are removed, and new surge requests are pending. Previous allocations are flagged as stale.
              </p>
            </div>
          </div>

          <div className="step-item" style={{ display: 'flex', gap: '16px', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0d9488', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              4
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                Generate Recovery Plan (Dijkstra + Exam Priority)
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                Click "Generate Recovery Plan". The pure solver finds the shortest bypass path around the flooded road via Adyar Ridge (+8m detour) and prioritizes students with imminent board exams within the 2-hour window.
              </p>
              <div style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    onRunRecovery();
                    onClose();
                  }}
                  style={{ background: '#0d9488' }}
                >
                  <RotateCw size={12} /> Generate Recovery Plan
                </button>
              </div>
            </div>
          </div>

          <div className="step-item" style={{ display: 'flex', gap: '16px', padding: '12px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#042f2e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              5
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                Review 3-State Recovery Audit & Honest Explanations
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                Review the "Crisis Impact & 3-State Audit" tab. Compare State B vs State C metrics. See how all 11 surviving seats were utilized to save exam candidates, and inspect the honest reasons for unassigned students without fabricated capacity.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              onReset();
              onClose();
            }}
          >
            Reset Demo to Defaults
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Walkthrough
          </button>
        </div>
      </div>
    </div>
  );
};
