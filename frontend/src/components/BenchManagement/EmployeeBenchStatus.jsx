import React, { useState, useEffect } from 'react';
import './BenchManagement.css';

const EmployeeBenchStatus = () => {
  const [benchData, setBenchData] = useState(null);
  const [recommendedOpportunities, setRecommendedOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals for Applying to Projects
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applicationNotes, setApplicationNotes] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resStatus, resOpps] = await Promise.all([
        fetch('http://localhost:5000/api/bench/my-status', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch('http://localhost:5000/api/bench/recommended-opportunities', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        })
      ]);

      const dataStatus = await resStatus.json();
      if (resStatus.ok) {
        setBenchData(dataStatus.data);
      } else {
        setError(dataStatus.message || 'Failed to fetch bench status');
      }

      const dataOpps = await resOpps.json();
      if (resOpps.ok) {
        setRecommendedOpportunities(dataOpps.data);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setIsApplying(true);
    try {
      const isProject = selectedOpportunity.type === 'Project';
      const endpoint = isProject ? 'http://localhost:5000/api/bench/apply' : 'http://localhost:5000/api/internal-mobility/apply';
      const bodyPayload = isProject ? {
        projectId: selectedOpportunity._id,
        reason: applicationNotes,
        relevantSkills: applicationNotes
      } : {
        opportunityId: selectedOpportunity._id,
        reason: applicationNotes,
        relevantSkills: applicationNotes
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(bodyPayload)
      });
      
      const data = await res.json();
      if (res.ok || data.success) {
        setIsModalOpen(false);
        setApplicationNotes('');
        alert('Application submitted successfully!');
        fetchData(); // refresh status and applications
      } else {
        alert(data.message || 'Failed to submit application');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Bench Status...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;

  const isBench = benchData.status === 'On Bench';

  return (
    <div className="bench-mgmt-container">
      <div className="bench-header">
        <h2>My Bench Status</h2>
        <p>View your current allocation status and discover available projects.</p>
      </div>

      <div className="bench-dashboard-grid">
        <div className={`bench-stat-card ${isBench ? 'warning' : 'success'}`} style={{ backgroundColor: isBench ? '#fffbeb' : '#f0fdf4', borderColor: isBench ? '#fde68a' : '#bbf7d0' }}>
          <h3>Current Status</h3>
          <div className="bench-stat-value" style={{ color: isBench ? '#d97706' : '#16a34a' }}>
            {benchData.status}
          </div>
          {isBench && benchData.duration && (
            <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
              Duration: {benchData.duration} days (since {new Date(benchData.startDate).toLocaleDateString()})
            </p>
          )}
        </div>
      </div>

      {isBench && recommendedOpportunities && recommendedOpportunities.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Recommended Opportunities</h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Opportunities matched to your skills.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {recommendedOpportunities.map(opp => (
              <div key={opp._id} style={{ border: '1px solid #e5e7eb', padding: '1.5rem', borderRadius: '8px', background: 'white', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#111827', fontSize: '1.125rem' }}>{opp.title}</h4>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '999px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>{opp.type}</span>
                </div>
                <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>Dept: {opp.department} | Exp: {opp.experienceRequired}</p>
                
                <div style={{ margin: '0.5rem 0' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>Match: {opp.matchPercentage}%</div>
                  <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '999px', height: '8px' }}>
                    <div style={{ backgroundColor: opp.matchPercentage >= 80 ? '#10b981' : opp.matchPercentage >= 50 ? '#f59e0b' : '#ef4444', height: '8px', borderRadius: '999px', width: `${opp.matchPercentage}%` }}></div>
                  </div>
                </div>

                <div style={{ margin: '0.5rem 0', flexGrow: 1 }}>
                  <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <strong style={{ color: '#10b981' }}>Matched Skills:</strong> {opp.matchedSkills.length > 0 ? opp.matchedSkills.join(', ') : 'None'}
                  </div>
                  {opp.missingSkills.length > 0 && (
                    <div style={{ fontSize: '0.75rem' }}>
                      <strong style={{ color: '#ef4444' }}>Missing Skills:</strong> {opp.missingSkills.join(', ')}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  {opp.applicationStatus ? (
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                      Status: {opp.applicationStatus}
                    </span>
                  ) : (
                    <button 
                      className="bench-btn-submit"
                      onClick={() => {
                        setSelectedOpportunity(opp);
                        setIsModalOpen(true);
                      }}
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="bench-modal-overlay">
          <div className="bench-modal">
            <h3>Apply for {selectedOpportunity?.type}: {selectedOpportunity?.title}</h3>
            <form onSubmit={handleApply}>
              <div className="bench-form-group">
                <label>Why are you a good fit for this project?</label>
                <textarea 
                  value={applicationNotes} 
                  onChange={(e) => setApplicationNotes(e.target.value)} 
                  className="bench-input"
                  rows="4"
                  required
                  placeholder="Mention relevant skills or experience..."
                ></textarea>
              </div>
              <div className="bench-modal-actions">
                <button type="button" className="bench-btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="bench-btn-submit" disabled={isApplying}>
                  {isApplying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeBenchStatus;
