import React, { useState, useEffect } from 'react';
import './TaskManagement.css';

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const updateStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTasks(tasks.map(t => t._id === taskId ? data.data : t));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const getPriorityBadge = (priority) => {
    const p = priority.toLowerCase();
    return <span className={`tm-badge tm-badge-${p}`}>{priority}</span>;
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

      {error && <div className="tm-alert-danger">{error}</div>}

      {tasks.length === 0 ? (
        <div className="tm-empty" style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          No tasks assigned to you right now. Great job!
        </div>
      ) : (
        <div className="tm-cards-grid">
          {tasks.map(task => (
            <div key={task._id} className="tm-task-card">
              <div className="tm-task-card-header">
                <h3>{task.title}</h3>
                {getPriorityBadge(task.priority)}
              </div>
              <p>{task.description}</p>
              
              <div className="tm-task-meta">
                <div>
                  <strong>Project:</strong> {task.projectId ? task.projectId.name : '-'}
                </div>
                <div><strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}</div>
                <div>
                  <strong>Assigned By:</strong> {task.assignedBy ? `${task.assignedBy.firstName} ${task.assignedBy.lastName}` : 'Unknown'}
                </div>
              </div>

              <div className="tm-task-actions">
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Update Status:</span>
                <select 
                  className="tm-status-select" 
                  value={task.status} 
                  onChange={(e) => updateStatus(task._id, e.target.value)}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;
