import React, { useState, useEffect } from 'react';
import './LeaveManagement.css';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchLeaves = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/leave', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setLeaves(data.data);
      } else {
        setError(data.message || 'Failed to fetch leaves');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowForm(false);
        setFormData({ leaveType: 'Casual Leave', startDate: '', endDate: '', reason: '' });
        fetchLeaves();
      } else {
        setError(data.error || data.message || 'Failed to submit leave request');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return <span className="lm-badge lm-badge-success">Approved</span>;
      case 'Rejected': return <span className="lm-badge lm-badge-danger">Rejected</span>;
      default: return <span className="lm-badge lm-badge-warning">Pending</span>;
    }
  };

  return (
    <div className="lm-container">
      <div className="lm-header">
        <h2>Leave Management</h2>
        <button className="lm-btn lm-btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Apply for Leave'}
        </button>
      </div>

      {error && <div className="lm-alert lm-alert-danger">{error}</div>}

      {showForm && (
        <div className="lm-card">
          <div className="lm-card-header">
            <h3>Apply for Leave</h3>
          </div>
          <div className="lm-card-body">
            <form onSubmit={handleSubmit} className="lm-form">
              <div className="lm-form-group">
                <label>Leave Type</label>
                <select name="leaveType" value={formData.leaveType} onChange={handleChange} required>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Other Leave">Other Leave</option>
                </select>
              </div>
              <div className="lm-form-row">
                <div className="lm-form-group">
                  <label>Start Date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                </div>
                <div className="lm-form-group">
                  <label>End Date</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
                </div>
              </div>
              <div className="lm-form-group">
                <label>Reason</label>
                <textarea name="reason" rows="3" value={formData.reason} onChange={handleChange} required placeholder="Please provide a reason..."></textarea>
              </div>
              <button type="submit" className="lm-btn lm-btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="lm-card lm-mt-4">
        <div className="lm-card-header">
          <h3>Leave History</h3>
        </div>
        <div className="lm-card-body">
          {fetching ? (
            <p>Loading...</p>
          ) : leaves.length === 0 ? (
            <p className="lm-text-muted">No leave requests found.</p>
          ) : (
            <div className="lm-table-responsive">
              <table className="lm-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>{leave.leaveType}</td>
                      <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                      <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                      <td>{leave.numberOfDays}</td>
                      <td>
                        <span className="lm-truncate" title={leave.reason}>{leave.reason}</span>
                      </td>
                      <td>
                        {getStatusBadge(leave.status)}
                        {leave.status === 'Rejected' && leave.rejectionReason && (
                          <div className="lm-rejection-reason" title={leave.rejectionReason}>
                            Info
                          </div>
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
    </div>
  );
};

export default LeaveManagement;
