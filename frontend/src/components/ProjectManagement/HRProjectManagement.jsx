import React, { useState, useEffect } from 'react';
import './HRProjectManagement.css';

const HRProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    departmentId: '',
    managerId: '',
    requiredSkills: '',
    experienceRequired: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };
      
      const [projectsRes, usersRes, deptRes] = await Promise.all([
        fetch('http://localhost:5000/api/projects', { headers }),
        fetch('http://localhost:5000/api/admin/employees', { headers }),
        fetch('http://localhost:5000/api/departments', { headers })
      ]);
      
      const projectsData = await projectsRes.json();
      const usersData = await usersRes.json();
      const deptData = await deptRes.json();
      
      if (projectsRes.ok) {
        setProjects(projectsData.data);
      } else {
        setError(projectsData.message || 'Failed to fetch projects');
      }
      
      if (usersRes.ok) {
        // Filter out only managers
        const allManagers = usersData.data.filter(u => u.role === 'Manager' && u.status === 'Active');
        setManagers(allManagers);
      }

      if (deptRes.ok) {
        setDepartments(deptData.data);
      }
      
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.name === 'departmentId') {
      setFormData({ ...formData, departmentId: e.target.value, managerId: '' });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const filteredManagers = formData.departmentId
    ? managers.filter(m => {
        const mDeptId = typeof m.departmentId === 'object' && m.departmentId !== null ? m.departmentId._id : m.departmentId;
        return mDeptId === formData.departmentId;
      })
    : managers;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = { ...formData };
      if (typeof payload.requiredSkills === 'string' && payload.requiredSkills.trim() !== '') {
        payload.requiredSkills = payload.requiredSkills.split(',').map(s => s.trim());
      } else {
        payload.requiredSkills = [];
      }

      const res = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: '', description: '', startDate: '', endDate: '', departmentId: '', managerId: '', requiredSkills: '', experienceRequired: '' });
        fetchData();
      } else {
        alert(data.message || 'Failed to create project');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="hrpm-loading">Loading projects...</div>;

  return (
    <div className="hrpm-container">
      <div className="hrpm-header">
        <div>
          <h2>Project Management</h2>
          <p className="hrpm-subtitle">Create and oversee organizational projects</p>
        </div>
        <button className="hrpm-btn-primary" onClick={() => setIsModalOpen(true)}>
          + Create Project
        </button>
      </div>

      {error && <div className="hrpm-alert-danger">{error}</div>}

      <div className="hrpm-card">
        <div className="hrpm-table-wrapper">
          <table className="hrpm-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Department</th>
                <th>Project Manager</th>
                <th>Status</th>
                <th>Timeline</th>
                <th>Team Size</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project._id}>
                  <td>
                    <div className="hrpm-name">{project.name}</div>
                    <div className="hrpm-desc">{project.description.substring(0, 50)}{project.description.length > 50 ? '...' : ''}</div>
                  </td>
                  <td>
                    <div className="hrpm-dept">{project.departmentId ? (departments.find(d => d._id === (typeof project.departmentId === 'object' ? project.departmentId._id : project.departmentId))?.departmentName || 'Not Set') : 'Not Set'}</div>
                  </td>
                  <td>
                    {project.managerId ? (
                      <div className="hrpm-manager-info">
                        <div className="hrpm-avatar">
                          {project.managerId.profileImage ? (
                            <img src={project.managerId.profileImage} alt="" />
                          ) : (
                            <span>{project.managerId.firstName[0]}{project.managerId.lastName[0]}</span>
                          )}
                        </div>
                        <span>{project.managerId.firstName} {project.managerId.lastName}</span>
                      </div>
                    ) : 'Unassigned'}
                  </td>
                  <td>
                    <span className={`hrpm-status hrpm-status-${project.status.replace(/\s+/g, '').toLowerCase()}`}>
                      {project.status}
                    </span>
                  </td>
                  <td>
                    <div className="hrpm-date">{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div className="hrpm-team-size">{project.teamMembers?.length || 0} Members</div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan="6" className="hrpm-empty">No projects found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="hrpm-modal-overlay">
          <div className="hrpm-modal">
            <div className="hrpm-modal-header">
              <h3>Create New Project</h3>
              <button className="hrpm-modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="hrpm-modal-body">
              <div className="hrpm-form-group">
                <label>Project Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} />
              </div>
              
              <div className="hrpm-form-group">
                <label>Description</label>
                <textarea name="description" required rows="3" value={formData.description} onChange={handleInputChange}></textarea>
              </div>
              
              <div className="hrpm-form-group">
                <label>Department</label>
                <select name="departmentId" value={formData.departmentId} onChange={handleInputChange}>
                  <option value="">Select a Department (Optional)</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.departmentName}</option>
                  ))}
                </select>
              </div>

              <div className="hrpm-form-row">
                <div className="hrpm-form-group">
                  <label>Start Date</label>
                  <input type="date" name="startDate" required value={formData.startDate} onChange={handleInputChange} />
                </div>
                <div className="hrpm-form-group">
                  <label>End Date</label>
                  <input type="date" name="endDate" required value={formData.endDate} onChange={handleInputChange} />
                </div>
              </div>

              <div className="hrpm-form-row">
                <div className="hrpm-form-group">
                  <label>Assign Manager</label>
                  <select name="managerId" required value={formData.managerId} onChange={handleInputChange}>
                    <option value="">Select a Manager...</option>
                    {filteredManagers.map(m => (
                      <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="hrpm-form-row">
                <div className="hrpm-form-group">
                  <label>Required Skills (comma separated)</label>
                  <input type="text" name="requiredSkills" placeholder="e.g. React, Node.js, MongoDB" value={formData.requiredSkills} onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})} />
                </div>
                <div className="hrpm-form-group">
                  <label>Experience Required</label>
                  <input type="text" name="experienceRequired" placeholder="e.g. 3-5 Years" value={formData.experienceRequired} onChange={(e) => setFormData({...formData, experienceRequired: e.target.value})} />
                </div>
              </div>

              <div className="hrpm-modal-footer">
                <button type="button" className="hrpm-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="hrpm-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRProjectManagement;
