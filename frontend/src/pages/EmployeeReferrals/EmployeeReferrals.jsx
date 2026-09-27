import React, { useState, useEffect } from 'react';
import { validateIndianMobileNumber } from '../../utils/validation';

import './EmployeeReferrals.css';

const EmployeeReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [summary, setSummary] = useState({ totalReferrals: 0, pending: 0, hired: 0 });
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    candidateName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    departmentId: '',
    experience: '',
    currentCompany: '',
    expectedCTC: '',
    linkedIn: '',
    notes: ''
  });
  const [resume, setResume] = useState(null);

  useEffect(() => {
    fetchReferrals();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/departments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        const activeDepts = data.data.filter(d => d.status === 'Active');
        activeDepts.sort((a, b) => a.departmentName.localeCompare(b.departmentName));
        setDepartments(activeDepts);
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const fetchReferrals = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/referrals/my', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch');
      setReferrals(data.data.referrals);
      setSummary(data.data.summary);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      showToast(error.message || 'Failed to load referrals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!resume) {
      showToast('Please upload a resume', 'error');
      setSubmitting(false);
      return;
    }

    const phoneError = validateIndianMobileNumber(formData.phone);
    if (phoneError) {
      showToast(phoneError, 'error');
      setSubmitting(false);
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    data.append('resume', resume);

    try {
      const response = await fetch('http://localhost:5000/api/referrals', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: data
      });
      
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || 'Failed to submit referral');
      
      showToast('Referral submitted successfully!');
      setIsModalOpen(false);
      setFormData({
        candidateName: '', email: '', phone: '', position: '', department: '', departmentId: '',
        experience: '', currentCompany: '', expectedCTC: '', linkedIn: '', notes: ''
      });
      setResume(null);
      fetchReferrals(); // Refresh the list
    } catch (error) {
      showToast(error.message || 'Failed to submit referral', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="employee-referrals-container">
      {toastMessage && (
        <div className={`toast-notification ${toastMessage.type}`}>
          {toastMessage.message}
        </div>
      )}

      <div className="referrals-header">
        <h2>Employee Referrals</h2>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          + Refer a Candidate
        </button>
      </div>

      <div className="referrals-dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Referrals</h3>
          <p className="card-value">{summary.totalReferrals}</p>
        </div>
        <div className="dashboard-card pending-card">
          <h3>Pending</h3>
          <p className="card-value">{summary.pending}</p>
        </div>
        <div className="dashboard-card hired-card">
          <h3>Hired</h3>
          <p className="card-value">{summary.hired}</p>
        </div>
      </div>

      <div className="my-referrals-section">
        <h3>My Referrals</h3>
        {referrals.length === 0 ? (
          <p className="no-referrals">You haven't referred any candidates yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="referrals-table">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Referred Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map(referral => (
                  <tr key={referral._id}>
                    <td>{referral.candidateName}</td>
                    <td>{referral.position}</td>
                    <td>{referral.department}</td>
                    <td>
                      <span className={`status-badge ${referral.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {referral.status}
                      </span>
                    </td>
                    <td>{new Date(referral.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content referral-modal">
            <div className="modal-header">
              <h2>Refer a Candidate</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Candidate Name *</label>
                  <input type="text" name="candidateName" value={formData.candidateName} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Position Applying For *</label>
                  <input type="text" name="position" value={formData.position} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select 
                    name="departmentId" 
                    value={formData.departmentId} 
                    onChange={(e) => {
                      const selectedDept = departments.find(d => d._id === e.target.value);
                      setFormData({
                        ...formData,
                        departmentId: selectedDept ? selectedDept._id : '',
                        department: selectedDept ? selectedDept.departmentName : ''
                      });
                    }} 
                    required
                  >
                    <option value="">{departments.length === 0 ? "No departments available" : "Select a department"}</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Years of Experience *</label>
                  <input type="number" name="experience" value={formData.experience} onChange={handleInputChange} min="0" required />
                </div>
                <div className="form-group">
                  <label>Current Company</label>
                  <input type="text" name="currentCompany" value={formData.currentCompany} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Expected CTC (Optional)</label>
                  <input type="text" name="expectedCTC" value={formData.expectedCTC} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>LinkedIn Profile (Optional)</label>
                  <input type="url" name="linkedIn" value={formData.linkedIn} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Resume (PDF/DOC) *</label>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} required />
                </div>
                <div className="form-group full-width">
                  <label>Notes (Optional)</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3"></textarea>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Referral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeReferrals;
