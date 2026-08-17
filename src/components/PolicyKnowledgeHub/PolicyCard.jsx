import React from 'react';
import './PolicyKnowledgeHub.css';

const PolicyCard = ({ policy, userRole, onView, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="pkh-card">
      <div className="pkh-card-header">
        <div>
          <span className="pkh-badge pkh-badge-category">{policy.category}</span>
          <h3 className="pkh-card-title">{policy.title}</h3>
        </div>
        {userRole === 'HR Admin' && (
          <span className={`pkh-badge ${policy.status === 'Active' ? 'pkh-badge-active' : 'pkh-badge-inactive'}`}>
            {policy.status}
          </span>
        )}
      </div>
      
      <p className="pkh-card-desc">
        {policy.description || 'No description provided.'}
      </p>

      <div className="pkh-card-footer">
        <button className="pkh-btn-outline" onClick={() => onView(policy)}>
          Read Policy
        </button>

        {userRole === 'HR Admin' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="pkh-btn-secondary" 
              style={{ padding: '0.5rem' }} 
              onClick={() => onEdit(policy)}
              title="Edit Policy"
            >
              ✏️
            </button>
            <button 
              className="pkh-btn-secondary" 
              style={{ padding: '0.5rem' }} 
              onClick={() => onToggleStatus(policy)}
              title={policy.status === 'Active' ? 'Deactivate' : 'Activate'}
            >
              {policy.status === 'Active' ? '⏸️' : '▶️'}
            </button>
            <button 
              className="pkh-btn-danger" 
              style={{ padding: '0.5rem' }} 
              onClick={() => onDelete(policy._id)}
              title="Delete Policy"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyCard;
