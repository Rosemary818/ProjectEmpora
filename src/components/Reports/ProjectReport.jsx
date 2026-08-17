import React, { useState, useEffect } from 'react';
import { exportToCSV, printReport } from './exportUtils';

const ProjectReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/reports/project';
      if (statusFilter) url += `?status=${statusFilter}`;
      
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
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.manager.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    exportToCSV(filteredData, 'Project_Report.csv');
  };

  return (
    <div className="report-view">
      <div className="report-view-header no-print">
        <h3>Project Report</h3>
        <div className="report-controls">
          <input 
            type="text" 
            placeholder="Search project or manager..." 
            className="report-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="report-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
          <button className="btn-export" onClick={handleExport}>Export CSV</button>
          <button className="btn-print" onClick={printReport}>Print / PDF</button>
        </div>
      </div>
      
      {loading ? <div>Loading...</div> : (
        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Manager</th>
                <th>Team Members</th>
                <th>Progress</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(row => (
                <tr key={row._id}>
                  <td>{row.name}</td>
                  <td>{row.manager}</td>
                  <td>{row.teamSize}</td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <div style={{flex: 1, height: '8px', background: '#e5e7eb', borderRadius: '4px'}}>
                        <div style={{height: '100%', background: '#2563eb', borderRadius: '4px', width: `${row.progress}%`}}></div>
                      </div>
                      <span style={{fontSize: '0.8rem'}}>{row.progress}%</span>
                    </div>
                  </td>
                  <td>{new Date(row.startDate).toLocaleDateString()}</td>
                  <td>{new Date(row.endDate).toLocaleDateString()}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr><td colSpan="7" style={{textAlign: 'center'}}>No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectReport;
