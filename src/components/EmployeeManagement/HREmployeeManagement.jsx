import React, { useState, useEffect } from 'react';
import './HREmployeeManagement.css';

const HREmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [editForm, setEditForm] = useState({ department: '', jobTitle: '', status: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/employees', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(data.data);
      } else {
        setError(data.message || 'Failed to fetch employees');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/employees/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedUser(data.data.user);
        setUserStats(data.data.stats);
        setIsDetailsModalOpen(true);
      } else {
        alert(data.message || 'Failed to load details');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      department: user.department || '',
      jobTitle: user.jobTitle || '',
      status: user.status || 'Active'
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/employees/${selectedUser._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(editForm)
      });
      
      if (res.ok) {
        fetchEmployees();
        setIsEditModalOpen(false);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update user');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const action = newStatus === 'Active' ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${action} ${user.firstName}?`)) return;
    
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

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = (emp.firstName + ' ' + emp.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="hremp-loading">Loading employees...</div>;

  return (
    <div className="hremp-container">
      <div className="hremp-header">
        <div>
          <h2>Employee Management</h2>
          <p className="hremp-subtitle">View and manage all Employees and Managers</p>
        </div>
      </div>

      <div className="hremp-controls">
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          className="hremp-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="hremp-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {error && <div className="hremp-alert-danger">{error}</div>}

      <div className="hremp-card">
        <div className="hremp-card-body">
          <div className="hremp-table-wrapper">
            <table className="hremp-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Department / Title</th>
                  <th>Contact</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="hremp-avatar">
                          {emp.profileImage ? (
                            <img src={emp.profileImage} alt="" className="hremp-avatar-img" />
                          ) : (
                            <span>{emp.firstName[0]}{emp.lastName[0]}</span>
                          )}
                        </div>
                        <div>
                          <div className="hremp-name">{emp.firstName} {emp.lastName}</div>
                          <div className="hremp-id">ID: {emp.employeeCode || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`hremp-badge hremp-badge-${emp.role.toLowerCase()}`}>{emp.role}</span></td>
                    <td>
                      <div className="hremp-text-main">{emp.department || 'Not Set'}</div>
                      <div className="hremp-text-sub">{emp.jobTitle || 'Not Set'}</div>
                    </td>
                    <td>
                      <div className="hremp-text-main">{emp.email}</div>
                      <div className="hremp-text-sub">{emp.phone || '-'}</div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <span className={`hremp-status-indicator ${emp.status === 'Active' ? 'hremp-status-active' : 'hremp-status-inactive'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="hremp-btn-small" onClick={() => handleViewDetails(emp._id)}>View Details</button>
                        <button className="hremp-btn-small" onClick={() => openEditModal(emp)}>Edit</button>
                        <button 
                          className={`hremp-btn-small ${emp.status === 'Active' ? 'hremp-btn-danger' : 'hremp-btn-success'}`}
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
                    <td colSpan="7" className="hremp-empty">No employees found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {isDetailsModalOpen && selectedUser && userStats && (
        <div className="hremp-modal-overlay">
          <div className="hremp-modal hremp-modal-large">
            <div className="hremp-modal-header">
              <h3>Employee Profile</h3>
              <button className="hremp-modal-close" onClick={() => setIsDetailsModalOpen(false)}>&times;</button>
            </div>
            <div className="hremp-modal-body">
              <div className="hremp-profile-header">
                <div className="hremp-avatar hremp-avatar-large">
                  {selectedUser.profileImage ? (
                    <img src={selectedUser.profileImage} alt="" className="hremp-avatar-img" />
                  ) : (
                    <span>{selectedUser.firstName[0]}{selectedUser.lastName[0]}</span>
                  )}
                </div>
                <div>
                  <h2>{selectedUser.firstName} {selectedUser.lastName}</h2>
                  <p className="hremp-profile-role">{selectedUser.jobTitle || 'No Title'} • {selectedUser.department || 'No Department'}</p>
                  <span className={`hremp-status-indicator ${selectedUser.status === 'Active' ? 'hremp-status-active' : 'hremp-status-inactive'}`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div className="hremp-profile-grid">
                <div className="hremp-profile-section">
                  <h4>Contact Information</h4>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
                  <p><strong>Employee ID:</strong> {selectedUser.employeeCode || 'N/A'}</p>
                  <p><strong>Joined:</strong> {selectedUser.dateOfJoining ? new Date(selectedUser.dateOfJoining).toLocaleDateString() : 'N/A'}</p>
                </div>
                
                <div className="hremp-profile-section">
                  <h4>Module Summaries</h4>
                  <p><strong>Total Leaves:</strong> {userStats.totalLeaves} ({userStats.pendingLeaves} Pending)</p>
                  <p><strong>Attendance Records:</strong> {userStats.totalAttendance} days logged</p>
                  <p><strong>Tasks:</strong> {userStats.assignedTasks} Assigned ({userStats.completedTasks} Completed)</p>
                  <p><strong>Timesheets:</strong> {userStats.submittedTimesheets} Submitted ({userStats.approvedTimesheets} Approved)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="hremp-modal-overlay">
          <div className="hremp-modal">
            <div className="hremp-modal-header">
              <h3>Edit {selectedUser.firstName}'s Details</h3>
              <button className="hremp-modal-close" onClick={() => setIsEditModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} className="hremp-modal-body">
              <div className="hremp-form-group">
                <label>Department</label>
                <input 
                  type="text" 
                  value={editForm.department} 
                  onChange={(e) => setEditForm({...editForm, department: e.target.value})} 
                />
              </div>
              <div className="hremp-form-group">
                <label>Job Title</label>
                <input 
                  type="text" 
                  value={editForm.jobTitle} 
                  onChange={(e) => setEditForm({...editForm, jobTitle: e.target.value})} 
                />
              </div>
              <div className="hremp-form-group">
                <label>Account Status</label>
                <select 
                  value={editForm.status} 
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="hremp-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="hremp-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HREmployeeManagement;
