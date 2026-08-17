import React, { useState } from 'react';
import './ManagerFeedbackModal.css';

const ManagerFeedbackModal = ({ interview, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    technicalRating: 3,
    communicationRating: 3,
    problemSolvingRating: 3,
    recommendation: 'Consider',
    comments: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:5000/api/interviews/${interview._id}/feedback`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        onSuccess(data.data);
      } else {
        setError(data.error || 'Failed to submit feedback');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRatingGroup = (name, label) => (
    <div className="feedback-form-group">
      <label>{label} (1-5)</label>
      <div className="rating-options">
        {[1, 2, 3, 4, 5].map(val => (
          <label key={val} className={`rating-label ${parseInt(formData[name]) === val ? 'active' : ''}`}>
            <input 
              type="radio" 
              name={name} 
              value={val} 
              checked={parseInt(formData[name]) === val} 
              onChange={handleChange} 
            />
            {val}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mgr-feedback-modal-overlay">
      <div className="mgr-feedback-modal">
        <div className="mgr-feedback-header">
          <h2>Submit Interview Feedback</h2>
          <button className="mgr-feedback-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mgr-feedback-body">
            {error && <div className="feedback-error">{error}</div>}
            
            <div className="feedback-candidate-info">
              <p><strong>Candidate:</strong> {interview.candidateId?.firstName} {interview.candidateId?.lastName}</p>
              <p><strong>Job:</strong> {interview.jobId?.title}</p>
              <p><strong>Round:</strong> {interview.round}</p>
            </div>

            {renderRatingGroup('technicalRating', 'Technical Rating')}
            {renderRatingGroup('communicationRating', 'Communication Rating')}
            {renderRatingGroup('problemSolvingRating', 'Problem Solving Rating')}

            <div className="feedback-form-group">
              <label>Overall Recommendation</label>
              <select name="recommendation" value={formData.recommendation} onChange={handleChange} required>
                <option value="Strong Hire">Strong Hire</option>
                <option value="Hire">Hire</option>
                <option value="Consider">Consider</option>
                <option value="Reject">Reject</option>
              </select>
            </div>

            <div className="feedback-form-group">
              <label>Comments / Notes</label>
              <textarea 
                name="comments" 
                value={formData.comments} 
                onChange={handleChange} 
                rows="4" 
                placeholder="Share your detailed feedback on the candidate's performance..."
                required
              />
            </div>
          </div>

          <div className="mgr-feedback-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagerFeedbackModal;
