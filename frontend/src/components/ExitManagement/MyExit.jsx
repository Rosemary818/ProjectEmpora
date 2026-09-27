import React, { useState, useEffect } from 'react';
import './ExitManagement.css';

const MyExit = () => {
  const [activeRequest, setActiveRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    resignationDate: new Date().toISOString().split('T')[0],
    proposedLastWorkingDate: '',
    reason: '',
    comments: ''
  });

  useEffect(() => {
    fetchMyResignation();
  }, []);

  const fetchMyResignation = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/exits/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Find the active request (not completed/rejected/cancelled)
        const active = data.data.find(req => !['Completed', 'Rejected', 'Cancelled'].includes(req.status));
        setActiveRequest(active || (data.data.length > 0 ? data.data[0] : null));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch resignation data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/exits', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setActiveRequest(data.data);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to submit resignation.');
    }
  };

  const getStatusBadgeClass = (status) => {
    const map = {
      'Submitted': 'badge-submitted',
      'Manager Review': 'badge-manager',
      'HR Review': 'badge-hr',
      'Notice Period': 'badge-notice',
      'Clearance Pending': 'badge-clearance',
      'Exit Interview': 'badge-interview',
      'Completed': 'badge-completed',
      'Rejected': 'badge-rejected',
      'Cancelled': 'badge-cancelled'
    };
    return map[status] || 'badge-submitted';
  };

  if (loading) return <div style={{padding: '2rem'}}>Loading...</div>;

  return (
    <div className="exit-container">
      <div className="exit-header">
        <div>
          <h2>My Exit / Resignation</h2>
          <p>Submit and track your offboarding process</p>
        </div>
      </div>

      {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

      {!activeRequest || ['Rejected', 'Cancelled'].includes(activeRequest.status) ? (
        <div className="exit-card" style={{ maxWidth: '600px' }}>
          <h3>Submit Resignation</h3>
          {activeRequest && (
             <div style={{padding: '1rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', marginBottom: '1rem'}}>
               Your previous request was {activeRequest.status.toLowerCase()}. You can submit a new one below.
             </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="exit-form-group">
              <label>Resignation Date *</label>
              <input 
                type="date" 
                name="resignationDate" 
                className="exit-input" 
                value={formData.resignationDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="exit-form-group">
              <label>Proposed Last Working Date *</label>
              <input 
                type="date" 
                name="proposedLastWorkingDate" 
                className="exit-input" 
                value={formData.proposedLastWorkingDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="exit-form-group">
              <label>Reason *</label>
              <select 
                name="reason" 
                className="exit-select" 
                value={formData.reason}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Reason...</option>
                <option value="Career Growth">Career Growth</option>
                <option value="Higher Studies">Higher Studies</option>
                <option value="Relocation">Relocation</option>
                <option value="Personal Reasons">Personal Reasons</option>
                <option value="Health Reasons">Health Reasons</option>
                <option value="Better Opportunity">Better Opportunity</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="exit-form-group">
              <label>Additional Comments</label>
              <textarea 
                name="comments" 
                className="exit-textarea" 
                value={formData.comments}
                onChange={handleInputChange}
                placeholder="Any additional information..."
              ></textarea>
            </div>
            <button type="submit" className="exit-submit-btn">Submit Resignation</button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          
          <div>
            <div className="exit-card">
              <h3>Resignation Details</h3>
              <div className="exit-details-grid">
                <div className="exit-detail-item">
                  <span className="exit-detail-label">Status</span>
                  <span className="exit-detail-value">
                    <span className={`exit-badge ${getStatusBadgeClass(activeRequest.status)}`}>{activeRequest.status}</span>
                  </span>
                </div>
                <div className="exit-detail-item">
                  <span className="exit-detail-label">Resignation Date</span>
                  <span className="exit-detail-value">{new Date(activeRequest.resignationDate).toLocaleDateString()}</span>
                </div>
                <div className="exit-detail-item">
                  <span className="exit-detail-label">Proposed Last Working Date</span>
                  <span className="exit-detail-value">{new Date(activeRequest.proposedLastWorkingDate).toLocaleDateString()}</span>
                </div>
                <div className="exit-detail-item">
                  <span className="exit-detail-label">Approved Last Working Date</span>
                  <span className="exit-detail-value">
                    {activeRequest.approvedLastWorkingDate 
                      ? new Date(activeRequest.approvedLastWorkingDate).toLocaleDateString() 
                      : 'Pending HR Approval'}
                  </span>
                </div>
                <div className="exit-detail-item">
                  <span className="exit-detail-label">Notice Period</span>
                  <span className="exit-detail-value">
                    {activeRequest.noticePeriodDays ? `${activeRequest.noticePeriodDays} days` : 'Pending'}
                  </span>
                </div>
                <div className="exit-detail-item">
                  <span className="exit-detail-label">Reason</span>
                  <span className="exit-detail-value">{activeRequest.reason}</span>
                </div>
              </div>
            </div>

            {activeRequest.exitInterview?.scheduledDate && (
              <div className="exit-card">
                <h3>Exit Interview</h3>
                <div className="exit-details-grid">
                  <div className="exit-detail-item">
                    <span className="exit-detail-label">Date</span>
                    <span className="exit-detail-value">{new Date(activeRequest.exitInterview.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  <div className="exit-detail-item">
                    <span className="exit-detail-label">Time</span>
                    <span className="exit-detail-value">{activeRequest.exitInterview.scheduledTime}</span>
                  </div>
                  <div className="exit-detail-item">
                    <span className="exit-detail-label">Interviewer</span>
                    <span className="exit-detail-value">
                      {activeRequest.exitInterview.interviewerId?.firstName} {activeRequest.exitInterview.interviewerId?.lastName}
                    </span>
                  </div>
                  <div className="exit-detail-item">
                    <span className="exit-detail-label">Status</span>
                    <span className="exit-detail-value">{activeRequest.exitInterview.status}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="exit-card">
            <h3>Offboarding Progress</h3>
            
            <div className="exit-timeline">
              {/* Submitted */}
              <div className={`timeline-step ${activeRequest.createdAt ? 'completed' : ''}`}>
                <div className="timeline-icon">✓</div>
                <div className="timeline-content">
                  <h4>Resignation</h4>
                  <p>Submitted</p>
                </div>
              </div>

              {/* Manager Review */}
              <div className={`timeline-step ${
                activeRequest.managerReview?.status === 'Approved' ? 'completed' : 
                activeRequest.managerReview?.status === 'Rejected' ? 'rejected' : 
                (activeRequest.status === 'Manager Review' || activeRequest.status === 'Submitted') ? 'active' : ''
              }`}>
                <div className="timeline-icon">{activeRequest.managerReview?.status === 'Approved' ? '✓' : activeRequest.managerReview?.status === 'Rejected' ? '✕' : '○'}</div>
                <div className="timeline-content">
                  <h4>Manager Review</h4>
                  <p>{activeRequest.managerReview?.status || 'Pending'}</p>
                </div>
              </div>

              {/* HR Review */}
              <div className={`timeline-step ${
                activeRequest.hrReview?.status === 'Approved' ? 'completed' : 
                activeRequest.hrReview?.status === 'Rejected' ? 'rejected' : 
                activeRequest.status === 'HR Review' ? 'active' : ''
              }`}>
                <div className="timeline-icon">{activeRequest.hrReview?.status === 'Approved' ? '✓' : activeRequest.hrReview?.status === 'Rejected' ? '✕' : '○'}</div>
                <div className="timeline-content">
                  <h4>HR Review</h4>
                  <p>{activeRequest.hrReview?.status || 'Pending'}</p>
                </div>
              </div>

              {/* Clearance */}
              <div className={`timeline-step ${
                ['Completed', 'Exit Interview'].includes(activeRequest.status) ? 'completed' : 
                ['Notice Period', 'Clearance Pending'].includes(activeRequest.status) ? 'active' : ''
              }`}>
                <div className="timeline-icon">{['Completed', 'Exit Interview'].includes(activeRequest.status) ? '✓' : '○'}</div>
                <div className="timeline-content">
                  <h4>Clearance Progress</h4>
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem'}}>
                      <span>Assets</span>
                      <span style={{color: activeRequest.clearance?.assetClearance === 'Completed' ? '#16a34a' : '#ea580c'}}>{activeRequest.clearance?.assetClearance || 'Pending'}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem'}}>
                      <span>Salary</span>
                      <span style={{color: activeRequest.clearance?.salaryClearance === 'Completed' ? '#16a34a' : '#ea580c'}}>{activeRequest.clearance?.salaryClearance || 'Pending'}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem'}}>
                      <span>Leave</span>
                      <span style={{color: activeRequest.clearance?.leaveClearance === 'Completed' ? '#16a34a' : '#ea580c'}}>{activeRequest.clearance?.leaveClearance || 'Pending'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exit Interview */}
              <div className={`timeline-step ${activeRequest.exitInterview?.status === 'Completed' ? 'completed' : activeRequest.status === 'Exit Interview' ? 'active' : ''}`}>
                <div className="timeline-icon">{activeRequest.exitInterview?.status === 'Completed' ? '✓' : '○'}</div>
                <div className="timeline-content">
                  <h4>Exit Interview</h4>
                  <p>{activeRequest.exitInterview?.status || 'Pending'}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyExit;
