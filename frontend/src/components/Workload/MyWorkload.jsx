import React, { useState, useEffect } from 'react';
import { workloadService } from '../../services/workload.service';
import './Workload.css';

const MyWorkload = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingWellbeing, setUpdatingWellbeing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await workloadService.getMyWorkload();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError('Failed to fetch workload data');
    } finally {
      setLoading(false);
    }
  };

  const handleWellbeingUpdate = async (status) => {
    try {
      setUpdatingWellbeing(true);
      const res = await workloadService.updateWellbeing(status);
      if (res.success) {
        setData(prev => ({
          ...prev,
          wellbeingStatus: res.data.wellbeingStatus,
          wellbeingLastUpdated: res.data.wellbeingLastUpdated
        }));
      }
    } catch (err) {
      console.error('Failed to update wellbeing');
    } finally {
      setUpdatingWellbeing(false);
    }
  };

  if (loading) return <div style={{ padding: '20px', color: '#6b7280' }}>Loading workload data...</div>;
  if (error) return <div style={{ padding: '20px', color: '#dc2626' }}>{error}</div>;
  if (!data) return null;

  const getStatusColor = (status) => {
    if (status === 'Balanced') return '#16a34a'; // Green
    if (status === 'Moderate') return '#d97706'; // Yellow/Orange
    if (status === 'High') return '#dc2626';     // Red
    return '#6b7280';
  };

  return (
    <div className="workload-container">
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>My Workload</h2>
        <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>Overview of your current projects, tasks, and working hours.</p>
      </div>

      <div className="workload-grid">
        <div className="workload-card">
          <div className="workload-card-header">
            <h3>Active Projects</h3>
            <span className="workload-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>📁</span>
          </div>
          <div className="workload-value">{data.activeProjects}</div>
          {data.activeProjects === 0 && <p className="workload-empty-text">No active projects</p>}
        </div>

        <div className="workload-card">
          <div className="workload-card-header">
            <h3>Pending Tasks</h3>
            <span className="workload-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>📋</span>
          </div>
          <div className="workload-value">{data.pendingTasks}</div>
          {data.pendingTasks === 0 && <p className="workload-empty-text">No pending tasks</p>}
        </div>

        <div className="workload-card">
          <div className="workload-card-header">
            <h3>Weekly Hours</h3>
            <span className="workload-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>⏱️</span>
          </div>
          <div className="workload-value">{data.weeklyHours} <span style={{fontSize: '16px', fontWeight: 'normal', color: '#6b7280'}}>hrs</span></div>
          {data.weeklyHours === 0 && <p className="workload-empty-text">No working-hour data available</p>}
        </div>

        <div className="workload-card">
          <div className="workload-card-header">
            <h3>Goal Progress</h3>
            <span className="workload-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>🎯</span>
          </div>
          <div className="workload-value">{data.goalProgress}%</div>
          {data.activeGoals === 0 && <p className="workload-empty-text">No active goals</p>}
        </div>
      </div>

      <div className="workload-status-card" style={{ borderLeft: `5px solid ${getStatusColor(data.workloadStatus)}` }}>
        <h3 style={{ margin: '0 0 5px 0', color: '#374151' }}>Workload Status</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>
            {data.workloadStatus === 'Balanced' ? '🟢' : data.workloadStatus === 'Moderate' ? '🟡' : '🔴'}
          </span>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: getStatusColor(data.workloadStatus) }}>
            {data.workloadStatus}
          </span>
        </div>
        <p style={{ margin: '10px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
          {data.workloadStatus === 'Balanced' && 'Your workload is well-balanced.'}
          {data.workloadStatus === 'Moderate' && 'Your workload is moderate. Keep an eye on your tasks.'}
          {data.workloadStatus === 'High' && 'Your workload is high. Consider discussing prioritization with your manager.'}
        </p>
      </div>

      <div className="workload-wellbeing-card">
        <h3 style={{ margin: '0 0 15px 0', color: '#374151', fontSize: '16px' }}>How are you feeling about your current workload?</h3>
        <div className="wellbeing-options">
          {[
            { label: 'Good', emoji: '😊', value: 'Good' },
            { label: 'Okay', emoji: '🙂', value: 'Okay' },
            { label: 'Stressed', emoji: '😐', value: 'Stressed' },
            { label: 'Overloaded', emoji: '😟', value: 'Overloaded' }
          ].map(option => (
            <button 
              key={option.value}
              className={`wellbeing-btn ${data.wellbeingStatus === option.value ? 'active' : ''}`}
              onClick={() => handleWellbeingUpdate(option.value)}
              disabled={updatingWellbeing}
            >
              <span className="emoji">{option.emoji}</span>
              <span className="label">{option.label}</span>
            </button>
          ))}
        </div>
        {data.wellbeingLastUpdated && (
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '10px' }}>
            Last updated: {new Date(data.wellbeingLastUpdated).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default MyWorkload;
