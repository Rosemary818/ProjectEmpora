import React, { useState, useRef } from 'react';
import './ApplyJob.css';

const ApplyJob = ({ job, user, onCancel, onSuccess, onGoToResume }) => {
  const [formData, setFormData] = useState({
    coverLetter: '',
    portfolio: '',
    github: '',
    linkedin: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumePreview, setResumePreview] = useState('');
  const [savedResume, setSavedResume] = useState(null);
  const [useSavedResume, setUseSavedResume] = useState(false);
  const [fetchingResume, setFetchingResume] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/resume/me', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        const data = await res.json();
        if (data.success && data.resume) {
          setSavedResume(data.resume);
          setUseSavedResume(true);
        }
      } catch (err) {
        console.error('Failed to fetch resume:', err);
      } finally {
        setFetchingResume(false);
      }
    };
    fetchResume();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      alert('Only PDF and DOCX files are accepted.');
      fileInputRef.current.value = '';
      setResumeFile(null);
      setResumePreview('');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit.');
      fileInputRef.current.value = '';
      setResumeFile(null);
      setResumePreview('');
      return;
    }

    setResumeFile(file);
    setResumePreview(file.name);
    setUseSavedResume(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile && !useSavedResume) {
      alert('Resume is required.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      if (resumeFile && !useSavedResume) {
        data.append('resume', resumeFile);
      }
      if (formData.coverLetter) data.append('coverLetter', formData.coverLetter);
      if (formData.portfolio) data.append('portfolio', formData.portfolio);
      if (formData.github) data.append('github', formData.github);
      if (formData.linkedin) data.append('linkedin', formData.linkedin);

      const res = await fetch(`http://localhost:5000/api/career-portal/apply/${job._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: data
      });

      const json = await res.json();
      if (json.success) {
        alert('Your application has been submitted successfully.');
        onSuccess();
      } else {
        if (res.status === 401) {
          alert('Your session has expired. Please log in again.');
          window.location.href = '/login';
          return;
        }
        alert(json.error || json.message || 'Failed to submit application.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!job || !user || fetchingResume) return <div>Loading...</div>;

  return (
    <div className="apply-job-container">
      <div className="apply-job-header">
        <h2>Apply for {job.title}</h2>
        <p>Please review the job details and submit your application.</p>
      </div>

      <div className="apply-job-grid">
        {/* Left Column: Read-Only Info */}
        <div className="apply-job-info-col">
          <div className="career-card">
            <div className="career-card-header">
              <h2>Job Information</h2>
            </div>
            <div className="career-card-body">
              <ul className="career-list">
                <li className="career-list-item"><strong>Title:</strong> {job.title}</li>
                <li className="career-list-item"><strong>Department:</strong> {job.departmentId?.departmentName || 'General'}</li>
                <li className="career-list-item"><strong>Type:</strong> {job.employmentType}</li>
                <li className="career-list-item"><strong>Experience:</strong> {job.experienceRequired}</li>
                <li className="career-list-item"><strong>Location:</strong> {job.location}</li>
                {job.salaryRange && <li className="career-list-item"><strong>Salary:</strong> {job.salaryRange}</li>}
                <li className="career-list-item"><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</li>
              </ul>
            </div>
          </div>

          <div className="career-card" style={{ marginTop: '1.5rem' }}>
            <div className="career-card-header">
              <h2>Candidate Information</h2>
            </div>
            <div className="career-card-body">
              <p className="candidate-info-note">This information is synced with your profile.</p>
              <ul className="career-list">
                <li className="career-list-item"><strong>Full Name:</strong> {user.firstName} {user.lastName}</li>
                <li className="career-list-item"><strong>Email:</strong> {user.email}</li>
                <li className="career-list-item"><strong>Phone:</strong> {user.phone || 'Not provided'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Application Form */}
        <div className="apply-job-form-col">
          <div className="career-card">
            <div className="career-card-header">
              <h2>Application Form</h2>
            </div>
            <div className="career-card-body">
              <form onSubmit={handleSubmit} className="apply-job-form">

                <div className="form-group">
                  <label>Resume (PDF or DOCX, max 5MB) <span className="required">*</span></label>

                  {savedResume && (
                    <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #cce5ff', backgroundColor: '#e8f4f8', borderRadius: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 'normal', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={useSavedResume}
                          onChange={(e) => {
                            setUseSavedResume(e.target.checked);
                            if (e.target.checked) {
                              setResumeFile(null);
                              setResumePreview('');
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }
                          }}
                        />
                        Use my saved resume: <strong>{savedResume.originalName}</strong>
                      </label>
                    </div>
                  )}

                  <input
                    type="file"
                    accept=".pdf,.docx"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  {resumePreview && (
                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500, color: '#374151' }}>Selected: {resumePreview}</span>
                      <button type="button" onClick={() => fileInputRef.current.click()} className="career-btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                        Replace
                      </button>
                    </div>
                  )}
                  {!savedResume && !useSavedResume && !resumePreview && (
                    <div className="career-card" style={{ marginTop: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2' }}>
                      <div className="career-card-body" style={{ textAlign: 'center', padding: '1.5rem' }}>
                        <h3 style={{ color: '#991b1b', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Resume Required</h3>
                        <p style={{ color: '#7f1d1d', marginBottom: '1.5rem' }}>Please upload your resume before applying.</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={onGoToResume}
                            className="career-btn-outline"
                            style={{ borderColor: '#f87171', color: '#dc2626' }}
                          >
                            My Resume
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="career-btn-primary"
                            style={{ backgroundColor: '#dc2626' }}
                          >
                            Upload Resume
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Cover Letter (Optional)</label>
                  <textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    placeholder="Briefly explain why you're a good fit..."
                    rows="4"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Portfolio URL (Optional)</label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    placeholder="https://myportfolio.com"
                  />
                </div>

                <div className="form-group">
                  <label>GitHub URL (Optional)</label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    placeholder="https://github.com/username"
                  />
                </div>

                <div className="form-group">
                  <label>LinkedIn URL (Optional)</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="apply-job-actions">
                  <button type="button" onClick={onCancel} className="btn-cancel" disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" disabled={submitting || (!resumeFile && !useSavedResume)}>
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyJob;
