import React, { useState, useEffect } from 'react';
import './ServiceRequestManagement.css';

const ServiceExecutiveServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewRequest, setViewRequest] = useState(null);
  
  const [replyData, setReplyData] = useState({
    status: '',
    serviceExecutiveReply: ''
  });

  const [metrics, setMetrics] = useState({
    totalOpen: 0,
    dueSoon: 0,
    overdue: 0,
    resolved: 0
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/service-requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
        calculateMetrics(data.data);
      }
    } catch (err) {
      console.error('Error fetching service requests', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (data) => {
    const counts = {
      totalOpen: data.filter(r => r.status === 'Open' || r.status === 'In Progress').length,
      dueSoon: data.filter(r => r.slaStatus === 'Due Soon').length,
      overdue: data.filter(r => r.slaStatus === 'Overdue').length,
      resolved: data.filter(r => r.status === 'Resolved' || r.status === 'Closed').length
    };
    setMetrics(counts);
  };

  const handleOpenModal = (req) => {
    setViewRequest(req);
    setReplyData({
      status: req.status,
      serviceExecutiveReply: req.serviceExecutiveReply || ''
    });
  };

  const handleReplyChange = (e) => {
    setReplyData({ ...replyData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/service-requests/${viewRequest._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(replyData)
      });
      const data = await res.json();
      if (data.success) {
        setViewRequest(null);
        fetchRequests();
        alert('Service Request updated successfully');
      } else {
        alert(data.message || data.error || 'Failed to update service request');
      }
    } catch (err) {
      console.error('Error updating service request', err);
      alert('An error occurred while updating the service request');
    }
  };

  const getStatusClass = (status) => {
    if (status === 'Open') return 'status-open';
    if (status === 'In Progress') return 'status-in-progress';
    if (status === 'Resolved') return 'status-resolved';
    if (status === 'Closed') return 'status-closed';
    return '';
  };

  const getPriorityClass = (priority) => {
    if (priority === 'Low') return 'priority-low';
    if (priority === 'Medium') return 'priority-medium';
    if (priority === 'High') return 'priority-high';
    if (priority === 'Urgent') return 'priority-urgent';
    return '';
  };

  return (
    <div className="service-request-management">
      <div className="service-request-header">
        <h2>Company Service Requests</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center', borderBottom: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{metrics.totalOpen}</div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Open</div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center', borderBottom: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{metrics.dueSoon}</div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Due Soon</div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center', borderBottom: '4px solid #ef4444' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{metrics.overdue}</div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Overdue</div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center', borderBottom: '4px solid #10b981' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{metrics.resolved}</div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Resolved</div>
        </div>
      </div>

      <div className="service-request-table-container">
        {loading ? (
          <div className="empty-state">Loading service requests...</div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <h4>No Service Requests</h4>
            <p>No employee service requests are currently pending.</p>
          </div>
        ) : (
          <table className="service-request-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Employee</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>SLA Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req._id}>
                  <td>{req.requestId}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', background: '#bfdbfe', color: '#1e3a8a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', overflow: 'hidden' }}>
                        {req.employeeId?.profileImage ? (
                          <img src={req.employeeId.profileImage} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        ) : (
                          `${req.employeeId?.firstName?.charAt(0) || ''}${req.employeeId?.lastName?.charAt(0) || ''}`
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{req.employeeId?.firstName} {req.employeeId?.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID: {req.employeeId?.employeeCode}</div>
                      </div>
                    </div>
                  </td>
                  <td>{req.title}</td>
                  <td className={getPriorityClass(req.priority)}>{req.priority}</td>
                  <td><span className={`status-badge ${getStatusClass(req.status)}`}>{req.status}</span></td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', 
                      background: req.slaStatus === 'Overdue' ? '#fee2e2' : req.slaStatus === 'Due Soon' ? '#fef3c7' : req.slaStatus === 'Completed' ? '#d1fae5' : '#e0e7ff', 
                      color: req.slaStatus === 'Overdue' ? '#991b1b' : req.slaStatus === 'Due Soon' ? '#92400e' : req.slaStatus === 'Completed' ? '#065f46' : '#3730a3' 
                    }}>
                      {req.slaStatus}
                    </span>
                  </td>
                  <td>{req.dueDate ? new Date(req.dueDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button className="action-btn" onClick={() => handleOpenModal(req)}>Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Manage/View Modal */}
      {viewRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Manage Service Request</h3>
              <button className="close-btn" onClick={() => setViewRequest(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="service-request-details">
                <div className="detail-row">
                  <div className="detail-label">Request ID:</div>
                  <div className="detail-value">{viewRequest.requestId}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Employee:</div>
                  <div className="detail-value">{viewRequest.employeeId?.firstName} {viewRequest.employeeId?.lastName} ({viewRequest.employeeId?.employeeCode})</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Department:</div>
                  <div className="detail-value">{viewRequest.employeeId?.department || 'N/A'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Current Status:</div>
                  <div className="detail-value"><span className={`status-badge ${getStatusClass(viewRequest.status)}`}>{viewRequest.status}</span></div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Priority:</div>
                  <div className="detail-value"><span className={getPriorityClass(viewRequest.priority)}>{viewRequest.priority}</span></div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Category:</div>
                  <div className="detail-value">{viewRequest.category}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Title:</div>
                  <div className="detail-value">{viewRequest.title}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">SLA Status:</div>
                  <div className="detail-value">
                    <span style={{ 
                      padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', 
                      background: viewRequest.slaStatus === 'Overdue' ? '#fee2e2' : viewRequest.slaStatus === 'Due Soon' ? '#fef3c7' : viewRequest.slaStatus === 'Completed' ? '#d1fae5' : '#e0e7ff', 
                      color: viewRequest.slaStatus === 'Overdue' ? '#991b1b' : viewRequest.slaStatus === 'Due Soon' ? '#92400e' : viewRequest.slaStatus === 'Completed' ? '#065f46' : '#3730a3' 
                    }}>
                      {viewRequest.slaStatus}
                    </span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Due Date:</div>
                  <div className="detail-value">{viewRequest.dueDate ? new Date(viewRequest.dueDate).toLocaleString() : 'N/A'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Date Submitted:</div>
                  <div className="detail-value">{new Date(viewRequest.createdAt).toLocaleString()}</div>
                </div>
                <div className="detail-row" style={{ marginTop: '1rem' }}>
                  <div className="detail-label">Description:</div>
                  <div className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{viewRequest.description}</div>
                </div>
              </div>
              
              <form onSubmit={handleUpdate}>
                <hr style={{ border: 0, borderTop: '1px solid #e5e7eb', margin: '1.5rem 0' }} />
                
                <div className="form-group">
                  <label>Update Status</label>
                  <select name="status" value={replyData.status} onChange={handleReplyChange} className="form-control">
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Service Executive Reply</label>
                  <textarea 
                    name="serviceExecutiveReply" 
                    value={replyData.serviceExecutiveReply} 
                    onChange={handleReplyChange} 
                    className="form-control" 
                    placeholder="Enter your response to the employee..."
                  ></textarea>
                </div>

                <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
                  <button type="button" className="btn-secondary" onClick={() => setViewRequest(null)}>Cancel</button>
                  <button type="submit" className="btn-primary">Update Request</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceExecutiveServiceRequests;
