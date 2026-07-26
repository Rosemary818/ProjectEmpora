import React, { useState, useEffect } from 'react';
import './EmployeeProjects.css';

const EmployeeProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/projects/assigned', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(data.data);
      } else {
        setError(data.message || 'Failed to fetch assigned projects');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="ep-loading">Loading your assigned projects...</div>;

  return (
    <div className="ep-container">
      <div className="ep-header">
        <div>
          <h2>My Assigned Projects</h2>
          <p className="ep-subtitle">View projects you are currently assigned to</p>
        </div>
      </div>

      {error && <div className="ep-alert-danger">{error}</div>}

      {projects.length === 0 ? (
        <div className="ep-empty">
          You are not currently assigned to any active projects.
        </div>
      ) : (
        <div className="ep-grid">
          {projects.map(project => (
            <div className="ep-card" key={project._id}>
              <div className="ep-card-header">
                <div>
                  <h3>{project.name}</h3>
                  <span className={`ep-status ep-status-${project.status.replace(/\s+/g, '').toLowerCase()}`}>
                    {project.status}
                  </span>
                </div>
              </div>
              <div className="ep-card-body">
                <p className="ep-desc">{project.description}</p>
                
                <div className="ep-info-grid">
                  <div>
                    <strong>Timeline:</strong><br />
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Project Manager:</strong><br />
                    {project.managerId ? `${project.managerId.firstName} ${project.managerId.lastName}` : 'Unassigned'}
                  </div>
                </div>

                <div className="ep-team-section">
                  <h4>Team Members ({project.teamMembers.length})</h4>
                  <div className="ep-team-list">
                    {project.teamMembers.map(member => (
                      <div className="ep-member-badge" key={member._id}>
                        {member.firstName} {member.lastName}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeProjects;
