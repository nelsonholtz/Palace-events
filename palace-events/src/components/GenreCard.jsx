// src/components/GenreCard.jsx
import React, { useState } from "react";
import "../css/GenreCard.css";

export default function GenreCard({ genre, events }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="genre-card">
      <button className="genre-header" onClick={() => setExpanded(!expanded)}>
        {genre} ({events.length})
      </button>
      {expanded && (
        <div className="genre-events">
          {events.map((e) => (
            <div key={e.id} className="event-card">
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
