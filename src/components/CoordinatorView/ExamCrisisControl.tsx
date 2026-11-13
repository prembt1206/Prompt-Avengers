import React, { useState } from 'react';
import {
  AlertTriangle,
  RotateCw,
  RotateCcw,
  Clock,
  Bus,
  Waves,
  Award,
  ArrowRight,
  ShieldAlert,
  Zap,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { ExamCrisisState, CrisisComparisonMetrics } from '../../types';

interface ExamCrisisControlProps {
  crisisState: ExamCrisisState | null;
  comparisonMetrics: CrisisComparisonMetrics | null;
  onActivateCrisis: () => void;
  onGenerateRecoveryPlan: () => void;
  onResetToNormal: () => void;
}

export const ExamCrisisControl: React.FC<ExamCrisisControlProps> = ({
  crisisState,
  comparisonMetrics,
  onActivateCrisis,
  onGenerateRecoveryPlan,
  onResetToNormal
}) => {
  const [showConfirmActivateModal, setShowConfirmActivateModal] = useState(false);
  const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);

  const isCrisisActive = Boolean(crisisState?.isActive);

  return (
    <div style={{ marginBottom: '22px' }}>
      {/* Simulation Clock Strip */}
      <div
        style={{
          background: '#042f2e',
          color: '#f0fdf4',
          borderRadius: '8px 8px 0 0',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.8rem',
          border: '1px solid #0f766e',
          borderBottom: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={14} className="text-amber" />
          <span>
            <strong>Simulated Dispatch Clock:</strong> 06:45 AM (Fixed demo simulation — not real wall clock)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>
            <strong>Arrival Buffer:</strong> 15 minutes before examination
          </span>
          <span
            style={{
              background: isCrisisActive ? '#dc2626' : '#0f766e',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 700,
              fontSize: '0.725rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            {isCrisisActive ? '🚨 Crisis Active' : 'Normal Operations'}
          </span>
        </div>
      </div>

      {/* Main Crisis Action Card */}
      <div
        className="card"
        style={{
          borderRadius: '0 0 var(--radius-md) var(--radius-md)',
          border: isCrisisActive ? '2px solid #d97706' : '1px solid #cbd5e1',
          background: isCrisisActive ? '#fffbeb' : '#ffffff',
          boxShadow: isCrisisActive ? '0 10px 25px -5px rgba(217, 119, 6, 0.15)' : 'var(--shadow-sm)',
          margin: 0
        }}
      >
        <div className="card-body" style={{ padding: '20px' }}>
          {!isCrisisActive ? (
            /* Normal Mode State */
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <ShieldAlert size={20} className="text-teal" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Exam Day Crisis Simulator
                  </h3>
                  <span className="badge badge-teal">Official Challenge Scenario</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569', maxWidth: '780px', lineHeight: 1.4 }}>
                  Test RouteLess under catastrophic conditions: 2 government buses fail simultaneously, student demand surges by 40%, and flash flooding submerges the Ganjimutt–Farangipete valley road.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-warning btn-lg pulse-glow"
                onClick={() => setShowConfirmActivateModal(true)}
                style={{ fontWeight: 800, letterSpacing: '0.01em' }}
              >
                <Zap size={18} />
                Activate Exam Day Crisis
              </button>
            </div>
          ) : isCrisisActive && crisisState ? (
            /* Active Crisis State */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={22} className="text-danger" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#92400e' }}>
                      THE EXAM DAY CRISIS: ACTIVE
                    </h3>
                    <span className="badge badge-danger">High Severity</span>
                    {crisisState.isStale && (
                      <span className="badge badge-warning">Allocations Stale — Recovery Required</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#78350f', marginTop: '4px', maxWidth: '820px' }}>
                    Two government buses disabled, major valley corridor impassable, and +40% surge in student demand. Students with imminent board exams have immediate priority.
                  </p>
                </div>

                {/* Primary Recovery Button */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg pulse-glow"
                    onClick={onGenerateRecoveryPlan}
                    style={{ background: '#0d9488', borderColor: '#0f766e', fontWeight: 800 }}
                  >
                    <RotateCw size={18} />
                    Generate Recovery Plan
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowConfirmResetModal(true)}
                  >
                    <RotateCcw size={15} />
                    Reset to Normal Scenario
                  </button>
                </div>
              </div>

              {/* Crisis Metrics Summary Banner */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  background: '#ffffff',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  padding: '14px'
                }}
              >
                <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Student Demand Surge
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#92400e' }}>
                      {crisisState.totalRequestCount}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>
                      (+{crisisState.additionalRequestCount} / +{crisisState.actualPercentageIncrease}%)
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    Original: {crisisState.originalRequestCount} requests
                  </div>
                </div>

                <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Fleet Capacity Deficit
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>
                      -13 Seats
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      (2 Buses Down)
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    Surviving Capacity: 11 seats
                  </div>
                </div>

                <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Blocked Road Corridor
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#dc2626', marginTop: '4px' }}>
                    Ganjimutt ↔ Farangipete
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#78350f' }}>
                    Flooded; Dijkstra reroutes via Adyar Ridge
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Exam Window (Next 2 Hours)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <Award size={16} color="#d97706" />
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#d97706' }}>
                      Exams by 08:45 AM
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    Strict 15m arrival buffer enforced
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Confirmation Modal Before Activation */}
      {showConfirmActivateModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmActivateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header" style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} className="text-warning" />
                <h3 className="card-title" style={{ color: '#92400e' }}>
                  Activate "The Exam Day Crisis"?
                </h3>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '14px' }}>
                This action executes an atomic, repeatable transformation of the rural transit network:
              </p>
              <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>Saves an immutable snapshot</strong> of your current normal baseline state.
                </li>
                <li>
                  <strong>Disables two government buses:</strong> Bus 01 (Sarige Mini-Bus) and Bus 02 (JnNURM City Bus), eliminating 13 seats.
                </li>
                <li>
                  <strong>Surges student demand by 40%:</strong> Adds exactly 8 deterministic student requests with imminent morning exam deadlines.
                </li>
                <li>
                  <strong>Submerges Ganjimutt–Farangipete road:</strong> Forces Dijkstra routing over alternative bypass corridors.
                </li>
                <li>
                  <strong>Invalidates previous allocations:</strong> Enters State B (Crisis Before Recovery).
                </li>
              </ul>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirmActivateModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => {
                  setShowConfirmActivateModal(false);
                  onActivateCrisis();
                }}
              >
                Confirm & Activate Crisis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Reset */}
      {showConfirmResetModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmResetModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="card-title">Reset to Normal Scenario?</h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                This will restore the pre-crisis baseline snapshot: re-activating both government buses, reopening the flooded corridor, and removing the 40% surge requests.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirmResetModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setShowConfirmResetModal(false);
                  onResetToNormal();
                }}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
