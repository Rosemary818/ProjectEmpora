import React, { useState, useEffect } from 'react';

const JobForm = ({ job, onClose, onSave }) => {
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    departmentId: '',
    employmentType: 'Full-time',
    experienceRequired: '',
    vacancies: 1,
    location: '',
    salaryRange: '',
    requiredSkills: '',
    description: '',
    responsibilities: '',
    qualifications: '',
    deadline: '',
    status: 'Draft',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (job) {
      setFormData({
        ...job,
        departmentId: job.departmentId?._id || job.departmentId,
        requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : job.requiredSkills,
        deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
      });
    }
  }, [job]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/departments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (err) {
      console.error('Error fetching departments', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s)
    };

    const url = job ? `http://localhost:5000/api/jobs/${job._id}` : 'http://localhost:5000/api/jobs';
    const method = job ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        onSave();
      } else {
        alert(data.error || 'Failed to save job');
      }
    } catch (err) {
      console.error('Error saving job', err);
      alert('Network error while saving job');
    }
  };

  return (
    <div className="hrcp-modal-overlay">
      <div className="hrcp-modal">
        <div className="hrcp-modal-header">
          <h2>{job ? 'Edit Job' : 'Create Job'}</h2>
          <button className="hrcp-modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="hrcp-modal-body">
            <div className="hrcp-form-grid">
              
              <div className="hrcp-form-group full-width">
                <label>Job Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
              </div>

              <div className="hrcp-form-group">
                <label>Department</label>
                <select name="departmentId" value={formData.departmentId} onChange={handleChange} required>
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
                  ))}
                </select>
              </div>

              <div className="hrcp-form-group">
                <label>Employment Type</label>
                <select name="employmentType" value={formData.employmentType} onChange={handleChange} required>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div className="hrcp-form-group">
                <label>Experience Required</label>
                <input type="text" name="experienceRequired" value={formData.experienceRequired} onChange={handleChange} placeholder="e.g. 2-4 Years" required />
              </div>

              <div className="hrcp-form-group">
                <label>Vacancies</label>
                <input type="number" name="vacancies" value={formData.vacancies} onChange={handleChange} min="1" required />
              </div>

              <div className="hrcp-form-group">
                <label>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required />
              </div>

              <div className="hrcp-form-group">
                <label>Salary Range (Optional)</label>
                <input type="text" name="salaryRange" value={formData.salaryRange} onChange={handleChange} placeholder="e.g. $80k - $100k" />
              </div>

              <div className="hrcp-form-group">
                <label>Application Deadline</label>
                <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required />
              </div>

              <div className="hrcp-form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} required>
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div className="hrcp-form-group full-width">
                <label>Required Skills (Comma separated)</label>
                <input type="text" name="requiredSkills" value={formData.requiredSkills} onChange={handleChange} placeholder="React, Node.js, MongoDB" required />
              </div>

              <div className="hrcp-form-group full-width">
                <label>Job Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required></textarea>
              </div>

              <div className="hrcp-form-group full-width">
                <label>Responsibilities</label>
                <textarea name="responsibilities" value={formData.responsibilities} onChange={handleChange} rows="3" required></textarea>
              </div>

              <div className="hrcp-form-group full-width">
                <label>Qualifications</label>
                <textarea name="qualifications" value={formData.qualifications} onChange={handleChange} rows="3" required></textarea>
              </div>
              
            </div>
          </div>
          <div className="hrcp-modal-footer">
            <button type="button" className="hrcp-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="hrcp-btn-primary">Save Job</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;
