import React, { useState, useEffect } from 'react';
import './ServiceHistory.css';
import '../ComplaintManagement/ComplaintManagement.css'; // For modal styles

const ServiceHistory = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [viewItem, setViewItem] = useState(null);
  
  const [feedbackData, setFeedbackData] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [history, filterType, filterStatus, searchQuery]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/service-history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (err) {
      console.error('Error fetching service history', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = history;

    if (filterType !== 'All') {
      result = result.filter(item => item.type === filterType);
    }

    if (filterStatus !== 'All') {
      result = result.filter(item => item.status === filterStatus);
    }

    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.id.toLowerCase().includes(lowerQuery) || 
        item.title.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredHistory(result);
  };

  const getStatusClass = (status) => {
    if (status === 'Open') return 'status-open';
    if (status === 'In Progress') return 'status-in-progress';
    if (status === 'Solved' || status === 'Resolved') return 'status-solved';
    if (status === 'Closed') return 'status-closed';
    return '';
  };

  const handleRowClick = (item) => {
    setViewItem(item);
    if (item.status === 'Solved' || item.status === 'Resolved' || item.status === 'Closed') {
      if (item.rating) {
        // If we already have rating from the bulk fetch
        setFeedbackData({ rating: item.rating, comment: 'Feedback previously submitted.' });
      } else {
        // We could fetch details or just show the form
        setFeedbackData(null);
        setFeedbackForm({ rating: 5, comment: '' });
      }
    } else {
      setFeedbackData(null);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        requestId: viewItem._id,
        requestType: viewItem.type === 'Service Request' ? 'ServiceRequest' : 'Complaint',
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
        fetchHistory(); // Refresh to update list rating
      } else {
        alert(data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while submitting feedback');
    }
  };

  return (
    <div className="service-history-container">
      <div className="history-header">
        <h2>Service History</h2>
      </div>

      <div className="history-filters">
        <div className="filter-group">
          <label>Type:</label>
          <select className="filter-control" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="All">All</option>
            <option value="Complaint">Complaints</option>
            <option value="Service Request">Service Requests</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select className="filter-control" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Solved">Solved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Search:</label>
          <input 
            type="text" 
            className="filter-control" 
            placeholder="Search by ID or Title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="history-table-container">
        {loading ? (
          <div className="empty-state">Loading history...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="empty-state">
            <h3>No Service History Yet</h3>
            <p>You haven't submitted any complaints or service requests matching these filters.</p>
          </div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Type</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date Submitted</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(item => (
                <tr key={`${item.type}-${item.id}`} onClick={() => handleRowClick(item)}>
                  <td>{item.id}</td>
                  <td><span className="type-badge">{item.type}</span></td>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>{item.priority || '-'}</td>
                  <td><span className={`status-badge ${getStatusClass(item.status)}`}>{item.status}</span></td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>{item.rating ? `${'⭐'.repeat(item.rating)}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail View Modal */}
      {viewItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{viewItem.type} Details</h3>
              <button className="close-btn" onClick={() => setViewItem(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="complaint-details">
                <div className="detail-row">
                  <div className="detail-label">ID:</div>
                  <div className="detail-value">{viewItem.id}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Status:</div>
                  <div className="detail-value"><span className={`status-badge ${getStatusClass(viewItem.status)}`}>{viewItem.status}</span></div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Category:</div>
                  <div className="detail-value">{viewItem.category}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Title/Subject:</div>
                  <div className="detail-value">{viewItem.title}</div>
                </div>
                {viewItem.priority && (
                  <div className="detail-row">
                    <div className="detail-label">Priority:</div>
                    <div className="detail-value">{viewItem.priority}</div>
                  </div>
                )}
                <div className="detail-row">
                  <div className="detail-label">Date Submitted:</div>
                  <div className="detail-value">{new Date(viewItem.createdAt).toLocaleString()}</div>
                </div>
                
                {/* Specific original fields */}
                {viewItem.originalData.dueDate && (
                  <div className="detail-row">
                    <div className="detail-label">Due Date:</div>
                    <div className="detail-value">{new Date(viewItem.originalData.dueDate).toLocaleDateString()}</div>
                  </div>
                )}
                {(viewItem.originalData.solvedAt || viewItem.originalData.resolvedAt) && (
                  <div className="detail-row">
                    <div className="detail-label">Completed At:</div>
                    <div className="detail-value">{new Date(viewItem.originalData.solvedAt || viewItem.originalData.resolvedAt).toLocaleString()}</div>
                  </div>
                )}

                <div className="detail-row" style={{ marginTop: '1rem' }}>
                  <div className="detail-label">Description:</div>
                  <div className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{viewItem.originalData.description}</div>
                </div>
              </div>
              
              {(viewItem.originalData.hrReply || viewItem.originalData.serviceExecutiveReply) && (
                <div className="hr-reply-section">
                  <h4>Response</h4>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{viewItem.originalData.hrReply || viewItem.originalData.serviceExecutiveReply}</p>
                </div>
              )}

              {(viewItem.status === 'Solved' || viewItem.status === 'Resolved' || viewItem.status === 'Closed') && (
                <div className="feedback-section" style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4>Resolution Feedback</h4>
                  {loadingFeedback ? (
                    <p style={{ margin: 0, color: '#64748b' }}>Loading feedback...</p>
                  ) : feedbackData ? (
                    <div>
                      <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Rating: {feedbackData.rating} ⭐</p>
                      {feedbackData.comment && <p style={{ margin: 0, color: '#334155', whiteSpace: 'pre-wrap' }}>{feedbackData.comment}</p>}
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
              <button type="button" className="btn-secondary" onClick={() => setViewItem(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceHistory;
