import React, { useState, useEffect } from 'react';
import '../CareerPortalAdmin/ScheduleInterviewModal.css';

const ScheduleInternalInterviewModal = ({ application, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    round: 'HR Round',
    interviewType: 'Online',
    date: '',
    startTime: '',
    endTime: '',
    interviewer: '',
    interviewerId: '',
    meetingLink: '',
    venue: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    if (e.target.name === 'interviewerId') {
      const selectedManager = managers.find(m => m._id === e.target.value);
      setFormData({
        ...formData,
        interviewerId: e.target.value,
        interviewer: selectedManager ? `${selectedManager.firstName} ${selectedManager.lastName} - ${selectedManager.department} - ${selectedManager.designationId?.designationName || 'Manager'}` : ''
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const [managers, setManagers] = useState([]);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/managers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setManagers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch managers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (formData.endTime <= formData.startTime) {
      return setError('End time must be after start time.');
    }
    if (formData.interviewType === 'Online' && !formData.meetingLink) {
      return setError('Meeting link is required for online interviews.');
    }
    if (formData.interviewType === 'Offline' && !formData.venue) {
      return setError('Venue is required for offline interviews.');
    }

    setLoading(true);
    try {
      const payload = { ...formData };

      const res = await fetch(`http://localhost:5000/api/internal-mobility/hr/applications/${application._id}/interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        onSuccess(data.data);
      } else {
        setError(data.error || 'Failed to schedule interview');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get min date as today for date picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="schedule-modal-overlay">
      <div className="schedule-modal">
        <div className="schedule-modal-header">
          <h2>Schedule Internal Interview</h2>
          <button className="schedule-close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="schedule-modal-content">
            {error && <div style={{ color: '#dc2626', background: '#fee2e2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            
            <div className="schedule-form-row">
              <div>
                <label>Candidate Name</label>
                <input type="text" value={`${application.employeeId?.firstName} ${application.employeeId?.lastName}`} readOnly />
              </div>
              <div>
                <label>Opportunity Title</label>
                <input type="text" value={application.opportunityId?.title} readOnly />
              </div>
            </div>

            <div className="schedule-form-row">
              <div>
                <label>Interview Round</label>
                <select name="round" value={formData.round} onChange={handleChange} required>
                  <option value="HR Round">HR Round</option>
                  <option value="Technical Round">Technical Round</option>
                  <option value="Managerial Round">Managerial Round</option>
                  <option value="Final HR Round">Final HR Round</option>
                </select>
              </div>
              <div>
                <label>Interview Type</label>
                <select name="interviewType" value={formData.interviewType} onChange={handleChange} required>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            </div>

            <div className="schedule-form-row">
              <div>
                <label>Date</label>
                <input type="date" name="date" value={formData.date} min={today} onChange={handleChange} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label>Start Time</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
                </div>
                <div>
                  <label>End Time</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="schedule-form-group">
              <label>Interviewer Name / Designation</label>
              <select name="interviewerId" value={formData.interviewerId} onChange={handleChange} required>
                <option value="">Select a Manager</option>
                {managers.map(manager => (
                  <option key={manager._id} value={manager._id}>
                    {manager.firstName} {manager.lastName} ({manager.department} - {manager.designationId?.designationName || manager.jobTitle || 'Manager'})
                  </option>
                ))}
              </select>
            </div>

            {formData.interviewType === 'Online' ? (
              <div className="schedule-form-group">
                <label>Meeting Link</label>
                <input type="url" name="meetingLink" value={formData.meetingLink} onChange={handleChange} placeholder="https://zoom.us/j/123456" required />
              </div>
            ) : (
              <div className="schedule-form-group">
                <label>Venue</label>
                <input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="Office Location / Room Name" required />
              </div>
            )}

            <div className="schedule-form-group">
              <label>Notes to Candidate (Optional)</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" placeholder="Any specific instructions..." />
            </div>
          </div>

          <div className="schedule-modal-actions">
            <button type="button" className="schedule-btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="schedule-btn-submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleInternalInterviewModal;
