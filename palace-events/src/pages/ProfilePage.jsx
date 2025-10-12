import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../css/ProfilePage.css";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState(null); // Track which event is expanded
  const navigate = useNavigate();

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserEvents(currentUser.uid);
      } else {
        setUser(null);
        setUserEvents([]);
        setLoading(false);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch events user is attending
  const fetchUserEvents = async (userId) => {
    try {
      setLoading(true);

      const eventsRef = collection(db, "events");
      const eventsSnapshot = await getDocs(eventsRef);

      const userAttendingEvents = [];

      for (const eventDoc of eventsSnapshot.docs) {
        const eventData = eventDoc.data();
        const attendeeRef = doc(db, "events", eventDoc.id, "attendees", userId);
        const attendeeSnap = await getDoc(attendeeRef);

        if (attendeeSnap.exists()) {
          userAttendingEvents.push({
            id: eventDoc.id,
            ...eventData,
            start: eventData.start?.toDate(),
            end: eventData.end?.toDate(),
          });
        }
      }

      setUserEvents(userAttendingEvents);
    } catch (error) {
      // handle error silently
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRSVP = async (eventId) => {
    if (!user || !window.confirm("Remove yourself from this event?")) return;

    try {
      const attendeeRef = doc(db, "events", eventId, "attendees", user.uid);
      await deleteDoc(attendeeRef);

      // Refresh the list
      fetchUserEvents(user.uid);
    } catch (error) {
      // handle error silently
      alert("Failed to remove RSVP. Please try again.");
    }
  };

  const toggleEventDetails = (eventId) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null); // Collapse if already expanded
    } else {
      setExpandedEvent(eventId); // Expand this event
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Loading your profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-error">Please log in to view your profile</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
      </div>

      <div className="profile-content">
        {/* User Info Section */}
        <div className="user-info-card">
          <div className="user-avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {user.displayName
                  ? user.displayName.charAt(0).toUpperCase()
                  : user.email?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-details">
            <h2>{user.displayName || "User"}</h2>
            <p className="user-email">{user.email}</p>
            <p className="events-count">
              Attending {userEvents.length} event
              {userEvents.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* My Events Section */}
        <div className="events-section">
          <h3>My Events</h3>

          {userEvents.length === 0 ? (
            <div className="no-events">
              <p>You haven't RSVP'd to any events yet.</p>
              <button
                onClick={() => navigate("/")}
                className="browse-events-button"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="events-grid">
              {userEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <h4>{event.title}</h4>
                    <button
                      onClick={() => handleRemoveRSVP(event.id)}
                      className="remove-rsvp-button"
                      title="Remove RSVP"
                    >
                      ×
                    </button>
                  </div>

                  <div className="event-details">
                    <p className="event-date">
                      📅 {event.start?.toLocaleDateString()}
                      {event.end &&
                        event.end.toDateString() !==
                          event.start.toDateString() &&
                        ` - ${event.end.toLocaleDateString()}`}
                    </p>
                    {event.location && (
                      <p className="event-location">📍 {event.location}</p>
                    )}
                    {event.genre && (
                      <span className="event-genre">{event.genre}</span>
                    )}
                  </div>

                  {/* Expand/Collapse Button */}
                  <div className="event-actions">
                    <button
                      onClick={() => toggleEventDetails(event.id)}
                      className="view-details-button"
                    >
                      {expandedEvent === event.id
                        ? "▲ Less Details"
                        : "▼ More Details"}
                    </button>
                  </div>

                  {/* Expanded Details Section */}
                  {expandedEvent === event.id && (
                    <div className="event-expanded-details">
                      {event.description && (
                        <div className="event-description">
                          <strong>Description:</strong>
                          <p>{event.description}</p>
                        </div>
                      )}

                      {event.link && (
                        <div className="event-link">
                          <strong>Event Link:</strong>
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="external-link"
                          >
                            🔗 Visit Event Website
                          </a>
                        </div>
                      )}

                      {!event.description && !event.link && (
                        <p className="no-additional-info">
                          No additional information available for this event.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
