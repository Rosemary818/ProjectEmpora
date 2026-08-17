import React, { useState, useEffect } from 'react';
import './HRClientVisitors.css';

const HRClientVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Today'); // 'Today', 'Upcoming', 'Checked In', 'Checked Out', 'Cancelled', 'All'

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/visitors/hr', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setVisitors(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredVisitors = () => {
    const today = new Date().toISOString().split('T')[0];

    return visitors.filter(v => {
      const meetingDate = new Date(v.meetingId?.date).toISOString().split('T')[0];
      
      if (filter === 'Today') {
        return meetingDate === today;
      }
      if (filter === 'Upcoming') {
        return meetingDate > today && v.status === 'Expected';
      }
      if (filter === 'Checked In') return v.status === 'Checked In';
      if (filter === 'Checked Out') return v.status === 'Checked Out';
      if (filter === 'Cancelled') return v.status === 'Cancelled';
      
      return true; // All
    });
  };

  const filteredVisitors = getFilteredVisitors();

  // Calculate quick stats
  const todayDate = new Date().toISOString().split('T')[0];
  const todaysVisitors = visitors.filter(v => new Date(v.meetingId?.date).toISOString().split('T')[0] === todayDate);
  const expectedCount = todaysVisitors.filter(v => v.status === 'Expected').length;
  const checkedInCount = todaysVisitors.filter(v => v.status === 'Checked In').length;
  const checkedOutCount = todaysVisitors.filter(v => v.status === 'Checked Out').length;

  if (loading) return <div className="hrcv-container">Loading visitor data...</div>;

  return (
    <div className="hrcv-container">
      <div className="hrcv-header">
        <div>
          <h1>Client Visitors</h1>
          <p>Monitor external visitors for client meetings.</p>
        </div>
      </div>

      <div className="hrcv-stats">
        <div className="hrcv-stat-card">
          <div className="hrcv-stat-icon yellow"></div>
          <div className="hrcv-stat-info">
            <span className="hrcv-stat-value">{expectedCount}</span>
            <span className="hrcv-stat-label">Expected Today</span>
          </div>
        </div>
        <div className="hrcv-stat-card">
          <div className="hrcv-stat-icon green"></div>
          <div className="hrcv-stat-info">
            <span className="hrcv-stat-value">{checkedInCount}</span>
            <span className="hrcv-stat-label">Checked In Today</span>
          </div>
        </div>
        <div className="hrcv-stat-card">
          <div className="hrcv-stat-icon blue"></div>
          <div className="hrcv-stat-info">
            <span className="hrcv-stat-value">{checkedOutCount}</span>
            <span className="hrcv-stat-label">Checked Out Today</span>
          </div>
        </div>
      </div>

      <div className="hrcv-filters">
        {['Today', 'Upcoming', 'Checked In', 'Checked Out', 'Cancelled', 'All'].map(f => (
          <button 
            key={f}
            className={`hrcv-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="hrcv-table-wrapper">
        <table className="hrcv-table">
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Host</th>
              <th>Meeting</th>
              <th>Room & Time</th>
              <th>Status</th>
              <th>Check In/Out</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisitors.map(v => (
              <tr key={v._id}>
                <td>
                  <strong>{v.visitorName}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{v.companyName}</div>
                </td>
                <td>
                  {v.hostUserId?.firstName} {v.hostUserId?.lastName}
                </td>
                <td>{v.meetingId?.title}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{v.roomId?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    {new Date(v.meetingId?.date).toLocaleDateString()} • {v.meetingId?.startTime}
                  </div>
                </td>
                <td>
                  <span className={`hrcv-status-badge ${v.status.replace(' ', '').toLowerCase()}`}>
                    {v.status}
                  </span>
                </td>
                <td>
                  <div style={{ fontSize: '0.8rem' }}>
                    {v.checkInTime ? `In: ${new Date(v.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : '-'} <br/>
                    {v.checkOutTime ? `Out: ${new Date(v.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : '-'}
                  </div>
                </td>
              </tr>
            ))}
            {filteredVisitors.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  No visitors found for the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HRClientVisitors;
