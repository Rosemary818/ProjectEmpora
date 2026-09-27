import React, { useState, useEffect } from 'react';
import { exportToCSV, printReport } from './exportUtils';

const DepartmentReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/reports/department', {
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
    item.departmentName.toLowerCase().includes(search.toLowerCase()) ||
    item.managerName.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    exportToCSV(filteredData, 'Department_Report.csv');
  };

  return (
    <div className="report-view">
      <div className="report-view-header no-print">
        <h3>Department Report</h3>
        <div className="report-controls">
          <input 
            type="text" 
            placeholder="Search department or head..." 
            className="report-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                <th>Department</th>
                <th>Department Head</th>
                <th>Total Employees</th>
                <th>Active Employees</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(row => (
                <tr key={row._id}>
                  <td>{row.departmentName}</td>
                  <td>{row.managerName}</td>
                  <td>{row.totalEmployees}</td>
                  <td>{row.activeEmployees}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr><td colSpan="5" style={{textAlign: 'center'}}>No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DepartmentReport;
