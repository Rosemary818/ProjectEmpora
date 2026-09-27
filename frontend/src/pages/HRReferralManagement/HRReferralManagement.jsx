import React, { useState, useEffect } from 'react';

import './HRReferralManagement.css';

const HRReferralManagement = () => {
  const [referrals, setReferrals] = useState([]);
  const [summary, setSummary] = useState({ 
    totalReferrals: 0, pendingReview: 0, underReview: 0, 
    shortlisted: 0, interviewScheduled: 0, hired: 0 
  });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Convert to Employee modal
  const [convertingReferral, setConvertingReferral] = useState(null);
  const [convertData, setConvertData] = useState(null);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/referrals/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch');
      setReferrals(data.data.referrals);
      setSummary(data.data.summary);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      showToast(error.message || 'Failed to load referrals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/referrals/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Failed to update status');
      showToast(`Status updated to ${newStatus}`);
      fetchReferrals();
    } catch (error) {
      showToast(error.message || 'Failed to update status', 'error');
    }
  };

  const convertToEmployee = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/referrals/${id}/convert`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Failed to convert to employee');
      
      setConvertData({ ...data.data, emailSent: data.emailSent, referralId: id });
      fetchReferrals();
    } catch (error) {
      showToast(error.message || 'Failed to convert to employee', 'error');
      setConvertingReferral(null);
    }
  };

  const resendEmail = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/referrals/${id}/resend-welcome`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Failed to resend welcome email');
      
      setConvertData(prev => ({ ...prev, emailSent: true }));
      showToast('Welcome email resent successfully!');
    } catch (error) {
      showToast(error.message || 'Failed to resend welcome email', 'error');
    }
  };

  const deleteReferral = async (id) => {
    if (window.confirm('Are you sure you want to delete this referral?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/referrals/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || data.message || 'Failed to delete referral');
        showToast('Referral deleted successfully');
        fetchReferrals();
      } catch (error) {
        showToast(error.message || 'Failed to delete referral', 'error');
      }
    }
  };

  const downloadResume = (resumePath) => {
    window.open(`http://localhost:5000${resumePath}`, '_blank');
  };

  const filteredReferrals = referrals.filter(ref => {
    const matchesSearch = ref.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ref.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || ref.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="hr-referrals-container">
      {toastMessage && (
        <div className={`toast-notification ${toastMessage.type}`}>
          {toastMessage.message}
        </div>
      )}

      <div className="referrals-header">
        <h2>Referral Management</h2>
      </div>

      <div className="referrals-dashboard-cards hr-cards">
        <div className="dashboard-card">
          <h3>Total Referrals</h3>
          <p className="card-value">{summary.totalReferrals}</p>
        </div>
        <div className="dashboard-card pending-card">
          <h3>Pending Review</h3>
          <p className="card-value">{summary.pendingReview}</p>
        </div>
        <div className="dashboard-card under-review-card">
          <h3>Under Review</h3>
          <p className="card-value">{summary.underReview}</p>
        </div>
        <div className="dashboard-card shortlisted-card">
          <h3>Shortlisted</h3>
          <p className="card-value">{summary.shortlisted}</p>
        </div>
        <div className="dashboard-card interviews-card">
          <h3>Interviews</h3>
          <p className="card-value">{summary.interviewScheduled}</p>
        </div>
        <div className="dashboard-card hired-card">
          <h3>Hired</h3>
          <p className="card-value">{summary.hired}</p>
        </div>
      </div>

      <div className="management-section">
        <div className="management-controls">
          <input 
            type="text" 
            placeholder="Search candidate or position..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="status-filter">
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Hired">Hired</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="referrals-table hr-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Position</th>
                <th>Referred By</th>
                <th>Status</th>
                <th>Resume</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-referrals">No referrals found matching criteria.</td>
                </tr>
              ) : (
                filteredReferrals.map(ref => (
                  <tr key={ref._id}>
                    <td>
                      <div className="candidate-info">
                        <strong>{ref.candidateName}</strong>
                        <span className="candidate-email">{ref.email}</span>
                      </div>
                    </td>
                    <td>{ref.position} <br/><span className="dept-text">{ref.department}</span></td>
                    <td>{ref.referredBy?.firstName} {ref.referredBy?.lastName}</td>
                    <td>
                      <select 
                        value={ref.status} 
                        onChange={(e) => updateStatus(ref._id, e.target.value)}
                        className={`status-select ${ref.status.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview Scheduled">Interview</option>
                        <option value="Selected">Selected</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Converted" disabled>Converted</option>
                      </select>
                    </td>
                    <td>
                      <button className="text-btn" onClick={() => downloadResume(ref.resume)}>
                        Download
                      </button>
                    </td>
                    <td className="actions-cell">
                      {ref.status === 'Hired' && !ref.convertedToEmployee && (
                        <button className="action-btn convert-btn" onClick={() => setConvertingReferral(ref)}>
                          Convert to Employee
                        </button>
                      )}
                      {ref.convertedToEmployee && (
                        <span className="converted-badge">Employee Created</span>
                      )}
                      {!ref.convertedToEmployee && (
                        <button className="action-btn delete-btn" onClick={() => deleteReferral(ref._id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {convertingReferral && (
        <div className="modal-overlay">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h2>Convert to Employee</h2>
              <button className="close-btn" onClick={() => setConvertingReferral(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to create an employee account for <strong>{convertingReferral.candidateName}</strong>?</p>
              <div className="modal-actions">
                <button className="secondary-btn" onClick={() => setConvertingReferral(null)}>Cancel</button>
                <button className="primary-btn convert-confirm" onClick={() => {
                  convertToEmployee(convertingReferral._id);
                  setConvertingReferral(null);
                }}>Confirm Creation</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {convertData && (
        <div className="modal-overlay">
          <div className="modal-content success-modal">
            <div className="modal-header">
              <h2>{convertData.emailSent ? 'Employee Created Successfully' : 'Employee Created (Email Failed)'}</h2>
              <button className="close-btn" onClick={() => setConvertData(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="success-icon">✓</div>
              <p>Employee account successfully generated!</p>
              
              {convertData.emailSent ? (
                <p className="success-text" style={{ color: '#059669', marginBottom: '1rem' }}>
                  Welcome email sent to: <strong>{convertData.employee.email}</strong>
                </p>
              ) : (
                <p className="error-text" style={{ color: '#dc2626', marginBottom: '1rem' }}>
                  Employee created successfully, but the welcome email could not be sent.
                </p>
              )}

              <div className="credentials-box">
                <p><strong>Employee ID:</strong> {convertData.employee.employeeCode}</p>
                <p><strong>Email:</strong> {convertData.employee.email}</p>
              </div>
              
              <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                {!convertData.emailSent && (
                  <button className="secondary-btn" onClick={() => resendEmail(convertData.referralId)}>
                    Resend Welcome Email
                  </button>
                )}
                <button className="primary-btn" onClick={() => setConvertData(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HRReferralManagement;
