import React, { useState, useEffect } from 'react';
import './LeaveManagement.css';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState(null);
  const [currentQuarter, setCurrentQuarter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: '',
    relationship: 'Father',
  });
  const [document, setDocument] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchLeaves = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/leave', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setLeaves(data.data);
        if (data.balances) {
          setBalances(data.balances);
        }
        if (data.currentQuarter) {
          setCurrentQuarter(data.currentQuarter);
        }
      } else {
        setError(data.message || 'Failed to fetch leaves');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        e.target.value = '';
        setDocument(null);
        return;
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF, JPG, JPEG, and PNG formats are allowed');
        e.target.value = '';
        setDocument(null);
        return;
      }
      setError('');
      setDocument(file);
    } else {
      setDocument(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    let days = 0;
    let curDate = new Date(start.getTime());
    while (curDate <= end) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) days++;
      curDate.setDate(curDate.getDate() + 1);
    }

    if (formData.leaveType === 'Sick Leave' && days > 2 && !document) {
      setError('Medical Certificate is required for Sick Leave exceeding 2 days.');
      return;
    }
    if (['Maternity Leave', 'Marriage Leave', 'Bereavement Leave', 'Compensatory Off'].includes(formData.leaveType) && !document) {
      setError(`Supporting document is required for ${formData.leaveType}.`);
      return;
    }
    if (formData.leaveType === 'Bereavement Leave' && !formData.relationship) {
      setError('Please select the relationship for Bereavement Leave.');
      return;
    }

    setLoading(true);

    const submitData = new FormData();
    submitData.append('leaveType', formData.leaveType);
    submitData.append('startDate', formData.startDate);
    submitData.append('endDate', formData.endDate);
    submitData.append('reason', formData.reason);
    if (formData.leaveType === 'Bereavement Leave') {
      submitData.append('relationship', formData.relationship);
    }
    if (document) {
      submitData.append('document', document);
    }

    try {
      const response = await fetch('http://localhost:5000/api/leave', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: submitData,
      });

      const data = await response.json();

      if (response.ok) {
        setShowForm(false);
        setFormData({ leaveType: 'Casual Leave', startDate: '', endDate: '', reason: '', relationship: 'Father' });
        setDocument(null);
        fetchLeaves();
      } else {
        setError(data.error || data.message || 'Failed to submit leave request');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const requiresDocument = ['Sick Leave', 'Maternity Leave', 'Marriage Leave', 'Bereavement Leave', 'Compensatory Off'].includes(formData.leaveType);
  const isMedicalCert = ['Sick Leave', 'Maternity Leave'].includes(formData.leaveType);
  const documentLabel = isMedicalCert ? 'Medical Certificate *' : 'Supporting Document *';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return <span className="lm-badge lm-badge-success">Approved</span>;
      case 'Rejected': return <span className="lm-badge lm-badge-danger">Rejected</span>;
      default: return <span className="lm-badge lm-badge-warning">Pending</span>;
    }
  };

  return (
    <div className="lm-container">
      <div className="lm-header">
        <h2>Leave Management</h2>
        <button className="lm-btn lm-btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Apply for Leave'}
        </button>
      </div>

      {error && <div className="lm-alert lm-alert-danger">{error}</div>}

      {!fetching && balances && (
        <div className="lm-card" style={{ marginBottom: '1.5rem' }}>
          <div className="lm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h3>Current Leave Balances</h3>
            {currentQuarter && <span className="lm-badge lm-badge-success" style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>Current Quarter: {currentQuarter}</span>}
          </div>
          <div className="lm-card-body">
            <div className="lm-table-responsive">
              <table className="lm-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Total Allocated</th>
                    <th>Used</th>
                    <th>Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(balances).map(([type, balance]) => (
                    <tr key={type}>
                      <td>{type === 'Earned Leave' ? 'Earned Leave / Annual Leave' : type}</td>
                      <td>{balance.credited}</td>
                      <td>{balance.used}</td>
                      <td><strong>{balance.remaining}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="lm-card">
          <div className="lm-card-header">
            <h3>Apply for Leave</h3>
          </div>
          <div className="lm-card-body">
            <form onSubmit={handleSubmit} className="lm-form">
              <div className="lm-form-group">
                <label>Leave Type</label>
                <select name="leaveType" value={formData.leaveType} onChange={handleChange} required>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Earned Leave">Earned Leave / Annual Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Marriage Leave">Marriage Leave</option>
                  <option value="Bereavement Leave">Bereavement Leave</option>
                  <option value="Compensatory Off">Compensatory Off</option>
                  <option value="Other Leave">Other Leave</option>
                </select>
              </div>
              <div className="lm-form-row">
                <div className="lm-form-group">
                  <label>Start Date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                </div>
                <div className="lm-form-group">
                  <label>End Date</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
                </div>
              </div>
              {formData.leaveType === 'Bereavement Leave' && (
                <div className="lm-form-group">
                  <label>Relationship *</label>
                  <select name="relationship" value={formData.relationship} onChange={handleChange} required>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                  </select>
                </div>
              )}
              {requiresDocument && (
                <div className="lm-form-group">
                  <label>{documentLabel}</label>
                  <input type="file" name="document" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                  {document && (
                    <div className="lm-file-preview">
                      <p>Selected: {document.name} ({(document.size / 1024 / 1024).toFixed(2)} MB)</p>
                    </div>
                  )}
                </div>
              )}
              <div className="lm-form-group">
                <label>Reason</label>
                <textarea name="reason" rows="3" value={formData.reason} onChange={handleChange} required placeholder="Please provide a reason..."></textarea>
              </div>
              <button type="submit" className="lm-btn lm-btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="lm-card lm-mt-4">
        <div className="lm-card-header">
          <h3>Leave History</h3>
        </div>
        <div className="lm-card-body">
          {fetching ? (
            <p>Loading...</p>
          ) : leaves.length === 0 ? (
            <p className="lm-text-muted">No leave requests found.</p>
          ) : (
            <div className="lm-table-responsive">
              <table className="lm-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>{leave.leaveType}</td>
                      <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                      <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                      <td>{leave.numberOfDays}</td>
                      <td>
                        <span className="lm-truncate" title={leave.reason}>{leave.reason}</span>
                      </td>
                      <td>
                        {getStatusBadge(leave.status)}
                        {leave.status === 'Rejected' && leave.rejectionReason && (
                          <div className="lm-rejection-reason" title={leave.rejectionReason}>
                            Info
                          </div>
                        )}
                      </td>
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

export default LeaveManagement;
