import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SuperAdminDashboard.css';
import LeaveApprovals from '../../components/LeaveApprovals/LeaveApprovals';
import SuperAdminUserManagement from '../../components/UserManagement/SuperAdminUserManagement';
import HRAdminsManagement from '../../components/UserManagement/HRAdminsManagement';
import ManagersManagement from '../../components/UserManagement/ManagersManagement';
import SuperAdminEmployeeManagement from '../../components/UserManagement/SuperAdminEmployeeManagement';
import ServiceExecutiveManagement from '../../components/UserManagement/ServiceExecutiveManagement';
import GlobalSearch from '../../components/Search/GlobalSearch';
import DocumentManagement from '../../components/DocumentManagement/DocumentManagement';
import NotificationBell from '../../components/Notifications/NotificationBell';
import AnnouncementManagement from '../../components/Announcements/AnnouncementManagement';
import EventManagement from '../../components/Events/EventManagement';
import CompanyCalendar from '../../components/Calendar/CompanyCalendar';
import HolidayManagement from '../../components/Calendar/HolidayManagement';
import ReportsModule from '../../components/Reports/ReportsModule';
import SuperAdminCandidates from '../../components/CandidateManagement/SuperAdminCandidates';
import AdminWFH from '../../components/WFH/AdminWFH';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'Dashboard') {
      fetchDashboardData();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/super-dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDashboardData(data.data);
        setDashboardError('');
      } else {
        if (res.status === 401) {
          handleLogout();
          return;
        }
        setDashboardError(data.error || data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setDashboardError('Network error');
    } finally {
      setLoadingDashboard(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.replace('/login');
  };

  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></> },
    { id: 'User Management', label: 'User Management', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    { id: 'HR Admins', label: 'HR Admins', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
    { id: 'Managers', label: 'Managers', icon: <><circle cx="12" cy="7" r="4" /><path d="M12 11c-2.21 0-4 1.79-4 4v2h8v-2c0-2.21-1.79-4-4-4z" /><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /></> },
    { id: 'Service Executive', label: 'Service Executive', icon: <><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></> },
    { id: 'Employees', label: 'Employees', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Remote Work', label: 'Remote Work', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Leave Approvals', label: 'Leave Approvals', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
    { id: 'Candidates', label: 'Candidates', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { id: 'Career Portal', label: 'Career Portal', icon: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></> },
    { id: 'System Settings', label: 'System Settings', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></> },
    { id: 'Reports', label: 'Reports', icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
    { id: 'Announcements', label: 'Announcements', icon: <><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" /></> },
    { id: 'Events', label: 'Events', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Documents', label: 'Documents', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { id: 'Calendar', label: 'Company Calendar', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><rect x="8" y="14" width="2" height="2" /><rect x="14" y="14" width="2" height="2" /></> },
    { id: 'Holiday Management', label: 'Holiday Management', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></> },
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
          <GlobalSearch className="sad-header-search" />

          <div className="sad-header-actions">
            <NotificationBell onNotificationClick={setActiveTab} />

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

              {loadingDashboard ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading system overview...</div>
              ) : dashboardError ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>{dashboardError}</div>
              ) : !dashboardData ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No system data available</div>
              ) : (
                <>
                  {/* Metric Cards Grid - customized for 6 cards */}
                  <div className="sad-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <div className="sad-metric-card">
                      <div className="sad-metric-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      </div>
                      <div className="sad-metric-info">
                        <h3>Total Users</h3>
                        <p className="sad-metric-value">{dashboardData.totalUsers ?? 0}</p>
                      </div>
                    </div>

                    <div className="sad-metric-card">
                      <div className="sad-metric-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      </div>
                      <div className="sad-metric-info">
                        <h3>HR Admins</h3>
                        <p className="sad-metric-value">{dashboardData.roleCounts?.hrAdmins ?? 0}</p>
                      </div>
                    </div>

                    <div className="sad-metric-card">
                      <div className="sad-metric-icon" style={{ backgroundColor: '#ffedd5', color: '#ea580c' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4" /><path d="M12 11c-2.21 0-4 1.79-4 4v2h8v-2c0-2.21-1.79-4-4-4z" /><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /></svg>
                      </div>
                      <div className="sad-metric-info">
                        <h3>Managers</h3>
                        <p className="sad-metric-value">{dashboardData.roleCounts?.managers ?? 0}</p>
                      </div>
                    </div>

                    <div className="sad-metric-card">
                      <div className="sad-metric-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      </div>
                      <div className="sad-metric-info">
                        <h3>Employees</h3>
                        <p className="sad-metric-value">{dashboardData.roleCounts?.employees ?? 0}</p>
                      </div>
                    </div>

                    <div className="sad-metric-card">
                      <div className="sad-metric-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                      </div>
                      <div className="sad-metric-info">
                        <h3>Candidates</h3>
                        <p className="sad-metric-value">{dashboardData.roleCounts?.candidates ?? 0}</p>
                      </div>
                    </div>

                    <div className="sad-metric-card">
                      <div className="sad-metric-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      </div>
                      <div className="sad-metric-info">
                        <h3>Active Users</h3>
                        <p className="sad-metric-value">{dashboardData.activeUsers ?? 0}</p>
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
                            <div className="sad-list-icon" style={{ color: '#4f46e5' }}>👤</div>
                            <div className="sad-list-content">
                              <h4>Recently Registered Users</h4>
                              <p>{dashboardData.recentlyRegisteredUsers ?? 0} new users registered across all roles this week</p>
                            </div>
                          </li>
                          <li className="sad-list-item">
                            <div className="sad-list-icon" style={{ color: '#16a34a' }}>💼</div>
                            <div className="sad-list-content">
                              <h4>Recently Added Employees</h4>
                              <p>{dashboardData.newEmployees ?? 0} new employees onboarded today</p>
                            </div>
                          </li>
                          <li className="sad-list-item">
                            <div className="sad-list-icon" style={{ color: '#9333ea' }}>👑</div>
                            <div className="sad-list-content">
                              <h4>Recently Added HR Admins / Managers</h4>
                              <p>{dashboardData.newHrAdmins ?? 0} new HR Admin(s) and {dashboardData.newManagers ?? 0} new Manager(s) assigned this month</p>
                            </div>
                          </li>
                          <li className="sad-list-item">
                            <div className="sad-list-icon" style={{ color: '#ea580c' }}>📄</div>
                            <div className="sad-list-content">
                              <h4>Recently Registered Candidates</h4>
                              <p>{dashboardData.newCandidates ?? 0} candidate(s) created profiles this month</p>
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
                            <div className="sad-list-icon" style={{ color: '#059669' }}>●</div>
                            <div className="sad-list-content">
                              <h4>Active Users</h4>
                              <p>{dashboardData.activeUsers ?? 0} currently active in system</p>
                            </div>
                          </li>
                          <li className="sad-list-item">
                            <div className="sad-list-icon" style={{ color: '#ef4444' }}>●</div>
                            <div className="sad-list-content">
                              <h4>Inactive / Suspended</h4>
                              <p>{dashboardData.inactiveUsers ?? 0} users suspended or deactivated</p>
                            </div>
                          </li>
                          <li className="sad-list-item">
                            <div className="sad-list-icon" style={{ color: '#d97706' }}>●</div>
                            <div className="sad-list-content">
                              <h4>Pending User Actions</h4>
                              <p>{dashboardData.pendingUserActions ?? 0} unverified user accounts pending</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </section>

                    {/* Role Distribution */}
                    <section className="sad-card sad-meetings" style={{ gridColumn: 'span 4' }}>
                      <div className="sad-card-header">
                        <h2>Role Distribution</h2>
                      </div>
                      <div className="sad-card-body">
                        {dashboardData.roleDistribution?.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {dashboardData.roleDistribution.map((role, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px' }}>
                                <span style={{ fontWeight: '500', color: '#334155' }}>{role.name}</span>
                                <span style={{ fontWeight: '600', color: '#0ea5e9' }}>{role.value}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                            <div style={{ textAlign: 'center', color: '#6b7280' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '48px', height: '48px', margin: '0 auto 10px', opacity: '0.5' }}>
                                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
                              </svg>
                              <p>No role data available</p>
                            </div>
                          </div>
                        )}
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
                            <div className="sad-list-icon" style={{ color: dashboardData.systemStatus?.database === 'Connected' ? '#10b981' : '#ef4444' }}><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg></div>
                            <div className="sad-list-content">
                              <h4>Database Connection</h4>
                              <p style={{ color: dashboardData.systemStatus?.database === 'Connected' ? '#10b981' : '#ef4444', fontWeight: '500' }}>{dashboardData.systemStatus?.database}</p>
                            </div>
                          </li>
                          <li className="sad-list-item">
                            <div className="sad-list-icon" style={{ color: dashboardData.systemStatus?.backend === 'Online' ? '#10b981' : '#ef4444' }}><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg></div>
                            <div className="sad-list-content">
                              <h4>Backend API Status</h4>
                              <p style={{ color: dashboardData.systemStatus?.backend === 'Online' ? '#10b981' : '#ef4444', fontWeight: '500' }}>{dashboardData.systemStatus?.backend}</p>
                            </div>
                          </li>
                          <li className="sad-list-item">
                            <div className="sad-list-icon" style={{ color: dashboardData.systemStatus?.authentication === 'Operational' ? '#10b981' : '#ef4444' }}><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></div>
                            <div className="sad-list-content">
                              <h4>Authentication</h4>
                              <p style={{ color: dashboardData.systemStatus?.authentication === 'Operational' ? '#10b981' : '#ef4444', fontWeight: '500' }}>{dashboardData.systemStatus?.authentication}</p>
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
                          {dashboardData.recentActivities?.length > 0 ? (
                            dashboardData.recentActivities.map((act) => (
                              <li key={act.id}>
                                <span className="sad-timeline-dot"></span>
                                <div className="sad-timeline-content">
                                  <p>{act.action}</p>
                                  <span className="sad-timeline-time">{new Date(act.date).toLocaleDateString()} {new Date(act.date).toLocaleTimeString()}</span>
                                </div>
                              </li>
                            ))
                          ) : (
                            <p style={{ color: '#6b7280' }}>No recent system activities</p>
                          )}
                        </ul>
                      </div>
                    </section>

                  </div>
                </>
              )}
            </div>
          ) : activeTab === 'User Management' ? (
            <SuperAdminUserManagement />
          ) : activeTab === 'HR Admins' ? (
            <HRAdminsManagement />
          ) : activeTab === 'Managers' ? (
            <ManagersManagement />
          ) : activeTab === 'Service Executive' ? (
            <ServiceExecutiveManagement />
          ) : activeTab === 'Employees' ? (
            <SuperAdminEmployeeManagement />
          ) : activeTab === 'Remote Work' ? (
            <AdminWFH />
          ) : activeTab === 'Leave Approvals' ? (
            <LeaveApprovals />
          ) : activeTab === 'Events' ? (
            <EventManagement user={user} viewType="SuperAdmin" />
          ) : activeTab === 'Calendar' ? (
            <CompanyCalendar user={user} viewType="SuperAdmin" />
          ) : activeTab === 'Holiday Management' ? (
            <HolidayManagement user={user} onBack={() => setActiveTab('Calendar')} />
          ) : activeTab === 'Announcements' ? (
            <AnnouncementManagement user={user} viewType="SuperAdmin" />
          ) : activeTab === 'Documents' ? (
            <DocumentManagement user={user} viewType="SuperAdmin" />
          ) : activeTab === 'Reports' ? (
            <ReportsModule />
          ) : activeTab === 'Candidates' ? (
            <SuperAdminCandidates />
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
