// src/components/GenreCard.jsx
import React, { useState } from "react";
import { auth, db } from "../firebase/firebase";
import { deleteDoc, doc } from "firebase/firestore";

export default function GenreCard({ genre, events }) {
  const [expanded, setExpanded] = useState(false);

  const handleDelete = async (eventId) => {
    try {
      await deleteDoc(doc(db, "events", eventId));
      console.log("Event deleted:", eventId);
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const currentUser = auth.currentUser;

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "6px",
        marginBottom: "12px",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          textAlign: "left",
          background: "#f0f0f0",
          padding: "8px 12px",
          border: "none",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        {genre} ({events.length})
      </button>

      {expanded && (
        <div style={{ padding: "8px 12px", background: "#fff" }}>
          {events.map((e) => (
            <div
              key={e.id}
              style={{
                padding: "6px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <h3>{e.title}</h3>
              <p>
                {e.start.toLocaleString()} - {e.end.toLocaleString()}
              </p>
              {e.location && <p>📍 {e.location}</p>}
              {e.description && <p>{e.description}</p>}
              {e.link && (
                <p>
                  🔗{" "}
                  <a href={e.link} target="_blank" rel="noreferrer">
                    Event link
                  </a>
                </p>
              )}

              {currentUser && e.userId === currentUser.uid && (
                <button
                  onClick={() => handleDelete(e.id)}
                  style={{
                    marginTop: "6px",
                    padding: "4px 8px",
                    background: "#ff4d4f",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
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
