import React, { useState, useEffect } from 'react';
import EmployeeTraining from './EmployeeTraining';
import './TrainingManagement.css';

const ManagerTraining = () => {
  const [activeTab, setActiveTab] = useState('My Learning');
  const [teamTrainings, setTeamTrainings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'Team Learning') {
      fetchTeamTrainings();
    }
  }, [activeTab]);

  const fetchTeamTrainings = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/trainings/team-enrollments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTeamTrainings(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tm-container" style={{ padding: 0 }}>
      <div className="tm-header" style={{ padding: '1.5rem 1.5rem 0' }}>
        <h2>Training & Learning</h2>
        <p>Manage your own training and monitor your team's progress</p>
      </div>

      <div className="tm-tabs" style={{ padding: '0 1.5rem' }}>
        <div 
          className={`tm-tab ${activeTab === 'My Learning' ? 'active' : ''}`}
          onClick={() => setActiveTab('My Learning')}
        >
          My Learning
        </div>
        <div 
          className={`tm-tab ${activeTab === 'Team Learning' ? 'active' : ''}`}
          onClick={() => setActiveTab('Team Learning')}
        >
          Team Learning
        </div>
      </div>

      {activeTab === 'My Learning' && (
        <EmployeeTraining />
      )}

      {activeTab === 'Team Learning' && (
        <div style={{ padding: '1.5rem' }}>
          {loading ? (
            <div className="tm-loading-state">Loading team records...</div>
          ) : teamTrainings.length === 0 ? (
            <div className="tm-empty-state">No team training records found.</div>
          ) : (
            <div className="tm-table-container">
              <table className="tm-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Employee ID</th>
                    <th>Training</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Enrollment Date</th>
                    <th>Completion Date</th>
                  </tr>
                </thead>
                <tbody>
                  {teamTrainings.map(en => (
                    <tr key={en._id}>
                      <td style={{fontWeight: 500}}>{en.employeeId?.firstName} {en.employeeId?.lastName}</td>
                      <td>{en.employeeId?.employeeCode || '-'}</td>
                      <td>{en.trainingId?.title}</td>
                      <td>{en.trainingId?.category}</td>
                      <td>
                        <span className={`tm-badge tm-badge-${en.status.replace(' ', '').toLowerCase()}`}>
                          {en.status}
                        </span>
                      </td>
                      <td>{new Date(en.enrolledAt).toLocaleDateString()}</td>
                      <td>{en.completedAt ? new Date(en.completedAt).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManagerTraining;
