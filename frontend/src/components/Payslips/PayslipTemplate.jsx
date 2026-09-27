import React, { forwardRef } from 'react';

const PayslipTemplate = forwardRef(({ payslip, companyName = "EMPORA" }, ref) => {
  if (!payslip) return null;

  const { employeeId, salaryId, allowances, deductions } = payslip;
  const gross = payslip.grossSalary || 0;
  const net = payslip.netSalary || 0;
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = monthNames[payslip.month - 1];

  return (
    <div ref={ref} style={{
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px',
      background: 'white',
      fontFamily: '"Inter", sans-serif',
      color: '#111827',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: '20px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '2px', color: '#388087' }}>{companyName}</h1>
        <h2 style={{ margin: '10px 0 0', fontSize: '18px', fontWeight: 500 }}>Salary Payslip</h2>
        <p style={{ margin: '5px 0 0', color: '#6b7280' }}>For the month of {monthName} {payslip.year}</p>
      </div>

      {/* Employee Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div>
          <p style={{ margin: '5px 0' }}><strong>Employee Name:</strong> {employeeId?.firstName} {employeeId?.lastName}</p>
          <p style={{ margin: '5px 0' }}><strong>Employee ID:</strong> {employeeId?.employeeCode}</p>
        </div>
        <div>
          <p style={{ margin: '5px 0' }}><strong>Department:</strong> {employeeId?.department}</p>
          <p style={{ margin: '5px 0' }}><strong>Designation:</strong> {employeeId?.designationId?.designationName || 'N/A'}</p>
        </div>
      </div>

      {/* Salary Details Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        
        {/* Earnings */}
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Earnings</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Basic Salary</td><td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>{payslip.basicSalary.toLocaleString()}</td></tr>
              <tr><td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>HRA</td><td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>{allowances.hra.toLocaleString()}</td></tr>
              <tr><td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Travel Allowance</td><td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>{allowances.travel.toLocaleString()}</td></tr>
              <tr><td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Medical Allowance</td><td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>{allowances.medical.toLocaleString()}</td></tr>
              <tr><td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Other Allowance</td><td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>{allowances.other.toLocaleString()}</td></tr>
              <tr style={{ fontWeight: 'bold' }}>
                <td style={{ padding: '8px', borderTop: '2px solid #d1d5db' }}>Gross Salary</td>
                <td style={{ padding: '8px', textAlign: 'right', borderTop: '2px solid #d1d5db' }}>{gross.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deductions */}
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Deductions</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Tax</td><td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>{deductions.tax.toLocaleString()}</td></tr>
              <tr><td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>PF</td><td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>{deductions.pf.toLocaleString()}</td></tr>
              <tr><td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Insurance</td><td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>{deductions.insurance.toLocaleString()}</td></tr>
              <tr><td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Other Deduction</td><td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>{deductions.other.toLocaleString()}</td></tr>
              {/* Empty row to balance table height if needed */}
              <tr><td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>&nbsp;</td><td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}></td></tr>
              <tr style={{ fontWeight: 'bold' }}>
                <td style={{ padding: '8px', borderTop: '2px solid #d1d5db' }}>Total Deductions</td>
                <td style={{ padding: '8px', textAlign: 'right', borderTop: '2px solid #d1d5db' }}>{(gross - net).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* Net Salary & Status */}
      <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: '#374151', fontSize: '14px' }}>Net Salary</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>₹{net.toLocaleString()}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 5px', fontSize: '14px' }}><strong>Status:</strong> {payslip.paymentStatus}</p>
          {payslip.paymentDate && <p style={{ margin: 0, fontSize: '14px' }}><strong>Paid On:</strong> {new Date(payslip.paymentDate).toLocaleDateString()}</p>}
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#9ca3af', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
        <p>This is a system generated payslip. Generated on {new Date(payslip.createdAt).toLocaleString()}</p>
      </div>

    </div>
  );
});

export default PayslipTemplate;
