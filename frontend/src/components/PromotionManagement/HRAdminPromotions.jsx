import React, { useState, useEffect } from 'react';
import './PromotionManagement.css';

const HRAdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState('Approve'); // 'Approve' | 'Reject'
  const [hrRemarks, setHrRemarks] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');

  const fetchPromotions = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:5000/api/promotions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setPromotions(data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch promotions');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (reviewAction === 'Approve' && !effectiveDate) {
      setError('Effective date is required for approval.');
      return;
    }

    if (reviewAction === 'Reject' && !hrRemarks) {
      setError('Remarks are required for rejection.');
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:5000/api/promotions/${selectedPromo._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: reviewAction === 'Approve' ? 'Approved' : 'Rejected',
          hrRemarks,
          effectiveDate: reviewAction === 'Approve' ? effectiveDate : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update promotion status');

      setReviewModalOpen(false);
      fetchPromotions();
    } catch (err) {
      setError(err.message || 'Failed to update promotion status');
    }
  };

  const openReviewModal = (promo, action) => {
    setSelectedPromo(promo);
    setReviewAction(action);
    setHrRemarks('');
    setEffectiveDate(promo.effectiveDate ? promo.effectiveDate.split('T')[0] : '');
    setError('');
    setReviewModalOpen(true);
  };

  const filteredPromotions = filter === 'All'
    ? promotions
    : promotions.filter(p => p.status === filter);

  const stats = {
    pending: promotions.filter(p => p.status === 'Pending HR Review').length,
    approved: promotions.filter(p => p.status === 'Approved').length,
    effective: promotions.filter(p => p.status === 'Effective').length
  };

  if (loading) return <div>Loading promotions...</div>;

  return (
    <div className="promo-container">
      <div className="promo-header">
        <h2>Promotion Management</h2>
      </div>

      <div className="promo-stats-grid">
        <div className="promo-stat-card">
          <div className="promo-stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706', fontSize: '1.5rem' }}>
            🕒
          </div>
          <div className="promo-stat-info">
            <h3>Pending Review</h3>
            <p>{stats.pending}</p>
          </div>
        </div>
        <div className="promo-stat-card">
          <div className="promo-stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669', fontSize: '1.5rem' }}>
            ✅
          </div>
          <div className="promo-stat-info">
            <h3>Approved (Future)</h3>
            <p>{stats.approved}</p>
          </div>
        </div>
        <div className="promo-stat-card">
          <div className="promo-stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', fontSize: '1.5rem' }}>
            💼
          </div>
          <div className="promo-stat-info">
            <h3>Effective Promotions</h3>
            <p>{stats.effective}</p>
          </div>
        </div>
      </div>

      <div className="promo-table-container">
        <div className="promo-table-header">
          <h3>All Proposals</h3>
          <div className="promo-filters">
            <select
              className="promo-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending HR Review">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Effective">Effective</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <table className="promo-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Current Role</th>
              <th>Proposed Role</th>
              <th>Proposed Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromotions.length > 0 ? (
              filteredPromotions.map((promo) => (
                <tr key={promo._id}>
                  <td>
                    <div className="promo-employee-cell">
                      <div className="promo-avatar">
                        {promo.employeeId?.profileImage ? (
                          <img src={`http://localhost:5000/${promo.employeeId.profileImage}`} alt="profile" />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{promo.employeeId?.firstName} {promo.employeeId?.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{promo.employeeId?.employeeCode}</div>
                      </div>
                    </div>
                  </td>
                  <td>{promo.departmentId?.departmentName}</td>
                  <td>{promo.currentDesignationId?.designationName}</td>
                  <td style={{ fontWeight: 500, color: '#388087' }}>{promo.proposedDesignationId?.designationName}</td>
                  <td>{promo.effectiveDate ? new Date(promo.effectiveDate).toLocaleDateString() : 'Pending'}</td>
                  <td>
                    <span className={`promo-status-badge promo-status-${promo.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {promo.status}
                    </span>
                  </td>
                  <td>
                    {promo.status === 'Pending HR Review' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="promo-action-btn"
                          onClick={() => openReviewModal(promo, 'Approve')}
                        >
                          Approve
                        </button>
                        <button
                          className="promo-action-btn danger"
                          onClick={() => openReviewModal(promo, 'Reject')}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        Reviewed
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  No promotions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {reviewModalOpen && selectedPromo && (
        <div className="promo-modal-overlay">
          <div className="promo-modal">
            <div className="promo-modal-header">
              <h2>{reviewAction} Promotion</h2>
              <button className="promo-close-btn" onClick={() => setReviewModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div className="promo-modal-body">
                {error && <div className="promo-error-msg">{error}</div>}

                <div className="promo-details-grid">
                  <div className="promo-detail-item">
                    <span className="promo-detail-label">Employee</span>
                    <span className="promo-detail-value">
                      {selectedPromo.employeeId?.firstName} {selectedPromo.employeeId?.lastName}
                    </span>
                  </div>
                  <div className="promo-detail-item">
                    <span className="promo-detail-label">Proposed By</span>
                    <span className="promo-detail-value">
                      {selectedPromo.proposedBy?.firstName} {selectedPromo.proposedBy?.lastName}
                    </span>
                  </div>
                  <div className="promo-detail-item">
                    <span className="promo-detail-label">Current Designation</span>
                    <span className="promo-detail-value">{selectedPromo.currentDesignationId?.designationName}</span>
                  </div>
                  <div className="promo-detail-item">
                    <span className="promo-detail-label">Proposed Designation</span>
                    <span className="promo-detail-value" style={{ color: '#388087', fontWeight: 600 }}>
                      {selectedPromo.proposedDesignationId?.designationName}
                    </span>
                  </div>
                </div>

                <div className="promo-form-group">
                  <label>Manager's Reason / Remarks</label>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '4px', border: '1px solid #e5e7eb', fontSize: '0.875rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 500 }}>Reason: {selectedPromo.reason}</p>
                    {selectedPromo.managerRemarks && (
                      <p style={{ margin: 0, color: '#4b5563' }}>Remarks: {selectedPromo.managerRemarks}</p>
                    )}
                  </div>
                </div>

                {reviewAction === 'Approve' && (
                  <div className="promo-form-group">
                    <label>Approved Effective Date</label>
                    <input
                      type="date"
                      className="promo-input"
                      style={{ width: '100%' }}
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      required
                    />
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      The employee's title will be automatically updated on this date.
                    </p>
                  </div>
                )}

                <div className="promo-form-group">
                  <label>HR Remarks {reviewAction === 'Reject' && '*'}</label>
                  <textarea
                    value={hrRemarks}
                    onChange={(e) => setHrRemarks(e.target.value)}
                    placeholder={`Enter remarks for ${reviewAction.toLowerCase()}...`}
                    required={reviewAction === 'Reject'}
                  />
                </div>
              </div>

              <div className="promo-modal-footer">
                <button
                  type="button"
                  className="promo-btn-secondary"
                  onClick={() => setReviewModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={reviewAction === 'Approve' ? 'promo-btn-primary' : 'promo-btn-danger'}
                >
                  {reviewAction} Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRAdminPromotions;
