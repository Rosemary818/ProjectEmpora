import React, { useState, useEffect } from 'react';
import './Travel.css';
import EmployeeTravel from './EmployeeTravel';

const ManagerTravel = ({ setActiveTab }) => {
  const [localActiveTab, setLocalActiveTab] = useState('Approvals'); // 'Approvals' | 'MyRequests'
  const [teamRequests, setTeamRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (localActiveTab === 'Approvals') {
      fetchTeamRequests();
    }
  }, [localActiveTab]);

  const fetchTeamRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/travel/team', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTeamRequests(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id, action, reason = '') => {
    try {
      const res = await fetch(`http://localhost:5000/api/travel/${id}/process`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ action, reason })
      });
      if (res.ok) {
        fetchTeamRequests();
        setShowRejectModal(false);
        setRejectId(null);
        setRejectionReason('');
      } else {
        const data = await res.json();
        alert(data.message || data.error || 'Failed to process request');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const openRejectModal = (id) => {
    setRejectId(id);
    setShowRejectModal(true);
  };

  const submitReject = (e) => {
    e.preventDefault();
    handleProcess(rejectId, 'Reject', rejectionReason);
  };

  if (localActiveTab === 'MyRequests') {
    return (
      <div>
        <div className="travel-tabs" style={{ padding: '1.5rem 1.5rem 0 1.5rem', background: '#f9fafb', marginBottom: 0 }}>
          <button className={`travel-tab ${localActiveTab === 'Approvals' ? 'active' : ''}`} onClick={() => setLocalActiveTab('Approvals')}>Team Approvals</button>
          <button className={`travel-tab ${localActiveTab === 'MyRequests' ? 'active' : ''}`} onClick={() => setLocalActiveTab('MyRequests')}>My Travel Requests</button>
        </div>
        <EmployeeTravel setActiveTab={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="travel-container">
      <div className="travel-tabs">
        <button className={`travel-tab ${localActiveTab === 'Approvals' ? 'active' : ''}`} onClick={() => setLocalActiveTab('Approvals')}>Team Approvals</button>
        <button className={`travel-tab ${localActiveTab === 'MyRequests' ? 'active' : ''}`} onClick={() => setLocalActiveTab('MyRequests')}>My Travel Requests</button>
      </div>

      <div className="travel-header">
        <div>
          <h1>Team Travel Approvals</h1>
          <p>Review and approve business travel requests from your team.</p>
        </div>
      </div>

      <div className="travel-table-wrapper">
        <table className="travel-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Destination</th>
              <th>Dates</th>
              <th>Purpose & Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamRequests.map(req => (
              <tr key={req._id}>
                <td>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1f2937' }}>{req.requesterId?.firstName} {req.requesterId?.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}><a href={`mailto:${req.requesterId?.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{req.requesterId?.email}</a></div>
                  </div>
                </td>
                <td>
                  <strong>{req.destination}</strong>
                  <div style={{ fontSize: '0.8rem' }}>From: {req.fromLocation}</div>
                </td>
                <td>
                  {new Date(req.startDate).toLocaleDateString()} - <br/>{new Date(req.endDate).toLocaleDateString()}
                </td>
                <td>
                  <strong>{req.purpose}</strong>
                  <div style={{ fontSize: '0.8rem' }}>{req.travelType}</div>
                </td>
                <td>
                  <span className={`travel-status ${req.status.includes('Pending') ? 'pending' : req.status.includes('Approved') ? 'approved' : 'rejected'}`}>
                    {req.status}
                  </span>
                </td>
                <td>
                  {req.status === 'Pending Manager Approval' && (
                    <div style={{ display: 'flex' }}>
                      <button className="travel-btn-action approve" onClick={() => handleProcess(req._id, 'Approve')}>Approve</button>
                      <button className="travel-btn-action danger" onClick={() => openRejectModal(req._id)}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {teamRequests.length === 0 && !loading && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No travel requests from your team.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showRejectModal && (
        <div className="travel-modal-overlay">
          <div className="travel-modal" style={{ maxWidth: '400px' }}>
            <h2>Reject Request</h2>
            <form onSubmit={submitReject}>
              <div className="travel-form-group">
                <label>Rejection Reason (Optional)</label>
                <textarea 
                  className="travel-form-control" 
                  rows="3" 
                  value={rejectionReason} 
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                ></textarea>
              </div>
              <div className="travel-modal-actions">
                <button type="button" className="travel-btn-secondary" onClick={() => { setShowRejectModal(false); setRejectionReason(''); }}>Cancel</button>
                <button type="submit" className="travel-btn-primary" style={{ background: '#dc2626' }}>Reject Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTravel;
