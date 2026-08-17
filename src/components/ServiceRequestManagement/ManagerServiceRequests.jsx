import React, { useState, useEffect } from 'react';
import './ServiceRequestManagement.css';

const ManagerServiceRequests = () => {
  const [activeTab, setActiveTab] = useState('My Requests');
  const [myRequests, setMyRequests] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewRequest, setViewRequest] = useState(null);

  const [feedbackData, setFeedbackData] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    priority: 'Low'
  });

  const categories = [
    'Hardware',
    'Software',
    'Access & Account',
    'ID Card',
    'Office Facilities',
    'Other'
  ];

  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  useEffect(() => {
    if (activeTab === 'My Requests') {
      fetchMyRequests();
    } else {
      fetchTeamRequests();
    }
  }, [activeTab]);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/service-requests/my-requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setMyRequests(data.data);
      }
    } catch (err) {
      console.error('Error fetching my service requests', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/service-requests/team', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setTeamRequests(data.data);
      }
    } catch (err) {
      console.error('Error fetching team service requests', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/service-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setFormData({ title: '', category: '', description: '', priority: 'Low' });
        setShowModal(false);
        fetchMyRequests();
        setActiveTab('My Requests');
        alert('Service Request submitted successfully');
      } else {
        alert(data.message || data.error || 'Failed to submit service request');
      }
    } catch (err) {
      console.error('Error submitting service request', err);
      alert('An error occurred while submitting the service request');
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

  const handleOpenModal = async (req) => {
    setViewRequest(req);
    if (activeTab === 'My Requests' && (req.status === 'Resolved' || req.status === 'Closed')) {
      setLoadingFeedback(true);
      try {
        const res = await fetch(`http://localhost:5000/api/feedback/ServiceRequest/${req._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setFeedbackData(data.data);
        } else {
          setFeedbackData(null);
          setFeedbackForm({ rating: 5, comment: '' });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingFeedback(false);
      }
    } else {
      setFeedbackData(null);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        requestId: viewRequest._id,
        requestType: 'ServiceRequest',
        rating: Number(feedbackForm.rating),
        comment: feedbackForm.comment
      };
      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackData(data.data);
        alert('Thank you for your feedback.');
      } else {
        alert(data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while submitting feedback');
    }
  };

  const renderTable = (requests, isTeam) => {
    if (loading) return <div className="empty-state">Loading service requests...</div>;
    
    if (requests.length === 0) {
      return (
        <div className="empty-state">
          <h4>No Service Requests Yet</h4>
          <p>{isTeam ? "No team members have submitted service requests." : "You have not submitted any service requests."}</p>
        </div>
      );
    }

    return (
      <table className="service-request-table">
        <thead>
          <tr>
            <th>Request ID</th>
            {isTeam && <th>Employee</th>}
            <th>Title</th>
            <th>Category</th>
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
              {isTeam && (
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
              )}
              <td>{req.title}</td>
              <td>{req.category}</td>
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
                <button className="action-btn" onClick={() => handleOpenModal(req)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="service-request-management">
      <div className="service-request-header">
        <h2>Service Requests</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + New Service Request
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
        <button 
          onClick={() => setActiveTab('My Requests')}
          style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'My Requests' ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === 'My Requests' ? '#2563eb' : '#6b7280', fontWeight: activeTab === 'My Requests' ? '600' : '500', cursor: 'pointer' }}
        >
          My Requests
        </button>
        <button 
          onClick={() => setActiveTab('Team Requests')}
          style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'Team Requests' ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === 'Team Requests' ? '#2563eb' : '#6b7280', fontWeight: activeTab === 'Team Requests' ? '600' : '500', cursor: 'pointer' }}
        >
          Team Requests
        </button>
      </div>

      <div className="service-request-table-container">
        {activeTab === 'My Requests' ? renderTable(myRequests, false) : renderTable(teamRequests, true)}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>New Service Request</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Request Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required className="form-control" />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} required className="form-control">
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className="form-control">
                    {priorities.map(pri => <option key={pri} value={pri}>{pri}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required className="form-control"></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Service Request Details</h3>
              <button className="close-btn" onClick={() => setViewRequest(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="service-request-details">
                <div className="detail-row">
                  <div className="detail-label">Request ID:</div>
                  <div className="detail-value">{viewRequest.requestId}</div>
                </div>
                {activeTab === 'Team Requests' && viewRequest.employeeId && (
                  <>
                    <div className="detail-row">
                      <div className="detail-label">Employee:</div>
                      <div className="detail-value">{viewRequest.employeeId.firstName} {viewRequest.employeeId.lastName} ({viewRequest.employeeId.employeeCode})</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Department:</div>
                      <div className="detail-value">{viewRequest.employeeId.department || 'N/A'}</div>
                    </div>
                  </>
                )}
                <div className="detail-row">
                  <div className="detail-label">Status:</div>
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
                {viewRequest.resolvedAt && (
                  <div className="detail-row">
                    <div className="detail-label">Date Resolved:</div>
                    <div className="detail-value">{new Date(viewRequest.resolvedAt).toLocaleString()}</div>
                  </div>
                )}
                <div className="detail-row" style={{ marginTop: '1rem' }}>
                  <div className="detail-label">Description:</div>
                  <div className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{viewRequest.description}</div>
                </div>
              </div>
              
              {viewRequest.serviceExecutiveReply && (
                <div className="se-reply-section">
                  <h4>Service Executive Response</h4>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{viewRequest.serviceExecutiveReply}</p>
                </div>
              )}

              {activeTab === 'My Requests' && (viewRequest.status === 'Resolved' || viewRequest.status === 'Closed') && (
                <div className="feedback-section" style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4>Resolution Feedback</h4>
                  {loadingFeedback ? (
                    <p style={{ margin: 0, color: '#64748b' }}>Loading feedback...</p>
                  ) : feedbackData ? (
                    <div>
                      <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Rating: {feedbackData.rating} ⭐</p>
                      <p style={{ margin: 0, color: '#334155', whiteSpace: 'pre-wrap' }}>{feedbackData.comment || 'No comment provided.'}</p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Thank you for your feedback.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit}>
                      <div className="form-group">
                        <label>How satisfied are you with the resolution?</label>
                        <select 
                          className="form-control" 
                          value={feedbackForm.rating} 
                          onChange={(e) => setFeedbackForm({...feedbackForm, rating: e.target.value})}
                          required
                        >
                          <option value="5">⭐ 5 - Excellent</option>
                          <option value="4">⭐ 4 - Good</option>
                          <option value="3">⭐ 3 - Average</option>
                          <option value="2">⭐ 2 - Poor</option>
                          <option value="1">⭐ 1 - Very Poor</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Comment (Optional)</label>
                        <textarea 
                          className="form-control" 
                          rows="2"
                          placeholder="Tell us about your experience..."
                          value={feedbackForm.comment}
                          onChange={(e) => setFeedbackForm({...feedbackForm, comment: e.target.value})}
                        ></textarea>
                      </div>
                      <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Submit Feedback</button>
                    </form>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setViewRequest(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerServiceRequests;
