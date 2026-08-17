import React, { useState, useEffect } from 'react';
import './TalentManagement.css';

const TalentManagement = () => {
  const [employeeSkills, setEmployeeSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  useEffect(() => {
    fetchEmployeeSkills();
  }, []);

  const fetchEmployeeSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/skills/all-employee-skills', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEmployeeSkills(data.data);
      } else {
        setError('Failed to fetch employee skills');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Employee Name', 'Department', 'Skill/Talent Name', 'Category', 'Skill Level'];
    const csvContent = [
      headers.join(','),
      ...filteredSkills.map(s => 
        `"${s.userId?.firstName} ${s.userId?.lastName}","${s.userId?.departmentName || 'N/A'}","${s.skillId?.name}","${s.skillId?.category || 'Professional Skills'}","${s.level}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Talent_Management_Export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSkills = employeeSkills.filter(s => {
    const empName = `${s.userId?.firstName} ${s.userId?.lastName}`.toLowerCase();
    const skillName = (s.skillId?.name || '').toLowerCase();
    const matchesSearch = empName.includes(searchTerm.toLowerCase()) || skillName.includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? (s.skillId?.category || 'Professional Skills') === categoryFilter : true;
    const matchesLevel = levelFilter ? s.level === levelFilter : true;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="talent-mgmt-container">
      <div className="talent-mgmt-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Talent Management</h2>
        <button className="btn btn-secondary" style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={handleExportCSV}>Export CSV</button>
      </div>

      <div className="talent-mgmt-filters" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Search by Employee or Talent..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="talent-search"
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="talent-select" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
          <option value="">All Categories</option>
          <option value="Professional Skills">Professional Skills</option>
          <option value="Personal Talents">Personal Talents</option>
        </select>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="talent-select" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
      </div>

      {loading ? (
        <div className="talent-loading">Loading...</div>
      ) : error ? (
        <div className="talent-error">{error}</div>
      ) : (
        <div className="table-responsive">
          <table className="certs-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>Employee</th>
                <th style={{ padding: '12px' }}>Department</th>
                <th style={{ padding: '12px' }}>Talent / Skill</th>
                <th style={{ padding: '12px' }}>Category</th>
                <th style={{ padding: '12px' }}>Level</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.length > 0 ? filteredSkills.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="talent-avatar" style={{ width: '32px', height: '32px', background: '#bfdbfe', color: '#1e3a8a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {s.userId?.firstName?.charAt(0)}{s.userId?.lastName?.charAt(0)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{s.userId?.firstName} {s.userId?.lastName}</span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID: {s.userId?.employeeCode || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>{s.userId?.departmentName || 'N/A'}</td>
                  <td style={{ padding: '12px' }}><strong>{s.skillId?.name}</strong></td>
                  <td style={{ padding: '12px' }}><span className={`category-badge ${s.skillId?.category === 'Personal Talents' ? 'personal' : 'professional'}`} style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem', background: s.skillId?.category === 'Personal Talents' ? '#fdf4ff' : '#eff6ff', color: s.skillId?.category === 'Personal Talents' ? '#86198f' : '#1e40af' }}>{s.skillId?.category || 'Professional Skills'}</span></td>
                  <td style={{ padding: '12px' }}>
                     <span className={`level-badge level-${s.level.toLowerCase()}`} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', background: '#f3f4f6', color: '#374151' }}>{s.level}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="no-data" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TalentManagement;
