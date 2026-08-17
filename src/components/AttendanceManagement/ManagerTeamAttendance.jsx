import React, { useState, useEffect } from 'react';
import './AttendanceManagement.css';

const ManagerTeamAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchTeamAttendance = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/attendance/team-attendance', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        setAttendanceRecords(data.data);
        setFilteredRecords(data.data);
      } else {
        setError(data.message || 'Failed to fetch team attendance');
      }
    } catch (err) {
      setError('Network error while fetching team attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamAttendance();
  }, []);

  useEffect(() => {
    let result = attendanceRecords;
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(record => {
        const name = `${record.employee?.firstName} ${record.employee?.lastName}`.toLowerCase();
        const email = record.employee?.email?.toLowerCase() || '';
        return name.includes(lowerQuery) || email.includes(lowerQuery);
      });
    }
    
    if (statusFilter !== 'All') {
      result = result.filter(record => record.status === statusFilter);
    }
    
    setFilteredRecords(result);
  }, [searchQuery, statusFilter, attendanceRecords]);

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return <div className="am-loading">Loading team attendance data...</div>;
  }

  return (
    <div className="am-container">
      <div className="am-header">
        <h2>Team Attendance</h2>
        <p className="am-subtitle">Monitor the attendance records of your team members</p>
      </div>

      {error && <div className="am-alert am-alert-danger">{error}</div>}

      <div className="am-card am-history-card">
        <div className="am-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3>Attendance Records</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>
        <div className="am-card-body">
          {filteredRecords.length === 0 ? (
            <p className="am-text-muted">No attendance records found for your team.</p>
          ) : (
            <div className="am-table-responsive">
              <table className="am-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Duration (hrs)</th>
                    <th>Overtime (hrs)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', background: '#bfdbfe', color: '#1e3a8a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', overflow: 'hidden' }}>
                            {record.employee?.profileImage ? <img src={record.employee.profileImage} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : `${record.employee?.firstName?.charAt(0) || ''}${record.employee?.lastName?.charAt(0) || ''}`}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500' }}>{record.employee?.firstName} {record.employee?.lastName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{record.employee?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{formatDate(record.date)}</td>
                      <td>{formatTime(record.checkIn)}</td>
                      <td>{formatTime(record.checkOut)}</td>
                      <td>{record.workingHours || '-'}</td>
                      <td style={{ color: record.overtimeHours > 0 ? '#d97706' : 'inherit' }}>
                        {record.overtimeHours || '-'}
                      </td>
                      <td>
                        <span className={`am-badge am-badge-${record.status?.toLowerCase().replace(/\s+/g, '-') || 'default'}`}>
                          {record.status} {record.isLate ? '(Late)' : ''}
                        </span>
                      </td>
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

export default ManagerTeamAttendance;
