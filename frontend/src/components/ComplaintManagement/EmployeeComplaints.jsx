import React, { useState, useEffect } from 'react';
import './ComplaintManagement.css';

const EmployeeComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewComplaint, setViewComplaint] = useState(null);
  
  const [feedbackData, setFeedbackData] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: ''
  });

  const categories = [
    'Attendance',
    'Leave',
    'Salary & Payslip',
    'Documents',
    'Assets',
    'Employee Profile',
    'IT Support',
    'Workplace',
    'Other'
  ];

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/complaints/my-complaints', {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setFormData({ category: '', subject: '', description: '' });
        setShowModal(false);
        fetchComplaints();
        alert('Complaint submitted successfully');
      } else {
        alert(data.message || data.error || 'Failed to submit complaint');
      }
    } catch (err) {
      console.error('Error submitting complaint', err);
      alert('An error occurred while submitting the complaint');
    }
  };

  const getStatusClass = (status) => {
    if (status === 'Open') return 'status-open';
    if (status === 'In Progress') return 'status-in-progress';
    if (status === 'Solved') return 'status-solved';
    return '';
  };

  const handleOpenModal = async (comp) => {
    setViewComplaint(comp);
    if (comp.status === 'Solved') {
      setLoadingFeedback(true);
      try {
        const res = await fetch(`http://localhost:5000/api/feedback/Complaint/${comp._id}`, {
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
        requestId: viewComplaint._id,
        requestType: 'Complaint',
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

  return (
    <div className="complaint-management">
      <div className="complaint-header">
        <h2>My Complaints</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Submit Complaint
        </button>
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
                  <td>{comp.category}</td>
                  <td>{comp.subject}</td>
                  <td><span className={`status-badge ${getStatusClass(comp.status)}`}>{comp.status}</span></td>
                  <td>{new Date(comp.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="action-btn" onClick={() => handleOpenModal(comp)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Complaint Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Submit New Complaint</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} required className="form-control">
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Subject *</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="form-control" />
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required className="form-control"></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Complaint Modal */}
      {viewComplaint && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Complaint Details</h3>
              <button className="close-btn" onClick={() => setViewComplaint(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="complaint-details">
                <div className="detail-row">
                  <div className="detail-label">Complaint ID:</div>
                  <div className="detail-value">{viewComplaint.complaintId}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Status:</div>
                  <div className="detail-value"><span className={`status-badge ${getStatusClass(viewComplaint.status)}`}>{viewComplaint.status}</span></div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Category:</div>
                  <div className="detail-value">{viewComplaint.category}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Subject:</div>
                  <div className="detail-value">{viewComplaint.subject}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Date Submitted:</div>
                  <div className="detail-value">{new Date(viewComplaint.createdAt).toLocaleString()}</div>
                </div>
                {viewComplaint.solvedAt && (
                  <div className="detail-row">
                    <div className="detail-label">Date Solved:</div>
                    <div className="detail-value">{new Date(viewComplaint.solvedAt).toLocaleString()}</div>
                  </div>
                )}
                <div className="detail-row" style={{ marginTop: '1rem' }}>
                  <div className="detail-label">Description:</div>
                  <div className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{viewComplaint.description}</div>
                </div>
              </div>
              
              {viewComplaint.hrReply && (
                <div className="hr-reply-section">
                  <h4>Service Executive Response</h4>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{viewComplaint.hrReply}</p>
                </div>
              )}

              {viewComplaint.status === 'Solved' && (
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
              <button type="button" className="btn-secondary" onClick={() => setViewComplaint(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeComplaints;
