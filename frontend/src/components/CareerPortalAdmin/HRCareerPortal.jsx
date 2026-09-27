import React, { useState } from 'react';
import './HRCareerPortal.css';
import JobManagement from './JobManagement';
import ApplicationManagement from './ApplicationManagement';
import InterviewManagement from './InterviewManagement';

const HRCareerPortal = () => {
  const [activeTab, setActiveTab] = useState('job-management');

  return (
    <div className="hr-career-portal">
      <div className="hrcp-header">
        <h1>Career Portal Management</h1>
        <p>Manage job listings, review applications, and schedule interviews.</p>
      </div>

      <div className="hrcp-tabs">
        <button 
          className={`hrcp-tab ${activeTab === 'job-management' ? 'active' : ''}`}
          onClick={() => setActiveTab('job-management')}
        >
          Job Management
        </button>
        <button 
          className={`hrcp-tab ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
        <button 
          className={`hrcp-tab ${activeTab === 'interviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('interviews')}
        >
          Interviews
        </button>
      </div>

      <div className="hrcp-content">
        {activeTab === 'job-management' && <JobManagement />}
        
        {activeTab === 'applications' && <ApplicationManagement />}

        {activeTab === 'interviews' && <InterviewManagement />}
      </div>
    </div>
  );
};

export default HRCareerPortal;
