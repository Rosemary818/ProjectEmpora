import React, { useState, useEffect } from 'react';
import './ComplaintManagement.css';

const HRComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewComplaint, setViewComplaint] = useState(null);
  
  const [replyData, setReplyData] = useState({
    hrReply: '',
    status: ''
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/complaints', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (err) {
      console.error('Error fetching complaints', err);
    } finally {
      setLoading(false);
    }
  };

  const openComplaintModal = (comp) => {
    setViewComplaint(comp);
    setReplyData({
      hrReply: comp.hrReply || '',
      status: comp.status
    });
  };

  const handleReplyChange = (e) => {
    setReplyData({ ...replyData, [e.target.name]: e.target.value });
  };

  const submitReply = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/complaints/${viewComplaint._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(replyData)
      });
      const data = await res.json();
      if (data.success) {
        setViewComplaint(null);
        fetchComplaints();
      }
    } catch (err) {
      console.error('Error updating complaint', err);
    }
  };

  const updateStatusDirectly = async (complaintId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchComplaints();
      }
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'Open') return 'status-open';
    if (status === 'In Progress') return 'status-in-progress';
    if (status === 'Solved') return 'status-solved';
    return '';
  };

  return (
    <div className="complaint-management">
      <div className="complaint-header">
        <h2>Employee Complaints</h2>
      </div>

      <div className="complaint-table-container">
        {loading ? (
          <div className="empty-state">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">No complaints found.</div>
        ) : (
          <table className="complaint-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Employee</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Submitted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(comp => (
                <tr key={comp._id}>
                  <td>{comp.complaintId}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {comp.employeeId?.profileImage ? (
                          <img src={comp.employeeId.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>
                            {comp.employeeId?.firstName?.charAt(0)}{comp.employeeId?.lastName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: '#111827' }}>{comp.employeeId?.firstName} {comp.employeeId?.lastName}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{comp.employeeId?.employeeCode}</div>
                      </div>
                    </div>
                  </td>
                  <td>{comp.category}</td>
                  <td>{comp.subject}</td>
                  <td><span className={`status-badge ${getStatusClass(comp.status)}`}>{comp.status}</span></td>
                  <td>{new Date(comp.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="action-btn" onClick={() => openComplaintModal(comp)}>View / Reply</button>
                    {comp.status === 'Open' && (
                      <button className="action-btn" onClick={() => updateStatusDirectly(comp._id, 'In Progress')}>Mark In Progress</button>
                    )}
                    {(comp.status === 'Open' || comp.status === 'In Progress') && (
                      <button className="action-btn" style={{ color: '#16a34a' }} onClick={() => updateStatusDirectly(comp._id, 'Solved')}>Mark Solved</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View & Reply Modal */}
      {viewComplaint && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Complaint Details & Reply</h3>
              <button className="close-btn" onClick={() => setViewComplaint(null)}>&times;</button>
            </div>
            
            <form onSubmit={submitReply}>
              <div className="modal-body">
                <div className="complaint-details">
                  <div className="detail-row">
                    <div className="detail-label">Employee:</div>
                    <div className="detail-value">{viewComplaint.employeeId?.firstName} {viewComplaint.employeeId?.lastName} ({viewComplaint.employeeId?.employeeCode})</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Complaint ID:</div>
                    <div className="detail-value">{viewComplaint.complaintId}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Category:</div>
                    <div className="detail-value">{viewComplaint.category}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Subject:</div>
                    <div className="detail-value">{viewComplaint.subject}</div>
                  </div>
                  <div className="detail-row" style={{ marginTop: '1rem' }}>
                    <div className="detail-label">Description:</div>
                    <div className="detail-value" style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                      {viewComplaint.description}
                    </div>
                  </div>
                </div>

                <hr style={{ border: 0, borderTop: '1px solid #e5e7eb', margin: '1.5rem 0' }} />
                
                <div className="form-group">
                  <label>Service Executive Reply</label>
                  <textarea 
                    name="hrReply" 
                    value={replyData.hrReply} 
                    onChange={handleReplyChange} 
                    placeholder="Enter your response here..." 
                    className="form-control"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Update Status</label>
                  <select name="status" value={replyData.status} onChange={handleReplyChange} className="form-control">
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Solved">Solved</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setViewComplaint(null)}>Close</button>
                <button type="submit" className="btn-primary">Save Reply & Status</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRComplaints;
