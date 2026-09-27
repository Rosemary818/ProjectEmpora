import React, { useState, useEffect } from 'react';
import './MyApplications.css';

const MyApplications = ({ onBrowseJobs }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and Sorting
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('latest'); // latest, oldest, title

  // Details Modal State
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/career-portal/my-applications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      
      let interviews = [];
      try {
        const intRes = await fetch('http://localhost:5000/api/interviews/candidate', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        const intData = await intRes.json();
        if (intData.success) {
          interviews = intData.data;
        }
      } catch (err) {
        console.error('Failed to fetch interviews for applications', err);
      }

      if (data.success) {
        const apps = data.data.map(app => {
          const appInterviews = interviews.filter(i => i.applicationId === app._id);
          appInterviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          return { ...app, latestInterview: appInterviews[0] || null };
        });
        setApplications(apps);
      }
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecruitmentStage = (status) => {
    if (['Applied', 'Under Review'].includes(status)) return 'Screening';
    if (['Shortlisted'].includes(status)) return 'Assessment';
    if (['Interview Scheduled', 'Interview Completed'].includes(status)) return 'Interviewing';
    if (['Selected', 'Offer Sent', 'Offer Accepted'].includes(status)) return 'Offer';
    if (status === 'Converted to Employee') return 'Hired';
    if (status === 'Rejected') return 'Not Proceeding';
    if (status === 'Withdrawn') return 'Withdrawn';
    return 'Processing';
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/career-portal/my-applications/${appId}/withdraw`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();

      if (data.success) {
        alert('Application successfully withdrawn.');
        fetchApplications();
        if (selectedApp && selectedApp._id === appId) {
          setSelectedApp(prev => ({ ...prev, status: 'Withdrawn' }));
        }
      } else {
        alert(data.message || 'Failed to withdraw application.');
      }
    } catch (error) {
      console.error('Failed to withdraw application:', error);
      alert('An error occurred while withdrawing application.');
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Applied': { bg: '#e0f2fe', color: '#0284c7' },
      'Under Review': { bg: '#e0e7ff', color: '#4338ca' },
      'Shortlisted': { bg: '#fef3c7', color: '#d97706' },
      'Interview Scheduled': { bg: '#fef08a', color: '#a16207' },
      'Selected': { bg: '#dcfce7', color: '#16a34a' },
      'Rejected': { bg: '#fee2e2', color: '#dc2626' },
      'Withdrawn': { bg: '#f3f4f6', color: '#6b7280' }
    };

    const style = statusStyles[status] || { bg: '#f3f4f6', color: '#6b7280' };

    return (
      <span className="app-status-badge" style={{ backgroundColor: style.bg, color: style.color }}>
        {status}
      </span>
    );
  };

  // Derived state for filters
  const departments = [...new Set(applications.map(a => a.jobId?.departmentId?.departmentName).filter(Boolean))];

  const filteredApplications = applications
    .filter(app => app.jobId?.title.toLowerCase().includes(search.toLowerCase()))
    .filter(app => (statusFilter ? app.status === statusFilter : true))
    .filter(app => (departmentFilter ? app.jobId?.departmentId?.departmentName === departmentFilter : true))
    .sort((a, b) => {
      if (sortOrder === 'latest') return new Date(b.appliedAt) - new Date(a.appliedAt);
      if (sortOrder === 'oldest') return new Date(a.appliedAt) - new Date(b.appliedAt);
      if (sortOrder === 'title') return (a.jobId?.title || '').localeCompare(b.jobId?.title || '');
      return 0;
    });

  if (loading) {
    return <div className="my-apps-loading">Loading your applications...</div>;
  }

  const totalApplications = applications.length;
  const underReviewCount = applications.filter(app => app.status === 'Under Review').length;
  const interviewsCount = applications.filter(app => app.status === 'Interview Scheduled' || app.status === 'Interview Completed').length;
  const selectedCount = applications.filter(app => app.status === 'Selected').length;

  if (applications.length === 0) {
    return (
      <div className="career-card" style={{ textAlign: 'center', padding: '4rem 2rem', marginTop: '2rem' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px', color: '#9ca3af', margin: '0 auto 1rem auto' }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>No Applications Yet</h3>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>You haven't applied for any jobs yet.</p>
        <button onClick={onBrowseJobs} className="career-btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'inline-block', width: 'auto' }}>
          Browse Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="my-apps-container">
      <div className="career-welcome-banner" style={{ marginBottom: '2rem' }}>
        <h1>My Applications</h1>
        <p>Track and manage your job applications.</p>
      </div>

      <div className="career-metrics-grid" style={{ marginBottom: '2rem' }}>
        <div className="career-metric-card">
          <div className="career-metric-icon" style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          </div>
          <div className="career-metric-info">
            <h3>Total Applications</h3>
            <p className="career-metric-value">{totalApplications}</p>
          </div>
        </div>

        <div className="career-metric-card">
          <div className="career-metric-icon" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </div>
          <div className="career-metric-info">
            <h3>Under Review</h3>
            <p className="career-metric-value">{underReviewCount}</p>
          </div>
        </div>

        <div className="career-metric-card">
          <div className="career-metric-icon" style={{ backgroundColor: '#fef08a', color: '#a16207' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          </div>
          <div className="career-metric-info">
            <h3>Interviews</h3>
            <p className="career-metric-value">{interviewsCount}</p>
          </div>
        </div>

        <div className="career-metric-card">
          <div className="career-metric-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          </div>
          <div className="career-metric-info">
            <h3>Selected</h3>
            <p className="career-metric-value">{selectedCount}</p>
          </div>
        </div>
      </div>

      <div className="career-card">
        <div className="career-card-header my-apps-filters">
          <div className="filter-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by Job Title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>

          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="filter-select">
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="filter-select">
            <option value="latest">Latest Applied</option>
            <option value="oldest">Oldest Applied</option>
            <option value="title">Job Title (A-Z)</option>
          </select>
        </div>

        <div className="career-card-body" style={{ padding: 0 }}>
          <div className="my-apps-table-container">
            <table className="my-apps-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Applied Date</th>
                  <th>Application Status</th>
                  <th>Recruitment Stage</th>
                  <th>Interview Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map(app => (
                    <tr key={app._id}>
                      <td className="job-title-col">
                        <strong>{app.jobId?.title || 'Unknown Job'}</strong>
                        <span className="job-meta">{app.jobId?.employmentType} • {app.jobId?.location}</span>
                      </td>
                      <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>
                        <span style={{ color: '#4b5563', fontWeight: 500 }}>
                          {getRecruitmentStage(app.status)}
                        </span>
                      </td>
                      <td>
                        {app.latestInterview ? (
                          <span style={{ fontSize: '0.85rem', color: app.latestInterview.status === 'Cancelled' ? '#dc2626' : '#4338ca', background: app.latestInterview.status === 'Cancelled' ? '#fee2e2' : '#e0e7ff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            {app.latestInterview.round} - {app.latestInterview.status}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>N/A</span>
                        )}
                      </td>
                      <td>
                        <button className="btn-view" onClick={() => setSelectedApp(app)}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      No applications match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedApp && (
        <div className="app-modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="app-modal" onClick={e => e.stopPropagation()}>
            <div className="app-modal-header">
              <h3>Application Details</h3>
              <button className="btn-close" onClick={() => setSelectedApp(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="app-modal-content">
              <div className="app-modal-grid">

                {/* Left Column: Details */}
                <div className="app-details-col">
                  <div className="app-detail-group">
                    <h4>Job Information</h4>
                    <p><strong>Title:</strong> {selectedApp.jobId?.title}</p>
                    <p><strong>Department:</strong> {selectedApp.jobId?.departmentId?.departmentName}</p>
                    <p><strong>Type:</strong> {selectedApp.jobId?.employmentType}</p>
                    <p><strong>Location:</strong> {selectedApp.jobId?.location}</p>
                  </div>

                  <div className="app-detail-group">
                    <h4>Submitted Documents & Links</h4>
                    <div className="doc-links">
                      <a href={`http://localhost:5000${selectedApp.resume}`} target="_blank" rel="noreferrer" className="doc-btn">
                        📄 View Resume
                      </a>
                      <a href={`http://localhost:5000${selectedApp.resume}`} download className="doc-btn secondary">
                        ⬇️ Download
                      </a>
                    </div>

                    {selectedApp.portfolio && (
                      <p className="extra-link"><strong>Portfolio:</strong> <a href={selectedApp.portfolio} target="_blank" rel="noreferrer">{selectedApp.portfolio}</a></p>
                    )}
                    {selectedApp.github && (
                      <p className="extra-link"><strong>GitHub:</strong> <a href={selectedApp.github} target="_blank" rel="noreferrer">{selectedApp.github}</a></p>
                    )}
                    {selectedApp.linkedin && (
                      <p className="extra-link"><strong>LinkedIn:</strong> <a href={selectedApp.linkedin} target="_blank" rel="noreferrer">{selectedApp.linkedin}</a></p>
                    )}
                  </div>

                  {selectedApp.coverLetter && (
                    <div className="app-detail-group">
                      <h4>Cover Letter</h4>
                      <div className="cover-letter-box">
                        {selectedApp.coverLetter}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Status Timeline */}
                <div className="app-status-col">
                  <h4>Status History</h4>
                  <div className="status-timeline">
                    {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 ? (
                      selectedApp.statusHistory.map((history, index) => (
                        <div key={index} className="timeline-item">
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <span className="timeline-status">{history.status}</span>
                            <span className="timeline-date">{new Date(history.date).toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <span className="timeline-status">{selectedApp.status}</span>
                          <span className="timeline-date">{new Date(selectedApp.appliedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Withdraw Action */}
                  {(selectedApp.status === 'Applied' || selectedApp.status === 'Under Review') && (
                    <div className="withdraw-section">
                      <button
                        className="btn-withdraw"
                        onClick={() => handleWithdraw(selectedApp._id)}
                      >
                        Withdraw Application
                      </button>
                      <p className="withdraw-warning">Note: Withdrawing your application cannot be undone.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
