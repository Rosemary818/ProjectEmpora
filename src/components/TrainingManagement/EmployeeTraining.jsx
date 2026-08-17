import React, { useState, useEffect } from 'react';
import './TrainingManagement.css';

const EmployeeTraining = () => {
  const [activeTab, setActiveTab] = useState('Available Trainings');
  const [availableTrainings, setAvailableTrainings] = useState([]);
  const [myTrainings, setMyTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [availRes, myRes] = await Promise.all([
        fetch('http://localhost:5000/api/trainings/available', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch('http://localhost:5000/api/trainings/my-enrollments', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        })
      ]);

      const availData = await availRes.json();
      const myData = await myRes.json();

      if (availRes.ok) setAvailableTrainings(availData.data);
      if (myRes.ok) setMyTrainings(myData.data);
      
    } catch (err) {
      setError('Failed to load trainings');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (trainingId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/trainings/${trainingId}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (res.ok) {
        alert('Successfully enrolled!');
        fetchData();
        setActiveTab('My Trainings');
      } else {
        const err = await res.json();
        alert(err.message || 'Enrollment failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (enrollmentId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/trainings/enrollments/${enrollmentId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="tm-loading-state">Loading...</div>;
  if (error) return <div className="tm-error-state">{error}</div>;

  // Filter out available trainings that I'm already enrolled in
  const enrolledTrainingIds = myTrainings.map(en => en.trainingId?._id);
  const displayAvailableTrainings = availableTrainings.filter(t => !enrolledTrainingIds.includes(t._id));

  return (
    <div className="tm-container">
      <div className="tm-header">
        <h2>My Learning</h2>
        <p>Enroll in training programs and track your progress</p>
      </div>

      <div className="tm-tabs">
        <div 
          className={`tm-tab ${activeTab === 'Available Trainings' ? 'active' : ''}`}
          onClick={() => setActiveTab('Available Trainings')}
        >
          Available Trainings
        </div>
        <div 
          className={`tm-tab ${activeTab === 'My Trainings' ? 'active' : ''}`}
          onClick={() => setActiveTab('My Trainings')}
        >
          My Trainings
        </div>
      </div>

      {activeTab === 'Available Trainings' && (
        <>
          {displayAvailableTrainings.length === 0 ? (
            <div className="tm-empty-state">No trainings available at the moment.</div>
          ) : (
            <div className="tm-grid">
              {displayAvailableTrainings.map(t => (
                <div key={t._id} className="tm-card">
                  <h3>{t.title}</h3>
                  <div className="tm-meta">
                    <span>{t.category}</span>
                    <span>{t.duration}</span>
                    <span>{t.mode}</span>
                    {t.startDate && <span>Starts: {new Date(t.startDate).toLocaleDateString()}</span>}
                  </div>
                  <p>{t.description}</p>
                  
                  <div className="tm-card-footer">
                    <span style={{fontSize: '0.875rem', color: '#6b7280'}}>Trainer: {t.trainer}</span>
                    <button className="tm-btn-primary" onClick={() => handleEnroll(t._id)}>
                      Enroll
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'My Trainings' && (
        <>
          {myTrainings.length === 0 ? (
            <div className="tm-empty-state">You have not enrolled in any training yet.</div>
          ) : (
            <div className="tm-table-container">
              <table className="tm-table">
                <thead>
                  <tr>
                    <th>Training Title</th>
                    <th>Category</th>
                    <th>Trainer</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myTrainings.map(en => {
                    const t = en.trainingId;
                    if (!t) return null;
                    return (
                      <tr key={en._id}>
                        <td style={{fontWeight: 500, color: '#111827'}}>{t.title}</td>
                        <td>{t.category}</td>
                        <td>{t.trainer}</td>
                        <td>{t.duration}</td>
                        <td>
                          <span className={`tm-badge tm-badge-${en.status.replace(' ', '').toLowerCase()}`}>
                            {en.status}
                          </span>
                        </td>
                        <td>
                          {en.status === 'Enrolled' && (
                            <button className="tm-btn-secondary" onClick={() => updateStatus(en._id, 'In Progress')}>
                              Start
                            </button>
                          )}
                          {en.status === 'In Progress' && (
                            <button className="tm-btn-success" onClick={() => updateStatus(en._id, 'Completed')}>
                              Mark Completed
                            </button>
                          )}
                          {en.status === 'Completed' && (
                            <span style={{fontSize: '0.875rem', color: '#6b7280'}}>
                              {new Date(en.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmployeeTraining;
