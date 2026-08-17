import React, { useState, useEffect, useRef } from 'react';
import './SalaryManagement.css'; // Reuse CSS
import './MySalary.css'; // Dedicated CSS for MySalary
import PayslipTemplate from '../Payslips/PayslipTemplate';

const MySalary = ({ user }) => {
  const [salary, setSalary] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals for Payslip
  const [showView, setShowView] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const payslipRef = useRef(null);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      fetchMySalary(userId);
      fetchMyPayslips(userId);
    } else if (user) {
      // Fallback if user exists but has no id
      setLoading(false);
      setError('User ID is missing');
    }
  }, [user]);

  const fetchMyPayslips = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/payslips/employee/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setPayslips(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch payslips', err);
    }
  };

  const fetchMySalary = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/salaries/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setSalary(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch salary details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="sal-loading">Loading Salary Data...</div>;

  return (
    <div className="sal-container">
      <div className="sal-header">
        <h2>My Salary Details</h2>
      </div>

      {error && <div className="sal-error">{error}</div>}

      {!salary && !error ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', fontSize: '1.05rem', margin: 0 }}>No active salary record found.</p>
        </div>
      ) : salary && (
        <div className="mysal-grid">
          {/* Employee Info */}
          <div className="mysal-card">
            <h3 className="mysal-card-title">Employee Information</h3>
            <div className="mysal-row">
              <span className="mysal-label">Name</span>
              <span className="mysal-value">{user.firstName} {user.lastName}</span>
            </div>
            <div className="mysal-row">
              <span className="mysal-label">Employee ID</span>
              <span className="mysal-value">{user.employeeCode}</span>
            </div>
            <div className="mysal-row">
              <span className="mysal-label">Effective From</span>
              <span className="mysal-value">{new Date(salary.effectiveFrom).toLocaleDateString()}</span>
            </div>
            <div className="mysal-row">
              <span className="mysal-label">Payment Frequency</span>
              <span className="mysal-value">{salary.paymentFrequency}</span>
            </div>
          </div>

          {/* Salary Overview */}
          <div className="mysal-card">
            <h3 className="mysal-card-title">Salary Overview</h3>
            <div className="mysal-row">
              <span className="mysal-label">Basic Salary</span>
              <span className="mysal-value">₹{salary.basicSalary.toLocaleString()}</span>
            </div>
            <div className="mysal-row">
              <span className="mysal-label">Gross Salary</span>
              <span className="mysal-value">₹{salary.grossSalary.toLocaleString()}</span>
            </div>
            <div className="mysal-row" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #e5e7eb' }}>
              <span className="mysal-label" style={{ color: '#111827', fontWeight: 600 }}>Net Salary</span>
              <span className="mysal-value net-salary">₹{salary.netSalary.toLocaleString()}</span>
            </div>
          </div>

          {/* Allowances */}
          <div className="mysal-card">
            <h3 className="mysal-card-title">Allowances</h3>
            <div className="mysal-row">
              <span className="mysal-label">HRA</span>
              <span className="mysal-value">₹{salary.allowances.hra.toLocaleString()}</span>
            </div>
            <div className="mysal-row">
              <span className="mysal-label">Travel</span>
              <span className="mysal-value">₹{salary.allowances.travel.toLocaleString()}</span>
            </div>
            <div className="mysal-row">
              <span className="mysal-label">Medical</span>
              <span className="mysal-value">₹{salary.allowances.medical.toLocaleString()}</span>
            </div>
            <div className="mysal-row">
              <span className="mysal-label">Other</span>
              <span className="mysal-value">₹{salary.allowances.other.toLocaleString()}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="mysal-card">
            <h3 className="mysal-card-title">Deductions</h3>
            <div className="mysal-row">
              <span className="mysal-label">Tax</span>
              <span className="mysal-value">₹{salary.deductions.tax.toLocaleString()}</span>
            </div>
            <div className="mysal-row">
              <span className="mysal-label">PF</span>
              <span className="mysal-value">₹{salary.deductions.pf.toLocaleString()}</span>
            </div>
            <div className="mysal-row">
              <span className="mysal-label">Insurance</span>
              <span className="mysal-value">₹{salary.deductions.insurance.toLocaleString()}</span>
            </div>
            <div className="mysal-row">
              <span className="mysal-label">Other</span>
              <span className="mysal-value">₹{salary.deductions.other.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payslip History Section */}
      <div className="mysal-history-section">
        <h3 className="mysal-card-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Payslip History</h3>
        {payslips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <p style={{ color: '#6b7280', fontSize: '1.05rem', margin: 0 }}>No payslips generated yet.</p>
          </div>
        ) : (
          <div>
            {payslips.map(p => {
              const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
              return (
                <div key={p._id} className="mysal-payslip-card">
                  <div className="mysal-payslip-left">
                    <h4>{monthNames[p.month - 1]} {p.year}</h4>
                    <div className="mysal-payslip-date">Generated: {new Date(p.createdAt).toLocaleDateString()}</div>
                    <div className="mysal-payslip-amounts">
                      <div className="mysal-amount-item">
                        <span className="label">Gross:</span>
                        <span className="val">₹{p.grossSalary.toLocaleString()}</span>
                      </div>
                      <div className="mysal-amount-item">
                        <span className="label">Net:</span>
                        <span className="val net">₹{p.netSalary.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mysal-payslip-right">
                    <span className={p.paymentStatus === 'Paid' ? 'mysal-status-paid' : 'mysal-status-other'}>
                      {p.paymentStatus}
                    </span>
                    <button 
                      className="mysal-btn"
                      onClick={() => { setSelectedPayslip(p); setShowView(true); }}
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Payslip Modal */}
      {showView && selectedPayslip && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '8px', position: 'relative' }}>
            <div style={{ position: 'sticky', top: 0, background: 'white', padding: '15px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
              <h3 style={{ margin: 0 }}>Payslip Details</h3>
              <div>
                <button onClick={() => setShowView(false)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}>×</button>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <PayslipTemplate payslip={selectedPayslip} ref={payslipRef} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MySalary;
