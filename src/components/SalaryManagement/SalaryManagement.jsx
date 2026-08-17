import React, { useState, useEffect } from 'react';
import './SalaryManagement.css';

const SalaryManagement = () => {
  const [salaries, setSalaries] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState(''); // 'Employee' or 'Manager'
  const [formData, setFormData] = useState({
    employeeId: '',
    basicSalary: '',
    hra: '',
    travel: '',
    medical: '',
    otherAllowance: '',
    tax: '',
    pf: '',
    insurance: '',
    otherDeduction: '',
    effectiveFrom: '',
    paymentFrequency: 'Monthly'
  });
  
  // Salary History Modal
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchSalaries();
    fetchUsers();
  }, []);

  const fetchSalaries = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/salaries', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setSalaries(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch salaries');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const res = await fetch('http://localhost:5000/api/admin/employees', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        const eligible = data.data.filter(u => ['Employee', 'Manager'].includes(u.role));
        setUsers(eligible);
      } else {
        setUsersError('Unable to load employees. Please try again.');
        console.error(data.message || data.error);
      }
    } catch (err) {
      setUsersError('Unable to load employees. Please try again.');
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateGross = () => {
    const basic = Number(formData.basicSalary) || 0;
    const hra = Number(formData.hra) || 0;
    const travel = Number(formData.travel) || 0;
    const medical = Number(formData.medical) || 0;
    const other = Number(formData.otherAllowance) || 0;
    return basic + hra + travel + medical + other;
  };

  const calculateNet = () => {
    const gross = calculateGross();
    const tax = Number(formData.tax) || 0;
    const pf = Number(formData.pf) || 0;
    const insurance = Number(formData.insurance) || 0;
    const other = Number(formData.otherDeduction) || 0;
    return gross - (tax + pf + insurance + other);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employeeId: formData.employeeId,
        basicSalary: Number(formData.basicSalary),
        allowances: {
          hra: Number(formData.hra) || 0,
          travel: Number(formData.travel) || 0,
          medical: Number(formData.medical) || 0,
          other: Number(formData.otherAllowance) || 0,
        },
        deductions: {
          tax: Number(formData.tax) || 0,
          pf: Number(formData.pf) || 0,
          insurance: Number(formData.insurance) || 0,
          other: Number(formData.otherDeduction) || 0,
        },
        effectiveFrom: formData.effectiveFrom,
        paymentFrequency: formData.paymentFrequency
      };

      const res = await fetch('http://localhost:5000/api/salaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        fetchSalaries();
        setSelectedRole('');
        setFormData({
          employeeId: '', basicSalary: '', hra: '', travel: '', medical: '', otherAllowance: '',
          tax: '', pf: '', insurance: '', otherDeduction: '', effectiveFrom: '', paymentFrequency: 'Monthly'
        });
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error saving salary: ' + err.message);
    }
  };

  const handleEdit = (salary) => {
    setSelectedRole(salary.employeeRole || (salary.employeeId?.role) || '');
    setFormData({
      employeeId: salary.employeeId._id,
      basicSalary: salary.basicSalary,
      hra: salary.allowances.hra,
      travel: salary.allowances.travel,
      medical: salary.allowances.medical,
      otherAllowance: salary.allowances.other,
      tax: salary.deductions.tax,
      pf: salary.deductions.pf,
      insurance: salary.deductions.insurance,
      otherDeduction: salary.deductions.other,
      effectiveFrom: new Date(salary.effectiveFrom).toISOString().split('T')[0],
      paymentFrequency: salary.paymentFrequency
    });
    setShowForm(true);
  };

  const handleViewHistory = async (employeeId) => {
    setHistoryLoading(true);
    setShowHistory(true);
    try {
      const res = await fetch(`http://localhost:5000/api/salaries/${employeeId}/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistoryData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) return <div className="sal-loading">Loading Salaries...</div>;

  return (
    <div className="sal-container">
      <div className="sal-header">
        <h2>Salary Management</h2>
        <button className="sal-btn-primary" onClick={() => {
          setSelectedRole('');
          setFormData({
            employeeId: '', basicSalary: '', hra: '', travel: '', medical: '', otherAllowance: '',
            tax: '', pf: '', insurance: '', otherDeduction: '', effectiveFrom: '', paymentFrequency: 'Monthly'
          });
          setShowForm(true);
        }}>
          + Add / Update Salary
        </button>
      </div>

      {error && <div className="sal-error">{error}</div>}

      <div className="sal-table-wrapper">
        <table className="sal-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Basic Salary</th>
              <th>Gross Salary</th>
              <th>Net Salary</th>
              <th>Effective From</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {salaries.length === 0 ? (
              <tr><td colSpan="7" style={{textAlign: 'center'}}>No active salaries found.</td></tr>
            ) : (
              salaries.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div className="sal-emp-info">
                      <div className="sal-emp-name">{s.employeeId?.firstName} {s.employeeId?.lastName}</div>
                      <div className="sal-emp-code">{s.employeeId?.employeeCode}</div>
                    </div>
                  </td>
                  <td>₹{s.basicSalary.toLocaleString()}</td>
                  <td>₹{s.grossSalary.toLocaleString()}</td>
                  <td>₹{s.netSalary.toLocaleString()}</td>
                  <td>{new Date(s.effectiveFrom).toLocaleDateString()}</td>
                  <td>
                    <span className={`sal-badge ${s.status.toLowerCase()}`}>{s.status}</span>
                  </td>
                  <td>
                    <div className="sal-actions">
                      <button className="sal-btn-icon" onClick={() => handleEdit(s)}>Edit</button>
                      <button className="sal-btn-icon" onClick={() => handleViewHistory(s.employeeId._id)}>History</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Update Salary Modal */}
      {showForm && (
        <div className="sal-modal-overlay">
          <div className="sal-modal">
            <div className="sal-modal-header">
              <h3>{formData.employeeId ? 'Update Salary' : 'Add New Salary'}</h3>
              <button className="sal-close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="sal-form">
              
              <div className="sal-form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>Select Role</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="selectedRole" 
                      value="Employee" 
                      checked={selectedRole === 'Employee'} 
                      onChange={(e) => {
                        setSelectedRole(e.target.value);
                        setFormData({ ...formData, employeeId: '' });
                      }} 
                    />
                    Employee
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="selectedRole" 
                      value="Manager" 
                      checked={selectedRole === 'Manager'} 
                      onChange={(e) => {
                        setSelectedRole(e.target.value);
                        setFormData({ ...formData, employeeId: '' });
                      }} 
                    />
                    Manager
                  </label>
                </div>
              </div>

              {selectedRole && (
                <div className="sal-form-group">
                  <label>{selectedRole === 'Employee' ? 'Employee' : 'Manager'}</label>
                  <select name="employeeId" value={formData.employeeId} onChange={handleChange} required disabled={usersLoading || !!usersError || users.length === 0}>
                    <option value="">
                      {usersLoading ? "Loading users..." :
                       usersError ? usersError :
                       "Select " + (selectedRole === 'Employee' ? 'Employee' : 'Manager') + " ▼"}
                    </option>
                    {users
                      .filter(u => u.role === selectedRole)
                      .map(u => (
                      <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.employeeCode || 'N/A'})</option>
                    ))}
                  </select>
                </div>
              )}
              
              {formData.employeeId && (
                <div style={{background: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem', color: '#374151', border: '1px solid #e5e7eb'}}>
                  {(() => {
                    const selected = users.find(u => u._id === formData.employeeId);
                    if (!selected) return null;
                    return (
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                        <div><strong>Name:</strong> {selected.firstName} {selected.lastName}</div>
                        <div><strong>ID:</strong> {selected.employeeCode || 'N/A'}</div>
                        <div><strong>Department:</strong> {selected.departmentName || 'Not Assigned'}</div>
                        <div><strong>Designation:</strong> {selected.designationName || 'Not Assigned'}</div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="sal-form-row">
                <div className="sal-form-group">
                  <label>Basic Salary (₹)</label>
                  <input type="number" name="basicSalary" value={formData.basicSalary} onChange={handleChange} required min="0" />
                </div>
                <div className="sal-form-group">
                  <label>Effective From</label>
                  <input type="date" name="effectiveFrom" value={formData.effectiveFrom} onChange={handleChange} required />
                </div>
              </div>

              <h4 className="sal-section-title">Allowances</h4>
              <div className="sal-form-row">
                <div className="sal-form-group">
                  <label>HRA</label>
                  <input type="number" name="hra" value={formData.hra} onChange={handleChange} min="0" />
                </div>
                <div className="sal-form-group">
                  <label>Travel</label>
                  <input type="number" name="travel" value={formData.travel} onChange={handleChange} min="0" />
                </div>
              </div>
              <div className="sal-form-row">
                <div className="sal-form-group">
                  <label>Medical</label>
                  <input type="number" name="medical" value={formData.medical} onChange={handleChange} min="0" />
                </div>
                <div className="sal-form-group">
                  <label>Other</label>
                  <input type="number" name="otherAllowance" value={formData.otherAllowance} onChange={handleChange} min="0" />
                </div>
              </div>

              <div className="sal-form-row">
                <div className="sal-form-group" style={{ flex: 1 }}>
                  <label>Gross Salary</label>
                  <input 
                    type="text" 
                    value={`₹${calculateGross().toLocaleString()}`} 
                    readOnly 
                    disabled 
                    style={{ backgroundColor: '#f3f4f6', color: '#374151', cursor: 'not-allowed', fontWeight: '500' }} 
                  />
                  <small style={{ color: '#6b7280', fontSize: '12px' }}>(Read-only / Automatically calculated)</small>
                </div>
              </div>

              <h4 className="sal-section-title">Deductions</h4>
              <div className="sal-form-row">
                <div className="sal-form-group">
                  <label>Tax</label>
                  <input type="number" name="tax" value={formData.tax} onChange={handleChange} min="0" />
                </div>
                <div className="sal-form-group">
                  <label>PF</label>
                  <input type="number" name="pf" value={formData.pf} onChange={handleChange} min="0" />
                </div>
              </div>
              <div className="sal-form-row">
                <div className="sal-form-group">
                  <label>Insurance</label>
                  <input type="number" name="insurance" value={formData.insurance} onChange={handleChange} min="0" />
                </div>
                <div className="sal-form-group">
                  <label>Other</label>
                  <input type="number" name="otherDeduction" value={formData.otherDeduction} onChange={handleChange} min="0" />
                </div>
              </div>

              <div className="sal-form-row">
                <div className="sal-form-group" style={{ flex: 1 }}>
                  <label>Net Salary</label>
                  <input 
                    type="text" 
                    value={`₹${calculateNet().toLocaleString()}`} 
                    readOnly 
                    disabled 
                    style={{ backgroundColor: '#f3f4f6', color: calculateNet() < 0 ? '#dc2626' : '#16a34a', cursor: 'not-allowed', fontWeight: 'bold' }} 
                  />
                  <small style={{ color: '#6b7280', fontSize: '12px' }}>(Read-only / Automatically calculated)</small>
                </div>
              </div>

              {calculateNet() < 0 && (
                <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '15px', fontWeight: '500' }}>
                  Error: Deductions cannot exceed Gross Salary. Net Salary cannot be negative.
                </div>
              )}

              <div className="sal-modal-actions">
                <button type="button" className="sal-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="sal-btn-primary" disabled={calculateNet() < 0}>Save Salary</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="sal-modal-overlay">
          <div className="sal-modal" style={{maxWidth: '800px'}}>
            <div className="sal-modal-header">
              <h3>Salary History</h3>
              <button className="sal-close-btn" onClick={() => setShowHistory(false)}>×</button>
            </div>
            <div className="sal-modal-body">
              {historyLoading ? <p>Loading history...</p> : (
                <table className="sal-table">
                  <thead>
                    <tr>
                      <th>Effective From</th>
                      <th>Basic</th>
                      <th>Gross</th>
                      <th>Net</th>
                      <th>Status</th>
                      <th>Created By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map(h => (
                      <tr key={h._id}>
                        <td>{new Date(h.effectiveFrom).toLocaleDateString()}</td>
                        <td>₹{h.basicSalary.toLocaleString()}</td>
                        <td>₹{h.grossSalary.toLocaleString()}</td>
                        <td>₹{h.netSalary.toLocaleString()}</td>
                        <td><span className={`sal-badge ${h.status.toLowerCase()}`}>{h.status}</span></td>
                        <td>{h.createdBy?.firstName} {h.createdBy?.lastName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryManagement;
