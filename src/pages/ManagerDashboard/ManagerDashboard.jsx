import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManagerDashboard.css';
import LeaveApprovals from '../../components/LeaveApprovals/LeaveApprovals';
import LeaveManagement from '../../components/LeaveManagement/LeaveManagement';
import ManagerTasks from '../../components/TaskManagement/ManagerTasks';
import ManagerTimesheets from '../../components/TimesheetManagement/ManagerTimesheets';
import ManagerProjects from '../../components/ProjectManagement/ManagerProjects';
import UserProfile from '../../components/UserProfile/UserProfile';
import MyTeam from '../../components/TeamManagement/MyTeam';
import DocumentManagement from '../../components/DocumentManagement/DocumentManagement';
import NotificationBell from '../../components/Notifications/NotificationBell';
import AnnouncementManagement from '../../components/Announcements/AnnouncementManagement';
import EventManagement from '../../components/Events/EventManagement';
import UpcomingEventsWidget from '../../components/Events/UpcomingEventsWidget';
import CompanyCalendar from '../../components/Calendar/CompanyCalendar';
import AttendanceManagement from '../../components/AttendanceManagement/AttendanceManagement';
import ManagerTeamAttendance from '../../components/AttendanceManagement/ManagerTeamAttendance';
import ManagerTeamSkills from '../../components/SkillsCertifications/ManagerTeamSkills';
import ManagerGoals from '../../components/Goals/ManagerGoals';
import ReportsModule from '../../components/Reports/ReportsModule';
import ManagerInterviews from '../../components/InterviewManagement/ManagerInterviews';
import ManagerInternalMobility from '../../components/InternalMobility/ManagerInternalMobility';
import ManagerTravel from '../../components/BusinessTravel/ManagerTravel';
import MyAssets from '../../components/AssetManagement/MyAssets';
import TeamResignations from '../../components/ExitManagement/TeamResignations';
import ManagerComplaints from '../../components/ComplaintManagement/ManagerComplaints';
import ManagerServiceRequests from '../../components/ServiceRequestManagement/ManagerServiceRequests';
import ManagerTraining from '../../components/TrainingManagement/ManagerTraining';
import GlobalSearch from '../../components/Search/GlobalSearch';
import ActivityFeedSection from '../../components/Activity/ActivityFeedSection';
import ActivityTimeline from '../ActivityTimeline/ActivityTimeline';
import ManagerWorkload from '../../components/Workload/ManagerWorkload';
import MySalary from '../../components/SalaryManagement/MySalary';
import PolicyKnowledgeHub from '../../components/PolicyKnowledgeHub/PolicyKnowledgeHub';
import TeamAvailability from '../../components/TeamAvailability/TeamAvailability';
import MeetingRooms from '../../components/MeetingRooms/MeetingRooms';

