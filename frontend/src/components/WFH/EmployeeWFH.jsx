import React, { useState, useEffect } from 'react';
import './WFH.css';

const EmployeeWFH = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/wfh/my-requests', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching WFH requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!formData.fromDate || !formData.toDate || !formData.reason) {
      setSubmitError('Please fill in all fields.');
      return;
    }

    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      setSubmitError('From Date cannot be after To Date.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/wfh/my-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setSubmitSuccess('WFH Request submitted successfully.');
        setFormData({ fromDate: '', toDate: '', reason: '' });
        fetchRequests(); // Refresh the list
      } else {
        setSubmitError(data.error || data.message || 'Failed to submit request.');
      }
    } catch (error) {
      console.error('Error submitting WFH request:', error);
      setSubmitError('Server error while submitting request.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const pendingRequests = requests.filter(req => req.status === 'Pending');
  const historyRequests = requests.filter(req => req.status !== 'Pending');

  if (loading) {
    return <div className="wfh-loading">Loading WFH module...</div>;
  }

  return (
    <div className="wfh-container">
      <div className="wfh-header">
        <h2>Remote Work (WFH)</h2>
        <p>Apply for and track your Work From Home requests.</p>
      </div>

      <div className="wfh-content-grid">
        <div className="wfh-card">
          <div className="wfh-card-header">
            <h3>Apply for WFH</h3>
          </div>
          <div className="wfh-card-body">
            <form onSubmit={handleSubmit} className="wfh-form">
              {submitError && <div className="wfh-alert wfh-alert-danger">{submitError}</div>}
              {submitSuccess && <div className="wfh-alert wfh-alert-success">{submitSuccess}</div>}
              
              <div className="wfh-form-row">
                <div className="wfh-form-group">
                  <label>From Date <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="wfh-form-group">
                  <label>To Date <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="wfh-form-group">
                <label>Reason <span className="text-danger">*</span></label>
                <textarea
                  name="reason"
                  rows="3"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Provide a reason for working from home..."
                  required
                ></textarea>
              </div>
              <div className="wfh-form-actions">
                <button type="submit" className="wfh-btn wfh-btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>

        <div className="wfh-card">
          <div className="wfh-card-header">
            <h3>Pending Requests</h3>
          </div>
          <div className="wfh-card-body">
            {pendingRequests.length === 0 ? (
              <p className="wfh-empty">No pending WFH requests.</p>
            ) : (
              <div className="wfh-list">
                {pendingRequests.map(req => (
                  <div key={req._id} className="wfh-list-item">
                    <div className="wfh-item-details">
                      <span className="wfh-dates">{formatDate(req.fromDate)} - {formatDate(req.toDate)}</span>
                      <span className="wfh-reason">{req.reason}</span>
                      <span className="wfh-manager">Manager: {req.manager?.firstName} {req.manager?.lastName}</span>
                    </div>
                    <div className="wfh-item-status">
                      <span className={`wfh-badge badge-${req.status.toLowerCase()}`}>{req.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="wfh-card wfh-mt-4">
        <div className="wfh-card-header">
          <h3>WFH History & Calendar</h3>
        </div>
        <div className="wfh-card-body">
          {historyRequests.length === 0 ? (
            <p className="wfh-empty">No WFH history found.</p>
          ) : (
            <div className="wfh-table-responsive">
              <table className="wfh-table">
                <thead>
                  <tr>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Manager Comment</th>
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRequests.map(req => (
                    <tr key={req._id}>
                      <td>{formatDate(req.fromDate)} to {formatDate(req.toDate)}</td>
                      <td>{req.reason}</td>
                      <td>
                        <span className={`wfh-badge badge-${req.status.toLowerCase()}`}>{req.status}</span>
                      </td>
                      <td>{req.managerComment || '-'}</td>
                      <td>{formatDate(req.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeWFH;
