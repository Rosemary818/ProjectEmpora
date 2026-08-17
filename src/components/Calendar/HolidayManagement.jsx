import React, { useState, useEffect } from 'react';

const HolidayManagement = ({ onBack, user }) => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', date: '', description: '', _id: null });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/holidays`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setHolidays(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch holidays', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const url = formData._id ? `http://localhost:5000/api/holidays/${formData._id}` : `http://localhost:5000/api/holidays`;
      const method = formData._id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
        },
        body: JSON.stringify({
          name: formData.name,
          date: formData.date,
          description: formData.description
        })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setFormData({ name: '', date: '', description: '', _id: null });
        setShowForm(false);
        fetchHolidays();
      } else {
        setError(data.error || data.message || 'Failed to save holiday');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/holidays/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (res.ok) {
        fetchHolidays();
      }
    } catch (err) {
      console.error('Failed to delete holiday', err);
    }
  };

  const handleEdit = (holiday) => {
    setFormData({
      _id: holiday._id,
      name: holiday.name,
      date: new Date(holiday.date).toISOString().split('T')[0],
      description: holiday.description || ''
    });
    setShowForm(true);
  };

  return (
    <div className="emp-calendar-container">
      <div className="emp-calendar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="emp-calendar-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Back to Calendar
          </button>
          <h2>Manage Company Holidays</h2>
        </div>
        <button className="emp-calendar-btn primary" onClick={() => { setShowForm(true); setFormData({ name: '', date: '', description: '', _id: null }); }}>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Holiday
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1e293b' }}>{formData._id ? 'Edit Holiday' : 'Add New Holiday'}</h3>
          {error && <div style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Holiday Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Date</label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Description (Optional)</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', minHeight: '80px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="emp-calendar-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="emp-calendar-btn primary">Save Holiday</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading holidays...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 600 }}>Holiday Name</th>
                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 600 }}>Description</th>
                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No holidays added yet.</td>
                </tr>
              ) : (
                holidays.map(holiday => (
                  <tr key={holiday._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem', fontWeight: 500, color: '#0f172a' }}>{holiday.name}</td>
                    <td style={{ padding: '1rem', color: '#475569' }}>{new Date(holiday.date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', color: '#475569' }}>{holiday.description || '-'}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => handleEdit(holiday)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '1rem', fontWeight: 500 }}>Edit</button>
                      <button onClick={() => handleDelete(holiday._id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 500 }}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HolidayManagement;
