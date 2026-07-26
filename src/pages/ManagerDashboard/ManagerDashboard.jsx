import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManagerDashboard.css';
import LeaveApprovals from '../../components/LeaveApprovals/LeaveApprovals';
import LeaveManagement from '../../components/LeaveManagement/LeaveManagement';
import ManagerTasks from '../../components/TaskManagement/ManagerTasks';
import ManagerTimesheets from '../../components/TimesheetManagement/ManagerTimesheets';
import ManagerProjects from '../../components/ProjectManagement/ManagerProjects';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></> },
    { id: 'My Profile', label: 'My Profile', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
    { id: 'My Team', label: 'My Team', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    { id: 'My Leave', label: 'My Leave', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Projects', label: 'Projects', icon: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></> },
    { id: 'Tasks', label: 'Tasks', icon: <><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></> },
    { id: 'Timesheets', label: 'Timesheets', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Leave Requests', label: 'Leave Requests', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
    { id: 'Attendance', label: 'Attendance', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { id: 'Performance', label: 'Performance', icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></> },
    { id: 'Documents', label: 'Documents', icon: <><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></> },
    { id: 'Announcements', label: 'Announcements', icon: <><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" /></> },
    { id: 'Reports', label: 'Reports', icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
    { id: 'Settings', label: 'Settings', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></> },
  ];

  if (!user) return <div className="mgr-loading">Loading Dashboard...</div>;

  return (
    <div className="mgr-layout">
      {/* Sidebar Navigation */}
      <aside className="mgr-sidebar">
        <div className="mgr-brand">
          <div className="mgr-brand-icon">
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

        <div className="mgr-nav-group">
          <p className="mgr-nav-title">TEAM MENU</p>
          <nav>
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`mgr-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mgr-nav-icon">
                  {item.icon}
                </svg>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="mgr-main">
        {/* Top Header */}
        <header className="mgr-header">
          <div className="mgr-header-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search team members, projects, tasks..." />
          </div>

          <div className="mgr-header-actions">
            <button className="mgr-icon-btn" aria-label="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="mgr-badge">2</span>
            </button>

            <div className="mgr-user-profile-wrapper" style={{ position: 'relative' }}>
              <div
                className="mgr-user-profile"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ cursor: 'pointer' }}
              >
                <div className="mgr-avatar" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="mgr-avatar-img" />
                  ) : (
                    <>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</>
                  )}
                </div>
                <div className="mgr-user-info">
                  <span className="mgr-user-name">{user.firstName} {user.lastName}</span>
                  <span className="mgr-user-role">ID: {user.employeeCode || 'N/A'}</span>
                </div>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="mgr-dropdown-icon">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {isDropdownOpen && (
                <div className="mgr-profile-dropdown" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  padding: '0.5rem',
                  marginTop: '0.5rem',
                  minWidth: '150px',
                  zIndex: 50
                }}>
                  <button className="mgr-btn-text" style={{ display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', cursor: 'pointer', border: 'none', background: 'transparent' }} onClick={() => { setActiveTab('My Profile'); setIsDropdownOpen(false); }}>
                    View Profile
                  </button>
                  <button className="mgr-btn-text" style={{ display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', cursor: 'pointer', border: 'none', background: 'transparent' }} onClick={() => { setActiveTab('Settings'); setIsDropdownOpen(false); }}>
                    Settings
                  </button>
                  <div style={{ borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }}></div>
                  <button className="mgr-btn-text mgr-text-danger" style={{ display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', color: '#dc2626', cursor: 'pointer', border: 'none', background: 'transparent' }} onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="mgr-content-area">
          {activeTab === 'Dashboard' ? (
            <div className="mgr-dashboard-overview">
              <div className="mgr-welcome-banner">
                <h1>Manager Overview</h1>
                <p>Welcome back, {user.firstName}. Track your team's performance, projects, and pending requests.</p>
              </div>

              {/* Metric Cards Grid */}
              <div className="mgr-metrics-grid">
                <div className="mgr-metric-card">
                  <div className="mgr-metric-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  </div>
                  <div className="mgr-metric-info">
                    <h3>Total Team Members</h3>
                    <p className="mgr-metric-value">14</p>
                  </div>
                </div>

                <div className="mgr-metric-card">
                  <div className="mgr-metric-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
                  </div>
                  <div className="mgr-metric-info">
                    <h3>Active Projects</h3>
                    <p className="mgr-metric-value">3</p>
                  </div>
                </div>

                <div className="mgr-metric-card">
                  <div className="mgr-metric-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </div>
                  <div className="mgr-metric-info">
                    <h3>Pending Leave Requests</h3>
                    <p className="mgr-metric-value">2</p>
                  </div>
                </div>

                <div className="mgr-metric-card">
                  <div className="mgr-metric-icon" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  </div>
                  <div className="mgr-metric-info">
                    <h3>Pending Timesheets</h3>
                    <p className="mgr-metric-value">5</p>
                  </div>
                </div>
              </div>

              {/* Lower Sections Grid */}
              <div className="mgr-sections-grid">
                
                {/* My Team Overview */}
                <section className="mgr-card mgr-meetings" style={{ gridColumn: 'span 8' }}>
                  <div className="mgr-card-header">
                    <h2>My Team Overview</h2>
                    <button className="mgr-btn-text" onClick={() => setActiveTab('My Team')}>View All</button>
                  </div>
                  <div className="mgr-card-body">
                    <ul className="mgr-list">
                      <li className="mgr-list-item" style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px' }}>
                        <div className="mgr-list-icon" style={{ width: '40px', height: '40px', background: '#bfdbfe', color: '#1e3a8a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>JD</div>
                        <div className="mgr-list-content" style={{ flex: 1 }}>
                          <h4>John Doe</h4>
                          <p>Software Engineer • Engineering</p>
                        </div>
                        <div style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: '500' }}>● Active</div>
                      </li>
                      <li className="mgr-list-item" style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px' }}>
                        <div className="mgr-list-icon" style={{ width: '40px', height: '40px', background: '#fbcfe8', color: '#831843', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>AS</div>
                        <div className="mgr-list-content" style={{ flex: 1 }}>
                          <h4>Alice Smith</h4>
                          <p>UI/UX Designer • Design</p>
                        </div>
                        <div style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: '500' }}>● Active</div>
                      </li>
                      <li className="mgr-list-item" style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px' }}>
                        <div className="mgr-list-icon" style={{ width: '40px', height: '40px', background: '#fed7aa', color: '#7c2d12', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>MJ</div>
                        <div className="mgr-list-content" style={{ flex: 1 }}>
                          <h4>Mark Johnson</h4>
                          <p>QA Tester • Engineering</p>
                        </div>
                        <div style={{ color: '#d97706', fontSize: '0.85rem', fontWeight: '500' }}>● On Leave</div>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Recent Activities */}
                <section className="mgr-card mgr-activity" style={{ gridColumn: 'span 4' }}>
                  <div className="mgr-card-header">
                    <h2>Recent Activities</h2>
                  </div>
                  <div className="mgr-card-body">
                    <ul className="mgr-timeline">
                      <li>
                        <span className="mgr-timeline-dot"></span>
                        <div className="mgr-timeline-content">
                          <p><strong>Alice Smith</strong> submitted timesheet</p>
                          <span className="mgr-timeline-time">2 hours ago</span>
                        </div>
                      </li>
                      <li>
                        <span className="mgr-timeline-dot"></span>
                        <div className="mgr-timeline-content">
                          <p><strong>Mark Johnson</strong> submitted leave request</p>
                          <span className="mgr-timeline-time">5 hours ago</span>
                        </div>
                      </li>
                      <li>
                        <span className="mgr-timeline-dot"></span>
                        <div className="mgr-timeline-content">
                          <p>Mobile App V2 project updated</p>
                          <span className="mgr-timeline-time">Yesterday</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Project Overview */}
                <section className="mgr-card mgr-meetings" style={{ gridColumn: 'span 6' }}>
                  <div className="mgr-card-header">
                    <h2>Project Overview</h2>
                    <button className="mgr-btn-text" onClick={() => setActiveTab('Projects')}>Manage Projects</button>
                  </div>
                  <div className="mgr-card-body">
                    <ul className="mgr-list">
                      <li className="mgr-list-item">
                        <div className="mgr-list-icon" style={{color: '#0284c7'}}><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polygon points="12 2 2 7 12 12 22 7 12 2" /></svg></div>
                        <div className="mgr-list-content">
                          <h4>Active Projects</h4>
                          <p>3 projects currently in progress</p>
                        </div>
                      </li>
                      <li className="mgr-list-item">
                        <div className="mgr-list-icon" style={{color: '#16a34a'}}><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div>
                        <div className="mgr-list-content">
                          <h4>Completed Projects</h4>
                          <p>12 projects finished this year</p>
                        </div>
                      </li>
                      <li className="mgr-list-item">
                        <div className="mgr-list-icon" style={{color: '#d97706'}}><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></div>
                        <div className="mgr-list-content">
                          <h4>Pending Tasks</h4>
                          <p>28 tasks pending team completion</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Team Performance Placeholder */}
                <section className="mgr-card mgr-meetings" style={{ gridColumn: 'span 6' }}>
                  <div className="mgr-card-header">
                    <h2>Team Performance</h2>
                  </div>
                  <div className="mgr-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ textAlign: 'center', color: '#6b7280' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '48px', height: '48px', margin: '0 auto 10px', opacity: '0.5' }}>
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      <p>Team performance and workload charts pending.</p>
                    </div>
                  </div>
                </section>

                {/* Timesheet Review */}
                <section className="mgr-card mgr-meetings" style={{ gridColumn: 'span 6' }}>
                  <div className="mgr-card-header">
                    <h2>Timesheet Review</h2>
                    <button className="mgr-btn-text" onClick={() => setActiveTab('Timesheets')}>Review All</button>
                  </div>
                  <div className="mgr-card-body">
                    <ul className="mgr-list">
                      <li className="mgr-list-item">
                        <div className="mgr-list-icon" style={{color: '#6b7280'}}>📄</div>
                        <div className="mgr-list-content">
                          <h4>Submitted Timesheets</h4>
                          <p>14 timesheets submitted this week</p>
                        </div>
                      </li>
                      <li className="mgr-list-item">
                        <div className="mgr-list-icon" style={{color: '#d97706'}}>⏳</div>
                        <div className="mgr-list-content">
                          <h4>Pending Reviews</h4>
                          <p style={{ color: '#d97706', fontWeight: '500' }}>5 timesheets waiting for your approval</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Upcoming Events */}
                <section className="mgr-card mgr-activity" style={{ gridColumn: 'span 6' }}>
                  <div className="mgr-card-header">
                    <h2>Upcoming Events</h2>
                  </div>
                  <div className="mgr-card-body">
                    <ul className="mgr-list">
                      <li className="mgr-list-item">
                        <div className="mgr-list-icon">📅</div>
                        <div className="mgr-list-content">
                          <h4>Q3 Planning Meeting</h4>
                          <p>Tomorrow at 10:00 AM</p>
                        </div>
                      </li>
                      <li className="mgr-list-item">
                        <div className="mgr-list-icon">🚀</div>
                        <div className="mgr-list-content">
                          <h4>V2 Launch Deadline</h4>
                          <p>Friday, Oct 15</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

              </div>
            </div>
          ) : activeTab === 'Leave Requests' ? (
            <LeaveApprovals />
          ) : activeTab === 'My Leave' ? (
            <LeaveManagement />
          ) : activeTab === 'Projects' ? (
            <ManagerProjects />
          ) : activeTab === 'Tasks' ? (
            <ManagerTasks />
          ) : activeTab === 'Timesheets' ? (
            <ManagerTimesheets />
          ) : (
            <div className="mgr-placeholder-view" style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
              <div className="mgr-placeholder-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px', margin: '0 auto 1rem', opacity: '0.5' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                <h2>{activeTab} Module</h2>
                <p>This module is currently under construction. Backend integration with MongoDB Atlas will be implemented here soon.</p>
                <button className="mgr-btn-primary" style={{ padding: '0.5rem 1rem', marginTop: '1rem', background: '#388087', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setActiveTab('Dashboard')}>Back to Dashboard</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
