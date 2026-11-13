import React, { useState } from 'react';
import {
  MapPin,
  ArrowRightLeft,
  School,
  Award,
  Search,
  Bus,
  Shield,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { Village, Institution } from '../../types';

interface SkyscannerHeroProps {
  currentView: 'COORDINATOR' | 'STUDENT' | 'SIGNUP';
  onViewChange: (view: 'COORDINATOR' | 'STUDENT' | 'SIGNUP') => void;
  villages: Village[];
  institutions: Institution[];
  onQuickSearchOrSubmit?: (originVillageId: string, destinationId: string, isExam: boolean) => void;
  onActivateCrisis?: () => void;
  isCrisisActive?: boolean;
}

export const SkyscannerHero: React.FC<SkyscannerHeroProps> = ({
  currentView,
  onViewChange,
  villages,
  institutions,
  onQuickSearchOrSubmit
}) => {
  const [selectedVillageId, setSelectedVillageId] = useState(villages[0]?.id || '');
  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.id || '');
  const [isExamMode, setIsExamMode] = useState(true);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  const handleSearchAction = () => {
    if (onQuickSearchOrSubmit) {
      onQuickSearchOrSubmit(selectedVillageId, selectedInstId, isExamMode);
    }
    const villageName = villages.find(v => v.id === selectedVillageId)?.name || 'Village';
    const instName = institutions.find(i => i.id === selectedInstId)?.name || 'College';
    setSearchFeedback(`Route selected: ${villageName} ➔ ${instName} (${isExamMode ? 'Exam Priority' : 'Regular'}). Switched to Student View.`);
    setTimeout(() => setSearchFeedback(null), 3500);
  };

  return (
    <section className="skyscanner-hero-section" style={{ padding: '28px 24px 36px 24px' }}>
      <div className="skyscanner-hero-inner" style={{ maxWidth: '1000px' }}>
        {/* Simple & Clean Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Rural Transport Resilience
          </h1>
          <p style={{ fontSize: '1rem', color: '#c0cee8', margin: 0 }}>
            When a bus stops, learning should not. Guaranteed seats & flood rerouting across Mangaluru.
          </p>
        </div>

        {/* Clean, Simple 3-Part Search Bar */}
        <div className="skyscanner-search-container" style={{ borderRadius: '10px' }}>
          {/* 1. Origin Village */}
          <div className="search-segment" style={{ flex: '1 1 240px' }}>
            <label className="segment-label">
              <MapPin size={13} color="#0770e3" />
              Pickup Village (Origin)
            </label>
            <select
              className="segment-select"
              value={selectedVillageId}
              onChange={e => setSelectedVillageId(e.target.value)}
              aria-label="Pickup village origin"
            >
              {villages.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Destination College */}
          <div className="search-segment" style={{ flex: '1 1 260px' }}>
            <label className="segment-label">
              <School size={13} color="#00a698" />
              Destination College / School
            </label>
            <select
              className="segment-select"
              value={selectedInstId}
              onChange={e => setSelectedInstId(e.target.value)}
              aria-label="Destination institution"
            >
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Priority Tier */}
          <div className="search-segment" style={{ flex: '1 1 200px' }}>
            <label className="segment-label">
              <Award size={13} color="#ff7b59" />
              Student Priority
            </label>
            <select
              className="segment-select"
              value={isExamMode ? 'EXAM' : 'REGULAR'}
              onChange={e => setIsExamMode(e.target.value === 'EXAM')}
              aria-label="Priority category"
            >
              <option value="EXAM">Board Exam Candidate (15m buffer)</option>
              <option value="REGULAR">Regular Class Student</option>
            </select>
          </div>

          {/* 4. Action Button */}
          <div className="search-action-segment">
            <button
              type="button"
              className="skyscanner-search-btn"
              onClick={handleSearchAction}
              style={{ padding: '14px 24px', fontSize: '0.95rem' }}
            >
              <Search size={16} />
              <span>Find Transport</span>
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {searchFeedback && (
          <div
            style={{
              marginTop: '12px',
              padding: '8px 14px',
              background: 'rgba(7, 112, 227, 0.2)',
              border: '1px solid rgba(7, 112, 227, 0.4)',
              borderRadius: '6px',
              color: '#e8f3fe',
              fontSize: '0.85rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle2 size={15} color="#38bdf8" />
            <span>{searchFeedback}</span>
          </div>
        )}

        {/* Clean View Switcher Navigation Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '18px' }}>
          <button
            type="button"
            className={`skyscanner-pill ${currentView === 'COORDINATOR' ? 'active' : ''}`}
            onClick={() => onViewChange('COORDINATOR')}
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <Shield size={14} />
            <span>Coordinator Operations</span>
          </button>
          <button
            type="button"
            className={`skyscanner-pill ${currentView === 'STUDENT' ? 'active' : ''}`}
            onClick={() => onViewChange('STUDENT')}
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <UserCheck size={14} />
            <span>Student Request Portal</span>
          </button>
        </div>
      </div>
    </section>
  );
};
