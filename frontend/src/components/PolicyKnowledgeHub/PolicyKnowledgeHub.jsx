import React, { useState, useEffect } from 'react';
import './PolicyKnowledgeHub.css';
import PolicyCard from './PolicyCard';
import PolicyDetail from './PolicyDetail';
import PolicyForm from './PolicyForm';

const CATEGORIES = [
  'All',
  'Leave',
  'Attendance',
  'Work From Home',
  'Code of Conduct',
  'IT & Security',
  'Holiday',
  'Travel',
  'Payroll & Salary',
  'Employee Benefits',
  'General HR'
];

const PolicyKnowledgeHub = ({ userRole, user }) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // View states: 'list', 'detail', 'form'
  const [view, setView] = useState('list');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchPolicies();
  }, [categoryFilter, searchQuery]); // Refetch if using server-side search/filter, or just fetch once and filter client-side. We'll do server-side.

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/policies?';
      if (categoryFilter !== 'All') url += `category=${encodeURIComponent(categoryFilter)}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setPolicies(data.data);
      } else {
        setError(data.message || 'Failed to fetch policies');
      }
    } catch (err) {
      setError('Network error. Failed to load policies.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedPolicy(null);
    setView('form');
  };

  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    setView('form');
  };

  const handleView = (policy) => {
    setSelectedPolicy(policy);
    setView('detail');
  };

  const handleDelete = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/policies/${policyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      
      if (res.ok) {
        setPolicies(prev => prev.filter(p => p._id !== policyId));
      } else {
        alert('Failed to delete policy');
      }
    } catch (err) {
      alert('Error deleting policy');
    }
  };

  const handleToggleStatus = async (policy) => {
    const newStatus = policy.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`http://localhost:5000/api/policies/${policy._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        fetchPolicies(); // Refresh the list
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleSavePolicy = async (formData, policyId) => {
    try {
      const url = policyId 
        ? `http://localhost:5000/api/policies/${policyId}`
        : `http://localhost:5000/api/policies`;
      
      const method = policyId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        fetchPolicies();
        setView('list');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to save policy');
      }
    } catch (err) {
      alert('Error saving policy');
    }
  };

  return (
    <div className="pkh-container">
      {view === 'list' && (
        <>
          <div className="pkh-header">
            <div>
              <h2>Policy & HR Knowledge Hub</h2>
              <p>Browse company policies, guidelines, and HR resources.</p>
            </div>
            {userRole === 'HR Admin' && (
              <button className="pkh-btn-primary" onClick={handleCreateNew}>
                + Add Policy
              </button>
            )}
          </div>

          <div className="pkh-controls">
            <input 
              type="text"
              placeholder="🔍 Search policies..."
              className="pkh-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              // Trigger search on enter could be added, but since we have a useEffect on searchQuery it searches on type.
              // To avoid too many requests, a debounce could be implemented here. For simplicity, we trigger on change.
            />
            
            <select 
              className="pkh-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {error && <div className="pkh-badge pkh-badge-inactive" style={{ marginBottom: '1rem', padding: '1rem', display: 'block' }}>{error}</div>}

          {loading ? (
            <div className="pkh-empty-state">Loading policies...</div>
          ) : policies.length > 0 ? (
            <div className="pkh-grid">
              {policies.map(policy => (
                <PolicyCard 
                  key={policy._id}
                  policy={policy}
                  userRole={userRole}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          ) : (
            <div className="pkh-empty-state">
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>📚</span>
              <h3>No policies found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </>
      )}

      {view === 'detail' && (
        <PolicyDetail 
          policy={selectedPolicy} 
          onBack={() => setView('list')} 
        />
      )}

      {view === 'form' && (
        <PolicyForm 
          policy={selectedPolicy}
          onSave={handleSavePolicy}
          onCancel={() => setView('list')}
        />
      )}
    </div>
  );
};

export default PolicyKnowledgeHub;
