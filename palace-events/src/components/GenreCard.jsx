import React from "react";
import { db } from "../firebase/firebase";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import CalendarButton from "./CalendarButton";
import AttendButton from "./AttendButton";
import "../css/GenreCard.css";

export default function GenreCard({ genre, events, user, onEventDeleted }) {
  const handleDelete = async (event) => {
    const firestoreId = event.id;

    if (!window.confirm(`Are you sure you want to delete "${event.title}"?`))
      return;

    try {
      const eventRef = doc(db, "events", firestoreId);
      await deleteDoc(eventRef);

      setTimeout(async () => {
        const afterDelete = await getDoc(eventRef);
        if (!afterDelete.exists()) {
          if (onEventDeleted) onEventDeleted();
        }
      }, 1000);
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  return (
    <div
      className={`genre-card ${
        genre === "ticketmaster" ? "ticketmaster-genre" : ""
      }`}
    >
      <h2 className="genre-header">
        {genre === "ticketmaster" ? "🎟️ Ticketmaster Events" : genre}
      </h2>

      <div className="genre-events">
        {events.map((event) => (
          <div key={event.id} className="event-item">
            <div className="event-content">
              <h3>{event.title}</h3>
              <p>
                📅 {event.start.toLocaleDateString()}
                {event.end &&
                  event.end.toDateString() !== event.start.toDateString() &&
                  ` - ${event.end.toLocaleDateString()}`}
              </p>
              <p>📍 {event.location || "No location specified"}</p>
              {event.description && <p>{event.description}</p>}
              {event.link && (
                <a href={event.link} target="_blank" rel="noopener noreferrer">
                  🔗 More Info
                </a>
              )}
            </div>

            <div className="event-actions">
              <AttendButton event={event} user={user} />

              {/* Calendar Button - shows for ALL users */}
              <CalendarButton event={event} />

              {/* Delete Button - only for event owner */}
              {event.userId === user?.uid && user && (
                <button
                  onClick={() => handleDelete(event)}
                  className="delete-btn"
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
