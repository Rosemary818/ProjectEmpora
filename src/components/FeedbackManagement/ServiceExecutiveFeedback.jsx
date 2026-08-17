import React, { useState, useEffect } from 'react';
import './FeedbackManagement.css';

const ServiceExecutiveFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [metrics, setMetrics] = useState({
    averageRating: 0,
    totalFeedback: 0,
    fiveStarCount: 0,
    lowRatingCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/feedback/service-executive', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(data.data);
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Error fetching feedback', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="empty-state">Loading feedback...</div>;

  return (
    <div className="feedback-management">
      <div className="feedback-header" style={{ marginBottom: '1.5rem' }}>
        <h2>Resolution Feedback</h2>
      </div>

      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="metric-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="metric-title" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Average Rating</div>
          <div className="metric-value" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a' }}>{metrics.averageRating} ⭐</div>
        </div>
        <div className="metric-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="metric-title" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Total Feedback</div>
          <div className="metric-value" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#388087' }}>{metrics.totalFeedback}</div>
        </div>
        <div className="metric-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="metric-title" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>5-Star Ratings</div>
          <div className="metric-value" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#16a34a' }}>{metrics.fiveStarCount}</div>
        </div>
        <div className="metric-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="metric-title" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Low Ratings (≤3)</div>
          <div className="metric-value" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ef4444' }}>{metrics.lowRatingCount}</div>
        </div>
      </div>

      <div className="feedback-table-container" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {feedback.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No feedback received yet.</div>
        ) : (
          <table className="feedback-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Date</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Type</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Requester</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Rating</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Comment</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map(fb => (
                <tr key={fb._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem' }}>{new Date(fb.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>{fb.requestType === 'Complaint' ? 'Complaint' : 'Service Request'}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {fb.requesterId?.profileImage ? (
                          <img src={fb.requesterId.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#6b7280' }}>
                            {fb.requesterId?.firstName?.charAt(0)}{fb.requesterId?.lastName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: '#111827' }}>{fb.requesterId?.firstName} {fb.requesterId?.lastName}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: fb.rating >= 4 ? '#16a34a' : fb.rating === 3 ? '#eab308' : '#ef4444' }}>
                    {fb.rating} ⭐
                  </td>
                  <td style={{ padding: '1rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={fb.comment}>
                    {fb.comment || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ServiceExecutiveFeedback;
