import React from 'react';
import { BookOpen, X, CheckCircle, ArrowRight, Shield, Play, RotateCw, AlertTriangle } from 'lucide-react';

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
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} className="text-primary" />
            <h3 className="card-title">RouteLess Evaluator Challenge Walkthrough</h3>
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
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.85rem', color: '#1e3a8a' }}>
            <strong>Goal:</strong> Validate the complete 6-step core demonstration flow specified in the Challenge prompt. Follow each step below in order:
          </div>

          <div className="step-item">
            <div className="step-num">1</div>
            <div className="step-content" style={{ flex: 1 }}>
              <h4>Student Transport Request Flow</h4>
              <p>
                Students from 5 rural hamlets around Mangaluru (Pavoor, Farangipete, Kalladka, Ganjimutt, Gurupura) submit transport requests to 2 landmark Mangaluru institutions (St. Aloysius School & Karnataka Polytechnic KPT). 17 synthetic requests are seeded, and you can submit custom requests via the Student portal.
              </p>
              <div style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    onSwitchToStudentView();
                    onClose();
                  }}
                >
                  Go to Student Request View <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>

          <div className="step-item">
            <div className="step-num">2</div>
            <div className="step-content" style={{ flex: 1 }}>
              <h4>Coordinator Fleet & Network Review</h4>
              <p>
                Switch to Coordinator View to inspect the 3 vehicle trips (Bus 01, Van 02, Cruiser 03), capacity limits (6, 4, 5 seats = 15 total), and the interactive SVG topology.
              </p>
              <div style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    onSwitchToCoordinatorView();
                    onClose();
                  }}
                >
                  Go to Coordinator Cockpit <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>

          <div className="step-item">
            <div className="step-num">3</div>
            <div className="step-content" style={{ flex: 1 }}>
              <h4>Run Baseline Allocation</h4>
              <p>
                Click <strong>"Run Baseline Allocation"</strong>. The deterministic pure TypeScript solver assigns students up to physical capacity limits (15 seats). Honest explanations are generated for the 2 unmet students because requests (17) exceed capacity (15).
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
                  <Play size={12} /> Execute Baseline Allocation
                </button>
              </div>
            </div>
          </div>

          <div className="step-item">
            <div className="step-num">4</div>
            <div className="step-content" style={{ flex: 1 }}>
              <h4>Simulate Vehicle Cancellation or Blocked Route</h4>
              <p>
                Click <strong>"Scenario A: Bus 01 Breakdown"</strong> or <strong>"Scenario B: Causeway Flash Flood"</strong>, or toggle cancellation / blocked status directly on the vehicle cards or SVG map.
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
                  <AlertTriangle size={12} /> Trigger Bus 01 Breakdown Preset
                </button>
              </div>
            </div>
          </div>

          <div className="step-item">
            <div className="step-num">5</div>
            <div className="step-content" style={{ flex: 1 }}>
              <h4>Run Recovery Allocation</h4>
              <p>
                Click <strong>"Run Recovery Allocation"</strong>. The solver reallocates seats without exceeding capacity, avoiding cancelled vehicles and impassable roads.
              </p>
              <div style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-warning btn-sm"
                  onClick={() => {
                    onRunRecovery();
                    onClose();
                  }}
                >
                  <RotateCw size={12} /> Execute Recovery Allocation
                </button>
              </div>
            </div>
          </div>

          <div className="step-item" style={{ borderBottom: 'none' }}>
            <div className="step-num">6</div>
            <div className="step-content" style={{ flex: 1 }}>
              <h4>Verify Results & Honest Unmet Explanations</h4>
              <p>
                Inspect the Validated Assignments and Unmet Demand rosters. Review the P1 <strong>Baseline vs Recovery Diff</strong> to see who was displaced or rerouted, and check the <strong>Solver Logs</strong> for transparent reasoning.
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
            Reset Demo to Initial Seed
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

