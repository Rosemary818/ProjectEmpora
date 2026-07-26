import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CareerPortalDashboard.css';

const CareerPortalDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('browse-jobs');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return <div className="career-loading">Loading Career Portal...</div>;

  return (
    <div className="career-dashboard">
      <aside className="career-sidebar">
        <div className="career-brand">
          <h2>EMPORA</h2>
          <p>Career Portal</p>
        </div>
        
        <nav className="career-nav">
          <button 
            className={`career-nav-btn ${activeTab === 'browse-jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse-jobs')}
          >
            Browse & Search Jobs
          </button>
          <button 
            className={`career-nav-btn ${activeTab === 'my-applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-applications')}
          >
            My Applications
          </button>
          <button 
            className={`career-nav-btn ${activeTab === 'candidate-profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('candidate-profile')}
          >
            Candidate Profile
          </button>
          <button 
            className={`career-nav-btn ${activeTab === 'resume-builder' ? 'active' : ''}`}
            onClick={() => setActiveTab('resume-builder')}
          >
            AI Resume Builder
          </button>
          <button 
            className={`career-nav-btn ${activeTab === 'interview-assistant' ? 'active' : ''}`}
            onClick={() => setActiveTab('interview-assistant')}
          >
            AI Interview Assistant
          </button>
        </nav>

        <div className="career-sidebar-footer">
          <button className="career-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="career-main">
        <header className="career-header">
          <h1>Welcome, {user.firstName}!</h1>
          <div className="career-header-actions">
            <button className="career-notification-btn">Notifications (0)</button>
          </div>
        </header>

        <div className="career-content">
          {activeTab === 'browse-jobs' && (
            <section className="career-section">
              <h2>Browse Jobs</h2>
              <div className="placeholder-card">
                <p>Job Search and Filtering capabilities will be available here.</p>
                <ul>
                  <li>Search Jobs</li>
                  <li>Job Details</li>
                  <li>Apply for Jobs</li>
                </ul>
              </div>
            </section>
          )}

          {activeTab === 'my-applications' && (
            <section className="career-section">
              <h2>My Applications</h2>
              <div className="placeholder-card">
                <p>Track your application status here.</p>
                <p>No active applications found.</p>
              </div>
            </section>
          )}

          {activeTab === 'candidate-profile' && (
            <section className="career-section">
              <h2>Candidate Profile</h2>
              <div className="profile-card">
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <button className="btn-secondary" style={{ marginTop: '1rem' }}>Upload Resume</button>
              </div>
            </section>
          )}

          {activeTab === 'resume-builder' && (
            <section className="career-section">
              <h2>AI Resume Builder</h2>
              <div className="placeholder-card ai-feature">
                <p>AI-powered resume generation coming soon.</p>
              </div>
            </section>
          )}

          {activeTab === 'interview-assistant' && (
            <section className="career-section">
              <h2>AI Interview Assistant</h2>
              <div className="placeholder-card ai-feature">
                <p>Interactive AI mock interviews coming soon.</p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default CareerPortalDashboard;
