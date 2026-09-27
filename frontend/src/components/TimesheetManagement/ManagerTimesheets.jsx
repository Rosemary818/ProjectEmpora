import React, { useState, useEffect } from 'react';
import './TimesheetManagement.css';

const ManagerTimesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/timesheets/team', {
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

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this timesheet?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/timesheets/${id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: 'Approved' })
      });
      if (res.ok) {
        fetchTimesheets();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to approve');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const openRejectModal = (id) => {
    setRejectingId(id);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const submitReject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`http://localhost:5000/api/timesheets/${rejectingId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: 'Rejected', rejectionReason })
      });
      if (res.ok) {
        fetchTimesheets();
        setShowRejectModal(false);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to reject');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    return <span className={`tm-badge tm-badge-${s}`}>{status}</span>;
  };

  if (loading) return <div className="tm-loading">Loading team timesheets...</div>;

  const pendingCount = timesheets.filter(t => t.status === 'Submitted').length;
  const approvedCount = timesheets.filter(t => t.status === 'Approved').length;
  const rejectedCount = timesheets.filter(t => t.status === 'Rejected').length;

  return (
    <div className="tm-container">
      <div className="tm-header">
        <div>
          <h2>Timesheet Review</h2>
          <p className="tm-subtitle">Review and approve team timesheets</p>
        </div>
      </div>

      <div className="tm-metrics">
        <div className="tm-metric-card">
          <div className="tm-metric-title">Pending Review</div>
          <div className="tm-metric-value" style={{color: '#d97706'}}>{pendingCount}</div>
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
            <p className="tm-empty">No timesheets submitted for review yet.</p>
          ) : (
            <div className="tm-table-wrapper">
              <table className="tm-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Project</th>
                    <th>Task</th>
                    <th>Date</th>
                    <th>Work Description</th>
                    <th>Hours</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheets.map(t => (
                    <tr key={t._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                            {t.employeeId ? `${t.employeeId.firstName[0]}${t.employeeId.lastName[0]}` : '?'}
                          </div>
                          <span>{t.employeeId ? `${t.employeeId.firstName} ${t.employeeId.lastName}` : 'Unknown'}</span>
                        </div>
                      </td>
                      <td>{t.projectId ? t.projectId.name : '-'}</td>
                      <td>{t.taskId ? t.taskId.title : 'Deleted Task'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(t.date).toLocaleDateString()}</td>
                      <td>
                        <div className="tm-task-desc">{t.description}</div>
                        {t.status === 'Rejected' && t.rejectionReason && (
                          <div className="tm-rejection-reason">Reason: {t.rejectionReason}</div>
                        )}
                      </td>
                      <td>{t.hoursWorked}h</td>
                      <td>{getStatusBadge(t.status)}</td>
                      <td>
                        {t.status === 'Submitted' ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="tm-btn-small tm-btn-primary" onClick={() => handleApprove(t._id)}>Approve</button>
                            <button className="tm-btn-small tm-btn-danger" onClick={() => openRejectModal(t._id)}>Reject</button>
                          </div>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Reviewed</span>
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

      {showRejectModal && (
        <div className="tm-modal-overlay">
          <div className="tm-modal">
            <div className="tm-modal-header">
              <h3>Reject Timesheet</h3>
              <button className="tm-modal-close" onClick={() => setShowRejectModal(false)}>&times;</button>
            </div>
            <form onSubmit={submitReject} className="tm-modal-body">
              <div className="tm-form-group">
                <label>Rejection Reason</label>
                <textarea 
                  required 
                  rows="3" 
                  value={rejectionReason} 
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this timesheet is being rejected..."
                ></textarea>
              </div>
              <div className="tm-modal-footer" style={{ borderTop: 'none', padding: '1.25rem 0 0 0' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
                <button type="submit" className="tm-btn-small tm-btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Rejecting...' : 'Reject Timesheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTimesheets;
