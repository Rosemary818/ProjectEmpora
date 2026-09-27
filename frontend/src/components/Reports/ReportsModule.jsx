import React, { useState } from 'react';
import './ReportsModule.css';
import ReportsDashboard from './ReportsDashboard';
import AttendanceReport from './AttendanceReport';
import LeaveReport from './LeaveReport';
import DepartmentReport from './DepartmentReport';
import EmployeeReport from './EmployeeReport';
import ProjectReport from './ProjectReport';
import SkillsReport from './SkillsReport';
import CertificationReport from './CertificationReport';

const ReportsModule = () => {
  const [activeReport, setActiveReport] = useState('Dashboard');

  const renderContent = () => {
    switch (activeReport) {
      case 'Dashboard': return <ReportsDashboard />;
      case 'Attendance Report': return <AttendanceReport />;
      case 'Leave Report': return <LeaveReport />;
      case 'Department Report': return <DepartmentReport />;
      case 'Employee Report': return <EmployeeReport />;
      case 'Project Report': return <ProjectReport />;
      case 'Skills Report': return <SkillsReport />;
      case 'Certification Report': return <CertificationReport />;
      default: return <ReportsDashboard />;
    }
  };

  const navItems = [
    'Dashboard',
    'Attendance Report',
    'Leave Report',
    'Department Report',
    'Employee Report',
    'Project Report',
    'Skills Report',
    'Certification Report'
  ];

  return (
    <div className="reports-module-container">
      <div className="reports-header no-print">
        <h2>Reports & Analytics</h2>
        <p>View and export organization data</p>
      </div>

      <div className="reports-nav-tabs no-print">
        {navItems.map((item) => (
          <button
            key={item}
            className={`report-tab-btn ${activeReport === item ? 'active' : ''}`}
            onClick={() => setActiveReport(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="reports-content-area">
        {renderContent()}
      </div>
    </div>
  );
};

export default ReportsModule;
