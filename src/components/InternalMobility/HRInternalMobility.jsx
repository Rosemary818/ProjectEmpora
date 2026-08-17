import React, { useState, useEffect } from 'react';
import './HRInternalMobility.css';
import ScheduleInternalInterviewModal from './ScheduleInternalInterviewModal';

const HRInternalMobility = ({ user }) => {
  const [activeTab, setActiveTab] = useState('applications'); // 'opportunities', 'applications'
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRecommendation, setFilterRecommendation] = useState('');

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showAppDetailsModal, setShowAppDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [formData, setFormData] = useState({
    title: '', departmentId: '', designationId: '', employmentType: 'Full-time',
    vacancies: 1, experienceRequired: '', requiredSkills: '', description: '',
    responsibilities: '', qualifications: '', deadline: '', status: 'Draft'
  });
  const [editingId, setEditingId] = useState(null);

  // Interview Modal state
  const [interviewModalApp, setInterviewModalApp] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [oppRes, appRes, deptRes, desigRes] = await Promise.all([
        fetch('http://localhost:5000/api/internal-mobility/hr/opportunities', { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }),
        fetch('http://localhost:5000/api/internal-mobility/hr/applications', { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }),
        fetch('http://localhost:5000/api/departments', { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }),
        fetch('http://localhost:5000/api/designations', { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } })
      ]);
      const oppData = await oppRes.json();
      const appData = await appRes.json();
      const deptData = await deptRes.json();
      const desigData = await desigRes.json();

      if (oppData.success) setOpportunities(oppData.data);
      if (appData.success) setApplications(appData.data);
      if (deptData.success) setDepartments(deptData.data);
      if (desigData.success) setDesignations(desigData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (opp = null) => {
    if (opp) {
      setFormData({
        title: opp.title, departmentId: opp.departmentId?._id || opp.departmentId,
        designationId: opp.designationId?._id || opp.designationId, employmentType: opp.employmentType,
        vacancies: opp.vacancies, experienceRequired: opp.experienceRequired,
        requiredSkills: Array.isArray(opp.requiredSkills) ? opp.requiredSkills.join(', ') : opp.requiredSkills,
        description: opp.description, responsibilities: opp.responsibilities,
        qualifications: opp.qualifications, deadline: new Date(opp.deadline).toISOString().split('T')[0], status: opp.status
      });
      setEditingId(opp._id);
    } else {
      setFormData({
        title: '', departmentId: '', designationId: '', employmentType: 'Full-time',
        vacancies: 1, experienceRequired: '', requiredSkills: '', description: '',
        responsibilities: '', qualifications: '', deadline: '', status: 'Draft'
      });
      setEditingId(null);
    }
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
    };
    const url = editingId ? `http://localhost:5000/api/internal-mobility/hr/opportunities/${editingId}` : `http://localhost:5000/api/internal-mobility/hr/opportunities`;
    try {
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify(dataToSend)
      });
      const data = await res.json();
      if (data.success) {
        setShowFormModal(false);
        fetchInitialData();
      } else alert(data.message);
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this internal opportunity?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/internal-mobility/hr/opportunities/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) fetchInitialData();
      else alert(data.message);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleUpdateStatus = async (appId, newStatus, reason = null) => {
    try {
      const res = await fetch(`http://localhost:5000/api/internal-mobility/hr/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify({ status: newStatus, rejectionReason: reason })
      });
      const data = await res.json();
      if (data.success) {
        setApplications(applications.map(app => app._id === appId ? data.data : app));
        if (selectedApp?._id === appId) {
          setSelectedApp(data.data);
        }
        return true;
      } else {
        alert(data.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
  };

  const handleConfirmTransfer = async (appId) => {
    if (!window.confirm('Are you sure you want to confirm this transfer? This will permanently update the employee records.')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/internal-mobility/hr/applications/${appId}/confirm-transfer`, {
        method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Transfer confirmed successfully!');
        fetchInitialData();
        if (selectedApp?._id === appId) setShowAppDetailsModal(false);
      } else alert(data.message || 'Failed to confirm transfer.');
    } catch (error) {
      console.error('Error confirming transfer:', error);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedApp) return;
    const success = await handleUpdateStatus(selectedApp._id, 'Rejected', rejectionReason);
    if (success) {
      setShowRejectModal(false);
      setRejectionReason('');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Draft': { bg: '#f3f4f6', color: '#4b5563' },
      'Published': { bg: '#dcfce7', color: '#16a34a' },
      'Closed': { bg: '#fee2e2', color: '#dc2626' },
      'Applied': { bg: '#e0f2fe', color: '#0284c7' },
      'Under Review': { bg: '#e0e7ff', color: '#4338ca' },
      'Shortlisted': { bg: '#fef3c7', color: '#d97706' },
      'Interview Scheduled': { bg: '#fef08a', color: '#a16207' },
      'Selected': { bg: '#dcfce7', color: '#16a34a' },
      'Rejected': { bg: '#fee2e2', color: '#dc2626' },
      'Withdrawn': { bg: '#f3f4f6', color: '#6b7280' },
      'Transfer Completed': { bg: '#dcfce7', color: '#16a34a' }
    };
    const style = styles[status] || styles['Draft'];
    return (
      <span className="im-status-badge" style={{ backgroundColor: style.bg, color: style.color }}>
        {status}
      </span>
    );
  };

  // Filter logic
  const filteredApps = applications.filter(app => {
    const matchSearch = app.employeeId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        app.employeeId?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        app.employeeId?.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        app.opportunityId?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = filterDepartment ? app.targetDepartmentId?._id === filterDepartment : true;
    const matchStatus = filterStatus ? app.status === filterStatus : true;
    const matchRec = filterRecommendation ? app.managerRecommendation === filterRecommendation : true;
    
    return matchSearch && matchDept && matchStatus && matchRec;
  });

  if (loading) return <div className="im-loading">Loading Internal Mobility...</div>;

  return (
    <div className="im-hr-container">
      <div className="im-header">
        <div className="im-header-title">
          <h2>Internal Mobility Management</h2>
          <p>Manage internal opportunities, applications, and transfers.</p>
        </div>
        {activeTab === 'opportunities' && (
          <button className="im-btn-primary" onClick={() => handleOpenForm()}>
            + Create Opportunity
          </button>
        )}
      </div>

      <div className="im-tabs-container">
        <button className={`im-tab ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
          Applications ({applications.length})
        </button>
        <button className={`im-tab ${activeTab === 'opportunities' ? 'active' : ''}`} onClick={() => setActiveTab('opportunities')}>
          Opportunities ({opportunities.length})
        </button>
      </div>

      {activeTab === 'applications' && (
        <div className="im-applications-view">
          {/* Dashboard Summary Cards */}
          <div className="im-summary-cards">
            <div className="im-summary-card">
              <div className="title">Total Apps</div>
              <div className="value">{applications.length}</div>
            </div>
            <div className="im-summary-card">
              <div className="title">Pending Review</div>
              <div className="value">{applications.filter(a => a.managerRecommendation === 'Pending').length}</div>
            </div>
            <div className="im-summary-card">
              <div className="title">Recommended</div>
              <div className="value">{applications.filter(a => a.managerRecommendation === 'Recommended').length}</div>
            </div>
            <div className="im-summary-card">
              <div className="title">Shortlisted</div>
              <div className="value">{applications.filter(a => a.status === 'Shortlisted').length}</div>
            </div>
            <div className="im-summary-card">
              <div className="title">Transfers Pending</div>
              <div className="value">{applications.filter(a => a.status === 'Selected').length}</div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="im-filters-bar">
            <input 
              type="text" 
              placeholder="Search employee, ID, or job..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="im-input"
            />
            <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className="im-input">
              <option value="">All Target Depts</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="im-input">
              <option value="">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
              <option value="Transfer Completed">Transfer Completed</option>
            </select>
            <select value={filterRecommendation} onChange={(e) => setFilterRecommendation(e.target.value)} className="im-input">
              <option value="">All Recommendations</option>
              <option value="Pending">Pending</option>
              <option value="Recommended">Recommended</option>
              <option value="Not Recommended">Not Recommended</option>
              <option value="Not Required">Not Required</option>
            </select>
          </div>

          <div className="im-card">
            <div className="im-table-container">
              <table className="im-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Current Role</th>
                    <th>Applied Position</th>
                    <th>Applied Date</th>
                    <th>Manager Rec.</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.length > 0 ? filteredApps.map(app => (
                    <tr key={app._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', background: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4b5563', overflow: 'hidden' }}>
                            {app.employeeId?.profileImage ? <img src={app.employeeId.profileImage} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : `${app.employeeId?.firstName?.charAt(0)}${app.employeeId?.lastName?.charAt(0)}`}
                          </div>
                          <div>
                            <strong>{app.employeeId?.firstName} {app.employeeId?.lastName}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>ID: {app.employeeId?.employeeCode}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem' }}>{app.currentDesignationId?.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{app.currentDepartmentId?.departmentName}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem' }}>{app.opportunityId?.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{app.targetDepartmentId?.departmentName}</div>
                      </td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: '500', color: app.managerRecommendation === 'Recommended' ? '#16a34a' : app.managerRecommendation === 'Not Recommended' ? '#dc2626' : app.managerRecommendation === 'Not Required' ? '#4b5563' : '#d97706' }}>
                          {app.managerRecommendation === 'Pending' ? 'Pending Manager Review' : app.managerRecommendation}
                        </div>
                      </td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>
                        <button className="im-btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => { setSelectedApp(app); setShowAppDetailsModal(true); }}>
                          View
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No applications found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'opportunities' && (
        <div className="im-card">
          <div className="im-table-container">
            <table className="im-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Vacancies</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.length > 0 ? opportunities.map(opp => (
                  <tr key={opp._id}>
                    <td>
                      <strong>{opp.title}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{opp.employmentType}</div>
                    </td>
                    <td>{opp.departmentId?.departmentName || '-'}</td>
                    <td>{opp.designationId?.designationName || '-'}</td>
                    <td>{opp.vacancies}</td>
                    <td>{new Date(opp.deadline).toLocaleDateString()}</td>
                    <td>{getStatusBadge(opp.status)}</td>
                    <td>
                      <div className="im-actions-flex">
                        <button className="im-btn-icon" onClick={() => handleOpenForm(opp)} title="Edit">
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button className="im-btn-icon im-text-danger" onClick={() => handleDelete(opp._id)} title="Delete">
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No internal opportunities found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showAppDetailsModal && selectedApp && (
        <div className="im-modal-overlay" onClick={() => setShowAppDetailsModal(false)}>
          <div className="im-modal-content im-large" onClick={e => e.stopPropagation()}>
            <div className="im-modal-header">
              <h3>Application Details</h3>
              <button className="im-btn-close" onClick={() => setShowAppDetailsModal(false)}>✕</button>
            </div>
            <div className="im-modal-body" style={{ background: '#f9fafb' }}>
              <div className="im-details-grid">
                
                {/* Employee Info */}
                <div className="im-details-section">
                  <h4>Employee Information</h4>
                  <div className="im-info-row"><span>Name:</span> <strong>{selectedApp.employeeId?.firstName} {selectedApp.employeeId?.lastName}</strong></div>
                  <div className="im-info-row"><span>Employee ID:</span> <strong>{selectedApp.employeeId?.employeeCode}</strong></div>
                  <div className="im-info-row"><span>Email:</span> <strong>{selectedApp.employeeId?.email}</strong></div>
                  <div className="im-info-row"><span>Current Dept:</span> <strong>{selectedApp.currentDepartmentId?.departmentName}</strong></div>
                  <div className="im-info-row"><span>Current Desig:</span> <strong>{selectedApp.currentDesignationId?.title}</strong></div>
                </div>

                {/* Opportunity Info */}
                <div className="im-details-section">
                  <h4>Internal Opportunity</h4>
                  <div className="im-info-row"><span>Job Title:</span> <strong>{selectedApp.opportunityId?.title}</strong></div>
                  <div className="im-info-row"><span>Target Dept:</span> <strong>{selectedApp.targetDepartmentId?.departmentName}</strong></div>
                  <div className="im-info-row"><span>Target Desig:</span> <strong>{selectedApp.targetDesignationId?.title}</strong></div>
                  <div className="im-info-row"><span>Location:</span> <strong>{selectedApp.opportunityId?.location || 'Not Specified'}</strong></div>
                </div>

                {/* Application Details */}
                <div className="im-details-section" style={{ gridColumn: '1 / -1' }}>
                  <h4>Application Details</h4>
                  <div className="im-info-row"><span>Applied Date:</span> <strong>{new Date(selectedApp.createdAt).toLocaleDateString()}</strong></div>
                  <div style={{ marginTop: '1rem' }}>
                    <div className="im-label">Reason for Applying</div>
                    <div className="im-value-box">{selectedApp.reason}</div>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <div className="im-label">Relevant Skills</div>
                    <div className="im-value-box">{selectedApp.relevantSkills}</div>
                  </div>
                  {selectedApp.additionalComments && (
                    <div style={{ marginTop: '1rem' }}>
                      <div className="im-label">Additional Comments</div>
                      <div className="im-value-box">{selectedApp.additionalComments}</div>
                    </div>
                  )}
                </div>

                {/* Manager Review */}
                <div className="im-details-section" style={{ gridColumn: '1 / -1' }}>
                  <h4>Manager Review</h4>
                  <div className="im-info-row">
                    <span>Recommendation:</span> 
                    <strong style={{ color: selectedApp.managerRecommendation === 'Recommended' ? '#16a34a' : selectedApp.managerRecommendation === 'Not Recommended' ? '#dc2626' : '#d97706' }}>
                      {selectedApp.managerRecommendation === 'Pending' ? 'Pending Manager Review' : selectedApp.managerRecommendation}
                    </strong>
                  </div>
                  {selectedApp.managerRemarks && (
                    <div style={{ marginTop: '1rem' }}>
                      <div className="im-label">Manager Remarks</div>
                      <div className="im-value-box">{selectedApp.managerRemarks}</div>
                    </div>
                  )}
                </div>
                
                {/* Application Status & HR Actions */}
                <div className="im-details-section" style={{ gridColumn: '1 / -1', borderLeft: '4px solid #3b82f6', background: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4>Current Status: {getStatusBadge(selectedApp.status)}</h4>
                    
                    <div className="im-hr-actions">
                      {selectedApp.managerRecommendation === 'Pending' && (
                        <div style={{ color: '#d97706', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>⏳ Waiting for Manager Review</span>
                        </div>
                      )}

                      {['Recommended', 'Not Recommended', 'Not Required'].includes(selectedApp.managerRecommendation) && ['Applied', 'Under Review'].includes(selectedApp.status) && (
                        <>
                          <button className="im-btn-outline im-text-danger" onClick={() => { setShowRejectModal(true); }}>Reject</button>
                          <button className="im-btn-primary" onClick={() => handleUpdateStatus(selectedApp._id, 'Shortlisted')}>Shortlist</button>
                        </>
                      )}

                      {selectedApp.status === 'Shortlisted' && (
                        <>
                          <button className="im-btn-outline im-text-danger" onClick={() => { setShowRejectModal(true); }}>Reject</button>
                          <button className="im-btn-primary" onClick={() => setInterviewModalApp(selectedApp)}>Schedule Interview</button>
                        </>
                      )}

                      {selectedApp.status === 'Interview Scheduled' && (
                        <>
                          <button className="im-btn-outline im-text-danger" onClick={() => { setShowRejectModal(true); }}>Reject</button>
                          <button className="im-btn-primary" style={{ backgroundColor: '#16a34a' }} onClick={() => handleUpdateStatus(selectedApp._id, 'Selected')}>Select Candidate</button>
                        </>
                      )}

                      {selectedApp.status === 'Selected' && (
                        <button className="im-btn-primary" style={{ backgroundColor: '#4338ca' }} onClick={() => handleConfirmTransfer(selectedApp._id)}>
                          Confirm Internal Transfer
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {selectedApp.rejectionReason && (
                    <div style={{ marginTop: '1rem', background: '#fee2e2', padding: '1rem', borderRadius: '6px' }}>
                      <div className="im-label" style={{ color: '#dc2626' }}>Rejection Reason</div>
                      <div style={{ color: '#991b1b', marginTop: '0.5rem' }}>{selectedApp.rejectionReason}</div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="im-modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="im-modal-content" onClick={e => e.stopPropagation()}>
            <div className="im-modal-header">
              <h3>Reject Application?</h3>
              <button className="im-btn-close" onClick={() => setShowRejectModal(false)}>✕</button>
            </div>
            <div className="im-modal-body">
              <div className="im-form-group im-full-width">
                <label>Optional Rejection Reason</label>
                <textarea 
                  rows="4" 
                  value={rejectionReason} 
                  onChange={e => setRejectionReason(e.target.value)} 
                  className="im-input"
                  placeholder="Explain why this application was rejected..."
                ></textarea>
              </div>
            </div>
            <div className="im-modal-footer">
              <button className="im-btn-outline" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="im-btn-primary" style={{ backgroundColor: '#dc2626' }} onClick={handleRejectSubmit}>Reject Application</button>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Form Modal */}
      {showFormModal && (
        <div className="im-modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="im-modal-content" onClick={e => e.stopPropagation()}>
            <div className="im-modal-header">
              <h3>{editingId ? 'Edit Opportunity' : 'Create Internal Opportunity'}</h3>
              <button className="im-btn-close" onClick={() => setShowFormModal(false)}>✕</button>
            </div>
            <div className="im-modal-body">
              <form onSubmit={handleSubmit} className="im-form-grid">
                <div className="im-form-group">
                  <label>Job Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="im-input" />
                </div>
                
                <div className="im-form-group">
                  <label>Department</label>
                  <select value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value, designationId: ''})} required className="im-input">
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName}</option>)}
                  </select>
                </div>
                
                <div className="im-form-group">
                  <label>Designation</label>
                  <select value={formData.designationId} onChange={e => setFormData({...formData, designationId: e.target.value})} required className="im-input" disabled={!formData.departmentId}>
                    <option value="">{formData.departmentId ? 'Select Designation' : 'Select a Department First'}</option>
                    {designations
                      .filter(d => d.departmentId === formData.departmentId || (d.departmentId && d.departmentId._id === formData.departmentId))
                      .map(d => <option key={d._id} value={d._id}>{d.designationName}</option>)}
                  </select>
                </div>

                <div className="im-form-group">
                  <label>Employment Type</label>
                  <select value={formData.employmentType} onChange={e => setFormData({...formData, employmentType: e.target.value})} className="im-input">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div className="im-form-group">
                  <label>Vacancies</label>
                  <input type="number" min="1" value={formData.vacancies} onChange={e => setFormData({...formData, vacancies: e.target.value})} required className="im-input" />
                </div>

                <div className="im-form-group">
                  <label>Experience Required</label>
                  <input type="text" placeholder="e.g., 2-4 years" value={formData.experienceRequired} onChange={e => setFormData({...formData, experienceRequired: e.target.value})} required className="im-input" />
                </div>

                <div className="im-form-group">
                  <label>Required Skills (comma separated)</label>
                  <input type="text" value={formData.requiredSkills} onChange={e => setFormData({...formData, requiredSkills: e.target.value})} required className="im-input" />
                </div>

                <div className="im-form-group">
                  <label>Application Deadline</label>
                  <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} required className="im-input" />
                </div>

                <div className="im-form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="im-input">
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="im-form-group im-full-width">
                  <label>Job Description</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="im-input"></textarea>
                </div>

                <div className="im-form-group im-full-width">
                  <label>Responsibilities</label>
                  <textarea rows="3" value={formData.responsibilities} onChange={e => setFormData({...formData, responsibilities: e.target.value})} required className="im-input"></textarea>
                </div>

                <div className="im-form-group im-full-width">
                  <label>Qualifications</label>
                  <textarea rows="3" value={formData.qualifications} onChange={e => setFormData({...formData, qualifications: e.target.value})} required className="im-input"></textarea>
                </div>
              </form>
            </div>
            <div className="im-modal-footer">
              <button className="im-btn-outline" onClick={() => setShowFormModal(false)}>Cancel</button>
              <button className="im-btn-primary" onClick={handleSubmit}>Save Opportunity</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {interviewModalApp && (
        <ScheduleInternalInterviewModal
          application={{ ...interviewModalApp, opportunityId: interviewModalApp.opportunityId._id }}
          onClose={() => setInterviewModalApp(null)}
          onSuccess={(interview) => {
            handleUpdateStatus(interviewModalApp._id, 'Interview Scheduled');
            setInterviewModalApp(null);
            alert('Interview scheduled successfully');
          }}
        />
      )}
    </div>
  );
};

export default HRInternalMobility;
