import React, { useState, useEffect } from 'react';
import './TaskManagement.css';

const ManagerTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/projects/my-projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks/manager', {
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

  const fetchEmployees = async () => {
    try {
      // In a real app, this might be a specific endpoint for manager's team.
      // Assuming we can use /api/user to get users (or we can just fetch all users).
      const res = await fetch('http://localhost:5000/api/user', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Filter to only show employees for assignment (optional depending on rules)
        setEmployees(data.data.filter(u => u.role === 'Employee' || u.role === 'Manager'));
      }
    } catch (err) {
      console.error('Failed to fetch employees', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'projectId') {
      const selectedProject = projects.find(p => p._id === value);
      setEmployees(selectedProject ? selectedProject.teamMembers : []);
      setFormData({ ...formData, projectId: value, assignedTo: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        // Optimistically add task (needs populate simulation or just refetch)
        fetchTasks();
        setShowModal(false);
        setFormData({ title: '', description: '', projectId: '', assignedTo: '', priority: 'Medium', dueDate: '' });
        setEmployees([]);
      } else {
        setError(data.message || 'Failed to create task');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (priority) => {
    const p = priority.toLowerCase();
    return <span className={`tm-badge tm-badge-${p}`}>{priority}</span>;
  };

  const getStatusBadge = (status) => {
    const s = status.replace(/\s+/g, '-').toLowerCase();
    return <span className={`tm-badge tm-badge-${s}`}>{status}</span>;
  };

  if (loading) return <div className="tm-loading">Loading tasks...</div>;

  const totalTasks = tasks.length;
  const todoCount = tasks.filter(t => t.status === 'To Do').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const overdueCount = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;

  return (
    <div className="tm-container">
      <div className="tm-header">
        <div>
          <h2>Task Management</h2>
          <p className="tm-subtitle">Manage and track your team's tasks</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Create Task
        </button>
      </div>

      <div className="tm-metrics">
        <div className="tm-metric-card">
          <div className="tm-metric-title">Total Tasks</div>
          <div className="tm-metric-value">{totalTasks}</div>
        </div>
        <div className="tm-metric-card">
          <div className="tm-metric-title">To Do</div>
          <div className="tm-metric-value" style={{color: '#6b7280'}}>{todoCount}</div>
        </div>
        <div className="tm-metric-card">
          <div className="tm-metric-title">In Progress</div>
          <div className="tm-metric-value" style={{color: '#2563eb'}}>{inProgressCount}</div>
        </div>
        <div className="tm-metric-card">
          <div className="tm-metric-title">Completed</div>
          <div className="tm-metric-value" style={{color: '#16a34a'}}>{completedCount}</div>
        </div>
        <div className="tm-metric-card">
          <div className="tm-metric-title">Overdue</div>
          <div className="tm-metric-value" style={{color: '#dc2626'}}>{overdueCount}</div>
        </div>
      </div>

      {error && <div className="tm-alert tm-alert-danger">{error}</div>}

      <div className="tm-card">
        <div className="tm-card-body">
          {tasks.length === 0 ? (
            <p className="tm-empty">No tasks created yet. Click "Create Task" to get started.</p>
          ) : (
            <div className="tm-table-wrapper">
              <table className="tm-table">
                <thead>
                  <tr>
                    <th>Task Details</th>
                    <th>Project</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task._id}>
                      <td>
                        <div className="tm-task-title">{task.title}</div>
                        <div className="tm-task-desc">{task.description}</div>
                      </td>
                      <td>
                        <div className="tm-assignee">
                          {task.projectId ? task.projectId.name : '-'}
                        </div>
                      </td>
                      <td>
                        <div className="tm-assignee">
                          {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}
                        </div>
                      </td>
                      <td>{getPriorityBadge(task.priority)}</td>
                      <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                      <td>{getStatusBadge(task.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="tm-modal-overlay">
          <div className="tm-modal">
            <div className="tm-modal-header">
              <h3>Create New Task</h3>
              <button className="tm-modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="tm-modal-body">
              <div className="tm-form-group">
                <label>Task Title</label>
                <input type="text" name="title" required value={formData.title} onChange={handleInputChange} />
              </div>
              
              <div className="tm-form-group">
                <label>Description</label>
                <textarea name="description" required rows="3" value={formData.description} onChange={handleInputChange}></textarea>
              </div>
              
              <div className="tm-form-group">
                <label>Project</label>
                <select name="projectId" required value={formData.projectId} onChange={handleInputChange}>
                  <option value="">Select Project</option>
                  {projects.map(proj => (
                    <option key={proj._id} value={proj._id}>{proj.name}</option>
                  ))}
                </select>
              </div>

              <div className="tm-form-group">
                <label>Assign To</label>
                <select name="assignedTo" required value={formData.assignedTo} onChange={handleInputChange} disabled={!formData.projectId}>
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="tm-form-row">
                <div className="tm-form-group">
                  <label>Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="tm-form-group">
                  <label>Due Date</label>
                  <input type="date" name="dueDate" required value={formData.dueDate} onChange={handleInputChange} />
                </div>
              </div>

              <div className="tm-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTasks;
