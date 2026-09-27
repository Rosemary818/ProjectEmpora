import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AvailableJobs.css';

const AvailableJobs = ({ appliedJobIds = [], savedJobIds = [], onApplyClick, onSaveToggle }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [filterDept, setFilterDept] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterExp, setFilterExp] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // latest, deadline, title

  // Unique options for filters
  const [departments, setDepartments] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [locations, setLocations] = useState([]);

  // Modal state
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Local state for optimistic updates
  const [localSavedJobIds, setLocalSavedJobIds] = useState(savedJobIds || []);

  useEffect(() => {
    setLocalSavedJobIds(savedJobIds || []);
  }, [savedJobIds]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/jobs/published', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
        
        // Extract unique values for filters
        const depts = [...new Set(data.data.map(j => j.departmentId?.departmentName).filter(Boolean))];
        const types = [...new Set(data.data.map(j => j.employmentType).filter(Boolean))];
        const exps = [...new Set(data.data.map(j => j.experienceRequired).filter(Boolean))];
        const locs = [...new Set(data.data.map(j => j.location).filter(Boolean))];
        
        setDepartments(depts);
        setEmploymentTypes(types);
        setExperiences(exps);
        setLocations(locs);
      }
    } catch (err) {
      console.error('Failed to fetch published jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (job) => {
    if (appliedJobIds.includes(job._id)) return;
    
    if (new Date(job.deadline) < new Date()) {
      alert("Application Closed");
      return;
    }

    if (onApplyClick) {
      onApplyClick(job);
    }
  };

  const handleSaveToggle = async (jobId) => {
    // Optimistic UI update
    setLocalSavedJobIds(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );

    try {
      const res = await fetch(`http://localhost:5000/api/career-portal/saved-jobs/${jobId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success && onSaveToggle) {
        onSaveToggle();
      } else if (!data.success) {
        // Revert on failure
        setLocalSavedJobIds(savedJobIds || []);
      }
    } catch (err) {
      console.error('Failed to toggle save job', err);
      // Revert on failure
      setLocalSavedJobIds(savedJobIds || []);
    }
  };

  // Filter and sort logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept ? job.departmentId?.departmentName === filterDept : true;
    const matchesType = filterType ? job.employmentType === filterType : true;
    const matchesExp = filterExp ? job.experienceRequired === filterExp : true;
    const matchesLoc = filterLocation ? job.location === filterLocation : true;
    
    return matchesSearch && matchesDept && matchesType && matchesExp && matchesLoc;
  }).sort((a, b) => {
    if (sortBy === 'latest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  if (loading) {
    return <div className="candidate-home"><p>Loading jobs...</p></div>;
  }

  return (
    <div className="candidate-jobs-container">
      <div className="candidate-jobs-header">
        <h2>Available Jobs</h2>
      </div>

      <div className="candidate-filters-bar">
        <select className="candidate-filter-select" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        
        <select className="candidate-filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Employment Types</option>
          {employmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        
        <select className="candidate-filter-select" value={filterExp} onChange={(e) => setFilterExp(e.target.value)}>
          <option value="">All Experience Levels</option>
          {experiences.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        
        <select className="candidate-filter-select" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
          <option value="">All Locations</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        
        <select className="candidate-filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ marginLeft: 'auto' }}>
          <option value="latest">Latest Jobs</option>
          <option value="deadline">Application Deadline</option>
          <option value="title">Job Title (A-Z)</option>
        </select>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="candidate-empty-state">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          <h3>No job openings are available at the moment.</h3>
          <p>Please check back later or modify your search filters.</p>
        </div>
      ) : (
        <div className="candidate-jobs-grid">
          {filteredJobs.map(job => {
            const isApplied = appliedJobIds.includes(job._id);
            const isClosed = new Date(job.deadline) < new Date();

            return (
              <div key={job._id} className="candidate-job-card">
                <h3 className="candidate-job-title">{job.title}</h3>
                <div className="candidate-job-dept">{job.departmentId?.departmentName || 'General'}</div>
                
                <div className="candidate-job-tags">
                  <span className="candidate-tag">{job.employmentType}</span>
                  <span className="candidate-tag">{job.location}</span>
                </div>
                
                <ul className="candidate-job-details-list">
                  <li>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    Exp: {job.experienceRequired}
                  </li>
                  <li>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    Vacancies: {job.vacancies}
                  </li>
                  {job.salaryRange && (
                    <li>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {job.salaryRange}
                    </li>
                  )}
                  <li>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </li>
                  <li>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Posted: {new Date(job.createdAt).toLocaleDateString()}
                  </li>
                </ul>
                
                <div className="candidate-job-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button 
                    className="candidate-btn-outline" 
                    onClick={() => handleSaveToggle(job._id)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    {localSavedJobIds.includes(job._id) ? (
                      <>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                        Saved
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                        Save Job
                      </>
                    )}
                  </button>
                  <button className="candidate-btn-outline" onClick={() => setSelectedJob(job)} style={{ flex: 1 }}>
                    View Details
                  </button>
                  <button 
                    className="candidate-btn-primary" 
                    onClick={() => handleApplyClick(job)}
                    disabled={isApplied || isClosed}
                    style={{ flex: 1 }}
                  >
                    {isApplied ? 'Already Applied' : isClosed ? 'Application Closed' : 'Apply Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedJob && (
        <div className="candidate-modal-overlay">
          <div className="candidate-modal">
            <div className="candidate-modal-header">
              <div>
                <h2>{selectedJob.title}</h2>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {selectedJob.departmentId?.departmentName || 'General'} &bull; {selectedJob.location}
                </div>
              </div>
              <button className="candidate-modal-close" onClick={() => setSelectedJob(null)}>&times;</button>
            </div>
            
            <div className="candidate-modal-body">
              <div className="candidate-job-section">
                <h3>Overview</h3>
                <ul className="candidate-job-details-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', margin: 0 }}>
                  <li><strong>Employment Type:</strong> {selectedJob.employmentType}</li>
                  <li><strong>Experience Required:</strong> {selectedJob.experienceRequired}</li>
                  <li><strong>Vacancies:</strong> {selectedJob.vacancies}</li>
                  {selectedJob.salaryRange && <li><strong>Salary Range:</strong> {selectedJob.salaryRange}</li>}
                  <li><strong>Application Deadline:</strong> {new Date(selectedJob.deadline).toLocaleDateString()}</li>
                  <li><strong>Posted Date:</strong> {new Date(selectedJob.createdAt).toLocaleDateString()}</li>
                </ul>
              </div>

              <div className="candidate-job-section">
                <h3>Job Description</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedJob.description}</p>
              </div>

              <div className="candidate-job-section">
                <h3>Responsibilities</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedJob.responsibilities}</p>
              </div>

              <div className="candidate-job-section">
                <h3>Qualifications</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedJob.qualifications}</p>
              </div>

              <div className="candidate-job-section">
                <h3>Required Skills</h3>
                <div className="candidate-job-tags" style={{ marginBottom: 0 }}>
                  {selectedJob.requiredSkills?.map((skill, index) => (
                    <span key={index} className="candidate-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="candidate-modal-footer">
              <button 
                className="candidate-btn-outline" 
                onClick={() => handleSaveToggle(selectedJob._id)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: 'auto' }}
              >
                {localSavedJobIds.includes(selectedJob._id) ? (
                  <>
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                    Saved
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                    Save Job
                  </>
                )}
              </button>

              <button className="candidate-btn-outline" onClick={() => setSelectedJob(null)}>
                Close
              </button>
              <button 
                className="candidate-btn-primary" 
                onClick={() => {
                  handleApplyClick(selectedJob);
                  if (!appliedJobIds.includes(selectedJob._id) && new Date(selectedJob.deadline) >= new Date()) {
                    setSelectedJob(null);
                  }
                }}
                disabled={appliedJobIds.includes(selectedJob._id) || new Date(selectedJob.deadline) < new Date()}
              >
                {appliedJobIds.includes(selectedJob._id) ? 'Already Applied' : new Date(selectedJob.deadline) < new Date() ? 'Application Closed' : 'Apply Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableJobs;
