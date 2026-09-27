import React, { useState, useEffect } from 'react';
import './LeaveApprovals.css';

const LeaveApprovals = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRole, setFilterRole] = useState('All');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchLeaves = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/leave/all', {
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (id, status) => {
    const isRejecting = status === 'Rejected';
    let rejectionReason = '';

    if (isRejecting) {
      rejectionReason = window.prompt('Please provide a reason for rejection (optional):');
      if (rejectionReason === null) return; // Cancelled
    }

    setActionLoading(id);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/leave/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ status, rejectionReason }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state to reflect change without full refetch
        setLeaves(leaves.map(l => l._id === id ? data.data : l));
      } else {
        setError(data.message || 'Failed to update leave status');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return <span className="la-badge la-badge-success">Approved</span>;
      case 'Rejected': return <span className="la-badge la-badge-danger">Rejected</span>;
      default: return <span className="la-badge la-badge-warning">Pending</span>;
    }
  };

  if (loading) {
    return <div className="la-loading">Loading leave requests...</div>;
  }

  return (
    <div className="la-container">
      <div className="la-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Leave Requests</h2>
        <div className="la-filters" style={{ display: 'flex', gap: '1rem' }}>
          <div className="la-filter">
            <label htmlFor="roleFilter" style={{ marginRight: '0.5rem', fontWeight: '500' }}>Role:</label>
            <select
              id="roleFilter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="All">All</option>
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="HRAdmin">HRAdmin</option>
            </select>
          </div>
          <div className="la-filter">
            <label htmlFor="statusFilter" style={{ marginRight: '0.5rem', fontWeight: '500' }}>Status:</label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="la-card" style={{ marginBottom: '1.5rem', background: '#f8fafc', borderLeft: '4px solid #3b82f6' }}>
        <div className="la-card-body" style={{ padding: '1rem 1.5rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: '#1e293b', fontSize: '1.1rem', fontWeight: 'bold' }}>Leave Policy Overview</div>
          <div>Employees are entitled to a total of 20 days of regular leave per financial year, credited quarterly:</div>
          <div style={{ paddingLeft: '1.5rem' }}>
            <div>Earned Leave / Annual Leave: 10 days (2.5 days per quarter)</div>
            <div>Sick Leave: 6 days (1.5 days per quarter)</div>
            <div>Casual Leave: 4 days (1 day per quarter)</div>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Note: Special leaves (Maternity, Marriage, Bereavement, Compensatory Off) are granted based on eligibility and do not deduct from the standard annual quota.
          </div>
        </div>
      </div>

      {error && <div className="la-alert la-alert-danger">{error}</div>}

      <div className="la-card">
        <div className="la-card-body">
          {leaves.length === 0 ? (
            <p className="la-text-muted">No leave requests found.</p>
          ) : (
            <div className="la-table-responsive">
              <table className="la-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves
                    .filter(leave => {
                      const statusMatch = filterStatus === 'All' || leave.status === filterStatus;
                      const roleMatch = filterRole === 'All' || (leave.userId && leave.userId.role === filterRole);
                      return statusMatch && roleMatch;
                    })
                    .map((leave) => {
                      const employeeName = leave.userId ? `${leave.userId.firstName} ${leave.userId.lastName}` : 'Unknown User';

                      return (
                        <tr key={leave._id}>
                          <td>
                            <div className="la-emp-name">{employeeName}</div>
                            {leave.userId && leave.userId.email && (
                              <div className="la-emp-dept" style={{ fontSize: '0.85rem', color: '#6b7280' }}>{leave.userId.email}</div>
                            )}
                          </td>
                          <td>
                            <span style={{ fontWeight: '500', color: '#374151' }}>
                              {leave.userId ? leave.userId.role : 'N/A'}
                            </span>
                          </td>
                          <td>{leave.leaveType}</td>
                          <td>
                            <div className="la-date">{new Date(leave.startDate).toLocaleDateString()}</div>
                            <div className="la-date">to {new Date(leave.endDate).toLocaleDateString()}</div>
                          </td>
                          <td>{leave.numberOfDays}</td>
                          <td>
                            <div className="la-truncate" title={leave.reason}>{leave.reason}</div>
                            {leave.relationship && (
                              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>
                                <strong>Rel:</strong> {leave.relationship}
                              </div>
                            )}
                            {leave.documentUrl && (
                              <div style={{ marginTop: '4px' }}>
                                <a href={`http://localhost:5000${leave.documentUrl}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'underline' }}>
                                  View Doc
                                </a>
                              </div>
                            )}
                          </td>
                          <td>{getStatusBadge(leave.status)}</td>
                          <td>
                            {leave.status === 'Pending' ? (
                              leave.userId && leave.userId._id === currentUser._id ? (
                                <span className="la-text-muted">Your Leave</span>
                              ) : (
                                <div className="la-actions">
                                  <button
                                    className="la-btn la-btn-success"
                                    onClick={() => handleAction(leave._id, 'Approved')}
                                    disabled={actionLoading === leave._id}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="la-btn la-btn-danger"
                                    onClick={() => handleAction(leave._id, 'Rejected')}
                                    disabled={actionLoading === leave._id}
                                  >
                                    Reject
                                  </button>
                                </div>
                              )
                            ) : (
                              <span className="la-text-muted">-</span>
                            )}
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
    </div>
  );
};

export default LeaveApprovals;
