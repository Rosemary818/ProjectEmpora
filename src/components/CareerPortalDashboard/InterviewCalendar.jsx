import React, { useState, useEffect } from 'react';
import './InterviewCalendar.css';

const getDynamicStatus = (interview) => {
  if (interview.status === 'Cancelled') return 'Cancelled';
  if (interview.status === 'Completed') return 'Completed';
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

const InterviewCalendar = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedInterview, setSelectedInterview] = useState(null);

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
        const processedData = data.data.map(intv => ({
          ...intv,
          dynamicStatus: getDynamicStatus(intv)
        }));
        setInterviews(processedData);
      }
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Sort interviews by date ascending
  const sortedInterviews = [...interviews].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const upcomingInterviews = sortedInterviews.filter(i => {
    const intDate = new Date(i.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return intDate >= today && (i.dynamicStatus === 'Upcoming' || i.dynamicStatus === 'Live');
  });

  const getInterviewsForDate = (day) => {
    const targetDateStr = new Date(year, month, day).toDateString();
    return interviews.filter(i => new Date(i.date).toDateString() === targetDateStr);
  };

  const isPast = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const renderCalendarCells = () => {
    const cells = [];
    const today = new Date();

    // Empty cells before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }

    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayInterviews = getInterviewsForDate(d);
      const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
      const isDayPast = new Date(year, month, d) < new Date(today.setHours(0, 0, 0, 0));

      cells.push(
        <div key={d} className={`calendar-cell ${isToday ? 'today' : ''} ${isDayPast ? 'past-day' : ''}`}>
          <div className="calendar-day-number">{d}</div>
          <div className="calendar-events">
            {dayInterviews.map((intv, idx) => {
              const isEventPast = isPast(intv.date) || intv.dynamicStatus === 'Completed' || intv.dynamicStatus === 'Cancelled' || intv.dynamicStatus === 'Interview Ended';
              return (
                <div 
                  key={idx} 
                  className={`calendar-event ${isEventPast ? 'past-event' : ''} status-${intv.dynamicStatus.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setSelectedInterview(intv)}
                >
                  <span className="event-time">{intv.startTime}</span>
                  <span className="event-title">{intv.jobId?.title || intv.round}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return cells;
  };

  if (loading) {
    return <div className="interview-calendar-loading">Loading Calendar...</div>;
  }

  return (
    <div className="interview-calendar-container">
      <div className="career-welcome-banner" style={{ marginBottom: '2rem' }}>
        <h1>Interview Calendar</h1>
        <p>Keep track of all your upcoming and past interview schedules.</p>
      </div>

      <div className="calendar-layout-grid">
        {/* Main Calendar Area */}
        <div className="calendar-main-area">
          <div className="career-card">
            <div className="calendar-header">
              <div className="calendar-nav">
                <button className="career-btn-outline nav-btn" onClick={prevMonth}>&larr;</button>
                <h2>{monthNames[month]} {year}</h2>
                <button className="career-btn-outline nav-btn" onClick={nextMonth}>&rarr;</button>
              </div>
              <button className="career-btn-primary" onClick={goToToday}>Today</button>
            </div>
            
            <div className="calendar-grid">
              <div className="calendar-day-name">Sun</div>
              <div className="calendar-day-name">Mon</div>
              <div className="calendar-day-name">Tue</div>
              <div className="calendar-day-name">Wed</div>
              <div className="calendar-day-name">Thu</div>
              <div className="calendar-day-name">Fri</div>
              <div className="calendar-day-name">Sat</div>
              {renderCalendarCells()}
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="calendar-sidebar-area">
          <div className="career-card upcoming-interviews-card">
            <div className="career-card-header">
              <h3>Upcoming Interviews</h3>
            </div>
            <div className="career-card-body">
              {upcomingInterviews.length > 0 ? (
                <ul className="upcoming-list">
                  {upcomingInterviews.map((intv) => (
                    <li key={intv._id} className="upcoming-list-item" onClick={() => setSelectedInterview(intv)}>
                      <div className="upcoming-date">
                        <span className="up-day">{new Date(intv.date).getDate()}</span>
                        <span className="up-month">{monthNames[new Date(intv.date).getMonth()].substring(0, 3)}</span>
                      </div>
                      <div className="upcoming-details">
                        <h4>{intv.jobId?.title || 'Interview'}</h4>
                        <p>{intv.startTime} • {intv.round}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-upcoming">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <p>No interviews scheduled.</p>
                  <span>Your scheduled interviews will appear here.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedInterview && (
        <div className="calendar-modal-overlay" onClick={() => setSelectedInterview(null)}>
          <div className="calendar-modal" onClick={e => e.stopPropagation()}>
            <div className="calendar-modal-header">
              <h3>Interview Details</h3>
              <button className="btn-close" onClick={() => setSelectedInterview(null)}>&times;</button>
            </div>
            <div className="calendar-modal-body">
              <div className="int-detail-header">
                <h2>{selectedInterview.jobId?.title || 'General Interview'}</h2>
                <span className={`status-badge status-${selectedInterview.dynamicStatus.toLowerCase().replace(' ', '-')}`}>
                  Status: {selectedInterview.dynamicStatus}
                </span>
              </div>
              
              <ul className="int-detail-list">
                <li><strong>Interview Type:</strong> {selectedInterview.round}</li>
                <li><strong>Date:</strong> {new Date(selectedInterview.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                <li><strong>Time:</strong> {selectedInterview.startTime} {selectedInterview.endTime ? `- ${selectedInterview.endTime}` : ''}</li>
                <li><strong>Interviewer:</strong> {selectedInterview.interviewer}</li>
                <li><strong>Interview Mode:</strong> {selectedInterview.interviewType}</li>
                
                {selectedInterview.interviewType === 'Online' && selectedInterview.meetingLink && (
                  <li><strong>Meeting Link:</strong> <a href={selectedInterview.meetingLink} target="_blank" rel="noreferrer">{selectedInterview.meetingLink}</a></li>
                )}
                
                {selectedInterview.interviewType === 'Offline' && selectedInterview.venue && (
                  <li><strong>Location:</strong> {selectedInterview.venue}</li>
                )}
              </ul>

              {(selectedInterview.dynamicStatus === 'Live') && selectedInterview.interviewType === 'Online' && selectedInterview.meetingLink && (
                <div className="int-action">
                  <a href={selectedInterview.meetingLink} target="_blank" rel="noreferrer" className="career-btn-primary join-btn" style={{ background: '#10b981', borderColor: '#10b981' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                      <polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                    Join Interview Now
                  </a>
                </div>
              )}
              
              {(selectedInterview.dynamicStatus === 'Upcoming') && selectedInterview.interviewType === 'Online' && selectedInterview.meetingLink && (
                <div className="int-action">
                  <button className="career-btn-primary join-btn" disabled style={{ opacity: 0.6, cursor: 'not-allowed', background: '#9ca3af', borderColor: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                      <polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                    Join Interview
                  </button>
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#6b7280', textAlign: 'center' }}>
                    Button will activate during the interview time.
                  </div>
                </div>
              )}

              {(selectedInterview.dynamicStatus === 'Interview Ended') && selectedInterview.interviewType === 'Online' && selectedInterview.meetingLink && (
                <div className="int-action" style={{ textAlign: 'center', padding: '1rem', background: '#fef2f2', borderRadius: '8px', marginTop: '1rem' }}>
                  <span style={{ color: '#ef4444', fontWeight: 500 }}>Interview Time Expired</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewCalendar;
