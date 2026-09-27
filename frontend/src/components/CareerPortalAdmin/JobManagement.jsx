import React, { useState, useEffect } from 'react';
import JobForm from './JobForm';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/jobs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/jobs/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, []);

  const handleEdit = (job) => {
    setSelectedJob(job);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (res.ok) {
        fetchJobs();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to delete job', err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchJobs();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div className="hrcp-job-management">
      <div className="hrcp-summary-cards">
        <div className="hrcp-card">
          <div className="hrcp-card-icon" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
          </div>
          <div className="hrcp-card-info">
            <h3>Total Jobs</h3>
            <p>{stats.total}</p>
          </div>
        </div>
        
        <div className="hrcp-card">
          <div className="hrcp-card-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div className="hrcp-card-info">
            <h3>Published</h3>
            <p>{stats.published}</p>
          </div>
        </div>
        
        <div className="hrcp-card">
          <div className="hrcp-card-icon" style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </div>
          <div className="hrcp-card-info">
            <h3>Draft Jobs</h3>
            <p>{stats.draft}</p>
          </div>
        </div>

        <div className="hrcp-card">
          <div className="hrcp-card-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <div className="hrcp-card-info">
            <h3>Closed Jobs</h3>
            <p>{stats.closed}</p>
          </div>
        </div>
      </div>

      <div className="hrcp-actions-bar">
        <h2>Job Listings</h2>
        <button 
          className="hrcp-btn-primary" 
          onClick={() => { setSelectedJob(null); setIsFormOpen(true); }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create Job
        </button>
      </div>

      <div className="hrcp-table-wrapper">
        <table className="hrcp-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Department</th>
              <th>Type</th>
              <th>Vacancies</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Applications</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: 'center' }}>Loading jobs...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center' }}>No jobs found</td></tr>
            ) : (
              jobs.map(job => (
                <tr key={job._id}>
                  <td><strong>{job.title}</strong></td>
                  <td>{job.departmentId?.departmentName || 'N/A'}</td>
                  <td>{job.employmentType}</td>
                  <td>{job.vacancies}</td>
                  <td>{new Date(job.deadline).toLocaleDateString()}</td>
                  <td>
                    <span className={`hrcp-status-badge hrcp-status-${job.status}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>{job.totalApplications}</td>
                  <td>
                    <div className="hrcp-action-btns">
                      <button className="hrcp-btn-icon" onClick={() => handleEdit(job)} title="Edit">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      
                      {job.status !== 'Published' && (
                        <button className="hrcp-btn-icon" onClick={() => handleStatusChange(job._id, 'Published')} title="Publish">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        </button>
                      )}
                      
                      {job.status === 'Published' && (
                        <button className="hrcp-btn-icon" onClick={() => handleStatusChange(job._id, 'Draft')} title="Unpublish">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                      )}

                      {job.status !== 'Closed' && (
                        <button className="hrcp-btn-icon" onClick={() => handleStatusChange(job._id, 'Closed')} title="Close Job">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                        </button>
                      )}

                      <button className="hrcp-btn-icon" onClick={() => handleDelete(job._id)} title="Delete" style={{ color: '#dc2626' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <JobForm 
          job={selectedJob} 
          onClose={() => setIsFormOpen(false)} 
          onSave={() => {
            setIsFormOpen(false);
            fetchJobs();
            fetchStats();
          }} 
        />
      )}
    </div>
  );
};

export default JobManagement;
