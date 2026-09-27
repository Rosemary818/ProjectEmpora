import React, { useState, useEffect } from 'react';
import './TaskManagement.css';

const ManagerTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
    status: 'To Do',
    reopenTask: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review Modals
  const [reviewTaskId, setReviewTaskId] = useState(null);
  const [approveTaskData, setApproveTaskData] = useState(null);
  const [managerComment, setManagerComment] = useState('');

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

  const handleEditClick = (task) => {
    setEditingTaskId(task._id);
    const projectId = task.projectId ? task.projectId._id : '';
    const selectedProject = projects.find(p => p._id === projectId);
    setEmployees(selectedProject ? selectedProject.teamMembers : []);
    setFormData({
      title: task.title,
      description: task.description,
      projectId: projectId,
      assignedTo: task.assignedTo ? task.assignedTo._id : '',
      priority: task.priority,
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      status: task.status,
      reopenTask: false,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTaskId(null);
    setFormData({ title: '', description: '', projectId: '', assignedTo: '', priority: 'Medium', dueDate: '', status: 'To Do', reopenTask: false });
    setEmployees([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const url = editingTaskId ? `http://localhost:5000/api/tasks/${editingTaskId}` : 'http://localhost:5000/api/tasks';
      const method = editingTaskId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        fetchTasks();
        closeModal();
      } else {
        setError(data.message || `Failed to ${editingTaskId ? 'update' : 'create'} task`);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (taskId, newStatus, comment = '') => {
    try {
      const payload = { status: newStatus };
      if (comment) payload.managerComment = comment;

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
        setReviewTaskId(null);
        setApproveTaskData(null);
        setManagerComment('');
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

  if (loading) return <div className="tm-loading">Loading tasks...</div>;

  const totalTasks = tasks.length;
  const todoCount = tasks.filter(t => t.status === 'To Do').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const underReviewCount = tasks.filter(t => t.status === 'Under Review').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const blockedCount = tasks.filter(t => t.status === 'Blocked').length;
  const overdueCount = tasks.filter(t => isOverdue(t.dueDate, t.status)).length;

  return (
    <div className="tm-container">
      <div className="tm-header">
        <div>
          <h2>Task Management</h2>
          <p className="tm-subtitle">Manage and track your team's tasks</p>
        </div>
        <button className="tm-btn tm-btn-primary" onClick={() => { setEditingTaskId(null); setShowModal(true); }}>
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
          <div className="tm-metric-title">Under Review</div>
          <div className="tm-metric-value" style={{color: '#8b5cf6'}}>{underReviewCount}</div>
        </div>
        <div className="tm-metric-card">
          <div className="tm-metric-title">Completed</div>
          <div className="tm-metric-value" style={{color: '#16a34a'}}>{completedCount}</div>
        </div>
        <div className="tm-metric-card">
          <div className="tm-metric-title">Blocked</div>
          <div className="tm-metric-value" style={{color: '#b45309'}}>{blockedCount}</div>
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
                    <th>Assigned To</th>
                    <th>Due Date</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => {
                    const overdue = isOverdue(task.dueDate, task.status);
                    return (
                      <tr key={task._id} className={overdue ? 'tm-row-overdue' : ''}>
                        <td>
                          <div className="tm-task-title">{task.title} {getPriorityBadge(task.priority)}</div>
                          <div className="tm-task-desc" style={{fontSize: '0.8rem', color: '#666', marginTop: '4px'}}>{task.projectId ? task.projectId.name : 'No Project'}</div>
                        </td>
                        <td>
                          <div className="tm-assignee">
                            {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}
                          </div>
                        </td>
                        <td>
                          {new Date(task.dueDate).toLocaleDateString()}
                          {overdue && <div style={{color: '#dc2626', fontSize: '0.75rem', fontWeight: 'bold'}}>Overdue ({getDaysOverdue(task.dueDate)}d)</div>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="tm-progress-bar-container" style={{ width: '80px', marginBottom: 0 }}>
                              <div className="tm-progress-bar" style={{ width: `${task.progressPercentage}%` }}></div>
                            </div>
                            <span style={{fontSize: '0.8rem'}}>{task.progressPercentage}%</span>
                          </div>
                        </td>
                        <td>{getStatusBadge(task.status)}</td>
                        <td>
                          {task.status === 'Under Review' && (
                            <div style={{display: 'flex', gap: '5px'}}>
                              <button className="tm-btn tm-btn-success" style={{padding: '4px 8px', fontSize: '0.8rem'}} onClick={() => { setApproveTaskData(task); setManagerComment(''); }}>Review</button>
                              <button className="tm-btn tm-btn-secondary" style={{padding: '4px 8px', fontSize: '0.8rem'}} onClick={() => { setReviewTaskId(task._id); setManagerComment(''); }}>Reject</button>
                            </div>
                          )}
                          {task.status === 'Blocked' && (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                              <span style={{fontSize: '0.75rem', color: '#b45309'}}>Reason: {task.blockedReason}</span>
                              <button className="tm-btn tm-btn-primary" style={{padding: '4px 8px', fontSize: '0.8rem'}} onClick={() => updateStatus(task._id, 'In Progress')}>Unblock</button>
                            </div>
                          )}
                          <div style={{marginTop: '5px'}}>
                            <button className="tm-btn tm-btn-secondary" style={{padding: '4px 8px', fontSize: '0.8rem'}} onClick={() => handleEditClick(task)}>Edit Details</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
              <h3>{editingTaskId ? 'Edit Task' : 'Create New Task'}</h3>
              <button className="tm-modal-close" onClick={closeModal}>&times;</button>
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
                  <option value="">Select Team Member</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="tm-form-group">
                <label>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleInputChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="tm-form-group">
                <label>Due Date</label>
                <input type="date" name="dueDate" required value={formData.dueDate} onChange={handleInputChange} />
              </div>

              {formData.status === 'Completed' && (
                <div className="tm-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="reopenTask" 
                    name="reopenTask" 
                    checked={formData.reopenTask} 
                    onChange={(e) => setFormData({...formData, reopenTask: e.target.checked})} 
                  />
                  <label htmlFor="reopenTask" style={{ marginBottom: 0 }}>Reopen Task</label>
                </div>
              )}
              
              <div className="tm-modal-footer">
                <button type="button" className="tm-btn tm-btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="tm-btn tm-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (editingTaskId ? 'Updating...' : 'Creating...') : (editingTaskId ? 'Update Task' : 'Create Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reviewTaskId && (
        <div className="tm-modal-overlay">
          <div className="tm-modal">
            <div className="tm-modal-header">
              <h3>Request Changes</h3>
              <button className="tm-modal-close" onClick={() => { setReviewTaskId(null); setManagerComment(''); }}>&times;</button>
            </div>
            <div className="tm-modal-body">
              <div className="tm-form-group">
                <label>Feedback for Employee</label>
                <textarea 
                  rows="3" 
                  value={managerComment} 
                  onChange={(e) => setManagerComment(e.target.value)}
                  placeholder="Explain what needs to be changed..."
                  required
                ></textarea>
              </div>
            </div>
            <div className="tm-modal-footer">
              <button className="tm-btn tm-btn-secondary" onClick={() => { setReviewTaskId(null); setManagerComment(''); }}>Cancel</button>
              <button className="tm-btn tm-btn-danger" onClick={() => updateStatus(reviewTaskId, 'In Progress', managerComment)} disabled={!managerComment}>Return to In Progress</button>
            </div>
          </div>
        </div>
      )}

      {approveTaskData && (
        <div className="tm-modal-overlay">
          <div className="tm-modal" style={{ maxWidth: '600px' }}>
            <div className="tm-modal-header">
              <h3>Review Task for Approval</h3>
              <button className="tm-modal-close" onClick={() => { setApproveTaskData(null); setManagerComment(''); }}>&times;</button>
            </div>
            <div className="tm-modal-body">
              <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{approveTaskData.title} {getPriorityBadge(approveTaskData.priority)}</h4>
                <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '15px' }}>{approveTaskData.description}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                  <div><strong>Assigned To:</strong> {approveTaskData.assignedTo ? `${approveTaskData.assignedTo.firstName} ${approveTaskData.assignedTo.lastName}` : 'Unassigned'}</div>
                  <div><strong>Project:</strong> {approveTaskData.projectId ? approveTaskData.projectId.name : 'N/A'}</div>
                  <div><strong>Due Date:</strong> {new Date(approveTaskData.dueDate).toLocaleDateString()}</div>
                  <div><strong>Submitted:</strong> {new Date(approveTaskData.updatedAt || approveTaskData.createdAt).toLocaleDateString()}</div>
                  <div><strong>Progress:</strong> {approveTaskData.progressPercentage}%</div>
                </div>
              </div>

              <div className="tm-form-group">
                <label>Review Comment (Optional)</label>
                <textarea 
                  rows="3" 
                  value={managerComment} 
                  onChange={(e) => setManagerComment(e.target.value)}
                  placeholder="Enter any final feedback or approval notes..."
                ></textarea>
              </div>
            </div>
            <div className="tm-modal-footer">
              <button className="tm-btn tm-btn-secondary" onClick={() => { setApproveTaskData(null); setManagerComment(''); }}>Cancel</button>
              <button className="tm-btn tm-btn-success" onClick={() => updateStatus(approveTaskData._id, 'Completed', managerComment)}>Approve & Complete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTasks;
