import React, { useState } from "react";

export default function ProfileEventCard({
  event,
  onRemoveRSVP,
  isExpanded,
  onToggleDetails,
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveClick = async () => {
    setIsRemoving(true);
    await onRemoveRSVP(event.id, event.title);
    setIsRemoving(false);
  };

  return (
    <div className="event-card">
      <div className="event-header">
        <h4>{event.title}</h4>
        <button
          onClick={handleRemoveClick}
          disabled={isRemoving}
          className="remove-rsvp-button"
          title="Remove RSVP"
        >
          {isRemoving ? "..." : "×"}
        </button>
      </div>

      <div className="event-details">
        <p className="event-date">
          📅 {event.start?.toLocaleDateString()}
          {event.end &&
            event.end.toDateString() !== event.start.toDateString() &&
            ` - ${event.end.toLocaleDateString()}`}
        </p>
        {event.location && (
          <p className="event-location">📍 {event.location}</p>
        )}
        {event.genre && <span className="event-genre">{event.genre}</span>}
      </div>

      {/* Expand/Collapse Button */}
      <div className="event-actions">
        <button
          onClick={() => onToggleDetails(event.id)}
          className="view-details-button"
        >
          {isExpanded ? "▲ Less Details" : "▼ More Details"}
        </button>
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
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
  );
}
