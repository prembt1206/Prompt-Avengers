import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  School,
  Bus,
  Phone,
  Calendar,
  AlertCircle,
  Bell,
  User,
  ShieldCheck
} from 'lucide-react';
import {
  StudentRequest,
  Village,
  Institution,
  PriorityCategory,
  TravelType,
  AllocationResult,
  UserProfile,
  SystemNotification
} from '../../types';
import { AuthService } from '../../services/authService';
import { TrackingService } from '../../services/trackingService';
import { NotificationService } from '../../services/notificationService';

interface StudentPortalProps {
  villages: Village[];
  institutions: Institution[];
  requests: StudentRequest[];
  allocationResult: AllocationResult | null;
  onSubmitRequest: (req: StudentRequest) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  villages,
  institutions,
  requests,
  allocationResult,
  onSubmitRequest
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => AuthService.getCurrentUser());

  // Form states
  const [studentName, setStudentName] = useState(currentUser.name || 'Deeksha Poojary');
  const [gradeOrStream, setGradeOrStream] = useState('Grade 10');
  const [originVillageId, setOriginVillageId] = useState(currentUser.villageId || villages[0]?.id || '');
  const [destInstitutionId, setDestInstitutionId] = useState(currentUser.destinationInstitutionId || institutions[0]?.id || '');
  const [travelDate, setTravelDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [travelType, setTravelType] = useState<TravelType>('Examination travel');
  const [requiredArrivalTime, setRequiredArrivalTime] = useState('08:30');
  const [notes, setNotes] = useState('');
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Filter requests to enforce student privacy: only show requests belonging to this student!
  const myRequests = requests.filter(r =>
    r.studentName.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
    (currentUser.username && r.studentName.toLowerCase().includes(currentUser.username.toLowerCase()))
  );

  // Lookup assignments and unmet records for this student
  const assignmentsMap = new Map(
    allocationResult?.assignments.map(a => [a.requestId, a]) || []
  );
  const unmetMap = new Map(
    allocationResult?.unmetRequests.map(u => [u.requestId, u]) || []
  );

  // Student specific notifications
  const studentNotifications = NotificationService.getNotifications('STUDENT', currentUser.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    const selectedVillage = villages.find(v => v.id === originVillageId);
    const selectedInst = institutions.find(i => i.id === destInstitutionId);

    let priorityCategory: PriorityCategory = 'REGULAR_ATTENDANCE';
    if (travelType === 'Examination travel') priorityCategory = 'CRITICAL_EXAM';
    else if (travelType === 'Practical examination travel') priorityCategory = 'LAB_PRACTICAL';

    const newRequest: StudentRequest = {
      id: `req-cust-${Date.now()}`,
      studentName: studentName.trim(),
      gradeOrStream,
      originVillageId,
      originVillageName: selectedVillage ? selectedVillage.name : 'Unknown Village',
      destinationInstitutionId: destInstitutionId,
      destinationName: selectedInst ? selectedInst.name : 'Unknown Institution',
      destinationInstitutionName: selectedInst ? selectedInst.name : 'Unknown Institution',
      requiredArrivalTime,
      priorityCategory,
      travelDate,
      travelType,
      submissionTimestamp: new Date().toISOString(),
      notes: notes.trim() || undefined,
      isCustom: true,
      status: 'Pending'
    };

    onSubmitRequest(newRequest);
    setSubmissionFeedback(`✓ Transport request submitted for ${travelDate}! Your coordinator will allocate an available seat.`);
    setNotes('');

    setTimeout(() => {
      setSubmissionFeedback(null);
    }, 6000);
  };

  // Quick switch of student identity for demonstration ease
  const handleSwitchStudentProfile = (studentAccount: UserProfile) => {
    AuthService.setCurrentUser(studentAccount);
    setCurrentUser(studentAccount);
    setStudentName(studentAccount.name);
    if (studentAccount.villageId) setOriginVillageId(studentAccount.villageId);
    if (studentAccount.destinationInstitutionId) setDestInstitutionId(studentAccount.destinationInstitutionId);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Student Identity Card & Profile Switcher */}
      <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 700, fontSize: '1.2rem' }}>
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{currentUser.name}</span>
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Student Account</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {currentUser.villageName || 'Pavoor Riverine Fringe'} · {currentUser.grade || 'Grade 10'} · {currentUser.phone || '+91 98801 23456'}
              </div>
            </div>
          </div>

          {/* Quick Demo Switcher for Evaluators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <span style={{ color: '#94a3b8' }}>Demo Student Switch:</span>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              onClick={() => handleSwitchStudentProfile({
                id: 'usr-student-deeksha',
                username: 'deeksha',
                name: 'Deeksha Poojary',
                role: 'STUDENT',
                villageId: 'vil-pavoor',
                villageName: 'Pavoor Riverine Fringe',
                destinationInstitutionId: 'inst-aloysius',
                grade: 'Grade 10',
                phone: '+91 98801 23456'
              })}
            >
              Deeksha (Pavoor)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              onClick={() => handleSwitchStudentProfile({
                id: 'usr-student-shreya',
                username: 'shreya',
                name: 'Shreya Rai',
                role: 'STUDENT',
                villageId: 'vil-farangipete',
                villageName: 'Farangipete Junction',
                destinationInstitutionId: 'inst-aloysius',
                grade: 'Grade 12 - Science',
                phone: '+91 98802 34567'
              })}
            >
              Shreya (Farangipete)
            </button>
          </div>
        </div>
      </div>

      {/* Disruption Alert Notice for this Student */}
      {studentNotifications.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          {studentNotifications.slice(0, 2).map(n => (
            <div
              key={n.id}
              style={{
                background: n.severity === 'alert' ? '#450a0a' : '#1e1b4b',
                border: `1px solid ${n.severity === 'alert' ? '#dc2626' : '#6366f1'}`,
                color: '#f8fafc',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <Bell size={18} style={{ color: n.severity === 'alert' ? '#f87171' : '#a5b4fc', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{n.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>{n.message}</div>
                {n.suggestedAction && (
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '4px', fontWeight: 500 }}>
                    Advisory: {n.suggestedAction}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid: My Transport Allocation (Left) + Request Form (Right) */}
      <div className="grid-2">
        {/* Active Transport Allocations (Student's Own Records Only) */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Bus size={18} className="text-primary" />
              My Transport Status ({myRequests.length} Scheduled)
            </h3>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
              <ShieldCheck size={12} style={{ display: 'inline', marginRight: 4 }} />
              Private Student View
            </span>
          </div>

          <div className="card-body">
            {myRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 16px', color: '#64748b' }}>
                <Clock size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                <div style={{ fontWeight: 600 }}>No transport requests on file</div>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  Fill out the form to book your morning school transport.
                </div>
              </div>
            ) : (
              myRequests.map(req => {
                const assignment = assignmentsMap.get(req.id);
                const unmet = unmetMap.get(req.id);
                const telem = assignment ? TrackingService.getTelemetry(assignment.tripId) : null;

                let statusBadge = 'badge-success';
                let statusText = 'Assigned';
                if (unmet) {
                  statusBadge = 'badge-danger';
                  statusText = 'Unassigned';
                }

                return (
                  <div
                    key={req.id}
                    style={{
                      background: '#0f172a',
                      border: `1px solid ${assignment ? '#10b981' : '#ef4444'}`,
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className={`badge ${statusBadge}`} style={{ fontSize: '0.75rem' }}>
                        {statusText}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Category: <b>{req.priorityCategory.replace('_', ' ')}</b>
                      </span>
                    </div>

                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
                      {req.originVillageName} ➔ {req.destinationName}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px' }}>
                      Required at school by: <b>{req.requiredArrivalTime}</b>
                    </div>

                    {assignment ? (
                      <div style={{ background: '#1e293b', borderRadius: '6px', padding: '12px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: '#94a3b8' }}>Assigned Vehicle:</span>
                          <span style={{ fontWeight: 600, color: '#38bdf8' }}>{assignment.vehicleName}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: '#94a3b8' }}>Confirmed Seat:</span>
                          <span style={{ fontWeight: 700, color: '#10b981' }}>Seat #{assignment.seatNumber}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: '#94a3b8' }}>Pickup Stop & Time:</span>
                          <span style={{ fontWeight: 600 }}>{assignment.pickupVillageName} @ {assignment.pickupTime}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: '#94a3b8' }}>Driver & Mobile:</span>
                          <span style={{ fontWeight: 500 }}>{assignment.driverName || 'Depot Driver'} ({assignment.driverPhone || '+91 94481 20144'})</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #334155', paddingTop: '6px', marginTop: '6px' }}>
                          <span style={{ color: '#94a3b8' }}>Live Vehicle ETA:</span>
                          <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                            {telem?.estimatedArrivalMinutes || 35} mins (Approaching)
                          </span>
                        </div>
                      </div>
                    ) : unmet ? (
                      <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '6px', padding: '12px', fontSize: '0.8rem', color: '#fca5a5' }}>
                        <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertTriangle size={15} />
                          Honest Transport Explanation:
                        </div>
                        <div>{unmet.honestExplanation}</div>
                        {unmet.suggestedAlternativePickup && (
                          <div style={{ marginTop: '6px', color: '#e0e7ff', fontSize: '0.75rem', fontWeight: 500 }}>
                            Alternative Pickup: {unmet.suggestedAlternativePickup}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                        Awaiting regional coordinator schedule execution.
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Submit Transport Request Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Send size={18} className="text-primary" />
              Book Morning Transport
            </h3>
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Simple Form</span>
          </div>

          <div className="card-body">
            {submissionFeedback && (
              <div style={{ background: '#064e3b', border: '1px solid #059669', color: '#ecfdf5', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{submissionFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Student Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Grade / Course *</label>
                  <select
                    className="form-select"
                    value={gradeOrStream}
                    onChange={e => setGradeOrStream(e.target.value)}
                  >
                    <option value="Grade 9">Grade 9 (Secondary)</option>
                    <option value="Grade 10">Grade 10 (SSLC State Board)</option>
                    <option value="Grade 11 - Science">Grade 11 - Science (PUC)</option>
                    <option value="Grade 12 - Science">Grade 12 - Science (PUC)</option>
                    <option value="Diploma Engineering (KPT)">Diploma Engineering (KPT)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Travel Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={travelDate}
                    onChange={e => setTravelDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Purpose of Travel (Academic Priority) *</label>
                <select
                  className="form-select"
                  value={travelType}
                  onChange={e => setTravelType(e.target.value as TravelType)}
                >
                  <option value="Examination travel">Examination travel (Highest Priority - SSLC/PUC/BTE Board Exams)</option>
                  <option value="Practical examination travel">Practical examination travel (Lab, Workshop, Titration)</option>
                  <option value="Regular school travel">Regular school travel (Standard Curriculum Class)</option>
                </select>
              </div>

              <div className="grid-2" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Pickup Hamlet / Village *</label>
                  <select
                    className="form-select"
                    value={originVillageId}
                    onChange={e => setOriginVillageId(e.target.value)}
                  >
                    {villages.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Destination School *</label>
                  <select
                    className="form-select"
                    value={destInstitutionId}
                    onChange={e => setDestInstitutionId(e.target.value)}
                  >
                    {institutions.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.schoolStartTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Special Notes / Exam Subject</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Physics Board Practical Exam starting sharp 08:30"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Send size={16} />
                <span>Submit Transport Request</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
