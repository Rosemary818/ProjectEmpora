import React, { useState, useEffect } from 'react';
import './TrainingManagement.css';

const HRTrainingManagement = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    trainer: '',
    duration: '',
    mode: 'Online',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/trainings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTrainings(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load trainings');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async (trainingId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/trainings/${trainingId}/enrollments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEnrollmentData(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/trainings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowCreateModal(false);
        setFormData({
          title: '', description: '', category: 'Technical',
          trainer: '', duration: '', mode: 'Online', startDate: '', endDate: ''
        });
        fetchTrainings();
      } else {
        const err = await res.json();
        alert(err.message || 'Error creating training');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`http://localhost:5000/api/trainings/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchTrainings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openDetails = (training) => {
    setSelectedTraining(training);
    setEnrollmentData(null);
    setShowDetailsModal(true);
    fetchEnrollments(training._id);
  };

  if (loading) return <div className="tm-loading-state">Loading...</div>;
  if (error) return <div className="tm-error-state">{error}</div>;

  return (
    <div className="tm-container">
      <div className="tm-header">
        <h2>Training & Learning</h2>
        <p>Manage company training programs</p>
      </div>

      <div className="tm-actions">
        <button className="tm-btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create Training
        </button>
      </div>

      {trainings.length === 0 ? (
        <div className="tm-empty-state">No training programs created yet.</div>
      ) : (
        <div className="tm-grid">
          {trainings.map(t => (
            <div key={t._id} className="tm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>{t.title}</h3>
                <span className={`tm-badge tm-badge-${t.status.toLowerCase()}`}>{t.status}</span>
              </div>
              <div className="tm-meta">
                <span>{t.category}</span>
                <span>{t.mode}</span>
                <span>{t.duration}</span>
              </div>
              <p>{t.description}</p>
              
              <div className="tm-card-footer">
                <button className="tm-btn-secondary" onClick={() => openDetails(t)}>
                  View Details & Enrollments
                </button>
                <button 
                  className="tm-btn-secondary" 
                  onClick={() => toggleStatus(t._id, t.status)}
                >
                  {t.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="tm-modal-overlay">
          <div className="tm-modal-content">
            <div className="tm-modal-header">
              <h2>Create New Training</h2>
              <button className="tm-modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <div className="tm-modal-body">
              <form onSubmit={handleCreateSubmit} id="createTrainingForm">
                <div className="tm-form-group">
                  <label>Training Title *</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="tm-form-group">
                  <label>Description *</label>
                  <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="tm-form-row">
                  <div className="tm-form-group">
                    <label>Category *</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option>Technical</option>
                      <option>Soft Skills</option>
                      <option>Leadership</option>
                      <option>Compliance</option>
                      <option>Security</option>
                      <option>Communication</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="tm-form-group">
                    <label>Training Mode *</label>
                    <select value={formData.mode} onChange={e => setFormData({...formData, mode: e.target.value})}>
                      <option>Online</option>
                      <option>Offline</option>
                      <option>Hybrid</option>
                    </select>
                  </div>
                </div>
                <div className="tm-form-row">
                  <div className="tm-form-group">
                    <label>Trainer *</label>
                    <input required value={formData.trainer} onChange={e => setFormData({...formData, trainer: e.target.value})} />
                  </div>
                  <div className="tm-form-group">
                    <label>Duration *</label>
                    <input required placeholder="e.g. 4 Hours" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                  </div>
                </div>
                <div className="tm-form-row">
                  <div className="tm-form-group">
                    <label>Start Date</label>
                    <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div className="tm-form-group">
                    <label>End Date</label>
                    <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                </div>
              </form>
            </div>
            <div className="tm-modal-footer">
              <button className="tm-btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="tm-btn-primary" type="submit" form="createTrainingForm">Create Training</button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedTraining && (
        <div className="tm-modal-overlay">
          <div className="tm-modal-content wide">
            <div className="tm-modal-header">
              <h2>{selectedTraining.title}</h2>
              <button className="tm-modal-close" onClick={() => setShowDetailsModal(false)}>&times;</button>
            </div>
            <div className="tm-modal-body">
              <div className="tm-meta">
                <span>Trainer: {selectedTraining.trainer}</span>
                <span>Mode: {selectedTraining.mode}</span>
                {selectedTraining.startDate && <span>Starts: {new Date(selectedTraining.startDate).toLocaleDateString()}</span>}
              </div>
              
              <h3 style={{marginTop: '1.5rem', marginBottom: '1rem'}}>Enrollment Summary</h3>
              {enrollmentData ? (
                <>
                  <div className="tm-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '2rem' }}>
                    <div className="tm-card" style={{ padding: '1rem', textAlign: 'center' }}>
                      <h4 style={{ margin: 0, color: '#6b7280' }}>Total Enrolled</h4>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0 0', color: '#111827' }}>{enrollmentData.totalEnrolled}</p>
                    </div>
                    <div className="tm-card" style={{ padding: '1rem', textAlign: 'center' }}>
                      <h4 style={{ margin: 0, color: '#6b7280' }}>In Progress</h4>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0 0', color: '#d97706' }}>{enrollmentData.inProgress}</p>
                    </div>
                    <div className="tm-card" style={{ padding: '1rem', textAlign: 'center' }}>
                      <h4 style={{ margin: 0, color: '#6b7280' }}>Completed</h4>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0 0', color: '#16a34a' }}>{enrollmentData.completed}</p>
                    </div>
                  </div>

                  <h4>Employee List</h4>
                  {enrollmentData.enrollments.length > 0 ? (
                    <div className="tm-table-container">
                      <table className="tm-table">
                        <thead>
                          <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Enrolled On</th>
                            <th>Completed On</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrollmentData.enrollments.map(en => (
                            <tr key={en._id}>
                              <td>{en.employeeId?.firstName} {en.employeeId?.lastName}</td>
                              <td>{en.employeeId?.departmentId?.departmentName || 'N/A'}</td>
                              <td>
                                <span className={`tm-badge tm-badge-${en.status.replace(' ', '').toLowerCase()}`}>
                                  {en.status}
                                </span>
                              </td>
                              <td>{new Date(en.enrolledAt).toLocaleDateString()}</td>
                              <td>{en.completedAt ? new Date(en.completedAt).toLocaleDateString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{color: '#6b7280'}}>No employees enrolled yet.</p>
                  )}
                </>
              ) : (
                <div>Loading enrollments...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRTrainingManagement;
