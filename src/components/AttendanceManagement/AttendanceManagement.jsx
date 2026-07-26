import React, { useState, useEffect } from 'react';
import './AttendanceManagement.css';

const AttendanceManagement = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAttendance = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/attendance/my-attendance', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        setAttendanceRecords(data.data);
        
        // Find today's record if it exists
        const today = new Date();
        const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const recordForToday = data.data.find(record => {
          const recordDate = new Date(record.date);
          return recordDate.getTime() === midnight.getTime();
        });
        
        setTodayRecord(recordForToday || null);
      } else {
        setError(data.message || 'Failed to fetch attendance history');
      }
    } catch (err) {
      setError('Network error while fetching attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('http://localhost:5000/api/attendance/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Checked in successfully!');
        setTodayRecord(data.data);
        setAttendanceRecords([data.data, ...attendanceRecords]);
      } else {
        setError(data.message || 'Failed to check in');
      }
    } catch (err) {
      setError('Network error during check in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('http://localhost:5000/api/attendance/check-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Checked out successfully!');
        setTodayRecord(data.data);
        // Update the record in the list
        setAttendanceRecords(records => 
          records.map(record => record._id === data.data._id ? data.data : record)
        );
      } else {
        setError(data.message || 'Failed to check out');
      }
    } catch (err) {
      setError('Network error during check out');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Determine current status
  let currentStatus = 'Not Checked In';
  if (todayRecord) {
    if (todayRecord.checkOutTime) {
      currentStatus = 'Attendance Completed';
    } else {
      currentStatus = 'Checked In';
    }
  }

  if (loading) {
    return <div className="am-loading">Loading attendance data...</div>;
  }

  return (
    <div className="am-container">
      <div className="am-header">
        <h2>Attendance Management</h2>
        <p className="am-subtitle">Track your daily working hours</p>
      </div>

      {error && <div className="am-alert am-alert-danger">{error}</div>}
      {success && <div className="am-alert am-alert-success">{success}</div>}

      <div className="am-dashboard-grid">
        {/* Today's Status Card */}
        <div className="am-card am-status-card">
          <div className="am-card-header">
            <h3>Today's Attendance</h3>
            <span className="am-date-badge">{formatDate(new Date())}</span>
          </div>
          <div className="am-card-body">
            <div className="am-status-display">
              <div className="am-status-label">Current Status:</div>
              <div className={`am-status-value status-${currentStatus.replace(/\s+/g, '-').toLowerCase()}`}>
                {currentStatus}
              </div>
            </div>

            <div className="am-times-grid">
              <div className="am-time-box">
                <span className="am-time-label">Check In</span>
                <span className="am-time-value">{todayRecord ? formatTime(todayRecord.checkInTime) : '--:--'}</span>
              </div>
              <div className="am-time-box">
                <span className="am-time-label">Check Out</span>
                <span className="am-time-value">{todayRecord && todayRecord.checkOutTime ? formatTime(todayRecord.checkOutTime) : '--:--'}</span>
              </div>
            </div>

            {todayRecord && todayRecord.totalWorkingHours && (
              <div className="am-total-hours">
                <strong>Total Working Hours:</strong> {todayRecord.totalWorkingHours}
              </div>
            )}

            <div className="am-action-buttons">
              {!todayRecord && (
                <button 
                  className="btn btn-primary am-btn-large" 
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Check In'}
                </button>
              )}
              {todayRecord && !todayRecord.checkOutTime && (
                <button 
                  className="btn btn-warning am-btn-large" 
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Check Out'}
                </button>
              )}
              {todayRecord && todayRecord.checkOutTime && (
                <button 
                  className="btn btn-secondary am-btn-large" 
                  disabled={true}
                >
                  Shift Completed
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Attendance History Card */}
        <div className="am-card am-history-card">
          <div className="am-card-header">
            <h3>Attendance History</h3>
          </div>
          <div className="am-card-body">
            {attendanceRecords.length === 0 ? (
              <p className="am-text-muted">No attendance records found.</p>
            ) : (
              <div className="am-table-responsive">
                <table className="am-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Duration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record) => (
                      <tr key={record._id}>
                        <td>{formatDate(record.date)}</td>
                        <td>{formatTime(record.checkInTime)}</td>
                        <td>{formatTime(record.checkOutTime)}</td>
                        <td>{record.totalWorkingHours || '-'}</td>
                        <td>
                          <span className={`am-badge am-badge-${record.status.toLowerCase()}`}>
                            {record.status}
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
    </div>
  );
};

export default AttendanceManagement;
