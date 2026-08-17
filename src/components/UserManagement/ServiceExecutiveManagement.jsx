import React, { useState, useEffect } from 'react';
import './SuperAdminUserManagement.css'; // Reusing similar styles

const ServiceExecutiveManagement = () => {
  const [serviceExecutives, setServiceExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    departmentId: '',
    designationId: ''
  });

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetData, setResetData] = useState({ id: null, newPassword: '', confirmPassword: '' });

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  useEffect(() => {
    fetchServiceExecutives();
  }, []);

  const fetchServiceExecutives = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/service-executives', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setServiceExecutives(data.data);
      } else {
        setError(data.message || 'Failed to fetch Service Executives');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const action = newStatus === 'Active' ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${action} this Service Executive?`)) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${user._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      if (res.ok) {
        fetchServiceExecutives();
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
      designationId: ''
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
      designationId: user.designationId || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenResetModal = (user) => {
    setResetData({ id: user._id, newPassword: '', confirmPassword: '' });
    setIsResetModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();

    try {
      const url = modalMode === 'add' 
        ? 'http://localhost:5000/api/admin/service-executives' 
        : `http://localhost:5000/api/admin/service-executives/${formData.id}`;
        
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const payload = { ...formData };

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
        fetchServiceExecutives();
      } else {
        alert(data.error || data.message || 'Failed to save Service Executive');
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
      const res = await fetch(`http://localhost:5000/api/admin/service-executives/${resetData.id}/reset-password`, {
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

  const handleResendInvite = async (user) => {
    if (!window.confirm('Resend invitation to this Service Executive?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/service-executives/${user._id}/resend-invite`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        alert('Invitation sent successfully.');
      } else {
        alert(data.error || data.message || 'Failed to resend invitation');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const filteredAdmins = serviceExecutives.filter(u => {
    const matchesSearch = (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.employeeCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAdmins = serviceExecutives.length;
  const activeAdmins = serviceExecutives.filter(u => u.status === 'Active').length;
  const inactiveAdmins = serviceExecutives.filter(u => u.status !== 'Active').length;

  if (loading) return <div className="sa-loading">Loading Service Executives...</div>;

  return (
    <div className="sa-container">
      <div className="sa-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Service Executive Management</h2>
          <p className="sa-subtitle">Manage the company-wide Service Executive</p>
        </div>
        {activeAdmins === 0 && (
          <button className="sa-btn-primary" onClick={handleOpenAddModal} style={{ background: '#388087', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' }}>
            + Add Service Executive
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 8px 0' }}>Total Service Executives</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{totalAdmins}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 8px 0' }}>Active Service Executives</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', margin: 0 }}>{activeAdmins}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 8px 0' }}>Inactive Service Executives</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>{inactiveAdmins}</p>
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
                  <th>Contact Info</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map(u => (
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
                          style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
                          onClick={() => handleOpenEditModal(u)}
                        >
                          Edit
                        </button>
                        <button 
                          className="sa-btn-small sa-btn-warning"
                          style={{ borderRadius: '4px' }}
                          onClick={() => handleOpenResetModal(u)}
                        >
                          Reset Pass
                        </button>
                        <button 
                          className="sa-btn-small"
                          style={{ borderRadius: '4px', background: '#3b82f6', color: 'white', border: 'none' }}
                          onClick={() => handleResendInvite(u)}
                        >
                          Resend Invite
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
                {filteredAdmins.length === 0 && (
                  <tr>
                    <td colSpan="6" className="sa-empty">No Service Executives found.</td>
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
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>{modalMode === 'add' ? 'Add Service Executive' : 'Edit Service Executive'}</h2>
            
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
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: '#388087', color: 'white', cursor: 'pointer' }}>{modalMode === 'add' ? 'Create Service Executive' : 'Save Changes'}</button>
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

    </div>
  );
};

export default ServiceExecutiveManagement;
