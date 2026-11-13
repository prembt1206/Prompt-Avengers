import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Award, Clock } from 'lucide-react';
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
  const [gradeOrStream, setGradeOrStream] = useState('Grade 10');
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
      `✓ Transport request submitted for ${studentName.trim()} (${isExamStudent ? 'Exam Candidate: ' + examSubject : 'Regular'})! Destination: ${selectedInst?.name}.`
    );
    setStudentName('');
    setNotes('');

    setTimeout(() => {
      setSubmittedBanner(null);
    }, 6000);
  };

  return (
    <div className="card">
      <div className="card-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <h3 className="card-title">
          <Send size={18} className="text-teal" />
          Request Morning Transport to College / School
        </h3>
        <span className="badge badge-teal">Student & Parent Portal</span>
      </div>
      <div className="card-body">
        {submittedBanner && (
          <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{submittedBanner}</span>
          </div>
        )}

        {validationError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Official Exam Hurdle Question */}
          <div
            style={{
              background: isExamStudent ? '#fffbeb' : '#f8fafc',
              border: isExamStudent ? '2px solid #f59e0b' : '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '20px',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={20} color={isExamStudent ? '#d97706' : '#64748b'} />
                <div>
                  <label htmlFor="exam-toggle" style={{ fontWeight: 700, fontSize: '0.95rem', color: isExamStudent ? '#92400e' : '#334155', cursor: 'pointer' }}>
                    Do you have an examination today?
                  </label>
                  <p style={{ fontSize: '0.775rem', color: isExamStudent ? '#78350f' : '#64748b', margin: 0 }}>
                    Exam candidates receive top priority during transport shortages and vehicle breakdowns.
                  </p>
                </div>
              </div>

              <label className="switch-toggle" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  id="exam-toggle"
                  type="checkbox"
                  checked={isExamStudent}
                  onChange={e => handleToggleExam(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#d97706', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: isExamStudent ? '#d97706' : '#64748b' }}>
                  {isExamStudent ? 'YES — Exam Candidate' : 'NO — Regular Class'}
                </span>
              </label>
            </div>

            {/* If Exam candidate, show validated fields */}
            {isExamStudent && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #fde68a', paddingTop: '14px' }}>
                <div className="grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#92400e' }}>
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
                    <label className="form-label" style={{ color: '#92400e' }}>
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#92400e', marginTop: '10px' }}>
                  <Clock size={13} />
                  <span>
                    <strong>Arrival Buffer Policy:</strong> Exam candidates require a mandatory <strong>{EXAM_ARRIVAL_BUFFER_MINUTES}-minute arrival buffer</strong> before exam commencement (Required Arrival Deadline: <strong>{requiredArrivalTime}</strong>).
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Student Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Prathiksha Poojary"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Course / Stream / Grade *</label>
              <select
                className="form-select"
                value={gradeOrStream}
                onChange={e => setGradeOrStream(e.target.value)}
              >
                <option value="Grade 10 (SSLC)">Grade 10 (Karnataka SSLC Board Candidate)</option>
                <option value="Grade 12 - Science (PUC)">Grade 12 — PU II Science (State Board)</option>
                <option value="Grade 12 - Commerce (PUC)">Grade 12 — PU II Commerce</option>
                <option value="Grade 11 - Science (PUC)">Grade 11 — PU I Science</option>
                <option value="Grade 11 - Arts (PUC)">Grade 11 — PU I Arts</option>
                <option value="Grade 9 (Secondary)">Grade 9 (Secondary School)</option>
                <option value="Diploma Mechanical Year 2 (KPT)">Diploma Mechanical Year 2 (KPT Kadri)</option>
                <option value="Diploma Civil Year 1 (KPT)">Diploma Civil Year 1 (KPT Kadri)</option>
                <option value="Diploma EEE Year 1 (KPT)">Diploma EEE Year 1 (KPT Kadri)</option>
                <option value="Diploma Computer Science Year 2 (KPT)">Diploma Computer Science Year 2 (KPT Kadri)</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Origin Village / Rural Hamlet *</label>
              <select
                className="form-select"
                value={originVillageId}
                onChange={e => setOriginVillageId(e.target.value)}
              >
                {villages.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.connectivityType})
                  </option>
                ))}
              </select>
              <p className="form-hint">
                {villages.find(v => v.id === originVillageId)?.description}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Destination Educational Institution *</label>
              <select
                className="form-select"
                value={destinationInstitutionId}
                onChange={e => {
                  setDestinationInstitutionId(e.target.value);
                  const inst = institutions.find(i => i.id === e.target.value);
                  if (inst && !isExamStudent) {
                    setRequiredArrivalTime(inst.schoolStartTime);
                  }
                }}
              >
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} (Classes start {inst.schoolStartTime})
                  </option>
                ))}
              </select>
              <p className="form-hint">
                {institutions.find(i => i.id === destinationInstitutionId)?.address}
              </p>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                Required Arrival Deadline {isExamStudent && '(Calculated with 15m Buffer)'}
              </label>
              <input
                type="time"
                className="form-control"
                value={requiredArrivalTime}
                onChange={e => setRequiredArrivalTime(e.target.value)}
                required
              />
              <p className="form-hint">
                Vehicles arriving after this time are flagged as late and not counted as on-time.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Academic Priority Category *</label>
              <select
                className="form-select"
                value={priorityCategory}
                onChange={e => setPriorityCategory(e.target.value as PriorityCategory)}
                disabled={isExamStudent}
              >
                <option value="CRITICAL_EXAM">Critical Exam / Board Examination (Highest Priority)</option>
                <option value="LAB_PRACTICAL">Mandatory Laboratory / Workshop Practical</option>
                <option value="REGULAR_ATTENDANCE">Regular Daily Classroom Attendance</option>
              </select>
              <p className="form-hint">
                {isExamStudent ? 'Locked to Highest Priority because Exam is active.' : 'Determines triage rank during seat shortages.'}
              </p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Special Transport Notes / Medical or Tool Transport (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Carrying lab drafting board; needs early boarding"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="submit" className="btn btn-teal btn-lg">
              <Send size={16} />
              Submit Transport Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
