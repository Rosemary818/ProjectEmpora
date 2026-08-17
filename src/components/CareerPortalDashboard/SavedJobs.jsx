import React, { useState, useEffect } from 'react';
import './AvailableJobs.css';

const SavedJobs = ({ appliedJobIds = [], onApplyClick, onBrowseJobs, onSaveToggle }) => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // Derived filter options
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/career-portal/saved-jobs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setSavedJobs(data.data);
        
        // Extract unique values for filters from populated jobId
        const depts = [...new Set(data.data.map(sj => sj.jobId?.departmentId?.departmentName).filter(Boolean))];
        const locs = [...new Set(data.data.map(sj => sj.jobId?.location).filter(Boolean))];
        
        setDepartments(depts);
        setLocations(locs);
      }
    } catch (err) {
      console.error('Failed to fetch saved jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (jobId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/career-portal/saved-jobs/${jobId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        // Remove from local state immediately
        setSavedJobs(prev => prev.filter(sj => sj.jobId?._id !== jobId));
        if (onSaveToggle) onSaveToggle(); // refresh dashboard count
      }
    } catch (err) {
      console.error('Failed to remove saved job', err);
    }
  };

  const handleApplyClick = (job) => {
    if (appliedJobIds.includes(job._id)) return;
    
    if (new Date(job.deadline) < new Date() || job.status === 'Closed') {
      alert("Application Closed");
      return;
    }

    if (onApplyClick) {
      onApplyClick(job);
    }
  };

  const filteredSavedJobs = savedJobs.filter(sj => {
    const job = sj.jobId;
    if (!job) return false;
    
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept ? job.departmentId?.departmentName === filterDept : true;
    const matchesLoc = filterLocation ? job.location === filterLocation : true;
    
    return matchesSearch && matchesDept && matchesLoc;
  });

  if (loading) {
    return <div className="candidate-home"><p>Loading saved jobs...</p></div>;
  }

  return (
    <div className="candidate-jobs-container">
      <div className="candidate-jobs-header">
        <h2>Saved Jobs</h2>
      </div>

      {savedJobs.length > 0 && (
        <div className="candidate-filters-bar" style={{ marginBottom: '2rem' }}>
          <div className="search-wrapper" style={{ flex: 1, position: 'relative' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '18px', color: '#9ca3af' }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              type="text" 
              placeholder="Search saved jobs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
            />
          </div>

          <select className="candidate-filter-select" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          
          <select className="candidate-filter-select" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
            <option value="">All Locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      )}

      {savedJobs.length === 0 ? (
        <div className="candidate-empty-state">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <h3>No Saved Jobs Yet</h3>
          <p>Save jobs you're interested in and come back to them later.</p>
          <button className="candidate-btn-primary" onClick={onBrowseJobs} style={{ marginTop: '1.5rem' }}>
            Browse Jobs
          </button>
        </div>
      ) : filteredSavedJobs.length === 0 ? (
        <div className="candidate-empty-state">
          <p>No saved jobs match your search criteria.</p>
        </div>
      ) : (
        <div className="candidate-jobs-grid">
          {filteredSavedJobs.map(sj => {
            const job = sj.jobId;
            const isApplied = appliedJobIds.includes(job._id);
            const isClosed = new Date(job.deadline) < new Date() || job.status === 'Closed';

            return (
              <div key={sj._id} className="candidate-job-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="candidate-job-title" style={{ margin: 0 }}>{job.title}</h3>
                  <button 
                    onClick={() => handleRemove(job._id)}
                    style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '0.25rem' }}
                    title="Remove from Saved"
                  >
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#4338ca' }}>
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>
                
                <div className="candidate-job-dept" style={{ marginTop: '0.5rem' }}>
                  {job.departmentId?.departmentName || 'General'}
                </div>
                
                <div className="candidate-job-tags">
                  <span className="candidate-tag">{job.employmentType}</span>
                  <span className="candidate-tag">{job.location}</span>
                  {isClosed && <span className="candidate-tag" style={{ background: '#fee2e2', color: '#dc2626' }}>Closed / Expired</span>}
                </div>
                
                <ul className="candidate-job-details-list">
                  <li>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    Exp: {job.experienceRequired}
                  </li>
                  <li>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </li>
                  <li style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                    Saved on: {new Date(sj.savedAt).toLocaleDateString()}
                  </li>
                </ul>
                
                <div className="candidate-job-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button 
                    className="candidate-btn-outline" 
                    onClick={() => handleRemove(job._id)}
                    style={{ flex: 1 }}
                  >
                    Remove
                  </button>
                  <button 
                    className="candidate-btn-primary" 
                    onClick={() => handleApplyClick(job)}
                    disabled={isApplied || isClosed}
                    style={{ flex: 1, backgroundColor: isApplied ? '#16a34a' : isClosed ? '#d1d5db' : '#388087' }}
                  >
                    {isApplied ? 'Applied' : isClosed ? 'Closed' : 'Apply Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
