import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HRAdminDashboard.css';
import LeaveApprovals from '../../components/LeaveApprovals/LeaveApprovals';
import LeaveManagement from '../../components/LeaveManagement/LeaveManagement';
import HREmployeeManagement from '../../components/EmployeeManagement/HREmployeeManagement';
import HRProjectManagement from '../../components/ProjectManagement/HRProjectManagement';
import DocumentManagement from '../../components/DocumentManagement/DocumentManagement';
import NotificationBell from '../../components/Notifications/NotificationBell';
import AnnouncementManagement from '../../components/Announcements/AnnouncementManagement';
import EventManagement from '../../components/Events/EventManagement';
import UpcomingEventsWidget from '../../components/Events/UpcomingEventsWidget';
import CompanyCalendar from '../../components/Calendar/CompanyCalendar';
import HolidayManagement from '../../components/Calendar/HolidayManagement';
import ReportsModule from '../../components/Reports/ReportsModule';
import AttendanceManagement from '../../components/AttendanceManagement/AttendanceManagement';
import HREmployeeAttendance from '../../components/AttendanceManagement/HREmployeeAttendance';
import HRReferralManagement from '../HRReferralManagement/HRReferralManagement';
import DepartmentManagement from '../../components/DepartmentManagement/DepartmentManagement';
import DesignationManagement from '../../components/DesignationManagement/DesignationManagement';
import HRAdminSkills from '../../components/SkillsCertifications/HRAdminSkills';
import HRCareerPortal from '../../components/CareerPortalAdmin/HRCareerPortal';
import TalentManagement from '../../components/TalentManagement/TalentManagement';
import HRInternalMobility from '../../components/InternalMobility/HRInternalMobility';
import SalaryManagement from '../../components/SalaryManagement/SalaryManagement';
import PayslipManagement from '../../components/Payslips/PayslipManagement';
import AssetManagement from '../../components/AssetManagement/AssetManagement';
import ExitManagementAdmin from '../../components/ExitManagement/ExitManagementAdmin';
import HRTrainingManagement from '../../components/TrainingManagement/HRTrainingManagement';
import GlobalSearch from '../../components/Search/GlobalSearch';
import PolicyKnowledgeHub from '../../components/PolicyKnowledgeHub/PolicyKnowledgeHub';
import RoomManagement from '../../components/MeetingRooms/RoomManagement';
import HRClientVisitors from '../../components/MeetingRooms/HRClientVisitors';
import HRTravel from '../../components/BusinessTravel/HRTravel';
import HRBenchManagement from '../../components/BenchManagement/HRBenchManagement';
import HRAdminPromotions from '../../components/PromotionManagement/HRAdminPromotions';
import AdminWFH from '../../components/WFH/AdminWFH';
import ApprovalInbox from '../../components/ApprovalInbox/ApprovalInbox';

const HRAdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [interviewWidgets, setInterviewWidgets] = useState(null);
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
      const res = await fetch('http://localhost:5000/api/admin/hr-dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();

      const resInt = await fetch('http://localhost:5000/api/interviews/hr/widgets', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const intData = await resInt.json();

      if (res.ok) {
        setDashboardData(data.data);
        if (intData.success) {
          setInterviewWidgets(intData.data);
        }
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
    { id: 'Approval Inbox', label: 'Approval Inbox', icon: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><polyline points="9 14 12 17 15 14" /></> },
    { id: 'Departments', label: 'Departments', icon: <><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></> },
    { id: 'Designations', label: 'Designations', icon: <><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></> },
    { id: 'Employee Management', label: 'Employee Management', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    { id: 'Promotion Management', label: 'Promotions', icon: <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></> },
    { id: 'Talent Management', label: 'Talent Management', icon: <><circle cx="12" cy="12" r="10" /><path d="M12 8l3 3-3 3M8 12h7" /></> },
    { id: 'Employee Skills & Certs', label: 'Skills & Certs', icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></> },
    { id: 'My Leave', label: 'My Leave', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Leave Management', label: 'Leave Management', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
    { id: 'Remote Work', label: 'Remote Work', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'My Attendance', label: 'My Attendance', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { id: 'Employee Attendance', label: 'Employee Attendance', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    { id: 'Timesheets', label: 'Timesheets', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Salary Management', label: 'Salary Management', icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
    { id: 'Payslips', label: 'Payslips', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Projects', label: 'Projects', icon: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></> },
    { id: 'Documents', label: 'Documents', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { id: 'Policy & HR Knowledge Hub', label: 'Policy Hub', icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></> },
    { id: 'Calendar', label: 'Company Calendar', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><rect x="8" y="14" width="2" height="2" /><rect x="14" y="14" width="2" height="2" /></> },
    { id: 'Holiday Management', label: 'Holiday Management', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></> },
    { id: 'Events', label: 'Events', icon: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
    { id: 'Room Management', label: 'Room Management', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Client Visitors', label: 'Client Visitors', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></> },
    { id: 'Business Travel', label: 'Business Travel', icon: <><path d="M2 22h20M2 12h20M17.5 12l2.5-8L18 2H6L4.5 12M5 22V12h14v10" /></> },
    { id: 'Announcements', label: 'Announcements', icon: <><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" /></> },
    { id: 'Internal Mobility', label: 'Internal Mobility', icon: <><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></> },
    { id: 'Employee Referrals', label: 'Employee Referrals', icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></> },
    { id: 'Recruitment', label: 'Recruitment / Career Portal', icon: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></> },
    { id: 'Reports', label: 'Reports', icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
    { id: 'Asset Management', label: 'Asset Management', icon: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></> },
    { id: 'Bench Management', label: 'Bench Management', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'Exit Management', label: 'Exit Management', icon: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></> },
    { id: 'Training & Learning', label: 'Training & Learning', icon: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14z" /><path d="M6 7h12M6 11h12M6 15h12" /></> },
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
          <GlobalSearch className="hra-header-search" />

          <div className="hra-header-actions">
            <NotificationBell onNotificationClick={setActiveTab} />

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

              {loadingDashboard ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading HR overview...</div>
              ) : dashboardError ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>{dashboardError}</div>
              ) : !dashboardData ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No HR data available</div>
              ) : (
                <>
                  <div className="hra-metrics-grid">
                    <div className="hra-metric-card">
                      <div className="hra-metric-icon" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>
                      </div>
                      <div className="hra-metric-info">
                        <h3>Total Departments</h3>
                        <p className="hra-metric-value">{dashboardData.totalDepartments ?? 0}</p>
                      </div>
                    </div>

                    <div className="hra-metric-card">
                      <div className="hra-metric-icon" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      </div>
                      <div className="hra-metric-info">
                        <h3>Active Departments</h3>
                        <p className="hra-metric-value">{dashboardData.activeDepartments ?? 0}</p>
                      </div>
                    </div>

                    <div className="hra-metric-card">
                      <div className="hra-metric-icon" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                      </div>
                      <div className="hra-metric-info">
                        <h3>Total Designations</h3>
                        <p className="hra-metric-value">{dashboardData.totalDesignations ?? 0}</p>
                      </div>
                    </div>

                    <div className="hra-metric-card">
                      <div className="hra-metric-icon" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      </div>
                      <div className="hra-metric-info">
                        <h3>Active Designations</h3>
                        <p className="hra-metric-value">{dashboardData.activeDesignations ?? 0}</p>
                      </div>
                    </div>

                    <div className="hra-metric-card">
                      <div className="hra-metric-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      </div>
                      <div className="hra-metric-info">
                        <h3>Total Employees</h3>
                        <p className="hra-metric-value">{dashboardData.totalEmployees ?? 0}</p>
                      </div>
                    </div>

                    <div className="hra-metric-card">
                      <div className="hra-metric-icon" style={{ backgroundColor: '#fef9c3', color: '#ca8a04' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      </div>
                      <div className="hra-metric-info">
                        <h3>Total Managers</h3>
                        <p className="hra-metric-value">{dashboardData.totalManagers ?? 0}</p>
                      </div>
                    </div>

                    <div className="hra-metric-card">
                      <div className="hra-metric-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      </div>
                      <div className="hra-metric-info">
                        <h3>Total Employees</h3>
                        <p className="hra-metric-value">{dashboardData.totalEmployees ?? 0}</p>
                      </div>
                    </div>

                    <div className="hra-metric-card">
                      <div className="hra-metric-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                      </div>
                      <div className="hra-metric-info">
                        <h3>New Employees (This Month)</h3>
                        <p className="hra-metric-value">{dashboardData.newEmployeesThisMonth ?? 0}</p>
                      </div>
                    </div>

                    <div className="hra-metric-card">
                      <div className="hra-metric-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      </div>
                      <div className="hra-metric-info">
                        <h3>Pending Leave Requests</h3>
                        <p className="hra-metric-value">{dashboardData.pendingLeaveRequests ?? 0}</p>
                      </div>
                    </div>

                    <div className="hra-metric-card">
                      <div className="hra-metric-icon" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      </div>
                      <div className="hra-metric-info">
                        <h3>Pending Timesheets</h3>
                        <p className="hra-metric-value">{dashboardData.pendingTimesheets ?? 0}</p>
                      </div>
                    </div>

                    {/* HR Referral Metrics */}
                    <div className="hra-metric-card">
                      <div className="hra-metric-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                      </div>
                      <div className="hra-metric-info">
                        <h3>Total Referrals</h3>
                        <p className="hra-metric-value">{dashboardData.referralStats?.total ?? 0}</p>
                      </div>
                    </div>

                    <div className="hra-metric-card">
                      <div className="hra-metric-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      </div>
                      <div className="hra-metric-info">
                        <h3>Pending Review</h3>
                        <p className="hra-metric-value">{dashboardData.referralStats?.pending ?? 0}</p>
                      </div>
                    </div>

                    <div className="hra-metric-card">
                      <div className="hra-metric-icon" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      </div>
                      <div className="hra-metric-info">
                        <h3>Interviews</h3>
                        <p className="hra-metric-value">{dashboardData.referralStats?.interviews ?? 0}</p>
                      </div>
                    </div>

                    <div className="hra-metric-card">
                      <div className="hra-metric-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      </div>
                      <div className="hra-metric-info">
                        <h3>Hired</h3>
                        <p className="hra-metric-value">{dashboardData.referralStats?.hired ?? 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Interview Widgets */}
                  <div className="hra-sections-grid" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <section className="hra-card" style={{ gridColumn: 'span 4', display: 'flex', alignItems: 'center', padding: '1.5rem', gap: '1rem', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)' }}>
                      <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '50%' }}>
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" style={{ color: '#4338ca' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#374151' }}>Today's Interviews</h3>
                        <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold', color: '#111827' }}>{interviewWidgets?.todayInterviews ?? 0}</p>
                      </div>
                    </section>
                    <section className="hra-card" style={{ gridColumn: 'span 4', display: 'flex', alignItems: 'center', padding: '1.5rem', gap: '1rem', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
                      <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '50%' }}>
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" style={{ color: '#d97706' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#374151' }}>Upcoming Interviews</h3>
                        <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold', color: '#111827' }}>{interviewWidgets?.upcomingInterviews ?? 0}</p>
                      </div>
                    </section>
                    <section className="hra-card" style={{ gridColumn: 'span 4', display: 'flex', alignItems: 'center', padding: '1.5rem', gap: '1rem', background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' }}>
                      <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '50%' }}>
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" style={{ color: '#16a34a' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#374151' }}>Completed Interviews</h3>
                        <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold', color: '#111827' }}>{interviewWidgets?.completedInterviews ?? 0}</p>
                      </div>
                    </section>
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
                            <div className="hra-list-icon" style={{ color: '#16a34a' }}>●</div>
                            <div className="hra-list-content">
                              <h4>Active Employees</h4>
                              <p>{dashboardData.activeEmployees ?? 0} Employees currently active in the system</p>
                            </div>
                          </li>
                          <li className="hra-list-item">
                            <div className="hra-list-icon" style={{ color: '#dc2626' }}>●</div>
                            <div className="hra-list-content">
                              <h4>Inactive Employees</h4>
                              <p>{dashboardData.inactiveEmployees ?? 0} Employees currently inactive or on long-term leave</p>
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
                          {dashboardData.recentActivities?.length > 0 ? (
                            dashboardData.recentActivities.map((act) => (
                              <li key={act.id}>
                                <span className="hra-timeline-dot"></span>
                                <div className="hra-timeline-content">
                                  <p>{act.action}</p>
                                  <span className="hra-timeline-time">{new Date(act.date).toLocaleDateString()} {new Date(act.date).toLocaleTimeString()}</span>
                                </div>
                              </li>
                            ))
                          ) : (
                            <p style={{ color: '#6b7280' }}>No recent activities</p>
                          )}
                        </ul>
                      </div>
                    </section>

                    {/* Department Overview */}
                    <section className="hra-card hra-meetings" style={{ gridColumn: 'span 8' }}>
                      <div className="hra-card-header">
                        <h2>Department Overview</h2>
                      </div>
                      <div className="hra-card-body">
                        {dashboardData.departmentOverview?.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                            {dashboardData.departmentOverview.map((dept, index) => (
                              <div key={index} style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1rem', color: '#374151', marginBottom: '0.5rem' }}>{dept.name}</h3>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{dept.value}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                            <div style={{ textAlign: 'center', color: '#6b7280' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '48px', height: '48px', margin: '0 auto 10px', opacity: '0.5' }}>
                                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
                              </svg>
                              <p>No department data available.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Designation Overview */}
                    <section className="hra-card hra-meetings" style={{ gridColumn: 'span 8' }}>
                      <div className="hra-card-header">
                        <h2>Employees by Designation</h2>
                      </div>
                      <div className="hra-card-body">
                        {dashboardData.employeesByDesignation?.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                            {dashboardData.employeesByDesignation.map((desig, index) => (
                              <div key={index} style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1rem', color: '#374151', marginBottom: '0.5rem' }}>{desig.name}</h3>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{desig.value}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                            <div style={{ textAlign: 'center', color: '#6b7280' }}>
                              <p>No designation data available.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>

                    <section className="hra-card hra-meetings" style={{ gridColumn: 'span 4' }}>
                      <div className="hra-card-header">
                        <h2>Managers by Designation</h2>
                      </div>
                      <div className="hra-card-body">
                        {dashboardData.managersByDesignation?.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                            {dashboardData.managersByDesignation.filter(m => m.value > 0).map((desig, index) => (
                              <div key={index} style={{ padding: '0.75rem', background: '#fef3c7', borderRadius: '8px', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>{desig.name}</h3>
                                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#d97706' }}>{desig.value}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                            <div style={{ textAlign: 'center', color: '#6b7280' }}>
                              <p>No manager data.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Upcoming Events */}
                    <section style={{ gridColumn: 'span 4' }}>
                      <UpcomingEventsWidget />
                    </section>

                  </div>
                </>
              )}
            </div>
          ) : activeTab === 'Approval Inbox' ? (
            <ApprovalInbox />
          ) : activeTab === 'Departments' ? (
            <DepartmentManagement />
          ) : activeTab === 'Designations' ? (
            <DesignationManagement />
          ) : activeTab === 'Projects' ? (
            <HRProjectManagement />
          ) : activeTab === 'Employee Management' ? (
            <HREmployeeManagement />
          ) : activeTab === 'Promotion Management' ? (
            <HRAdminPromotions />
          ) : activeTab === 'Employee Skills & Certs' ? (
            <HRAdminSkills />
          ) : activeTab === 'Remote Work' ? (
            <AdminWFH />
          ) : activeTab === 'Leave Management' ? (
            <LeaveApprovals />
          ) : activeTab === 'Documents' ? (
            <DocumentManagement user={user} viewType="HR" />
          ) : activeTab === 'Policy & HR Knowledge Hub' ? (
            <PolicyKnowledgeHub user={user} userRole="HR Admin" />
          ) : activeTab === 'Calendar' ? (
            <CompanyCalendar user={user} viewType="HRAdmin" />
          ) : activeTab === 'Holiday Management' ? (
            <HolidayManagement user={user} onBack={() => setActiveTab('Calendar')} />
          ) : activeTab === 'Events' ? (
            <EventManagement user={user} viewType="HRAdmin" />
          ) : activeTab === 'Room Management' ? (
            <RoomManagement />
          ) : activeTab === 'Client Visitors' ? (
            <HRClientVisitors />
          ) : activeTab === 'Business Travel' ? (
            <HRTravel />
          ) : activeTab === 'Announcements' ? (
            <AnnouncementManagement user={user} viewType="HRAdmin" />
          ) : activeTab === 'My Leave' ? (
            <LeaveManagement />
          ) : activeTab === 'My Attendance' ? (
            <AttendanceManagement />
          ) : activeTab === 'Employee Attendance' ? (
            <HREmployeeAttendance />
          ) : activeTab === 'Employee Referrals' ? (
            <HRReferralManagement />
          ) : activeTab === 'Recruitment' ? (
            <HRCareerPortal user={user} />
          ) : activeTab === 'Interview Management' ? (
            <InterviewManagementAdmin />
          ) : activeTab === 'Talent Management' ? (
            <TalentManagement />
          ) : activeTab === 'Reports' ? (
            <ReportsModule />
          ) : activeTab === 'Internal Mobility' ? (
            <HRInternalMobility user={user} />
          ) : activeTab === 'Salary Management' ? (
            <SalaryManagement />
          ) : activeTab === 'Payslips' ? (
            <PayslipManagement />
          ) : activeTab === 'Asset Management' ? (
            <AssetManagement />
          ) : activeTab === 'Bench Management' ? (
            <HRBenchManagement />
          ) : activeTab === 'Exit Management' ? (
            <ExitManagementAdmin />
          ) : activeTab === 'Training & Learning' ? (
            <HRTrainingManagement />
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
