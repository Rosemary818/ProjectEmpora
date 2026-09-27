import React, { useState, useEffect } from 'react';
import './AssetManagement.css';

const MyAssets = ({ isManager }) => {
  const [assets, setAssets] = useState([]);
  const [teamAssets, setTeamAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [error, setError] = useState(null);
  const [teamError, setTeamError] = useState(null);

  useEffect(() => {
    fetchMyAssets();
    if (isManager) {
      fetchTeamAssets();
    }
  }, [isManager]);

  const fetchTeamAssets = async () => {
    setLoadingTeam(true);
    try {
      const res = await fetch('http://localhost:5000/api/assets/team', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) setTeamAssets(data.data);
      else setTeamError(data.message);
    } catch (err) {
      setTeamError('Failed to fetch team assets');
    } finally {
      setLoadingTeam(false);
    }
  };

  const fetchMyAssets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/assets/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) setAssets(data.data);
      else setError(data.message);
    } catch (err) {
      setError('Failed to fetch assigned assets');
    } finally {
      setLoading(false);
    }
  };

  const getConditionBadge = (condition) => {
    const map = {
      'New': 'badge-new',
      'Good': 'badge-good',
      'Fair': 'badge-fair',
      'Damaged': 'badge-damaged'
    };
    return map[condition] || 'badge-good';
  };

  return (
    <div className="asset-container">
      <div className="asset-header">
        <h2>My Assets</h2>
      </div>

      {loading ? (
        <p style={{color: '#6b7280'}}>Loading your assets...</p>
      ) : error ? (
        <p style={{color: '#dc2626'}}>{error}</p>
      ) : assets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px' }}>
          <h3>No Assets Assigned</h3>
          <p style={{ color: '#6b7280' }}>You currently have no company assets assigned to you.</p>
        </div>
      ) : (
        <div className="my-assets-grid">
          {assets.map(asset => (
            <div key={asset._id} className="my-asset-card">
              <div className="my-asset-header">
                <div className="my-asset-title">
                  <h4>{asset.assetName}</h4>
                  <p>{asset.category}</p>
                </div>
                <span className={`asset-badge ${getConditionBadge(asset.condition)}`}>{asset.condition}</span>
              </div>
              <div className="my-asset-body">
                <div className="my-asset-detail">
                  <span>Asset ID</span>
                  <span>{asset.assetId}</span>
                </div>
                <div className="my-asset-detail">
                  <span>Brand & Model</span>
                  <span>{asset.brand || '-'} {asset.deviceModel || ''}</span>
                </div>
                <div className="my-asset-detail">
                  <span>Serial Number</span>
                  <span>{asset.serialNumber || '-'}</span>
                </div>
                <div className="my-asset-detail">
                  <span>Assigned Date</span>
                  <span>{asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString() : '-'}</span>
                </div>
                <div className="my-asset-detail">
                  <span>Status</span>
                  <span className="asset-badge badge-assigned">{asset.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isManager && (
        <div style={{ marginTop: '3rem' }}>
          <div className="asset-header" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2>Team Assets</h2>
              <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>Assets currently assigned to your team members</p>
            </div>
          </div>
          
          {loadingTeam ? (
            <p style={{color: '#6b7280'}}>Loading team assets...</p>
          ) : teamError ? (
            <p style={{color: '#dc2626'}}>{teamError}</p>
          ) : teamAssets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px' }}>
              <h3>No Team Assets</h3>
              <p style={{ color: '#6b7280' }}>No assets are currently assigned to your team members.</p>
            </div>
          ) : (
            <div className="asset-table-container">
              <table className="asset-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Asset Name</th>
                    <th>Asset ID</th>
                    <th>Category</th>
                    <th>Assigned Date</th>
                    <th>Condition</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teamAssets.map(asset => (
                    <tr key={asset._id}>
                      <td>{asset.assignedTo?.firstName} {asset.assignedTo?.lastName}</td>
                      <td>{asset.assignedTo?.employeeCode || '-'}</td>
                      <td>{asset.assignedTo?.departmentName || '-'}</td>
                      <td>{asset.assignedTo?.designationName || '-'}</td>
                      <td style={{fontWeight: '500'}}>{asset.assetName}</td>
                      <td>{asset.assetId}</td>
                      <td>{asset.category}</td>
                      <td>{asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString() : '-'}</td>
                      <td><span className={`asset-badge ${getConditionBadge(asset.condition)}`}>{asset.condition}</span></td>
                      <td><span className="asset-badge badge-assigned">{asset.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyAssets;
