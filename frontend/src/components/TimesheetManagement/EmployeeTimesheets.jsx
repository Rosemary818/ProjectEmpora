import React, { useState, useEffect } from 'react';
import './TimesheetManagement.css';

const EmployeeTimesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    taskId: '',
    date: '',
    description: '',
    hoursWorked: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTimesheets();
    fetchTasks();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/timesheets/my-timesheets', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTimesheets(data.data);
      } else {
        setError(data.message || 'Failed to fetch timesheets');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks/my-tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Only allow tasks that are not completed (optional rule, but good practice)
        setTasks(data.data.filter(t => t.status !== 'Completed'));
      }
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'taskId') {
      const selectedTask = tasks.find(t => t._id === value);
      setFormData({ 
        ...formData, 
        taskId: value,
        projectId: selectedTask && selectedTask.projectId ? selectedTask.projectId._id : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ projectId: '', taskId: '', date: '', description: '', hoursWorked: '' });
    setShowModal(true);
  };

  const openEditModal = (t) => {
    setEditingId(t._id);
    setFormData({
      projectId: t.projectId ? t.projectId._id : '',
      taskId: t.taskId ? t.taskId._id : '',
      date: new Date(t.date).toISOString().split('T')[0],
      description: t.description,
      hoursWorked: t.hoursWorked
    });
    setShowModal(true);
  };

  const handleSubmitForm = async (e, actionType) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const url = editingId 
        ? `http://localhost:5000/api/timesheets/${editingId}`
        : 'http://localhost:5000/api/timesheets';
      
      const method = editingId ? 'PATCH' : 'POST';
      
      // If actionType is Submit, we handle that in the POST or via a separate call
      // Actually, if it's new, we can pass status: actionType
      const bodyData = { ...formData, hoursWorked: Number(formData.hoursWorked) };
      if (!editingId && actionType === 'Submitted') {
        bodyData.status = 'Submitted';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(bodyData)
      });
      
      const data = await res.json();
      if (res.ok) {
        // If we edited and wanted to immediately submit
        if (editingId && actionType === 'Submitted') {
          await submitTimesheet(editingId);
        } else {
          fetchTimesheets();
          setShowModal(false);
        }
      } else {
        setError(data.message || 'Failed to save timesheet');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitTimesheet = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/timesheets/${id}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (res.ok) {
        fetchTimesheets();
        setShowModal(false);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to submit timesheet');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    return <span className={`tm-badge tm-badge-${s}`}>{status}</span>;
  };

  if (loading) return <div className="tm-loading">Loading timesheets...</div>;

  const totalSubmitted = timesheets.filter(t => t.status === 'Submitted' || t.status === 'Approved' || t.status === 'Rejected').length;
  const pendingReview = timesheets.filter(t => t.status === 'Submitted').length;
  const approvedCount = timesheets.filter(t => t.status === 'Approved').length;
  const rejectedCount = timesheets.filter(t => t.status === 'Rejected').length;

  return (
    <div className="tm-container">
      <div className="tm-header">
        <div>
          <h2>My Timesheets</h2>
          <p className="tm-subtitle">Log and track your work hours</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add Timesheet
        </button>
      </div>

      <div className="tm-metrics">
        <div className="tm-metric-card">
          <div className="tm-metric-title">Total Logs</div>
          <div className="tm-metric-value">{totalSubmitted}</div>
        </div>
        <div className="tm-metric-card">
          <div className="tm-metric-title">Pending Review</div>
          <div className="tm-metric-value" style={{color: '#d97706'}}>{pendingReview}</div>
        </div>
        <div className="tm-metric-card">
          <div className="tm-metric-title">Approved</div>
          <div className="tm-metric-value" style={{color: '#16a34a'}}>{approvedCount}</div>
        </div>
        <div className="tm-metric-card">
          <div className="tm-metric-title">Rejected</div>
          <div className="tm-metric-value" style={{color: '#dc2626'}}>{rejectedCount}</div>
        </div>
      </div>

      {error && <div className="tm-alert-danger">{error}</div>}

      <div className="tm-card">
        <div className="tm-card-body">
          {timesheets.length === 0 ? (
            <p className="tm-empty">No timesheets recorded. Click "Add Timesheet" to log your hours.</p>
          ) : (
            <div className="tm-table-wrapper">
              <table className="tm-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Project</th>
                    <th>Task</th>
                    <th>Description</th>
                    <th>Hours</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheets.map(t => (
                    <tr key={t._id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(t.date).toLocaleDateString()}</td>
                      <td>{t.projectId ? t.projectId.name : '-'}</td>
                      <td>{t.taskId ? t.taskId.title : 'Deleted Task'}</td>
                      <td>
                        <div className="tm-task-desc">{t.description}</div>
                        {t.status === 'Rejected' && t.rejectionReason && (
                          <div className="tm-rejection-reason">Reason: {t.rejectionReason}</div>
                        )}
                      </td>
                      <td>{t.hoursWorked}h</td>
                      <td>{getStatusBadge(t.status)}</td>
                      <td>
                        {(t.status === 'Draft' || t.status === 'Rejected') ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="tm-btn-small" onClick={() => openEditModal(t)}>Edit</button>
                            {t.status === 'Draft' && (
                              <button className="tm-btn-small tm-btn-primary" onClick={() => submitTimesheet(t._id)}>Submit</button>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Locked</span>
                        )}
                      </td>
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
              <h3>{editingId ? 'Edit Timesheet' : 'Add Timesheet'}</h3>
              <button className="tm-modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="tm-modal-body">
              <div className="tm-form-group">
                <label>Task</label>
                <select name="taskId" required value={formData.taskId} onChange={handleInputChange}>
                  <option value="">Select Assigned Task</option>
                  {tasks.map(task => (
                    <option key={task._id} value={task._id}>{task.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="tm-form-row">
                <div className="tm-form-group">
                  <label>Date</label>
                  <input type="date" name="date" required value={formData.date} onChange={handleInputChange} />
                </div>
                <div className="tm-form-group">
                  <label>Hours Worked</label>
                  <input type="number" step="0.5" min="0" max="24" name="hoursWorked" required value={formData.hoursWorked} onChange={handleInputChange} />
                </div>
              </div>
              
              <div className="tm-form-group">
                <label>Work Description</label>
                <textarea name="description" required rows="3" value={formData.description} onChange={handleInputChange}></textarea>
              </div>
            </div>
            <div className="tm-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={(e) => handleSubmitForm(e, 'Draft')}
                disabled={isSubmitting}
              >
                Save Draft
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={(e) => handleSubmitForm(e, 'Submitted')}
                disabled={isSubmitting}
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTimesheets;
