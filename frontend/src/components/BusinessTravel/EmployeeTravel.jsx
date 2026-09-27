import React, { useState, useEffect } from 'react';
import './Travel.css';

const EmployeeTravel = ({ setActiveTab }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [companionData, setCompanionData] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    fromLocation: '',
    destination: '',
    startDate: '',
    endDate: '',
    purpose: '',
    travelType: 'Client Meeting',
    notes: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/travel/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/travel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        setFormData({
          fromLocation: '', destination: '', startDate: '', endDate: '', purpose: '', travelType: 'Client Meeting', notes: ''
        });
        fetchRequests();
      } else {
        setError(data.message || data.error || 'Failed to submit request');
      }
    } catch (err) {
      setError('Network Error');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/travel/${id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status) => {
    if (status.includes('Pending')) return '🟡';
    if (status.includes('Approved')) return '🟢';
    if (status.includes('Rejected') || status === 'Cancelled') return '🔴';
    return '🔵';
  };

  const getStatusClass = (status) => {
    if (status.includes('Pending')) return 'pending';
    if (status.includes('Approved')) return 'approved';
    if (status.includes('Rejected')) return 'rejected';
    return 'cancelled';
  };

  return (
    <div className="travel-container">
      <div className="travel-header">
        <div>
          <h1>Business Travel</h1>
          <p>Request and manage official business travel.</p>
        </div>
        <button className="travel-btn-primary" onClick={() => setShowModal(true)}>
          + New Travel Request
        </button>
      </div>

      <div className="travel-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="travel-stat-card" style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706' }}>{requests.filter(r => r.status.includes('Pending')).length}</span>
          <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>Pending</span>
        </div>
        <div className="travel-stat-card" style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>{requests.filter(r => r.status.includes('Approved')).length}</span>
          <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>Approved</span>
        </div>
        <div className="travel-stat-card" style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>{requests.filter(r => r.status.includes('Rejected')).length}</span>
          <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>Rejected</span>
        </div>
        <div className="travel-stat-card" style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>{requests.filter(r => r.status.includes('Approved') && new Date(r.startDate) > new Date()).length}</span>
          <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>Upcoming</span>
        </div>
      </div>

      <div className="travel-table-wrapper">
        <table className="travel-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Destination</th>
              <th>Dates</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req._id}>
                <td><strong>#{req._id.toString().slice(-4).toUpperCase()}</strong></td>
                <td>
                  <strong>{req.destination}</strong>
                  <div style={{ fontSize: '0.8rem' }}>From: {req.fromLocation}</div>
                </td>
                <td>
                  {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                </td>
                <td>
                  <strong>{req.purpose}</strong>
                  <div style={{ fontSize: '0.8rem' }}>{req.travelType}</div>
                </td>
                <td>
                  <span className={`travel-status ${getStatusClass(req.status)}`}>
                    {getStatusIcon(req.status)} {req.status}
                  </span>
                  {req.rejectionReason && (
                    <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#dc2626' }}>Reason: {req.rejectionReason}</div>
                  )}
                </td>
                <td>
                  {!['Manager Rejected', 'HR Rejected', 'Cancelled', 'Completed'].includes(req.status) && (
                    <button className="travel-btn-action danger" onClick={() => handleCancel(req._id)}>Cancel</button>
                  )}
                  {req.status.includes('Approved') && (
                    <button className="travel-btn-action" style={{ marginLeft: '8px', background: '#3b82f6', color: 'white' }} onClick={() => setCompanionData(req)}>Travel Companion</button>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && !loading && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>No travel requests yet</div>
                    <div style={{ color: '#6b7280', marginBottom: '1rem' }}>Create your first business travel request.</div>
                    <button className="travel-btn-primary" onClick={() => setShowModal(true)}>
                      + New Travel Request
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="travel-modal-overlay">
          <div className="travel-modal">
            <h2>Create Travel Request</h2>
            {error && <div className="travel-error">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="travel-form-group">
                  <label>Travel From *</label>
                  <input type="text" className="travel-form-control" value={formData.fromLocation} onChange={e => setFormData({...formData, fromLocation: e.target.value})} required />
                </div>
                <div className="travel-form-group">
                  <label>Destination *</label>
                  <input type="text" className="travel-form-control" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} required />
                </div>
                <div className="travel-form-group">
                  <label>Start Date *</label>
                  <input type="date" className="travel-form-control" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
                </div>
                <div className="travel-form-group">
                  <label>End Date *</label>
                  <input type="date" className="travel-form-control" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
                </div>
                <div className="travel-form-group">
                  <label>Travel Type *</label>
                  <select className="travel-form-control" value={formData.travelType} onChange={e => setFormData({...formData, travelType: e.target.value})} required>
                    <option value="Client Meeting">Client Meeting</option>
                    <option value="Business Conference">Business Conference</option>
                    <option value="Training">Training</option>
                    <option value="Company Event">Company Event</option>
                    <option value="Other Business Purpose">Other Business Purpose</option>
                  </select>
                </div>
              </div>
              
              <div className="travel-form-group">
                <label>Purpose *</label>
                <input type="text" className="travel-form-control" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} placeholder="e.g. Discuss Q3 deliverables with Client X" required />
              </div>
              
              <div className="travel-form-group">
                <label>Additional Notes</label>
                <textarea className="travel-form-control" rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>

              <div className="travel-modal-actions">
                <button type="button" className="travel-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="travel-btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {companionData && (
        <div className="travel-modal-overlay">
          <div className="travel-modal" style={{ maxWidth: '600px' }}>
            <h2>Travel Companion</h2>
            
            <div style={{ marginBottom: '1.5rem', background: '#f9fafb', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', color: '#1f2937' }}>Trip Overview</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.95rem' }}>
                <div style={{ gridColumn: 'span 2' }}><strong>Trip Title:</strong> {companionData.purpose}</div>
                <div><strong>Travel Type:</strong> {companionData.travelType}</div>
                <div><strong>Approval Status:</strong> <span className={`travel-status ${getStatusClass(companionData.status)}`} style={{ padding: '2px 8px' }}>{companionData.status}</span></div>
                <div><strong>From:</strong> {companionData.fromLocation}</div>
                <div><strong>Destination:</strong> {companionData.destination}</div>
                <div><strong>Start Date:</strong> {new Date(companionData.startDate).toLocaleDateString()}</div>
                <div><strong>End Date:</strong> {new Date(companionData.endDate).toLocaleDateString()}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem', background: '#f9fafb', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', color: '#1f2937' }}>Itinerary</h3>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '0.95rem' }}>
                {(() => {
                  const startStr = new Date(companionData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  const endStr = new Date(companionData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  
                  if (startStr === endStr) {
                    return (
                      <li style={{ marginBottom: '0.5rem', position: 'relative', paddingLeft: '1.5rem' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#3b82f6' }}>•</span>
                        <strong>{startStr}</strong> — Travel to {companionData.destination}, {companionData.purpose}, Return to {companionData.fromLocation}
                      </li>
                    );
                  }
                  
                  const middle = new Date(new Date(companionData.startDate).getTime() + 86400000);
                  const middleStr = middle.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                  return (
                    <>
                      <li style={{ marginBottom: '0.75rem', position: 'relative', paddingLeft: '1.5rem' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#3b82f6' }}>•</span>
                        <strong>{startStr}</strong> — Travel to {companionData.destination}
                      </li>
                      <li style={{ marginBottom: '0.75rem', position: 'relative', paddingLeft: '1.5rem' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#3b82f6' }}>•</span>
                        <strong>{middleStr}</strong> — {companionData.purpose}
                      </li>
                      {middleStr !== endStr && (
                         <li style={{ marginBottom: '0', position: 'relative', paddingLeft: '1.5rem' }}>
                          <span style={{ position: 'absolute', left: 0, color: '#3b82f6' }}>•</span>
                          <strong>{endStr}</strong> — Return to {companionData.fromLocation}
                        </li>
                      )}
                    </>
                  );
                })()}
              </ul>
            </div>

            <div style={{ marginBottom: '1.5rem', background: '#f9fafb', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1f2937' }}>Travel Policy</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>Review the company travel guidelines.</p>
              </div>
              <button 
                className="travel-btn-primary" 
                onClick={() => {
                  setCompanionData(null);
                  if (setActiveTab) setActiveTab('Policy & HR Knowledge Hub');
                  else alert('Please navigate to Policy & HR Knowledge Hub from the sidebar.');
                }}
              >
                View Travel Policy
              </button>
            </div>

            <div className="travel-modal-actions">
              <button className="travel-btn-secondary" onClick={() => setCompanionData(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTravel;