const ManagerDashboard = ({ defaultTab = 'Dashboard' }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(defaultTab);
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

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'Dashboard' && window.location.pathname !== '/manager/dashboard') {
      navigate('/manager/dashboard');
    } else if (tabId === 'Activity Timeline' && window.location.pathname !== '/manager/activity') {
      navigate('/manager/activity');
    }
  };

  const fetchDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      const res = await fetch('http://localhost:5000/api/user/manager-dashboard', {
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
    navigate('/login');
  };

  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></> },
    { id: 'My Profile', label: 'My Profile', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
    { id: 'Workload', label: 'Workload Monitor', icon: <><path d="M2 12h4l2-9 5 18 2-9h5" /></> },
    { id: 'My Team', label: 'My Team', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    { id: 'Team Skills', label: 'Team Skills', icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></> },
    { id: 'My Leave', label: 'My Leave', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'My Salary', label: 'My Salary', icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
    { id: 'Projects', label: 'Projects', icon: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></> },
    { id: 'Tasks', label: 'Tasks', icon: <><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></> },
    { id: 'Timesheets', label: 'Timesheets', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'My Assets', label: 'My Assets', icon: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></> },
    { id: 'Team Resignations', label: 'Team Resignations', icon: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></> },
    { id: 'Leave Requests', label: 'Leave Requests', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
    { id: 'My Attendance', label: 'My Attendance', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { id: 'Team Attendance', label: 'Team Attendance', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    { id: 'Performance', label: 'Performance & Goals', icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></> },
    { id: 'Documents', label: 'Documents', icon: <><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></> },
    { id: 'Policy & HR Knowledge Hub', label: 'Policy Hub', icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></> },
    { id: 'Calendar', label: 'Company Calendar', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><rect x="8" y="14" width="2" height="2" /><rect x="14" y="14" width="2" height="2" /></> },
    { id: 'Meeting Rooms', label: 'Meeting Rooms', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Business Travel', label: 'Business Travel', icon: <><path d="M2 22h20M2 12h20M17.5 12l2.5-8L18 2H6L4.5 12M5 22V12h14v10" /></> },
    { id: 'Events', label: 'Events', icon: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
    { id: 'Announcements', label: 'Announcements', icon: <><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" /></> },
    { id: 'Team Availability', label: 'Team Availability', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></> },
    { id: 'My Interviews', label: 'My Interviews', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    { id: 'Internal Mobility', label: 'Internal Mobility', icon: <><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></> },
    { id: 'Training & Learning', label: 'Training & Learning', icon: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14z" /><path d="M6 7h12M6 11h12M6 15h12" /></> },
    { id: 'Complaints', label: 'Complaints', icon: <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></> },
    { id: 'Service Requests', label: 'Service Requests', icon: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 9.36l-7.1 7.1a1 1 0 0 1-1.4 0l-2.83-2.83a1 1 0 0 1 0-1.4l7.1-7.1a6 6 0 0 1 9.36-7.94l-3.77 3.77z"/></> },
    { id: 'Activity Timeline', label: 'Activity', icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></> },
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
                onClick={() => handleTabChange(item.id)}
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
          <GlobalSearch className="mgr-header-search" />

          <div className="mgr-header-actions">
            <NotificationBell onNotificationClick={setActiveTab} />

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

              {loadingDashboard ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading dashboard...</div>
              ) : dashboardError ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>{dashboardError}</div>
              ) : !dashboardData ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No projects or team members assigned yet</div>
              ) : (
                <>
                  {/* Metric Cards Grid */}
                  <div className="mgr-metrics-grid">
                    <div className="mgr-metric-card">
                      <div className="mgr-metric-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      </div>
                      <div className="mgr-metric-info">
                        <h3>Total Team Members</h3>
                        <p className="mgr-metric-value">{dashboardData.totalTeamMembers}</p>
                      </div>
                    </div>

                    <div className="mgr-metric-card">
                      <div className="mgr-metric-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
                      </div>
                      <div className="mgr-metric-info">
                        <h3>Active Projects</h3>
                        <p className="mgr-metric-value">{dashboardData.activeProjects}</p>
                      </div>
                    </div>

                    <div className="mgr-metric-card">
                      <div className="mgr-metric-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      </div>
                      <div className="mgr-metric-info">
                        <h3>Pending Leave Requests</h3>
                        <p className="mgr-metric-value">{dashboardData.pendingLeaveRequests}</p>
                      </div>
                    </div>

                    <div className="mgr-metric-card">
                      <div className="mgr-metric-icon" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      </div>
                      <div className="mgr-metric-info">
                        <h3>Pending Timesheets</h3>
                        <p className="mgr-metric-value">{dashboardData.pendingTimesheets}</p>
                      </div>
                    </div>

                    <div className="mgr-metric-card">
                      <div className="mgr-metric-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      </div>
                      <div className="mgr-metric-info">
                        <h3>Team Present</h3>
                        <p className="mgr-metric-value">{dashboardData.attendanceStats?.teamPresent || 0}</p>
                      </div>
                    </div>

                    <div className="mgr-metric-card">
                      <div className="mgr-metric-icon" style={{ backgroundColor: '#fff7ed', color: '#c2410c' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </div>
                      <div className="mgr-metric-info">
                        <h3>Team Late</h3>
                        <p className="mgr-metric-value">{dashboardData.attendanceStats?.teamLate || 0}</p>
                      </div>
                    </div>

                    <div className="mgr-metric-card">
                      <div className="mgr-metric-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                      </div>
                      <div className="mgr-metric-info">
                        <h3>Team Absent</h3>
                        <p className="mgr-metric-value">{dashboardData.attendanceStats?.teamAbsent || 0}</p>
                      </div>
                    </div>

                    <div className="mgr-metric-card">
                      <div className="mgr-metric-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>
                      <div className="mgr-metric-info">
                        <h3>Team On Leave</h3>
                        <p className="mgr-metric-value">{dashboardData.attendanceStats?.teamOnLeave || 0}</p>
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
                      {dashboardData.teamMembers.length > 0 ? dashboardData.teamMembers.map(member => (
                        <li key={member._id} className="mgr-list-item" style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px' }}>
                          <div className="mgr-list-icon" style={{ width: '40px', height: '40px', background: '#bfdbfe', color: '#1e3a8a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', overflow: 'hidden' }}>
                            {member.profileImage ? <img src={member.profileImage} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`}
                          </div>
                          <div className="mgr-list-content" style={{ flex: 1 }}>
                            <h4>{member.firstName} {member.lastName}</h4>
                            <p>{member.designationName || 'Employee'} • {member.departmentName || 'N/A'}</p>
                          </div>
                          <div style={{ color: member.status === 'Active' ? '#16a34a' : '#d97706', fontSize: '0.85rem', fontWeight: '500' }}>● {member.status}</div>
                        </li>
                      )) : <p style={{color: '#6b7280', textAlign: 'center'}}>No team members</p>}
                    </ul>
                  </div>
                </section>

                {/* Upcoming Events */}
                <section style={{ gridColumn: 'span 4' }}>
                  <UpcomingEventsWidget />
                </section>

                {/* Recent Activities */}
                <div style={{ gridColumn: 'span 4' }}>
                  <ActivityFeedSection limit={5} filter="all" role="Manager" />
                </div>

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
                          <p>{dashboardData.activeProjects} projects currently in progress</p>
                        </div>
                      </li>
                      <li className="mgr-list-item">
                        <div className="mgr-list-icon" style={{color: '#16a34a'}}><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div>
                        <div className="mgr-list-content">
                          <h4>Completed Projects</h4>
                          <p>{dashboardData.completedProjects} projects finished</p>
                        </div>
                      </li>
                      <li className="mgr-list-item">
                        <div className="mgr-list-icon" style={{color: '#d97706'}}><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></div>
                        <div className="mgr-list-content">
                          <h4>Pending Tasks</h4>
                          <p>{dashboardData.pendingTasks} tasks pending team completion</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Team Goals */}
                <section className="mgr-card mgr-meetings" style={{ gridColumn: 'span 6' }}>
                  <div className="mgr-card-header">
                    <h2>Team Goals</h2>
                    <button className="mgr-btn-text" onClick={() => setActiveTab('Performance')}>View Team Goals</button>
                  </div>
                  <div className="mgr-card-body">
                    <ul className="mgr-list">
                      <li className="mgr-list-item">
                        <div className="mgr-list-icon" style={{color: '#3b82f6'}}>🎯</div>
                        <div className="mgr-list-content">
                          <h4>Active Goals</h4>
                          <p>Manage and track team objectives</p>
                        </div>
                      </li>
                      <li className="mgr-list-item">
                        <div className="mgr-list-icon" style={{color: '#16a34a'}}>✅</div>
                        <div className="mgr-list-content">
                          <h4>Completed Goals</h4>
                          <p>Review completed performance goals</p>
                        </div>
                      </li>
                    </ul>
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
                          <p>{dashboardData.submittedTimesheets} timesheets submitted</p>
                        </div>
                      </li>
                      <li className="mgr-list-item">
                        <div className="mgr-list-icon" style={{color: '#d97706'}}>⏳</div>
                        <div className="mgr-list-content">
                          <h4>Pending Reviews</h4>
                          <p style={{ color: '#d97706', fontWeight: '500' }}>{dashboardData.pendingTimesheets} timesheets waiting for your approval</p>
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
                </>
              )}
            </div>
          ) : activeTab === 'My Profile' ? (
            <UserProfile user={user} setUser={setUser} />
          ) : activeTab === 'Workload' ? (
            <ManagerWorkload />
          ) : activeTab === 'My Team' ? (
            <MyTeam managerId={user?.id} />
          ) : activeTab === 'Team Availability' ? (
            <TeamAvailability />
          ) : activeTab === 'Team Skills' ? (
            <ManagerTeamSkills />
          ) : activeTab === 'Performance' ? (
            <ManagerGoals />
          ) : activeTab === 'My Assets' ? (
            <MyAssets isManager={true} />
          ) : activeTab === 'Team Resignations' ? (
            <TeamResignations />
          ) : activeTab === 'Leave Requests' ? (
            <LeaveApprovals />
          ) : activeTab === 'My Leave' ? (
            <LeaveManagement />
          ) : activeTab === 'My Salary' ? (
            <MySalary user={user} />
          ) : activeTab === 'Projects' ? (
            <ManagerProjects />
          ) : activeTab === 'Tasks' ? (
            <ManagerTasks />
          ) : activeTab === 'Timesheets' ? (
            <ManagerTimesheets />
          ) : activeTab === 'Internal Mobility' ? (
            <ManagerInternalMobility user={user} />
          ) : activeTab === 'My Attendance' ? (
            <AttendanceManagement />
          ) : activeTab === 'Team Attendance' ? (
            <ManagerTeamAttendance />
          ) : activeTab === 'My Meetings' ? (
            <MeetingRooms userRole="Manager" user={user} />
          ) : activeTab === 'Business Travel' ? (
            <ManagerTravel setActiveTab={setActiveTab} />
          ) : activeTab === 'Calendar' ? (
            <CompanyCalendar user={user} viewType="Manager" />
          ) : activeTab === 'Events' ? (
            <EventManagement user={user} viewType="Manager" />
          ) : activeTab === 'Announcements' ? (
            <AnnouncementManagement user={user} viewType="Manager" />
          ) : activeTab === 'Documents' ? (
            <DocumentManagement user={user} viewType="Manager" />
          ) : activeTab === 'Policy & HR Knowledge Hub' ? (
            <PolicyKnowledgeHub user={user} userRole="Manager" />
          ) : activeTab === 'My Interviews' ? (
            <ManagerInterviews />
          ) : activeTab === 'My Assets' ? (
            <MyAssets isManager={true} />
          ) : activeTab === 'Training & Learning' ? (
            <ManagerTraining />
          ) : activeTab === 'Complaints' ? (
            <ManagerComplaints />
          ) : activeTab === 'Service Requests' ? (
            <ManagerServiceRequests />
          ) : activeTab === 'Activity Timeline' ? (
            <ActivityTimeline />
          ) : activeTab === 'Reports' ? (
            <ReportsModule />
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
