import React, { useState, useEffect } from 'react';
import './EmployeeSkills.css'; // Reusing styles

const ManagerTeamSkills = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberLoading, setMemberLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/user/manager-dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTeamMembers(data.data.teamMembers);
      } else {
        setError('Failed to fetch team members');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = async (member) => {
    setSelectedMember(member);
    setMemberLoading(true);
    try {
      const [skillsRes, certsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/skills/employee/${member._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch(`http://localhost:5000/api/certifications/employee/${member._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        })
      ]);

      const skillsData = await skillsRes.json();
      const certsData = await certsRes.json();

      if (skillsRes.ok) setSkills(skillsData.data);
      if (certsRes.ok) setCertifications(certsData.data);
    } catch (err) {
      alert('Failed to fetch data for the selected member.');
    } finally {
      setMemberLoading(false);
    }
  };

  if (loading) return <div className="skills-loading">Loading Team...</div>;
  if (error) return <div className="skills-error">{error}</div>;

  return (
    <div className="skills-container" style={{ display: 'flex', gap: '24px' }}>
      {/* Sidebar for Team Members */}
      <div style={{ width: '300px', background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb', height: 'fit-content' }}>
        <h3 style={{ marginTop: 0, borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>Team Members</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {teamMembers.length > 0 ? teamMembers.map(member => (
            <li 
              key={member._id}
              onClick={() => handleMemberSelect(member)}
              style={{
                padding: '12px',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer',
                backgroundColor: selectedMember?._id === member._id ? '#f3f4f6' : 'transparent',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div style={{ width: '36px', height: '36px', background: '#bfdbfe', color: '#1e3a8a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {member.profileImage ? <img src={member.profileImage} alt="" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} /> : `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: '500', color: '#111827' }}>{member.firstName} {member.lastName}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{member.designationName || 'Employee'}</p>
              </div>
            </li>
          )) : (
            <p className="no-data">No team members found.</p>
          )}
        </ul>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1 }}>
        {!selectedMember ? (
          <div style={{ background: 'white', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#6b7280', border: '1px solid #e5e7eb' }}>
            Select a team member to view their skills and certifications.
          </div>
        ) : memberLoading ? (
          <div style={{ background: 'white', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#6b7280', border: '1px solid #e5e7eb' }}>
            Loading data...
          </div>
        ) : (
          <div>
            <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#111827' }}>
              Skills & Certifications: {selectedMember.firstName} {selectedMember.lastName}
            </h2>
            
            {/* Professional Skills Section */}
            <section className="skills-section">
              <div className="section-header">
                <h3>Professional Skills</h3>
              </div>
              
              <div className="skills-grid">
                {skills.filter(s => s.skillId?.category !== 'Personal Talents').length > 0 ? skills.filter(s => s.skillId?.category !== 'Personal Talents').map(skill => (
                  <div key={skill._id} className="skill-card">
                    <div className="skill-info">
                      <h4>{skill.skillId?.name}</h4>
                      <span className={`skill-badge level-${skill.level.toLowerCase()}`}>{skill.level}</span>
                    </div>
                  </div>
                )) : (
                  <p className="no-data">No professional skills recorded.</p>
                )}
              </div>
            </section>

            {/* Personal Talents Section */}
            <section className="skills-section">
              <div className="section-header">
                <h3>Personal Talents</h3>
              </div>
              
              <div className="skills-grid">
                {skills.filter(s => s.skillId?.category === 'Personal Talents').length > 0 ? skills.filter(s => s.skillId?.category === 'Personal Talents').map(skill => (
                  <div key={skill._id} className="skill-card">
                    <div className="skill-info">
                      <h4>{skill.skillId?.name}</h4>
                      <span className={`skill-badge level-${skill.level.toLowerCase()}`}>{skill.level}</span>
                    </div>
                  </div>
                )) : (
                  <p className="no-data">No personal talents recorded.</p>
                )}
              </div>
            </section>

            {/* Certifications Section */}
            <section className="skills-section">
              <div className="section-header">
                <h3>Certifications</h3>
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
                      <th>Certificate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certifications.length > 0 ? certifications.map(cert => (
                      <tr key={cert._id}>
                        <td>
                          <div className="cert-name-cell">
                            {cert.name}
                            {cert.credentialUrl && (
                              <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="cert-link">🔗</a>
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
                        <td>
                          {cert.certificateFile && (
                            <a href={`http://localhost:5000${cert.certificateFile}`} target="_blank" rel="noopener noreferrer" className="icon-btn view" title="View Certificate">
                              👁️ View
                            </a>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="no-data">No certifications recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerTeamSkills;
