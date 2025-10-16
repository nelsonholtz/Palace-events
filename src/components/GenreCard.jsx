import React, { useState } from "react";
import { db } from "../firebase/firebase";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import CalendarButton from "./CalendarButton";
import AttendButton from "./AttendButton";
import { getGenreColour } from "../utils/eventColours";
import "../css/GenreCard.css";

export default function GenreCard({
  genre,
  events,
  user,
  onEventDeleted,
  showModal,
}) {
  const genreColour = getGenreColour(genre);

  const capitalizeGenre = (genre) => {
    if (!genre || genre === "ticketmaster") return genre;
    return genre.charAt(0).toUpperCase() + genre.slice(1);
  };

  const formatTimeRange = (start, end) => {
    if (!start) return "Time not specified";

    const startTime = start.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (
      !end ||
      (start.toDateString() === end.toDateString() &&
        start.getTime() === end.getTime())
    ) {
      return `🕒 ${startTime}`;
    }

    if (start.toDateString() === end.toDateString()) {
      const endTime = end.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `🕒 ${startTime} - ${endTime}`;
    }

    const startDateTime = start.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const endDateTime = end.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return `🕒 ${startDateTime} - ${endDateTime}`;
  };

  const handleDelete = async (event) => {
    showModal(
      "Delete Event",
      `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
      [
        { label: "Delete", type: "danger", action: "delete" },
        { label: "Cancel", type: "secondary", action: "cancel" },
      ],
      async (action) => {
        if (action === "delete") {
          try {
            console.log("Attempting to delete event:", event.id, event.title);
            const eventRef = doc(db, "events", event.id);

            await deleteDoc(eventRef);
            console.log("Event deleted from Firestore");

            const afterDelete = await getDoc(eventRef);
            if (!afterDelete.exists()) {
              console.log("Deletion confirmed - event no longer exists");

              if (onEventDeleted) {
                onEventDeleted();
              }

              showModal(
                "Event Deleted",
                "The event has been successfully deleted.",
                [{ label: "OK", type: "primary", action: "ok" }]
              );
            } else {
              throw new Error("Event still exists after deletion attempt");
            }
          } catch (error) {
            console.error("Delete error:", error);
            showModal(
              "Delete Failed",
              `Failed to delete event: ${error.message}`,
              [{ label: "OK", type: "primary", action: "ok" }]
            );
          }
        }
      }
    );
  };

  return (
    <div
      className="genre-card"
      style={{
        borderLeftColor: genreColour.border,
        backgroundColor: genreColour.background,
      }}
    >
      <h2
        className="genre-header"
        style={{
          backgroundColor: genreColour.background,
          color: genreColour.text,
        }}
      >
        {genre === "ticketmaster"
          ? "🎟️ Ticketmaster Events"
          : capitalizeGenre(genre)}
      </h2>

      <div className="genre-events">
        {events.map((event) => (
          <div key={event.id} className="event-item">
            <div className="event-content">
              <h3 style={{ color: genreColour.text }}>{event.title}</h3>
              <p>
                📅 {event.start.toLocaleDateString()}
                {event.end &&
                  event.end.toDateString() !== event.start.toDateString() &&
                  ` - ${event.end.toLocaleDateString()}`}
              </p>
              <p>{formatTimeRange(event.start, event.end)}</p>
              <p>📍 {event.location || "No location specified"}</p>
              {event.description && <p>{event.description}</p>}
              {event.link && (
                <a href={event.link} target="_blank" rel="noopener noreferrer">
                  🔗 More Info
                </a>
              )}
            </div>

            <div className="event-actions">
              <div className="card-buttons-row">
                <AttendButton event={event} user={user} showModal={showModal} />
                <CalendarButton event={event} />
                {event.userId === user?.uid && user && (
                  <button
                    onClick={() => handleDelete(event)}
                    className="delete-btn card-btn"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
