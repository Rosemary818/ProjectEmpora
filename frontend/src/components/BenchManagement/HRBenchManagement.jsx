import React, { useState, useEffect } from 'react';
import './BenchManagement.css';

const HRBenchManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  
  // Status modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newStatus, setNewStatus] = useState('On Bench');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };
      const [empRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/bench/employees', { headers }),
        fetch('http://localhost:5000/api/bench/dashboard', { headers })
      ]);
      
      const empData = await empRes.json();
      const statsData = await statsRes.json();

      if (empRes.ok && statsRes.ok) {
        setEmployees(empData.data);
        setDashboardStats(statsData.data);
      } else {
        setError('Failed to fetch bench data');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/bench/status/${selectedEmployee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ benchStatus: newStatus, benchReason: reason })
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept ? emp.departmentId?.departmentName === selectedDept : true;
    return matchesSearch && matchesDept;
  });

  if (loading) return <div style={{ padding: '2rem' }}>Loading Bench Data...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;

  return (
    <div className="bench-mgmt-container">
      <div className="bench-header">
        <h2>Bench Management</h2>
        <p>Manage employees currently not allocated to any active project.</p>
      </div>

      {dashboardStats && (
        <div className="bench-dashboard-grid">
          <div className="bench-stat-card">
            <h3>Total on Bench</h3>
            <div className="bench-stat-value">{dashboardStats.totalOnBench}</div>
          </div>
          <div className="bench-stat-card warning">
            <h3>&gt; 30 Days on Bench</h3>
            <div className="bench-stat-value text-warning">{dashboardStats.over30Days}</div>
          </div>
          <div className="bench-stat-card danger">
            <h3>&gt; 60 Days on Bench</h3>
            <div className="bench-stat-value text-danger">{dashboardStats.over60Days}</div>
          </div>
        </div>
      )}

      <div className="bench-content">
        <div className="bench-filters">
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bench-input"
          />
          <select 
            value={selectedDept} 
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bench-input"
          >
            <option value="">All Departments</option>
            {dashboardStats && Object.keys(dashboardStats.deptCounts).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <table className="bench-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Start Date</th>
              <th>Duration (Days)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => {
              const start = new Date(emp.benchStartDate);
              const diffTime = Math.abs(new Date().getTime() - start.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isLongBench = diffDays >= 30;

              return (
                <tr key={emp._id}>
                  <td>
                    <div className="bench-emp-info">
                      {emp.profileImage ? (
                        <img src={emp.profileImage} alt="Profile" className="bench-avatar" />
                      ) : (
                        <div className="bench-avatar-text">{emp.firstName.charAt(0)}{emp.lastName.charAt(0)}</div>
                      )}
                      <div>
                        <strong>{emp.firstName} {emp.lastName}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{emp.departmentId?.departmentName || '-'}</td>
                  <td>{emp.designationId?.title || '-'}</td>
                  <td>{start.toLocaleDateString()}</td>
                  <td>
                    <span className={`bench-duration ${isLongBench ? 'highlight' : ''}`}>
                      {diffDays} days
                    </span>
                  </td>
                  <td>
                    <button 
                      className="bench-btn-edit"
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setNewStatus('On Bench');
                        setReason('');
                        setIsModalOpen(true);
                      }}
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              )
            })}
            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No bench employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="bench-modal-overlay">
          <div className="bench-modal">
            <h3>Update Bench Status for {selectedEmployee?.firstName}</h3>
            <form onSubmit={handleUpdateStatus}>
              <div className="bench-form-group">
                <label>Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} required className="bench-input">
                  <option value="On Bench">On Bench</option>
                  <option value="Allocated">Allocated</option>
                  <option value="Not Applicable">Not Applicable</option>
                </select>
              </div>
              <div className="bench-form-group">
                <label>Reason / Notes</label>
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  className="bench-input"
                  rows="3"
                ></textarea>
              </div>
              <div className="bench-modal-actions">
                <button type="button" className="bench-btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="bench-btn-submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRBenchManagement;
