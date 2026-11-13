import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Award,
  Clock,
  MapPin,
  ArrowRightLeft,
  Calendar,
  School,
  Bus,
  UserCheck
} from 'lucide-react';
import { StudentRequest, Village, Institution, PriorityCategory } from '../../types';
import { EXAM_ARRIVAL_BUFFER_MINUTES } from '../../models/seedData';

interface StudentRequestFormProps {
  villages: Village[];
  institutions: Institution[];
  onSubmitRequest: (req: StudentRequest) => void;
}

export const StudentRequestForm: React.FC<StudentRequestFormProps> = ({
  villages,
  institutions,
  onSubmitRequest
}) => {
  const [studentName, setStudentName] = useState('');
  const [gradeOrStream, setGradeOrStream] = useState('Grade 10 (SSLC)');
  const [originVillageId, setOriginVillageId] = useState(villages[0]?.id || '');
  const [destinationInstitutionId, setDestinationInstitutionId] = useState(institutions[0]?.id || '');
  
  // Official Exam Day Crisis additions
  const [isExamStudent, setIsExamStudent] = useState(true);
  const [examStartTime, setExamStartTime] = useState('08:30');
  const [examSubject, setExamSubject] = useState('Karnataka SSLC Mathematics Board Exam');
  
  // Required arrival time defaults to 15 mins before exam (08:15) or school start time (08:30)
  const [requiredArrivalTime, setRequiredArrivalTime] = useState('08:15');
  const [priorityCategory, setPriorityCategory] = useState<PriorityCategory>('CRITICAL_EXAM');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittedBanner, setSubmittedBanner] = useState<string | null>(null);

  // Synchronize exam start time with required arrival buffer
  const handleExamTimeChange = (newExamTime: string) => {
    setExamStartTime(newExamTime);
    const [h, m] = newExamTime.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const totalMins = h * 60 + m - EXAM_ARRIVAL_BUFFER_MINUTES;
      const newH = Math.max(0, Math.floor(totalMins / 60));
      const newM = Math.max(0, totalMins % 60);
      setRequiredArrivalTime(`${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`);
    }
  };

  const handleToggleExam = (checked: boolean) => {
    setIsExamStudent(checked);
    if (checked) {
      setPriorityCategory('CRITICAL_EXAM');
      handleExamTimeChange(examStartTime || '08:30');
    } else {
      setPriorityCategory('REGULAR_ATTENDANCE');
      const inst = institutions.find(i => i.id === destinationInstitutionId);
      setRequiredArrivalTime(inst?.schoolStartTime || '08:30');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!studentName.trim()) {
      setValidationError('Please enter the student full name.');
      return;
    }

    if (isExamStudent && (!examStartTime || !examSubject.trim())) {
      setValidationError('Please enter both the exam start time and subject/paper title.');
      return;
    }

    const selectedVillage = villages.find(v => v.id === originVillageId);
    const selectedInst = institutions.find(i => i.id === destinationInstitutionId);

    const newRequest: StudentRequest = {
      id: `req-cust-${Date.now()}`,
      studentName: studentName.trim(),
      gradeOrStream,
      originVillageId,
      originVillageName: selectedVillage ? selectedVillage.name : 'Unknown Village',
      destinationInstitutionId,
      destinationInstitutionName: selectedInst ? selectedInst.name : 'Unknown Institution',
      destinationName: selectedInst ? selectedInst.name : 'Unknown Institution',
      requiredArrivalTime,
      priorityCategory: isExamStudent ? 'CRITICAL_EXAM' : priorityCategory,
      submissionTimestamp: new Date().toISOString(),
      submissionOrder: Date.now(),
      isExamStudent,
      examStartTime: isExamStudent ? examStartTime : undefined,
      examSubject: isExamStudent ? examSubject.trim() : undefined,
      notes: notes.trim() || undefined,
      isCustom: true
    };

    onSubmitRequest(newRequest);
    setSubmittedBanner(
      `✓ Guaranteed seat request submitted for ${studentName.trim()} (${isExamStudent ? 'Exam Candidate' : 'Regular'}) to ${selectedInst?.name}!`
    );
    setStudentName('');
    setNotes('');

    setTimeout(() => {
      setSubmittedBanner(null);
    }, 6000);
  };

  return (
    <div className="card" style={{ overflow: 'visible' }}>
      <div className="card-header" style={{ background: '#f8f9fa', borderBottom: '1px solid #e2e4e8' }}>
        <h3 className="card-title">
          <Bus size={18} color="#0770e3" />
          Request Rural Morning Transport to College / School
        </h3>
        <span className="badge badge-primary">Student & Parent Portal</span>
      </div>

      <div className="card-body">
        {submittedBanner && (
          <div
            style={{
              background: '#e6f6f5',
              border: '1px solid #00a698',
              color: '#05655d',
              padding: '12px 18px',
              borderRadius: '8px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <CheckCircle2 size={20} color="#00a698" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{submittedBanner}</span>
          </div>
        )}

        {validationError && (
          <div
            style={{
              background: '#fde8e8',
              border: '1px solid #fecaca',
              color: '#901b1b',
              padding: '10px 16px',
              borderRadius: '8px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Skyscanner Segmented Booking Card Container */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #d2d8e0',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(5, 32, 60, 0.08)',
              padding: '4px',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
              {/* Pickup Village Segment */}
              <div
                style={{
                  flex: '1 1 200px',
                  padding: '12px 16px',
                  borderRight: '1px solid #e2e4e8',
                  position: 'relative'
                }}
              >
                <label className="segment-label">
                  <MapPin size={13} color="#0770e3" />
                  Origin (Pickup Village)
                </label>
                <select
                  className="segment-select"
                  value={originVillageId}
                  onChange={e => setOriginVillageId(e.target.value)}
                >
                  {villages.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.id.toUpperCase().slice(-4)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Institution Segment */}
              <div
                style={{
                  flex: '1 1 220px',
                  padding: '12px 16px',
                  borderRight: '1px solid #e2e4e8'
                }}
              >
                <label className="segment-label">
                  <School size={13} color="#00a698" />
                  Destination (Institution)
                </label>
                <select
                  className="segment-select"
                  value={destinationInstitutionId}
                  onChange={e => setDestinationInstitutionId(e.target.value)}
                >
                  {institutions.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Name Segment */}
              <div
                style={{
                  flex: '1 1 180px',
                  padding: '12px 16px',
                  borderRight: '1px solid #e2e4e8'
                }}
              >
                <label className="segment-label">
                  <UserCheck size={13} color="#0770e3" />
                  Student Full Name *
                </label>
                <input
                  type="text"
                  className="segment-input"
                  placeholder="e.g. Prathiksha Poojary"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  required
                />
              </div>

              {/* Grade / Stream Segment */}
              <div
                style={{
                  flex: '1 1 180px',
                  padding: '12px 16px'
                }}
              >
                <label className="segment-label">
                  <Award size={13} color="#ff7b59" />
                  Grade / Course
                </label>
                <select
                  className="segment-select"
                  value={gradeOrStream}
                  onChange={e => setGradeOrStream(e.target.value)}
                >
                  <option value="Grade 10 (SSLC)">Grade 10 (SSLC Board)</option>
                  <option value="Grade 12 - Science (PUC)">Grade 12 — PU II Science</option>
                  <option value="Grade 12 - Commerce (PUC)">Grade 12 — PU II Commerce</option>
                  <option value="Grade 11 - Science (PUC)">Grade 11 — PU I Science</option>
                  <option value="Diploma Mechanical Year 2 (KPT)">Diploma Mechanical (KPT)</option>
                  <option value="Diploma Computer Science Year 2 (KPT)">Diploma CS (KPT)</option>
                  <option value="Grade 9 (Secondary)">Grade 9 (Secondary)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Official Exam Hurdle Question Banner */}
          <div
            style={{
              background: isExamStudent ? '#fff1ed' : '#f8f9fa',
              border: isExamStudent ? '2px solid #ff7b59' : '1px solid #d2d8e0',
              borderRadius: '12px',
              padding: '18px 22px',
              marginBottom: '20px',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Award size={22} color={isExamStudent ? '#e05e3a' : '#686974'} />
                <div>
                  <label htmlFor="exam-toggle" style={{ fontWeight: 800, fontSize: '1rem', color: isExamStudent ? '#a83515' : '#111215', cursor: 'pointer' }}>
                    Do you have an examination today?
                  </label>
                  <p style={{ fontSize: '0.8rem', color: isExamStudent ? '#a83515' : '#686974', margin: 0 }}>
                    Exam candidates receive top priority during transport shortages and vehicle breakdowns.
                  </p>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  id="exam-toggle"
                  type="checkbox"
                  checked={isExamStudent}
                  onChange={e => handleToggleExam(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#ff7b59', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isExamStudent ? '#a83515' : '#686974' }}>
                  {isExamStudent ? 'YES — Exam Candidate' : 'NO — Regular Class'}
                </span>
              </label>
            </div>

            {/* If Exam candidate, show validated fields */}
            {isExamStudent && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #ffd5cc', paddingTop: '16px' }}>
                <div className="grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#a83515', fontWeight: 700 }}>
                      Examination Subject / Paper Title *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Karnataka SSLC Mathematics / BTE Diploma Practical"
                      value={examSubject}
                      onChange={e => setExamSubject(e.target.value)}
                      required={isExamStudent}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#a83515', fontWeight: 700 }}>
                      Exam Start Time *
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      value={examStartTime}
                      onChange={e => handleExamTimeChange(e.target.value)}
                      required={isExamStudent}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#a83515', marginTop: '12px' }}>
                  <Clock size={15} />
                  <span>
                    <strong>Mandatory Arrival Buffer:</strong> Exam candidates require a mandatory <strong>{EXAM_ARRIVAL_BUFFER_MINUTES}-minute arrival safety buffer</strong> before the exam bell (Must reach institution by <strong>{requiredArrivalTime}</strong>).
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Optional notes */}
          <div className="form-group">
            <label className="form-label">Special Transport Notes (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Near Gurupura bridge pickup point / carrying drafting board"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{
                background: '#0770e3',
                borderColor: '#0770e3',
                fontWeight: 800,
                padding: '14px 32px',
                fontSize: '1rem',
                borderRadius: '8px',
                boxShadow: '0 4px 14px rgba(7, 112, 227, 0.35)'
              }}
            >
              <Send size={18} />
              <span>Submit Transport Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
