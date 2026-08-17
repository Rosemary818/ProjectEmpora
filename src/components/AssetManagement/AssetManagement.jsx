import React, { useState, useEffect } from 'react';
import './AssetManagement.css';

const AssetManagement = () => {
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, assigned: 0, maintenance: 0, retired: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetHistory, setAssetHistory] = useState([]);

  // Forms
  const [formData, setFormData] = useState({});
  const [assignData, setAssignData] = useState({ employeeId: '', conditionAtAssignment: 'Good', notes: '' });
  const [returnData, setReturnData] = useState({ conditionAtReturn: 'Good', notes: '' });
  const [transferData, setTransferData] = useState({ newEmployeeId: '', condition: 'Good', notes: '' });
  const [maintenanceData, setMaintenanceData] = useState({ reason: '', notes: '' });

  const selectedEmployeeForAssign = employees.find(e => e._id === assignData.employeeId);
  const selectedEmployeeForTransfer = employees.find(e => e._id === transferData.newEmployeeId);

  useEffect(() => {
    fetchAssets();
    fetchStats();
    fetchEmployees();
  }, [categoryFilter, statusFilter]);

  const fetchAssets = async () => {
    try {
      const query = new URLSearchParams();
      if (categoryFilter) query.append('category', categoryFilter);
      if (statusFilter) query.append('status', statusFilter);
      if (searchTerm) query.append('search', searchTerm);

      const res = await fetch(`http://localhost:5000/api/assets?${query.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) setAssets(data.data);
      else setError(data.message);
    } catch (err) {
      setError('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/assets/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) setStats(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/employees', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        const empList = Array.isArray(data) ? data : data.data || [];
        setEmployees(empList.filter(e => e.status === 'Active'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchAssets();
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchAssets();
        fetchStats();
        setFormData({});
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      alert('Error creating asset');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/assets/${selectedAsset._id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(assignData)
      });
      if (res.ok) {
        setShowAssignModal(false);
        fetchAssets();
        fetchStats();
        setAssignData({ employeeId: '', conditionAtAssignment: 'Good', notes: '' });
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      alert('Error assigning asset');
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/assets/${selectedAsset._id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(returnData)
      });
      if (res.ok) {
        setShowReturnModal(false);
        fetchAssets();
        fetchStats();
        setReturnData({ conditionAtReturn: 'Good', notes: '' });
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      alert('Error returning asset');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/assets/${selectedAsset._id}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(transferData)
      });
      if (res.ok) {
        setShowTransferModal(false);
        fetchAssets();
        fetchStats();
        setTransferData({ newEmployeeId: '', condition: 'Good', notes: '' });
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      alert('Error transferring asset');
    }
  };

  const handleMaintenance = async (e) => {
    e.preventDefault();
    try {
      const isAvailable = selectedAsset.status === 'Under Maintenance';
      const res = await fetch(`http://localhost:5000/api/assets/${selectedAsset._id}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ ...maintenanceData, status: isAvailable ? 'Available' : 'Under Maintenance' })
      });
      if (res.ok) {
        setShowMaintenanceModal(false);
        fetchAssets();
        fetchStats();
        setMaintenanceData({ reason: '', notes: '' });
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      alert('Error updating maintenance status');
    }
  };

  const handleRetire = async (assetId) => {
    if (!window.confirm('Are you sure you want to retire this asset? This cannot be undone.')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/assets/${assetId}/retire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ reason: 'Retired by Admin' })
      });
      if (res.ok) {
        fetchAssets();
        fetchStats();
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      alert('Error retiring asset');
    }
  };

  const viewHistory = async (asset) => {
    try {
      const res = await fetch(`http://localhost:5000/api/assets/${asset._id}/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAssetHistory(data.data);
        setSelectedAsset(asset);
        setShowHistoryModal(true);
      }
    } catch (err) {
      alert('Failed to fetch history');
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

  const getStatusBadge = (status) => {
    const map = {
      'Available': 'badge-available',
      'Assigned': 'badge-assigned',
      'Under Maintenance': 'badge-maintenance',
      'Retired': 'badge-retired'
    };
    return map[status] || 'badge-available';
  };

  const categories = ['Laptop', 'Desktop', 'Monitor', 'Keyboard', 'Mouse', 'Mobile Phone', 'Tablet', 'Headset', 'ID Card', 'Access Card', 'Other'];

  return (
    <div className="asset-container">
      <div className="asset-header">
        <h2>Asset Management</h2>
        <button className="asset-add-btn" onClick={() => setShowAddModal(true)}>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Asset
        </button>
      </div>

      <div className="asset-stats-grid">
        <div className="asset-stat-card">
          <div className="asset-stat-icon" style={{background: '#f3f4f6', color: '#374151'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          </div>
          <div className="asset-stat-info">
            <h3>Total Assets</h3>
            <p className="asset-stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="asset-stat-card">
          <div className="asset-stat-icon" style={{background: '#dcfce7', color: '#166534'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div className="asset-stat-info">
            <h3>Available</h3>
            <p className="asset-stat-value">{stats.available}</p>
          </div>
        </div>
        <div className="asset-stat-card">
          <div className="asset-stat-icon" style={{background: '#dbeafe', color: '#1e40af'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div className="asset-stat-info">
            <h3>Assigned</h3>
            <p className="asset-stat-value">{stats.assigned}</p>
          </div>
        </div>
        <div className="asset-stat-card">
          <div className="asset-stat-icon" style={{background: '#fef3c7', color: '#92400e'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div className="asset-stat-info">
            <h3>Maintenance</h3>
            <p className="asset-stat-value">{stats.maintenance}</p>
          </div>
        </div>
        <div className="asset-stat-card">
          <div className="asset-stat-icon" style={{background: '#fee2e2', color: '#991b1b'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <div className="asset-stat-info">
            <h3>Retired</h3>
            <p className="asset-stat-value">{stats.retired}</p>
          </div>
        </div>
      </div>

      <div className="asset-controls">
        <div className="asset-search">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search by ID, name, serial..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
        <select className="asset-filter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="asset-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Assigned">Assigned</option>
          <option value="Under Maintenance">Maintenance</option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      <div className="asset-table-container">
        <table className="asset-table">
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Assigned To</th>
              <th>Condition</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{textAlign: 'center'}}>Loading...</td></tr>
            ) : assets.length === 0 ? (
              <tr><td colSpan="7" style={{textAlign: 'center'}}>No assets found.</td></tr>
            ) : (
              assets.map(asset => (
                <tr key={asset._id}>
                  <td style={{fontWeight: '500'}}>{asset.assetId}</td>
                  <td>{asset.assetName}</td>
                  <td>{asset.category}</td>
                  <td>
                    {asset.assignedTo ? (
                      <div>
                        {asset.assignedTo.firstName} {asset.assignedTo.lastName}
                        <div style={{fontSize: '0.75rem', color: '#6b7280'}}>{asset.assignedTo.employeeCode}</div>
                      </div>
                    ) : (
                      <span style={{color: '#9ca3af'}}>-</span>
                    )}
                  </td>
                  <td><span className={`asset-badge ${getConditionBadge(asset.condition)}`}>{asset.condition}</span></td>
                  <td><span className={`asset-badge ${getStatusBadge(asset.status)}`}>{asset.status}</span></td>
                  <td>
                    <div className="asset-actions">
                      <button className="btn-secondary" style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginRight: '0.5rem'}} onClick={() => {
                        setSelectedAsset(asset);
                        if (asset.status === 'Available') setShowAssignModal(true);
                        else if (asset.status === 'Assigned') setShowTransferModal(true);
                      }} disabled={asset.status === 'Retired' || asset.status === 'Under Maintenance'}>
                        {asset.status === 'Available' ? 'Assign' : asset.status === 'Assigned' ? 'Transfer' : '-'}
                      </button>
                      <button className="btn-secondary" style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginRight: '0.5rem'}} onClick={() => {
                        setSelectedAsset(asset);
                        if (asset.status === 'Assigned') setShowReturnModal(true);
                        else viewHistory(asset);
                      }}>
                        {asset.status === 'Assigned' ? 'Return' : 'History'}
                      </button>
                      {asset.status !== 'Retired' && asset.status !== 'Assigned' && (
                        <button className="btn-secondary" style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginRight: '0.5rem'}} onClick={() => {
                          setSelectedAsset(asset);
                          if (asset.status === 'Under Maintenance') {
                             if(window.confirm('Mark as available again?')) {
                               handleMaintenance({preventDefault: ()=>{}});
                             }
                          } else {
                            setShowMaintenanceModal(true);
                          }
                        }}>
                           {asset.status === 'Under Maintenance' ? 'Make Avail' : 'Maintain'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="asset-modal-overlay">
          <div className="asset-modal">
            <div className="asset-modal-header">
              <h3>Add New Asset</h3>
              <button className="asset-modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="asset-modal-body">
                <div className="asset-form-row">
                  <div className="asset-form-group">
                    <label>Asset ID *</label>
                    <input type="text" className="asset-form-control" required value={formData.assetId || ''} onChange={e => setFormData({...formData, assetId: e.target.value})} />
                  </div>
                  <div className="asset-form-group">
                    <label>Asset Name *</label>
                    <input type="text" className="asset-form-control" required value={formData.assetName || ''} onChange={e => setFormData({...formData, assetName: e.target.value})} />
                  </div>
                </div>
                <div className="asset-form-row">
                  <div className="asset-form-group">
                    <label>Category *</label>
                    <select className="asset-form-control" required value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="asset-form-group">
                    <label>Condition *</label>
                    <select className="asset-form-control" required value={formData.condition || 'New'} onChange={e => setFormData({...formData, condition: e.target.value})}>
                      <option value="New">New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Damaged">Damaged</option>
                    </select>
                  </div>
                </div>
                <div className="asset-form-row">
                  <div className="asset-form-group">
                    <label>Brand</label>
                    <input type="text" className="asset-form-control" value={formData.brand || ''} onChange={e => setFormData({...formData, brand: e.target.value})} />
                  </div>
                  <div className="asset-form-group">
                    <label>Model</label>
                    <input type="text" className="asset-form-control" value={formData.deviceModel || ''} onChange={e => setFormData({...formData, deviceModel: e.target.value})} />
                  </div>
                </div>
                <div className="asset-form-row">
                  <div className="asset-form-group">
                    <label>Serial Number</label>
                    <input type="text" className="asset-form-control" value={formData.serialNumber || ''} onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
                  </div>
                  <div className="asset-form-group">
                    <label>Purchase Date</label>
                    <input type="date" className="asset-form-control" value={formData.purchaseDate || ''} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="asset-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedAsset && (
        <div className="asset-modal-overlay">
          <div className="asset-modal">
            <div className="asset-modal-header">
              <h3>Assign Asset: {selectedAsset.assetName}</h3>
              <button className="asset-modal-close" onClick={() => setShowAssignModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="asset-modal-body">
                <div className="asset-form-group">
                  <label>Select Employee *</label>
                  <select className="asset-form-control" required value={assignData.employeeId} onChange={e => setAssignData({...assignData, employeeId: e.target.value})}>
                    <option value="">Select Employee...</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeCode})</option>
                    ))}
                  </select>
                </div>
                {selectedEmployeeForAssign && (
                  <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid #e5e7eb' }}>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Employee ID:</strong> {selectedEmployeeForAssign.employeeCode || '-'}</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Department:</strong> {selectedEmployeeForAssign.departmentName || '-'}</div>
                    <div><strong>Designation:</strong> {selectedEmployeeForAssign.designationName || '-'}</div>
                  </div>
                )}
                <div className="asset-form-group">
                  <label>Condition at Assignment</label>
                  <select className="asset-form-control" value={assignData.conditionAtAssignment} onChange={e => setAssignData({...assignData, conditionAtAssignment: e.target.value})}>
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
                <div className="asset-form-group">
                  <label>Notes</label>
                  <textarea className="asset-form-control" rows="3" value={assignData.notes} onChange={e => setAssignData({...assignData, notes: e.target.value})}></textarea>
                </div>
              </div>
              <div className="asset-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Assign Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedAsset && (
        <div className="asset-modal-overlay">
          <div className="asset-modal">
            <div className="asset-modal-header">
              <h3>Return Asset: {selectedAsset.assetName}</h3>
              <button className="asset-modal-close" onClick={() => setShowReturnModal(false)}>✕</button>
            </div>
            <form onSubmit={handleReturn}>
              <div className="asset-modal-body">
                <p>Currently assigned to: <strong>{selectedAsset.assignedTo?.firstName} {selectedAsset.assignedTo?.lastName}</strong></p>
                <div className="asset-form-group">
                  <label>Condition at Return</label>
                  <select className="asset-form-control" value={returnData.conditionAtReturn} onChange={e => setReturnData({...returnData, conditionAtReturn: e.target.value})}>
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
                <div className="asset-form-group">
                  <label>Return Notes</label>
                  <textarea className="asset-form-control" rows="3" value={returnData.notes} onChange={e => setReturnData({...returnData, notes: e.target.value})}></textarea>
                </div>
              </div>
              <div className="asset-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowReturnModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm Return</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && selectedAsset && (
        <div className="asset-modal-overlay">
          <div className="asset-modal">
            <div className="asset-modal-header">
              <h3>Transfer Asset: {selectedAsset.assetName}</h3>
              <button className="asset-modal-close" onClick={() => setShowTransferModal(false)}>✕</button>
            </div>
            <form onSubmit={handleTransfer}>
              <div className="asset-modal-body">
                <p>Currently assigned to: <strong>{selectedAsset.assignedTo?.firstName} {selectedAsset.assignedTo?.lastName}</strong></p>
                <div className="asset-form-group">
                  <label>Transfer To Employee *</label>
                  <select className="asset-form-control" required value={transferData.newEmployeeId} onChange={e => setTransferData({...transferData, newEmployeeId: e.target.value})}>
                    <option value="">Select Employee...</option>
                    {employees.filter(e => e._id !== selectedAsset.assignedTo?._id).map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeCode})</option>
                    ))}
                  </select>
                </div>
                {selectedEmployeeForTransfer && (
                  <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid #e5e7eb' }}>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Employee ID:</strong> {selectedEmployeeForTransfer.employeeCode || '-'}</div>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Department:</strong> {selectedEmployeeForTransfer.departmentName || '-'}</div>
                    <div><strong>Designation:</strong> {selectedEmployeeForTransfer.designationName || '-'}</div>
                  </div>
                )}
                <div className="asset-form-group">
                  <label>Condition at Transfer</label>
                  <select className="asset-form-control" value={transferData.condition} onChange={e => setTransferData({...transferData, condition: e.target.value})}>
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
                <div className="asset-form-group">
                  <label>Transfer Notes</label>
                  <textarea className="asset-form-control" rows="3" value={transferData.notes} onChange={e => setTransferData({...transferData, notes: e.target.value})}></textarea>
                </div>
              </div>
              <div className="asset-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowTransferModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Maintenance Modal */}
      {showMaintenanceModal && selectedAsset && (
        <div className="asset-modal-overlay">
          <div className="asset-modal">
            <div className="asset-modal-header">
              <h3>Mark Asset Under Maintenance</h3>
              <button className="asset-modal-close" onClick={() => setShowMaintenanceModal(false)}>✕</button>
            </div>
            <form onSubmit={handleMaintenance}>
              <div className="asset-modal-body">
                <div className="asset-form-group">
                  <label>Reason</label>
                  <input type="text" className="asset-form-control" value={maintenanceData.reason} onChange={e => setMaintenanceData({...maintenanceData, reason: e.target.value})} />
                </div>
                <div className="asset-form-group">
                  <label>Notes</label>
                  <textarea className="asset-form-control" rows="3" value={maintenanceData.notes} onChange={e => setMaintenanceData({...maintenanceData, notes: e.target.value})}></textarea>
                </div>
              </div>
              <div className="asset-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowMaintenanceModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedAsset && (
        <div className="asset-modal-overlay">
          <div className="asset-modal">
            <div className="asset-modal-header">
              <h3>History: {selectedAsset.assetName} ({selectedAsset.assetId})</h3>
              <button className="asset-modal-close" onClick={() => setShowHistoryModal(false)}>✕</button>
            </div>
            <div className="asset-modal-body">
              {assetHistory.length === 0 ? (
                <p>No history available for this asset.</p>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  {assetHistory.map(record => (
                    <div key={record._id} style={{padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '6px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                        <strong>{record.action}</strong>
                        <span style={{fontSize: '0.875rem', color: '#6b7280'}}>{new Date(record.createdAt).toLocaleDateString()}</span>
                      </div>
                      {record.employeeId && (
                        <p style={{margin: '0 0 0.5rem 0', fontSize: '0.875rem'}}>
                          Employee: {record.employeeId.firstName} {record.employeeId.lastName}
                        </p>
                      )}
                      <p style={{margin: '0 0 0.5rem 0', fontSize: '0.875rem'}}>
                        Condition: {record.conditionAtAssignment || record.conditionAtReturn || '-'}
                      </p>
                      {record.notes && (
                        <p style={{margin: '0', fontSize: '0.875rem', color: '#374151', background: '#f9fafb', padding: '0.5rem', borderRadius: '4px'}}>
                          {record.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="asset-modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagement;
