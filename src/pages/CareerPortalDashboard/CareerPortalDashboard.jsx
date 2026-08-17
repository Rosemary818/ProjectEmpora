import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CareerPortalDashboard.css';
import AvailableJobs from '../../components/CareerPortalDashboard/AvailableJobs';
import ApplyJob from '../../components/CareerPortalDashboard/ApplyJob';
import MyApplications from '../../components/CareerPortalDashboard/MyApplications';
import MyInterviews from '../../components/CareerPortalDashboard/MyInterviews';
import InterviewCalendar from '../../components/CareerPortalDashboard/InterviewCalendar';
import SavedJobs from '../../components/CareerPortalDashboard/SavedJobs';
import MyResume from '../../components/CareerPortalDashboard/MyResume';
import NotificationBell from '../../components/Notifications/NotificationBell';
import UserProfile from '../../components/UserProfile/UserProfile';

const CareerPortalDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Dynamic Dashboard Data State
  const [dashboardData, setDashboardData] = useState({
    availableJobsCount: 0,
    applicationsSubmitted: 0,
    underReviewCount: 0,
    interviewCount: 0,
    selectedCount: 0,
    latestJobs: [],
    recentApplications: [],
    notifications: [],
    appliedJobIds: [],
    savedJobsCount: 0,
    savedJobIds: [],
    nextInterview: null
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'Dashboard') {
      fetchDashboardData();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      const res = await fetch('http://localhost:5000/api/career-portal/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();

      const resInt = await fetch('http://localhost:5000/api/interviews/candidate/widgets', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const intData = await resInt.json();

      if (data.success) {
        setDashboardData(prev => ({
          ...data.data,
          nextInterview: intData.success ? intData.data.nextInterview : null
        }));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></> },
    { id: 'Browse Jobs', label: 'Browse Jobs', icon: <><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></> },
    { id: 'My Applications', label: 'My Applications', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { id: 'Saved Jobs', label: 'Saved Jobs', icon: <><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></> },
    { id: 'My Interviews', label: 'My Interviews', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Interview Calendar', label: 'Interview Calendar', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></> },
    { id: 'Resume', label: 'Resume', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { id: 'My Profile', label: 'My Profile', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
  ];

  if (!user) return <div className="career-loading">Loading Dashboard...</div>;

  return (
    <div className="career-layout">
      {/* Sidebar Navigation */}
      <aside className="career-sidebar">
        <div className="career-brand">
          <div className="career-brand-icon">
            <svg viewBox="0 0 48 32" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="14" r="5" />
              <path d="M3 32 C3 25, 8 22, 12 22 C16 22, 21 25, 21 32 Z" />
              <circle cx="36" cy="14" r="5" />
              <path d="M27 32 C27 25, 32 22, 36 22 C40 22, 45 25, 45 32 Z" />
              <circle cx="24" cy="11" r="6.5" />
              <path d="M12 32 C12 21, 17 17, 24 17 C31 17, 36 21, 36 32 Z" />
            </svg>
          </div>
          <span>Empora</span>
        </div>

        <div className="career-nav-group">
          <p className="career-nav-title">MAIN MENU</p>
          <nav>
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`career-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="career-nav-icon">
                  {item.icon}
                </svg>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="career-main">
        {/* Top Header */}
        <header className="career-header">
          <div className="career-header-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search everywhere..." />
          </div>

          <div className="career-header-actions">
            <NotificationBell onNotificationClick={setActiveTab} />

            <div className="career-user-profile-wrapper" style={{ position: 'relative' }}>
              <div
                className="career-user-profile"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ cursor: 'pointer' }}
              >
                <div className="career-avatar">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="career-avatar-img" />
                  ) : (
                    <>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</>
                  )}
                </div>
                <div className="career-user-info">
                  <span className="career-user-name">{user.firstName} {user.lastName}</span>
                  <span className="career-user-role">Candidate</span>
                </div>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="career-dropdown-icon">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {isDropdownOpen && (
                <div className="career-profile-dropdown">
                  <button onClick={() => { setActiveTab('My Profile'); setIsDropdownOpen(false); }}>
                    View Profile
                  </button>
                  <button onClick={() => setIsDropdownOpen(false)}>
                    Settings
                  </button>
                  <div className="career-dropdown-divider"></div>
                  <button onClick={handleLogout} className="career-text-danger">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="career-content-area">
          {activeTab === 'Dashboard' ? (
            <div className="career-dashboard-overview">
              <div className="career-welcome-banner">
                <h1>Welcome, {user.firstName}! 👋</h1>
                <p>Track your applications, discover new opportunities, and update your profile.</p>
              </div>

              {/* Metric Cards */}
              <div className="career-metrics-grid">
                <div className="career-metric-card">
                  <div className="career-metric-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                  </div>
                  <div className="career-metric-info">
                    <h3>Available Jobs</h3>
                    <p className="career-metric-value">{dashboardData.availableJobsCount}</p>
                  </div>
                </div>

                <div className="career-metric-card">
                  <div className="career-metric-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                  </div>
                  <div className="career-metric-info">
                    <h3>Applications Submitted</h3>
                    <p className="career-metric-value">{dashboardData.applicationsSubmitted}</p>
                  </div>
                </div>

                <div className="career-metric-card">
                  <div className="career-metric-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                  </div>
                  <div className="career-metric-info">
                    <h3>Saved Jobs</h3>
                    <p className="career-metric-value">{dashboardData.savedJobsCount}</p>
                  </div>
                </div>

                <div className="career-metric-card">
                  <div className="career-metric-icon" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  </div>
                  <div className="career-metric-info">
                    <h3>Under Review</h3>
                    <p className="career-metric-value">{dashboardData.underReviewCount}</p>
                  </div>
                </div>

                <div className="career-metric-card">
                  <div className="career-metric-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </div>
                  <div className="career-metric-info">
                    <h3>Interview Invitations</h3>
                    <p className="career-metric-value">{dashboardData.interviewCount}</p>
                  </div>
                </div>

                <div className="career-metric-card">
                  <div className="career-metric-icon" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  </div>
                  <div className="career-metric-info">
                    <h3>Selected</h3>
                    <p className="career-metric-value">{dashboardData.selectedCount}</p>
                  </div>
                </div>
              </div>

              {/* Next Interview Widget */}
              {dashboardData.nextInterview && (
                <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e3a8a', fontSize: '1.1rem' }}>Upcoming Interview</h3>
                    <p style={{ margin: 0, color: '#3730a3', fontSize: '1.25rem', fontWeight: 'bold' }}>{dashboardData.nextInterview.jobId?.title} - {dashboardData.nextInterview.round}</p>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#4338ca', fontSize: '0.95rem' }}>
                      {new Date(dashboardData.nextInterview.date).toLocaleDateString()} at {dashboardData.nextInterview.startTime}
                      <span style={{ marginLeft: '1rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.5)', borderRadius: '4px', fontSize: '0.8rem' }}>{dashboardData.nextInterview.status}</span>
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('My Interviews')} style={{ background: '#4338ca', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>View Details</button>
                </div>
              )}

              {/* Lower Sections Grid */}
              <div className="career-sections-grid">

                {/* Quick Actions */}
                <section className="career-card career-announcements">
                  <div className="career-card-header">
                    <h2>Quick Actions</h2>
                  </div>
                  <div className="career-card-body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveTab('Browse Jobs')} style={{ flex: 1, padding: '1rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}>
                      <span style={{ fontSize: '1.5rem' }}>🔍</span>
                      <span style={{ fontWeight: 500, color: '#374151' }}>Browse Jobs</span>
                    </button>
                    <button onClick={() => setActiveTab('My Applications')} style={{ flex: 1, padding: '1rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}>
                      <span style={{ fontSize: '1.5rem' }}>📄</span>
                      <span style={{ fontWeight: 500, color: '#374151' }}>My Applications</span>
                    </button>
                    <button onClick={() => setActiveTab('My Profile')} style={{ flex: 1, padding: '1rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}>
                      <span style={{ fontSize: '1.5rem' }}>📤</span>
                      <span style={{ fontWeight: 500, color: '#374151' }}>Upload Resume</span>
                    </button>
                    <button onClick={() => setActiveTab('My Profile')} style={{ flex: 1, padding: '1rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}>
                      <span style={{ fontSize: '1.5rem' }}>⚙️</span>
                      <span style={{ fontWeight: 500, color: '#374151' }}>Update Profile</span>
                    </button>
                  </div>
                </section>

                {/* Latest Job Openings */}
                <section className="career-card career-meetings" style={{ gridColumn: 'span 8' }}>
                  <div className="career-card-header">
                    <h2>Latest Job Openings</h2>
                    <button className="career-btn-text" onClick={() => setActiveTab('Browse Jobs')}>View All</button>
                  </div>
                  <div className="career-card-body">
                    {loadingDashboard ? (
                      <p style={{ color: '#6b7280' }}>Loading jobs...</p>
                    ) : dashboardData.latestJobs.length > 0 ? (
                      <ul className="career-list">
                        {dashboardData.latestJobs.map(job => (
                          <li key={job._id} className="career-list-item" style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <div className="career-list-icon" style={{ background: '#e0f2fe', color: '#0284c7', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                💼
                              </div>
                              <div className="career-list-content">
                                <h4>{job.title}</h4>
                                <p>{job.departmentId?.departmentName || 'General'} • {job.employmentType} • {job.location}</p>
                                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: '#9ca3af' }}>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <button className="career-btn-text" onClick={() => setActiveTab('Browse Jobs')} style={{ background: '#f3f4f6', padding: '0.5rem 1rem', borderRadius: '6px' }}>View Details</button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#6b7280' }}>No recent job openings available.</p>
                    )}
                  </div>
                </section>

                {/* Recent Notifications */}
                <section className="career-card career-activity" style={{ gridColumn: 'span 4' }}>
                  <div className="career-card-header">
                    <h2>Recent Notifications</h2>
                  </div>
                  <div className="career-card-body">
                    {loadingDashboard ? (
                      <p style={{ color: '#6b7280' }}>Loading notifications...</p>
                    ) : dashboardData.notifications.length > 0 ? (
                      <ul className="career-timeline">
                        {dashboardData.notifications.map((notif) => (
                          <li key={notif._id}>
                            <span className="career-timeline-dot"></span>
                            <div className="career-timeline-content">
                              <p>{notif.message}</p>
                              <span className="career-timeline-time">{new Date(notif.createdAt).toLocaleDateString()}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#6b7280' }}>No recent notifications.</p>
                    )}
                  </div>
                </section>

                {/* Recent Applications */}
                <section className="career-card career-announcements">
                  <div className="career-card-header">
                    <h2>Recent Applications</h2>
                    <button className="career-btn-text" onClick={() => setActiveTab('My Applications')}>View All</button>
                  </div>
                  <div className="career-card-body">
                    {loadingDashboard ? (
                      <p style={{ color: '#6b7280' }}>Loading applications...</p>
                    ) : dashboardData.recentApplications.length > 0 ? (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.875rem' }}>
                              <th style={{ padding: '0.75rem 1rem' }}>Job Title</th>
                              <th style={{ padding: '0.75rem 1rem' }}>Applied Date</th>
                              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.recentApplications.map(app => (
                              <tr key={app._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{app.jobId?.title || 'Unknown Job'}</td>
                                <td style={{ padding: '1rem', color: '#6b7280' }}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                                <td style={{ padding: '1rem' }}>
                                  <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    backgroundColor:
                                      app.status === 'Selected' ? '#dcfce7' :
                                        app.status === 'Rejected' ? '#fee2e2' :
                                          app.status === 'Interview Scheduled' ? '#e0e7ff' : '#fef3c7',
                                    color:
                                      app.status === 'Selected' ? '#16a34a' :
                                        app.status === 'Rejected' ? '#dc2626' :
                                          app.status === 'Interview Scheduled' ? '#4338ca' : '#d97706'
                                  }}>
                                    {app.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p style={{ color: '#6b7280' }}>You haven't applied to any jobs yet.</p>
                    )}
                  </div>
                </section>

              </div>
            </div>
          ) : activeTab === 'Browse Jobs' ? (
            <div style={{ margin: '-2rem' }}>
              <AvailableJobs
                appliedJobIds={dashboardData.appliedJobIds}
                savedJobIds={dashboardData.savedJobIds}
                onApplyClick={(job) => {
                  setSelectedJob(job);
                  setActiveTab('ApplyJob');
                }}
                onSaveToggle={fetchDashboardData}
              />
            </div>
          ) : activeTab === 'ApplyJob' ? (
            <div style={{ margin: '-2rem' }}>
              <ApplyJob
                job={selectedJob}
                user={user}
                onCancel={() => {
                  setSelectedJob(null);
                  setActiveTab('Browse Jobs');
                }}
                onSuccess={() => {
                  fetchDashboardData();
                  setSelectedJob(null);
                  setActiveTab('My Applications');
                }}
                onGoToResume={() => {
                  setSelectedJob(null);
                  setActiveTab('Resume');
                }}
              />
            </div>
          ) : activeTab === 'My Applications' ? (
            <div style={{ margin: '-2rem' }}>
              <MyApplications onBrowseJobs={() => setActiveTab('Browse Jobs')} />
            </div>
          ) : activeTab === 'Saved Jobs' ? (
            <div style={{ margin: '-2rem' }}>
              <SavedJobs 
                appliedJobIds={dashboardData.appliedJobIds}
                onApplyClick={(job) => {
                  setSelectedJob(job);
                  setActiveTab('ApplyJob');
                }}
                onBrowseJobs={() => setActiveTab('Browse Jobs')}
                onSaveToggle={fetchDashboardData}
              />
            </div>
          ) : activeTab === 'My Interviews' ? (
            <div style={{ margin: '-2rem' }}>
              <MyInterviews />
            </div>
          ) : activeTab === 'Interview Calendar' ? (
            <div style={{ margin: '-2rem' }}>
              <InterviewCalendar />
            </div>
          ) : activeTab === 'Resume' ? (
            <div style={{ margin: '-2rem' }}>
              <MyResume />
            </div>
          ) : activeTab === 'My Profile' ? (
            <UserProfile user={user} setUser={setUser} />
          ) : (
            <div className="career-placeholder-view" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="career-placeholder-content" style={{ textAlign: 'center', maxWidth: '400px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px', color: '#9ca3af', marginBottom: '1rem' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                <h2 style={{ color: '#111827', marginBottom: '0.5rem' }}>{activeTab} Module</h2>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.5 }}>This module is currently under construction. Backend integration with MongoDB Atlas will be implemented here soon.</p>
                <button
                  onClick={() => setActiveTab('Dashboard')}
                  style={{ background: '#388087', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CareerPortalDashboard;
