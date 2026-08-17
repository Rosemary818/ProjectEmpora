import React, { useState, useEffect } from 'react';
import { goalService } from '../../services/goal.service';
import './Goals.css';

const StarRating = ({ label, value, onChange }) => {
  return (
    <div className="form-group star-rating-group">
      <label>{label} {value === 0 && <span style={{color: 'red'}}>*</span>}</label>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            onClick={() => onChange(star)}
            style={{ cursor: 'pointer', fontSize: '24px', color: value >= star ? '#fbbf24' : '#d1d5db' }}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
};

const ManagerGoals = () => {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    targetDate: '',
    priority: 'Medium',
  });
  
  const [reviewData, setReviewData] = useState({
    overallRating: 0,
    managerFeedback: '',
    reviewDate: '',
  });

  // We need team members to populate the select dropdown
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    fetchGoals();
    fetchTeamMembers();
  }, [filterStatus]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await goalService.getManagerGoals(filterStatus);
      if (res.success) {
        setGoals(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/manager-dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success && data.data.teamMembers) {
        setTeamMembers(data.data.teamMembers);
      }
    } catch (error) {
      console.error('Failed to fetch team members', error);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const res = await goalService.createGoal(formData);
      if (res.success) {
        setShowCreateModal(false);
        setFormData({ title: '', description: '', assignedTo: '', targetDate: '', priority: 'Medium' });
        fetchGoals();
      }
    } catch (error) {
      alert(error.message || 'Failed to create goal');
    }
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    try {
      if (reviewData.overallRating === 0) {
        return alert("Please provide an overall rating");
      }
      const res = await goalService.updateGoalManager(selectedGoal._id, reviewData);
      if (res.success) {
        setShowFeedbackModal(false);
        setSelectedGoal(null);
        setReviewData({
          overallRating: 0, 
          managerFeedback: '', 
          reviewDate: ''
        });
        fetchGoals();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add feedback');
    }
  };

  return (
    <div className="goals-container">
      <div className="goals-header">
        <h2>Team Performance & Goals</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create Goal
        </button>
      </div>

      <div className="goals-filters">
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="goals-select"
        >
          <option value="All">All Statuses</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {loading ? (
        <p>Loading goals...</p>
      ) : goals.length === 0 ? (
        <div className="emp-empty-state">No goals found.</div>
      ) : (
        <div className="goals-grid">
          {goals.map(goal => (
            <div key={goal._id} className="goal-card">
              <div className="goal-card-header">
                <h3>{goal.title}</h3>
                <span className={`goal-status status-${goal.status.replace(/\s+/g, '-').toLowerCase()}`}>
                  {goal.status}
                </span>
              </div>
              <p className="goal-desc">{goal.description}</p>
              
              <div className="goal-details">
                <p><strong>Employee:</strong> {goal.assignedTo?.firstName} {goal.assignedTo?.lastName}</p>
                <p><strong>Target Date:</strong> {new Date(goal.targetDate).toLocaleDateString()}</p>
                <p><strong>Priority:</strong> {goal.priority}</p>
              </div>

              <div className="goal-progress-section">
                <div className="progress-labels">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${goal.progress}%` }}></div>
                </div>
              </div>

              {(goal.managerFeedback || goal.overallRating) && (
                <div className="goal-feedback-summary">
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                    <strong>Review Completed</strong>
                    {goal.overallRating && <span>{'⭐'.repeat(goal.overallRating)}</span>}
                  </div>
                  {goal.managerFeedback && <p style={{fontSize: '13px', margin: 0, color: '#4b5563'}}>"{goal.managerFeedback}"</p>}
                </div>
              )}

              <div className="goal-actions">
                <button 
                  className="emp-btn-text" 
                  onClick={() => {
                    setSelectedGoal(goal);
                    setReviewData({
                      overallRating: goal.overallRating || 0,
                      managerFeedback: goal.managerFeedback || '',
                      reviewDate: goal.reviewDate 
                        ? new Date(goal.reviewDate).toISOString().split('T')[0] 
                        : (goal.reviewPeriod || ''), // fallback if string
                    });
                    setShowFeedbackModal(true);
                  }}
                >
                  {goal.overallRating ? 'Edit Review' : 'Add Feedback'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Goal</h3>
            <form onSubmit={handleCreateGoal} className="goal-form">
              <div className="form-group">
                <label>Goal Title *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  required 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                ></textarea>
              </div>
              <div className="form-group">
                <label>Assign Employee *</label>
                <select 
                  required 
                  value={formData.assignedTo} 
                  onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                >
                  <option value="">Select Employee</option>
                  {teamMembers.map(member => (
                    <option key={member._id} value={member._id}>{member.firstName} {member.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Target Date *</label>
                <input 
                  type="date" 
                  required 
                  value={formData.targetDate} 
                  onChange={(e) => setFormData({...formData, targetDate: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select 
                  value={formData.priority} 
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Performance Feedback</h3>
            
            <div style={{marginBottom: '20px', fontSize: '15px', color: '#374151'}}>
              <strong>Employee:</strong> {selectedGoal?.assignedTo?.firstName} {selectedGoal?.assignedTo?.lastName}
            </div>
            
            <form onSubmit={handleAddFeedback} className="goal-form performance-form">
              
              <div className="form-group">
                <label>Review Date <span style={{color: 'red'}}>*</span></label>
                <input 
                  type="date"
                  required
                  value={reviewData.reviewDate} 
                  onChange={(e) => setReviewData({...reviewData, reviewDate: e.target.value})}
                />
              </div>

              <div style={{marginBottom: '15px'}}>
                <StarRating label="Overall Rating" value={reviewData.overallRating} onChange={(val) => setReviewData({...reviewData, overallRating: val})} />
              </div>

              <div className="form-group">
                <label>Manager Feedback</label>
                <textarea 
                  rows="4"
                  value={reviewData.managerFeedback} 
                  onChange={(e) => setReviewData({...reviewData, managerFeedback: e.target.value})}
                  placeholder="Enter feedback for the employee..."
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFeedbackModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerGoals;
