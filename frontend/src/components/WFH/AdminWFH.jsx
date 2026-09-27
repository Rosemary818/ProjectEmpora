import React, { useState, useEffect } from 'react';
import './WFH.css';

const AdminWFH = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/wfh/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching all WFH requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const filteredRequests = requests.filter(req => {
    let matchStatus = true;
    if (statusFilter !== 'All') {
      matchStatus = req.status === statusFilter;
    }

    let matchSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const empName = `${req.employee?.firstName} ${req.employee?.lastName}`.toLowerCase();
      const empEmail = req.employee?.email?.toLowerCase() || '';
      const dept = req.employee?.department?.toLowerCase() || '';
      matchSearch = empName.includes(query) || empEmail.includes(query) || dept.includes(query);
    }

    return matchStatus && matchSearch;
  });

  if (loading) {
    return <div className="wfh-loading">Loading WFH module...</div>;
  }

  return (
    <div className="wfh-container">
      <div className="wfh-header">
        <h2>Remote Work Management</h2>
        <p>Monitor company-wide Work From Home records and history.</p>
      </div>

      <div className="wfh-card">
        <div className="wfh-card-header">
          <h3>All WFH Requests</h3>
        </div>
        <div className="wfh-card-body">
          <div className="wfh-filters">
            <input 
              type="text" 
              placeholder="Search employee, email, department..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {filteredRequests.length === 0 ? (
            <p className="wfh-empty">No WFH requests match your filters.</p>
          ) : (
            <div className="wfh-table-responsive">
              <table className="wfh-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Manager</th>
                    <th>Action Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => (
                    <tr key={req._id}>
                      <td>
                        <strong>{req.employee?.firstName} {req.employee?.lastName}</strong>
                        <br/>
                        <small style={{color: '#6b7280'}}>{req.employee?.email}</small>
                      </td>
                      <td>{req.employee?.department || '-'}</td>
                      <td>{formatDate(req.fromDate)} to {formatDate(req.toDate)}</td>
                      <td>{req.reason}</td>
                      <td>
                        <span className={`wfh-badge badge-${req.status.toLowerCase()}`}>{req.status}</span>
                      </td>
                      <td>{req.manager?.firstName} {req.manager?.lastName}</td>
                      <td>{formatDate(req.approvedAt || req.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWFH;
