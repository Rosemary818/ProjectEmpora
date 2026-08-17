import React, { useState, useEffect } from 'react';
import './PolicyKnowledgeHub.css';

const CATEGORIES = [
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

const PolicyForm = ({ policy, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    description: '',
    content: '',
    status: 'Active'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (policy) {
      setFormData({
        title: policy.title || '',
        category: policy.category || CATEGORIES[0],
        description: policy.description || '',
        content: policy.content || '',
        status: policy.status || 'Active'
      });
    }
  }, [policy]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData, policy?._id);
    setIsSubmitting(false);
  };

  return (
    <div className="pkh-form">
      <h2 style={{ marginBottom: '2rem' }}>
        {policy ? 'Edit Policy' : 'Create New Policy'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="pkh-form-group">
          <label className="pkh-form-label">Policy Title *</label>
          <input 
            type="text" 
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="pkh-form-input"
            required
            placeholder="e.g. Remote Work Guidelines"
          />
        </div>

        <div className="pkh-form-group">
          <label className="pkh-form-label">Category *</label>
          <select 
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="pkh-form-select"
            required
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="pkh-form-group">
          <label className="pkh-form-label">Short Description</label>
          <input 
            type="text" 
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="pkh-form-input"
            placeholder="Brief summary of the policy"
          />
        </div>

        <div className="pkh-form-group">
          <label className="pkh-form-label">Policy Content *</label>
          <textarea 
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="pkh-form-textarea"
            required
            placeholder="Write the full policy content here..."
          />
        </div>

        <div className="pkh-form-group">
          <label className="pkh-form-label">Status</label>
          <select 
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="pkh-form-select"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <small style={{ color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
            Only Active policies are visible to employees and managers.
          </small>
        </div>

        <div className="pkh-form-actions">
          <button type="button" className="pkh-btn-secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="pkh-btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (policy ? 'Update Policy' : 'Publish Policy')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PolicyForm;
