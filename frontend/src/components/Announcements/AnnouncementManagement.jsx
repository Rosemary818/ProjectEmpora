import React, { useState, useEffect } from 'react';
import { announcementService } from '../../utils/announcementService';
import './AnnouncementManagement.css';

const AnnouncementManagement = ({ user, viewType }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'General',
    priority: 'Normal',
    targetAudience: 'All Employees',
    expiresAt: ''
  });

  const isEditor = viewType === 'HRAdmin' || viewType === 'SuperAdmin';

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await announcementService.getAnnouncements();
      if (res.success) {
        setAnnouncements(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateDraft = async (e) => {
    e.preventDefault();
    try {
      const res = await announcementService.createAnnouncement({ ...formData, status: 'Draft' });
      if (res.success) {
        setShowModal(false);
        fetchAnnouncements();
      }
    } catch (err) {
      alert('Error creating announcement');
    }
  };

  const handleCreateAndPublish = async (e) => {
    e.preventDefault();
    try {
      const res = await announcementService.createAnnouncement({ ...formData, status: 'Published' });
      if (res.success) {
        setShowModal(false);
        fetchAnnouncements();
      }
    } catch (err) {
      alert('Error publishing announcement');
    }
  };

  const handlePublish = async (id) => {
    try {
      const res = await announcementService.publishAnnouncement(id);
      if (res.success) {
        fetchAnnouncements();
      }
    } catch (err) {
      alert('Error publishing announcement');
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Are you sure you want to archive this announcement?')) return;
    try {
      const res = await announcementService.archiveAnnouncement(id);
      if (res.success) {
        fetchAnnouncements();
      }
    } catch (err) {
      alert('Error archiving announcement');
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this announcement?')) return;
    try {
      const res = await announcementService.deleteAnnouncement(id);
      if (res.success) {
        fetchAnnouncements();
      }
    } catch (err) {
      alert('Error deleting announcement');
    }
  };

  // Filter processing
  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(searchTerm.toLowerCase()) || ann.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? ann.category === categoryFilter : true;
    const matchesPriority = priorityFilter ? ann.priority === priorityFilter : true;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  return (
    <div className="ann-management">
      <div className="ann-header">
        <h2>{isEditor ? 'Manage Announcements' : 'Company Announcements'}</h2>
        {isEditor && (
          <button className="ann-btn-primary" onClick={() => setShowModal(true)}>
            Create Announcement
          </button>
        )}
      </div>

      <div className="ann-filters">
        <input 
          type="text" 
          placeholder="Search announcements..." 
          className="ann-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="ann-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="General">General</option>
          <option value="HR">HR</option>
          <option value="Policy">Policy</option>
          <option value="Leave">Leave</option>
          <option value="Events">Events</option>
          <option value="Important">Important</option>
        </select>
        <select 
          className="ann-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="Normal">Normal</option>
          <option value="Important">Important</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      <div className="ann-body">
        {loading ? (
          <div className="ann-loading">Loading announcements...</div>
        ) : error ? (
          <div className="ann-error">{error}</div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="ann-empty">No announcements found.</div>
        ) : (
          <div className="ann-list">
            {filteredAnnouncements.map(ann => (
              <div key={ann._id} className={`ann-card priority-${ann.priority.toLowerCase()}`}>
                <div className="ann-card-header">
                  <div className="ann-card-title-group">
                    <span className="ann-badge-category">{ann.category}</span>
                    {ann.priority !== 'Normal' && (
                      <span className={`ann-badge-priority ${ann.priority.toLowerCase()}`}>{ann.priority}</span>
                    )}
                    {isEditor && <span className={`ann-badge-status ${ann.status.toLowerCase()}`}>{ann.status}</span>}
                  </div>
                  <div className="ann-card-date">
                    {ann.publishedAt ? new Date(ann.publishedAt).toLocaleDateString() : 'Draft'}
                  </div>
                </div>
                
                <h3 className="ann-card-title">{ann.title}</h3>
                <p className="ann-card-summary">{ann.summary}</p>
                
                <div className="ann-card-content">
                  {ann.content}
                </div>
                
                <div className="ann-card-footer">
                  <span className="ann-author">
                    Published by: {ann.publishedBy?.firstName} {ann.publishedBy?.lastName}
                  </span>
                  
                  {isEditor && (
                    <div className="ann-actions">
                      {ann.status === 'Draft' && (
                        <button className="ann-btn-text text-success" onClick={() => handlePublish(ann._id)}>Publish</button>
                      )}
                      {ann.status === 'Published' && (
                        <button className="ann-btn-text text-warning" onClick={() => handleArchive(ann._id)}>Archive</button>
                      )}
                      <button className="ann-btn-text text-danger" onClick={() => handleDelete(ann._id)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && isEditor && (
        <div className="ann-modal-overlay">
          <div className="ann-modal">
            <div className="ann-modal-header">
              <h3>Create Announcement</h3>
              <button className="ann-close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="ann-modal-body">
              <form>
                <div className="ann-form-group">
                  <label>Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                
                <div className="ann-form-group">
                  <label>Summary *</label>
                  <input type="text" name="summary" value={formData.summary} onChange={handleInputChange} required />
                </div>
                
                <div className="ann-form-group">
                  <label>Content *</label>
                  <textarea name="content" value={formData.content} onChange={handleInputChange} rows="4" required></textarea>
                </div>
                
                <div className="ann-form-row">
                  <div className="ann-form-group">
                    <label>Category *</label>
                    <select name="category" value={formData.category} onChange={handleInputChange}>
                      <option value="General">General</option>
                      <option value="HR">HR</option>
                      <option value="Policy">Policy</option>
                      <option value="Leave">Leave</option>
                      <option value="Attendance">Attendance</option>
                      <option value="Payroll">Payroll</option>
                      <option value="Events">Events</option>
                      <option value="Important">Important</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="ann-form-group">
                    <label>Priority *</label>
                    <select name="priority" value={formData.priority} onChange={handleInputChange}>
                      <option value="Normal">Normal</option>
                      <option value="Important">Important</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                
                <div className="ann-form-row">
                  <div className="ann-form-group">
                    <label>Target Audience *</label>
                    <select name="targetAudience" value={formData.targetAudience} onChange={handleInputChange}>
                      <option value="All Employees">All Employees</option>
                      <option value="Employees">Employees Only</option>
                      <option value="Managers">Managers Only</option>
                      <option value="HR Admins">HR Admins Only</option>
                    </select>
                  </div>
                  
                  <div className="ann-form-group">
                    <label>Expiry Date (Optional)</label>
                    <input type="date" name="expiresAt" value={formData.expiresAt} onChange={handleInputChange} />
                  </div>
                </div>
                
              </form>
            </div>
            <div className="ann-modal-footer">
              <button className="ann-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="ann-btn-primary outline" onClick={handleCreateDraft}>Save as Draft</button>
              <button className="ann-btn-primary" onClick={handleCreateAndPublish}>Publish Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManagement;
