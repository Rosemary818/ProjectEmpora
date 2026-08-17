import React, { useState, useEffect, useRef } from 'react';
import './PayslipManagement.css'; // Reuse CSS
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PayslipTemplate from './PayslipTemplate';

const MyPayslips = ({ user }) => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // View Modal
  const [showView, setShowView] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const payslipRef = useRef(null);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      fetchMyPayslips(userId);
    } else if (user) {
      setLoading(false);
      setError('User ID is missing');
    }
  }, [user]);

  const fetchMyPayslips = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/payslips?employeeId=${userId}`, {
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

  const handleDownloadPDF = async () => {
    if (!payslipRef.current) return;
    
    try {
      const canvas = await html2canvas(payslipRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Payslip_${selectedPayslip.month}_${selectedPayslip.year}.pdf`);
    } catch (error) {
      console.error("Could not generate PDF", error);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="ps-container">
      <div className="ps-header">
        <h2>My Payslips</h2>
      </div>

      {error && <div className="ps-error">{error}</div>}

      <div className="ps-table-wrapper">
        {loading ? (
          <div className="ps-loading">Loading Payslips...</div>
        ) : (
          <table className="ps-table">
            <thead>
              <tr>
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
                <tr><td colSpan="6" style={{textAlign: 'center'}}>No payslips found.</td></tr>
              ) : (
                payslips.map((p) => (
                  <tr key={p._id}>
                    <td>{monthNames[p.month - 1]} {p.year}</td>
                    <td>₹{p.grossSalary.toLocaleString()}</td>
                    <td>₹{p.netSalary.toLocaleString()}</td>
                    <td>
                      <span className={`ps-badge ${p.paymentStatus.toLowerCase()}`}>{p.paymentStatus}</span>
                    </td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="ps-actions">
                        <button className="ps-btn-icon" onClick={() => { setSelectedPayslip(p); setShowView(true); }}>View / Download</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

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

export default MyPayslips;
