import React, { useState, useEffect } from 'react';
import './Travel.css';

const HRTravel = () => {
  const [activeTab, setActiveTab] = useState('Monitoring'); // 'Monitoring' | 'ManagerApprovals'
  
  const [monitoringRequests, setMonitoringRequests] = useState([]);
  const [managerRequests, setManagerRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (activeTab === 'Monitoring') {
      fetchMonitoring();
    } else {
      fetchManagerRequests();
    }
  }, [activeTab]);

  const fetchMonitoring = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/travel/hr/monitoring', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) setMonitoringRequests(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagerRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/travel/hr/approvals', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) setManagerRequests(data.data);
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
        fetchManagerRequests();
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

  const renderStatus = (status) => {
    let styleClass = 'cancelled';
    if (status.includes('Pending')) styleClass = 'pending';
    if (status.includes('Approved')) styleClass = 'approved';
    if (status.includes('Rejected')) styleClass = 'rejected';
    
    return (
      <span className={`travel-status ${styleClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="travel-container">
      <div className="travel-header">
        <div>
          <h1>Business Travel Management</h1>
          <p>Monitor employee travel and approve manager travel requests.</p>
        </div>
      </div>

      <div className="travel-tabs">
        <button className={`travel-tab ${activeTab === 'Monitoring' ? 'active' : ''}`} onClick={() => setActiveTab('Monitoring')}>Employee Monitoring</button>
        <button className={`travel-tab ${activeTab === 'ManagerApprovals' ? 'active' : ''}`} onClick={() => setActiveTab('ManagerApprovals')}>Manager Approvals</button>
      </div>

      {activeTab === 'Monitoring' && (
        <div className="travel-table-wrapper">
          <table className="travel-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Manager</th>
                <th>Destination</th>
                <th>Dates & Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {monitoringRequests.map(req => (
                <tr key={req._id}>
                  <td>
                    <strong>{req.requesterId?.firstName} {req.requesterId?.lastName}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{req.requesterId?.department || 'No Department'}</div>
                  </td>
                  <td>{req.managerId ? `${req.managerId.firstName} ${req.managerId.lastName}` : 'N/A'}</td>
                  <td>
                    <strong>{req.destination}</strong>
                    <div style={{ fontSize: '0.8rem' }}>From: {req.fromLocation}</div>
                  </td>
                  <td>
                    {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{req.travelType}</div>
                  </td>
                  <td>
                    {renderStatus(req.status)}
                  </td>
                </tr>
              ))}
              {monitoringRequests.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No employee travel records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'ManagerApprovals' && (
        <div className="travel-table-wrapper">
          <table className="travel-table">
            <thead>
              <tr>
                <th>Manager</th>
                <th>Destination</th>
                <th>Dates</th>
                <th>Purpose & Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {managerRequests.map(req => (
                <tr key={req._id}>
                  <td>
                    <strong>{req.requesterId?.firstName} {req.requesterId?.lastName}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{req.requesterId?.department || 'No Department'}</div>
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
                    {renderStatus(req.status)}
                  </td>
                  <td>
                    {req.status === 'Pending HR Approval' && (
                      <div style={{ display: 'flex' }}>
                        <button className="travel-btn-action approve" onClick={() => handleProcess(req._id, 'Approve')}>Approve</button>
                        <button className="travel-btn-action danger" onClick={() => openRejectModal(req._id)}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {managerRequests.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No manager travel requests pending.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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

export default HRTravel;
