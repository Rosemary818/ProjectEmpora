import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';
import LeaveManagement from '../../components/LeaveManagement/LeaveManagement';
import AttendanceManagement from '../../components/AttendanceManagement/AttendanceManagement';
import EmployeeTasks from '../../components/TaskManagement/EmployeeTasks';
import EmployeeTimesheets from '../../components/TimesheetManagement/EmployeeTimesheets';
import EmployeeProjects from '../../components/ProjectManagement/EmployeeProjects';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    employeeCode: '',
    dateOfJoining: '',
    profileImage: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'My Profile') {
      fetchProfile();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProfileData({
          firstName: data.data.firstName || '',
          lastName: data.data.lastName || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          jobTitle: data.data.jobTitle || '',
          department: data.data.department || '',
          employeeCode: data.data.employeeCode || '',
          dateOfJoining: data.data.dateOfJoining ? data.data.dateOfJoining.split('T')[0] : '',
          profileImage: data.data.profileImage || ''
        });
        // Update user state for header
        setUser(prev => ({ ...prev, ...data.data }));
        localStorage.setItem('user', JSON.stringify(data.data));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Profile updated successfully!');
        setUser(prev => ({ ...prev, ...data.data }));
        localStorage.setItem('user', JSON.stringify(data.data));
        setIsEditingProfile(false); // Return to view mode
      } else {
        setMessage(data.message || 'Error updating profile');
      }
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setProfileData({ ...profileData, profileImage: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></> },
    { id: 'My Profile', label: 'My Profile', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
    { id: 'Attendance', label: 'Attendance', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
    { id: 'Leave Management', label: 'Leave Management', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { id: 'My Tasks', label: 'My Tasks', icon: <><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></> },
    { id: 'My Timesheets', label: 'My Timesheets', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { id: 'Projects', label: 'Projects', icon: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></> },
    { id: 'Documents', label: 'Documents', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { id: 'Internal Mobility', label: 'Internal Mobility', icon: <><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></> },
    { id: 'Employee Referrals', label: 'Employee Referrals', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
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
                onClick={() => setActiveTab(item.id)}
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
                onClick={() => setActiveTab(item.id)}
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
          <div className="emp-header-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search everywhere..." />
          </div>

          <div className="emp-header-actions">
            <button className="emp-icon-btn" aria-label="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="emp-badge">3</span>
            </button>

            <div className="emp-user-profile-wrapper">
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

              {/* Metric Cards */}
              <div className="emp-metrics-grid">
                <div className="emp-metric-card">
                  <div className="emp-metric-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </div>
                  <div className="emp-metric-info">
                    <h3>Leave Balance</h3>
                    <p className="emp-metric-value">12 Days</p>
                  </div>
                </div>

                <div className="emp-metric-card">
                  <div className="emp-metric-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  </div>
                  <div className="emp-metric-info">
                    <h3>Pending Leave Requests</h3>
                    <p className="emp-metric-value">1</p>
                  </div>
                </div>

                <div className="emp-metric-card">
                  <div className="emp-metric-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  </div>
                  <div className="emp-metric-info">
                    <h3>Assigned Projects</h3>
                    <p className="emp-metric-value">3</p>
                  </div>
                </div>

                <div className="emp-metric-card">
                  <div className="emp-metric-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                  </div>
                  <div className="emp-metric-info">
                    <h3>Pending Tasks</h3>
                    <p className="emp-metric-value">5</p>
                  </div>
                </div>
              </div>

              {/* Lower Sections Grid */}
              <div className="emp-sections-grid">
                <section className="emp-card emp-meetings">
                  <div className="emp-card-header">
                    <h2>Upcoming Meetings</h2>
                    <button className="emp-btn-text">View All</button>
                  </div>
                  <div className="emp-card-body">
                    <ul className="emp-list">
                      <li className="emp-list-item">
                        <div className="emp-list-icon">🎥</div>
                        <div className="emp-list-content">
                          <h4>Weekly Team Sync</h4>
                          <p>Today, 10:00 AM - 11:00 AM</p>
                        </div>
                      </li>
                      <li className="emp-list-item">
                        <div className="emp-list-icon">🤝</div>
                        <div className="emp-list-content">
                          <h4>Project Alpha Review</h4>
                          <p>Tomorrow, 2:00 PM - 3:00 PM</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="emp-card emp-activity">
                  <div className="emp-card-header">
                    <h2>Recent Activity</h2>
                  </div>
                  <div className="emp-card-body">
                    <ul className="emp-timeline">
                      <li>
                        <span className="emp-timeline-dot"></span>
                        <div className="emp-timeline-content">
                          <p>Leave request approved</p>
                          <span className="emp-timeline-time">2 hours ago</span>
                        </div>
                      </li>
                      <li>
                        <span className="emp-timeline-dot"></span>
                        <div className="emp-timeline-content">
                          <p>You completed a task in Project Beta</p>
                          <span className="emp-timeline-time">Yesterday</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="emp-card emp-announcements">
                  <div className="emp-card-header">
                    <h2>Announcements</h2>
                  </div>
                  <div className="emp-card-body">
                    <div className="emp-alert emp-alert-info">
                      <h4>Townhall Meeting</h4>
                      <p>Join us this Friday at 4 PM for the Q3 Company Townhall.</p>
                    </div>
                    <div className="emp-alert emp-alert-success">
                      <h4>New Health Benefits</h4>
                      <p>Updated health insurance policies are now available in the Documents section.</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          ) : activeTab === 'My Profile' ? (
            <div className="emp-profile-view">
              <div className="emp-card">
                <div className="emp-card-header">
                  <h2>My Profile</h2>
                </div>
                <div className="emp-card-body">
                  {message && (
                    <div className={`emp-alert ${message.includes('success') ? 'emp-alert-success' : 'emp-alert-danger'}`}>
                      <p>{message}</p>
                    </div>
                  )}

                  {!isEditingProfile ? (
                    <div className="emp-profile-details">
                      <div className="emp-profile-header-info">
                        <div className="emp-profile-photo-preview">
                          {profileData.profileImage ? (
                            <img src={profileData.profileImage} alt="Profile" />
                          ) : (
                            <div className="emp-profile-photo-placeholder">
                              {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="emp-profile-title">
                          <h3>{profileData.firstName} {profileData.lastName}</h3>
                          <p className="emp-text-muted">{profileData.jobTitle || 'Employee'}</p>
                        </div>
                        <button className="btn btn-primary emp-ml-auto" onClick={() => setIsEditingProfile(true)}>
                          Edit Profile
                        </button>
                      </div>

                      <div className="emp-profile-info-grid">
                        <div className="emp-info-item">
                          <span className="emp-info-label">First Name</span>
                          <span className="emp-info-value">{profileData.firstName}</span>
                        </div>
                        <div className="emp-info-item">
                          <span className="emp-info-label">Last Name</span>
                          <span className="emp-info-value">{profileData.lastName}</span>
                        </div>
                        <div className="emp-info-item">
                          <span className="emp-info-label">Email Address</span>
                          <span className="emp-info-value">{profileData.email}</span>
                        </div>
                        <div className="emp-info-item">
                          <span className="emp-info-label">Phone Number</span>
                          <span className="emp-info-value">{profileData.phone || 'Not provided'}</span>
                        </div>
                        <div className="emp-info-item">
                          <span className="emp-info-label">Department</span>
                          <span className="emp-info-value">{profileData.department || 'Not provided'}</span>
                        </div>
                        <div className="emp-info-item">
                          <span className="emp-info-label">Employee ID</span>
                          <span className="emp-info-value">{profileData.employeeCode || 'Not provided'}</span>
                        </div>
                        <div className="emp-info-item">
                          <span className="emp-info-label">Date of Joining</span>
                          <span className="emp-info-value">{profileData.dateOfJoining || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleProfileUpdate} className="emp-profile-form">
                      <div className="emp-profile-photo-section">
                        <div className="emp-profile-photo-preview">
                          {profileData.profileImage ? (
                            <img src={profileData.profileImage} alt="Profile Preview" />
                          ) : (
                            <div className="emp-profile-photo-placeholder">
                              {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="emp-profile-photo-actions">
                          <label className="btn btn-secondary emp-btn-upload">
                            Upload Photo
                            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                          </label>
                          {profileData.profileImage && (
                            <button type="button" className="emp-btn-text emp-text-danger" onClick={removeProfileImage}>
                              Remove
                            </button>
                          )}
                          <p className="emp-photo-hint">Recommended: Square image, max 5MB.</p>
                        </div>
                      </div>

                      <div className="emp-form-grid">
                        <div className="emp-form-group">
                          <label>First Name</label>
                          <input type="text" value={profileData.firstName} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} required />
                        </div>
                        <div className="emp-form-group">
                          <label>Last Name</label>
                          <input type="text" value={profileData.lastName} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} required />
                        </div>
                        <div className="emp-form-group">
                          <label>Email Address</label>
                          <input type="email" value={profileData.email} disabled className="emp-input-disabled" title="Email cannot be changed" />
                        </div>
                        <div className="emp-form-group">
                          <label>Phone Number</label>
                          <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
                        </div>
                        <div className="emp-form-group">
                          <label>Job Title</label>
                          <input type="text" value={profileData.jobTitle} onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })} />
                        </div>
                        <div className="emp-form-group">
                          <label>Department</label>
                          <input type="text" value={profileData.department} onChange={(e) => setProfileData({ ...profileData, department: e.target.value })} />
                        </div>
                        <div className="emp-form-group">
                          <label>Employee ID</label>
                          <input type="text" value={profileData.employeeCode} disabled onChange={(e) => setProfileData({ ...profileData, employeeCode: e.target.value })} />
                        </div>
                        <div className="emp-form-group">
                          <label>Date of Joining</label>
                          <input type="date" value={profileData.dateOfJoining} onChange={(e) => setProfileData({ ...profileData, dateOfJoining: e.target.value })} />
                        </div>
                      </div>

                      <div className="emp-form-actions">
                        <button type="button" className="btn btn-secondary emp-mr-2" onClick={() => setIsEditingProfile(false)} disabled={isSaving}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
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
