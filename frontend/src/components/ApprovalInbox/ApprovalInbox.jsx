import React, { useState, useEffect } from 'react';
import './ApprovalInbox.css';

const ApprovalInbox = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // State for rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/approvals/inbox', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch approvals');
      }
      setApprovals(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching approvals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (approval, actionType, reason = '') => {
    try {
      setIsProcessing(true);
      const payload = {
        [approval.payloadKey]: actionType === 'approve' ? approval.approveValue : approval.rejectValue,
        ...(approval.extraPayload || {})
      };
      
      if (actionType === 'reject' && reason && approval.reasonKey) {
        payload[approval.reasonKey] = reason;
      }

      const res = await fetch(`http://localhost:5000${approval.apiPath}`, {
        method: approval.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Action failed');
      }

      // Remove from list
      setApprovals(approvals.filter(a => a._id !== approval._id));
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedApproval(null);
    } catch (err) {
      console.error('Action error:', err);
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectModal = (approval) => {
    setSelectedApproval(approval);
    setShowRejectModal(true);
  };

  const categories = ['All', ...new Set(approvals.map(a => a.category))];
  
  const filteredApprovals = activeCategory === 'All' 
    ? approvals 
    : approvals.filter(a => a.category === activeCategory);

  const getCategoryCount = (cat) => {
    if (cat === 'All') return approvals.length;
    return approvals.filter(a => a.category === cat).length;
  };

  if (loading) return <div className="inbox-loading">Loading Approval Inbox...</div>;
  if (error) return <div className="inbox-error">Error: {error}</div>;

  return (
    <div className="approval-inbox-container">
      <div className="inbox-header">
        <h2>Approval Inbox</h2>
        <p className="inbox-subtitle">Manage all pending approvals from one centralized place.</p>
      </div>

      <div className="inbox-summary-cards">
        <div className="summary-card total">
          <h3>Pending Approvals</h3>
          <p className="count">{approvals.length}</p>
        </div>
      </div>

      <div className="inbox-tabs">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat} <span className="tab-count">{getCategoryCount(cat)}</span>
          </button>
        ))}
      </div>

      <div className="inbox-list">
        {filteredApprovals.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <p>You're all caught up! No pending approvals.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="inbox-table">
              <thead>
                <tr>
                  <th>Request Type</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Submitted Date</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApprovals.map(item => (
                  <tr key={`${item.category}-${item._id}`}>
                    <td>
                      <span className="request-type-badge">{item.type}</span>
                    </td>
                    <td>
                      <div className="employee-info">
                        <strong>{item.employee?.firstName} {item.employee?.lastName}</strong>
                        <span className="emp-id">({item.employee?.employeeCode || 'N/A'})</span>
                      </div>
                    </td>
                    <td>{item.employee?.department || 'N/A'}</td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td className="details-col">{item.details}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-approve" 
                          onClick={() => handleAction(item, 'approve')}
                          disabled={isProcessing}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn-reject" 
                          onClick={() => openRejectModal(item)}
                          disabled={isProcessing}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Reject {selectedApproval?.type}</h3>
            <p>Please provide a reason for rejecting this request.</p>
            <textarea
              className="reject-reason-input"
              rows="4"
              placeholder="Reason for rejection (optional but recommended)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            ></textarea>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}>Cancel</button>
              <button 
                className="btn-confirm-reject" 
                onClick={() => handleAction(selectedApproval, 'reject', rejectionReason)}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalInbox;
