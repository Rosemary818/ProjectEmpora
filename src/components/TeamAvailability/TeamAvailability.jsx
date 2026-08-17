import React, { useState, useEffect } from 'react';
import './TeamAvailability.css';

const TeamAvailability = () => {
  const [targetDate, setTargetDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: { available: 0, onLeave: 0, absent: 0, holiday: 0 },
    team: []
  });

  useEffect(() => {
    fetchTeamAvailability();
  }, [targetDate]);

  const fetchTeamAvailability = async () => {
    setLoading(true);
    try {
      // Format date as YYYY-MM-DD
      const dateString = targetDate.toISOString().split('T')[0];
      const res = await fetch(`http://localhost:5000/api/users/team-availability?date=${dateString}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        console.error('Failed to fetch team availability');
      }
    } catch (error) {
      console.error('Error fetching team availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevDay = () => {
    const prev = new Date(targetDate);
    prev.setDate(prev.getDate() - 1);
    setTargetDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(targetDate);
    next.setDate(next.getDate() + 1);
    setTargetDate(next);
  };

  const handleToday = () => {
    setTargetDate(new Date());
  };

  const getStatusClass = (rawStatus) => {
    switch (rawStatus) {
      case 'Available': return 'status-available';
      case 'On Leave': return 'status-leave';
      case 'Holiday': return 'status-holiday';
      case 'Absent': return 'status-absent';
      default: return 'status-absent';
    }
  };

  const getStatClass = (key) => {
    switch (key) {
      case 'available': return 'stat-available';
      case 'onLeave': return 'stat-leave';
      case 'holiday': return 'stat-holiday';
      case 'absent': return 'stat-absent';
      default: return '';
    }
  };

  return (
    <div className="team-avail-container">
      <div className="team-avail-header">
        <div>
          <h2>Team Availability</h2>
          <p>View the daily availability status of your direct reports.</p>
        </div>

        <div className="team-avail-controls">
          <button onClick={handlePrevDay}>&lt; Prev</button>
          <div className="team-avail-date">
            {targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <button onClick={handleNextDay}>Next &gt;</button>
          <button className="team-avail-btn-today" onClick={handleToday}>Today</button>
        </div>
      </div>

      <div className="team-avail-summary">
        <div className={`team-avail-stat-card ${getStatClass('available')}`}>
          <h3>🟢 Available</h3>
          <p>{loading ? '-' : data.summary.available}</p>
        </div>
        <div className={`team-avail-stat-card ${getStatClass('onLeave')}`}>
          <h3>🔴 On Leave</h3>
          <p>{loading ? '-' : data.summary.onLeave}</p>
        </div>
        <div className={`team-avail-stat-card ${getStatClass('absent')}`}>
          <h3>🟠 Absent</h3>
          <p>{loading ? '-' : data.summary.absent}</p>
        </div>
        <div className={`team-avail-stat-card ${getStatClass('holiday')}`}>
          <h3>🟡 Holiday</h3>
          <p>{loading ? '-' : data.summary.holiday}</p>
        </div>
      </div>

      {loading ? (
        <div className="team-avail-empty">Loading team data...</div>
      ) : data.team.length === 0 ? (
        <div className="team-avail-empty">No team members found reporting to you.</div>
      ) : (
        <div className="team-avail-grid">
          {data.team.map(member => (
            <div className="team-avail-card" key={member._id}>
              <div className="team-avail-avatar">
                {member.profileImage ? (
                  <img src={member.profileImage} alt={member.firstName} />
                ) : (
                  member.firstName.charAt(0) + member.lastName.charAt(0)
                )}
              </div>
              <div className="team-avail-info">
                <h4 className="team-avail-name">{member.firstName} {member.lastName}</h4>
                <p className="team-avail-role">{member.designationName} • {member.employeeCode}</p>
                <span className={`team-avail-status ${getStatusClass(member.rawStatus)}`}>
                  {member.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamAvailability;
