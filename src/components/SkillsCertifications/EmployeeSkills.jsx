import React, { useState, useEffect } from 'react';
import './EmployeeSkills.css';

const EmployeeSkills = ({ user }) => {
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Skill Form State
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillForm, setSkillForm] = useState({ id: null, name: '', level: 'Beginner', category: 'Professional Skills' });
  
  // Cert Form State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certForm, setCertForm] = useState({
    id: null,
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    certificateFile: null
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [skillsRes, certsRes] = await Promise.all([
        fetch('http://localhost:5000/api/skills/employee', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch('http://localhost:5000/api/certifications/employee', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        })
      ]);

      const skillsData = await skillsRes.json();
      const certsData = await certsRes.json();

      if (skillsRes.ok) setSkills(skillsData.data);
      if (certsRes.ok) setCertifications(certsData.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (skillForm.id) {
        res = await fetch(`http://localhost:5000/api/skills/employee/${skillForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({ level: skillForm.level })
        });
      } else {
        res = await fetch('http://localhost:5000/api/skills/employee', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({ skillName: skillForm.name, level: skillForm.level, category: skillForm.category })
        });
      }
      
      const data = await res.json();
      if (res.ok) {
        setIsSkillModalOpen(false);
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error saving skill');
    }
  };

  const handleSkillDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/skills/employee/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      alert('Error deleting skill');
    }
  };

  const handleCertSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', certForm.name);
      formData.append('issuingOrganization', certForm.issuingOrganization);
      formData.append('issueDate', certForm.issueDate);
      if (certForm.expiryDate) formData.append('expiryDate', certForm.expiryDate);
      if (certForm.credentialId) formData.append('credentialId', certForm.credentialId);
      if (certForm.credentialUrl) formData.append('credentialUrl', certForm.credentialUrl);
      if (certForm.certificateFile) formData.append('certificate', certForm.certificateFile);

      let url = 'http://localhost:5000/api/certifications';
      let method = 'POST';
      if (certForm.id) {
        url += `/${certForm.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setIsCertModalOpen(false);
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error saving certification');
    }
  };

  const handleCertDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/certifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      alert('Error deleting certification');
    }
  };

  const openSkillModal = (skill = null) => {
    if (skill) {
      setSkillForm({ id: skill._id, name: skill.skillId.name, level: skill.level, category: skill.skillId?.category || 'Professional Skills' });
    } else {
      setSkillForm({ id: null, name: '', level: 'Beginner', category: 'Professional Skills' });
    }
    setIsSkillModalOpen(true);
  };

  const openCertModal = (cert = null) => {
    if (cert) {
      setCertForm({
        id: cert._id,
        name: cert.name,
        issuingOrganization: cert.issuingOrganization,
        issueDate: new Date(cert.issueDate).toISOString().split('T')[0],
        expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '',
        credentialId: cert.credentialId || '',
        credentialUrl: cert.credentialUrl || '',
        certificateFile: null
      });
    } else {
      setCertForm({
        id: null,
        name: '',
        issuingOrganization: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: '',
        certificateFile: null
      });
    }
    setIsCertModalOpen(true);
  };

  if (loading) return <div className="skills-loading">Loading Skills & Certifications...</div>;
  if (error) return <div className="skills-error">{error}</div>;

  const professionalSkills = skills.filter(s => s.skillId?.category !== 'Personal Talents');
  const personalTalents = skills.filter(s => s.skillId?.category === 'Personal Talents');

  return (
    <div className="skills-container">
      <div className="skills-header">
        <h2>My Skills & Certifications</h2>
      </div>

      {/* Professional Skills Section */}
      <section className="skills-section">
        <div className="section-header">
          <h3>Professional Skills</h3>
          <button className="btn-primary" onClick={() => openSkillModal()}>
            + Add Skill / Talent
          </button>
        </div>
        
        <div className="skills-grid">
          {professionalSkills.length > 0 ? professionalSkills.map(skill => (
            <div key={skill._id} className="skill-card">
              <div className="skill-info">
                <h4>{skill.skillId?.name}</h4>
                <span className={`skill-badge level-${skill.level.toLowerCase()}`}>{skill.level}</span>
              </div>
              <div className="skill-actions">
                <button className="icon-btn edit" onClick={() => openSkillModal(skill)}>✎</button>
                <button className="icon-btn delete" onClick={() => handleSkillDelete(skill._id)}>×</button>
              </div>
            </div>
          )) : (
            <p className="no-data">No professional skills added yet.</p>
          )}
        </div>
      </section>

      {/* Personal Talents Section */}
      <section className="skills-section" style={{ marginTop: '2rem' }}>
        <div className="section-header">
          <h3>Personal Talents</h3>
        </div>
        
        <div className="skills-grid">
          {personalTalents.length > 0 ? personalTalents.map(skill => (
            <div key={skill._id} className="skill-card">
              <div className="skill-info">
                <h4>{skill.skillId?.name}</h4>
                <span className={`skill-badge level-${skill.level.toLowerCase()}`}>{skill.level}</span>
              </div>
              <div className="skill-actions">
                <button className="icon-btn edit" onClick={() => openSkillModal(skill)}>✎</button>
                <button className="icon-btn delete" onClick={() => handleSkillDelete(skill._id)}>×</button>
              </div>
            </div>
          )) : (
            <p className="no-data">No personal talents added yet.</p>
          )}
        </div>
      </section>

      {/* Certifications Section */}
      <section className="skills-section">
        <div className="section-header">
          <h3>Certifications</h3>
          <button className="btn-primary" onClick={() => openCertModal()}>
            + Add Certification
          </button>
        </div>

        <div className="table-responsive">
          <table className="certs-table">
            <thead>
              <tr>
                <th>Certification Name</th>
                <th>Issuing Organization</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certifications.length > 0 ? certifications.map(cert => (
                <tr key={cert._id}>
                  <td>
                    <div className="cert-name-cell">
                      {cert.name}
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="cert-link">
                          🔗
                        </a>
                      )}
                    </div>
                  </td>
                  <td>{cert.issuingOrganization}</td>
                  <td>{new Date(cert.issueDate).toLocaleDateString()}</td>
                  <td>{cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : 'No Expiry'}</td>
                  <td>
                    <span className={`status-badge ${cert.status.toLowerCase()}`}>
                      {cert.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {cert.certificateFile && (
                      <a href={`http://localhost:5000${cert.certificateFile}`} target="_blank" rel="noopener noreferrer" className="icon-btn view" title="View Certificate">
                        👁️
                      </a>
                    )}
                    <button className="icon-btn edit" onClick={() => openCertModal(cert)} title="Edit">✎</button>
                    <button className="icon-btn delete" onClick={() => handleCertDelete(cert._id)} title="Delete">×</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="no-data">No certifications added yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Skill Modal */}
      {isSkillModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{skillForm.id ? 'Edit Skill' : 'Add Skill'}</h2>
              <button className="close-btn" onClick={() => setIsSkillModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSkillSubmit}>
              <div className="form-group">
                <label>Skill Name</label>
                <input 
                  type="text" 
                  value={skillForm.name} 
                  onChange={(e) => setSkillForm({...skillForm, name: e.target.value})}
                  required
                  disabled={!!skillForm.id} // Don't allow changing name if editing
                  placeholder="e.g. React, Python, Project Management"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({...skillForm, category: e.target.value})}
                  disabled={!!skillForm.id} // Don't allow changing category of an existing skill
                >
                  <option value="Professional Skills">Professional Skills</option>
                  <option value="Personal Talents">Personal Talents</option>
                </select>
              </div>
              <div className="form-group">
                <label>Proficiency Level</label>
                <select 
                  value={skillForm.level}
                  onChange={(e) => setSkillForm({...skillForm, level: e.target.value})}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsSkillModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Skill</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certification Modal */}
      {isCertModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{certForm.id ? 'Edit Certification' : 'Add Certification'}</h2>
              <button className="close-btn" onClick={() => setIsCertModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCertSubmit}>
              <div className="form-group">
                <label>Certification Name *</label>
                <input 
                  type="text" 
                  value={certForm.name} 
                  onChange={(e) => setCertForm({...certForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Issuing Organization *</label>
                <input 
                  type="text" 
                  value={certForm.issuingOrganization} 
                  onChange={(e) => setCertForm({...certForm, issuingOrganization: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Issue Date *</label>
                  <input 
                    type="date" 
                    value={certForm.issueDate} 
                    onChange={(e) => setCertForm({...certForm, issueDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date (Optional)</label>
                  <input 
                    type="date" 
                    value={certForm.expiryDate} 
                    onChange={(e) => setCertForm({...certForm, expiryDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Credential ID (Optional)</label>
                  <input 
                    type="text" 
                    value={certForm.credentialId} 
                    onChange={(e) => setCertForm({...certForm, credentialId: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Credential URL (Optional)</label>
                  <input 
                    type="url" 
                    value={certForm.credentialUrl} 
                    onChange={(e) => setCertForm({...certForm, credentialUrl: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Upload Certificate (PDF, JPG, PNG)</label>
                <input 
                  type="file" 
                  accept=".pdf, .jpg, .jpeg, .png"
                  onChange={(e) => setCertForm({...certForm, certificateFile: e.target.files[0]})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsCertModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Certification</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSkills;
