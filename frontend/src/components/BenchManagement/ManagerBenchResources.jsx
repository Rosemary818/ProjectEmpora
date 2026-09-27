import React, { useState, useEffect } from 'react';
import './BenchManagement.css';

const ManagerBenchResources = () => {
  const [activeTab, setActiveTab] = useState('my-team'); // 'my-team' | 'matching'
  
  const [myTeamBench, setMyTeamBench] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'matching') {
      fetchAvailableEmployees(selectedProjectId);
    }
  }, [activeTab, selectedProjectId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };
      const [teamRes, projRes] = await Promise.all([
        fetch('http://localhost:5000/api/bench/my-team', { headers }),
        fetch('http://localhost:5000/api/projects/my-projects', { headers })
      ]);
      
      const teamData = await teamRes.json();
      const projData = await projRes.json();

      if (teamRes.ok) {
        setMyTeamBench(teamData.data);
      } else {
        setError(teamData.message || 'Failed to fetch team bench');
      }

      if (projRes.ok) {
        setMyProjects(projData.data.filter(p => p.status === 'Active' || p.status === 'Upcoming'));
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEmployees = async (projectId) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };
      const url = projectId 
        ? `http://localhost:5000/api/bench/available?projectId=${projectId}` 
        : `http://localhost:5000/api/bench/available`;
        
      const res = await fetch(url, { headers });
      const data = await res.json();
      
      if (res.ok) {
        setAvailableEmployees(data.data);
      } else {
        setError(data.message || 'Failed to fetch available employees');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAllocation = async (employeeId) => {
    if (!selectedProjectId) {
      alert("Please select a project first.");
      return;
    }
    
    setIsRequesting(true);
    try {
      const res = await fetch('http://localhost:5000/api/bench/request-allocation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ employeeId, projectId: selectedProjectId })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert('Allocation requested successfully! HR will review and formally assign them.');
        fetchAvailableEmployees(selectedProjectId);
        fetchInitialData();
      } else {
        alert(data.message || 'Failed to request allocation');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsRequesting(false);
    }
  };

  if (loading && myTeamBench.length === 0 && availableEmployees.length === 0) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div className="bench-mgmt-container">
      <div className="bench-header">
        <h2>Manager Bench Resources</h2>
        <p>View your team members on bench and match available bench employees for your projects.</p>
      </div>

      <div className="bench-tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        <button 
          className={`bench-tab ${activeTab === 'my-team' ? 'active' : ''}`}
          style={{ padding: '0.5rem 1rem', background: activeTab === 'my-team' ? '#4f46e5' : 'transparent', color: activeTab === 'my-team' ? 'white' : '#4b5563', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          onClick={() => setActiveTab('my-team')}
        >
          My Team Bench
        </button>
        <button 
          className={`bench-tab ${activeTab === 'matching' ? 'active' : ''}`}
          style={{ padding: '0.5rem 1rem', background: activeTab === 'matching' ? '#4f46e5' : 'transparent', color: activeTab === 'matching' ? 'white' : '#4b5563', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          onClick={() => setActiveTab('matching')}
        >
          Project-wise Bench Matching
        </button>
      </div>

      {error && <div style={{ padding: '1rem', color: 'red', background: '#fee2e2', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

      <div className="bench-content">
        {activeTab === 'my-team' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>My Direct Reports Currently On Bench</h3>
            {myTeamBench.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', background: '#f9fafb', borderRadius: '8px' }}>
                None of your direct reports are currently on the bench.
              </div>
            ) : (
              <div className="bench-table-wrapper">
                <table className="bench-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Designation</th>
                      <th>Bench Duration</th>
                      <th>Skills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTeamBench.map(emp => {
                      const start = new Date(emp.benchStartDate);
                      const diffDays = Math.ceil(Math.abs(new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <tr key={emp._id}>
                          <td>
                            <div className="bench-emp-info">
                              {emp.profileImage ? (
                                <img src={emp.profileImage} alt="" className="bench-avatar" />
                              ) : (
                                <div className="bench-avatar-text">{emp.firstName[0]}{emp.lastName[0]}</div>
                              )}
                              <div>
                                <strong>{emp.firstName} {emp.lastName}</strong>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280' }}>{emp.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>{emp.designationId?.title || 'N/A'}</td>
                          <td>{diffDays} days</td>
                          <td>
                            <div className="bench-skills">
                              {emp.skills?.slice(0, 3).map((s, idx) => (
                                <span key={idx} className="bench-skill-badge">{s.name}</span>
                              ))}
                              {emp.skills?.length > 3 && <span>+{emp.skills.length - 3}</span>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'matching' && (
          <div>
            <div className="bench-filters" style={{ marginBottom: '1.5rem', background: '#f3f4f6', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontWeight: '500' }}>Select Project:</label>
              <select 
                className="bench-input" 
                style={{ maxWidth: '300px' }}
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="">-- View All Available Bench Employees --</option>
                {myProjects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {availableEmployees.map(emp => {
                const start = new Date(emp.benchStartDate);
                const diffDays = Math.ceil(Math.abs(new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={emp._id} style={{ border: '1px solid #e5e7eb', padding: '1.5rem', borderRadius: '8px', background: 'white' }}>
                    <div className="bench-emp-info" style={{ marginBottom: '1rem' }}>
                      {emp.profileImage ? (
                        <img src={emp.profileImage} alt="Profile" className="bench-avatar" />
                      ) : (
                        <div className="bench-avatar-text">{emp.firstName.charAt(0)}{emp.lastName.charAt(0)}</div>
                      )}
                      <div>
                        <strong style={{ display: 'block', fontSize: '1.125rem' }}>{emp.firstName} {emp.lastName}</strong>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{emp.designationId?.title || 'Employee'}</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#4b5563' }}>
                      <div><strong>Department:</strong> {emp.departmentId?.departmentName || 'N/A'}</div>
                      <div style={{ marginTop: '0.25rem' }}><strong>On Bench For:</strong> {diffDays} days</div>
                      
                      {selectedProjectId && emp.matchPercentage !== undefined && (
                        <div style={{ marginTop: '0.5rem', color: emp.matchPercentage >= 50 ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                          Skill Match: {emp.matchPercentage}%
                        </div>
                      )}
                    </div>

                    <div className="bench-skills" style={{ marginBottom: '1rem' }}>
                      {emp.skills?.map((s, idx) => (
                        <span key={idx} className="bench-skill-badge">{s.name}</span>
                      ))}
                    </div>

                    <button 
                      className="bench-btn-submit" 
                      style={{ width: '100%', background: !selectedProjectId ? '#9ca3af' : '#4f46e5' }}
                      disabled={!selectedProjectId || isRequesting}
                      onClick={() => handleRequestAllocation(emp._id)}
                      title={!selectedProjectId ? 'Select a project to request allocation' : 'Request Allocation'}
                    >
                      {!selectedProjectId ? 'Select a Project First' : 'Request Allocation'}
                    </button>
                  </div>
                )
              })}
              
              {availableEmployees.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#6b7280', background: '#f9fafb', borderRadius: '8px' }}>
                  No available bench resources found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerBenchResources;
