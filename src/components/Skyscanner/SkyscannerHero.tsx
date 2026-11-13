import React, { useState } from 'react';
import {
  MapPin,
  ArrowRightLeft,
  Calendar,
  UserCheck,
  Search,
  Sparkles,
  Bus,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Clock,
  Award
} from 'lucide-react';
import { Village, Institution } from '../../types';

interface SkyscannerHeroProps {
  currentView: 'COORDINATOR' | 'STUDENT';
  onViewChange: (view: 'COORDINATOR' | 'STUDENT') => void;
  villages: Village[];
  institutions: Institution[];
  onQuickSearchOrSubmit?: (originVillageId: string, destinationId: string, isExam: boolean) => void;
  onActivateCrisis: () => void;
  isCrisisActive: boolean;
  onSelectCoordinatorTab?: (tab: 'ALLOCATIONS' | 'CRISIS_AUDIT' | 'MAP' | 'FLEET' | 'ROADS' | 'LOGS') => void;
}

export const SkyscannerHero: React.FC<SkyscannerHeroProps> = ({
  currentView,
  onViewChange,
  villages,
  institutions,
  onQuickSearchOrSubmit,
  onActivateCrisis,
  isCrisisActive,
  onSelectCoordinatorTab
}) => {
  const [selectedVillageId, setSelectedVillageId] = useState(villages[0]?.id || '');
  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.id || '');
  const [isExamMode, setIsExamMode] = useState(true);
  const [timeWindow, setTimeWindow] = useState('07:00 - 08:30 AM');
  const [studentCategory, setStudentCategory] = useState('SSLC Board Exam Candidate');
  const [isNearbyAllowed, setIsNearbyAllowed] = useState(true);
  const [isDijkstraEnabled, setIsDijkstraEnabled] = useState(true);
  const [quickSearchFeedback, setQuickSearchFeedback] = useState<string | null>(null);

  const handleSwap = () => {
    // Visual feedback for swap
    setQuickSearchFeedback('Corridor path reversed (bidirectional rural transit).');
    setTimeout(() => setQuickSearchFeedback(null), 3000);
  };

  const handleSearchAction = () => {
    if (onQuickSearchOrSubmit) {
      onQuickSearchOrSubmit(selectedVillageId, selectedInstId, isExamMode);
    }
    const villageName = villages.find(v => v.id === selectedVillageId)?.name || 'Village';
    const instName = institutions.find(i => i.id === selectedInstId)?.name || 'Institution';
    setQuickSearchFeedback(`Searching verified routes: ${villageName} ➔ ${instName} (${isExamMode ? 'Exam Priority' : 'Standard'}).`);
    setTimeout(() => setQuickSearchFeedback(null), 4000);
  };

  return (
    <section className="skyscanner-hero-section">
      <div className="skyscanner-hero-inner">
        {/* Main Headline */}
        <h1 className="skyscanner-headline">
          Rural transport resilience. One simple search.
        </h1>
        <p className="skyscanner-subheadline">
          When a bus stops, learning should not. Demand-aware seat allocations and dynamic flood recovery across Mangaluru rural taluqs.
        </p>

        {/* Top Pills Filters (Skyscanner style: "Return ▾", "Bags ▾") */}
        <div className="skyscanner-pill-filters">
          <div className="skyscanner-pill active">
            <Bus size={14} />
            <span>Mangaluru Transit Corridor ▾</span>
          </div>
          <div className="skyscanner-pill">
            <Clock size={14} />
            <span>Morning Transit: 06:45 – 08:45 AM ▾</span>
          </div>
          <div className="skyscanner-pill">
            <Award size={14} />
            <span>Karnataka State Board Special ▾</span>
          </div>
          <div className="skyscanner-pill">
            <span>Direct & Bypass Routes ▾</span>
          </div>
        </div>

        {/* The Iconic White Segmented Search Bar */}
        <div className="skyscanner-search-container">
          {/* Segment 1: From */}
          <div className="search-segment">
            <label className="segment-label">
              <MapPin size={13} color="#0770e3" />
              From (Pickup Village)
            </label>
            <select
              className="segment-select"
              value={selectedVillageId}
              onChange={e => setSelectedVillageId(e.target.value)}
              aria-label="Pickup village origin"
            >
              {villages.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.id.toUpperCase().slice(-4)})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="segment-swap-btn"
              onClick={handleSwap}
              title="Reverse direction"
              aria-label="Reverse route endpoints"
            >
              <ArrowRightLeft size={14} />
            </button>
          </div>

          {/* Segment 2: To */}
          <div className="search-segment">
            <label className="segment-label">
              <MapPin size={13} color="#00a698" />
              To (College / School)
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

          {/* Segment 3: Depart Time Window */}
          <div className="search-segment">
            <label className="segment-label">
              <Calendar size={13} color="#0770e3" />
              Depart / Window
            </label>
            <select
              className="segment-select"
              value={timeWindow}
              onChange={e => setTimeWindow(e.target.value)}
              aria-label="Departure transit window"
            >
              <option value="07:00 - 08:30 AM">Morning 07:00 – 08:30 AM</option>
              <option value="07:00 - 07:45 AM">Early Bird 07:00 – 07:45 AM</option>
              <option value="07:30 - 08:15 AM">Peak Exam 07:30 – 08:15 AM</option>
            </select>
          </div>

          {/* Segment 4: Category / Priority */}
          <div className="search-segment">
            <label className="segment-label">
              <UserCheck size={13} color="#ff7b59" />
              Students & Priority
            </label>
            <select
              className="segment-select"
              value={studentCategory}
              onChange={e => setStudentCategory(e.target.value)}
              aria-label="Student priority category"
            >
              <option value="SSLC Board Exam Candidate">1 Student, SSLC Board Exam</option>
              <option value="PUC Science Practical Candidate">1 Student, PUC II Practical Exam</option>
              <option value="Polytechnic Diploma Student">1 Student, KPT Diploma Student</option>
              <option value="Regular Class Student">1 Student, Regular Attendance</option>
            </select>
          </div>

          {/* Segment 5: Action Button */}
          <div className="search-action-segment">
            <button
              type="button"
              className="skyscanner-search-btn"
              onClick={handleSearchAction}
            >
              <Search size={18} />
              <span>Search Transport</span>
            </button>
          </div>
        </div>

        {/* Checkbox Options Under Search Bar */}
        <div className="skyscanner-search-options">
          <label className="skyscanner-checkbox-label">
            <input
              type="checkbox"
              checked={isExamMode}
              onChange={e => setIsExamMode(e.target.checked)}
            />
            <span>Exam Candidate Priority (Enforce 15-min arrival buffer)</span>
          </label>

          <label className="skyscanner-checkbox-label">
            <input
              type="checkbox"
              checked={isNearbyAllowed}
              onChange={e => setIsNearbyAllowed(e.target.checked)}
            />
            <span>Include Nearby Village Stops</span>
          </label>

          <label className="skyscanner-checkbox-label">
            <input
              type="checkbox"
              checked={isDijkstraEnabled}
              onChange={e => setIsDijkstraEnabled(e.target.checked)}
            />
            <span>Dynamic Flood Rerouting via Adyar Ridge</span>
          </label>
        </div>

        {/* Feedback message */}
        {quickSearchFeedback && (
          <div
            style={{
              marginTop: '12px',
              padding: '8px 14px',
              background: 'rgba(7, 112, 227, 0.25)',
              border: '1px solid rgba(7, 112, 227, 0.5)',
              borderRadius: '6px',
              color: '#e8f3fe',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle2 size={15} color="#38bdf8" />
            <span>{quickSearchFeedback}</span>
          </div>
        )}

        {/* The 4 Iconic Skyscanner Quick Nav Cards */}
        <div className="skyscanner-quick-nav">
          <div
            className={`quick-nav-card ${currentView === 'STUDENT' ? 'active' : ''}`}
            onClick={() => onViewChange('STUDENT')}
          >
            <div className="quick-nav-icon">
              <Sparkles size={20} color="#ffffff" />
            </div>
            <div>
              <div className="quick-nav-label">Student Request Portal</div>
              <div className="quick-nav-sub">Request seat & track boarding</div>
            </div>
          </div>

          <div
            className={`quick-nav-card ${currentView === 'COORDINATOR' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('COORDINATOR');
              if (onSelectCoordinatorTab) onSelectCoordinatorTab('FLEET');
            }}
          >
            <div className="quick-nav-icon">
              <Bus size={20} color="#ffffff" />
            </div>
            <div>
              <div className="quick-nav-label">Fleet & Capacity</div>
              <div className="quick-nav-sub">KSRTC buses, vans, capacities</div>
            </div>
          </div>

          <div
            className={`quick-nav-card ${isCrisisActive ? 'active' : ''}`}
            onClick={() => {
              onViewChange('COORDINATOR');
              if (onSelectCoordinatorTab) onSelectCoordinatorTab('CRISIS_AUDIT');
              if (!isCrisisActive) onActivateCrisis();
            }}
          >
            <div className="quick-nav-icon">
              <AlertTriangle size={20} color="#ff7b59" />
            </div>
            <div>
              <div className="quick-nav-label">Exam Day Crisis</div>
              <div className="quick-nav-sub">
                {isCrisisActive ? 'Active: Recovery Mode' : 'Activate 4-vector crisis'}
              </div>
            </div>
          </div>

          <div
            className="quick-nav-card"
            onClick={() => {
              onViewChange('COORDINATOR');
              if (onSelectCoordinatorTab) onSelectCoordinatorTab('MAP');
            }}
          >
            <div className="quick-nav-icon">
              <Compass size={20} color="#ffffff" />
            </div>
            <div>
              <div className="quick-nav-label">Interactive Route Map</div>
              <div className="quick-nav-sub">Visual topology & detour graph</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
