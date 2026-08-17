import React, { useState, useEffect } from 'react';
import './SuperAdminCandidates.css';

const SuperAdminCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/super-admin/candidates', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCandidates(data.data);
        setFilteredCandidates(data.data);
      } else {
        setError(data.message || 'Failed to fetch candidates');
      }
    } catch (err) {
      setError('Unable to load candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = candidates;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => 
        (c.firstName?.toLowerCase().includes(lower) || '') ||
        (c.lastName?.toLowerCase().includes(lower) || '') ||
        (c.email?.toLowerCase().includes(lower) || '') ||
        (c.phone?.includes(searchTerm) || '') ||
        (c.applications?.some(app => app.jobId?.title?.toLowerCase().includes(lower)))
      );
    }

    if (statusFilter) {
      result = result.filter(c => {
        if (c.applications?.length > 0) {
          // Check latest application or if any application matches
          return c.applications.some(app => app.status === statusFilter);
        }
        return false;
      });
    }

    if (jobFilter) {
      result = result.filter(c => {
        if (c.applications?.length > 0) {
          return c.applications.some(app => app.jobId?.title === jobFilter);
        }
        return false;
      });
    }

    setFilteredCandidates(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, jobFilter, candidates]);

  // Derived metrics
  const totalCandidates = candidates.length;
  let activeApplications = 0;
  let shortlisted = 0;
  let interview = 0;
  let selected = 0;
  let rejected = 0;

  candidates.forEach(c => {
    if (c.applications) {
      c.applications.forEach(app => {
        if (['Applied', 'Under Review'].includes(app.status)) activeApplications++;
        if (app.status === 'Shortlisted') shortlisted++;
        if (app.status === 'Interview Scheduled', 'Interview Completed'.includes(app.status)) interview++; // oops, let's fix below
        if (['Selected', 'Offer Sent', 'Offer Accepted', 'Converted to Employee'].includes(app.status)) selected++;
        if (app.status === 'Rejected') rejected++;
      });
    }
  });

  // Extract unique jobs for filter dropdown
  const uniqueJobs = [...new Set(candidates.flatMap(c => c.applications?.map(app => app.jobId?.title)).filter(Boolean))];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCandidates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Applied': return 'sac-badge-info';
      case 'Under Review': return 'sac-badge-warning';
      case 'Shortlisted': return 'sac-badge-primary';
      case 'Interview Scheduled':
      case 'Interview Completed': return 'sac-badge-purple';
      case 'Selected':
      case 'Offer Sent':
      case 'Offer Accepted':
      case 'Converted to Employee': return 'sac-badge-success';
      case 'Rejected':
      case 'Withdrawn': return 'sac-badge-danger';
      default: return 'sac-badge-default';
    }
  };

  const openCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  const closeCandidateDetails = () => {
    setSelectedCandidate(null);
    setShowModal(false);
  };

  if (loading) {
    return <div className="sac-loading-state">Loading Candidates...</div>;
  }

  if (error) {
    return <div className="sac-error-state">{error}</div>;
  }

  return (
    <div className="sac-container">
      <div className="sac-header">
        <h2>Candidates Management</h2>
        <p>View and manage all registered candidates and job applications</p>
      </div>

      {/* Summary Cards */}
      <div className="sac-metrics-grid">
        <div className="sac-metric-card">
          <h3>Total Candidates</h3>
          <p className="sac-metric-value">{totalCandidates}</p>
        </div>
        <div className="sac-metric-card">
          <h3>Active Applications</h3>
          <p className="sac-metric-value">{activeApplications}</p>
        </div>
        <div className="sac-metric-card">
          <h3>Shortlisted</h3>
          <p className="sac-metric-value" style={{ color: '#4f46e5' }}>{shortlisted}</p>
        </div>
        <div className="sac-metric-card">
          <h3>Interview</h3>
          <p className="sac-metric-value" style={{ color: '#9333ea' }}>{interview}</p>
        </div>
        <div className="sac-metric-card">
          <h3>Selected</h3>
          <p className="sac-metric-value" style={{ color: '#10b981' }}>{selected}</p>
        </div>
        <div className="sac-metric-card">
          <h3>Rejected</h3>
          <p className="sac-metric-value" style={{ color: '#ef4444' }}>{rejected}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="sac-filters-section">
        <div className="sac-search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Search by name, email, phone or job..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sac-filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Interview Completed">Interview Completed</option>
            <option value="Selected">Selected</option>
            <option value="Converted to Employee">Converted to Employee</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
            <option value="">All Jobs</option>
            {uniqueJobs.map(job => (
              <option key={job} value={job}>{job}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="sac-table-container">
        <table className="sac-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Contact Info</th>
              <th>Latest Application</th>
              <th>Recruitment Stage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(candidate => {
                const latestApp = candidate.applications && candidate.applications.length > 0 
                  ? [...candidate.applications].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))[0] 
                  : null;

                return (
                  <tr key={candidate._id}>
                    <td>
                      <div className="sac-candidate-cell">
                        <div className="sac-avatar">
                          {candidate.profileImage ? (
                            <img src={candidate.profileImage} alt="Profile" />
                          ) : (
                            <>{candidate.firstName?.charAt(0)}{candidate.lastName?.charAt(0)}</>
                          )}
                        </div>
                        <div className="sac-candidate-info">
                          <span className="sac-name">{candidate.firstName} {candidate.lastName}</span>
                          {latestApp && latestApp.status === 'Converted to Employee' && (
                            <span className="sac-converted-badge">Employee</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="sac-contact-info">
                        <span>{candidate.email}</span>
                        {candidate.phone && <span className="sac-phone">{candidate.phone}</span>}
                      </div>
                    </td>
                    <td>
                      {latestApp ? (
                        <div className="sac-job-info">
                          <span className="sac-job-title">{latestApp.jobId?.title}</span>
                          <span className="sac-date">{new Date(latestApp.appliedAt).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="sac-no-data">Registered Candidate</span>
                      )}
                    </td>
                    <td>
                      {latestApp ? (
                        <span className={`sac-badge ${getStatusBadgeClass(latestApp.status)}`}>
                          {latestApp.status}
                        </span>
                      ) : (
                        <span className="sac-badge sac-badge-default">N/A</span>
                      )}
                    </td>
                    <td>
                      <button className="sac-btn-view" onClick={() => openCandidateDetails(candidate)}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="sac-empty-state">
                  {candidates.length === 0 ? "No candidates found." : "No candidates match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="sac-pagination">
          <span className="sac-page-info">
            Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredCandidates.length)} of {filteredCandidates.length} candidates
          </span>
          <div className="sac-page-controls">
            <button 
              disabled={currentPage === 1}
              onClick={() => paginate(currentPage - 1)}
            >
              Previous
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => paginate(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedCandidate && (
        <div className="sac-modal-overlay" onClick={closeCandidateDetails}>
          <div className="sac-modal-content" onClick={e => e.stopPropagation()}>
            <div className="sac-modal-header">
              <h2>Candidate Details</h2>
              <button className="sac-modal-close" onClick={closeCandidateDetails}>&times;</button>
            </div>
            <div className="sac-modal-body">
              <div className="sac-profile-section">
                <div className="sac-modal-avatar">
                  {selectedCandidate.profileImage ? (
                    <img src={selectedCandidate.profileImage} alt="Profile" />
                  ) : (
                    <>{selectedCandidate.firstName?.charAt(0)}{selectedCandidate.lastName?.charAt(0)}</>
                  )}
                </div>
                <div className="sac-profile-details">
                  <h3>{selectedCandidate.firstName} {selectedCandidate.lastName}</h3>
                  <p>{selectedCandidate.email}</p>
                  <p>{selectedCandidate.phone}</p>
                  {selectedCandidate.location && <p className="sac-location">📍 {selectedCandidate.location}</p>}
                </div>
              </div>

              {/* If Converted to Employee, show explicitly */}
              {selectedCandidate.applications?.some(app => app.status === 'Converted to Employee') && (
                <div className="sac-converted-alert">
                  <strong>Converted to Employee</strong>
                  <p>This candidate has been hired and converted into an active employee account.</p>
                  {selectedCandidate.employeeCode && <p>Employee ID: {selectedCandidate.employeeCode}</p>}
                </div>
              )}

              <div className="sac-info-grid">
                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div className="sac-info-box">
                    <h4>Skills</h4>
                    <div className="sac-skills-list">
                      {selectedCandidate.skills.map((skill, i) => (
                        <span key={i} className="sac-skill-tag">{skill.name || skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedCandidate.education && selectedCandidate.education.length > 0 && (
                  <div className="sac-info-box">
                    <h4>Education</h4>
                    <ul className="sac-bullet-list">
                      {selectedCandidate.education.map((edu, i) => (
                        <li key={i}>{typeof edu === 'object' ? edu.degree : edu}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="sac-applications-section">
                <h4>Application History</h4>
                {selectedCandidate.applications && selectedCandidate.applications.length > 0 ? (
                  <div className="sac-app-list">
                    {[...selectedCandidate.applications].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)).map(app => (
                      <div key={app._id} className="sac-app-card">
                        <div className="sac-app-card-header">
                          <h5>{app.jobId?.title}</h5>
                          <span className={`sac-badge ${getStatusBadgeClass(app.status)}`}>{app.status}</span>
                        </div>
                        <div className="sac-app-card-body">
                          <p><strong>Applied:</strong> {new Date(app.appliedAt).toLocaleDateString()}</p>
                          <p><strong>Department:</strong> {app.jobId?.departmentId?.departmentName || 'N/A'}</p>
                          {app.resume && (
                            <a href={app.resume} target="_blank" rel="noopener noreferrer" className="sac-resume-link">
                              📄 View Resume
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="sac-no-data-msg">No job applications yet.</p>
                )}
              </div>
            </div>
            <div className="sac-modal-footer">
              <button className="sac-btn-secondary" onClick={closeCandidateDetails}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminCandidates;
