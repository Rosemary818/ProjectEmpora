import React, { useState, useEffect } from 'react';

const ReportsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reports/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || 'Failed to load dashboard');
      }
    } catch (err) {
      setError('Network error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;
  if (!data) return null;

  return (
    <div className="report-view">
      <div className="report-view-header">
        <h3>Reports Overview</h3>
      </div>
      
      <div className="reports-dashboard-grid">
        <div className="report-card">
          <h4>Employees by Department</h4>
          {data.departmentDistribution.map(d => (
            <div key={d.name} className="stat-item">
              <span className="stat-name">{d.name}</span>
              <span className="stat-value">{d.value}</span>
            </div>
          ))}
        </div>

        <div className="report-card">
          <h4>Attendance Trends (Last 7 Days)</h4>
          {data.attendanceSummary.map(a => (
            <div key={a.name} className="stat-item">
              <span className="stat-name">{a.name}</span>
              <span className="stat-value">{a.value}</span>
            </div>
          ))}
        </div>

        <div className="report-card">
          <h4>Leave Trends</h4>
          {data.leaveSummary.map(l => (
            <div key={l.name} className="stat-item">
              <span className="stat-name">{l.name}</span>
              <span className="stat-value">{l.value}</span>
            </div>
          ))}
        </div>

        <div className="report-card">
          <h4>Project Status</h4>
          {data.projectSummary.map(p => (
            <div key={p.name} className="stat-item">
              <span className="stat-name">{p.name}</span>
              <span className="stat-value">{p.value}</span>
            </div>
          ))}
        </div>

        <div className="report-card">
          <h4>Top Skills Distribution</h4>
          {data.topSkills.map(s => (
            <div key={s.name} className="stat-item">
              <span className="stat-name">{s.name}</span>
              <span className="stat-value">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
