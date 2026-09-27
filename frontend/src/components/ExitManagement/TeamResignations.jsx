import React, { useState, useEffect } from 'react';
import './ExitManagement.css';

const TeamResignations = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewComments, setReviewComments] = useState('');

  useEffect(() => {
    fetchTeamResignations();
  }, []);

  const fetchTeamResignations = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/exits/team', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch team resignations.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status) => {
    if (!selectedRequest) return;
    try {
      const res = await fetch(`http://localhost:5000/api/exits/${selectedRequest._id}/manager-review`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
        },
        body: JSON.stringify({ status, comments: reviewComments })
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(prev => prev.map(r => r._id === data.data._id ? data.data : r));
        setSelectedRequest(null);
        setReviewComments('');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert(`Failed to ${status.toLowerCase()} request.`);
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
          <h2>Team Resignations</h2>
          <p>Review and manage resignation requests from your team members</p>
        </div>
      </div>

      {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

      <div className="exit-table-container">
        <table className="exit-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Employee ID</th>
              <th>Designation</th>
              <th>Resignation Date</th>
              <th>Proposed LWD</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan="7" style={{textAlign: 'center', color: '#6b7280'}}>No team resignations found.</td></tr>
            ) : (
              requests.map(req => (
                <tr key={req._id}>
                  <td>
                    <div style={{fontWeight: 500, color: '#111827'}}>
                      {req.employeeId?.firstName} {req.employeeId?.lastName}
                    </div>
                  </td>
                  <td>{req.employeeId?.employeeCode || 'N/A'}</td>
                  <td>{req.employeeId?.designationName || 'N/A'}</td>
                  <td>{new Date(req.resignationDate).toLocaleDateString()}</td>
                  <td>{new Date(req.proposedLastWorkingDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`exit-badge ${getStatusBadgeClass(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="exit-action-btn"
                      onClick={() => setSelectedRequest(req)}
                    >
                      View / Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '2rem', borderRadius: '8px', 
            width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3 style={{margin: '0 0 1rem 0'}}>Review Resignation</h3>
            
            <div className="exit-details-grid">
              <div className="exit-detail-item">
                <span className="exit-detail-label">Employee Name</span>
                <span className="exit-detail-value">{selectedRequest.employeeId?.firstName} {selectedRequest.employeeId?.lastName}</span>
              </div>
              <div className="exit-detail-item">
                <span className="exit-detail-label">Employee ID</span>
                <span className="exit-detail-value">{selectedRequest.employeeId?.employeeCode || 'N/A'}</span>
              </div>
              <div className="exit-detail-item">
                <span className="exit-detail-label">Resignation Date</span>
                <span className="exit-detail-value">{new Date(selectedRequest.resignationDate).toLocaleDateString()}</span>
              </div>
              <div className="exit-detail-item">
                <span className="exit-detail-label">Proposed Last Working Date</span>
                <span className="exit-detail-value">{new Date(selectedRequest.proposedLastWorkingDate).toLocaleDateString()}</span>
              </div>
              <div className="exit-detail-item" style={{gridColumn: '1 / -1'}}>
                <span className="exit-detail-label">Reason</span>
                <span className="exit-detail-value">{selectedRequest.reason}</span>
              </div>
              <div className="exit-detail-item" style={{gridColumn: '1 / -1'}}>
                <span className="exit-detail-label">Comments</span>
                <span className="exit-detail-value">{selectedRequest.comments || 'No additional comments.'}</span>
              </div>
            </div>

            {(selectedRequest.status === 'Submitted' || selectedRequest.status === 'Manager Review') ? (
              <div style={{marginTop: '1.5rem'}}>
                <div className="exit-form-group">
                  <label>Manager Review Comments</label>
                  <textarea 
                    className="exit-textarea" 
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Enter your remarks here..."
                  ></textarea>
                </div>
                <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem'}}>
                  <button className="exit-action-btn" onClick={() => setSelectedRequest(null)}>Cancel</button>
                  <button className="exit-action-btn exit-btn-reject" onClick={() => handleReview('Rejected')}>Reject</button>
                  <button className="exit-action-btn exit-btn-approve" onClick={() => handleReview('Approved')}>Approve</button>
                </div>
              </div>
            ) : (
              <div style={{marginTop: '1.5rem'}}>
                <div className="exit-form-group">
                  <label>Manager Review Status</label>
                  <div style={{padding: '0.5rem', background: '#f3f4f6', borderRadius: '4px'}}>
                    <span style={{fontWeight: 600, color: selectedRequest.managerReview?.status === 'Approved' ? '#16a34a' : '#dc2626'}}>
                      {selectedRequest.managerReview?.status || 'Pending'}
                    </span>
                    {selectedRequest.managerReview?.comments && (
                      <p style={{margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#4b5563'}}>
                        "{selectedRequest.managerReview.comments}"
                      </p>
                    )}
                  </div>
                </div>
                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
                  <button className="exit-action-btn" onClick={() => setSelectedRequest(null)}>Close</button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamResignations;
