import React, { useEffect, useState, useMemo } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../css/CalendarPage.css";

export default function CalendarPage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  // Auth listener
  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Fetch events
  useEffect(() => {
    return onSnapshot(collection(db, "events"), (snapshot) => {
      const loadedEvents = snapshot.docs.map((doc) => {
        const data = doc.data();
        const toDate = (val) => {
          if (!val) return null;
          if (val.toDate) return val.toDate();
          if (val.seconds) return new Date(val.seconds * 1000);
          return new Date(val);
        };

        return {
          id: doc.id,
          title: data.title,
          start: toDate(data.start),
          end: toDate(data.end),
          genre: data.genre || "uncategorized",
          userId: data.userId,
        };
      });
      setEvents(loadedEvents);
    });
  }, []);

  // Filter events for current user
  const visibleEvents = useMemo(() => {
    return events.filter((ev) => (!user ? ev.genre !== "ticketmaster" : true));
  }, [events, user]);

  // Group events by day
  const eventsByDay = useMemo(() => {
    const map = {};

    visibleEvents.forEach((event) => {
      if (!event.start || isNaN(event.start)) return;

      const start = new Date(event.start);
      const end = event.end && !isNaN(event.end) ? new Date(event.end) : start;

      // Get all dates this event spans
      const current = new Date(start);
      while (current <= end) {
        const dateKey = current.toISOString().split("T")[0];
        if (!map[dateKey]) map[dateKey] = {};
        if (!map[dateKey][event.genre]) map[dateKey][event.genre] = [];

        map[dateKey][event.genre].push(event);
        current.setDate(current.getDate() + 1);
      }
    });

    return map;
  }, [visibleEvents]);

  // Month navigation
  const changeMonth = (direction) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)
    );
  };

  // Calendar grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = [];

  // Add empty days for padding
  for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
  // Add actual days of month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  return (
    <div className="calendar-page">
      <h1>Community Calendar</h1>

      {user && (
        <div className="calendar-actions">
          <button onClick={() => navigate("/create-event")}>+ Add Event</button>
          <button onClick={() => navigate("/import-ticketmaster")}>
            📥 Import Ticketmaster Events
          </button>
        </div>
      )}

      <div className="calendar-header">
        <button onClick={() => changeMonth(-1)}>{"<"}</button>
        <h2>
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button onClick={() => changeMonth(1)}>{">"}</button>
      </div>

      <div className="weekday-grid">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="days-grid">
        {days.map((day, index) => {
          if (!day) return <div key={index} className="day-cell"></div>;

          const dateKey = day.toISOString().split("T")[0];
          const dayEvents = eventsByDay[dateKey] || {};

          return (
            <div
              key={dateKey}
              className={`day-cell ${
                dayEvents.ticketmaster ? "has-ticketmaster" : ""
              }`}
              onClick={() => navigate(`/day/${dateKey}`)}
            >
              <div className="day-number">{day.getDate()}</div>

              {dayEvents.ticketmaster && user && (
                <div className="ticketmaster-badge">🎟️</div>
              )}

              {Object.entries(dayEvents).map(([genre, events]) => (
                <button
                  key={genre}
                  className={`genre-button ${
                    genre === "ticketmaster" ? "ticketmaster-genre" : "default"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/day/${dateKey}/${genre}`);
                  }}
                >
                  {genre === "ticketmaster" ? "🎟️ Events" : genre} (
                  {events.length})
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
