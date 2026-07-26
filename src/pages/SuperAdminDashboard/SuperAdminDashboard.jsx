import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SuperAdminDashboard.css';
import LeaveApprovals from '../../components/LeaveApprovals/LeaveApprovals';
import SuperAdminUserManagement from '../../components/UserManagement/SuperAdminUserManagement';

const SuperAdminDashboard = () => {
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
    { id: 'User Management', label: 'User Management', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    { id: 'Role Management', label: 'Role Management', icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></> },
    { id: 'HR Admins', label: 'HR Admins', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
    { id: 'Managers', label: 'Managers', icon: <><circle cx="12" cy="7" r="4" /><path d="M12 11c-2.21 0-4 1.79-4 4v2h8v-2c0-2.21-1.79-4-4-4z" /><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /></> },
    { id: 'Employees', label: 'Employees', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Leave Approvals', label: 'Leave Approvals', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
    { id: 'Candidates', label: 'Candidates', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { id: 'Career Portal', label: 'Career Portal', icon: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></> },
    { id: 'System Settings', label: 'System Settings', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></> },
    { id: 'Reports', label: 'Reports', icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
    { id: 'Audit Logs', label: 'Audit Logs', icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></> },
  ];

  if (!user) return <div className="sad-loading">Loading Dashboard...</div>;

  return (
    <div className="sad-layout">
      {/* Sidebar Navigation */}
      <aside className="sad-sidebar">
        <div className="sad-brand">
          <div className="sad-brand-icon">
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

        <div className="sad-nav-group">
          <p className="sad-nav-title">SUPER ADMIN MENU</p>
          <nav>
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`sad-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sad-nav-icon">
                  {item.icon}
                </svg>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="sad-main">
        {/* Top Header */}
        <header className="sad-header">
          <div className="sad-header-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search users, roles, settings, logs..." />
          </div>

          <div className="sad-header-actions">
            <button className="sad-icon-btn" aria-label="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="sad-badge">3</span>
            </button>

            <div className="sad-user-profile-wrapper" style={{ position: 'relative' }}>
              <div
                className="sad-user-profile"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ cursor: 'pointer' }}
              >
                <div className="sad-avatar" style={{ backgroundColor: '#c7d2fe', color: '#4f46e5' }}>
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="sad-avatar-img" />
                  ) : (
                    <>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</>
                  )}
                </div>
                <div className="sad-user-info">
                  <span className="sad-user-name">{user.firstName} {user.lastName}</span>
                  <span className="sad-user-role">Super Admin</span>
                </div>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="sad-dropdown-icon">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {isDropdownOpen && (
                <div className="sad-profile-dropdown" style={{
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
                  <button className="sad-btn-text" style={{ display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', cursor: 'pointer', border: 'none', background: 'transparent' }} onClick={() => { setActiveTab('Settings'); setIsDropdownOpen(false); }}>
                    View Profile
                  </button>
                  <button className="sad-btn-text" style={{ display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', cursor: 'pointer', border: 'none', background: 'transparent' }} onClick={() => { setActiveTab('Settings'); setIsDropdownOpen(false); }}>
                    Settings
                  </button>
                  <div style={{ borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }}></div>
                  <button className="sad-btn-text sad-text-danger" style={{ display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', color: '#dc2626', cursor: 'pointer', border: 'none', background: 'transparent' }} onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="sad-content-area">
          {activeTab === 'Dashboard' ? (
            <div className="sad-dashboard-overview">
              <div className="sad-welcome-banner">
                <h1>Super Admin Dashboard</h1>
                <p>Welcome back, {user.firstName}. Manage Empora's system users, roles, and overall health.</p>
              </div>

              {/* Metric Cards Grid - customized for 6 cards */}
              <div className="sad-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="sad-metric-card">
                  <div className="sad-metric-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  </div>
                  <div className="sad-metric-info">
                    <h3>Total Users</h3>
                    <p className="sad-metric-value">1,248</p>
                  </div>
                </div>

                <div className="sad-metric-card">
                  <div className="sad-metric-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </div>
                  <div className="sad-metric-info">
                    <h3>HR Admins</h3>
                    <p className="sad-metric-value">12</p>
                  </div>
                </div>

                <div className="sad-metric-card">
                  <div className="sad-metric-icon" style={{ backgroundColor: '#ffedd5', color: '#ea580c' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4" /><path d="M12 11c-2.21 0-4 1.79-4 4v2h8v-2c0-2.21-1.79-4-4-4z" /><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /></svg>
                  </div>
                  <div className="sad-metric-info">
                    <h3>Managers</h3>
                    <p className="sad-metric-value">45</p>
                  </div>
                </div>

                <div className="sad-metric-card">
                  <div className="sad-metric-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </div>
                  <div className="sad-metric-info">
                    <h3>Employees</h3>
                    <p className="sad-metric-value">860</p>
                  </div>
                </div>
                
                <div className="sad-metric-card">
                  <div className="sad-metric-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                  </div>
                  <div className="sad-metric-info">
                    <h3>Candidates</h3>
                    <p className="sad-metric-value">331</p>
                  </div>
                </div>

                <div className="sad-metric-card">
                  <div className="sad-metric-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  </div>
                  <div className="sad-metric-info">
                    <h3>Active Users</h3>
                    <p className="sad-metric-value">1,215</p>
                  </div>
                </div>
              </div>

              {/* Lower Sections Grid */}
              <div className="sad-sections-grid">
                
                {/* User Overview */}
                <section className="sad-card sad-meetings">
                  <div className="sad-card-header">
                    <h2>User Overview</h2>
                    <button className="sad-btn-text" onClick={() => setActiveTab('User Management')}>Manage All</button>
                  </div>
                  <div className="sad-card-body">
                    <ul className="sad-list">
                      <li className="sad-list-item">
                        <div className="sad-list-icon" style={{color: '#4f46e5'}}>👤</div>
                        <div className="sad-list-content">
                          <h4>Recently Registered Users</h4>
                          <p>12 new users registered across all roles this week</p>
                        </div>
                      </li>
                      <li className="sad-list-item">
                        <div className="sad-list-icon" style={{color: '#16a34a'}}>💼</div>
                        <div className="sad-list-content">
                          <h4>Recently Added Employees</h4>
                          <p>5 new employees onboarded today</p>
                        </div>
                      </li>
                      <li className="sad-list-item">
                        <div className="sad-list-icon" style={{color: '#9333ea'}}>👑</div>
                        <div className="sad-list-content">
                          <h4>Recently Added HR Admins / Managers</h4>
                          <p>1 new HR Admin and 2 new Managers assigned</p>
                        </div>
                      </li>
                      <li className="sad-list-item">
                        <div className="sad-list-icon" style={{color: '#ea580c'}}>📄</div>
                        <div className="sad-list-content">
                          <h4>Recently Registered Candidates</h4>
                          <p>24 candidates created profiles this month</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* User Management Overview */}
                <section className="sad-card sad-activity">
                  <div className="sad-card-header">
                    <h2>User Management</h2>
                  </div>
                  <div className="sad-card-body">
                    <ul className="sad-list">
                      <li className="sad-list-item">
                        <div className="sad-list-icon" style={{color: '#059669'}}>●</div>
                        <div className="sad-list-content">
                          <h4>Active Users</h4>
                          <p>1,215 currently active in system</p>
                        </div>
                      </li>
                      <li className="sad-list-item">
                        <div className="sad-list-icon" style={{color: '#ef4444'}}>●</div>
                        <div className="sad-list-content">
                          <h4>Inactive / Suspended</h4>
                          <p>33 users suspended or deactivated</p>
                        </div>
                      </li>
                      <li className="sad-list-item">
                        <div className="sad-list-icon" style={{color: '#d97706'}}>●</div>
                        <div className="sad-list-content">
                          <h4>Pending User Actions</h4>
                          <p>8 role approval requests pending</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Role Distribution Placeholder */}
                <section className="sad-card sad-meetings" style={{ gridColumn: 'span 4' }}>
                  <div className="sad-card-header">
                    <h2>Role Distribution</h2>
                  </div>
                  <div className="sad-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ textAlign: 'center', color: '#6b7280' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '48px', height: '48px', margin: '0 auto 10px', opacity: '0.5' }}>
                        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
                      </svg>
                      <p>Role distribution chart visualization pending</p>
                    </div>
                  </div>
                </section>

                {/* System Status */}
                <section className="sad-card sad-meetings" style={{ gridColumn: 'span 4' }}>
                  <div className="sad-card-header">
                    <h2>System Status</h2>
                  </div>
                  <div className="sad-card-body">
                    <ul className="sad-list">
                      <li className="sad-list-item">
                        <div className="sad-list-icon" style={{color: '#10b981'}}><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg></div>
                        <div className="sad-list-content">
                          <h4>Database Connection</h4>
                          <p style={{ color: '#10b981', fontWeight: '500' }}>Connected (MongoDB Atlas)</p>
                        </div>
                      </li>
                      <li className="sad-list-item">
                        <div className="sad-list-icon" style={{color: '#10b981'}}><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg></div>
                        <div className="sad-list-content">
                          <h4>Backend API Status</h4>
                          <p style={{ color: '#10b981', fontWeight: '500' }}>Online & Healthy</p>
                        </div>
                      </li>
                      <li className="sad-list-item">
                        <div className="sad-list-icon" style={{color: '#10b981'}}><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></div>
                        <div className="sad-list-content">
                          <h4>Authentication</h4>
                          <p style={{ color: '#10b981', fontWeight: '500' }}>JWT Service Operational</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Recent System Activities */}
                <section className="sad-card sad-activity" style={{ gridColumn: 'span 4' }}>
                  <div className="sad-card-header">
                    <h2>Recent System Activities</h2>
                  </div>
                  <div className="sad-card-body">
                    <ul className="sad-timeline">
                      <li>
                        <span className="sad-timeline-dot"></span>
                        <div className="sad-timeline-content">
                          <p><strong>System</strong>: New user registered</p>
                          <span className="sad-timeline-time">5 mins ago</span>
                        </div>
                      </li>
                      <li>
                        <span className="sad-timeline-dot"></span>
                        <div className="sad-timeline-content">
                          <p><strong>Admin</strong>: User role updated to HRAdmin</p>
                          <span className="sad-timeline-time">1 hour ago</span>
                        </div>
                      </li>
                      <li>
                        <span className="sad-timeline-dot"></span>
                        <div className="sad-timeline-content">
                          <p><strong>System</strong>: Candidate profile created</p>
                          <span className="sad-timeline-time">3 hours ago</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

              </div>
            </div>
          ) : activeTab === 'User Management' ? (
            <SuperAdminUserManagement />
          ) : activeTab === 'Leave Approvals' ? (
            <LeaveApprovals />
          ) : (
            <div className="sad-placeholder-view" style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
              <div className="sad-placeholder-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px', margin: '0 auto 1rem', opacity: '0.5' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                <h2>{activeTab} Module</h2>
                <p>This module is currently under construction. Backend integration with MongoDB Atlas will be implemented here soon.</p>
                <button className="sad-btn-primary" style={{ padding: '0.5rem 1rem', marginTop: '1rem', background: '#388087', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setActiveTab('Dashboard')}>Back to Dashboard</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
