import React, { useState, useEffect } from 'react';
import { goalService } from '../../services/goal.service';
import './Goals.css';

const StarDisplay = ({ label, value }) => {
  if (value === undefined || value === null) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
      <span style={{ color: '#4b5563' }}>{label}</span>
      <span>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} style={{ color: value >= star ? '#fbbf24' : '#e5e7eb' }}>★</span>
        ))}
      </span>
    </div>
  );
};

const EmployeePerformance = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await goalService.getEmployeeGoals('All'); // fetch all goals
      if (res.success) {
        // Filter goals that have performance review data (overall rating or manager feedback)
        const reviewGoals = res.data.filter(g => g.overallRating || g.managerFeedback);
        
        // Sort chronologically by reviewPeriod if possible, or updatedAt
        reviewGoals.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setReviews(reviewGoals);
      }
    } catch (error) {
      console.error('Failed to fetch performance reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="goals-container">
      <div className="goals-header">
        <h2>My Performance Reviews</h2>
      </div>

      {loading ? (
        <p>Loading performance history...</p>
      ) : reviews.length === 0 ? (
        <div className="emp-empty-state">No performance reviews found yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {reviews.map(review => (
            <div 
              key={review._id} 
              className="goal-card" 
              style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              onClick={() => setSelectedReview(review)}
            >
              <div className="goal-card-header">
                <h3>
                  {review.reviewDate 
                    ? new Date(review.reviewDate).toLocaleDateString() 
                    : review.reviewPeriod || 'Performance Review'} - {review.title}
                </h3>
                {review.overallRating && (
                  <span style={{ fontSize: '18px' }}>
                    {'⭐'.repeat(review.overallRating)}
                    <span style={{ color: '#e5e7eb' }}>{'★'.repeat(5 - review.overallRating)}</span>
                  </span>
                )}
              </div>
              <p className="goal-desc" style={{ marginTop: '10px' }}>
                <strong>Manager:</strong> {review.assignedBy?.firstName} {review.assignedBy?.lastName}
                <span style={{ marginLeft: '15px' }}>
                  <strong>Date:</strong> {new Date(review.updatedAt).toLocaleDateString()}
                </span>
              </p>
              <div style={{ marginTop: '10px' }}>
                <span className="emp-btn-text">View Details →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Details Modal */}
      {selectedReview && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Performance Review Details</h3>
              <button 
                onClick={() => setSelectedReview(null)} 
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}
              >
                ×
              </button>
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                <strong>Date:</strong> {selectedReview.reviewDate 
                  ? new Date(selectedReview.reviewDate).toLocaleDateString() 
                  : selectedReview.reviewPeriod || 'N/A'}
              </p>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}><strong>Reference Goal:</strong> {selectedReview.title}</p>
              <p style={{ margin: 0, fontSize: '14px' }}><strong>Reviewer:</strong> {selectedReview.assignedBy?.firstName} {selectedReview.assignedBy?.lastName}</p>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', color: '#374151' }}>Ratings</h4>
              <StarDisplay label="Overall Rating" value={selectedReview.overallRating} />
            </div>

            {selectedReview.managerFeedback && (
              <div>
                <h4 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', color: '#374151' }}>Manager Comments</h4>
                <p style={{ fontSize: '14px', margin: 0, backgroundColor: '#f3f4f6', color: '#374151', padding: '10px', borderRadius: '6px' }}>
                  {selectedReview.managerFeedback}
                </p>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '30px' }}>
              <button type="button" className="btn btn-primary" onClick={() => setSelectedReview(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePerformance;
