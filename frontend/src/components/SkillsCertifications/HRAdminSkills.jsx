import React, { useState, useEffect } from 'react';
import './EmployeeSkills.css'; // Reusing styles

const HRAdminSkills = () => {
  const [activeTab, setActiveTab] = useState('Employee Skills');
  
  // Data States
  const [skills, setSkills] = useState([]);
  const [employeeSkills, setEmployeeSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  
  // Filter States
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('');
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectForm, setRejectForm] = useState({ id: null, reason: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'Employee Skills') {
      fetchEmployeeSkills();
    } else if (activeTab === 'Pending Certifications') {
      fetchCertifications('Pending');
    } else if (activeTab === 'Verified Certifications') {
      fetchCertifications('Verified');
    } else if (activeTab === 'Rejected Certifications') {
      fetchCertifications('Rejected');
    } else if (activeTab === 'Expiring Certifications') {
      fetchCertifications('Expiring');
    }
  }, [activeTab, selectedSkillFilter]);

  const fetchInitialData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/skills', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSkills(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch skills list');
    }
  };

  const fetchEmployeeSkills = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/skills/all-employee-skills';
      if (selectedSkillFilter) {
        url += `?skillId=${selectedSkillFilter}`;
      }
      const res = await fetch(url, {
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

  const fetchCertifications = async (type) => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/certifications/all';
      if (type === 'Expiring') {
        url += '?expiring=true';
      } else {
        url += `?status=${type}`; // type is Pending, Verified, or Rejected
      }
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCertifications(data.data);
      } else {
        setError('Failed to fetch certifications');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCert = async (id, status, reason = '') => {
    try {
      const res = await fetch(`http://localhost:5000/api/certifications/${id}/verify`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
        },
        body: JSON.stringify({ status, rejectionReason: reason })
      });
      
      if (res.ok) {
        setIsRejectModalOpen(false);
        // Refresh the current tab
        fetchCertifications(activeTab === 'Expiring Certifications' ? 'Expiring' : activeTab.split(' ')[0]);
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const openRejectModal = (id) => {
    setRejectForm({ id, reason: '' });
    setIsRejectModalOpen(true);
  };

  return (
    <div className="skills-container">
      <div className="skills-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Employee Skills & Certifications</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
        <button 
          onClick={() => setActiveTab('Employee Skills')}
          style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: activeTab === 'Employee Skills' ? '600' : '400', color: activeTab === 'Employee Skills' ? '#388087' : '#6b7280', borderBottom: activeTab === 'Employee Skills' ? '2px solid #388087' : 'none', paddingBottom: '8px', cursor: 'pointer' }}
        >
          Employee Skills
        </button>
        <button 
          onClick={() => setActiveTab('Pending Certifications')}
          style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: activeTab === 'Pending Certifications' ? '600' : '400', color: activeTab === 'Pending Certifications' ? '#388087' : '#6b7280', borderBottom: activeTab === 'Pending Certifications' ? '2px solid #388087' : 'none', paddingBottom: '8px', cursor: 'pointer' }}
        >
          Pending Verification
        </button>
        <button 
          onClick={() => setActiveTab('Verified Certifications')}
          style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: activeTab === 'Verified Certifications' ? '600' : '400', color: activeTab === 'Verified Certifications' ? '#388087' : '#6b7280', borderBottom: activeTab === 'Verified Certifications' ? '2px solid #388087' : 'none', paddingBottom: '8px', cursor: 'pointer' }}
        >
          Verified Certifications
        </button>
        <button 
          onClick={() => setActiveTab('Rejected Certifications')}
          style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: activeTab === 'Rejected Certifications' ? '600' : '400', color: activeTab === 'Rejected Certifications' ? '#388087' : '#6b7280', borderBottom: activeTab === 'Rejected Certifications' ? '2px solid #388087' : 'none', paddingBottom: '8px', cursor: 'pointer' }}
        >
          Rejected Certifications
        </button>
        <button 
          onClick={() => setActiveTab('Expiring Certifications')}
          style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: activeTab === 'Expiring Certifications' ? '600' : '400', color: activeTab === 'Expiring Certifications' ? '#388087' : '#6b7280', borderBottom: activeTab === 'Expiring Certifications' ? '2px solid #388087' : 'none', paddingBottom: '8px', cursor: 'pointer' }}
        >
          Expiring Soon
        </button>
      </div>

      {error && <div className="skills-error">{error}</div>}

      {/* Employee Skills Tab */}
      {activeTab === 'Employee Skills' && (
        <section className="skills-section">
          <div className="section-header">
            <h3>Employee Skills Database</h3>
            <div>
              <select 
                value={selectedSkillFilter} 
                onChange={(e) => setSelectedSkillFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
              >
                <option value="">All Skills</option>
                {skills.map(skill => (
                  <option key={skill._id} value={skill._id}>{skill.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Loading...</div>
          ) : (
            <>
              <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Professional Skills</h4>
              <div className="table-responsive">
                <table className="certs-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Skill</th>
                      <th>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeSkills.filter(empSkill => empSkill.skillId?.category !== 'Personal Talents').length > 0 ? employeeSkills.filter(empSkill => empSkill.skillId?.category !== 'Personal Talents').map(empSkill => (
                      <tr key={empSkill._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', background: '#bfdbfe', color: '#1e3a8a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                              {empSkill.userId?.firstName?.charAt(0)}{empSkill.userId?.lastName?.charAt(0)}
                            </div>
                            <span style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{empSkill.userId?.firstName} {empSkill.userId?.lastName}</span>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID: {empSkill.userId?.employeeCode || 'N/A'}</span>
                            </span>
                          </div>
                        </td>
                        <td>{empSkill.userId?.departmentName || 'N/A'}</td>
                        <td>{empSkill.userId?.designationName || 'N/A'}</td>
                        <td><strong>{empSkill.skillId?.name}</strong></td>
                        <td>
                          <span className={`skill-badge level-${empSkill.level.toLowerCase()}`}>{empSkill.level}</span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="no-data">No employees found with professional skills.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <h4 style={{ marginTop: '30px', marginBottom: '10px' }}>Personal Talents</h4>
              <div className="table-responsive">
                <table className="certs-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Talent</th>
                      <th>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeSkills.filter(empSkill => empSkill.skillId?.category === 'Personal Talents').length > 0 ? employeeSkills.filter(empSkill => empSkill.skillId?.category === 'Personal Talents').map(empSkill => (
                      <tr key={empSkill._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', background: '#bfdbfe', color: '#1e3a8a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                              {empSkill.userId?.firstName?.charAt(0)}{empSkill.userId?.lastName?.charAt(0)}
                            </div>
                            <span style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{empSkill.userId?.firstName} {empSkill.userId?.lastName}</span>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID: {empSkill.userId?.employeeCode || 'N/A'}</span>
                            </span>
                          </div>
                        </td>
                        <td>{empSkill.userId?.departmentName || 'N/A'}</td>
                        <td>{empSkill.userId?.designationName || 'N/A'}</td>
                        <td><strong>{empSkill.skillId?.name}</strong></td>
                        <td>
                          <span className={`skill-badge level-${empSkill.level.toLowerCase()}`}>{empSkill.level}</span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="no-data">No employees found with personal talents.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

      {/* Certifications Tabs */}
      {(activeTab === 'Pending Certifications' || activeTab === 'Verified Certifications' || activeTab === 'Rejected Certifications' || activeTab === 'Expiring Certifications') && (
        <section className="skills-section">
          <div className="section-header">
            <h3>{activeTab}</h3>
            {activeTab === 'Pending Certifications' && (
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Showing Pending Certifications</span>
            )}
          </div>

          {loading ? (
             <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Loading...</div>
          ) : (
            <div className="table-responsive">
              <table className="certs-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department & Designation</th>
                    <th>Certification</th>
                    <th>Dates</th>
                    {activeTab === 'Rejected Certifications' && (
                      <th>Rejected Details</th>
                    )}
                    <th>Certificate</th>
                    {activeTab === 'Pending Certifications' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {certifications.length > 0 ? certifications.map(cert => (
                    <tr key={cert._id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '500', color: '#111827' }}>{cert.userId?.firstName} {cert.userId?.lastName}</span>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID: {cert.userId?.employeeCode || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{cert.userId?.departmentName || 'N/A'}</span>
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{cert.userId?.designationName || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="cert-name-cell" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                          <span style={{ fontWeight: '500' }}>{cert.name}</span>
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{cert.issuingOrganization}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                          <span>Iss: {new Date(cert.issueDate).toLocaleDateString()}</span>
                          <span style={{ color: activeTab === 'Expiring Certifications' ? '#dc2626' : 'inherit', fontWeight: activeTab === 'Expiring Certifications' ? '600' : 'normal' }}>
                            Exp: {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : 'No Expiry'}
                          </span>
                        </div>
                      </td>
                      {activeTab === 'Rejected Certifications' && (
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                            <span style={{ color: '#b91c1c' }}>{cert.rejectionReason}</span>
                            <span style={{ color: '#6b7280' }}>By: {cert.verifiedBy?.firstName} {cert.verifiedBy?.lastName} on {new Date(cert.verifiedDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                      )}
                      <td>
                        {cert.certificateFile ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <a href={`http://localhost:5000${cert.certificateFile}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '4px 8px' }}>
                              View
                            </a>
                            <a href={`http://localhost:5000${cert.certificateFile}`} download target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '4px 8px' }}>
                              Download
                            </a>
                          </div>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No File</span>
                        )}
                      </td>
                      {activeTab === 'Pending Certifications' && (
                        <td className="actions-cell">
                          <button className="icon-btn view" onClick={() => handleVerifyCert(cert._id, 'Verified')} title="Verify">✓</button>
                          <button className="icon-btn delete" onClick={() => openRejectModal(cert._id)} title="Reject">×</button>
                        </td>
                      )}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="no-data">No certifications found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Reject Certification</h2>
              <button className="close-btn" onClick={() => setIsRejectModalOpen(false)}>×</button>
            </div>
            <div style={{ padding: '24px' }}>
              <div className="form-group">
                <label>Reason for Rejection *</label>
                <textarea 
                  value={rejectForm.reason} 
                  onChange={(e) => setRejectForm({...rejectForm, reason: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', minHeight: '100px' }}
                  placeholder="Please provide a reason to the employee..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsRejectModalOpen(false)}>Cancel</button>
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ backgroundColor: '#dc2626' }}
                  onClick={() => handleVerifyCert(rejectForm.id, 'Rejected', rejectForm.reason)}
                  disabled={!rejectForm.reason.trim()}
                >
                  Reject Certification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HRAdminSkills;
