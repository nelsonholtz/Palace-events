import React from "react";
import { db } from "../firebase/firebase";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import CalendarButton from "./CalendarButton";
import AttendButton from "./AttendButton";

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
      className="genre-card"
      style={{
        marginBottom: "24px",
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2
        style={{
          marginBottom: "16px",
          color: "#333",
          borderBottom: "2px solid #eee",
          paddingBottom: "8px",
        }}
      >
        {genre === "ticketmaster" ? "🎟️ Ticketmaster Events" : genre}
      </h2>

      <div className="events-list">
        {events.map((event) => (
          <div
            key={event.id}
            className="event-item"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginBottom: "8px",
              background: "#fff",
            }}
          >
            <div className="event-content" style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 8px 0" }}>{event.title}</h3>
              <p style={{ margin: "4px 0" }}>
                📅 {event.start.toLocaleDateString()}
                {event.end &&
                  event.end.toDateString() !== event.start.toDateString() &&
                  ` - ${event.end.toLocaleDateString()}`}
              </p>
              <p style={{ margin: "4px 0" }}>
                📍 {event.location || "No location specified"}
              </p>
              {event.description && (
                <p style={{ margin: "4px 0" }}>{event.description}</p>
              )}
              {event.link && (
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", margin: "4px 0" }}
                >
                  🔗 More Info
                </a>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginLeft: "12px",
              }}
            >
              <AttendButton event={event} user={user} />

              {/* Calendar Button - shows for ALL users */}
              <CalendarButton event={event} />

              {/* Delete Button - only for event owner */}
              {event.userId === user?.uid && user && (
                <button
                  onClick={() => handleDelete(event)}
                  style={{
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
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
