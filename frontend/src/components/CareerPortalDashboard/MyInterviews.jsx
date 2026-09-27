import React, { useState, useEffect } from 'react';
import './MyInterviews.css';

const MyInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/interviews/candidate', {
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

  const getDynamicStatus = (interview) => {
    if (interview.status === 'Cancelled') return 'Cancelled';
    const interviewDate = new Date(interview.date);
    const [startHour, startMin] = interview.startTime.split(':').map(Number);
    const [endHour, endMin] = interview.endTime.split(':').map(Number);
    
    const startDateTime = new Date(interviewDate);
    startDateTime.setHours(startHour, startMin, 0, 0);
    
    const endDateTime = new Date(interviewDate);
    endDateTime.setHours(endHour, endMin, 0, 0);
    
    const now = new Date();
    
    if (now < startDateTime) return 'Upcoming';
    if (now >= startDateTime && now <= endDateTime) return 'Live';
    if (now > endDateTime) return 'Interview Ended';
    
    return interview.status;
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading your interviews...</div>;
  }

  return (
    <div className="my-interviews-container">
      <div className="my-interviews-header">
        <h2>My Interviews</h2>
        <p>Keep track of your upcoming and past interview schedules.</p>
      </div>

      <div className="my-interviews-list">
        {interviews.length > 0 ? (
          interviews.map(interview => {
            const dynamicStatus = getDynamicStatus(interview);
            return (
            <div key={interview._id} className="interview-card">
              
              <div className="interview-card-header">
                <div>
                  <h3 className="interview-job-title">{interview.jobId?.title}</h3>
                  <div className="interview-round">{interview.round} • {interview.interviewType}</div>
                </div>
                <span className={`interview-status status-${dynamicStatus.toLowerCase().replace(' ', '-')}`}>
                  {dynamicStatus}
                </span>
              </div>

              <div className="interview-card-body">
                <div className="interview-detail">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{new Date(interview.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="interview-detail">
                  <span className="detail-label">Time</span>
                  <span className="detail-value">{interview.startTime} - {interview.endTime}</span>
                </div>
                <div className="interview-detail">
                  <span className="detail-label">Interviewer</span>
                  <span className="detail-value">{interview.interviewer ? interview.interviewer.replace('undefined', interview.interviewType) : ''}</span>
                </div>
                {interview.interviewType === 'Offline' && interview.venue && (
                  <div className="interview-detail">
                    <span className="detail-label">Venue</span>
                    <span className="detail-value">{interview.venue}</span>
                  </div>
                )}
              </div>

              {interview.notes && (
                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <span className="detail-label">Notes from HR</span>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#4b5563' }}>{interview.notes}</p>
                </div>
              )}

              {interview.status === 'Cancelled' && interview.cancellationReason && (
                <div className="cancellation-reason">
                  <h4>Cancellation Reason</h4>
                  <p>{interview.cancellationReason}</p>
                </div>
              )}

              {dynamicStatus === 'Upcoming' && interview.interviewType === 'Online' && (
                <div className="interview-card-footer">
                  <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Join the meeting a few minutes before the start time.</span>
                  <button className="btn-join-meeting" disabled style={{ opacity: 0.6, cursor: 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: '8px', border: 'none' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                      <polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                    Join Meeting
                  </button>
                </div>
              )}

              {dynamicStatus === 'Live' && interview.interviewType === 'Online' && (
                <div className="interview-card-footer">
                  <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 500 }}>The interview is happening now!</span>
                  <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="btn-join-meeting" style={{ background: '#10b981', borderColor: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                      <polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                    Join Meeting
                  </a>
                </div>
              )}

              {dynamicStatus === 'Interview Ended' && interview.interviewType === 'Online' && (
                <div className="interview-card-footer">
                  <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 500 }}>Interview Time Expired</span>
                </div>
              )}

            </div>
          );
        })
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '12px' }}>
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1" fill="none" style={{ color: '#9ca3af', marginBottom: '1rem' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>No Interviews Scheduled</h3>
            <p style={{ margin: 0, color: '#6b7280' }}>You don't have any interviews scheduled at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInterviews;
