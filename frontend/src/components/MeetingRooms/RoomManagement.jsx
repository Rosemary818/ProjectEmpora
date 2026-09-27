import React, { useState, useEffect } from 'react';
import './RoomManagement.css';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Team / Conference',
    capacity: 4,
    location: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/rooms/admin/all-rooms', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRooms(data.data);
      } else {
        setError(data.error || 'Failed to load rooms');
      }
    } catch (err) {
      setError('Network Error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        type: room.type,
        capacity: room.capacity,
        location: room.location || '',
        status: room.status
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        type: 'Team / Conference',
        capacity: 4,
        location: '',
        status: 'Active'
      });
    }
    setShowModal(true);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const url = editingRoom 
        ? `http://localhost:5000/api/rooms/room/${editingRoom._id}`
        : 'http://localhost:5000/api/rooms/room';
      
      const method = editingRoom ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        fetchRooms();
      } else {
        setError(data.message || data.error || 'Operation failed');
      }
    } catch (err) {
      setError('Network Error');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/room/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        fetchRooms();
      } else {
        const data = await res.json();
        alert(data.message || data.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Network Error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room? If it has historical bookings, this will fail.")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/room/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      
      if (res.ok) {
        fetchRooms();
      } else {
        const data = await res.json();
        alert(data.message || data.error || 'Failed to delete room');
      }
    } catch (err) {
      alert('Network Error');
    }
  };

  if (loading) return <div className="rm-container">Loading room management...</div>;

  return (
    <div className="rm-container">
      <div className="rm-header">
        <div>
          <h1>Room Management</h1>
          <p>Manage office meeting rooms and capacities.</p>
        </div>
        <button className="rm-btn-primary" onClick={() => handleOpenModal()}>
          + Add Room
        </button>
      </div>

      <div className="rm-table-wrapper">
        <table className="rm-table">
          <thead>
            <tr>
              <th>Room Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room._id}>
                <td><strong>{room.name}</strong></td>
                <td>{room.type}</td>
                <td>{room.capacity}</td>
                <td>{room.location || '-'}</td>
                <td>
                  <div className={`rm-status-badge ${room.status.toLowerCase()}`}>
                    <div className="rm-status-dot"></div>
                    {room.status}
                  </div>
                </td>
                <td>
                  <div className="rm-actions">
                    <button className="rm-btn-action" onClick={() => handleOpenModal(room)}>Edit</button>
                    <button className="rm-btn-action" onClick={() => toggleStatus(room._id, room.status)}>
                      {room.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="rm-btn-action danger" onClick={() => handleDelete(room._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No rooms configured yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="rm-modal-overlay">
          <div className="rm-modal">
            <h2>{editingRoom ? 'Edit Room' : 'Add Room'}</h2>
            {error && <div className="rm-error-text">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="rm-form-group">
                <label>Room Name *</label>
                <input 
                  type="text" 
                  className="rm-form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="rm-form-group">
                <label>Room Type *</label>
                <select 
                  className="rm-form-control"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="Team / Conference">Team / Conference</option>
                  <option value="Client">Client</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="rm-form-group">
                <label>Capacity *</label>
                <input 
                  type="number" 
                  className="rm-form-control"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || ''})}
                  min="1"
                  required
                />
              </div>

              <div className="rm-form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  className="rm-form-control"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Optional"
                />
              </div>

              <div className="rm-form-group">
                <label>Status</label>
                <select 
                  className="rm-form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="rm-modal-actions">
                <button type="button" className="rm-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="rm-btn-primary">{editingRoom ? 'Save Changes' : 'Save Room'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
