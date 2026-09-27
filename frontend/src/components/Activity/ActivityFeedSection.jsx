import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecentActivities } from '../../services/activity.service';
import './ActivityFeedSection.css';

const ActivityFeedSection = ({ limit = 5, filter = 'me', role = 'Employee', layout = 'vertical' }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchActivities();
  }, [filter, limit]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await getRecentActivities(filter, limit);
      setActivities(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }
    
    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
      return 'Yesterday';
    }
    
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} days ago`;
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleViewAll = () => {
    if (role === 'Manager') {
      navigate('/manager/activity');
    } else {
      navigate('/employee/activity');
    }
  };

  return (
    <section className={`emp-card activity-feed-section layout-${layout}`}>
      <div className="emp-card-header">
        <h2>Recent Activity</h2>
        <button className="emp-btn-text" onClick={handleViewAll}>
          View All Activity →
        </button>
      </div>
      <div className="emp-card-body">
        {loading ? (
          <p className="activity-message">Loading activities...</p>
        ) : error ? (
          <p className="activity-error">{error}</p>
        ) : activities.length > 0 ? (
          <div className="activity-list">
            {activities.map((act) => (
              <div key={act.id} className="activity-item">
                <div className="activity-icon-container">
                  <span className="activity-icon">{act.iconColor || '⚪'}</span>
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <h4>{act.action}</h4>
                    <span className="activity-time">{getTimeAgo(act.date)}</span>
                  </div>
                  <p className="activity-desc">{act.description}</p>
                  {filter !== 'me' && act.user && (
                    <p className="activity-user-text">
                      By: {act.user.firstName} {act.user.lastName}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="activity-message">No recent activity</p>
        )}
      </div>
    </section>
  );
};

export default ActivityFeedSection;
