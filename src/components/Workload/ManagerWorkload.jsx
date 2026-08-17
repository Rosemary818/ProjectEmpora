import React, { useState, useEffect } from 'react';
import { workloadService } from '../../services/workload.service';
import MyWorkload from './MyWorkload';
import './Workload.css';

const ManagerWorkload = () => {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeamWorkload();
  }, []);

  const fetchTeamWorkload = async () => {
    try {
      setLoading(true);
      const res = await workloadService.getTeamWorkload();
      if (res.success) {
        setTeamData(res.data);
      }
    } catch (err) {
      setError('Failed to fetch team workload data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Balanced') return '#16a34a'; // Green
    if (status === 'Moderate') return '#d97706'; // Yellow/Orange
    if (status === 'High') return '#dc2626';     // Red
    return '#6b7280';
  };

  const renderTeamSummary = () => {
    if (!teamData) return null;
    
    const total = teamData.length;
    let balanced = 0, moderate = 0, high = 0;
    
    teamData.forEach(member => {
      if (member.workloadStatus === 'Balanced') balanced++;
      else if (member.workloadStatus === 'Moderate') moderate++;
      else if (member.workloadStatus === 'High') high++;
    });

    return (
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ fontWeight: 'bold', color: '#111827' }}>Team Members: {total}</div>
        <div style={{ color: '#16a34a' }}>Balanced: {balanced}</div>
        <div style={{ color: '#d97706' }}>Moderate: {moderate}</div>
        <div style={{ color: '#dc2626', fontWeight: high > 0 ? 'bold' : 'normal' }}>High: {high}</div>
      </div>
    );
  };

  return (
    <div>
      {/* First, show the Manager's own workload just like an employee */}
      <MyWorkload />

      <div className="workload-container" style={{ marginTop: '30px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>My Team Workload</h2>
          <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>Overview of workload distribution across your team members.</p>
        </div>

        {loading ? (
          <div style={{ padding: '20px', color: '#6b7280' }}>Loading team workload data...</div>
        ) : error ? (
          <div style={{ padding: '20px', color: '#dc2626' }}>{error}</div>
        ) : !teamData || teamData.length === 0 ? (
          <div className="workload-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p className="workload-empty-text" style={{ fontSize: '16px' }}>No team members assigned</p>
          </div>
        ) : (
          <div className="workload-card" style={{ padding: '0' }}>
            <div style={{ padding: '20px' }}>
              {renderTeamSummary()}
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="team-workload-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Active Projects</th>
                    <th>Pending Tasks</th>
                    <th>Weekly Hours</th>
                    <th>Goal Progress</th>
                    <th>Workload Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teamData.map((data) => (
                    <tr key={data.employee._id}>
                      <td>
                        <div className="team-employee-info">
                          <div className="team-avatar">
                            {data.employee.profileImage ? (
                              <img src={data.employee.profileImage} alt="" />
                            ) : (
                              `${data.employee.firstName.charAt(0)}${data.employee.lastName.charAt(0)}`
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500', color: '#111827' }}>
                              {data.employee.firstName} {data.employee.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{data.activeProjects}</td>
                      <td>{data.pendingTasks}</td>
                      <td>{data.weeklyHours}h</td>
                      <td>{data.goalProgress}%</td>
                      <td>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          backgroundColor: `${getStatusColor(data.workloadStatus)}15`,
                          color: getStatusColor(data.workloadStatus),
                          fontWeight: '500',
                          fontSize: '13px'
                        }}>
                          {data.workloadStatus === 'Balanced' ? '🟢' : data.workloadStatus === 'Moderate' ? '🟡' : '🔴'}
                          {data.workloadStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerWorkload;
