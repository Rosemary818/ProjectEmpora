import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HRAdminDashboard.css';
import LeaveApprovals from '../../components/LeaveApprovals/LeaveApprovals';
import LeaveManagement from '../../components/LeaveManagement/LeaveManagement';
import HREmployeeManagement from '../../components/EmployeeManagement/HREmployeeManagement';
import HRProjectManagement from '../../components/ProjectManagement/HRProjectManagement';

const HRAdminDashboard = () => {
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
    { id: 'Employee Management', label: 'Employee Management', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    { id: 'My Leave', label: 'My Leave', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Leave Management', label: 'Leave Management', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
    { id: 'Attendance', label: 'Attendance', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
    { id: 'Timesheets', label: 'Timesheets', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Payroll & Salary', label: 'Payroll & Salary', icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
    { id: 'Projects', label: 'Projects', icon: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></> },
    { id: 'Documents', label: 'Documents', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { id: 'Announcements', label: 'Announcements', icon: <><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" /></> },
    { id: 'Internal Mobility', label: 'Internal Mobility', icon: <><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></> },
    { id: 'Employee Referrals', label: 'Employee Referrals', icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></> },
    { id: 'Recruitment', label: 'Recruitment / Career Portal', icon: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></> },
    { id: 'Reports', label: 'Reports', icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
    { id: 'Settings', label: 'Settings', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></> },
  ];

  if (!user) return <div className="hra-loading">Loading Dashboard...</div>;

  return (
    <div className="hra-layout">
      {/* Sidebar Navigation */}
      <aside className="hra-sidebar">
        <div className="hra-brand">
          <div className="hra-brand-icon">
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

        <div className="hra-nav-group">
          <p className="hra-nav-title">MAIN MENU</p>
          <nav>
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`hra-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hra-nav-icon">
                  {item.icon}
                </svg>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="hra-main">
        {/* Top Header */}
        <header className="hra-header">
          <div className="hra-header-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search employee, department, requests..." />
          </div>

          <div className="hra-header-actions">
            <button className="hra-icon-btn" aria-label="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="hra-badge">5</span>
            </button>

            <div className="hra-user-profile-wrapper" style={{ position: 'relative' }}>
              <div
                className="hra-user-profile"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ cursor: 'pointer' }}
              >
                <div className="hra-avatar">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="hra-avatar-img" />
                  ) : (
                    <>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</>
                  )}
                </div>
                <div className="hra-user-info">
                  <span className="hra-user-name">{user.firstName} {user.lastName}</span>
                  <span className="hra-user-role">HR Admin</span>
                </div>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="hra-dropdown-icon">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {isDropdownOpen && (
                <div className="hra-profile-dropdown" style={{
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
                  <button className="hra-btn-text" style={{ display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setActiveTab('Settings'); setIsDropdownOpen(false); }}>
                    View Profile
                  </button>
                  <button className="hra-btn-text" style={{ display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setActiveTab('Settings'); setIsDropdownOpen(false); }}>
                    Settings
                  </button>
                  <div style={{ borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }}></div>
                  <button className="hra-btn-text hra-text-danger" style={{ display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', color: '#dc2626', cursor: 'pointer' }} onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="hra-content-area">
          {activeTab === 'Dashboard' ? (
            <div className="hra-dashboard-overview">
              <div className="hra-welcome-banner">
                <h1>HR Admin Overview</h1>
                <p>Welcome back, {user.firstName}. Here is what's happening across the company today.</p>
              </div>

              {/* Metric Cards */}
              <div className="hra-metrics-grid">
                <div className="hra-metric-card">
                  <div className="hra-metric-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  </div>
                  <div className="hra-metric-info">
                    <h3>Total Employees</h3>
                    <p className="hra-metric-value">142</p>
                  </div>
                </div>

                <div className="hra-metric-card">
                  <div className="hra-metric-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                  </div>
                  <div className="hra-metric-info">
                    <h3>New Employees (This Month)</h3>
                    <p className="hra-metric-value">8</p>
                  </div>
                </div>

                <div className="hra-metric-card">
                  <div className="hra-metric-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </div>
                  <div className="hra-metric-info">
                    <h3>Pending Leave Requests</h3>
                    <p className="hra-metric-value">12</p>
                  </div>
                </div>

                <div className="hra-metric-card">
                  <div className="hra-metric-icon" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  </div>
                  <div className="hra-metric-info">
                    <h3>Pending Timesheets</h3>
                    <p className="hra-metric-value">24</p>
                  </div>
                </div>
              </div>

              {/* Lower Sections Grid */}
              <div className="hra-sections-grid">
                
                {/* Employee Overview & Quick Actions */}
                <section className="hra-card hra-meetings">
                  <div className="hra-card-header">
                    <h2>Employee Overview</h2>
                    <button className="hra-btn-text" onClick={() => setActiveTab('Employee Management')}>Manage All</button>
                  </div>
                  <div className="hra-card-body">
                    <ul className="hra-list">
                      <li className="hra-list-item">
                        <div className="hra-list-icon" style={{color: '#16a34a'}}>●</div>
                        <div className="hra-list-content">
                          <h4>Active Employees</h4>
                          <p>138 Employees currently active in the system</p>
                        </div>
                      </li>
                      <li className="hra-list-item">
                        <div className="hra-list-icon" style={{color: '#dc2626'}}>●</div>
                        <div className="hra-list-content">
                          <h4>Inactive Employees</h4>
                          <p>4 Employees currently inactive or on long-term leave</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Recent Activities */}
                <section className="hra-card hra-activity">
                  <div className="hra-card-header">
                    <h2>Recent Activities</h2>
                  </div>
                  <div className="hra-card-body">
                    <ul className="hra-timeline">
                      <li>
                        <span className="hra-timeline-dot"></span>
                        <div className="hra-timeline-content">
                          <p><strong>Jane Doe</strong> requested Sick Leave</p>
                          <span className="hra-timeline-time">10 mins ago</span>
                        </div>
                      </li>
                      <li>
                        <span className="hra-timeline-dot"></span>
                        <div className="hra-timeline-content">
                          <p><strong>Mark Smith</strong> completed Onboarding</p>
                          <span className="hra-timeline-time">2 hours ago</span>
                        </div>
                      </li>
                      <li>
                        <span className="hra-timeline-dot"></span>
                        <div className="hra-timeline-content">
                          <p>New policy document uploaded by Admin</p>
                          <span className="hra-timeline-time">Yesterday</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Department Overview Placeholder */}
                <section className="hra-card hra-meetings" style={{ gridColumn: 'span 8' }}>
                  <div className="hra-card-header">
                    <h2>Department Overview</h2>
                  </div>
                  <div className="hra-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ textAlign: 'center', color: '#6b7280' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '48px', height: '48px', margin: '0 auto 10px', opacity: '0.5' }}>
                        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
                      </svg>
                      <p>Department distribution chart visualization pending backend integration.</p>
                    </div>
                  </div>
                </section>

                {/* Upcoming Events */}
                <section className="hra-card hra-activity" style={{ gridColumn: 'span 4' }}>
                  <div className="hra-card-header">
                    <h2>Upcoming Events</h2>
                  </div>
                  <div className="hra-card-body">
                    <ul className="hra-list">
                      <li className="hra-list-item">
                        <div className="hra-list-icon">🎂</div>
                        <div className="hra-list-content">
                          <h4>Alex Johnson</h4>
                          <p>Birthday - Tomorrow</p>
                        </div>
                      </li>
                      <li className="hra-list-item">
                        <div className="hra-list-icon">⭐</div>
                        <div className="hra-list-content">
                          <h4>Sarah Williams</h4>
                          <p>3rd Work Anniversary - Oct 12</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

              </div>
            </div>
          ) : activeTab === 'Projects' ? (
            <HRProjectManagement />
          ) : activeTab === 'Employee Management' ? (
            <HREmployeeManagement />
          ) : activeTab === 'Leave Management' ? (
            <LeaveApprovals />
          ) : activeTab === 'My Leave' ? (
            <LeaveManagement />
          ) : (
            <div className="hra-placeholder-view" style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
              <div className="hra-placeholder-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px', margin: '0 auto 1rem', opacity: '0.5' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                <h2>{activeTab} Module</h2>
                <p>This module is currently under construction. Backend integration with MongoDB Atlas will be implemented here soon.</p>
                <button className="hra-btn-primary" style={{ padding: '0.5rem 1rem', marginTop: '1rem', background: '#388087', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setActiveTab('Dashboard')}>Back to Dashboard</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HRAdminDashboard;
