import React, { useState, useEffect } from 'react';
import './MyTeam.css';

const MyTeam = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/my-team', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTeam(data.data);
      } else {
        setError(data.message || 'Failed to fetch team');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="mt-loading">Loading team...</div>;

  return (
    <div className="mt-container">
      <div className="mt-header">
        <div>
          <h2>My Team</h2>
          <p className="mt-subtitle">View and manage your assigned project team members</p>
        </div>
      </div>

      {error && <div className="mt-alert-danger">{error}</div>}

      {team.length === 0 ? (
        <div className="mt-empty">
          <p>You do not have any team members assigned yet.</p>
          <p>Add employees to your projects to see them here.</p>
        </div>
      ) : (
        <div className="mt-grid">
          {team.map(member => (
            <div key={member._id} className="mt-card" onClick={() => setSelectedMember(member)}>
              <div className="mt-card-header">
                <div className="mt-avatar">
                  {member.profileImage ? (
                    <img src={member.profileImage} alt={`${member.firstName} ${member.lastName}`} />
                  ) : (
                    <span>{member.firstName.charAt(0)}{member.lastName.charAt(0)}</span>
                  )}
                </div>
                <div className={`mt-status ${member.status === 'Active' ? 'active' : 'inactive'}`}>
                  {member.status}
                </div>
              </div>
              <div className="mt-card-body">
                <h3>{member.firstName} {member.lastName}</h3>
                <p className="mt-role">{member.designationName || 'Employee'}</p>
                <div className="mt-info">
                  <div className="mt-info-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <span>{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="mt-info-item">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      <span>{member.phone}</span>
                    </div>
                  )}
                  <div className="mt-info-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline><polyline points="7.5 19.79 7.5 14.6 3 12"></polyline><polyline points="21 12 16.5 14.6 16.5 19.79"></polyline><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    <span>{member.departmentName || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-card-footer">
                <div className="mt-stat">
                  <span className="mt-stat-value">{member.stats?.totalTasks || 0}</span>
                  <span className="mt-stat-label">Tasks</span>
                </div>
                <div className="mt-stat">
                  <span className="mt-stat-value">{member.projects?.length || 0}</span>
                  <span className="mt-stat-label">Projects</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMember && (
        <div className="mt-modal-overlay">
          <div className="mt-modal">
            <div className="mt-modal-header">
              <h3>Team Member Profile</h3>
              <button className="mt-modal-close" onClick={() => setSelectedMember(null)}>&times;</button>
            </div>
            <div className="mt-modal-body">
              <div className="mt-profile-header">
                <div className="mt-profile-avatar">
                  {selectedMember.profileImage ? (
                    <img src={selectedMember.profileImage} alt={`${selectedMember.firstName} ${selectedMember.lastName}`} />
                  ) : (
                    <span>{selectedMember.firstName.charAt(0)}{selectedMember.lastName.charAt(0)}</span>
                  )}
                </div>
                <div className="mt-profile-title">
                  <h2>{selectedMember.firstName} {selectedMember.lastName}</h2>
                  <p>{selectedMember.designationName || 'Employee'} • {selectedMember.departmentName || 'N/A'}</p>
                  <span className={`mt-badge mt-badge-${selectedMember.status === 'Active' ? 'active' : 'inactive'}`}>
                    {selectedMember.status}
                  </span>
                </div>
              </div>

              <div className="mt-profile-sections">
                <div className="mt-profile-section">
                  <h4>Contact Information</h4>
                  <div className="mt-detail-grid">
                    <div className="mt-detail">
                      <label>Email</label>
                      <span>{selectedMember.email}</span>
                    </div>
                    <div className="mt-detail">
                      <label>Phone</label>
                      <span>{selectedMember.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-profile-section">
                  <h4>Employment Details</h4>
                  <div className="mt-detail-grid">
                    <div className="mt-detail">
                      <label>Employee Code</label>
                      <span>{selectedMember.employeeCode || 'N/A'}</span>
                    </div>
                    <div className="mt-detail">
                      <label>Joined Date</label>
                      <span>{selectedMember.dateOfJoining ? new Date(selectedMember.dateOfJoining).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-profile-section">
                  <h4>Assigned Projects</h4>
                  {selectedMember.projects && selectedMember.projects.length > 0 ? (
                    <ul className="mt-project-list">
                      {selectedMember.projects.map(p => (
                        <li key={p._id}>{p.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-text-muted">No projects assigned.</p>
                  )}
                </div>

                <div className="mt-profile-section">
                  <h4>Task Overview</h4>
                  <div className="mt-task-stats">
                    <div className="mt-task-stat">
                      <span className="mt-stat-num">{selectedMember.stats?.totalTasks || 0}</span>
                      <span className="mt-stat-txt">Total</span>
                    </div>
                    <div className="mt-task-stat">
                      <span className="mt-stat-num" style={{ color: '#6b7280' }}>{selectedMember.stats?.pendingTasks || 0}</span>
                      <span className="mt-stat-txt">To Do</span>
                    </div>
                    <div className="mt-task-stat">
                      <span className="mt-stat-num" style={{ color: '#2563eb' }}>{selectedMember.stats?.inProgressTasks || 0}</span>
                      <span className="mt-stat-txt">In Progress</span>
                    </div>
                    <div className="mt-task-stat">
                      <span className="mt-stat-num" style={{ color: '#16a34a' }}>{selectedMember.stats?.completedTasks || 0}</span>
                      <span className="mt-stat-txt">Completed</span>
                    </div>
                  </div>
                </div>

                {selectedMember.tasks && selectedMember.tasks.length > 0 && (
                  <div className="mt-profile-section">
                    <h4>Current Tasks</h4>
                    <ul className="mt-task-list">
                      {selectedMember.tasks.map(t => (
                        <li key={t._id} className="mt-task-item">
                          <div className="mt-task-name">{t.title}</div>
                          <div className="mt-task-meta">
                            <span className={`mt-badge mt-badge-${t.status.replace(/\s+/g, '-').toLowerCase()}`}>{t.status}</span>
                            <span className="mt-task-date">Due: {new Date(t.dueDate).toLocaleDateString()}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedMember(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTeam;
