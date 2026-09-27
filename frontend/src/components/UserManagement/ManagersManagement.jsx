import React, { useState, useEffect } from 'react';
import { validateIndianMobileNumber } from '../../utils/validation';
import './SuperAdminUserManagement.css'; 

const ManagersManagement = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [formData, setFormData] = useState({
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    departmentId: '',
    password: '',
    confirmPassword: ''
  });

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetData, setResetData] = useState({ id: null, newPassword: '', confirmPassword: '' });

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [teamData, setTeamData] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchManagers();
    fetchDepartments();
  }, []);

  const fetchManagers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/managers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setManagers(data.data);
      } else {
        setError(data.message || 'Failed to fetch Managers');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const depRes = await fetch('http://localhost:5000/api/departments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const depData = await depRes.json();
      if (depRes.ok) setDepartments(depData.data || []);
    } catch (err) {
      console.error('Error fetching depts', err);
    }
  };

  const toggleStatus = async (user, forceDeactivate = false) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const action = newStatus === 'Active' ? 'activate' : 'deactivate';
    
    if (!forceDeactivate) {
      if (!window.confirm(`Are you sure you want to ${action} this Manager?`)) return;
    }
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${user._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: newStatus, forceDeactivate })
      });
      
      const data = await res.json();
      if (res.ok) {
        fetchManagers();
      } else if (data.requiresConfirmation) {
        if (window.confirm(data.message)) {
          toggleStatus(user, true);
        }
      } else {
        alert(data.error || data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData({
      id: null,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      departmentId: '',
      password: '',
      confirmPassword: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setModalMode('edit');
    setFormData({
      id: user._id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      department: user.departmentName || '',
      departmentId: user.departmentId || '',
      password: '',
      confirmPassword: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenResetModal = (user) => {
    setResetData({ id: user._id, newPassword: '', confirmPassword: '' });
    setIsResetModalOpen(true);
  };

  const handleOpenTeamModal = async (manager) => {
    setSelectedManager(manager);
    setIsTeamModalOpen(true);
    setTeamLoading(true);
    setTeamData([]);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/managers/${manager._id}/team`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTeamData(data.data || []);
      } else {
        alert(data.message || 'Failed to fetch team');
      }
    } catch (err) {
      alert('Network error while fetching team');
    } finally {
      setTeamLoading(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    
    if (formData.phone) {
      const phoneError = validateIndianMobileNumber(formData.phone, false);
      if (phoneError) {
        return alert(phoneError);
      }
    }

    if (!formData.departmentId && !formData.department) {
      return alert("Department is required.");
    }

    if (modalMode === 'add') {
      if (formData.password !== formData.confirmPassword) {
        return alert("Passwords do not match");
      }
      if (formData.password.length < 6) {
        return alert("Password must be at least 6 characters long");
      }
    }

    try {
      const url = modalMode === 'add' 
        ? 'http://localhost:5000/api/admin/managers' 
        : `http://localhost:5000/api/admin/managers/${formData.id}`;
        
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const payload = { ...formData };
      
      if (payload.departmentId) {
        const selectedDept = departments.find(d => d._id === payload.departmentId);
        if (selectedDept) {
          payload.department = selectedDept.departmentName;
        }
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchManagers();
      } else {
        alert(data.error || data.message || 'Failed to save Manager');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetData.newPassword !== resetData.confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/managers/${resetData.id}/reset-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ newPassword: resetData.newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setIsResetModalOpen(false);
        alert('Password reset successfully');
      } else {
        alert(data.error || data.message || 'Failed to reset password');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const filteredManagers = managers.filter(u => {
    const matchesSearch = (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.employeeCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    const matchesDept = departmentFilter === 'All' || u.departmentName === departmentFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const totalManagers = managers.length;
  const activeManagers = managers.filter(u => u.status === 'Active').length;
  const inactiveManagers = managers.filter(u => u.status !== 'Active').length;
  const uniqueDepartments = [...new Set(managers.map(m => m.departmentName).filter(Boolean))].length;

  if (loading) return <div className="sa-loading">Loading Managers...</div>;

  return (
    <div className="sa-container">
      <div className="sa-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Managers Management</h2>
          <p className="sa-subtitle">Manage department managers and oversee their team structure</p>
        </div>
        <button className="sa-btn-primary" onClick={handleOpenAddModal} style={{ background: '#388087', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' }}>
          + Add Manager
        </button>
      </div>

      {/* Dashboard Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 8px 0' }}>Total Managers</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{totalManagers}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 8px 0' }}>Active Managers</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', margin: 0 }}>{activeManagers}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 8px 0' }}>Inactive Managers</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>{inactiveManagers}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 8px 0' }}>Departments Managed</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9333ea', margin: 0 }}>{uniqueDepartments}</p>
        </div>
      </div>

      <div className="sa-controls">
        <input 
          type="text" 
          placeholder="Search by Name or Employee ID..." 
          className="sa-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="sa-filter"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="All">All Departments</option>
          {departments.map(d => (
            <option key={d._id} value={d.departmentName}>{d.departmentName}</option>
          ))}
        </select>
        <select 
          className="sa-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {error && <div className="sa-alert-danger">{error}</div>}

      <div className="sa-card">
        <div className="sa-card-body">
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Department</th>
                  <th>Team Members</th>
                  <th>Contact Info</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredManagers.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: '500' }}>{u.employeeCode || 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="sa-avatar">
                          {u.profileImage ? (
                            <img src={u.profileImage} alt="" className="sa-avatar-img" />
                          ) : (
                            <span>{u.firstName[0]}{u.lastName[0]}</span>
                          )}
                        </div>
                        <div className="sa-name">{u.firstName} {u.lastName}</div>
                      </div>
                    </td>
                    <td>{u.departmentName || 'N/A'}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '500' }}>
                        {u.teamMembersCount || 0} Members
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{u.email}</span>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{u.phone || 'No Phone'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`sa-status-indicator ${u.status === 'Active' ? 'sa-status-active' : 'sa-status-inactive'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      {u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="sa-btn-small"
                          style={{ background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', borderRadius: '4px', cursor: 'pointer' }}
                          onClick={() => handleOpenTeamModal(u)}
                        >
                          View Team
                        </button>
                        <button 
                          className="sa-btn-small"
                          style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
                          onClick={() => handleOpenEditModal(u)}
                        >
                          Edit
                        </button>
                        <button 
                          className="sa-btn-small"
                          style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', borderRadius: '4px', cursor: 'pointer' }}
                          onClick={() => handleOpenResetModal(u)}
                        >
                          Reset Pass
                        </button>
                        <button 
                          className={`sa-btn-small ${u.status === 'Active' ? 'sa-btn-danger' : 'sa-btn-success'}`}
                          style={{ borderRadius: '4px' }}
                          onClick={() => toggleStatus(u)}
                        >
                          {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredManagers.length === 0 && (
                  <tr>
                    <td colSpan="8" className="sa-empty">No Managers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>{modalMode === 'add' ? 'Add Manager' : 'Edit Manager'}</h2>
            
            <form onSubmit={handleSaveUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>First Name *</label>
                  <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Last Name *</label>
                  <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Email *</label>
                  <input type="email" required disabled={modalMode === 'edit'} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', background: modalMode === 'edit' ? '#f3f4f6' : 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Department *</label>
                  <select required value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                    <option value="">Select Department</option>
                    {departments.filter(d => d.status === 'Active').map(d => (
                      <option key={d._id} value={d._id}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>
                
                {modalMode === 'add' && (
                  <>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Password *</label>
                      <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Confirm Password *</label>
                      <input type="password" required value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                    </div>
                  </>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: '#388087', color: 'white', cursor: 'pointer' }}>{modalMode === 'add' ? 'Create Manager' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>Reset Password</h2>
            
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>New Password *</label>
                <input type="password" required value={resetData.newPassword} onChange={e => setResetData({...resetData, newPassword: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Confirm Password *</label>
                <input type="password" required value={resetData.confirmPassword} onChange={e => setResetData({...resetData, confirmPassword: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsResetModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: '#388087', color: 'white', cursor: 'pointer' }}>Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Team Modal */}
      {isTeamModalOpen && selectedManager && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Team Members: {selectedManager.firstName} {selectedManager.lastName}</h2>
              <button onClick={() => setIsTeamModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
            </div>
            
            {teamLoading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>Loading team members...</div>
            ) : (
              <div className="sa-table-wrapper" style={{ margin: 0 }}>
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Email</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamData.map(member => (
                      <tr key={member._id}>
                        <td style={{ fontWeight: '500' }}>{member.employeeCode || 'N/A'}</td>
                        <td>{member.firstName} {member.lastName}</td>
                        <td>{member.departmentName}</td>
                        <td>{member.designationName}</td>
                        <td>{member.email}</td>
                        <td>
                          <span className={`sa-status-indicator ${member.status === 'Active' ? 'sa-status-active' : 'sa-status-inactive'}`}>
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {teamData.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No team members found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagersManagement;
