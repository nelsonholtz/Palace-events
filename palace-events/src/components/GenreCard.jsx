// src/components/GenreCard.jsx
import React, { useState } from "react";
import { auth, db } from "../firebase/firebase";
import { deleteDoc, doc } from "firebase/firestore";

export default function GenreCard({ genre, events }) {
  const [expanded, setExpanded] = useState(false);
  const currentUser = auth.currentUser;

  const handleDelete = async (eventId) => {
    try {
      await deleteDoc(doc(db, "events", eventId));
      console.log("Event deleted:", eventId);
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  // --- determine styling based on genre ---
  const isTicketmaster = genre === "ticketmaster";

  return (
    <div
      style={{
        border: isTicketmaster
          ? "1px solid rgba(0,105,217,0.3)"
          : "1px solid #ccc",
        borderRadius: "8px",
        marginBottom: "16px",
        overflow: "hidden",
        background: isTicketmaster ? "rgba(0,105,217,0.05)" : "#fff",
        boxShadow: isTicketmaster ? "0 1px 4px rgba(0,105,217,0.1)" : "none",
      }}
    >
      {/* Header / Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          textAlign: "left",
          background: isTicketmaster ? "#0069d9" : "#f0f0f0",
          color: isTicketmaster ? "#fff" : "#000",
          padding: "10px 14px",
          border: "none",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        {isTicketmaster ? "🎟️ Ticketmaster Events" : genre} ({events.length})
      </button>

      {/* Events List */}
      {expanded && (
        <div style={{ padding: "12px", background: "#fff" }}>
          {events.map((e) => (
            <div
              key={e.id}
              style={{
                padding: "8px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <h3 style={{ margin: "4px 0" }}>{e.title}</h3>
              <p style={{ fontSize: "0.9rem", color: "#444" }}>
                🕒 {e.start.toLocaleString()} – {e.end.toLocaleString()}
              </p>
              {e.location && (
                <p style={{ fontSize: "0.9rem", margin: "2px 0" }}>
                  📍 {e.location}
                </p>
              )}
              {e.description && e.description !== "No description." && (
                <p style={{ fontSize: "0.9rem", margin: "4px 0" }}>
                  {e.description}
                </p>
              )}
              {e.link && (
                <p style={{ marginTop: "6px" }}>
                  <a
                    href={e.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: isTicketmaster ? "#0069d9" : "#007bff",
                      fontWeight: "500",
                      textDecoration: "underline",
                    }}
                  >
                    🔗 {isTicketmaster ? "View on Ticketmaster" : "Event link"}
                  </a>
                </p>
              )}

              {currentUser && e.userId === currentUser.uid && (
                <button
                  onClick={() => handleDelete(e.id)}
                  style={{
                    marginTop: "8px",
                    padding: "4px 10px",
                    background: "#ff4d4f",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  🗑 Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
