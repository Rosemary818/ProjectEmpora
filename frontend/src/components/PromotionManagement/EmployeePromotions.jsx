import React, { useState, useEffect } from 'react';
import './PromotionManagement.css';

const EmployeePromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPromotions = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:5000/api/promotions/my-promotions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setPromotions(data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch promotions');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  if (loading) return <div>Loading your promotion history...</div>;

  return (
    <div className="promo-container">
      <div className="promo-header" style={{ marginBottom: '1rem' }}>
        <h2>My Promotions</h2>
      </div>

      {error && <div className="promo-error-msg">{error}</div>}

      <div className="promo-table-container">
        <div className="promo-table-header">
          <h3>Promotion History</h3>
        </div>

        <table className="promo-table">
          <thead>
            <tr>
              <th>Previous Role</th>
              <th>New Role</th>
              <th>Department</th>
              <th>Effective Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {promotions.length > 0 ? (
              promotions.map((promo) => (
                <tr key={promo._id}>
                  <td>{promo.currentDesignationId?.designationName}</td>
                  <td style={{ fontWeight: 500, color: '#388087' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {promo.status === 'Effective' && <span>🏆</span>}
                      {promo.proposedDesignationId?.designationName}
                    </div>
                  </td>
                  <td>{promo.departmentId?.departmentName}</td>
                  <td>
                    {promo.effectiveDate
                      ? new Date(promo.effectiveDate).toLocaleDateString()
                      : 'Pending'}
                  </td>
                  <td>
                    <span className={`promo-status-badge promo-status-${promo.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {promo.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  No promotions found in your history.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeePromotions;
