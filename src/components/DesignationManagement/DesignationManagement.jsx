import React, { useState, useEffect } from 'react';
import './DesignationManagement.css';

const DesignationManagement = () => {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  
  const [formData, setFormData] = useState({
    designationName: '',
    designationCode: '',
    departmentId: '',
    description: '',
    status: 'Active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };
      
      const [desigRes, deptRes] = await Promise.all([
        fetch('http://localhost:5000/api/designations', { headers }),
        fetch('http://localhost:5000/api/departments', { headers })
      ]);
      
      const desigData = await desigRes.json();
      const deptData = await deptRes.json();
      
      if (desigRes.ok) {
        setDesignations(desigData.data);
      } else {
        setError(desigData.message || 'Failed to fetch designations');
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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('http://localhost:5000/api/designations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        fetchData();
        setIsCreateModalOpen(false);
        resetForm();
      } else {
        alert(data.message || 'Failed to create designation');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`http://localhost:5000/api/designations/${selectedDesignation._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        fetchData();
        setIsEditModalOpen(false);
      } else {
        alert(data.message || 'Failed to update designation');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (designation) => {
    const newStatus = designation.status === 'Active' ? 'Inactive' : 'Active';
    const action = newStatus === 'Active' ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${action} the ${designation.designationName} designation?`)) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/designations/${designation._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        fetchData();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (designation) => {
    setSelectedDesignation(designation);
    setFormData({
      designationName: designation.designationName,
      designationCode: designation.designationCode || '',
      departmentId: designation.departmentId?._id || '',
      description: designation.description || '',
      status: designation.status
    });
    setIsEditModalOpen(true);
  };

  const openDetailsModal = (designation) => {
    setSelectedDesignation(designation);
    setIsDetailsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      designationName: '',
      designationCode: '',
      departmentId: '',
      description: '',
      status: 'Active'
    });
  };

  const filteredDesignations = designations.filter(desig => {
    const matchesSearch = desig.designationName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (desig.designationCode && desig.designationCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || desig.status === statusFilter;
    const matchesDept = deptFilter === 'All' || (desig.departmentId && desig.departmentId._id === deptFilter);
    return matchesSearch && matchesStatus && matchesDept;
  });

  if (loading) return <div className="hrdesig-loading">Loading designations...</div>;

  return (
    <div className="hrdesig-container">
      <div className="hrdesig-header">
        <div>
          <h2>Designation Management</h2>
          <p className="hrdesig-subtitle">Create and manage company designations / job titles</p>
        </div>
        <button className="hrdesig-btn-primary" onClick={openCreateModal}>
          + Create Designation
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Search by name or code..." 
          style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '6px', flex: 1 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="All">All Departments</option>
          {departments.map(dept => (
            <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
          ))}
        </select>
        <select 
          style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {error && <div className="hrdesig-alert-danger">{error}</div>}

      <div className="hrdesig-card">
        <div className="hrdesig-card-body">
          <div className="hrdesig-table-wrapper">
            <table className="hrdesig-table">
              <thead>
                <tr>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Description</th>
                  <th>Employees</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDesignations.map(desig => (
                  <tr key={desig._id}>
                    <td>
                      <div className="hrdesig-name">{desig.designationName}</div>
                      <div className="hrdesig-code">{desig.designationCode}</div>
                    </td>
                    <td>
                      {desig.departmentId ? desig.departmentId.departmentName : 'Unassigned'}
                    </td>
                    <td>
                      <div className="hrdesig-desc">{desig.description || '-'}</div>
                    </td>
                    <td>
                      <strong>{desig.employeeCount || 0}</strong>
                    </td>
                    <td>
                      <span className={`hrdesig-status ${desig.status === 'Active' ? 'hrdesig-status-active' : 'hrdesig-status-inactive'}`}>
                        {desig.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="hrdesig-btn-small" onClick={() => openDetailsModal(desig)}>View</button>
                        <button className="hrdesig-btn-small" onClick={() => openEditModal(desig)}>Edit</button>
                        <button 
                          className={`hrdesig-btn-small ${desig.status === 'Active' ? 'hrdesig-btn-danger' : 'hrdesig-btn-success'}`}
                          onClick={() => toggleStatus(desig)}
                        >
                          {desig.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDesignations.length === 0 && (
                  <tr>
                    <td colSpan="6" className="hrdesig-empty">No designations found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="hrdesig-modal-overlay">
          <div className="hrdesig-modal">
            <div className="hrdesig-modal-header">
              <h3>Create New Designation</h3>
              <button className="hrdesig-modal-close" onClick={() => setIsCreateModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="hrdesig-modal-body">
                <div className="hrdesig-form-group">
                  <label>Designation Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.designationName} 
                    onChange={(e) => setFormData({...formData, designationName: e.target.value})} 
                  />
                </div>
                <div className="hrdesig-form-group">
                  <label>Designation Code (Auto-generated if empty)</label>
                  <input 
                    type="text" 
                    value={formData.designationCode} 
                    onChange={(e) => setFormData({...formData, designationCode: e.target.value})} 
                  />
                </div>
                <div className="hrdesig-form-group">
                  <label>Department *</label>
                  <select 
                    required
                    value={formData.departmentId} 
                    onChange={(e) => setFormData({...formData, departmentId: e.target.value})} 
                  >
                    <option value="">Select Department</option>
                    {departments.filter(d => d.status === 'Active').map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
                    ))}
                  </select>
                </div>
                <div className="hrdesig-form-group">
                  <label>Description</label>
                  <textarea 
                    rows="3" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  ></textarea>
                </div>
              </div>
              <div className="hrdesig-modal-footer">
                <button type="button" className="hrdesig-btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="hrdesig-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Designation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedDesignation && (
        <div className="hrdesig-modal-overlay">
          <div className="hrdesig-modal">
            <div className="hrdesig-modal-header">
              <h3>Edit Designation</h3>
              <button className="hrdesig-modal-close" onClick={() => setIsEditModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="hrdesig-modal-body">
                <div className="hrdesig-form-group">
                  <label>Designation Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.designationName} 
                    onChange={(e) => setFormData({...formData, designationName: e.target.value})} 
                  />
                </div>
                <div className="hrdesig-form-group">
                  <label>Designation Code</label>
                  <input 
                    type="text" 
                    value={formData.designationCode} 
                    onChange={(e) => setFormData({...formData, designationCode: e.target.value})} 
                  />
                </div>
                <div className="hrdesig-form-group">
                  <label>Department *</label>
                  <select 
                    required
                    value={formData.departmentId} 
                    onChange={(e) => setFormData({...formData, departmentId: e.target.value})} 
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
                    ))}
                  </select>
                </div>
                <div className="hrdesig-form-group">
                  <label>Description</label>
                  <textarea 
                    rows="3" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  ></textarea>
                </div>
                <div className="hrdesig-form-group">
                  <label>Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="hrdesig-modal-footer">
                <button type="button" className="hrdesig-btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="hrdesig-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedDesignation && (
        <div className="hrdesig-modal-overlay">
          <div className="hrdesig-modal hrdesig-modal-large">
            <div className="hrdesig-modal-header">
              <h3>Designation Details</h3>
              <button className="hrdesig-modal-close" onClick={() => setIsDetailsModalOpen(false)}>&times;</button>
            </div>
            <div className="hrdesig-modal-body">
              <div className="hrdesig-details-grid">
                <div className="hrdesig-details-section">
                  <h4>General Information</h4>
                  <p><strong>Name:</strong> {selectedDesignation.designationName}</p>
                  <p><strong>Code:</strong> {selectedDesignation.designationCode}</p>
                  <p><strong>Department:</strong> {selectedDesignation.departmentId?.departmentName || 'N/A'}</p>
                  <p><strong>Status:</strong> <span className={`hrdesig-status ${selectedDesignation.status === 'Active' ? 'hrdesig-status-active' : 'hrdesig-status-inactive'}`}>{selectedDesignation.status}</span></p>
                  <p><strong>Created:</strong> {new Date(selectedDesignation.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="hrdesig-details-section">
                  <h4>Statistics & Description</h4>
                  <p><strong>Employees:</strong> {selectedDesignation.employeeCount} assigned</p>
                  <p style={{ marginTop: '1rem', color: '#111827', fontWeight: 500 }}>Description:</p>
                  <p style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: '0.75rem', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                    {selectedDesignation.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignationManagement;
