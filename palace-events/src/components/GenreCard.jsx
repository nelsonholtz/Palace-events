// src/components/GenreCard.jsx
import React, { useState } from "react";

export default function GenreCard({ genre, events }) {
  const [expanded, setExpanded] = useState(false);

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
              style={{ padding: "6px 0", borderBottom: "1px solid #eee" }}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
