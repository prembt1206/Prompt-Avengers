import React from 'react';
import { AlertTriangle, Zap, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { ExamCrisisState } from '../../types';

interface SkyscannerCrisisBannerProps {
  crisisState: ExamCrisisState | null;
  onActivateCrisis: () => void;
  onGenerateRecovery: () => void;
  onResetCrisis: () => void;
  onViewAudit: () => void;
}

export const SkyscannerCrisisBanner: React.FC<SkyscannerCrisisBannerProps> = ({
  crisisState,
  onActivateCrisis,
  onGenerateRecovery,
  onResetCrisis,
  onViewAudit
}) => {
  const isCrisisActive = Boolean(crisisState?.isActive);
  const isStale = Boolean(crisisState?.isStale);

  return (
    <div className="skyscanner-promo-banner">
      <div className="skyscanner-promo-content">
        <div className="skyscanner-promo-tag">
          <AlertTriangle size={14} />
          <span>Official Surprise Hurdle • Simulation Scenario</span>
        </div>

        <h2 className="skyscanner-promo-title">
          {isCrisisActive
            ? isStale
              ? 'Exam Day Crisis Active: Recovery Plan Pending'
              : 'Exam Day Crisis Resolved: Optimal Recovery Deployed'
            : 'The Exam Day Crisis: Test Rural Resilience'}
        </h2>

        <p className="skyscanner-promo-desc">
          {isCrisisActive
            ? 'Two government buses disabled, Ganjimutt road flooded, and 40% student demand surge active. The solver prioritizes imminent board exam students with a mandatory 15-minute arrival safety buffer.'
            : 'Simulate cascading morning transit failures: 2 KSRTC buses disabled, +40% student demand surge, flooded valley road, and strict board exam arrival windows. See how RouteLess dynamically reroutes scarce vehicles.'}
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {!isCrisisActive ? (
            <button
              type="button"
              className="skyscanner-promo-btn"
              onClick={onActivateCrisis}
            >
              <Zap size={16} color="#d97706" />
              <span>Activate Exam Day Crisis</span>
            </button>
          ) : isStale ? (
            <button
              type="button"
              className="skyscanner-promo-btn"
              onClick={onGenerateRecovery}
              style={{ background: '#0770e3', color: '#ffffff' }}
            >
              <Zap size={16} />
              <span>Generate Emergency Recovery Plan</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                className="skyscanner-promo-btn"
                onClick={onViewAudit}
                style={{ background: '#00a698', color: '#ffffff' }}
              >
                <CheckCircle2 size={16} />
                <span>View State B vs State C Audit</span>
              </button>
              <button
                type="button"
                className="skyscanner-promo-btn"
                onClick={onResetCrisis}
                style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }}
              >
                <RotateCcw size={15} />
                <span>Reset to Baseline</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onViewAudit}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Learn about protocol</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

