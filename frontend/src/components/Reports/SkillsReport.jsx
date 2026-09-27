import React, { useState, useEffect } from 'react';
import { exportToCSV, printReport } from './exportUtils';

const SkillsReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/reports/skills', {
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

  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(data.map(item => item.category).filter(Boolean))];

  const handleExport = () => {
    const exportData = filteredData.map(item => ({
      Skill: item.name,
      Category: item.category || 'N/A',
      'Employee Count': item.count,
      Beginner: item.levels.Beginner || 0,
      Intermediate: item.levels.Intermediate || 0,
      Advanced: item.levels.Advanced || 0,
      Expert: item.levels.Expert || 0
    }));
    exportToCSV(exportData, 'Skills_Report.csv');
  };

  return (
    <div className="report-view">
      <div className="report-view-header no-print">
        <h3>Skills Report</h3>
        <div className="report-controls">
          <input 
            type="text" 
            placeholder="Search skill..." 
            className="report-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="report-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
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
                <th>Skill</th>
                <th>Category</th>
                <th>Total Employees</th>
                <th>Beginner</th>
                <th>Intermediate</th>
                <th>Advanced</th>
                <th>Expert</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(row => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{row.category || 'N/A'}</td>
                  <td>{row.count}</td>
                  <td>{row.levels.Beginner || 0}</td>
                  <td>{row.levels.Intermediate || 0}</td>
                  <td>{row.levels.Advanced || 0}</td>
                  <td>{row.levels.Expert || 0}</td>
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

export default SkillsReport;
