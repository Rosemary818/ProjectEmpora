import React, { useState, useEffect } from 'react';
import './PromotionManagement.css';

const ManagerPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  // Proposal Modal State
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    employeeId: '',
    proposedDesignation: '',
    reason: '',
    managerRemarks: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

      const [promoRes, usersRes] = await Promise.all([
        fetch('http://localhost:5000/api/promotions/team', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
        fetch('http://localhost:5000/api/user/my-team', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
      ]);

      setPromotions(promoRes.data || []);
      setTeamMembers(usersRes.data || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const selectedEmployee = teamMembers.find(m => m._id === formData.employeeId);
    
    if (!formData.proposedDesignation.trim()) {
      setError('Proposed designation is required.');
      return;
    }

    if (selectedEmployee && selectedEmployee.designationName && 
        selectedEmployee.designationName.trim().toLowerCase() === formData.proposedDesignation.trim().toLowerCase()) {
      setError('Proposed designation must be different from the current designation.');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:5000/api/promotions/proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit proposal');

      setProposalModalOpen(false);
      setFormData({
        employeeId: '',
        proposedDesignation: '',
        reason: '',
        managerRemarks: ''
      });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this promotion proposal?')) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:5000/api/promotions/${id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel proposal');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to cancel proposal');
    }
  };

  const filteredPromotions = filter === 'All'
    ? promotions
    : promotions.filter(p => p.status === filter);

  const stats = {
    pending: promotions.filter(p => p.status === 'Pending HR Review').length,
    approved: promotions.filter(p => p.status === 'Approved').length,
    effective: promotions.filter(p => p.status === 'Effective').length
  };

  const selectedEmployee = teamMembers.find(m => m._id === formData.employeeId);

  if (loading) return <div>Loading promotions...</div>;

  return (
    <div className="promo-container">
      <div className="promo-header">
        <h2>Team Promotions</h2>
        <button
          className="promo-btn-primary"
          onClick={() => {
            setError('');
            setProposalModalOpen(true);
          }}
        >
          <span>+</span> New Proposal
        </button>
      </div>

      <div className="promo-stats-grid">
        <div className="promo-stat-card">
          <div className="promo-stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706', fontSize: '1.5rem' }}>
            🕒
          </div>
          <div className="promo-stat-info">
            <h3>Pending HR Review</h3>
            <p>{stats.pending}</p>
          </div>
        </div>
        <div className="promo-stat-card">
          <div className="promo-stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669', fontSize: '1.5rem' }}>
            ✅
          </div>
          <div className="promo-stat-info">
            <h3>Approved</h3>
            <p>{stats.approved}</p>
          </div>
        </div>
      </div>

      <div className="promo-table-container">
        <div className="promo-table-header">
          <h3>My Team Proposals</h3>
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
                  <td>{promo.currentDesignationId?.designationName}</td>
                  <td style={{ fontWeight: 500, color: '#388087' }}>{promo.proposedDesignationId?.designationName}</td>
                  <td>{promo.effectiveDate ? new Date(promo.effectiveDate).toLocaleDateString() : 'Pending'}</td>
                  <td>
                    <span className={`promo-status-badge promo-status-${promo.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {promo.status}
                    </span>
                  </td>
                  <td>
                    {promo.status === 'Pending HR Review' && (
                      <button
                        className="promo-action-btn danger"
                        onClick={() => handleCancel(promo._id)}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  No promotion proposals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {proposalModalOpen && (
        <div className="promo-modal-overlay">
          <div className="promo-modal">
            <div className="promo-modal-header">
              <h2>New Promotion Proposal</h2>
              <button className="promo-close-btn" onClick={() => setProposalModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleProposalSubmit}>
              <div className="promo-modal-body">
                {error && <div className="promo-error-msg">{error}</div>}

                <div className="promo-form-group">
                  <label>Select Employee *</label>
                  <select 
                    className="promo-select" 
                    name="employeeId"
                    style={{ width: '100%' }}
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">{teamMembers.length > 0 ? "Select a team member" : "Loading team members..."}</option>
                    {teamMembers.length === 0 && !loading && (
                       <option value="" disabled>No team members are currently assigned to you.</option>
                    )}
                    {teamMembers.map(member => (
                      <option key={member._id} value={member._id}>
                        {member.firstName} {member.lastName} ({member.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEmployee && (
                  <div className="promo-details-grid">
                    <div className="promo-detail-item">
                      <span className="promo-detail-label">Current Designation</span>
                      <span className="promo-detail-value">{selectedEmployee.designationName || 'Not assigned'}</span>
                    </div>
                    <div className="promo-detail-item">
                      <span className="promo-detail-label">Department</span>
                      <span className="promo-detail-value">{selectedEmployee.departmentName || 'Not assigned'}</span>
                    </div>
                  </div>
                )}

                <div className="promo-form-group">
                  <label>Proposed Designation *</label>
                  <input
                    type="text"
                    className="promo-input"
                    name="proposedDesignation"
                    style={{ width: '100%' }}
                    value={formData.proposedDesignation}
                    onChange={handleInputChange}
                    placeholder="Enter proposed designation"
                    required
                  />
                </div>



                <div className="promo-form-group">
                  <label>Reason for Promotion *</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed justification for this promotion..."
                    required
                  />
                </div>

                <div className="promo-form-group">
                  <label>Additional Remarks</label>
                  <textarea
                    name="managerRemarks"
                    value={formData.managerRemarks}
                    onChange={handleInputChange}
                    placeholder="Any additional notes for HR..."
                  />
                </div>
              </div>

              <div className="promo-modal-footer">
                <button
                  type="button"
                  className="promo-btn-secondary"
                  onClick={() => setProposalModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="promo-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerPromotions;
