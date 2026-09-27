import React, { useState, useEffect } from 'react';
import './InterviewManagement.css';

const InterviewManagement = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchCandidate, setSearchCandidate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [cancelModalData, setCancelModalData] = useState(null);
  const [rescheduleModalData, setRescheduleModalData] = useState(null);
  const [feedbackModalData, setFeedbackModalData] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/interviews/hr', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setInterviews(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this interview as completed?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/interviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: 'Completed' })
      });
      const data = await res.json();
      if (data.success) {
        fetchInterviews();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Error marking as completed');
    }
  };

  const handleCancel = async () => {
    if (!cancelReason) return alert('Reason is required');
    try {
      const res = await fetch(`http://localhost:5000/api/interviews/${cancelModalData._id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ reason: cancelReason })
      });
      const data = await res.json();
      if (data.success) {
        setCancelModalData(null);
        setCancelReason('');
        fetchInterviews();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Error cancelling interview');
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        date: rescheduleModalData.date,
        startTime: rescheduleModalData.startTime,
        endTime: rescheduleModalData.endTime,
        meetingLink: rescheduleModalData.meetingLink,
        venue: rescheduleModalData.venue
      };
      const res = await fetch(`http://localhost:5000/api/interviews/${rescheduleModalData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setRescheduleModalData(null);
        fetchInterviews();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Error rescheduling interview');
    }
  };

  const handleHRDecision = async (decision) => {
    try {
      const res = await fetch(`http://localhost:5000/api/interviews/${feedbackModalData._id}/hr-decision`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ decision })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackModalData(null);
        fetchInterviews();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Error applying HR decision');
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
    return <span className="interview-mgt-badge" style={{ backgroundColor: style.bg, color: style.color }}>{status}</span>;
  };

  const filteredInterviews = interviews.filter(i => {
    const candidateName = `${i.candidateId?.firstName} ${i.candidateId?.lastName}`.toLowerCase();
    if (searchCandidate && !candidateName.includes(searchCandidate.toLowerCase())) return false;
    if (statusFilter && i.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="interview-mgt-container">
      <div className="interview-mgt-filters">
        <div className="interview-mgt-search">
          <input 
            type="text" 
            placeholder="Search candidate..." 
            value={searchCandidate}
            onChange={e => setSearchCandidate(e.target.value)}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="interview-mgt-select">
          <option value="">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Rescheduled">Rescheduled</option>
        </select>
      </div>

      <div className="interview-mgt-table-wrapper">
        <table className="interview-mgt-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Job & Round</th>
              <th>Date & Time</th>
              <th>Interviewer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading interviews...</td></tr>
            ) : filteredInterviews.length > 0 ? (
              filteredInterviews.map(i => (
                <tr key={i._id}>
                  <td>
                    <strong>{i.candidateId?.firstName} {i.candidateId?.lastName}</strong><br/>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{i.candidateId?.email}</span>
                  </td>
                  <td>
                    <strong>{i.jobId?.title}</strong><br/>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{i.round} ({i.interviewType})</span>
                  </td>
                  <td>
                    {new Date(i.date).toLocaleDateString()}<br/>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{i.startTime} - {i.endTime}</span>
                  </td>
                  <td>{i.interviewer}</td>
                  <td>{getStatusBadge(i.status)}</td>
                  <td>
                    <div className="action-menu">
                      {i.feedback && (
                        <button className="action-btn edit" style={{ backgroundColor: '#4f46e5', color: 'white' }} onClick={() => setFeedbackModalData(i)}>View Feedback</button>
                      )}
                      {(i.status === 'Scheduled' || i.status === 'Rescheduled') && (
                        <>
                          <button className="action-btn edit" onClick={() => setRescheduleModalData({...i, date: new Date(i.date).toISOString().split('T')[0]})}>Reschedule</button>
                          <button className="action-btn cancel" onClick={() => setCancelModalData(i)}>Cancel</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No interviews found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cancel Modal */}
      {cancelModalData && (
        <div className="interview-action-modal-overlay">
          <div className="interview-action-modal">
            <h3>Cancel Interview</h3>
            <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
              Are you sure you want to cancel the interview for <strong>{cancelModalData.candidateId?.firstName} {cancelModalData.candidateId?.lastName}</strong>?
            </p>
            <textarea 
              placeholder="Reason for cancellation (required)" 
              value={cancelReason} 
              onChange={(e) => setCancelReason(e.target.value)}
              rows="3"
            ></textarea>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setCancelModalData(null)}>Back</button>
              <button className="btn-danger" onClick={handleCancel}>Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalData && (
        <div className="interview-action-modal-overlay">
          <div className="interview-action-modal">
            <h3>Reschedule Interview</h3>
            <form onSubmit={handleReschedule}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Date</label>
                  <input type="date" value={rescheduleModalData.date} onChange={e => setRescheduleModalData({...rescheduleModalData, date: e.target.value})} required min={new Date().toISOString().split('T')[0]} />
                </div>
                <div></div>
                <div>
                  <label>Start Time</label>
                  <input type="time" value={rescheduleModalData.startTime} onChange={e => setRescheduleModalData({...rescheduleModalData, startTime: e.target.value})} required />
                </div>
                <div>
                  <label>End Time</label>
                  <input type="time" value={rescheduleModalData.endTime} onChange={e => setRescheduleModalData({...rescheduleModalData, endTime: e.target.value})} required />
                </div>
              </div>
              {rescheduleModalData.interviewType === 'Online' ? (
                <div style={{ marginTop: '1rem' }}>
                  <label>Meeting Link</label>
                  <input type="url" value={rescheduleModalData.meetingLink || ''} onChange={e => setRescheduleModalData({...rescheduleModalData, meetingLink: e.target.value})} required />
                </div>
              ) : (
                <div style={{ marginTop: '1rem' }}>
                  <label>Venue</label>
                  <input type="text" value={rescheduleModalData.venue || ''} onChange={e => setRescheduleModalData({...rescheduleModalData, venue: e.target.value})} required />
                </div>
              )}
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setRescheduleModalData(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Reschedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModalData && (
        <div className="interview-action-modal-overlay">
          <div className="interview-action-modal" style={{ maxWidth: '600px' }}>
            <h3>Manager Feedback</h3>
            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px', marginBottom: '1rem' }}>
              <p><strong>Candidate:</strong> {feedbackModalData.candidateId?.firstName} {feedbackModalData.candidateId?.lastName}</p>
              <p><strong>Interviewer:</strong> {feedbackModalData.interviewer}</p>
              <hr style={{ margin: '1rem 0', borderColor: '#e5e7eb' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280' }}>Technical Rating</span>
                  <strong>{feedbackModalData.feedback.technicalRating} / 5</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280' }}>Communication</span>
                  <strong>{feedbackModalData.feedback.communicationRating} / 5</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280' }}>Problem Solving</span>
                  <strong>{feedbackModalData.feedback.problemSolvingRating} / 5</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280' }}>Recommendation</span>
                  <strong style={{ color: feedbackModalData.feedback.recommendation.includes('Hire') ? '#16a34a' : (feedbackModalData.feedback.recommendation === 'Reject' ? '#dc2626' : '#d97706') }}>
                    {feedbackModalData.feedback.recommendation}
                  </strong>
                </div>
              </div>
              
              <div>
                <span style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280' }}>Comments</span>
                <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{feedbackModalData.feedback.comments || 'No comments provided.'}</p>
              </div>
            </div>

            <div className="modal-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => setFeedbackModalData(null)}>Close</button>
              <button style={{ padding: '0.5rem 1rem', background: '#388087', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }} onClick={() => handleHRDecision('Proceed to Next Round')}>Proceed to Next Round</button>
              <button style={{ padding: '0.5rem 1rem', background: '#16a34a', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }} onClick={() => handleHRDecision('Select Candidate')}>Select Candidate</button>
              <button style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }} onClick={() => handleHRDecision('Reject Candidate')}>Reject Candidate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewManagement;
