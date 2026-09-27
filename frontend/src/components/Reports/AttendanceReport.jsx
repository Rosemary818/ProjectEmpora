import React, { useState, useEffect } from 'react';
import { exportToCSV, printReport } from './exportUtils';

const AttendanceReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/reports/attendance';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => 
    item.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    item.employeeCode?.toLowerCase().includes(search.toLowerCase()) ||
    item.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    exportToCSV(filteredData, 'Attendance_Report.csv');
  };

  return (
    <div className="report-view">
      <div className="report-view-header no-print">
        <h3>Attendance Report</h3>
        <div className="report-controls">
          <input 
            type="text" 
            placeholder="Search employee..." 
            className="report-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input 
            type="date" 
            className="report-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span>to</span>
          <input 
            type="date" 
            className="report-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button className="btn-export" onClick={handleExport}>Export CSV</button>
          <button className="btn-print" onClick={printReport}>Print / PDF</button>
        </div>
      </div>
      
      {loading ? <div>Loading...</div> : (
        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(row => (
                <tr key={row._id}>
                  <td>{row.employeeCode}</td>
                  <td>{row.employeeName}</td>
                  <td>{row.department}</td>
                  <td>{new Date(row.date).toLocaleDateString()}</td>
                  <td>{row.checkIn ? new Date(row.checkIn).toLocaleTimeString() : '-'}</td>
                  <td>{row.checkOut ? new Date(row.checkOut).toLocaleTimeString() : '-'}</td>
                  <td>{row.workingHours ? row.workingHours.toFixed(2) : '-'}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr><td colSpan="8" style={{textAlign: 'center'}}>No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;
