import React, { useState, useEffect } from 'react';
import { goalService } from '../../services/goal.service';
import './Goals.css';

const EmployeeGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchGoals();
  }, [filterStatus]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await goalService.getEmployeeGoals(filterStatus);
      if (res.success) {
        setGoals(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProgressChange = async (goal, newProgress) => {
    try {
      // Optimistic update locally
      const updatedGoals = goals.map(g => {
        if (g._id === goal._id) {
          return { ...g, progress: newProgress };
        }
        return g;
      });
      setGoals(updatedGoals);
      
      const res = await goalService.updateGoalProgress(goal._id, parseInt(newProgress));
      if (res.success) {
        // Re-fetch to get correct status strings
        fetchGoals();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update progress');
      fetchGoals(); // Revert
    }
  };

  return (
    <div className="goals-container">
      <div className="goals-header">
        <h2>My Performance & Goals</h2>
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
        <div className="emp-empty-state">No goals assigned to you yet.</div>
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
                <p><strong>Assigned By:</strong> {goal.assignedBy?.firstName} {goal.assignedBy?.lastName}</p>
                <p><strong>Target Date:</strong> {new Date(goal.targetDate).toLocaleDateString()}</p>
                <p><strong>Priority:</strong> {goal.priority}</p>
              </div>

              <div className="goal-progress-section">
                <div className="progress-labels">
                  <span>Update Progress: {goal.progress}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={goal.progress} 
                  onChange={(e) => handleProgressChange(goal, e.target.value)}
                  className="goal-slider"
                  disabled={goal.status === 'Completed' || goal.status === 'Overdue'}
                />
              </div>

              {goal.managerFeedback && (
                <div className="goal-feedback">
                  <strong>Manager Feedback:</strong> {goal.managerFeedback}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeGoals;
