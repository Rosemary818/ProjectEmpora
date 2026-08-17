import React, { useState, useEffect } from 'react';
import './ManagerInterviews.css';
import ManagerFeedbackModal from './ManagerFeedbackModal';
import EmployeeInterviews from './EmployeeInterviews';

const ManagerInterviews = () => {
  const [activeTab, setActiveTab] = useState('conduct');
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [feedbackModalData, setFeedbackModalData] = useState(null);
  const [viewDocument, setViewDocument] = useState(null);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/interviews/manager', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setInterviews(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Scheduled': { bg: '#e0e7ff', color: '#4338ca' },
      'Completed': { bg: '#dcfce7', color: '#16a34a' },
      'Cancelled': { bg: '#fee2e2', color: '#dc2626' },
      'Rescheduled': { bg: '#fef08a', color: '#a16207' },
    };
    const style = statusStyles[status] || { bg: '#f3f4f6', color: '#6b7280' };
    return <span className="mgr-interview-badge" style={{ backgroundColor: style.bg, color: style.color }}>{status}</span>;
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your interviews...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>{error}</div>;

  return (
    <div className="mgr-interview-container">
      <div className="mgr-interview-header">
        <h2>My Interviews</h2>
        <p>Manage your assigned candidate interviews and submit feedback.</p>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
        <button 
          style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', color: activeTab === 'conduct' ? '#4338ca' : '#6b7280', borderBottom: activeTab === 'conduct' ? '2px solid #4338ca' : 'none' }}
          onClick={() => setActiveTab('conduct')}
        >
          Interviews to Conduct
        </button>
        <button 
          style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', color: activeTab === 'candidate' ? '#4338ca' : '#6b7280', borderBottom: activeTab === 'candidate' ? '2px solid #4338ca' : 'none' }}
          onClick={() => setActiveTab('candidate')}
        >
          My Candidate Interviews
        </button>
      </div>

      {activeTab === 'conduct' ? (
        <div className="mgr-interview-grid">
          {interviews.length > 0 ? interviews.map((i) => {
            const isInternal = i.category === 'Internal Mobility';
            const title = isInternal ? i.opportunityId?.title : i.jobId?.title;
            return (
            <div key={i._id} className="mgr-interview-card">
              <div className="mgr-interview-card-header">
                <div className="mgr-interview-candidate">
                  <div className="mgr-interview-avatar">
                    {i.candidateId?.firstName?.charAt(0)}{i.candidateId?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h4>{i.candidateId?.firstName} {i.candidateId?.lastName}</h4>
                    <span className="mgr-interview-job">{title || 'Unknown Position'}</span>
                  </div>
                </div>
                {getStatusBadge(i.status)}
              </div>
              
              <div className="mgr-interview-details">
                <p><strong>Category:</strong> {isInternal ? 'Internal Mobility' : 'Job Interview'}</p>
                <p><strong>Round:</strong> {i.round}</p>
                <p><strong>Date:</strong> {new Date(i.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {i.startTime} - {i.endTime}</p>
              <p><strong>Type:</strong> {i.interviewType}</p>
              {i.interviewType === 'Online' ? (
                <p><strong>Link:</strong> <a href={i.meetingLink} target="_blank" rel="noreferrer">Join Meeting</a></p>
              ) : (
                <p><strong>Venue:</strong> {i.venue}</p>
              )}
            </div>

            <div className="mgr-interview-docs">
              {i.applicationId?.resume && (
                <button className="mgr-btn-text" onClick={() => setViewDocument(`http://localhost:5000${i.applicationId.resume}`)}>View Resume</button>
              )}
              {i.applicationId?.relevantSkills && (
                <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                  <strong>Relevant Skills:</strong> {i.applicationId.relevantSkills}
                  <br/><br/>
                  <strong>Reason for Applying:</strong> {i.applicationId.reason}
                </div>
              )}
            </div>

            <div className="mgr-interview-actions">
              {(i.status === 'Scheduled' || i.status === 'Rescheduled') && !i.feedback && (
                <button className="mgr-btn-primary" onClick={() => setFeedbackModalData(i)}>Submit Feedback</button>
              )}
              {i.feedback && (
                <div className="mgr-feedback-submitted-badge">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Feedback Submitted
                </div>
              )}
            </div>
          </div>
        )}) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', gridColumn: '1 / -1' }}>
            No interviews assigned to you.
          </div>
        )}
      </div>
      ) : (
        <div style={{ marginTop: '-2rem' }}>
          <EmployeeInterviews />
        </div>
      )}

      {feedbackModalData && (
        <ManagerFeedbackModal 
          interview={feedbackModalData} 
          onClose={() => setFeedbackModalData(null)} 
          onSuccess={() => {
            setFeedbackModalData(null);
            fetchInterviews();
          }}
        />
      )}

      {/* Document Viewer Modal */}
      {viewDocument && (
        <div className="mgr-doc-modal-overlay">
          <div className="mgr-doc-modal">
            <div className="mgr-doc-header">
              <h3>Document Viewer</h3>
              <button onClick={() => setViewDocument(null)}>&times;</button>
            </div>
            <div className="mgr-doc-body">
              {viewDocument.toLowerCase().endsWith('.pdf') ? (
                <iframe src={viewDocument} width="100%" height="100%" title="Document"></iframe>
              ) : (
                <img src={viewDocument} alt="Document" style={{ maxWidth: '100%', height: 'auto' }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerInterviews;
