import React, { useState, useEffect } from 'react';
import './TaskManagement.css';

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blockModalTaskId, setBlockModalTaskId] = useState(null);
  const [blockedReason, setBlockedReason] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks/my-tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(data.data);
      } else {
        setError(data.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId, newStatus, reason = '') => {
    if (newStatus === 'Blocked' && !reason) {
      setBlockModalTaskId(taskId);
      return;
    }

    try {
      const payload = { status: newStatus };
      if (newStatus === 'Blocked') payload.blockedReason = reason;

      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setTasks(tasks.map(t => t._id === taskId ? data.data : t));
        setBlockModalTaskId(null);
        setBlockedReason('');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const updateProgress = async (taskId, progress) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ progressPercentage: progress })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTasks(tasks.map(t => t._id === taskId ? data.data : t));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update progress');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const getPriorityBadge = (priority) => {
    const p = priority.toLowerCase();
    return <span className={`tm-badge tm-badge-${p}`}>{priority}</span>;
  };

  const getStatusBadge = (status) => {
    const s = status.replace(/\s+/g, '-').toLowerCase();
    return <span className={`tm-status tm-status-${s}`}>{status}</span>;
  };

  const isOverdue = (dueDate, status) => {
    return new Date() > new Date(dueDate) && status !== 'Completed';
  };

  const getDaysOverdue = (dueDate) => {
    const diff = new Date() - new Date(dueDate);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) return <div className="tm-loading">Loading your tasks...</div>;

  return (
    <div className="tm-container">
      <div className="tm-header">
        <div>
          <h2>My Tasks</h2>
          <p className="tm-subtitle">View and update your assigned tasks</p>
        </div>
      </div>

      {error && <div className="tm-alert tm-alert-danger">{error}</div>}

      {tasks.length === 0 ? (
        <div className="tm-empty" style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          No tasks assigned to you right now. Great job!
        </div>
      ) : (
        <div className="tm-cards-grid">
          {tasks.map(task => (
            <div key={task._id} className={`tm-task-card ${isOverdue(task.dueDate, task.status) ? 'tm-task-overdue-card' : ''}`}>
              <div className="tm-task-card-header">
                <h3>{task.title}</h3>
                <div style={{display: 'flex', gap: '8px'}}>
                  {getPriorityBadge(task.priority)}
                  {getStatusBadge(task.status)}
                </div>
              </div>
              <p>{task.description}</p>

              {isOverdue(task.dueDate, task.status) && (
                <div className="tm-overdue-alert">
                  ⚠ Overdue by {getDaysOverdue(task.dueDate)} days
                </div>
              )}
              
              <div className="tm-task-meta" style={{ marginTop: '1rem' }}>
                <div><strong>Project:</strong> {task.projectId ? task.projectId.name : '-'}</div>
                <div><strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}</div>
                <div><strong>Assigned By:</strong> {task.assignedBy ? `${task.assignedBy.firstName} ${task.assignedBy.lastName}` : 'Unknown'}</div>
              </div>

              {task.managerComment && (
                <div className="tm-manager-feedback" style={{ marginTop: '10px', padding: '10px', background: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '4px' }}>
                  <strong>Manager Feedback:</strong> {task.managerComment}
                </div>
              )}

              <div className="tm-progress-section" style={{ marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Progress</span>
                  <span style={{ fontSize: '0.875rem' }}>{task.progressPercentage}%</span>
                </div>
                <div className="tm-progress-bar-container">
                  <div className="tm-progress-bar" style={{ width: `${task.progressPercentage}%` }}></div>
                </div>
                
                {task.status === 'In Progress' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <input 
                      type="range" 
                      min="1" 
                      max="99" 
                      value={task.progressPercentage === 0 ? 1 : task.progressPercentage === 100 ? 99 : task.progressPercentage} 
                      onChange={(e) => updateProgress(task._id, Number(e.target.value))}
                      style={{ flex: 1 }}
                    />
                  </div>
                )}
              </div>

              <div className="tm-task-actions" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                {task.status === 'To Do' && (
                  <button className="tm-btn tm-btn-primary" onClick={() => updateStatus(task._id, 'In Progress')}>
                    Start Task
                  </button>
                )}
                {task.status === 'In Progress' && (
                  <>
                    <button className="tm-btn tm-btn-success" onClick={() => updateStatus(task._id, 'Under Review')}>
                      Submit for Review
                    </button>
                    <button className="tm-btn tm-btn-danger" onClick={() => updateStatus(task._id, 'Blocked')}>
                      Block Task
                    </button>
                  </>
                )}
                {task.status === 'Blocked' && (
                  <div style={{ padding: '8px', background: '#fffbeb', color: '#b45309', borderRadius: '4px', fontSize: '0.875rem', width: '100%' }}>
                    Waiting for manager to resolve block: {task.blockedReason}
                  </div>
                )}
                {task.status === 'Under Review' && (
                  <div style={{ padding: '8px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', fontSize: '0.875rem', width: '100%' }}>
                    Task is currently under manager review.
                  </div>
                )}
                {task.status === 'Completed' && (
                  <div style={{ padding: '8px', background: '#f0fdf4', color: '#15803d', borderRadius: '4px', fontSize: '0.875rem', width: '100%' }}>
                    Completed on {new Date(task.completedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {blockModalTaskId && (
        <div className="tm-modal-overlay">
          <div className="tm-modal">
            <div className="tm-modal-header">
              <h3>Block Task</h3>
              <button className="tm-modal-close" onClick={() => { setBlockModalTaskId(null); setBlockedReason(''); }}>&times;</button>
            </div>
            <div className="tm-modal-body">
              <div className="tm-form-group">
                <label>Reason for blocking</label>
                <textarea 
                  rows="3" 
                  value={blockedReason} 
                  onChange={(e) => setBlockedReason(e.target.value)}
                  placeholder="Explain why you cannot continue..."
                ></textarea>
              </div>
            </div>
            <div className="tm-modal-footer">
              <button className="tm-btn tm-btn-secondary" onClick={() => { setBlockModalTaskId(null); setBlockedReason(''); }}>Cancel</button>
              <button className="tm-btn tm-btn-danger" onClick={() => updateStatus(blockModalTaskId, 'Blocked', blockedReason)}>Block Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;
