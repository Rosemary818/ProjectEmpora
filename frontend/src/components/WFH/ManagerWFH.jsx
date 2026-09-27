import React, { useState, useEffect } from 'react';
import './WFH.css';

const ManagerWFH = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [action, setAction] = useState(''); // 'Approved' or 'Rejected'
  const [managerComment, setManagerComment] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/wfh/team', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching WFH requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (req, act) => {
    setSelectedRequest(req);
    setAction(act);
    setManagerComment('');
    setSubmitError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const handleStatusUpdate = async () => {
    if (action === 'Rejected' && !managerComment.trim()) {
      setSubmitError('Please provide a reason for rejection.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/wfh/${selectedRequest._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: action, managerComment })
      });
      const data = await res.json();

      if (data.success) {
        fetchRequests(); // Refresh the list
        closeModal();
      } else {
        setSubmitError(data.message || 'Failed to update status.');
      }
    } catch (error) {
      console.error('Error updating WFH request:', error);
      setSubmitError('Server error while updating request.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const pendingRequests = requests.filter(req => req.status === 'Pending');
  const historyRequests = requests.filter(req => req.status !== 'Pending');

  if (loading) {
    return <div className="wfh-loading">Loading WFH module...</div>;
  }

  return (
    <div className="wfh-container">
      <div className="wfh-header">
        <h2>Team WFH Requests</h2>
        <p>Review and manage Work From Home requests from your team members.</p>
      </div>

      <div className="wfh-card">
        <div className="wfh-card-header">
          <h3>Pending Approvals</h3>
        </div>
        <div className="wfh-card-body">
          {pendingRequests.length === 0 ? (
            <p className="wfh-empty">No pending WFH requests.</p>
          ) : (
            <div className="wfh-list">
              {pendingRequests.map(req => (
                <div key={req._id} className="wfh-list-item">
                  <div className="wfh-item-details">
                    <span className="wfh-employee">{req.employee?.firstName} {req.employee?.lastName} ({req.employee?.email})</span>
                    <span className="wfh-dates">{formatDate(req.fromDate)} - {formatDate(req.toDate)}</span>
                    <span className="wfh-reason">{req.reason}</span>
                  </div>
                  <div className="wfh-item-actions">
                    <button className="wfh-btn wfh-btn-primary" style={{ marginRight: '0.5rem' }} onClick={() => openModal(req, 'Approved')}>Approve</button>
                    <button className="wfh-btn wfh-btn-danger" onClick={() => openModal(req, 'Rejected')}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="wfh-card wfh-mt-4">
        <div className="wfh-card-header">
          <h3>WFH History</h3>
        </div>
        <div className="wfh-card-body">
          {historyRequests.length === 0 ? (
            <p className="wfh-empty">No WFH history found.</p>
          ) : (
            <div className="wfh-table-responsive">
              <table className="wfh-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Your Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRequests.map(req => (
                    <tr key={req._id}>
                      <td>{req.employee?.firstName} {req.employee?.lastName}</td>
                      <td>{formatDate(req.fromDate)} to {formatDate(req.toDate)}</td>
                      <td>{req.reason}</td>
                      <td>
                        <span className={`wfh-badge badge-${req.status.toLowerCase()}`}>{req.status}</span>
                      </td>
                      <td>{req.managerComment || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="wfh-modal-overlay">
          <div className="wfh-modal">
            <h3>{action === 'Approved' ? 'Approve Request' : 'Reject Request'}</h3>
            <p>
              Are you sure you want to {action.toLowerCase()} the WFH request for 
              <strong> {selectedRequest?.employee?.firstName} {selectedRequest?.employee?.lastName}</strong> 
              ({formatDate(selectedRequest?.fromDate)} - {formatDate(selectedRequest?.toDate)})?
            </p>
            
            <div className="wfh-form-group">
              <label>Comment {action === 'Rejected' && <span className="text-danger">*</span>}</label>
              <textarea
                rows="3"
                value={managerComment}
                onChange={(e) => setManagerComment(e.target.value)}
                placeholder="Optional comment..."
              ></textarea>
            </div>

            {submitError && <div className="wfh-alert wfh-alert-danger">{submitError}</div>}

            <div className="wfh-modal-actions">
              <button className="wfh-btn wfh-btn-secondary" onClick={closeModal}>Cancel</button>
              <button 
                className={`wfh-btn ${action === 'Approved' ? 'wfh-btn-primary' : 'wfh-btn-danger'}`} 
                onClick={handleStatusUpdate}
              >
                Confirm {action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerWFH;
