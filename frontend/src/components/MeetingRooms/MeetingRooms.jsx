import React, { useState, useEffect, useMemo } from 'react';
import './MeetingRooms.css';

const timeToMins = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const MeetingRooms = ({ userRole, user }) => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [swapRequests, setSwapRequests] = useState([]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedBookingForSwap, setSelectedBookingForSwap] = useState(null);
  const [swappableBookings, setSwappableBookings] = useState([]);

  const [roomSuggestions, setRoomSuggestions] = useState({});
  const [bookingForm, setBookingForm] = useState({
    title: '',
    meetingType: userRole === 'Manager' ? 'Team Meeting' : 'Individual Meeting',
    roomId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    participants: [],
    clientName: '',
    clientContact: '',
    hasVisitor: false,
    visitorName: '',
    visitorCompany: '',
    visitorEmail: '',
    visitorPhone: '',
    preferredCapacity: '',
    preferredRoomId: ''
  });

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    fetchRooms();
    fetchBookings();
    fetchUsers();
    fetchSwapRequests();
  }, [selectedDate]);

  const fetchSwapRequests = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/swaps/requests`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSwapRequests(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/rooms?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRooms(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/rooms`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(data.data);
        checkAllAlternatives(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkAllAlternatives = async (allBookings) => {
    const upcoming = allBookings.filter(b => b.status === 'Upcoming' && (String(b.createdBy?._id) === String(user.id) || String(b.createdBy?._id) === String(user._id) || userRole === 'Manager'));
    const newSuggestions = {};
    for (const b of upcoming) {
      try {
        const res = await fetch(`http://localhost:5000/api/rooms/${b._id}/alternatives`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        const data = await res.json();
        if (res.ok && data.data) {
          newSuggestions[b._id] = data.data;
        }
      } catch (err) {
        console.error(err);
      }
    }
    setRoomSuggestions(newSuggestions);
  };

  const handleSwapRoom = async (bookingId, newRoomId) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${bookingId}/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ newRoomId })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Room successfully swapped.');
        // Remove from suggestions
        setRoomSuggestions(prev => {
          const updated = { ...prev };
          delete updated[bookingId];
          return updated;
        });
        fetchRooms();
        fetchBookings();
      } else {
        alert(data.error || data.message || 'Failed to swap room.');
      }
    } catch (err) {
      alert('Network Error');
    }
    setLoading(false);
  };

  const handleDismissSuggestion = (bookingId) => {
    setRoomSuggestions(prev => {
      const updated = { ...prev };
      delete updated[bookingId];
      return updated;
    });
  };

  const handleOpenSwapModal = async (booking) => {
    setSelectedBookingForSwap(booking);
    setSwappableBookings([]);
    setShowSwapModal(true);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${booking._id}/swappable`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSwappableBookings(data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSendSwapRequest = async (receiverBookingId) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/swaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          requesterBookingId: selectedBookingForSwap._id,
          receiverBookingId
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Swap request sent successfully.');
        setShowSwapModal(false);
        fetchSwapRequests();
      } else {
        alert(data.error || data.message || 'Failed to send swap request.');
      }
    } catch (err) {
      alert('Network Error');
    }
    setLoading(false);
  };

  const handleActionSwapRequest = async (requestId, action) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/swaps/${requestId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || `Swap request ${action}ed.`);
        fetchSwapRequests();
        if (action === 'accept') {
          fetchRooms();
          fetchBookings();
        }
      } else {
        alert(data.error || data.message || `Failed to ${action} swap request.`);
      }
    } catch (err) {
      alert('Network Error');
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    // Attempt to fetch users for the participants dropdown
    // Based on userRole, might fetch all or just team
    try {
      const res = await fetch(`http://localhost:5000/api/user/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.data);
        if (userRole === 'Manager') {
          // pre-filter for team
          setFilteredUsers(data.data.filter(u => String(u.managerId) === String(user.id) || String(u.managerId) === String(user._id)));
        } else {
          setFilteredUsers(data.data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(bookingForm)
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        fetchRooms();
        fetchBookings();
      } else {
        setError(data.error || data.message || 'Failed to create booking');
      }
    } catch (err) {
      setError('Network Error');
    }
    setLoading(false);
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (res.ok) {
        fetchRooms();
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVisitorAction = async (visitorId, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/visitors/${visitorId}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (res.ok) {
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.message || data.error || `Failed to ${action} visitor`);
      }
    } catch (err) {
      alert('Network Error');
    }
  };

  const isRoomAvailable = (room) => {
    if (!room.bookings || room.bookings.length === 0) return true;
    // Basic checking: if there are any bookings today, mark it booked? No, rooms are available unless booked at that precise moment.
    // However, the UI design asks for:
    // Conference Room 1 - Available
    // Conference Room 2 - Booked (10:00 AM - 11:00 AM)
    // We will consider a room "Booked" for the day if it has any bookings today, just to show the list of times. Or better, check current time.
    // Let's just list the bookings if it has them.
    return room.bookings.length === 0;
  };

  const handleParticipantToggle = (userId) => {
    const current = bookingForm.participants;
    if (current.includes(userId)) {
      setBookingForm({ ...bookingForm, participants: current.filter(id => id !== userId) });
    } else {
      setBookingForm({ ...bookingForm, participants: [...current, userId] });
    }
  };

  // Adjust users list based on meeting type selected
  useEffect(() => {
    if (bookingForm.meetingType === 'Team Meeting') {
      setFilteredUsers(users.filter(u => String(u.managerId) === String(user.id) || String(u.managerId) === String(user._id)));
    } else {
      setFilteredUsers(users);
    }
  }, [bookingForm.meetingType, users, user]);

  const { availableRooms, unavailableRooms } = useMemo(() => {
    const numAttendees = bookingForm.participants.length + 1;
    const startMins = timeToMins(bookingForm.startTime);
    const endMins = timeToMins(bookingForm.endTime);

    const available = [];
    const unavailable = [];

    rooms.forEach(room => {
      if (room.capacity < numAttendees) {
        unavailable.push(room);
        return;
      }
      
      let hasOverlap = false;
      if (room.bookings && room.bookings.length > 0) {
        for (const b of room.bookings) {
          if (b.status !== 'Cancelled') {
            const bStart = timeToMins(b.startTime);
            const bEnd = timeToMins(b.endTime);
            if (startMins < bEnd && endMins > bStart) {
              hasOverlap = true;
              break;
            }
          }
        }
      }

      if (hasOverlap) {
        unavailable.push(room);
      } else {
        available.push(room);
      }
    });

    return { availableRooms: available, unavailableRooms: unavailable };
  }, [rooms, bookingForm.participants.length, bookingForm.startTime, bookingForm.endTime]);

  useEffect(() => {
    if (bookingForm.roomId) {
      const isStillAvailable = availableRooms.some(r => r._id === bookingForm.roomId);
      if (!isStillAvailable) {
        setBookingForm(prev => ({ ...prev, roomId: '' }));
      }
    }
  }, [availableRooms, bookingForm.roomId]);

  return (
    <div className="meeting-rooms-container">
      <div className="meeting-rooms-header">
        <h1>Meeting Rooms</h1>
        <p>Book meeting rooms for your upcoming discussions</p>
      </div>

      <div className="mr-filters">
        <div className="mr-date-picker">
          <label>Select Date:</label>
          <input 
            type="date" 
            className="mr-date-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <button className="mr-btn-primary" onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Book Room
        </button>
      </div>

      <h2 className="mr-section-title">Room Availability for {new Date(selectedDate).toLocaleDateString()}</h2>
      <div className="mr-rooms-grid">
        {rooms.map(room => {
          const available = isRoomAvailable(room);
          return (
            <div key={room._id} className="mr-room-card">
              <div className="mr-room-header">
                <div>
                  <h3 className="mr-room-title">{room.name}</h3>
                  <p className="mr-room-type">{room.type} • Capacity: {room.capacity}</p>
                </div>
                <div className={`mr-status-badge ${available ? 'available' : 'booked'}`}>
                  <div className="mr-status-dot"></div>
                  {available ? 'Available' : 'Booked'}
                </div>
              </div>
              
              {!available && (
                <div className="mr-room-bookings">
                  <ul className="mr-booking-list">
                    {room.bookings.map(b => (
                      <li key={b._id}>
                        <span>{b.title}</span>
                        <span>{b.startTime} - {b.endTime}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {available && (
                <div className="mr-room-bookings">
                  <p className="mr-no-bookings">No bookings for this date.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {swapRequests.length > 0 && (
        <>
          <h2 className="mr-section-title">Room Swap Requests</h2>
          <div className="mr-swap-requests">
            {swapRequests.map(req => {
              const isIncoming = String(req.receiver._id) === String(user.id || user._id);
              return (
                <div key={req._id} className={`mr-swap-card ${req.status.toLowerCase()}`}>
                  <div className="mr-swap-info">
                    <h4>{isIncoming ? 'Incoming Swap Request' : 'Outgoing Swap Request'}</h4>
                    <p>
                      <strong>{isIncoming ? `${req.requester.firstName} ${req.requester.lastName}` : 'You'}</strong> 
                      {isIncoming ? ' wants to exchange their ' : ' asked to exchange your '} 
                      <strong>{req.requesterBooking?.roomId?.capacity}-capacity</strong> room 
                      with {isIncoming ? 'your ' : 'their '} 
                      <strong>{req.receiverBooking?.roomId?.capacity}-capacity</strong> room.
                    </p>
                    <div style={{fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem'}}>
                      <div><strong>Date:</strong> {new Date(req.date).toLocaleDateString()}</div>
                      <div><strong>Status:</strong> <span className={`mr-status-${req.status.toLowerCase()}`}>{req.status}</span></div>
                    </div>
                  </div>
                  <div className="mr-swap-actions">
                    {req.status === 'Pending' && isIncoming && (
                      <>
                        <button className="mr-btn-primary" onClick={() => handleActionSwapRequest(req._id, 'accept')} disabled={loading}>Accept</button>
                        <button className="mr-btn-secondary" onClick={() => handleActionSwapRequest(req._id, 'reject')} disabled={loading}>Reject</button>
                      </>
                    )}
                    {req.status === 'Pending' && !isIncoming && (
                      <button className="mr-btn-cancel" onClick={() => handleActionSwapRequest(req._id, 'cancel')} disabled={loading}>Cancel Request</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <h2 className="mr-section-title">My Meetings / My Bookings</h2>
      <div className="mr-table-wrapper">
        <table className="mr-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Room</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? bookings.map(booking => (
              <React.Fragment key={booking._id}>
                {roomSuggestions[booking._id] && (
                  <tr>
                    <td colSpan="7" style={{ padding: 0, border: 'none' }}>
                      <div className="mr-suggestion-card">
                        <div className="mr-suggestion-icon">✨</div>
                        <div className="mr-suggestion-content">
                          <h4>{booking.preferredRoomId === roomSuggestions[booking._id]._id ? 'Preferred Room Available' : 'Better Room Available'}</h4>
                          <p>
                            <strong>{roomSuggestions[booking._id].name}</strong> (Capacity: {roomSuggestions[booking._id].capacity}) is now available for your meeting "{booking.title}".
                            <br/>
                            <span style={{fontSize: '0.85rem', color: '#6b7280'}}>
                              Meeting: {new Date(booking.date).toLocaleDateString()} | {booking.startTime} - {booking.endTime} | Current: {booking.roomId?.name} (Capacity: {booking.roomId?.capacity})
                            </span>
                          </p>
                          <div className="mr-suggestion-actions">
                            <button className="mr-btn-primary" onClick={() => handleSwapRoom(booking._id, roomSuggestions[booking._id]._id)} disabled={loading}>Swap Room</button>
                            <button className="mr-btn-secondary" onClick={() => handleDismissSuggestion(booking._id)} disabled={loading}>Keep Current Room</button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              <tr key={booking._id}>
                <td>
                  <strong>{booking.title}</strong>
                  {booking.visitorId && (
                    <div style={{ fontSize: '0.8rem', marginTop: '4px', background: '#f3f4f6', padding: '6px', borderRadius: '4px' }}>
                      <strong>Visitor:</strong> {booking.visitorId.visitorName} ({booking.visitorId.companyName})<br/>
                      Status: <span style={{ color: booking.visitorId.status === 'Expected' ? '#d97706' : booking.visitorId.status === 'Checked In' ? '#16a34a' : '#2563eb', fontWeight: 500 }}>
                        {booking.visitorId.status === 'Expected' ? '🟡 Expected' : booking.visitorId.status === 'Checked In' ? '🟢 Checked In' : `🔵 ${booking.visitorId.status}`}
                      </span>
                    </div>
                  )}
                </td>
                <td>{booking.meetingType}</td>
                <td>{new Date(booking.date).toLocaleDateString()}</td>
                <td>{booking.startTime} - {booking.endTime}</td>
                <td>{booking.roomId?.name || 'N/A'}</td>
                <td>{booking.status}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {booking.status !== 'Cancelled' && (String(booking.createdBy?._id) === String(user.id) || String(booking.createdBy?._id) === String(user._id) || userRole === 'Manager') && (
                      <button className="mr-btn-cancel" onClick={() => handleCancelBooking(booking._id)}>Cancel</button>
                    )}
                    {booking.status === 'Upcoming' && (String(booking.createdBy?._id) === String(user.id) || String(booking.createdBy?._id) === String(user._id)) && (
                      <button className="mr-btn-secondary" onClick={() => handleOpenSwapModal(booking)} disabled={loading}>Request Swap</button>
                    )}
                    {booking.visitorId && String(booking.createdBy?._id) === (user.id || user._id) && (
                      <>
                        {booking.visitorId.status === 'Expected' && (
                          <button 
                            style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                            onClick={() => handleVisitorAction(booking.visitorId._id, 'check-in')}
                          >Check In</button>
                        )}
                        {booking.visitorId.status === 'Checked In' && (
                          <button 
                            style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                            onClick={() => handleVisitorAction(booking.visitorId._id, 'check-out')}
                          >Check Out</button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
              </React.Fragment>
            )) : (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No upcoming meetings.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="mr-modal-overlay">
          <div className="mr-modal">
            <h2>Book Room</h2>
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleCreateBooking}>
              <div className="mr-form-group">
                <label>Meeting Type</label>
                <select 
                  className="mr-form-control"
                  value={bookingForm.meetingType}
                  onChange={(e) => setBookingForm({...bookingForm, meetingType: e.target.value})}
                  required
                >
                  {userRole === 'Manager' && <option value="Team Meeting">Team Meeting</option>}
                  <option value="Client Meeting">Client Meeting</option>
                  <option value="Individual Meeting">Individual Meeting</option>
                </select>
              </div>

              <div className="mr-form-group">
                <label>Meeting Title</label>
                <input 
                  type="text" 
                  className="mr-form-control"
                  value={bookingForm.title}
                  onChange={(e) => setBookingForm({...bookingForm, title: e.target.value})}
                  placeholder="e.g. Sprint Planning"
                  required
                />
              </div>

              {bookingForm.meetingType === 'Client Meeting' && (
                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #e5e7eb' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, marginBottom: '1rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={bookingForm.hasVisitor}
                      onChange={(e) => setBookingForm({...bookingForm, hasVisitor: e.target.checked})}
                    />
                    Is there an external client/visitor?
                  </label>
                  
                  {bookingForm.hasVisitor && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="mr-form-group" style={{ marginBottom: 0 }}>
                        <label>Visitor Name *</label>
                        <input 
                          type="text" 
                          className="mr-form-control"
                          value={bookingForm.visitorName}
                          onChange={(e) => setBookingForm({...bookingForm, visitorName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mr-form-group" style={{ marginBottom: 0 }}>
                        <label>Company Name *</label>
                        <input 
                          type="text" 
                          className="mr-form-control"
                          value={bookingForm.visitorCompany}
                          onChange={(e) => setBookingForm({...bookingForm, visitorCompany: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mr-form-group" style={{ marginBottom: 0 }}>
                        <label>Visitor Email</label>
                        <input 
                          type="email" 
                          className="mr-form-control"
                          value={bookingForm.visitorEmail}
                          onChange={(e) => setBookingForm({...bookingForm, visitorEmail: e.target.value})}
                        />
                      </div>
                      <div className="mr-form-group" style={{ marginBottom: 0 }}>
                        <label>Visitor Phone</label>
                        <input 
                          type="text" 
                          className="mr-form-control"
                          value={bookingForm.visitorPhone}
                          onChange={(e) => setBookingForm({...bookingForm, visitorPhone: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mr-form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  className="mr-form-control"
                  value={bookingForm.date}
                  onChange={(e) => {
                    setBookingForm({...bookingForm, date: e.target.value});
                    // Also update selectedDate to fetch rooms for this new date
                    setSelectedDate(e.target.value);
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Start Time</label>
                  <input 
                    type="time" 
                    className="mr-form-control"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({...bookingForm, startTime: e.target.value})}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>End Time</label>
                  <input 
                    type="time" 
                    className="mr-form-control"
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({...bookingForm, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="mr-form-group">
                <label>Room</label>
                <select 
                  className="mr-form-control"
                  value={bookingForm.roomId}
                  onChange={(e) => setBookingForm({...bookingForm, roomId: e.target.value})}
                  required
                >
                  <option value="">Select a Room</option>
                  
                  {availableRooms.length > 0 && (
                    <optgroup label="Available Rooms">
                      {availableRooms.map(room => (
                        <option key={room._id} value={room._id}>
                          {room.name} — Capacity: {room.capacity}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {unavailableRooms.length > 0 && (
                    <optgroup label="Already Booked / Unavailable">
                      {unavailableRooms.map(room => (
                        <option key={room._id} value={room._id} disabled>
                          {room.name} — Capacity: {room.capacity}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Preferred Capacity (Optional)</label>
                  <input 
                    type="number" 
                    className="mr-form-control"
                    value={bookingForm.preferredCapacity}
                    onChange={(e) => setBookingForm({...bookingForm, preferredCapacity: e.target.value})}
                    placeholder="e.g. 10"
                    min="1"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Preferred Room (Optional)</label>
                  <select 
                    className="mr-form-control"
                    value={bookingForm.preferredRoomId}
                    onChange={(e) => setBookingForm({...bookingForm, preferredRoomId: e.target.value})}
                  >
                    <option value="">None</option>
                    {rooms.map(room => (
                      <option key={room._id} value={room._id}>{room.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mr-form-group">
                <label>Participants</label>
                <div className="mr-participants-list">
                  {filteredUsers.length > 0 ? filteredUsers.map(u => (
                    <label key={u._id} className="mr-participant-checkbox">
                      <input 
                        type="checkbox" 
                        checked={bookingForm.participants.includes(u._id)}
                        onChange={() => handleParticipantToggle(u._id)}
                      />
                      {u.firstName} {u.lastName} ({u.email})
                    </label>
                  )) : (
                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>No relevant users found.</span>
                  )}
                </div>
              </div>

              <div className="mr-modal-actions">
                <button type="button" className="mr-btn-secondary" onClick={() => setShowModal(false)} disabled={loading}>Cancel</button>
                <button type="submit" className="mr-btn-primary" disabled={loading}>{loading ? 'Booking...' : 'Book Room'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSwapModal && (
        <div className="mr-modal-overlay">
          <div className="mr-modal" style={{ maxWidth: '600px' }}>
            <h2>Request Room Swap</h2>
            <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
              Select a suitable booking to request a room swap for <strong>{selectedBookingForSwap?.title}</strong>.
            </p>
            {loading ? (
              <p>Loading suitable bookings...</p>
            ) : (
              <div className="mr-swappable-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {swappableBookings.length > 0 ? swappableBookings.map(b => (
                  <div key={b._id} className="mr-suggestion-card" style={{ marginBottom: '1rem' }}>
                    <div className="mr-suggestion-content">
                      <h4 style={{ margin: 0, paddingBottom: '0.25rem' }}>{b.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        <strong>Room:</strong> {b.roomId?.name} (Capacity: {b.roomId?.capacity})<br/>
                        <strong>Time:</strong> {b.startTime} - {b.endTime}<br/>
                        <strong>Owner:</strong> {b.createdBy?.firstName} {b.createdBy?.lastName}
                      </p>
                    </div>
                    <div className="mr-suggestion-actions" style={{ marginLeft: '1rem' }}>
                      <button className="mr-btn-primary" onClick={() => handleSendSwapRequest(b._id)}>Send Request</button>
                    </div>
                  </div>
                )) : (
                  <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No suitable bookings found for swapping on this date.</p>
                )}
              </div>
            )}
            <div className="mr-modal-actions" style={{ marginTop: '1rem' }}>
              <button type="button" className="mr-btn-secondary" onClick={() => setShowSwapModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingRooms;
