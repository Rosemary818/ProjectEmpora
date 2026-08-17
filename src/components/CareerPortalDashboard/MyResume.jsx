import React, { useState, useEffect, useRef } from 'react';
import './MyResume.css';

const MyResume = () => {
  const [resume, setResume] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef(null);

  const staticTemplates = [
    {
      name: 'Professional Resume',
      desc: 'Clean professional format suitable for corporate applications.',
      url: '/resume-templates/Professional_Resume_Template.docx'
    },
    {
      name: 'Modern Resume',
      desc: 'Modern and clean resume layout.',
      url: '/resume-templates/Modern_Resume_Template.docx'
    },
    {
      name: 'Fresher Resume',
      desc: 'Suitable for students and recent graduates.',
      url: '/resume-templates/Fresher_Resume_Template.docx'
    },
    {
      name: 'Software Developer Resume',
      desc: 'Designed for software development and technical roles.',
      url: '/resume-templates/Software_Developer_Resume_Template.docx'
    },
    {
      name: 'ATS-Friendly Resume',
      desc: 'Simple ATS-friendly format for online applications.',
      url: '/resume-templates/ATS_Friendly_Resume_Template.docx'
    }
  ];

  const fetchResume = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/resume/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setResume(data.resume);
      } else {
        setResume(null);
      }
    } catch (err) {
      console.error('Failed to fetch resume:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      alert('Only PDF and DOCX files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const res = await fetch('http://localhost:5000/api/resume/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setResume(data.resume);
        alert('Resume uploaded successfully.');
      } else {
        alert(data.message || 'Failed to upload resume.');
      }
    } catch (err) {
      console.error('Failed to upload resume:', err);
      alert('An error occurred while uploading.');
    } finally {
      setUploading(false);
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;

    try {
      const res = await fetch('http://localhost:5000/api/resume/me', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setResume(null);
        alert('Resume deleted successfully.');
      }
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
  };

  if (loading) return <div className="my-resume-loading">Loading your resume...</div>;

  return (
    <div className="my-resume-container">
      <div className="career-welcome-banner" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '2rem', fontWeight: 'bold', color: 'var(--gray-900, #0f172a)' }}>Resume</h1>
          <p style={{ margin: 0, color: 'var(--gray-500, #64748b)', fontSize: '1rem' }}>Create a professional resume with our templates</p>
        </div>
        {!resume && (
          <button className="btn btn-primary" onClick={() => fileInputRef.current.click()} disabled={uploading}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </button>
        )}
      </div>

      {resume && (
        <div className="career-card">
          <div className="career-card-header">
            <h2>Current Resume</h2>
            <span className="app-status-badge" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>Uploaded</span>
          </div>
          <div className="career-card-body">
            <div className="resume-details-grid">
              <div className="resume-detail-item">
                <span className="resume-detail-label">Filename</span>
                <span className="resume-detail-value">{resume.originalName}</span>
              </div>
              <div className="resume-detail-item">
                <span className="resume-detail-label">Upload Date</span>
                <span className="resume-detail-value">{new Date(resume.updatedAt).toLocaleString()}</span>
              </div>
              <div className="resume-detail-item">
                <span className="resume-detail-label">File Type</span>
                <span className="resume-detail-value">{resume.mimeType === 'application/pdf' ? 'PDF Document' : 'Word Document'}</span>
              </div>
              <div className="resume-detail-item">
                <span className="resume-detail-label">File Size</span>
                <span className="resume-detail-value">{(resume.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>

            <div className="resume-actions-bar" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <a href={`http://localhost:5000${resume.resumeUrl}`} target="_blank" rel="noreferrer" className="btn btn-secondary">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                View
              </a>
              <a href={`http://localhost:5000${resume.resumeUrl}`} download className="btn btn-primary">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Download
              </a>
              <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /><polyline points="16 16 12 12 8 16" /></svg>
                {uploading ? 'Uploading...' : 'Replace'}
              </button>
              <button className="btn btn-secondary text-danger" onClick={handleDelete} style={{ marginLeft: 'auto', borderColor: '#fee2e2', color: '#dc2626' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="resume-templates-section" style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--gray-900, #0f172a)', marginBottom: '1.5rem' }}>Available Templates</h2>

        <div className="templates-grid">
          {staticTemplates.map((t, idx) => (
            <div key={idx} className="career-card template-card">
              <div className="template-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              </div>
              <div className="template-info">
                <h4>{t.name}</h4>
                <p>{t.desc}</p>
              </div>
              <a href={t.url} download className="template-download-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Download Template
              </a>
            </div>
          ))}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".pdf,.docx"
      />
    </div>
  );
};

export default MyResume;
