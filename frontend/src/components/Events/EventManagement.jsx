import React, { useState, useEffect } from 'react';
import { eventService } from '../../utils/eventService';
import './EventManagement.css';

const EventManagement = ({ user, viewType }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Company Event',
    eventDate: '',
    startTime: '',
    endTime: '',
    location: '',
    meetingLink: '',
    targetAudience: 'All Internal Users',
    suggestedTalents: '',
    maxParticipants: '',
    registrationDeadline: '',
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editMatchingEmployees, setEditMatchingEmployees] = useState([]);

  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [postponeEventId, setPostponeEventId] = useState(null);
  const [postponeData, setPostponeData] = useState({
    newDate: '',
    reason: ''
  });

  const [matchingTalentModal, setMatchingTalentModal] = useState({ isOpen: false, eventId: null, employees: [], eventTitle: '' });
  const [selectedForInvite, setSelectedForInvite] = useState([]);

  const isEditor = viewType === 'HRAdmin' || viewType === 'SuperAdmin';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventService.getEvents();
      if (res.success) {
        setEvents(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  useEffect(() => {
    if (showEditModal && editFormData.suggestedTalents !== undefined) {
      const delayDebounceFn = setTimeout(() => {
        fetchMatchingTalentForEdit(editFormData.suggestedTalents);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [showEditModal, editFormData.suggestedTalents]);

  const fetchMatchingTalentForEdit = async (talentsStr) => {
    if (!talentsStr || talentsStr.trim() === '') {
      setEditMatchingEmployees([]);
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/skills/all-employee-skills', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        const talents = talentsStr.split(',').map(s => s.trim()).filter(Boolean);
        const matching = data.data.filter(s => talents.includes(s.skillId?.name));
        const uniqueUsersMap = new Map();
        matching.forEach(item => {
          if (item.userId) {
            uniqueUsersMap.set(item.userId._id, { ...item.userId, talent: item.skillId?.name, level: item.level });
          }
        });
        setEditMatchingEmployees(Array.from(uniqueUsersMap.values()));
      }
    } catch (err) {
      console.error('Error fetching matching talent for preview', err);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.suggestedTalents) {
        payload.suggestedTalents = payload.suggestedTalents.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        payload.suggestedTalents = [];
      }
      const res = await eventService.createEvent(payload);
      if (res.success) {
        await eventService.publishEvent(res.data._id);
        setShowModal(false);
        setFormData({
          title: '', description: '', category: 'Company Event', eventDate: '',
          startTime: '', endTime: '', location: '', meetingLink: '',
          targetAudience: 'All Internal Users', suggestedTalents: '', maxParticipants: '', registrationDeadline: ''
        });
        fetchEvents();
      }
    } catch (err) {
      alert('Error creating event');
    }
  };

  const handleEditClick = (evt) => {
    setEditEventId(evt._id);
    setEditFormData({
      title: evt.title || '',
      description: evt.description || '',
      category: evt.category || 'Company Event',
      eventDate: evt.eventDate ? evt.eventDate.split('T')[0] : '',
      startTime: evt.startTime || '',
      endTime: evt.endTime || '',
      location: evt.location || '',
      meetingLink: evt.meetingLink || '',
      targetAudience: evt.targetAudience || 'All Internal Users',
      suggestedTalents: evt.suggestedTalents ? evt.suggestedTalents.join(', ') : '',
      maxParticipants: evt.maxParticipants || '',
      registrationDeadline: evt.registrationDeadline ? evt.registrationDeadline.split('T')[0] : '',
      status: evt.status,
      hasInvitedParticipants: evt.hasInvitedParticipants || false,
    });
    setEditMatchingEmployees([]);
    setShowEditModal(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();

    // Validation
    if (editFormData.eventDate && new Date(editFormData.eventDate) < new Date(new Date().setHours(0,0,0,0))) {
      return alert('Event Date cannot be in the past.');
    }
    if (editFormData.startTime && editFormData.endTime && editFormData.endTime <= editFormData.startTime) {
      return alert('End Time must be after Start Time.');
    }
    if (editFormData.registrationDeadline && editFormData.eventDate && new Date(editFormData.registrationDeadline) > new Date(editFormData.eventDate)) {
      return alert('Registration Deadline cannot be after the Event Date.');
    }

    let notifyParticipants = false;
    if (editFormData.hasInvitedParticipants) {
      const confirmMsg = "This event already has invited participants. Do you want to update the event and notify participants?";
      notifyParticipants = window.confirm(confirmMsg);
    }

    try {
      const payload = { ...editFormData, notifyParticipants };
      if (payload.suggestedTalents !== undefined) {
        payload.suggestedTalents = payload.suggestedTalents.split(',').map(s => s.trim()).filter(Boolean);
      }
      
      const res = await eventService.updateEvent(editEventId, payload);
      if (res.success) {
        setShowEditModal(false);
        fetchEvents();
      } else {
        alert(res.message || 'Error updating event');
      }
    } catch (err) {
      alert('Error updating event');
    }
  };

  const handleCancelEvent = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this event?')) return;
    try {
      const res = await eventService.cancelEvent(id);
      if (res.success) {
        fetchEvents();
      }
    } catch (err) {
      alert('Error cancelling event');
    }
  };
  
  const handlePostponeClick = (id) => {
    setPostponeEventId(id);
    setPostponeData({ newDate: '', reason: '' });
    setShowPostponeModal(true);
  };

  const handlePostponeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await eventService.postponeEvent(postponeEventId, postponeData);
      if (res.success) {
        setShowPostponeModal(false);
        fetchEvents();
      }
    } catch (err) {
      alert('Error postponing event');
    }
  };
  
  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this event?')) return;
    try {
      const res = await eventService.deleteEvent(id);
      if (res.success) {
        fetchEvents();
      }
    } catch (err) {
      alert('Error deleting event');
    }
  };

  const handleWhatsAppShare = (evt) => {
    const dateStr = new Date(evt.eventDate).toLocaleDateString();
    let text = `📢 ${evt.title}\n\n📅 Date: ${dateStr}`;
    if (evt.startTime) text += `\n⏰ Time: ${evt.startTime}`;
    if (evt.location) text += `\n📍 Location: ${evt.location}`;
    if (evt.meetingLink) text += `\n🔗 Link: ${evt.meetingLink}`;
    text += `\n\nPlease check Empora for more details.`;
    
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const handleFindMatchingTalent = async (event) => {
    try {
      const res = await fetch('http://localhost:5000/api/skills/all-employee-skills', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        const talents = event.suggestedTalents || [];
        const matching = data.data.filter(s => talents.includes(s.skillId?.name));
        const uniqueUsersMap = new Map();
        matching.forEach(item => {
          if (item.userId) {
            uniqueUsersMap.set(item.userId._id, { ...item.userId, talent: item.skillId?.name, level: item.level });
          }
        });
        const uniqueUsers = Array.from(uniqueUsersMap.values());
        
        setMatchingTalentModal({ isOpen: true, eventId: event._id, employees: uniqueUsers, eventTitle: event.title });
        setSelectedForInvite([]);
      }
    } catch (err) {
      alert('Error finding matching talent');
    }
  };

  const handleInvite = async (type) => {
    let userIds = [];
    if (type === 'selected') {
      userIds = selectedForInvite;
    } else if (type === 'all') {
      userIds = matchingTalentModal.employees.map(e => e._id);
    }

    if (userIds.length === 0) return alert('No users to invite');

    try {
      const res = await fetch(`http://localhost:5000/api/events/${matchingTalentModal.eventId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ userIds })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Invitations sent successfully!');
        setMatchingTalentModal({ isOpen: false, eventId: null, employees: [], eventTitle: '' });
      } else {
        alert(data.error || 'Failed to send invitations');
      }
    } catch (err) {
      alert('Error sending invitations');
    }
  };

  const toggleInviteSelection = (userId) => {
    if (selectedForInvite.includes(userId)) {
      setSelectedForInvite(selectedForInvite.filter(id => id !== userId));
    } else {
      setSelectedForInvite([...selectedForInvite, userId]);
    }
  };

  // Filter processing
  const filteredEvents = events.filter(evt => {
    const matchesSearch = evt.title.toLowerCase().includes(searchTerm.toLowerCase()) || evt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? evt.category === categoryFilter : true;
    const matchesStatus = statusFilter ? evt.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="evt-management">
      <div className="evt-header">
        <h2>{isEditor ? 'Manage Events' : 'Events'}</h2>
        {isEditor && (
          <button className="evt-btn-primary" onClick={() => setShowModal(true)}>
            Create Event
          </button>
        )}
      </div>

      <div className="evt-filters">
        <input 
          type="text" 
          placeholder="Search events..." 
          className="evt-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="evt-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Company Event">Company Event</option>
          <option value="Meeting">Meeting</option>
          <option value="Training">Training</option>
          <option value="Workshop">Workshop</option>
          <option value="Holiday">Holiday</option>
          <option value="Birthday">Birthday</option>
          <option value="Work Anniversary">Work Anniversary</option>
          <option value="Other">Other</option>
        </select>
        <select 
          className="evt-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Today">Today</option>
          <option value="Completed">Completed</option>
          <option value="Postponed">Postponed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="evt-body">
        {loading ? (
          <div className="evt-loading">Loading events...</div>
        ) : error ? (
          <div className="evt-error">{error}</div>
        ) : filteredEvents.length === 0 ? (
          <div className="evt-empty">No events found.</div>
        ) : (
          <div className="evt-grid">
            {filteredEvents.map(evt => (
              <div key={evt._id} className="evt-card">
                <div className="evt-card-header">
                  <div className="evt-badge-group">
                    <span className="evt-badge category">{evt.category}</span>
                    <span className={`evt-badge status ${evt.status.toLowerCase()}`}>{evt.status}</span>
                  </div>
                  {(viewType === 'Manager' || isEditor) && (
                    <button className="evt-btn-icon" title="Share via WhatsApp" onClick={() => handleWhatsAppShare(evt)}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <h3 className="evt-card-title">{evt.title}</h3>
                
                <div className="evt-card-meta">
                  <div className="evt-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    {new Date(evt.eventDate).toLocaleDateString()}
                  </div>
                  {(evt.startTime || evt.endTime) && (
                    <div className="evt-meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      {evt.startTime || ''} {evt.endTime ? `- ${evt.endTime}` : ''}
                    </div>
                  )}
                  {evt.location && (
                    <div className="evt-meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      {evt.location}
                    </div>
                  )}
                </div>
                
                <div className="evt-card-desc">
                  {evt.description}
                </div>
                
                <div className="evt-card-footer">
                  <div className="evt-organizer">
                    Organizer: {evt.organizerId?.firstName} {evt.organizerId?.lastName}
                  </div>
                  
                  <div className="evt-actions">
                    {evt.meetingLink && (evt.status === 'Upcoming' || evt.status === 'Today' || evt.status === 'Ongoing') && (
                      <a href={evt.meetingLink} target="_blank" rel="noreferrer" className="evt-btn-primary outline small">Join Meeting</a>
                    )}
                    {isEditor && evt.status !== 'Cancelled' && (
                      <button className="evt-btn-primary outline small" onClick={() => handleEditClick(evt)}>Edit</button>
                    )}
                    {isEditor && evt.suggestedTalents && evt.suggestedTalents.length > 0 && evt.status !== 'Cancelled' && (
                      <button className="evt-btn-primary outline small" onClick={() => handleFindMatchingTalent(evt)}>Find Matching Talent</button>
                    )}
                    {isEditor && evt.status !== 'Cancelled' && (
                      <button className="evt-btn-text text-warning" onClick={() => handlePostponeClick(evt._id)}>Postpone</button>
                    )}
                    {isEditor && evt.status !== 'Cancelled' && (
                      <button className="evt-btn-text text-danger" onClick={() => handleCancelEvent(evt._id)}>Cancel</button>
                    )}
                    {isEditor && (
                      <button className="evt-btn-text text-danger" onClick={() => handleDeleteEvent(evt._id)}>Delete</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && isEditor && (
        <div className="evt-modal-overlay">
          <div className="evt-modal">
            <div className="evt-modal-header">
              <h3>Create Event</h3>
              <button className="evt-close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="evt-modal-body">
              <form id="createEventForm" onSubmit={handleCreateEvent}>
                <div className="evt-form-group">
                  <label>Event Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                
                <div className="evt-form-group">
                  <label>Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required></textarea>
                </div>
                
                <div className="evt-form-row">
                  <div className="evt-form-group">
                    <label>Category *</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} required>
                      <option value="Company Event">Company Event</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Training">Training</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Holiday">Holiday</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Work Anniversary">Work Anniversary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="evt-form-group">
                    <label>Target Audience *</label>
                    <select name="targetAudience" value={formData.targetAudience} onChange={handleInputChange} required>
                      <option value="All Internal Users">All Internal Users</option>
                      <option value="All Employees">All Employees</option>
                      <option value="Employees">Employees Only</option>
                      <option value="Managers">Managers Only</option>
                      <option value="HR Admins">HR Admins Only</option>
                    </select>
                  </div>
                </div>

                <div className="evt-form-row">
                  <div className="evt-form-group">
                    <label>Event Date *</label>
                    <input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} required />
                  </div>
                  <div className="evt-form-group">
                    <label>Start Time (Optional)</label>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} />
                  </div>
                  <div className="evt-form-group">
                    <label>End Time (Optional)</label>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} />
                  </div>
                </div>
                
                <div className="evt-form-row">
                  <div className="evt-form-group">
                    <label>Location (Optional)</label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Main Auditorium" />
                  </div>
                  <div className="evt-form-group">
                    <label>Meeting Link (Optional)</label>
                    <input type="url" name="meetingLink" value={formData.meetingLink} onChange={handleInputChange} placeholder="https://zoom.us/..." />
                  </div>
                </div>

                <div className="evt-form-row">
                  <div className="evt-form-group">
                    <label>Maximum Participants (Optional)</label>
                    <input type="number" name="maxParticipants" value={formData.maxParticipants || ''} onChange={handleInputChange} min="1" />
                  </div>
                  <div className="evt-form-group">
                    <label>Registration Deadline (Optional)</label>
                    <input type="date" name="registrationDeadline" value={formData.registrationDeadline || ''} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="evt-form-row">
                  <div className="evt-form-group" style={{ width: '100%' }}>
                    <label>Suggested Talents (Comma separated)</label>
                    <input type="text" name="suggestedTalents" value={formData.suggestedTalents} onChange={handleInputChange} placeholder="e.g. Singing, Guitar, React" />
                  </div>
                </div>
              </form>
            </div>
            <div className="evt-modal-footer">
              <button type="button" className="evt-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" form="createEventForm" className="evt-btn-primary">Create & Publish Event</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && isEditor && (
        <div className="evt-modal-overlay">
          <div className="evt-modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="evt-modal-header">
              <h3>Edit Event</h3>
              <button className="evt-close-btn" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <div className="evt-modal-body">
              <form id="editEventForm" onSubmit={handleUpdateEvent}>
                <div className="evt-form-group">
                  <label>Event Title *</label>
                  <input type="text" name="title" value={editFormData.title} onChange={handleEditInputChange} required />
                </div>
                
                <div className="evt-form-group">
                  <label>Description *</label>
                  <textarea name="description" value={editFormData.description} onChange={handleEditInputChange} rows="3" required></textarea>
                </div>
                
                <div className="evt-form-row">
                  <div className="evt-form-group">
                    <label>Category *</label>
                    <select name="category" value={editFormData.category} onChange={handleEditInputChange} required>
                      <option value="Company Event">Company Event</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Training">Training</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Holiday">Holiday</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Work Anniversary">Work Anniversary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="evt-form-group">
                    <label>Target Audience *</label>
                    <select name="targetAudience" value={editFormData.targetAudience} onChange={handleEditInputChange} required>
                      <option value="All Internal Users">All Internal Users</option>
                      <option value="All Employees">All Employees</option>
                      <option value="Employees">Employees Only</option>
                      <option value="Managers">Managers Only</option>
                      <option value="HR Admins">HR Admins Only</option>
                    </select>
                  </div>
                </div>

                <div className="evt-form-row">
                  <div className="evt-form-group">
                    <label>Event Date *</label>
                    <input type="date" name="eventDate" value={editFormData.eventDate} onChange={handleEditInputChange} required />
                  </div>
                  <div className="evt-form-group">
                    <label>Start Time (Optional)</label>
                    <input type="time" name="startTime" value={editFormData.startTime} onChange={handleEditInputChange} />
                  </div>
                  <div className="evt-form-group">
                    <label>End Time (Optional)</label>
                    <input type="time" name="endTime" value={editFormData.endTime} onChange={handleEditInputChange} />
                  </div>
                </div>
                
                <div className="evt-form-row">
                  <div className="evt-form-group">
                    <label>Location (Optional)</label>
                    <input type="text" name="location" value={editFormData.location} onChange={handleEditInputChange} placeholder="e.g. Main Auditorium" />
                  </div>
                  <div className="evt-form-group">
                    <label>Meeting Link (Optional)</label>
                    <input type="url" name="meetingLink" value={editFormData.meetingLink} onChange={handleEditInputChange} placeholder="https://zoom.us/..." />
                  </div>
                </div>

                <div className="evt-form-row">
                  <div className="evt-form-group">
                    <label>Maximum Participants (Optional)</label>
                    <input type="number" name="maxParticipants" value={editFormData.maxParticipants || ''} onChange={handleEditInputChange} min="1" />
                  </div>
                  <div className="evt-form-group">
                    <label>Registration Deadline (Optional)</label>
                    <input type="date" name="registrationDeadline" value={editFormData.registrationDeadline || ''} onChange={handleEditInputChange} />
                  </div>
                </div>

                <div className="evt-form-row">
                  <div className="evt-form-group" style={{ width: '100%' }}>
                    <label>Suggested Talents (Comma separated)</label>
                    <input type="text" name="suggestedTalents" value={editFormData.suggestedTalents} onChange={handleEditInputChange} placeholder="e.g. Singing, Guitar, React" />
                    {editMatchingEmployees.length > 0 && (
                      <div style={{ marginTop: '10px', padding: '10px', background: '#f3f4f6', borderRadius: '4px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: '500' }}>Matched Talent Preview:</span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                          {editMatchingEmployees.map(emp => (
                            <span key={emp._id} style={{ fontSize: '0.75rem', background: '#e5e7eb', padding: '4px 8px', borderRadius: '12px' }}>
                              {emp.firstName} {emp.lastName} ({emp.talent})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
            <div className="evt-modal-footer">
              <button type="button" className="evt-btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button type="submit" form="editEventForm" className="evt-btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      )}
      {showPostponeModal && isEditor && (
        <div className="evt-modal-overlay">
          <div className="evt-modal" style={{ maxWidth: '400px' }}>
            <div className="evt-modal-header">
              <h3>Postpone Event</h3>
              <button className="evt-close-btn" onClick={() => setShowPostponeModal(false)}>&times;</button>
            </div>
            <div className="evt-modal-body">
              <form onSubmit={handlePostponeSubmit}>
                <div className="evt-form-group">
                  <label>New Date *</label>
                  <input 
                    type="date" 
                    value={postponeData.newDate} 
                    onChange={(e) => setPostponeData({...postponeData, newDate: e.target.value})} 
                    required 
                  />
                </div>
                <div className="evt-form-group">
                  <label>Reason (Optional)</label>
                  <textarea 
                    value={postponeData.reason} 
                    onChange={(e) => setPostponeData({...postponeData, reason: e.target.value})} 
                    rows="3" 
                  ></textarea>
                </div>
                <div className="evt-modal-footer">
                  <button type="button" className="evt-btn-text" onClick={() => setShowPostponeModal(false)}>Cancel</button>
                  <button type="submit" className="evt-btn-primary">Confirm Postpone</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {matchingTalentModal.isOpen && (
        <div className="evt-modal-overlay">
          <div className="evt-modal" style={{ maxWidth: '600px' }}>
            <div className="evt-modal-header">
              <h3>Match Talent - {matchingTalentModal.eventTitle}</h3>
              <button className="evt-close-btn" onClick={() => setMatchingTalentModal({ isOpen: false, eventId: null, employees: [], eventTitle: '' })}>&times;</button>
            </div>
            <div className="evt-modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {matchingTalentModal.employees.length === 0 ? (
                <p>No employees found matching the suggested talents.</p>
              ) : (
                <table className="certs-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '8px' }}>Select</th>
                      <th style={{ padding: '8px' }}>Employee</th>
                      <th style={{ padding: '8px' }}>Department</th>
                      <th style={{ padding: '8px' }}>Talent</th>
                      <th style={{ padding: '8px' }}>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchingTalentModal.employees.map(emp => (
                      <tr key={emp._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '8px' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedForInvite.includes(emp._id)}
                            onChange={() => toggleInviteSelection(emp._id)}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>{emp.firstName} {emp.lastName}</td>
                        <td style={{ padding: '8px' }}>{emp.departmentName || 'N/A'}</td>
                        <td style={{ padding: '8px' }}><strong>{emp.talent}</strong></td>
                        <td style={{ padding: '8px' }}>{emp.level}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="evt-modal-footer">
              <button type="button" className="evt-btn-text" onClick={() => setMatchingTalentModal({ isOpen: false, eventId: null, employees: [], eventTitle: '' })}>Cancel</button>
              {matchingTalentModal.employees.length > 0 && (
                <>
                  <button type="button" className="evt-btn-secondary" onClick={() => handleInvite('selected')} disabled={selectedForInvite.length === 0}>Invite Selected</button>
                  <button type="button" className="evt-btn-primary" onClick={() => handleInvite('all')}>Invite All Matching</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventManagement;
