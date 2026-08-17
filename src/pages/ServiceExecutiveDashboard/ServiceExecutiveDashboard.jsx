import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ServiceExecutiveDashboard.css';
import NotificationBell from '../../components/Notifications/NotificationBell';
import ServiceExecutiveComplaints from '../../components/ComplaintManagement/ServiceExecutiveComplaints';
import ServiceExecutiveServiceRequests from '../../components/ServiceRequestManagement/ServiceExecutiveServiceRequests';
import ServiceExecutiveFeedback from '../../components/FeedbackManagement/ServiceExecutiveFeedback';
import GlobalSearch from '../../components/Search/GlobalSearch';

const ServiceExecutiveDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Complaints');
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
    { id: 'Complaints', label: 'Complaints', icon: <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></> },
    { id: 'Service Requests', label: 'Service Requests', icon: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 9.36l-7.1 7.1a1 1 0 0 1-1.4 0l-2.83-2.83a1 1 0 0 1 0-1.4l7.1-7.1a6 6 0 0 1 9.36-7.94l-3.77 3.77z"/></> },
    { id: 'Feedback', label: 'Feedback', icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></> },
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
                  <span className="hra-user-role">Service Executive</span>
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
                  <button className="hra-btn-text" style={{ display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', cursor: 'pointer', border: 'none', background: 'transparent' }} onClick={() => { setActiveTab('Settings'); setIsDropdownOpen(false); }}>
                    View Profile
                  </button>
                  <button className="hra-btn-text" style={{ display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', cursor: 'pointer', border: 'none', background: 'transparent' }} onClick={() => { setActiveTab('Settings'); setIsDropdownOpen(false); }}>
                    Settings
                  </button>
                  <div style={{ borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }}></div>
                  <button className="hra-btn-text hra-text-danger" style={{ display: 'block', width: '100%', padding: '0.5rem', textAlign: 'left', color: '#dc2626', cursor: 'pointer', border: 'none', background: 'transparent' }} onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="hra-content-area">
          {activeTab === 'Complaints' ? (
            <ServiceExecutiveComplaints />
          ) : activeTab === 'Service Requests' ? (
            <ServiceExecutiveServiceRequests />
          ) : activeTab === 'Feedback' ? (
            <ServiceExecutiveFeedback />
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
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ServiceExecutiveDashboard;
