import React from 'react';
import './PolicyKnowledgeHub.css';

const PolicyDetail = ({ policy, onBack }) => {
  if (!policy) return null;

  return (
    <div className="pkh-detail">
      <div className="pkh-detail-header">
        <button className="pkh-btn-secondary" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
          ← Back to Hub
        </button>
        <span className="pkh-badge pkh-badge-category" style={{ marginBottom: '1rem' }}>{policy.category}</span>
        <h2 className="pkh-detail-title">{policy.title}</h2>
        
        <div className="pkh-detail-meta">
          <span>Last Updated: {new Date(policy.updatedAt).toLocaleDateString()}</span>
          {policy.status === 'Active' ? (
            <span style={{ color: '#16a34a' }}>● Active</span>
          ) : (
            <span style={{ color: '#dc2626' }}>● Inactive</span>
          )}
        </div>
      </div>

      <div className="pkh-detail-content">
        {policy.content}
      </div>
    </div>
  );
};

export default PolicyDetail;
