import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRecentActivities } from '../../services/activity.service';
import './ActivityTimeline.css';

const ActivityTimeline = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'me', 'team'
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Default to 'me' if it's an employee
      if (parsedUser.role === 'Employee') {
        setFilter('me');
      } else if (location.pathname.includes('employee')) {
        setFilter('me');
      }
    } else {
      navigate('/login');
    }
  }, [navigate, location]);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [filter, user]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // 0 means no limit
      const data = await getRecentActivities(filter, 0);
      setActivities(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Handled by parent dashboard now
  };

  return (
    <div className="activity-timeline-wrapper">
      <div className="timeline-header-local">
        <h2>Activity Timeline</h2>
        
        {user?.role === 'Manager' && (
          <div className="timeline-filters">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={filter === 'me' ? 'active' : ''} 
              onClick={() => setFilter('me')}
            >
              My Activity
            </button>
            <button 
              className={filter === 'team' ? 'active' : ''} 
              onClick={() => setFilter('team')}
            >
              Team Activity
            </button>
          </div>
        )}
      </div>

      <div className="timeline-content-local">
        {loading ? (
          <div className="loading-state">Loading timeline...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : activities.length > 0 ? (
          <div className="timeline-container">
            {activities.map((act) => (
              <div key={act.id} className="timeline-event">
                <div className="timeline-connector"></div>
                <div className="timeline-marker">
                  {act.iconColor || '⚪'}
                </div>
                <div className="timeline-details">
                  <div className="event-meta">
                    <span className="event-module">{act.module}</span>
                    <span className="event-date">
                      {new Date(act.date).toLocaleString([], {
                        month: 'short', day: 'numeric', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <h3 className="event-action">{act.action}</h3>
                  <p className="event-desc">{act.description}</p>
                  {act.user && (
                    <div className="event-user">
                      <div className="user-avatar">
                        {act.user.profileImage ? (
                          <img src={act.user.profileImage} alt="" />
                        ) : (
                          `${act.user.firstName?.charAt(0) || ''}${act.user.lastName?.charAt(0) || ''}`
                        )}
                      </div>
                      <span>{act.user.firstName} {act.user.lastName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No activities found for this filter.</div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
