import React, { useState, useEffect } from 'react';
import './SuperAdminUserManagement.css';

const SuperAdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.data);
      } else {
        setError(data.message || 'Failed to fetch users');
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
    
    if (!window.confirm(`Are you sure you want to ${action} this ${user.role}?`)) return;
    
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
        fetchUsers();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="sa-loading">Loading users...</div>;

  return (
    <div className="sa-container">
      <div className="sa-header">
        <div>
          <h2>User Management</h2>
          <p className="sa-subtitle">Manage all system users across roles</p>
        </div>
      </div>

      <div className="sa-controls">
        <input 
          type="text" 
          placeholder="Search users..." 
          className="sa-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="sa-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="SuperAdmin">SuperAdmin</option>
          <option value="HRAdmin">HRAdmin</option>
          <option value="Manager">Manager</option>
          <option value="Employee">Employee</option>
          <option value="Candidate">Candidate</option>
          <option value="ServiceExecutive">Service Executive</option>
        </select>
      </div>

      {error && <div className="sa-alert-danger">{error}</div>}

      <div className="sa-card">
        <div className="sa-card-body">
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id}>
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
                    <td>{u.email}</td>
                    <td><span className={`sa-badge sa-badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <span className={`sa-status-indicator ${u.status === 'Active' ? 'sa-status-active' : 'sa-status-inactive'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`sa-btn-small ${u.status === 'Active' ? 'sa-btn-danger' : 'sa-btn-success'}`}
                        onClick={() => toggleStatus(u)}
                      >
                        {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="sa-empty">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminUserManagement;
