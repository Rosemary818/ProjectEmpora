import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';
import LeaveManagement from '../../components/LeaveManagement/LeaveManagement';
import AttendanceManagement from '../../components/AttendanceManagement/AttendanceManagement';
import EmployeeTasks from '../../components/TaskManagement/EmployeeTasks';
import EmployeeTimesheets from '../../components/TimesheetManagement/EmployeeTimesheets';
import EmployeeProjects from '../../components/ProjectManagement/EmployeeProjects';
import UserProfile from '../../components/UserProfile/UserProfile';
import DocumentManagement from '../../components/DocumentManagement/DocumentManagement';
import NotificationBell from '../../components/Notifications/NotificationBell';
import AnnouncementManagement from '../../components/Announcements/AnnouncementManagement';
import EventManagement from '../../components/Events/EventManagement';
import UpcomingEventsWidget from '../../components/Events/UpcomingEventsWidget';
import CompanyCalendar from '../../components/Calendar/CompanyCalendar';
import EmployeeReferrals from '../EmployeeReferrals/EmployeeReferrals';
import EmployeeSkills from '../../components/SkillsCertifications/EmployeeSkills';
import EmployeeGoals from '../../components/Goals/EmployeeGoals';
import EmployeePerformance from '../../components/Goals/EmployeePerformance';
import EmployeeInternalMobility from '../../components/InternalMobility/EmployeeInternalMobility';
import EmployeeInterviews from '../../components/InterviewManagement/EmployeeInterviews';
import MySalary from '../../components/SalaryManagement/MySalary';
import MyAssets from '../../components/AssetManagement/MyAssets';
import MyExit from '../../components/ExitManagement/MyExit';
import EmployeeComplaints from '../../components/ComplaintManagement/EmployeeComplaints';
import EmployeeServiceRequests from '../../components/ServiceRequestManagement/EmployeeServiceRequests';
import ServiceHistory from '../../components/ServiceHistory/ServiceHistory';
import EmployeeTraining from '../../components/TrainingManagement/EmployeeTraining';
import GlobalSearch from '../../components/Search/GlobalSearch';
import ActivityFeedSection from '../../components/Activity/ActivityFeedSection';
import ActivityTimeline from '../ActivityTimeline/ActivityTimeline';
import MyWorkload from '../../components/Workload/MyWorkload';
import PolicyKnowledgeHub from '../../components/PolicyKnowledgeHub/PolicyKnowledgeHub';
import MeetingRooms from '../../components/MeetingRooms/MeetingRooms';
import EmployeeTravel from '../../components/BusinessTravel/EmployeeTravel';

