import React, { useState } from "react";
import { googleCalendarService } from "../services/googleCalendar";
import "../css/CalendarButton.css";

export default function CalendarButton({ event }) {
  const [loading, setLoading] = useState(false);

  const handleAddToCalendar = async () => {
    setLoading(true);
    try {
      await googleCalendarService.addToCalendar(event);
    } catch (error) {
      console.error("Error with calendar:", error);
      alert("Failed to open Google Calendar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCalendar}
      disabled={loading}
      className="calendar-btn"
      title="Add to Google Calendar"
    >
      {loading ? (
        <>
          <div className="loading-spinner" />
          Opening...
        </>
      ) : (
        <>
          <svg
            className="calendar-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
          </svg>
          Google Calendar
        </>
      )}
    </button>
  );
}
