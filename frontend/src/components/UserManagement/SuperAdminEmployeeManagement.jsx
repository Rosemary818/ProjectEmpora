import React, { useState, useEffect } from 'react';
import { validateIndianMobileNumber } from '../../utils/validation';
import './SuperAdminUserManagement.css'; 

const SuperAdminEmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [designationFilter, setDesignationFilter] = useState('All');
  const [managerFilter, setManagerFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Profile Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('Personal');

  // Edit / Reset Password modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetData, setResetData] = useState({ id: null, newPassword: '', confirmPassword: '' });

  // Dropdowns
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/super-admin/employees', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch employees');
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

  const handleOpenProfile = async (id) => {
    setIsProfileModalOpen(true);
    setProfileLoading(true);
    setProfileData(null);
    setActiveProfileTab('Personal');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/super-admin/employees/${id}/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProfileData(data.data);
      } else {
        alert(data.message || 'Failed to fetch profile');
        setIsProfileModalOpen(false);
      }
    } catch (err) {
      alert('Network error');
      setIsProfileModalOpen(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'Active' ? 'activate' : 'deactivate'} this employee?`)) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/employees/${user._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchEmployees();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleBulkStatus = async (status) => {
    if (selectedIds.length === 0) return alert('Select at least one employee');
    if (!window.confirm(`Are you sure you want to ${status === 'Active' ? 'activate' : 'deactivate'} ${selectedIds.length} employees?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/super-admin/employees/bulk-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ employeeIds: selectedIds, status })
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchEmployees();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update status in bulk');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleExportCSV = () => {
    if (employees.length === 0) return alert('No data to export');
    
    const headers = ['Employee ID', 'Name', 'Email', 'Role', 'Department', 'Designation', 'Manager', 'Status'];
    const csvRows = [headers.join(',')];
    
    employees.forEach(emp => {
      const row = [
        emp.employeeCode || 'N/A',
        `"${emp.firstName} ${emp.lastName}"`,
        emp.email,
        emp.role,
        `"${emp.departmentName}"`,
        `"${emp.designationName}"`,
        `"${emp.managerName}"`,
        emp.status
      ];
      csvRows.push(row.join(','));
    });
    
    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'employees_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredEmployees = employees.filter(emp => {
    const searchMatch = (emp.firstName + ' ' + emp.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (emp.employeeCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    const deptMatch = departmentFilter === 'All' || emp.departmentName === departmentFilter;
    const desigMatch = designationFilter === 'All' || emp.designationName === designationFilter;
    const mgrMatch = managerFilter === 'All' || emp.managerName === managerFilter;
    const statMatch = statusFilter === 'All' || emp.status === statusFilter;
    return searchMatch && deptMatch && desigMatch && mgrMatch && statMatch;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredEmployees.map(emp => emp._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  
  const handleOpenEdit = (emp) => {
    setEditFormData({
      id: emp._id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone || '',
      departmentId: emp.departmentId?._id || emp.departmentId || ''
    });
    setIsEditModalOpen(true);
  };
  
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (editFormData.phone) {
      const phoneError = validateIndianMobileNumber(editFormData.phone, false);
      if (phoneError) {
        return alert(phoneError);
      }
    }
    try {
      const res = await fetch(`http://localhost:5000/api/admin/employees/${editFormData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchEmployees();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update employee');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleOpenReset = (emp) => {
    setResetData({ id: emp._id, newPassword: '', confirmPassword: '' });
    setIsResetModalOpen(true);
  };

  const handleSaveReset = async (e) => {
    e.preventDefault();
    if (resetData.newPassword !== resetData.confirmPassword) {
      return alert("Passwords do not match");
    }
    // Note: HR Admin endpoint might not exist specifically for reset employee password natively via standard patch, assuming it uses a specific endpoint or user reset. Wait, if it doesn't exist we will alert 'Not implemented' or we use standard reset logic if exists.
    alert("Reset password requires a dedicated endpoint for employees. Currently using mockup.");
    setIsResetModalOpen(false);
  };

  // Derive filter options dynamically from data
  const uniqueDepartments = ['All', ...new Set(employees.map(e => e.departmentName))];
  const uniqueDesignations = ['All', ...new Set(employees.map(e => e.designationName))];
  const uniqueManagers = ['All', ...new Set(employees.map(e => e.managerName))];

  // Dashboard Stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const inactiveEmployees = employees.filter(e => e.status !== 'Active').length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newEmployeesThisMonth = employees.filter(e => {
    const created = new Date(e.createdAt);
    return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
  }).length;

  if (loading) return <div className="sa-loading">Loading Employees...</div>;

  return (
    <div className="sa-container">
      <div className="sa-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Employee Management</h2>
          <p className="sa-subtitle">Comprehensive directory and management of all employees</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="sa-btn-primary" onClick={handleExportCSV} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' }}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 8px 0' }}>Total Employees</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{totalEmployees}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 8px 0' }}>Active Employees</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', margin: 0 }}>{activeEmployees}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 8px 0' }}>Inactive Employees</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>{inactiveEmployees}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 8px 0' }}>New This Month</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9333ea', margin: 0 }}>{newEmployeesThisMonth}</p>
        </div>
      </div>

      <div className="sa-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        <input 
          type="text" 
          placeholder="Search by Name or ID..." 
          className="sa-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select className="sa-filter" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
          {uniqueDepartments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
        </select>
        <select className="sa-filter" value={designationFilter} onChange={(e) => setDesignationFilter(e.target.value)}>
          {uniqueDesignations.map(d => <option key={d} value={d}>{d === 'All' ? 'All Designations' : d}</option>)}
        </select>
        <select className="sa-filter" value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)}>
          {uniqueManagers.map(m => <option key={m} value={m}>{m === 'All' ? 'All Managers' : m}</option>)}
        </select>
        <select className="sa-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {selectedIds.length > 0 && (
        <div style={{ background: '#f3f4f6', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontWeight: '500' }}>{selectedIds.length} employees selected</span>
          <button onClick={() => handleBulkStatus('Active')} style={{ background: '#059669', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Activate Selected</button>
          <button onClick={() => handleBulkStatus('Inactive')} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Deactivate Selected</button>
        </div>
      )}

      {error && <div className="sa-alert-danger">{error}</div>}

      <div className="sa-card">
        <div className="sa-card-body">
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input type="checkbox" onChange={handleSelectAll} checked={filteredEmployees.length > 0 && selectedIds.length === filteredEmployees.length} />
                  </th>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp._id}>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={selectedIds.includes(emp._id)} onChange={() => handleSelectRow(emp._id)} />
                    </td>
                    <td style={{ fontWeight: '500' }}>{emp.employeeCode || 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="sa-avatar">
                          {emp.profileImage ? (
                            <img src={emp.profileImage} alt="" className="sa-avatar-img" />
                          ) : (
                            <span>{emp.firstName[0]}{emp.lastName[0]}</span>
                          )}
                        </div>
                        <div className="sa-name">{emp.firstName} {emp.lastName}</div>
                      </div>
                    </td>
                    <td>{emp.role}</td>
                    <td>{emp.departmentName}</td>
                    <td>{emp.designationName}</td>
                    <td>{emp.managerName}</td>
                    <td>
                      <span className={`sa-status-indicator ${emp.status === 'Active' ? 'sa-status-active' : 'sa-status-inactive'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '200px' }}>
                        <button 
                          className="sa-btn-small"
                          style={{ background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', borderRadius: '4px', cursor: 'pointer' }}
                          onClick={() => handleOpenProfile(emp._id)}
                        >
                          View Profile
                        </button>
                        <button 
                          className="sa-btn-small"
                          style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
                          onClick={() => handleOpenEdit(emp)}
                        >
                          Edit
                        </button>
                        <button 
                          className="sa-btn-small"
                          style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', borderRadius: '4px', cursor: 'pointer' }}
                          onClick={() => handleOpenReset(emp)}
                        >
                          Reset Pass
                        </button>
                        <button 
                          className={`sa-btn-small ${emp.status === 'Active' ? 'sa-btn-danger' : 'sa-btn-success'}`}
                          style={{ borderRadius: '4px' }}
                          onClick={() => toggleStatus(emp)}
                        >
                          {emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="9" className="sa-empty">No Employees found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editFormData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>Edit Employee</h2>
            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>First Name *</label>
                  <input type="text" required value={editFormData.firstName} onChange={e => setEditFormData({...editFormData, firstName: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Last Name *</label>
                  <input type="text" required value={editFormData.lastName} onChange={e => setEditFormData({...editFormData, lastName: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Email</label>
                  <input type="email" disabled value={editFormData.email} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', background: '#f3f4f6' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Phone</label>
                  <input type="text" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Department</label>
                  <select value={editFormData.departmentId} onChange={e => setEditFormData({...editFormData, departmentId: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: '#388087', color: 'white', cursor: 'pointer' }}>Save Changes</button>
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
            <form onSubmit={handleSaveReset}>
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

      {/* View Profile Modal */}
      {isProfileModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '8px', width: '90%', maxWidth: '1000px', height: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                {profileLoading ? 'Loading Profile...' : profileData ? `Profile: ${profileData.user.firstName} ${profileData.user.lastName}` : 'Error'}
              </h2>
              <button onClick={() => setIsProfileModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
            </div>
            
            {profileLoading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
            ) : profileData ? (
              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Sidebar Tabs */}
                <div style={{ width: '200px', background: '#f9fafb', borderRight: '1px solid #e5e7eb', overflowY: 'auto' }}>
                  {['Personal', 'Skills', 'Certifications', 'Attendance', 'Leaves', 'Projects', 'Documents'].map(tab => (
                    <div 
                      key={tab}
                      onClick={() => setActiveProfileTab(tab)}
                      style={{ 
                        padding: '16px 20px', 
                        cursor: 'pointer',
                        fontWeight: '500',
                        color: activeProfileTab === tab ? '#4f46e5' : '#4b5563',
                        background: activeProfileTab === tab ? '#e0e7ff' : 'transparent',
                        borderLeft: activeProfileTab === tab ? '4px solid #4f46e5' : '4px solid transparent'
                      }}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
                
                {/* Tab Content */}
                <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                  {activeProfileTab === 'Personal' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#6b7280' }}>Contact Info</h4>
                        <p style={{ margin: '0 0 8px 0' }}><strong>Email:</strong> {profileData.user.email}</p>
                        <p style={{ margin: '0 0 8px 0' }}><strong>Phone:</strong> {profileData.user.phone || 'N/A'}</p>
                        <p style={{ margin: '0 0 8px 0' }}><strong>Status:</strong> {profileData.user.status}</p>
                      </div>
                      <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#6b7280' }}>Organization</h4>
                        <p style={{ margin: '0 0 8px 0' }}><strong>Department:</strong> {profileData.user.departmentName}</p>
                        <p style={{ margin: '0 0 8px 0' }}><strong>Designation:</strong> {profileData.user.designationName}</p>
                        <p style={{ margin: '0 0 8px 0' }}><strong>Manager:</strong> {profileData.user.managerName}</p>
                        <p style={{ margin: '0 0 8px 0' }}><strong>Joined Date:</strong> {profileData.user.dateOfJoining ? new Date(profileData.user.dateOfJoining).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  {activeProfileTab === 'Skills' && (
                    <div>
                      {profileData.skills.length === 0 ? <p>No skills recorded.</p> : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {profileData.skills.map(s => (
                            <span key={s._id} style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '16px', fontSize: '0.875rem' }}>
                              {s.skillId?.name || 'Unknown'} (Lvl {s.proficiencyLevel})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeProfileTab === 'Certifications' && (
                    <div>
                      {profileData.certifications.length === 0 ? <p>No certifications recorded.</p> : (
                        <ul style={{ paddingLeft: '20px' }}>
                          {profileData.certifications.map(c => (
                            <li key={c._id} style={{ marginBottom: '12px' }}>
                              <strong>{c.name}</strong> - {c.issuingOrganization} 
                              <br /><span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Issued: {new Date(c.issueDate).toLocaleDateString()}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {activeProfileTab === 'Attendance' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center' }}>
                        <h4 style={{ margin: '0 0 8px 0' }}>Present</h4>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>{profileData.attendanceSummary['Present'] || 0}</span>
                      </div>
                      <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center' }}>
                        <h4 style={{ margin: '0 0 8px 0' }}>Absent</h4>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>{profileData.attendanceSummary['Absent'] || 0}</span>
                      </div>
                      <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center' }}>
                        <h4 style={{ margin: '0 0 8px 0' }}>Half Day</h4>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706' }}>{profileData.attendanceSummary['Half Day'] || 0}</span>
                      </div>
                    </div>
                  )}

                  {activeProfileTab === 'Leaves' && (
                    <div>
                      {profileData.leaves.length === 0 ? <p>No leave requests.</p> : (
                        <table className="sa-table">
                          <thead>
                            <tr>
                              <th>Type</th>
                              <th>Dates</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profileData.leaves.map(l => (
                              <tr key={l._id}>
                                <td>{l.leaveType}</td>
                                <td>{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</td>
                                <td>{l.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {activeProfileTab === 'Projects' && (
                    <div>
                      {profileData.projects.length === 0 ? <p>No assigned projects.</p> : (
                        <table className="sa-table">
                          <thead>
                            <tr>
                              <th>Project Name</th>
                              <th>Status</th>
                              <th>Start Date</th>
                              <th>End Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profileData.projects.map(p => (
                              <tr key={p._id}>
                                <td>{p.name}</td>
                                <td>{p.status}</td>
                                <td>{new Date(p.startDate).toLocaleDateString()}</td>
                                <td>{new Date(p.endDate).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {activeProfileTab === 'Documents' && (
                    <div>
                      {profileData.documents.length === 0 ? <p>No documents uploaded.</p> : (
                        <table className="sa-table">
                          <thead>
                            <tr>
                              <th>Document Name</th>
                              <th>Category</th>
                              <th>Status</th>
                              <th>Uploaded</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profileData.documents.map(d => (
                              <tr key={d._id}>
                                <td>{d.name}</td>
                                <td>{d.category}</td>
                                <td>{d.status}</td>
                                <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminEmployeeManagement;