const EmployeeDashboard = ({ defaultTab = 'Dashboard' }) => {
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
    } else {
      navigate('/login');
    }
  }, [navigate]);

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
    if (tabId === 'Dashboard' && window.location.pathname !== '/employee/dashboard') {
      navigate('/employee/dashboard');
    } else if (tabId === 'Activity Timeline' && window.location.pathname !== '/employee/activity') {
      navigate('/employee/activity');
    }
  };

  const fetchDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      const res = await fetch('http://localhost:5000/api/user/employee-dashboard', {
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
    { id: 'Attendance', label: 'Attendance', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
    { id: 'Leave Management', label: 'Leave Management', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Calendar', label: 'Company Calendar', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><rect x="8" y="14" width="2" height="2" /><rect x="14" y="14" width="2" height="2" /></> },
    { id: 'Meeting Rooms', label: 'Meeting Rooms', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Business Travel', label: 'Business Travel', icon: <><path d="M2 22h20M2 12h20M17.5 12l2.5-8L18 2H6L4.5 12M5 22V12h14v10" /></> },
    { id: 'Events', label: 'Events', icon: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
    { id: 'Announcements', label: 'Announcements', icon: <><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" /></> },
    { id: 'My Tasks', label: 'My Tasks', icon: <><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></> },
    { id: 'My Timesheets', label: 'My Timesheets', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { id: 'My Salary', label: 'My Salary', icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
    { id: 'Projects', label: 'Projects', icon: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></> },
    { id: 'Documents', label: 'Documents', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { id: 'Policy & HR Knowledge Hub', label: 'Policy Hub', icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></> },
    { id: 'Internal Mobility', label: 'Internal Mobility', icon: <><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></> },
    { id: 'Employee Referrals', label: 'Employee Referrals', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    { id: 'Skills & Certifications', label: 'Skills & Certs', icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></> },
    { id: 'Performance', label: 'Performance & Goals', icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></> },
    { id: 'My Reviews', label: 'My Reviews', icon: <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></> },
    { id: 'My Interviews', label: 'My Interviews', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'My Assets', label: 'My Assets', icon: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></> },
    { id: 'My Learning', label: 'My Learning', icon: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14z" /><path d="M6 7h12M6 11h12M6 15h12" /></> },
    { id: 'Complaints', label: 'Complaints', icon: <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></> },
    { id: 'Service Requests', label: 'Service Requests', icon: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 9.36l-7.1 7.1a1 1 0 0 1-1.4 0l-2.83-2.83a1 1 0 0 1 0-1.4l7.1-7.1a6 6 0 0 1 9.36-7.94l-3.77 3.77z"/></> },
    { id: 'Service History', label: 'Service History', icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></> },
    { id: 'Activity Timeline', label: 'Activity', icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></> },
    { id: 'My Exit', label: 'My Exit', icon: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></> },
  ];

  const aiItems = [
    { id: 'AI Shadow Profile', label: 'AI Shadow Profile', icon: <><path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z" /><path d="M12 6v6l4 2" /></> },
    { id: 'AI Meeting Hub', label: 'AI Meeting Hub', icon: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></> },
    { id: 'AI Chatbot', label: 'AI Chatbot', icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></> },
  ];

  if (!user) return <div className="emp-loading">Loading Dashboard...</div>;

  return (
    <div className="emp-layout">
      {/* Sidebar Navigation */}
      <aside className="emp-sidebar">
        <div className="emp-brand">
          <div className="emp-brand-icon">
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

        <div className="emp-nav-group">
          <p className="emp-nav-title">MAIN MENU</p>
          <nav>
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`emp-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleTabChange(item.id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="emp-nav-icon">
                  {item.icon}
                </svg>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="emp-nav-group">
          <p className="emp-nav-title ai-title">AI ASSISTANTS</p>
          <nav>
            {aiItems.map((item) => (
              <button
                key={item.id}
                className={`emp-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleTabChange(item.id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="emp-nav-icon">
                  {item.icon}
                </svg>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="emp-main">
        {/* Top Header */}
        <header className="emp-header">
          <GlobalSearch className="emp-header-search" />

          <div className="emp-header-actions">
            <NotificationBell onNotificationClick={setActiveTab} />

            <div className="emp-user-profile-wrapper" style={{ position: 'relative' }}>
              <div
                className="emp-user-profile"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ cursor: 'pointer' }}
              >
                <div className="emp-avatar">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="emp-avatar-img" />
                  ) : (
                    <>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</>
                  )}
                </div>
                <div className="emp-user-info">
                  <span className="emp-user-name">{user.firstName} {user.lastName}</span>
                  <span className="emp-user-role">ID: {user.employeeCode || 'N/A'}</span>
                </div>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="emp-dropdown-icon">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {isDropdownOpen && (
                <div className="emp-profile-dropdown">
                  <button onClick={() => { setActiveTab('My Profile'); setIsDropdownOpen(false); }}>
                    View Profile
                  </button>
                  <button onClick={() => setIsDropdownOpen(false)}>
                    Settings
                  </button>
                  <div className="emp-dropdown-divider"></div>
                  <button onClick={handleLogout} className="emp-text-danger">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="emp-content-area">
          {activeTab === 'Dashboard' ? (
            <div className="emp-dashboard-overview">
              <div className="emp-welcome-banner">
                <h1>Welcome back, {user.firstName}! 👋</h1>
                <p>Here's what's happening in your workspace today.</p>
              </div>

              {loadingDashboard ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading dashboard...</div>
              ) : dashboardError ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>{dashboardError}</div>
              ) : !dashboardData ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No projects assigned yet</div>
              ) : (
                <>
                  {/* Metric Cards */}
                  <div className="emp-metrics-grid">
                    <div className="emp-metric-card">
                      <div className="emp-metric-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      </div>
                      <div className="emp-metric-info">
                        <h3>Leave Balance</h3>
                        <p className="emp-metric-value">{dashboardData.leaveStats?.balance ?? 0} Days</p>
                      </div>
                    </div>

                    <div className="emp-metric-card">
                      <div className="emp-metric-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      </div>
                      <div className="emp-metric-info">
                        <h3>Pending Leave Requests</h3>
                        <p className="emp-metric-value">{dashboardData.leaveStats?.pending ?? 0}</p>
                      </div>
                    </div>

                    <div className="emp-metric-card">
                      <div className="emp-metric-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      </div>
                      <div className="emp-metric-info">
                        <h3>Assigned Projects</h3>
                        <p className="emp-metric-value">{dashboardData.projects?.length ?? 0}</p>
                      </div>
                    </div>

                    <div className="emp-metric-card">
                      <div className="emp-metric-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                      </div>
                      <div className="emp-metric-info">
                        <h3>Pending Tasks</h3>
                        <p className="emp-metric-value">{dashboardData.taskStats?.pending ?? 0}</p>
                      </div>
                    </div>

                    <div className="emp-metric-card">
                      <div className="emp-metric-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      </div>
                      <div className="emp-metric-info">
                        <h3>Today's Status</h3>
                        <p className="emp-metric-value">{dashboardData.todayAttendance?.status || 'Not Checked In'}</p>
                      </div>
                    </div>

                    <div className="emp-metric-card">
                      <div className="emp-metric-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </div>
                      <div className="emp-metric-info">
                        <h3>Check In</h3>
                        <p className="emp-metric-value">
                          {dashboardData.todayAttendance?.checkIn 
                            ? new Date(dashboardData.todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '--:--'}
                        </p>
                      </div>
                    </div>

                    <div className="emp-metric-card">
                      <div className="emp-metric-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </div>
                      <div className="emp-metric-info">
                        <h3>Check Out</h3>
                        <p className="emp-metric-value">
                          {dashboardData.todayAttendance?.checkOut 
                            ? new Date(dashboardData.todayAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '--:--'}
                        </p>
                      </div>
                    </div>

                    <div className="emp-metric-card">
                      <div className="emp-metric-icon" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>
                      <div className="emp-metric-info">
                        <h3>Working Hours</h3>
                        <p className="emp-metric-value">{dashboardData.todayAttendance?.workingHours || 0} hrs</p>
                      </div>
                    </div>

                    {/* Referral Metrics */}
                    <div className="emp-metric-card">
                      <div className="emp-metric-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      </div>
                      <div className="emp-metric-info">
                        <h3>Total Referrals</h3>
                        <p className="emp-metric-value">{dashboardData.referralStats?.total ?? 0}</p>
                      </div>
                    </div>

                    <div className="emp-metric-card">
                      <div className="emp-metric-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      </div>
                      <div className="emp-metric-info">
                        <h3>Pending Referrals</h3>
                        <p className="emp-metric-value">{dashboardData.referralStats?.pending ?? 0}</p>
                      </div>
                    </div>

                    <div className="emp-metric-card">
                      <div className="emp-metric-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      </div>
                      <div className="emp-metric-info">
                        <h3>Hired Referrals</h3>
                        <p className="emp-metric-value">{dashboardData.referralStats?.hired ?? 0}</p>
                      </div>
                    </div>
                  </div>

              {/* Lower Sections Grid */}
              <div className="emp-sections-grid">
                
                {/* My Projects */}
                <section className="emp-card emp-full-width">
                  <div className="emp-card-header">
                    <h2>My Projects</h2>
                    <button className="emp-btn-text" onClick={() => setActiveTab('Projects')}>View All</button>
                  </div>
                  <div className="emp-card-body">
                    <ul className="emp-list emp-list-horizontal">
                      {dashboardData.projects?.length > 0 ? dashboardData.projects.map(project => (
                        <li key={project._id} className="emp-list-item">
                          <div className="emp-list-icon">📁</div>
                          <div className="emp-list-content">
                            <h4>{project.name}</h4>
                            <p>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</p>
                          </div>
                        </li>
                      )) : <p style={{color: '#6b7280', padding: '10px 0'}}>No assigned projects</p>}
                    </ul>
                  </div>
                </section>

                {/* Recent Activity */}
                <div style={{ gridColumn: 'span 12' }}>
                  <ActivityFeedSection limit={6} filter="me" role="Employee" layout="horizontal" />
                </div>

                {/* My Team & Manager */}
                <section className="emp-card emp-announcements">
                  <div className="emp-card-header">
                    <h2>My Team & Manager</h2>
                  </div>
                  <div className="emp-card-body">
                    <div className="emp-list-horizontal">
                      {dashboardData.managers?.map(mgr => (
                        <div key={mgr._id} className="emp-alert emp-alert-info" style={{marginBottom: 0, display: 'flex', alignItems: 'center', gap: '10px'}}>
                           <div style={{ width: '40px', height: '40px', background: '#bfdbfe', color: '#1e3a8a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', overflow: 'hidden', flexShrink: 0 }}>
                             {mgr.profileImage ? <img src={mgr.profileImage} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : `${mgr.firstName.charAt(0)}${mgr.lastName.charAt(0)}`}
                           </div>
                           <div>
                            <h4>{mgr.firstName} {mgr.lastName} (Manager)</h4>
                            <p>{mgr.email}</p>
                           </div>
                        </div>
                      ))}
                      
                      {(() => {
                        const otherMembers = dashboardData.teamMembers?.filter(m => String(m._id) !== String(user._id) && String(m._id) !== String(user.id)) || [];
                        return (
                          <>
                            {otherMembers.slice(0, 3).map(member => (
                              <div key={member._id} className="emp-alert emp-alert-success" style={{marginBottom: 0, display: 'flex', alignItems: 'center', gap: '10px'}}>
                                 <div style={{ width: '40px', height: '40px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', overflow: 'hidden', flexShrink: 0 }}>
                                   {member.profileImage ? <img src={member.profileImage} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`}
                                 </div>
                                 <div>
                                  <h4>{member.firstName} {member.lastName}</h4>
                                  <p>{member.designationName || 'Team Member'}</p>
                                 </div>
                              </div>
                            ))}
                            {otherMembers.length > 3 && <p style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '0.85rem'}}>+ {otherMembers.length - 3} more</p>}
                            {(!dashboardData.managers?.length && !otherMembers.length) && <p style={{color: '#6b7280'}}>No team members assigned</p>}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </section>

                {/* Task Summary */}
                <section className="emp-card emp-full-width">
                  <div className="emp-card-header">
                    <h2>Task Progress</h2>
                    <button className="emp-btn-text" onClick={() => setActiveTab('My Tasks')}>View All</button>
                  </div>
                  <div className="emp-card-body">
                    <ul className="emp-list emp-list-horizontal">
                      <li className="emp-list-item">
                        <div className="emp-list-icon" style={{color: '#16a34a'}}><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div>
                        <div className="emp-list-content">
                          <h4>Completed Tasks</h4>
                          <p>{dashboardData.taskStats?.completed ?? 0} out of {dashboardData.taskStats?.total ?? 0}</p>
                        </div>
                      </li>
                      <li className="emp-list-item">
                        <div className="emp-list-icon" style={{color: '#0284c7'}}><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></div>
                        <div className="emp-list-content">
                          <h4>In Progress Tasks</h4>
                          <p>{dashboardData.taskStats?.inProgress ?? 0}</p>
                        </div>
                      </li>
                    </ul>
                    <div style={{ marginTop: '15px' }}>
                       <p style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151', marginBottom: '5px'}}>Progress: {dashboardData.taskStats?.total > 0 ? Math.round((dashboardData.taskStats.completed / dashboardData.taskStats.total) * 100) : 0}%</p>
                       <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                         <div style={{ width: `${dashboardData.taskStats?.total > 0 ? (dashboardData.taskStats.completed / dashboardData.taskStats.total) * 100 : 0}%`, height: '100%', backgroundColor: '#16a34a' }}></div>
                       </div>
                    </div>
                  </div>
                </section>

                {/* Timesheet & Attendance Summary */}
                <section className="emp-card emp-full-width">
                  <div className="emp-card-header">
                    <h2>Timesheets & Attendance</h2>
                  </div>
                  <div className="emp-card-body">
                    <ul className="emp-list emp-list-horizontal">
                      <li className="emp-list-item">
                        <div className="emp-list-icon" style={{color: '#0284c7'}}>📄</div>
                        <div className="emp-list-content">
                          <h4>Submitted Timesheets</h4>
                          <p>{dashboardData.timesheetStats?.total ?? 0} timesheets ({dashboardData.timesheetStats?.approved ?? 0} approved)</p>
                        </div>
                      </li>
                      <li className="emp-list-item">
                        <div className="emp-list-icon" style={{color: '#16a34a'}}>📅</div>
                        <div className="emp-list-content">
                          <h4>Attendance</h4>
                          <p>{dashboardData.attendanceStats?.present ?? 0} Days Present • {dashboardData.attendanceStats?.absent ?? 0} Days Absent</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* My Goals */}
                <section className="emp-card emp-full-width">
                  <div className="emp-card-header">
                    <h2>My Goals</h2>
                    <button className="emp-btn-text" onClick={() => setActiveTab('Performance')}>View All Goals</button>
                  </div>
                  <div className="emp-card-body">
                    <ul className="emp-list emp-list-horizontal">
                      <li className="emp-list-item">
                        <div className="emp-list-icon" style={{color: '#3b82f6'}}>🎯</div>
                        <div className="emp-list-content">
                          <h4>Track Your Performance</h4>
                          <p>Update progress on your assigned goals and view manager feedback.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Upcoming Events */}
                <section style={{ gridColumn: 'span 12' }}>
                  <UpcomingEventsWidget />
                </section>

              </div>
                </>
              )}
            </div>
          ) : activeTab === 'My Profile' ? (
            <UserProfile user={user} setUser={setUser} />
          ) : activeTab === 'Workload' ? (
            <MyWorkload />
          ) : activeTab === 'Leave Management' ? (
            <LeaveManagement />
          ) : activeTab === 'Attendance' ? (
            <AttendanceManagement />
          ) : activeTab === 'My Tasks' ? (
            <EmployeeTasks />
          ) : activeTab === 'My Timesheets' ? (
            <EmployeeTimesheets />
          ) : activeTab === 'Projects' ? (
            <EmployeeProjects />
          ) : activeTab === 'My Meetings' ? (
            <MeetingRooms userRole="Employee" user={user} />
          ) : activeTab === 'Business Travel' ? (
            <EmployeeTravel setActiveTab={setActiveTab} />
          ) : activeTab === 'Calendar' ? (
            <CompanyCalendar user={user} viewType="Employee" />
          ) : activeTab === 'Events' ? (
            <EventManagement user={user} viewType="Employee" />
          ) : activeTab === 'Announcements' ? (
            <AnnouncementManagement user={user} viewType="Employee" />
          ) : activeTab === 'Documents' ? (
            <DocumentManagement user={user} viewType="Employee" />
          ) : activeTab === 'Policy & HR Knowledge Hub' ? (
            <PolicyKnowledgeHub user={user} userRole="Employee" />
          ) : activeTab === 'Employee Referrals' ? (
            <EmployeeReferrals />
          ) : activeTab === 'Skills & Certifications' ? (
            <EmployeeSkills user={user} />
          ) : activeTab === 'Performance' ? (
            <EmployeeGoals />
          ) : activeTab === 'My Reviews' ? (
            <EmployeePerformance />
          ) : activeTab === 'Internal Mobility' ? (
            <EmployeeInternalMobility user={user} />
          ) : activeTab === 'My Interviews' ? (
            <EmployeeInterviews />
          ) : activeTab === 'My Salary' ? (
            <MySalary user={user} />
          ) : activeTab === 'My Assets' ? (
            <MyAssets />
          ) : activeTab === 'My Learning' ? (
            <EmployeeTraining />
          ) : activeTab === 'Complaints' ? (
            <EmployeeComplaints />
          ) : activeTab === 'Service Requests' ? (
            <EmployeeServiceRequests />
          ) : activeTab === 'Service History' ? (
            <ServiceHistory />
          ) : activeTab === 'My Exit' ? (
            <MyExit />
          ) : activeTab === 'Activity Timeline' ? (
            <ActivityTimeline />
          ) : (
            <div className="emp-placeholder-view">
              <div className="emp-placeholder-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="emp-placeholder-icon">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                <h2>{activeTab} Module</h2>
                <p>This module is currently under construction. Backend integration with MongoDB Atlas will be implemented here soon.</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('Dashboard')}>Back to Dashboard</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
