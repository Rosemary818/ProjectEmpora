import React, { useState, useEffect } from 'react';
import './EmployeeInternalMobility.css'; // We can reuse the Employee CSS as the design is identical

const ManagerInternalMobility = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState('opportunities');
  const [opportunities, setOpportunities] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [teamApplications, setTeamApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  const [departments, setDepartments] = useState([]);
  
  // Application Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [formData, setFormData] = useState({
    reason: '',
    relevantSkills: '',
    additionalComments: ''
  });

  // Details Modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Recommend Modal
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [selectedTeamApp, setSelectedTeamApp] = useState(null);
  const [recommendData, setRecommendData] = useState({
    managerRecommendation: 'Recommended',
    managerRemarks: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [oppRes, appsRes, teamAppsRes] = await Promise.all([
        fetch('http://localhost:5000/api/internal-mobility/opportunities', { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }),
        fetch('http://localhost:5000/api/internal-mobility/my-applications', { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }),
        fetch('http://localhost:5000/api/internal-mobility/manager/team-applications', { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } })
      ]);
      const oppData = await oppRes.json();
      const appsData = await appsRes.json();
      const teamAppsData = await teamAppsRes.json();

      if (oppData.success) {
        setOpportunities(oppData.data);
        const depts = [...new Set(oppData.data.map(o => o.departmentId?.departmentName).filter(Boolean))];
        setDepartments(depts);
      }
      if (appsData.success) setMyApplications(appsData.data);
      if (teamAppsData.success) setTeamApplications(teamAppsData.data);
    } catch (error) {
      console.error('Error fetching internal mobility data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApply = (opp) => {
    setSelectedOpp(opp);
    setFormData({ reason: '', relevantSkills: '', additionalComments: '' });
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/internal-mobility/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          opportunityId: selectedOpp._id,
          ...formData
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowApplyModal(false);
        fetchInitialData();
        setActiveSubTab('applications');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('An error occurred during application.');
    }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/internal-mobility/my-applications/${appId}/withdraw`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchInitialData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error withdrawing:', error);
    }
  };

  const handleOpenRecommend = (app) => {
    setSelectedTeamApp(app);
    setRecommendData({
      managerRecommendation: app.managerRecommendation !== 'Pending' ? app.managerRecommendation : 'Recommended',
      managerRemarks: app.managerRemarks || ''
    });
    setShowRecommendModal(true);
  };

  const handleSubmitRecommendation = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/internal-mobility/manager/applications/${selectedTeamApp._id}/recommend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(recommendData)
      });
      const data = await res.json();
      if (data.success) {
        setShowRecommendModal(false);
        fetchInitialData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error recommending:', error);
      alert('An error occurred while submitting recommendation.');
    }
  };

  const hasApplied = (oppId) => {
    return myApplications.some(app => app.opportunityId?._id === oppId && app.status !== 'Withdrawn');
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(search.toLowerCase());
    const matchesDept = departmentFilter ? opp.departmentId?.departmentName === departmentFilter : true;
    return matchesSearch && matchesDept;
  });

  const getStatusBadge = (status) => {
    const styles = {
      'Applied': { bg: '#e0f2fe', color: '#0284c7' },
      'Under Review': { bg: '#e0e7ff', color: '#4338ca' },
      'Shortlisted': { bg: '#fef3c7', color: '#d97706' },
      'Interview Scheduled': { bg: '#fef08a', color: '#a16207' },
      'Selected': { bg: '#dcfce7', color: '#16a34a' },
      'Rejected': { bg: '#fee2e2', color: '#dc2626' },
      'Withdrawn': { bg: '#f3f4f6', color: '#6b7280' },
      'Transfer Completed': { bg: '#dcfce7', color: '#15803d' }
    };
    const style = styles[status] || styles['Applied'];
    return (
      <span className="im-status-badge" style={{ backgroundColor: style.bg, color: style.color }}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="im-loading">Loading Internal Mobility...</div>;

  const underReviewCount = myApplications.filter(a => a.status === 'Under Review').length;
  const selectedCount = myApplications.filter(a => a.status === 'Selected').length;
  const pendingTeamCount = teamApplications.filter(a => a.managerRecommendation === 'Pending').length;

  return (
    <div className="im-emp-container">
      <div className="im-welcome-banner">
        <h1>Internal Mobility Hub</h1>
        <p>Explore internal career opportunities, apply for positions, and review your team's applications.</p>
      </div>

      <div className="im-metrics-grid">
        <div className="im-metric-card" onClick={() => setActiveSubTab('opportunities')} style={{ cursor: 'pointer' }}>
          <div className="im-metric-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>
          <div className="im-metric-info">
            <h3>Available Opportunities</h3>
            <p className="im-metric-value">{opportunities.length}</p>
          </div>
        </div>

        <div className="im-metric-card" onClick={() => setActiveSubTab('applications')} style={{ cursor: 'pointer' }}>
          <div className="im-metric-icon" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          </div>
          <div className="im-metric-info">
            <h3>My Applications</h3>
            <p className="im-metric-value">{myApplications.length}</p>
          </div>
        </div>

        <div className="im-metric-card" onClick={() => setActiveSubTab('team-applications')} style={{ cursor: 'pointer' }}>
          <div className="im-metric-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <div className="im-metric-info">
            <h3>Pending Team Approvals</h3>
            <p className="im-metric-value">{pendingTeamCount}</p>
          </div>
        </div>
      </div>

      <div className="im-tabs">
        <button className={`im-tab ${activeSubTab === 'opportunities' ? 'active' : ''}`} onClick={() => setActiveSubTab('opportunities')}>Internal Opportunities</button>
        <button className={`im-tab ${activeSubTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveSubTab('applications')}>My Applications</button>
        <button className={`im-tab ${activeSubTab === 'team-applications' ? 'active' : ''}`} onClick={() => setActiveSubTab('team-applications')}>Team Applications</button>
      </div>

      <div className="im-content">
        {activeSubTab === 'opportunities' && (
          <>
            <div className="im-filters">
              <input type="text" placeholder="Search by Job Title..." value={search} onChange={e => setSearch(e.target.value)} className="im-search-input" />
              <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="im-filter-select">
                <option value="">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="im-grid">
              {filteredOpportunities.length > 0 ? filteredOpportunities.map(opp => (
                <div key={opp._id} className="im-opp-card">
                  <div className="im-opp-header">
                    <h3>{opp.title}</h3>
                    <span className="im-dept-badge">{opp.departmentId?.departmentName}</span>
                  </div>
                  <div className="im-opp-details">
                    <p><span>Designation:</span> {opp.designationId?.designationName}</p>
                    <p><span>Location:</span> {opp.location}</p>
                    <p><span>Type:</span> {opp.employmentType}</p>
                    <p><span>Vacancies:</span> {opp.vacancies}</p>
                    <p><span>Deadline:</span> {new Date(opp.deadline).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="im-opp-actions">
                    <button className="im-btn-outline" onClick={() => { setSelectedOpp(opp); setShowDetailsModal(true); }}>View Details</button>
                    {hasApplied(opp._id) ? (
                      <button className="im-btn-secondary" disabled>Already Applied</button>
                    ) : (
                      <button className="im-btn-primary" onClick={() => handleOpenApply(opp)}>Apply Internally</button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="im-empty-state">No internal opportunities match your filters.</div>
              )}
            </div>
          </>
        )}

        {activeSubTab === 'applications' && (
          <div className="im-card">
            <div className="im-card-body" style={{ padding: 0 }}>
              <div className="im-table-container">
                <table className="im-table">
                  <thead>
                    <tr>
                      <th>Opportunity</th>
                      <th>Target Department</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myApplications.length > 0 ? myApplications.map(app => (
                      <tr key={app._id}>
                        <td>
                          <strong>{app.opportunityId?.title || 'Unknown Opportunity'}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{app.opportunityId?.designationId?.designationName}</div>
                        </td>
                        <td>{app.opportunityId?.departmentId?.departmentName || '-'}</td>
                        <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td>{getStatusBadge(app.status)}</td>
                        <td>
                          {(app.status === 'Applied' || app.status === 'Under Review') && (
                            <button className="im-btn-text-danger" onClick={() => handleWithdraw(app._id)}>Withdraw</button>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>You haven't applied for any internal roles yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'team-applications' && (
          <div className="im-card">
            <div className="im-card-body" style={{ padding: 0 }}>
              <div className="im-table-container">
                <table className="im-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Current Role</th>
                      <th>Target Role</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamApplications.length > 0 ? teamApplications.map(app => (
                      <tr key={app._id}>
                        <td>
                          <strong>{app.employeeId?.firstName} {app.employeeId?.lastName}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>ID: {app.employeeId?.employeeCode}</div>
                        </td>
                        <td>
                          <div>{app.currentDepartmentId?.departmentName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{app.currentDesignationId?.title}</div>
                        </td>
                        <td>
                          <div>{app.targetDepartmentId?.departmentName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{app.targetDesignationId?.title}</div>
                        </td>
                        <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div>{getStatusBadge(app.status)}</div>
                          <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {app.managerRecommendation === 'Pending' ? (
                              <span style={{ color: '#d97706' }}>Needs Review</span>
                            ) : (
                              <span style={{ color: app.managerRecommendation === 'Recommended' ? '#16a34a' : '#dc2626' }}>
                                {app.managerRecommendation}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <button className="im-btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }} onClick={() => handleOpenRecommend(app)}>
                            Review Application
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No team member applications found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedOpp && (
        <div className="im-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="im-modal-content im-large" onClick={e => e.stopPropagation()}>
            <div className="im-modal-header">
              <h3>Opportunity Details</h3>
              <button className="im-btn-close" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>
            <div className="im-modal-body im-details-body">
              <h2 className="im-details-title">{selectedOpp.title}</h2>
              <div className="im-details-meta">
                <span><strong>Department:</strong> {selectedOpp.departmentId?.departmentName}</span>
                <span><strong>Location:</strong> {selectedOpp.location}</span>
                <span><strong>Type:</strong> {selectedOpp.employmentType}</span>
                <span><strong>Deadline:</strong> {new Date(selectedOpp.deadline).toLocaleDateString()}</span>
              </div>

              <div className="im-details-section">
                <h4>Job Description</h4>
                <p>{selectedOpp.description}</p>
              </div>

              <div className="im-details-section">
                <h4>Responsibilities</h4>
                <p>{selectedOpp.responsibilities}</p>
              </div>

              <div className="im-details-section">
                <h4>Qualifications & Skills</h4>
                <p>{selectedOpp.qualifications}</p>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Required Skills:</strong> {Array.isArray(selectedOpp.requiredSkills) ? selectedOpp.requiredSkills.join(', ') : selectedOpp.requiredSkills}
                </div>
              </div>
            </div>
            <div className="im-modal-footer">
              <button className="im-btn-outline" onClick={() => setShowDetailsModal(false)}>Close</button>
              {hasApplied(selectedOpp._id) ? (
                <button className="im-btn-secondary" disabled>Already Applied</button>
              ) : (
                <button className="im-btn-primary" onClick={() => { setShowDetailsModal(false); handleOpenApply(selectedOpp); }}>Apply Internally</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {showApplyModal && selectedOpp && (
        <div className="im-modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="im-modal-content" onClick={e => e.stopPropagation()}>
            <div className="im-modal-header">
              <h3>Apply Internally: {selectedOpp.title}</h3>
              <button className="im-btn-close" onClick={() => setShowApplyModal(false)}>✕</button>
            </div>
            <div className="im-modal-body">
              <div className="im-alert-info">
                <strong>Employee Information</strong>
                <p>Your current department and designation will be automatically attached to this application.</p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  Name: {user.firstName} {user.lastName} <br/>
                  Employee ID: {user.employeeCode}
                </div>
              </div>

              <form onSubmit={handleSubmitApplication} className="im-form-grid" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div className="im-form-group">
                  <label>Reason for Applying</label>
                  <textarea rows="3" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} required className="im-input" placeholder="Why are you interested in this internal transfer?"></textarea>
                </div>
                
                <div className="im-form-group">
                  <label>Relevant Skills</label>
                  <textarea rows="2" value={formData.relevantSkills} onChange={e => setFormData({...formData, relevantSkills: e.target.value})} required className="im-input" placeholder="Highlight your skills relevant to this role"></textarea>
                </div>

                <div className="im-form-group">
                  <label>Additional Comments (Optional)</label>
                  <textarea rows="2" value={formData.additionalComments} onChange={e => setFormData({...formData, additionalComments: e.target.value})} className="im-input"></textarea>
                </div>
              </form>
            </div>
            <div className="im-modal-footer">
              <button className="im-btn-outline" onClick={() => setShowApplyModal(false)}>Cancel</button>
              <button className="im-btn-primary" onClick={handleSubmitApplication}>Submit Application</button>
            </div>
          </div>
        </div>
      )}

      {/* Manager Recommend Modal */}
      {showRecommendModal && selectedTeamApp && (
        <div className="im-modal-overlay" onClick={() => setShowRecommendModal(false)}>
          <div className="im-modal-content" onClick={e => e.stopPropagation()}>
            <div className="im-modal-header">
              <h3>Review Team Member's Application</h3>
              <button className="im-btn-close" onClick={() => setShowRecommendModal(false)}>✕</button>
            </div>
            <div className="im-modal-body">
              <div className="im-details-section">
                <p><strong>Employee:</strong> {selectedTeamApp.employeeId?.firstName} {selectedTeamApp.employeeId?.lastName}</p>
                <p><strong>Applying For:</strong> {selectedTeamApp.opportunityId?.title} (Department: {selectedTeamApp.targetDepartmentId?.departmentName})</p>
                <p><strong>Reason:</strong> {selectedTeamApp.reason}</p>
                <p><strong>Relevant Skills:</strong> {selectedTeamApp.relevantSkills}</p>
                <p><strong>Comments:</strong> {selectedTeamApp.additionalComments || '-'}</p>
              </div>

              <form onSubmit={handleSubmitRecommendation} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div className="im-form-group">
                  <label>Recommendation</label>
                  <select 
                    value={recommendData.managerRecommendation} 
                    onChange={e => setRecommendData({...recommendData, managerRecommendation: e.target.value})} 
                    className="im-input"
                  >
                    <option value="Recommended">Recommend</option>
                    <option value="Not Recommended">Do Not Recommend</option>
                  </select>
                </div>
                
                <div className="im-form-group" style={{ marginTop: '1rem' }}>
                  <label>Remarks</label>
                  <textarea 
                    rows="3" 
                    value={recommendData.managerRemarks} 
                    onChange={e => setRecommendData({...recommendData, managerRemarks: e.target.value})} 
                    required 
                    className="im-input" 
                    placeholder="Provide your feedback regarding this internal transfer"
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="im-modal-footer">
              <button className="im-btn-outline" onClick={() => setShowRecommendModal(false)}>Cancel</button>
              <button className="im-btn-primary" onClick={handleSubmitRecommendation}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerInternalMobility;
