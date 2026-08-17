import React, { useState, useEffect } from 'react';
import './CompanyCalendar.css';
import HolidayManagement from './HolidayManagement';

const CompanyCalendar = ({ user, viewType }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({
    events: [],
    holidays: [],
    leaves: [],
    birthdays: [],
    workAnniversaries: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showHolidayManagement, setShowHolidayManagement] = useState(false);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate.getMonth(), currentDate.getFullYear()]); // Refetch when month changes (could be optimized)

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/calendar`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setCalendarData(data.data);
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err);
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

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCells = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();

    const cells = [];
    const prevMonthDays = getDaysInMonth(year, month - 1);

    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
      cells.push({
        day: prevMonthDays - firstDay + i + 1,
        isOtherMonth: true,
        date: new Date(year, month - 1, prevMonthDays - firstDay + i + 1)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        day: i,
        isOtherMonth: false,
        isToday: i === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
        date: new Date(year, month, i)
      });
    }

    // Padding for next month
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const remainingCells = totalCells - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      cells.push({
        day: i,
        isOtherMonth: true,
        date: new Date(year, month + 1, i)
      });
    }

    // Process all events into a standardized array for easy rendering
    const allItems = [];
    
    // Events
    calendarData.events.forEach(e => {
      if (e.status !== 'Cancelled') {
        allItems.push({ ...e, typeClass: 'type-event', displayTitle: e.title, eventDateStr: new Date(e.eventDate).toDateString() });
      }
    });
    
    // Holidays
    calendarData.holidays.forEach(h => {
      allItems.push({ ...h, typeClass: 'type-holiday', displayTitle: h.name, eventDateStr: new Date(h.date).toDateString() });
    });
    
    // Leaves (can span multiple days, for now we will just map them if they intersect, but for simplicity, we map to start date or every date in range)
    calendarData.leaves.forEach(l => {
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      let curr = new Date(start);
      while(curr <= end) {
        allItems.push({ ...l, typeClass: 'type-leave', displayTitle: `${l.userId?.firstName} (${l.leaveType})`, eventDateStr: new Date(curr).toDateString() });
        curr.setDate(curr.getDate() + 1);
      }
    });

    // Birthdays
    calendarData.birthdays.forEach(b => {
      const bDate = new Date(b.date);
      // Map to current year
      const currentYearBday = new Date(year, bDate.getMonth(), bDate.getDate());
      allItems.push({ ...b, typeClass: 'type-birthday', displayTitle: b.title, eventDateStr: currentYearBday.toDateString() });
    });

    // Anniversaries
    calendarData.workAnniversaries.forEach(a => {
      const aDate = new Date(a.date);
      // Map to current year
      const currentYearAnniv = new Date(year, aDate.getMonth(), aDate.getDate());
      allItems.push({ ...a, typeClass: 'type-anniversary', displayTitle: a.title, eventDateStr: currentYearAnniv.toDateString() });
    });

    return cells.map((cell, idx) => {
      const cellDateStr = cell.date.toDateString();
      const cellEvents = allItems.filter(item => item.eventDateStr === cellDateStr);

      return (
        <div key={idx} className={`emp-calendar-cell ${cell.isOtherMonth ? 'other-month' : ''}`}>
          <div className={`emp-calendar-date ${cell.isToday ? 'today' : ''}`}>{cell.day}</div>
          <div className="emp-calendar-events">
            {cellEvents.slice(0, 4).map((evt, eIdx) => (
              <div 
                key={eIdx} 
                className={`emp-calendar-event ${evt.typeClass}`}
                onClick={() => setSelectedEvent(evt)}
              >
                {evt.displayTitle}
              </div>
            ))}
            {cellEvents.length > 4 && (
              <div className="emp-calendar-event" style={{ backgroundColor: '#e2e8f0', color: '#475569', textAlign: 'center' }}>
                +{cellEvents.length - 4} more
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  const EventModal = () => {
    if (!selectedEvent) return null;

    let typeLabel = '';
    if (selectedEvent.typeClass === 'type-event') typeLabel = 'Company Event';
    if (selectedEvent.typeClass === 'type-holiday') typeLabel = 'Holiday';
    if (selectedEvent.typeClass === 'type-leave') typeLabel = 'Approved Leave';
    if (selectedEvent.typeClass === 'type-birthday') typeLabel = 'Birthday';
    if (selectedEvent.typeClass === 'type-anniversary') typeLabel = 'Work Anniversary';

    return (
      <div className="emp-calendar-modal-overlay" onClick={() => setSelectedEvent(null)}>
        <div className="emp-calendar-modal" onClick={e => e.stopPropagation()}>
          <div className="emp-calendar-modal-header">
            <h3>{selectedEvent.displayTitle}</h3>
            <button className="emp-calendar-modal-close" onClick={() => setSelectedEvent(null)}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div className="emp-calendar-modal-body">
            <div className="emp-calendar-modal-field">
              <span className={`emp-calendar-badge ${selectedEvent.typeClass}`}>{typeLabel}</span>
            </div>
            
            {selectedEvent.typeClass === 'type-event' && (
              <>
                <div className="emp-calendar-modal-field"><label>Date & Time</label><p>{new Date(selectedEvent.eventDate).toLocaleDateString()} {selectedEvent.startTime ? `${selectedEvent.startTime} - ${selectedEvent.endTime}` : ''}</p></div>
                <div className="emp-calendar-modal-field"><label>Location</label><p>{selectedEvent.location || 'N/A'}</p></div>
                <div className="emp-calendar-modal-field"><label>Description</label><p>{selectedEvent.description}</p></div>
              </>
            )}

            {selectedEvent.typeClass === 'type-holiday' && (
              <>
                <div className="emp-calendar-modal-field"><label>Date</label><p>{new Date(selectedEvent.date).toLocaleDateString()}</p></div>
                <div className="emp-calendar-modal-field"><label>Description</label><p>{selectedEvent.description || 'No description provided'}</p></div>
              </>
            )}

            {selectedEvent.typeClass === 'type-leave' && (
              <>
                <div className="emp-calendar-modal-field"><label>Employee</label><p>{selectedEvent.userId?.firstName} {selectedEvent.userId?.lastName}</p></div>
                <div className="emp-calendar-modal-field"><label>Duration</label><p>{new Date(selectedEvent.startDate).toLocaleDateString()} to {new Date(selectedEvent.endDate).toLocaleDateString()} ({selectedEvent.numberOfDays} days)</p></div>
                <div className="emp-calendar-modal-field"><label>Reason</label><p>{selectedEvent.reason}</p></div>
              </>
            )}

            {(selectedEvent.typeClass === 'type-birthday' || selectedEvent.typeClass === 'type-anniversary') && (
              <div className="emp-calendar-modal-field" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src={selectedEvent.user?.profileImage || `https://ui-avatars.com/api/?name=${selectedEvent.user?.firstName}+${selectedEvent.user?.lastName}&background=random`} alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
                <div>
                  <p style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{selectedEvent.user?.firstName} {selectedEvent.user?.lastName}</p>
                  <label>Wishing them a great day! 🎉</label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (showHolidayManagement) {
    return <HolidayManagement onBack={() => { setShowHolidayManagement(false); fetchCalendarData(); }} user={user} />;
  }

  return (
    <div className="emp-calendar-container">
      <div className="emp-calendar-header">
        <h2>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <div className="emp-calendar-actions">
          <button className="emp-calendar-btn" onClick={prevMonth}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Prev
          </button>
          <button className="emp-calendar-btn" onClick={() => setCurrentDate(new Date())}>Today</button>
          <button className="emp-calendar-btn" onClick={nextMonth}>
            Next
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          
          {(user?.role === 'HRAdmin' || user?.role === 'SuperAdmin') && (
            <button className="emp-calendar-btn primary" onClick={() => setShowHolidayManagement(true)}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>
              Manage Holidays
            </button>
          )}
        </div>
      </div>

      <div className="emp-calendar-legend">
        <div className="emp-legend-item"><div className="emp-legend-color color-blue"></div> Company Events</div>
        <div className="emp-legend-item"><div className="emp-legend-color color-green"></div> Approved Leave</div>
        <div className="emp-legend-item"><div className="emp-legend-color color-red"></div> Holidays</div>
        <div className="emp-legend-item"><div className="emp-legend-color color-yellow"></div> Birthdays</div>
        <div className="emp-legend-item"><div className="emp-legend-color color-purple"></div> Work Anniversaries</div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading calendar data...</div>
      ) : (
        <div className="emp-calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="emp-calendar-day-header">{day}</div>
          ))}
          {renderCells()}
        </div>
      )}
      
      <EventModal />
    </div>
  );
};

export default CompanyCalendar;
