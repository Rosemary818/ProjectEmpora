import React, { useState, useEffect } from 'react';
import './UserProfile.css';

const UserProfile = ({ user, setUser }) => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designationName: '',
    departmentName: '',
    departmentId: '',
    designationId: '',
    employeeCode: '',
    dateOfJoining: '',
    profileImage: '',
    skills: []
  });
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [skills, setSkills] = useState([]); // Employee skills

  const [skillForm, setSkillForm] = useState({
    isOpen: false,
    editIndex: null,
    name: '',
    proficiency: 'Beginner'
  });

  useEffect(() => {
    fetchProfile();
    fetchOptions();
    fetchSkills();
  }, []);

  const fetchOptions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const deptRes = await fetch('http://localhost:5000/api/departments/all', { headers: { 'Authorization': `Bearer ${token}` } });
      const desigRes = await fetch('http://localhost:5000/api/designations', { headers: { 'Authorization': `Bearer ${token}` } });
      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(deptData.data || []);
      }
      if (desigRes.ok) {
        const desigData = await desigRes.json();
        setDesignations(desigData.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/skills/employee', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSkills(data.data);
      }
    } catch (e) {
      console.error('Error fetching skills:', e);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProfileData({
          firstName: data.data.firstName || '',
          lastName: data.data.lastName || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          designationName: data.data.designationName || '',
          departmentName: data.data.departmentName || '',
          departmentId: data.data.departmentId?._id || data.data.departmentId || '',
          designationId: data.data.designationId?._id || data.data.designationId || '',
          employeeCode: data.data.employeeCode || '',
          dateOfJoining: data.data.dateOfJoining ? data.data.dateOfJoining.split('T')[0] : '',
          profileImage: data.data.profileImage || '',
          skills: data.data.skills || []
        });
        if (setUser) {
          setUser(prev => ({ ...prev, ...data.data }));
        }
        localStorage.setItem('user', JSON.stringify(data.data));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Profile updated successfully!');
        if (setUser) {
          setUser(prev => ({ ...prev, ...data.data }));
        }
        localStorage.setItem('user', JSON.stringify(data.data));
        setIsEditingProfile(false); // Return to view mode
      } else {
        setMessage(data.message || 'Error updating profile');
      }
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setProfileData({ ...profileData, profileImage: '' });
  };

  const handleOpenSkillForm = () => {
    setSkillForm({
      isOpen: true,
      editIndex: null,
      name: '',
      proficiency: 'Beginner'
    });
  };

  const handleEditSkill = (index) => {
    const skill = profileData.skills[index];
    setSkillForm({
      isOpen: true,
      editIndex: index,
      name: skill.name,
      proficiency: skill.proficiency
    });
  };

  const handleRemoveSkill = async (index) => {
    const updatedSkills = [...profileData.skills];
    updatedSkills.splice(index, 1);

    // Save to backend immediately
    await saveSkillsToBackend(updatedSkills);
  };

  const handleSaveSkill = async () => {
    if (!skillForm.name.trim()) {
      setMessage('Skill name is required.');
      return;
    }

    let updatedSkills = [...(profileData.skills || [])];

    // Duplicate check
    const normalizedName = skillForm.name.toLowerCase().trim();
    const isDuplicate = updatedSkills.some((s, i) =>
      s.name.toLowerCase().trim() === normalizedName && i !== skillForm.editIndex
    );

    if (isDuplicate) {
      setMessage('This skill has already been added.');
      return;
    }

    if (skillForm.editIndex !== null) {
      updatedSkills[skillForm.editIndex] = {
        name: skillForm.name.trim(),
        proficiency: skillForm.proficiency
      };
    } else {
      updatedSkills.push({
        name: skillForm.name.trim(),
        proficiency: skillForm.proficiency
      });
    }

    await saveSkillsToBackend(updatedSkills);
  };

  const saveSkillsToBackend = async (updatedSkills) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skills: updatedSkills })
      });
      const data = await response.json();
      if (data.success) {
        setProfileData(prev => ({ ...prev, skills: updatedSkills }));
        setSkillForm({ ...skillForm, isOpen: false });
        if (setUser) {
          setUser(prev => ({ ...prev, skills: updatedSkills }));
        }
        localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), skills: updatedSkills }));
      } else {
        setMessage(data.message || 'Error saving skills');
      }
    } catch (error) {
      setMessage('Error saving skills');
    }
  };

  return (
    <div className="shared-profile-view">
      <div className="shared-card">
        <div className="shared-card-header">
          <h2>My Profile</h2>
        </div>
        <div className="shared-card-body">
          {message && (
            <div className={`shared-alert ${message.includes('success') ? 'shared-alert-success' : 'shared-alert-danger'}`}>
              <p>{message}</p>
            </div>
          )}

          {!isEditingProfile ? (
            <div className="shared-profile-details">
              <div className="shared-profile-header-info">
                <div className="shared-profile-photo-preview">
                  {profileData.profileImage ? (
                    <img src={profileData.profileImage} alt="Profile" />
                  ) : (
                    <div className="shared-profile-photo-placeholder">
                      {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="shared-profile-title">
                  <h3>{profileData.firstName} {profileData.lastName}</h3>
                  <p className="shared-text-muted">{profileData.designationName || user?.role || 'Employee'}</p>
                </div>
                <button className="btn btn-primary shared-ml-auto" onClick={() => setIsEditingProfile(true)}>
                  Edit Profile
                </button>
              </div>

              <div className="shared-profile-info-grid">
                <div className="shared-info-item">
                  <span className="shared-info-label">First Name</span>
                  <span className="shared-info-value">{profileData.firstName}</span>
                </div>
                <div className="shared-info-item">
                  <span className="shared-info-label">Last Name</span>
                  <span className="shared-info-value">{profileData.lastName}</span>
                </div>
                <div className="shared-info-item">
                  <span className="shared-info-label">Email Address</span>
                  <span className="shared-info-value">{profileData.email}</span>
                </div>
                <div className="shared-info-item">
                  <span className="shared-info-label">Phone Number</span>
                  <span className="shared-info-value">{profileData.phone || 'Not provided'}</span>
                </div>
                <div className="shared-info-item">
                  <span className="shared-info-label">Department</span>
                  <span className="shared-info-value">{profileData.departmentName || 'Not Assigned'}</span>
                </div>
                <div className="shared-info-item">
                  <span className="shared-info-label">Designation</span>
                  <span className="shared-info-value">{profileData.designationName || 'Not Set'}</span>
                </div>
                <div className="shared-info-item">
                  <span className="shared-info-label">Employee ID</span>
                  <span className="shared-info-value">{profileData.employeeCode || 'Not provided'}</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="shared-profile-form">
              <div className="shared-profile-photo-section">
                <div className="shared-profile-photo-preview">
                  {profileData.profileImage ? (
                    <img src={profileData.profileImage} alt="Profile Preview" />
                  ) : (
                    <div className="shared-profile-photo-placeholder">
                      {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="shared-profile-photo-actions">
                  <label className="btn btn-secondary shared-btn-upload">
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                  </label>
                  {profileData.profileImage && (
                    <button type="button" className="shared-btn-text shared-text-danger" onClick={removeProfileImage}>
                      Remove
                    </button>
                  )}
                  <p className="shared-photo-hint">Recommended: Square image, max 5MB.</p>
                </div>
              </div>

              <div className="shared-form-grid">
                <div className="shared-form-group">
                  <label>First Name</label>
                  <input type="text" value={profileData.firstName} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} required />
                </div>
                <div className="shared-form-group">
                  <label>Last Name</label>
                  <input type="text" value={profileData.lastName} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} required />
                </div>
                <div className="shared-form-group">
                  <label>Email Address</label>
                  <input type="email" value={profileData.email} disabled className="shared-input-disabled" title="Email cannot be changed" />
                </div>
                <div className="shared-form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
                </div>
                <div className="shared-form-group">
                  <label>Department</label>
                  <select
                    value={profileData.departmentId}
                    onChange={(e) => setProfileData({ ...profileData, departmentId: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>
                <div className="shared-form-group">
                  <label>Designation</label>
                  <select
                    value={profileData.designationId}
                    onChange={(e) => setProfileData({ ...profileData, designationId: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  >
                    <option value="">Select Designation</option>
                    {designations.map(d => (
                      <option key={d._id} value={d._id}>{d.designationName}</option>
                    ))}
                  </select>
                </div>
                <div className="shared-form-group">
                  <label>Employee ID</label>
                  <input type="text" value={profileData.employeeCode} disabled onChange={(e) => setProfileData({ ...profileData, employeeCode: e.target.value })} />
                </div>
              </div>

              <div className="shared-form-actions">
                <button type="button" className="btn btn-secondary shared-mr-2" onClick={() => setIsEditingProfile(false)} disabled={isSaving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {user?.role === 'Candidate' ? (
        <div className="shared-card" style={{ marginTop: '20px' }}>
          <div className="shared-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Skills</h2>
            <button className="btn btn-primary" onClick={handleOpenSkillForm}>+ Add Skill</button>
          </div>
          <div className="shared-card-body">
            {skillForm.isOpen && (
              <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#111827', fontSize: '1.25rem' }}>{skillForm.editIndex !== null ? 'Edit Skill' : 'Add Skill'}</h3>
                <div className="shared-form-grid" style={{ marginBottom: '15px' }}>
                  <div className="shared-form-group">
                    <label>Skill Name *</label>
                    <input type="text" value={skillForm.name} onChange={e => setSkillForm({ ...skillForm, name: e.target.value })} placeholder="e.g. React.js" />
                  </div>
                  <div className="shared-form-group">
                    <label>Proficiency</label>
                    <select value={skillForm.proficiency} onChange={e => setSkillForm({ ...skillForm, proficiency: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={handleSaveSkill}>Save Skill</button>
                  <button className="btn btn-secondary" onClick={() => setSkillForm({ ...skillForm, isOpen: false })}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              {profileData.skills && profileData.skills.length > 0 ? profileData.skills.map((skill, index) => (
                <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 16px', background: 'white', flex: '1 1 200px', maxWidth: '300px', position: 'relative', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '1.1rem' }}>{skill.name}</h4>
                  <p style={{ margin: '0', color: '#6b7280', fontSize: '0.875rem' }}>{skill.proficiency}</p>
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: 0, fontSize: '0.875rem', fontWeight: 500 }} onClick={() => handleEditSkill(index)}>Edit</button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, fontSize: '0.875rem', fontWeight: 500 }} onClick={() => handleRemoveSkill(index)}>Remove</button>
                  </div>
                </div>
              )) : (
                <p className="shared-text-muted">No skills added yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="shared-card" style={{ marginTop: '20px' }}>
            <div className="shared-card-header">
              <h2>Professional Skills</h2>
            </div>
            <div className="shared-card-body">
              <div className="shared-profile-info-grid">
                {skills.filter(s => s.skillId?.category !== 'Personal Talents').length > 0 ? (
                  skills.filter(s => s.skillId?.category !== 'Personal Talents').map(s => (
                    <div key={s._id} className="shared-info-item">
                      <span className="shared-info-label">{s.skillId?.name}</span>
                      <span className="shared-info-value">{s.level}</span>
                    </div>
                  ))
                ) : (
                  <p className="shared-text-muted">No professional skills added.</p>
                )}
              </div>
            </div>
          </div>

          <div className="shared-card" style={{ marginTop: '20px' }}>
            <div className="shared-card-header">
              <h2>Personal Talents</h2>
            </div>
            <div className="shared-card-body">
              <div className="shared-profile-info-grid">
                {skills.filter(s => s.skillId?.category === 'Personal Talents').length > 0 ? (
                  skills.filter(s => s.skillId?.category === 'Personal Talents').map(s => (
                    <div key={s._id} className="shared-info-item">
                      <span className="shared-info-label">{s.skillId?.name}</span>
                      <span className="shared-info-value">{s.level}</span>
                    </div>
                  ))
                ) : (
                  <p className="shared-text-muted">No personal talents added.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;
