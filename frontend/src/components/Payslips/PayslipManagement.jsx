import React, { useState, useEffect, useRef } from 'react';
import './PayslipManagement.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PayslipTemplate from './PayslipTemplate';

const PayslipManagement = () => {
  const [payslips, setPayslips] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals
  const [showGenerate, setShowGenerate] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const payslipRef = useRef(null);

  const [filters, setFilters] = useState({ month: '', year: new Date().getFullYear(), status: '' });
  
  const [selectedRole, setSelectedRole] = useState(''); // 'Employee' or 'Manager'
  const [formData, setFormData] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    remarks: ''
  });

  useEffect(() => {
    fetchPayslips();
    fetchUsers();
  }, [filters]);

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      let query = `?year=${filters.year}`;
      if (filters.month) query += `&month=${filters.month}`;
      if (filters.status) query += `&paymentStatus=${filters.status}`;

      const res = await fetch(`http://localhost:5000/api/payslips${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setPayslips(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch payslips');
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

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/payslips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowGenerate(false);
        fetchPayslips();
        setSelectedRole('');
        alert('Payslip generated successfully!');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error generating payslip');
    }
  };

  const handleMarkPaid = async (id) => {
    if (!window.confirm('Mark this payslip as Paid?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/payslips/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ paymentStatus: 'Paid' })
      });
      const data = await res.json();
      if (data.success) {
        fetchPayslips();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleDownloadPDF = async () => {
    if (!payslipRef.current) return;
    
    // Temporarily hide the close/download buttons during capture (they are outside the ref anyway)
    try {
      const canvas = await html2canvas(payslipRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Payslip_${selectedPayslip.employeeId.firstName}_${selectedPayslip.month}_${selectedPayslip.year}.pdf`);
    } catch (error) {
      console.error("Could not generate PDF", error);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="ps-container">
      <div className="ps-header">
        <h2>Payslips</h2>
        <button className="ps-btn-primary" onClick={() => {
          setSelectedRole('');
          setFormData({
            employeeId: '',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            remarks: ''
          });
          setShowGenerate(true);
        }}>Generate Payslip</button>
      </div>

      {/* Filters */}
      <div className="ps-filters">
        <select value={filters.month} onChange={(e) => setFilters({...filters, month: e.target.value})}>
          <option value="">All Months</option>
          {monthNames.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
        <select value={filters.year} onChange={(e) => setFilters({...filters, year: e.target.value})}>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
        <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {error && <div className="ps-error">{error}</div>}

      <div className="ps-table-wrapper">
        {loading ? (
          <div className="ps-loading">Loading Payslips...</div>
        ) : (
          <table className="ps-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Period</th>
                <th>Gross Salary</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Generated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign: 'center'}}>No payslips found.</td></tr>
              ) : (
                payslips.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="ps-emp-name">{p.employeeId?.firstName} {p.employeeId?.lastName}</div>
                      <div className="ps-emp-code">{p.employeeId?.employeeCode}</div>
                    </td>
                    <td>{monthNames[p.month - 1]} {p.year}</td>
                    <td>₹{p.grossSalary.toLocaleString()}</td>
                    <td>₹{p.netSalary.toLocaleString()}</td>
                    <td>
                      <span className={`ps-badge ${p.paymentStatus.toLowerCase()}`}>{p.paymentStatus}</span>
                    </td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="ps-actions">
                        <button className="ps-btn-icon" onClick={() => { setSelectedPayslip(p); setShowView(true); }}>View</button>
                        {p.paymentStatus === 'Pending' && (
                          <button className="ps-btn-icon" onClick={() => handleMarkPaid(p._id)}>Mark Paid</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Generate Payslip Modal */}
      {showGenerate && (
        <div className="ps-modal-overlay">
          <div className="ps-modal" style={{maxWidth: '500px'}}>
            <div className="ps-modal-header">
              <h3>Generate Payslip</h3>
              <button className="ps-close-btn" onClick={() => setShowGenerate(false)}>×</button>
            </div>
            <form onSubmit={handleGenerate} className="ps-form">
              
              <div className="ps-form-group" style={{ marginBottom: '20px' }}>
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
                <div className="ps-form-group">
                  <label>{selectedRole === 'Employee' ? 'Employee' : 'Manager'}</label>
                  <select value={formData.employeeId} onChange={(e) => setFormData({...formData, employeeId: e.target.value})} required disabled={usersLoading || !!usersError || users.length === 0}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="ps-form-group">
                  <label>Month</label>
                  <select value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} required>
                    {monthNames.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div className="ps-form-group">
                  <label>Year</label>
                  <input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} required min="2000" />
                </div>
              </div>
              <div className="ps-form-group">
                <label>Remarks (Optional)</label>
                <input type="text" value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} />
              </div>
              <div className="ps-modal-actions">
                <button type="button" className="ps-btn-secondary" onClick={() => setShowGenerate(false)}>Cancel</button>
                <button type="submit" className="ps-btn-primary">Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Payslip Modal */}
      {showView && selectedPayslip && (
        <div className="ps-modal-overlay">
          <div className="ps-modal" style={{ maxWidth: '850px', background: '#f3f4f6' }}>
            <div className="ps-modal-header" style={{ background: 'white' }}>
              <h3>Payslip Preview</h3>
              <button className="ps-close-btn" onClick={() => setShowView(false)}>×</button>
            </div>
            <div className="ps-modal-body" style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              <PayslipTemplate payslip={selectedPayslip} ref={payslipRef} />
            </div>
            <div className="ps-modal-header" style={{ background: 'white', justifyContent: 'flex-end', gap: '10px' }}>
               <button className="ps-btn-secondary" onClick={() => setShowView(false)}>Close</button>
               <button className="ps-btn-primary" onClick={handleDownloadPDF}>Download PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayslipManagement;
