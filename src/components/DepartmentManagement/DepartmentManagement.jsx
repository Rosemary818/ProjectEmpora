import React, { useState, useEffect } from 'react';
import './DepartmentManagement.css';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [selectedDept, setSelectedDept] = useState(null);
  const [deptDetails, setDeptDetails] = useState(null);

  const [formData, setFormData] = useState({
    departmentName: '',
    departmentCode: '',
    description: '',
    managerId: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };
      
      const [deptRes, usersRes] = await Promise.all([
        fetch('http://localhost:5000/api/departments', { headers }),
        fetch('http://localhost:5000/api/admin/employees', { headers })
      ]);
      
      const deptData = await deptRes.json();
      const usersData = await usersRes.json();
      
      if (deptRes.ok) {
        setDepartments(deptData.data);
      } else {
        setError(deptData.message || 'Failed to fetch departments');
      }
      
      if (usersRes.ok) {
        const allManagers = usersData.data.filter(u => u.role === 'Manager' && u.status === 'Active');
        setManagers(allManagers);
      }
      
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setEditMode(false);
    setFormData({
      departmentName: '',
      departmentCode: '',
      description: '',
      managerId: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditMode(true);
    setSelectedDept(dept);
    setFormData({
      departmentName: dept.departmentName,
      departmentCode: dept.departmentCode || '',
      description: dept.description || '',
      managerId: dept.managerId ? dept.managerId._id : '',
      status: dept.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = editMode 
        ? `http://localhost:5000/api/departments/${selectedDept._id}`
        : 'http://localhost:5000/api/departments';
      
      const method = editMode ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert(data.message || `Failed to ${editMode ? 'update' : 'create'} department`);
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (dept) => {
    const newStatus = dept.status === 'Active' ? 'Inactive' : 'Active';
    const action = newStatus === 'Active' ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${action} the ${dept.departmentName} department?`)) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/departments/${dept._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/departments/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDeptDetails(data.data);
        setIsDetailsModalOpen(true);
      } else {
        alert(data.message || 'Failed to load details');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  if (loading) return <div className="hrdept-loading">Loading departments...</div>;

  return (
    <div className="hrdept-container">
      <div className="hrdept-header">
        <div>
          <h2>Department Management</h2>
          <p className="hrdept-subtitle">Manage company departments and their heads</p>
        </div>
        <button className="hrdept-btn-primary" onClick={openCreateModal}>
          + Add Department
        </button>
      </div>

      {error && <div className="hrdept-alert-danger">{error}</div>}

      <div className="hrdept-card">
        <div className="hrdept-table-wrapper">
          <table className="hrdept-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Department Head</th>
                <th>Employees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept._id}>
                  <td>
                    <div className="hrdept-name">{dept.departmentName}</div>
                    <div className="hrdept-code">Code: {dept.departmentCode || 'N/A'}</div>
                    {dept.description && <div className="hrdept-desc" title={dept.description}>{dept.description}</div>}
                  </td>
                  <td>
                    {dept.managerId ? (
                      <div className="hrdept-manager-info">
                        <div className="hrdept-avatar">
                          {dept.managerId.profileImage ? (
                            <img src={dept.managerId.profileImage} alt="" />
                          ) : (
                            <span>{dept.managerId.firstName[0]}{dept.managerId.lastName[0]}</span>
                          )}
                        </div>
                        <span>{dept.managerId.firstName} {dept.managerId.lastName}</span>
                      </div>
                    ) : (
                      <span style={{ color: '#6b7280' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{dept.employeeCount || 0}</div>
                  </td>
                  <td>
                    <span className={`hrdept-status ${dept.status === 'Active' ? 'hrdept-status-active' : 'hrdept-status-inactive'}`}>
                      {dept.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="hrdept-btn-small" onClick={() => handleViewDetails(dept._id)}>View</button>
                      <button className="hrdept-btn-small" onClick={() => openEditModal(dept)}>Edit</button>
                      <button 
                        className={`hrdept-btn-small ${dept.status === 'Active' ? 'hrdept-btn-danger' : 'hrdept-btn-success'}`}
                        onClick={() => toggleStatus(dept)}
                      >
                        {dept.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="5" className="hrdept-empty">No departments found. Create one to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="hrdept-modal-overlay">
          <div className="hrdept-modal">
            <div className="hrdept-modal-header">
              <h3>{editMode ? 'Edit Department' : 'Create New Department'}</h3>
              <button className="hrdept-modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="hrdept-modal-body">
              <div className="hrdept-form-group">
                <label>Department Name *</label>
                <input 
                  type="text" 
                  name="departmentName" 
                  required 
                  value={formData.departmentName} 
                  onChange={handleInputChange} 
                />
              </div>
              
              <div className="hrdept-form-group">
                <label>Department Code (Leave empty to auto-generate)</label>
                <input 
                  type="text" 
                  name="departmentCode" 
                  value={formData.departmentCode} 
                  onChange={handleInputChange} 
                  placeholder="e.g. ENG001"
                />
              </div>

              <div className="hrdept-form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  rows="3" 
                  value={formData.description} 
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="hrdept-form-group">
                <label>Department Head (Manager)</label>
                <select name="managerId" value={formData.managerId} onChange={handleInputChange}>
                  <option value="">None</option>
                  {managers.map(m => (
                    <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>
                  ))}
                </select>
              </div>
              
              {editMode && (
                <div className="hrdept-form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div className="hrdept-modal-footer">
                <button type="button" className="hrdept-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="hrdept-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editMode ? 'Save Changes' : 'Create Department')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && deptDetails && (
        <div className="hrdept-modal-overlay">
          <div className="hrdept-modal hrdept-modal-large">
            <div className="hrdept-modal-header">
              <h3>Department Details</h3>
              <button className="hrdept-modal-close" onClick={() => setIsDetailsModalOpen(false)}>&times;</button>
            </div>
            <div className="hrdept-modal-body">
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>{deptDetails.department.departmentName}</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Code: {deptDetails.department.departmentCode || 'N/A'}</span>
                  <span className={`hrdept-status ${deptDetails.department.status === 'Active' ? 'hrdept-status-active' : 'hrdept-status-inactive'}`}>
                    {deptDetails.department.status}
                  </span>
                </div>
                <p style={{ marginTop: '1rem', color: '#4b5563', lineHeight: '1.5' }}>
                  {deptDetails.department.description || 'No description provided.'}
                </p>
              </div>

              <div className="hrdept-details-grid">
                <div className="hrdept-details-section">
                  <h4>Key Information</h4>
                  <p>
                    <strong>Department Head:</strong> 
                    {deptDetails.department.managerId 
                      ? `${deptDetails.department.managerId.firstName} ${deptDetails.department.managerId.lastName}` 
                      : 'Unassigned'}
                  </p>
                  <p><strong>Total Employees:</strong> {deptDetails.employees.length}</p>
                  <p><strong>Active Projects:</strong> {deptDetails.projects.filter(p => p.status === 'Active' || p.status === 'Planning').length}</p>
                  <p><strong>Created On:</strong> {new Date(deptDetails.department.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="hrdept-details-section">
                  <h4>Recent Projects</h4>
                  {deptDetails.projects.length > 0 ? (
                    <ul style={{ paddingLeft: '1.25rem', margin: 0, color: '#4b5563', fontSize: '0.875rem' }}>
                      {deptDetails.projects.slice(0, 4).map(p => (
                        <li key={p._id} style={{ marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '500', color: '#111827' }}>{p.name}</span> ({p.status})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No projects assigned to this department yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
