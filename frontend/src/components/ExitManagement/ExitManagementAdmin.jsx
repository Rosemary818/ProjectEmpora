import React, { useState, useEffect } from 'react';
import './ExitManagement.css';

const ExitManagementAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'HR_REVIEW', 'CLEARANCE', 'INTERVIEW', 'FINALIZE'

  // Forms state
  const [hrReviewForm, setHrReviewForm] = useState({ status: 'Approved', noticePeriodDays: 30, approvedLastWorkingDate: '', comments: '' });
  const [clearanceForm, setClearanceForm] = useState({ assetClearance: 'Pending', salaryClearance: 'Pending', leaveClearance: 'Pending', documentClearance: 'Pending', managerClearance: 'Pending' });
  const [interviewForm, setInterviewForm] = useState({ scheduledDate: '', scheduledTime: '', interviewerId: '', status: 'Pending', feedback: '', comments: '' });

  // Users for interviewer dropdown
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchResignations();
    fetchUsers();
  }, []);

  const fetchResignations = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/exits', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) setRequests(data.data);
      else setError(data.message);
    } catch (err) {
      setError('Failed to fetch resignations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (req, type) => {
    setSelectedRequest(req);
    setActiveModal(type);
    
    if (type === 'HR_REVIEW') {
      setHrReviewForm({
        status: req.hrReview?.status !== 'Pending' ? req.hrReview.status : 'Approved',
        noticePeriodDays: req.noticePeriodDays || 30,
        approvedLastWorkingDate: req.approvedLastWorkingDate ? new Date(req.approvedLastWorkingDate).toISOString().split('T')[0] : new Date(req.proposedLastWorkingDate).toISOString().split('T')[0],
        comments: req.hrReview?.comments || ''
      });
    } else if (type === 'CLEARANCE') {
      setClearanceForm({
        assetClearance: req.clearance?.assetClearance || 'Pending',
        salaryClearance: req.clearance?.salaryClearance || 'Pending',
        leaveClearance: req.clearance?.leaveClearance || 'Pending',
        documentClearance: req.clearance?.documentClearance || 'Pending',
        managerClearance: req.clearance?.managerClearance || 'Pending',
      });
    } else if (type === 'INTERVIEW') {
      setInterviewForm({
        scheduledDate: req.exitInterview?.scheduledDate ? new Date(req.exitInterview.scheduledDate).toISOString().split('T')[0] : '',
        scheduledTime: req.exitInterview?.scheduledTime || '',
        interviewerId: req.exitInterview?.interviewerId || '',
        status: req.exitInterview?.status || 'Pending',
        feedback: req.exitInterview?.feedback || '',
        comments: req.exitInterview?.comments || ''
      });
    }
  };

  const handleHrReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/exits/${selectedRequest._id}/hr-review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify(hrReviewForm)
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(prev => prev.map(r => r._id === data.data._id ? data.data : r));
        setActiveModal(null);
      } else alert(data.message);
    } catch (err) {
      alert('Failed to update HR review.');
    }
  };

  const handleClearanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/exits/${selectedRequest._id}/clearance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify(clearanceForm)
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(prev => prev.map(r => r._id === data.data._id ? data.data : r));
        setActiveModal(null);
      } else alert(data.message);
    } catch (err) {
      alert('Failed to update clearance.');
    }
  };

  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    try {
      let url = `http://localhost:5000/api/exits/${selectedRequest._id}/exit-interview`;
      if (interviewForm.status === 'Completed') {
        url = `http://localhost:5000/api/exits/${selectedRequest._id}/exit-interview/complete`;
      }

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify(interviewForm)
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(prev => prev.map(r => r._id === data.data._id ? data.data : r));
        setActiveModal(null);
      } else alert(data.message);
    } catch (err) {
      alert('Failed to update exit interview.');
    }
  };

  const handleFinalizeExit = async () => {
    if (!window.confirm("Are you sure? This will mark the exit as completed and DEACTIVATE the employee's account.")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/exits/${selectedRequest._id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(prev => prev.map(r => r._id === data.data._id ? data.data : r));
        setActiveModal(null);
      } else alert(data.message);
    } catch (err) {
      alert('Failed to finalize exit.');
    }
  };

  const getStatusBadgeClass = (status) => {
    const map = {
      'Submitted': 'badge-submitted', 'Manager Review': 'badge-manager', 'HR Review': 'badge-hr',
      'Notice Period': 'badge-notice', 'Clearance Pending': 'badge-clearance', 'Exit Interview': 'badge-interview',
      'Completed': 'badge-completed', 'Rejected': 'badge-rejected', 'Cancelled': 'badge-cancelled'
    };
    return map[status] || 'badge-submitted';
  };

  // Stats
  const activeExits = requests.filter(r => !['Completed', 'Rejected', 'Cancelled'].includes(r.status)).length;
  const pendingHr = requests.filter(r => r.status === 'HR Review').length;
  const pendingClearance = requests.filter(r => r.status === 'Notice Period' || r.status === 'Clearance Pending').length;

  if (loading) return <div style={{padding: '2rem'}}>Loading...</div>;

  return (
    <div className="exit-container">
      <div className="exit-header">
        <div>
          <h2>Exit Management</h2>
          <p>Manage employee resignations and offboarding</p>
        </div>
      </div>

      <div className="exit-stats-grid">
        <div className="exit-stat-card">
          <span className="exit-stat-title">Active Exits</span>
          <span className="exit-stat-value">{activeExits}</span>
        </div>
        <div className="exit-stat-card">
          <span className="exit-stat-title">Pending HR Review</span>
          <span className="exit-stat-value">{pendingHr}</span>
        </div>
        <div className="exit-stat-card">
          <span className="exit-stat-title">Clearance Pending</span>
          <span className="exit-stat-value">{pendingClearance}</span>
        </div>
      </div>

      {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

      <div className="exit-table-container">
        <table className="exit-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Resignation Date</th>
              <th>Proposed LWD</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req._id}>
                <td>
                  <div style={{fontWeight: 500, color: '#111827'}}>{req.employeeId?.firstName} {req.employeeId?.lastName}</div>
                  <div style={{fontSize: '0.75rem', color: '#6b7280'}}>{req.employeeId?.employeeCode}</div>
                </td>
                <td>{req.departmentId?.departmentName || 'N/A'}</td>
                <td>{new Date(req.resignationDate).toLocaleDateString()}</td>
                <td>{new Date(req.proposedLastWorkingDate).toLocaleDateString()}</td>
                <td><span className={`exit-badge ${getStatusBadgeClass(req.status)}`}>{req.status}</span></td>
                <td>
                  <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                    {(req.status === 'HR Review' || req.status === 'Manager Review') && (
                      <button className="exit-action-btn exit-btn-primary" onClick={() => openModal(req, 'HR_REVIEW')}>HR Review</button>
                    )}
                    {(['Notice Period', 'Clearance Pending', 'Exit Interview'].includes(req.status)) && (
                      <button className="exit-action-btn" onClick={() => openModal(req, 'CLEARANCE')}>Clearance</button>
                    )}
                    {(['Clearance Pending', 'Exit Interview'].includes(req.status)) && (
                      <button className="exit-action-btn" onClick={() => openModal(req, 'INTERVIEW')}>Interview</button>
                    )}
                    {req.status === 'Exit Interview' && req.clearance?.assetClearance === 'Completed' && req.exitInterview?.status === 'Completed' && (
                      <button className="exit-action-btn exit-btn-approve" onClick={() => openModal(req, 'FINALIZE')}>Finalize Exit</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* HR Review Modal */}
      {activeModal === 'HR_REVIEW' && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="exit-card" style={{width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'}}>
            <h3>HR Review: {selectedRequest?.employeeId?.firstName} {selectedRequest?.employeeId?.lastName}</h3>
            <div className="exit-details-grid" style={{background: '#f9fafb', padding: '1rem', borderRadius: '6px', marginBottom: '1rem'}}>
              <div className="exit-detail-item">
                <span className="exit-detail-label">Manager Review</span>
                <span className={`exit-badge ${selectedRequest?.managerReview?.status === 'Approved' ? 'badge-completed' : 'badge-submitted'}`}>{selectedRequest?.managerReview?.status}</span>
              </div>
            </div>
            <form onSubmit={handleHrReviewSubmit}>
              <div className="exit-form-group">
                <label>Decision</label>
                <select className="exit-select" value={hrReviewForm.status} onChange={e => setHrReviewForm({...hrReviewForm, status: e.target.value})} required>
                  <option value="Approved">Approve Resignation</option>
                  <option value="Rejected">Reject Resignation</option>
                </select>
              </div>
              {hrReviewForm.status === 'Approved' && (
                <>
                  <div className="exit-form-group">
                    <label>Notice Period (Days)</label>
                    <input type="number" className="exit-input" value={hrReviewForm.noticePeriodDays} onChange={e => setHrReviewForm({...hrReviewForm, noticePeriodDays: e.target.value})} required />
                  </div>
                  <div className="exit-form-group">
                    <label>Approved Last Working Date</label>
                    <input type="date" className="exit-input" value={hrReviewForm.approvedLastWorkingDate} onChange={e => setHrReviewForm({...hrReviewForm, approvedLastWorkingDate: e.target.value})} required />
                  </div>
                </>
              )}
              <div className="exit-form-group">
                <label>Comments</label>
                <textarea className="exit-textarea" value={hrReviewForm.comments} onChange={e => setHrReviewForm({...hrReviewForm, comments: e.target.value})}></textarea>
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
                <button type="button" className="exit-action-btn" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="exit-action-btn exit-btn-primary">Save HR Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clearance Modal */}
      {activeModal === 'CLEARANCE' && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="exit-card" style={{width: '90%', maxWidth: '500px'}}>
            <h3>Update Clearance</h3>
            <form onSubmit={handleClearanceSubmit}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem'}}>
                {Object.keys(clearanceForm).map(key => (
                  <div key={key} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px'}}>
                    <span style={{fontWeight: 500, color: '#374151', textTransform: 'capitalize'}}>{key.replace('Clearance', ' Clearance')}</span>
                    <select className="exit-select" style={{width: 'auto'}} value={clearanceForm[key]} onChange={e => setClearanceForm({...clearanceForm, [key]: e.target.value})}>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                ))}
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
                <button type="button" className="exit-action-btn" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="exit-action-btn exit-btn-primary">Save Clearance</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exit Interview Modal */}
      {activeModal === 'INTERVIEW' && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="exit-card" style={{width: '90%', maxWidth: '500px'}}>
            <h3>Exit Interview</h3>
            <form onSubmit={handleInterviewSubmit}>
              <div className="exit-form-group">
                <label>Status</label>
                <select className="exit-select" value={interviewForm.status} onChange={e => setInterviewForm({...interviewForm, status: e.target.value})}>
                  <option value="Pending">Scheduled / Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="exit-form-group">
                <label>Date</label>
                <input type="date" className="exit-input" value={interviewForm.scheduledDate} onChange={e => setInterviewForm({...interviewForm, scheduledDate: e.target.value})} required />
              </div>
              <div className="exit-form-group">
                <label>Time</label>
                <input type="time" className="exit-input" value={interviewForm.scheduledTime} onChange={e => setInterviewForm({...interviewForm, scheduledTime: e.target.value})} required />
              </div>
              <div className="exit-form-group">
                <label>Interviewer</label>
                <select className="exit-select" value={interviewForm.interviewerId} onChange={e => setInterviewForm({...interviewForm, interviewerId: e.target.value})} required>
                  <option value="">Select Interviewer...</option>
                  {users.filter(u => u.role === 'HRAdmin' || u.role === 'Manager').map(u => (
                    <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.role})</option>
                  ))}
                </select>
              </div>
              {interviewForm.status === 'Completed' && (
                <div className="exit-form-group">
                  <label>Feedback / Notes</label>
                  <textarea className="exit-textarea" value={interviewForm.feedback} onChange={e => setInterviewForm({...interviewForm, feedback: e.target.value})} required></textarea>
                </div>
              )}
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
                <button type="button" className="exit-action-btn" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="exit-action-btn exit-btn-primary">Save Interview</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Finalize Modal */}
      {activeModal === 'FINALIZE' && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="exit-card" style={{width: '90%', maxWidth: '400px', textAlign: 'center'}}>
            <div style={{fontSize: '3rem', color: '#16a34a', marginBottom: '1rem'}}>✓</div>
            <h3 style={{marginBottom: '0.5rem'}}>Finalize Offboarding</h3>
            <p style={{color: '#4b5563', marginBottom: '1.5rem'}}>
              Are you sure you want to finalize the offboarding for <strong>{selectedRequest?.employeeId?.firstName} {selectedRequest?.employeeId?.lastName}</strong>? 
              This action will mark the resignation as Completed and <strong>DEACTIVATE</strong> their employee account.
            </p>
            <div style={{display: 'flex', justifyContent: 'center', gap: '1rem'}}>
              <button className="exit-action-btn" onClick={() => setActiveModal(null)}>Cancel</button>
              <button className="exit-action-btn exit-btn-approve" onClick={handleFinalizeExit}>Complete Exit</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExitManagementAdmin;
