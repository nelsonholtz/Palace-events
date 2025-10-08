import React, { useState } from "react";
import { googleCalendarService } from "../services/googleCalendar";

export default function CalendarButton({ event }) {
  const [loading, setLoading] = useState(false);

  const handleAddToCalendar = async () => {
    setLoading(true);
    try {
      await googleCalendarService.addToCalendar(event);
      // Google Calendar opens in new tab automatically
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
      style={{
        background: "#4285f4",
        color: "white",
        border: "none",
        padding: "8px 16px",
        borderRadius: "6px",
        cursor: loading ? "not-allowed" : "pointer",
        fontSize: "14px",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        opacity: loading ? 0.6 : 1,
        transition: "all 0.2s ease",
      }}
      title="Add to Google Calendar"
    >
      {loading ? (
        <>
          <div
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid transparent",
              borderTop: "2px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          Opening...
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
          </svg>
          Add to Calendar
        </>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </button>
  );
}
