import React, { useState, useEffect } from 'react';
import './ManagerProjects.css';

const ManagerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/projects/my-projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(data.data);
      } else {
        setError(data.message || 'Failed to fetch projects');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEmployees = async (projectId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/available-employees?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAvailableEmployees(data.data);
      } else {
        alert(data.message || 'Failed to fetch eligible employees');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const openAddMemberModal = (projectId) => {
    setSelectedProjectId(projectId);
    setSelectedEmployeeId('');
    fetchAvailableEmployees(projectId);
    setIsModalOpen(true);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      alert('Please select an employee');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${selectedProjectId}/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ employeeId: selectedEmployeeId })
      });
      
      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchProjects(); // Refresh the project list to show the new team member
      } else {
        alert(data.message || 'Failed to add team member');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (projectId, employeeId, employeeName) => {
    if (!window.confirm(`Are you sure you want to remove ${employeeName} from the project team?`)) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/team/${employeeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (res.ok) {
        fetchProjects();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to remove team member');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  if (loading) return <div className="mp-loading">Loading projects...</div>;

  return (
    <div className="mp-container">
      <div className="mp-header">
        <div>
          <h2>My Projects</h2>
          <p className="mp-subtitle">Manage your assigned projects and team members</p>
        </div>
      </div>

      {error && <div className="mp-alert-danger">{error}</div>}

      {projects.length === 0 ? (
        <div className="mp-empty">
          You are not currently assigned to manage any projects.
        </div>
      ) : (
        <div className="mp-grid">
          {projects.map(project => (
            <div className="mp-card" key={project._id}>
              <div className="mp-card-header">
                <div>
                  <h3>{project.name}</h3>
                  <span className={`mp-status mp-status-${project.status.replace(/\s+/g, '').toLowerCase()}`}>
                    {project.status}
                  </span>
                </div>
              </div>
              <div className="mp-card-body">
                <p className="mp-desc">{project.description}</p>
                <div className="mp-dates">
                  <strong>Timeline:</strong> {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                </div>
                
                <div className="mp-team-section">
                  <div className="mp-team-header">
                    <h4>Team Members ({project.teamMembers.length})</h4>
                    <button className="mp-btn-add" onClick={() => openAddMemberModal(project._id)}>
                      + Add Member
                    </button>
                  </div>
                  
                  {project.teamMembers.length === 0 ? (
                    <div className="mp-no-members">No team members added yet.</div>
                  ) : (
                    <ul className="mp-team-list">
                      {project.teamMembers.map(member => (
                        <li className="mp-team-member" key={member._id}>
                          <div className="mp-member-info">
                            <div className="mp-avatar">
                              {member.profileImage ? (
                                <img src={member.profileImage} alt="" />
                              ) : (
                                <span>{member.firstName[0]}{member.lastName[0]}</span>
                              )}
                            </div>
                            <span>{member.firstName} {member.lastName}</span>
                          </div>
                          <button 
                            className="mp-btn-remove"
                            onClick={() => handleRemoveMember(project._id, member._id, `${member.firstName} ${member.lastName}`)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="mp-modal-overlay">
          <div className="mp-modal">
            <div className="mp-modal-header">
              <h3>Add Team Member</h3>
              <button className="mp-modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddMember} className="mp-modal-body">
              <div className="mp-form-group">
                <label>Select Employee</label>
                <select 
                  required 
                  value={selectedEmployeeId} 
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                >
                  <option value="">Select an employee...</option>
                  {availableEmployees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.email})</option>
                  ))}
                </select>
                {availableEmployees.length === 0 && (
                  <small style={{color: '#6b7280', display: 'block', marginTop: '0.5rem'}}>
                    No available employees found. Ensure employees are active and not already in the project.
                  </small>
                )}
              </div>

              <div className="mp-modal-footer">
                <button type="button" className="mp-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="mp-btn-primary" disabled={isSubmitting || availableEmployees.length === 0}>
                  {isSubmitting ? 'Adding...' : 'Add to Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerProjects;
