import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { StudentRequest, Village, Institution, PriorityCategory } from '../../types';

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
  const [requiredArrivalTime, setRequiredArrivalTime] = useState('08:30');
  const [priorityCategory, setPriorityCategory] = useState<PriorityCategory>('CRITICAL_EXAM');
  const [notes, setNotes] = useState('');
  const [submittedBanner, setSubmittedBanner] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

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
      priorityCategory,
      submissionTimestamp: new Date().toISOString(),
      notes: notes.trim() || undefined,
      isCustom: true
    };

    onSubmitRequest(newRequest);
    setSubmittedBanner(`Transport request submitted for ${studentName.trim()} from ${selectedVillage?.name}! Switch to Coordinator View to allocate.`);
    setStudentName('');
    setNotes('');

    setTimeout(() => {
      setSubmittedBanner(null);
    }, 6000);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Send size={18} className="text-primary" />
          Request Morning School Transport
        </h3>
        <span className="badge badge-info">Fictional Demo Portal</span>
      </div>
      <div className="card-body">
        {submittedBanner && (
          <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{submittedBanner}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Student Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Rohini Reddy"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Grade / Academic Course *</label>
              <select
                className="form-select"
                value={gradeOrStream}
                onChange={e => setGradeOrStream(e.target.value)}
              >
                <option value="Grade 9">Grade 9 (Secondary)</option>
                <option value="Grade 10">Grade 10 (State Board Candidate)</option>
                <option value="Grade 11 - Science">Grade 11 - Science</option>
                <option value="Grade 11 - Commerce">Grade 11 - Commerce</option>
                <option value="Grade 12 - Arts">Grade 12 - Arts</option>
                <option value="Grade 12 - Science">Grade 12 - Science</option>
                <option value="Polytechnic Year 1 - Mech">Polytechnic Year 1 (Mechanical)</option>
                <option value="Polytechnic Year 1 - Civil">Polytechnic Year 1 (Civil)</option>
                <option value="Polytechnic Year 2 - EEE">Polytechnic Year 2 (Electrical)</option>
                <option value="Polytechnic Year 2 - Comp">Polytechnic Year 2 (Computer)</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Origin Village *</label>
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
                  if (inst) setRequiredArrivalTime(inst.schoolStartTime);
                }}
              >
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} (Starts {inst.schoolStartTime})
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
              <label className="form-label">Required Arrival Time by</label>
              <input
                type="time"
                className="form-control"
                value={requiredArrivalTime}
                onChange={e => setRequiredArrivalTime(e.target.value)}
                required
              />
              <p className="form-hint">Vehicles arriving after this time cannot be assigned.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Priority / Academic Category *</label>
              <select
                className="form-select"
                value={priorityCategory}
                onChange={e => setPriorityCategory(e.target.value as PriorityCategory)}
              >
                <option value="CRITICAL_EXAM">Critical Exam / Board Practical (Highest Priority)</option>
                <option value="LAB_PRACTICAL">Mandatory Lab / Workshop Practical</option>
                <option value="REGULAR_ATTENDANCE">Regular Daily Classroom Attendance</option>
              </select>
              <p className="form-hint">Prioritised deterministically when seats are constrained.</p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Special Transport Notes (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Carrying science experiment equipment; needs early arrival"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="submit" className="btn btn-primary btn-lg">
              <Send size={16} />
              Submit Transport Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
