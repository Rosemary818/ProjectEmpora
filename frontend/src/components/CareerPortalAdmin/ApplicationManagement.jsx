import React, { useState, useEffect } from 'react';
import './ApplicationManagement.css';
import ScheduleInterviewModal from './ScheduleInterviewModal';

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchName, setSearchName] = useState('');
  const [searchJob, setSearchJob] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [convertData, setConvertData] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/jobs/applications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };



  // Derived filter options
  const departments = [...new Set(applications.map(a => a.jobId?.departmentId?.departmentName).filter(Boolean))];

  const filteredApps = applications.filter(app => {
    const candidateName = `${app.candidateId?.firstName} ${app.candidateId?.lastName}`.toLowerCase();
    const jobTitle = (app.jobId?.title || '').toLowerCase();
    
    if (searchName && !candidateName.includes(searchName.toLowerCase())) return false;
    if (searchJob && !jobTitle.includes(searchJob.toLowerCase())) return false;
    if (departmentFilter && app.jobId?.departmentId?.departmentName !== departmentFilter) return false;
    if (statusFilter && app.status !== statusFilter) return false;
    
    return true;
  });

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Applied': { bg: '#e0f2fe', color: '#0284c7' },
      'Under Review': { bg: '#e0e7ff', color: '#4338ca' },
      'Shortlisted': { bg: '#fef3c7', color: '#d97706' },
      'Interview Scheduled': { bg: '#fef08a', color: '#a16207' },
      'Interview Completed': { bg: '#cffafe', color: '#0891b2' },
      'Selected': { bg: '#dcfce7', color: '#16a34a' },
      'Rejected': { bg: '#fee2e2', color: '#dc2626' },
      'Offer Sent': { bg: '#fae8ff', color: '#c026d3' },
      'Offer Accepted': { bg: '#fce7f3', color: '#db2777' },
      'Converted to Employee': { bg: '#d1fae5', color: '#059669' },
      'Withdrawn': { bg: '#f3f4f6', color: '#6b7280' }
    };
    const style = statusStyles[status] || { bg: '#f3f4f6', color: '#6b7280' };
    return (
      <span className="app-mgt-badge" style={{ backgroundColor: style.bg, color: style.color }}>
        {status}
      </span>
    );
  };

  const handleGenerateOffer = async (appId) => {
    alert('Offer Letter Generated and Saved (Mock)');
    handleUpdateStatus(appId, 'Offer Sent', 'https://example.com/mock-offer-letter.pdf');
  };

  const handleUpdateStatus = async (appId, newStatus, offerLetterUrl = null) => {
    try {
      const payload = { status: newStatus };
      if (offerLetterUrl) payload.offerLetterUrl = offerLetterUrl;

      const res = await fetch(`http://localhost:5000/api/jobs/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        if (newStatus === 'Converted to Employee') {
          // Special handling for Employee Conversion success
          setConvertData({ 
            employee: { email: data.data.candidateId?.email, ...data.data.candidateId }, 
            emailSent: data.emailSent, 
            appId 
          });
        } else {
          alert(`Application status updated to ${newStatus}`);
        }
        
        fetchApplications();
        if (selectedApp && selectedApp._id === appId) {
          setSelectedApp(prev => ({ 
            ...prev, 
            status: newStatus,
            offerLetterUrl: offerLetterUrl || prev.offerLetterUrl,
            statusHistory: [...(prev.statusHistory || []), { status: newStatus, date: new Date() }]
          }));
        }
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Network error while updating status');
    }
  };

  const resendWelcomeEmail = async (appId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/applications/${appId}/resend-welcome`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Failed to resend welcome email');
      
      setConvertData(prev => prev ? { ...prev, emailSent: true } : null);
      
      const email = data.email || 'the candidate';
      alert(`Welcome email sent successfully to ${email}.`);
    } catch (error) {
      alert(error.message || 'Unable to send welcome email. Please try again.');
    }
  };

  return (
    <div className="app-mgt-container">
      <div className="app-mgt-filters">
        <div className="app-mgt-search">
          <input 
            type="text" 
            placeholder="Search candidate name..." 
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
        </div>
        <div className="app-mgt-search">
          <input 
            type="text" 
            placeholder="Search job title..." 
            value={searchJob}
            onChange={e => setSearchJob(e.target.value)}
          />
        </div>
        <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="app-mgt-select">
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="app-mgt-select">
          <option value="">All Statuses</option>
          <option value="Applied">Applied</option>
          <option value="Under Review">Under Review</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Interview Scheduled">Interview Scheduled</option>
          <option value="Selected">Selected</option>
          <option value="Rejected">Rejected</option>
          <option value="Withdrawn">Withdrawn</option>
        </select>
      </div>

      <div className="app-mgt-table-wrapper">
        <table className="app-mgt-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Applied Job</th>
              <th>Department</th>
              <th>Applied Date</th>
              <th>Current Status</th>
              <th>Resume</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading applications...</td></tr>
            ) : filteredApps.length > 0 ? (
              filteredApps.map(app => (
                <tr key={app._id}>
                  <td>
                    <div className="candidate-cell">
                      <div className="candidate-avatar">
                        {app.candidateId?.profileImage ? (
                          <img src={app.candidateId.profileImage} alt="" />
                        ) : (
                          <span>{(app.candidateId?.firstName || '?')[0]}{(app.candidateId?.lastName || '?')[0]}</span>
                        )}
                      </div>
                      <div className="candidate-info">
                        <strong>{app.candidateId?.firstName} {app.candidateId?.lastName}</strong>
                        <span>{app.candidateId?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{app.jobId?.title || 'Unknown'}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{app.jobId?.employmentType}</div>
                  </td>
                  <td>{app.jobId?.departmentId?.departmentName || 'General'}</td>
                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td>
                    <a href={`http://localhost:5000${app.resume}`} target="_blank" rel="noreferrer" className="resume-btn">
                      View PDF
                    </a>
                  </td>
                  <td>
                    <button className="view-app-btn" onClick={() => setSelectedApp(app)}>
                      View Application
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No applications found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Application Modal */}
      {selectedApp && (
        <div className="app-modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="app-modal" onClick={e => e.stopPropagation()}>
            <div className="app-modal-header">
              <h2>Application Details</h2>
              <button className="btn-close" onClick={() => setSelectedApp(null)}>✕</button>
            </div>
            <div className="app-modal-content">
              
              <div className="app-modal-grid">
                {/* Left Side: Info */}
                <div className="app-modal-col">
                  
                  <div className="info-card candidate-profile-card">
                    <div className="candidate-profile-header">
                      <div className="candidate-avatar-large">
                        {selectedApp.candidateId?.profileImage ? (
                          <img src={selectedApp.candidateId.profileImage} alt="Candidate" />
                        ) : (
                          <span>{(selectedApp.candidateId?.firstName || '?')[0]}{(selectedApp.candidateId?.lastName || '?')[0]}</span>
                        )}
                      </div>
                      <div>
                        <h3 style={{ margin: 0 }}>{selectedApp.candidateId?.firstName} {selectedApp.candidateId?.lastName}</h3>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>{selectedApp.candidateId?.email}</p>
                      </div>
                    </div>
                    <div className="candidate-details-grid">
                      <p><strong>Phone:</strong> {selectedApp.candidateId?.phoneNumber || 'Not provided'}</p>
                      <p><strong>Location:</strong> {selectedApp.candidateId?.location || 'Not provided'}</p>
                      <p><strong>Job:</strong> {selectedApp.jobId?.title}</p>
                      <p><strong>Department:</strong> {selectedApp.jobId?.departmentId?.departmentName}</p>
                    </div>
                  </div>

                  <div className="info-card">
                    <h3>Resume Preview</h3>
                    {selectedApp.resume ? (
                      <iframe 
                        src={`http://localhost:5000${selectedApp.resume}`} 
                        className="resume-preview-iframe"
                        title="Resume Preview"
                      ></iframe>
                    ) : (
                      <p>No resume available.</p>
                    )}
                    <div style={{ marginTop: '1rem' }}>
                      <a href={`http://localhost:5000${selectedApp.resume}`} download className="action-btn-secondary">Download Resume</a>
                    </div>
                  </div>

                  {selectedApp.coverLetter && (
                    <div className="info-card">
                      <h3>Cover Letter</h3>
                      <div className="cover-letter-preview">{selectedApp.coverLetter}</div>
                    </div>
                  )}

                  <div className="info-card">
                    <h3>Candidate Qualifications</h3>
                    <div className="qualifications-grid">
                      <div className="qualification-section">
                        <h4>Skills</h4>
                        {selectedApp.skills && selectedApp.skills.length > 0 ? (
                          <ul className="qual-list">
                            {selectedApp.skills.map((skill, idx) => <li key={idx}>{skill}</li>)}
                          </ul>
                        ) : (
                          <p className="text-muted">Not provided</p>
                        )}
                      </div>
                      
                      <div className="qualification-section">
                        <h4>Education</h4>
                        {selectedApp.education && selectedApp.education.length > 0 ? (
                          <ul className="qual-list">
                            {selectedApp.education.map((edu, idx) => <li key={idx}>{edu}</li>)}
                          </ul>
                        ) : (
                          <p className="text-muted">Not provided</p>
                        )}
                      </div>

                      <div className="qualification-section">
                        <h4>Projects</h4>
                        {selectedApp.projects && selectedApp.projects.length > 0 ? (
                          <ul className="qual-list">
                            {selectedApp.projects.map((proj, idx) => <li key={idx}>{proj}</li>)}
                          </ul>
                        ) : (
                          <p className="text-muted">Not provided</p>
                        )}
                      </div>

                      <div className="qualification-section">
                        <h4>Certifications</h4>
                        {selectedApp.certifications && selectedApp.certifications.length > 0 ? (
                          <ul className="qual-list">
                            {selectedApp.certifications.map((cert, idx) => <li key={idx}>{cert}</li>)}
                          </ul>
                        ) : (
                          <p className="text-muted">Not provided</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <h3>Links</h3>
                    <div className="links-list">
                      {selectedApp.portfolio ? <p><strong>Portfolio:</strong> <a href={selectedApp.portfolio} target="_blank" rel="noreferrer">{selectedApp.portfolio}</a></p> : <p className="text-muted">Portfolio not provided</p>}
                      {selectedApp.github ? <p><strong>GitHub:</strong> <a href={selectedApp.github} target="_blank" rel="noreferrer">{selectedApp.github}</a></p> : <p className="text-muted">GitHub not provided</p>}
                      {selectedApp.linkedin ? <p><strong>LinkedIn:</strong> <a href={selectedApp.linkedin} target="_blank" rel="noreferrer">{selectedApp.linkedin}</a></p> : <p className="text-muted">LinkedIn not provided</p>}
                    </div>
                  </div>

                </div>

                {/* Right Side: Timeline & Actions */}
                <div className="app-modal-col">
                  <div className="info-card">
                    <h3>Update Status</h3>
                    {selectedApp.status === 'Withdrawn' ? (
                      <p style={{ color: '#dc2626' }}>This application was withdrawn by the candidate.</p>
                    ) : (
                        <div className="status-action-grid">
                          {(selectedApp.status === 'Applied' || selectedApp.status === 'Under Review') && (
                            <>
                              <button className="status-btn shortlist" onClick={() => handleUpdateStatus(selectedApp._id, 'Shortlisted')}>Shortlist</button>
                              <button className="status-btn reject" onClick={() => handleUpdateStatus(selectedApp._id, 'Rejected')}>Reject</button>
                            </>
                          )}
                          {selectedApp.status === 'Shortlisted' && (
                            <>
                              <button className="status-btn schedule" onClick={() => setShowScheduleModal(true)}>Schedule Interview</button>
                              <button className="status-btn reject" onClick={() => handleUpdateStatus(selectedApp._id, 'Rejected')}>Reject</button>
                            </>
                          )}
                          {selectedApp.status === 'Interview Scheduled' && (
                            <>
                              <button className="status-btn schedule" onClick={() => setShowScheduleModal(true)}>Reschedule Interview</button>
                              {/* Cancel would typically call a cancel API, but we'll set it to Withdrawn/Rejected for simplicity if no cancel API is here */}
                            </>
                          )}
                          {selectedApp.status === 'Interview Completed' && (
                            <>
                              <button className="status-btn hire" onClick={() => handleUpdateStatus(selectedApp._id, 'Selected')}>Select Candidate</button>
                              <button className="status-btn shortlist" onClick={() => handleUpdateStatus(selectedApp._id, 'Shortlisted')}>Move to Next Round</button>
                              <button className="status-btn reject" onClick={() => handleUpdateStatus(selectedApp._id, 'Rejected')}>Reject Candidate</button>
                            </>
                          )}
                          {selectedApp.status === 'Selected' && (
                            <>
                              <button className="status-btn schedule" style={{ backgroundColor: '#c026d3' }} onClick={() => handleGenerateOffer(selectedApp._id)}>Generate & Send Offer</button>
                            </>
                          )}
                          {selectedApp.status === 'Offer Sent' && (
                            <>
                              <button className="status-btn hire" style={{ backgroundColor: '#db2777' }} onClick={() => handleUpdateStatus(selectedApp._id, 'Offer Accepted')}>Mark Offer Accepted</button>
                            </>
                          )}
                          {selectedApp.status === 'Offer Accepted' && (
                            <>
                              <button className="status-btn hire" style={{ backgroundColor: '#059669' }} onClick={() => handleUpdateStatus(selectedApp._id, 'Converted to Employee')}>Convert to Employee</button>
                            </>
                          )}
                          {selectedApp.status === 'Converted to Employee' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                              <p style={{ color: '#059669', fontWeight: 'bold', margin: 0 }}>This candidate has been converted to an employee.</p>
                              <button className="secondary-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => resendWelcomeEmail(selectedApp._id)}>
                                Resend Welcome Email
                              </button>
                            </div>
                          )}
                        </div>
                    )}
                  </div>

                  <div className="info-card">
                    <h3>Application Timeline</h3>
                    <div className="status-timeline">
                      {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 ? (
                        selectedApp.statusHistory.map((history, i) => (
                          <div key={i} className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <strong>{history.status}</strong>
                              <span>{new Date(history.date).toLocaleString()}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="timeline-item">
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <strong>{selectedApp.status}</strong>
                            <span>{new Date(selectedApp.appliedAt).toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
      {showScheduleModal && (
        <ScheduleInterviewModal 
          application={selectedApp} 
          onClose={() => setShowScheduleModal(false)}
          onSuccess={(interview) => {
            setShowScheduleModal(false);
            alert('Interview scheduled successfully');
            fetchApplications();
            setSelectedApp(prev => ({ 
              ...prev, 
              status: 'Interview Scheduled',
              statusHistory: [...(prev.statusHistory || []), { status: 'Interview Scheduled', date: new Date() }]
            }));
          }}
        />
      )}
    </div>
  );
};

export default ApplicationManagement;
