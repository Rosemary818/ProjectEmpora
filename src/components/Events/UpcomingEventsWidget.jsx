import React, { useState, useEffect } from 'react';
import { eventService } from '../../utils/eventService';
import './UpcomingEventsWidget.css';

const UpcomingEventsWidget = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Fetch all events for this user
      const res = await eventService.getEvents();
      if (res.success) {
        // Filter out completed and cancelled events
        const futureOrOngoing = res.data.filter(evt => evt.status === 'Upcoming' || evt.status === 'Today');
        
        // Ensure they are sorted by date (already sorted by backend, but just to be safe)
        futureOrOngoing.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
        
        // Take the top 3
        setUpcomingEvents(futureOrOngoing.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to load upcoming events', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ue-widget">
      <div className="ue-header">
        <h2>Upcoming Events</h2>
      </div>
      <div className="ue-body">
        {loading ? (
          <p className="ue-empty">Loading events...</p>
        ) : upcomingEvents.length > 0 ? (
          <ul className="ue-list">
            {upcomingEvents.map(evt => (
              <li key={evt._id} className="ue-item">
                <div className="ue-icon-box">
                  {evt.category === 'Birthday' ? '🎂' :
                   evt.category === 'Work Anniversary' ? '🎉' :
                   evt.category === 'Holiday' ? '🌴' :
                   evt.category === 'Training' || evt.category === 'Workshop' ? '📚' :
                   '📅'}
                </div>
                <div className="ue-details">
                  <h4>{evt.title}</h4>
                  <p className="ue-date">
                    {new Date(evt.eventDate).toLocaleDateString()}
                    {evt.startTime && ` • ${evt.startTime}`}
                  </p>
                  <p className="ue-location">
                    {evt.location ? evt.location : evt.meetingLink ? 'Online' : ''}
                  </p>
                  {evt.status === 'Ongoing' && (
                    <span className="ue-badge ongoing">Ongoing</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ue-empty">No upcoming events</p>
        )}
      </div>
    </div>
  );
};

export default UpcomingEventsWidget;
