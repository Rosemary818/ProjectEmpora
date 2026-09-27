import React, { useState, useEffect } from 'react';
import { exportToCSV, printReport } from './exportUtils';

const CertificationReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/reports/certification', {
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
    const matchesSearch = item.employeeName.toLowerCase().includes(search.toLowerCase()) ||
                          item.certificate.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    exportToCSV(filteredData, 'Certification_Report.csv');
  };

  return (
    <div className="report-view">
      <div className="report-view-header no-print">
        <h3>Certification Report</h3>
        <div className="report-controls">
          <input 
            type="text" 
            placeholder="Search employee or cert..." 
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
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
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
                <th>Employee Name</th>
                <th>Certificate</th>
                <th>Issuing Organization</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(row => (
                <tr key={row._id}>
                  <td>{row.employeeName}</td>
                  <td>{row.certificate}</td>
                  <td>{row.issuingOrganization}</td>
                  <td>{row.issueDate ? new Date(row.issueDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      backgroundColor: row.status === 'Verified' ? '#def7ec' : 
                                       row.status === 'Rejected' ? '#fde8e8' : '#e1effe',
                      color: row.status === 'Verified' ? '#03543f' : 
                             row.status === 'Rejected' ? '#9b1c1c' : '#1e429f',
                    }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr><td colSpan="6" style={{textAlign: 'center'}}>No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CertificationReport;
