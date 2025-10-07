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

  // --- Auth listener ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // --- Fetch all events from Firestore ---
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snapshot) => {
      const loadedEvents = snapshot.docs.map((d) => {
        const data = d.data();

        // ✅ Robust conversion for Firestore timestamps or plain objects
        const toDate = (v) => {
          if (!v) return null;
          if (v instanceof Date) return v;
          if (v.toDate) return v.toDate();
          if (typeof v.seconds === "number") return new Date(v.seconds * 1000);
          return new Date(v);
        };

        return {
          id: d.id,
          title: data.title,
          start: toDate(data.start),
          end: toDate(data.end),
          genre: data.genre || "uncategorized",
          userId: data.userId,
        };
      });

      setEvents(loadedEvents);
    });
    return () => unsub();
  }, []);

  // ✅ Filter events based on login status
  const visibleEvents = useMemo(() => {
    return events.filter((ev) => {
      // Public (not logged in) → hide ticketmaster
      if (!user && ev.genre === "ticketmaster") return false;

      // Logged in → only show your own Ticketmaster events
      // if (user && ev.genre === "ticketmaster" && ev.userId !== user.uid)
      //   return false;

      // Everything else is visible
      return true;
    });
  }, [events, user]);

  // --- Date helpers ---
  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getDateRangeKeys = (start, end) => {
    const keys = [];
    let current = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    while (current <= last) {
      keys.push(formatDateKey(current));
      current.setDate(current.getDate() + 1);
    }
    return keys;
  };

  // --- Group events by day & genre ---
  const eventsByDay = useMemo(() => {
    const map = {};
    visibleEvents.forEach((ev) => {
      if (!(ev.start instanceof Date) || isNaN(ev.start)) return;

      const endDate = ev.end && ev.end >= ev.start ? ev.end : ev.start;
      const keys = getDateRangeKeys(ev.start, endDate);

      keys.forEach((key) => {
        const genre = ev.genre;
        if (!map[key]) map[key] = {};
        if (!map[key][genre]) map[key][genre] = [];
        map[key][genre].push(ev);
      });
    });
    return map;
  }, [visibleEvents]);

  // --- Month navigation ---
  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  // --- Render calendar ---
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++)
      days.push(new Date(year, month, i));

    return (
      <>
        <div className="calendar-header">
          <button onClick={prevMonth}>{"<"}</button>
          <h2>
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button onClick={nextMonth}>{">"}</button>
        </div>

        <div className="weekday-grid">
          {weekdays.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="days-grid">
          {days.map((day, idx) => {
            if (!day) return <div key={idx} className="day-cell"></div>;
            const dayKey = formatDateKey(day);
            const groups = eventsByDay[dayKey] || {};

            return (
              <div
                key={dayKey}
                className={`day-cell ${
                  eventsByDay[dayKey]?.ticketmaster ? "has-ticketmaster" : ""
                }`}
                onClick={() => navigate(`/day/${dayKey}`)}
              >
                <div className="day-number">{day.getDate()}</div>

                {eventsByDay[dayKey]?.ticketmaster && user && (
                  <div className="ticketmaster-badge">🎟️</div>
                )}

                {Object.entries(groups).map(([genre, evs]) => (
                  <button
                    key={genre}
                    className={`genre-button ${
                      genre === "ticketmaster"
                        ? "ticketmaster-genre"
                        : "default"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/day/${dayKey}/${encodeURIComponent(genre)}`);
                    }}
                  >
                    {genre === "ticketmaster"
                      ? "🎟️ Ticketmaster Events"
                      : genre}{" "}
                    ({evs.length})
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="calendar-page">
      <h1>Community Calendar</h1>
      {user && (
        <div className="calendar-actions">
          <button
            className="add-event-btn"
            onClick={() => navigate("/create-event")}
          >
            + Add Event
          </button>
          <button
            className="import-event-btn"
            onClick={() => navigate("/import-ticketmaster")}
          >
            📥 Import Ticketmaster Events
          </button>
        </div>
      )}
      {renderCalendar()}
    </div>
  );
}
