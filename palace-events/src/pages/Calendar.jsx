// src/pages/CalendarPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
  subMonths,
  addMonths,
  format,
} from "date-fns";

import "../css/CalendarPage.css";

export default function CalendarPage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snapshot) => {
      const loadedEvents = snapshot.docs.map((d) => {
        const data = d.data();
        const toDate = (v) => (v?.toDate ? v.toDate() : new Date(v));
        return {
          id: d.id,
          title: data.title,
          start: toDate(data.start),
          end: toDate(data.end),
          location: data.location,
          genre: data.genre,
          description: data.description,
          link: data.link,
          userId: data.userId,
        };
      });
      setEvents(loadedEvents);
    });
    return () => unsub();
  }, []);

  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getDateRangeKeys = (start, end) => {
    const keys = [];
    let cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    while (cur <= last) {
      keys.push(formatDateKey(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return keys;
  };

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      if (!ev.start || !ev.end) return;
      const keys = getDateRangeKeys(ev.start, ev.end);
      const genre = ev.genre || "uncategorized";
      keys.forEach((k) => {
        if (!map[k]) map[k] = {};
        if (!map[k][genre]) map[k][genre] = [];
        map[k][genre].push(ev);
      });
    });
    return map;
  }, [events]);

  const monthMatrix = useMemo(() => {
    const startMonth = startOfMonth(currentMonth);
    const endMonth = endOfMonth(currentMonth);
    const startDate = startOfWeek(startMonth);
    const endDate = endOfWeek(endMonth);

    const weeks = [];
    let day = startDate;
    while (day <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      weeks.push(week);
    }
    return weeks;
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Community Calendar</h1>
        {user ? (
          <button className="btn" onClick={() => navigate("/create-event")}>
            + Add Event
          </button>
        ) : (
          <button className="btn" onClick={() => navigate("/login")}>
            Sign in to Add Event
          </button>
        )}
      </div>

      <div className="month-nav">
        <button className="nav-btn" onClick={handlePrevMonth}>
          Prev
        </button>
        <span>{format(currentMonth, "MMMM yyyy")}</span>
        <button className="nav-btn" onClick={handleNextMonth}>
          Next
        </button>
      </div>

      <div className="weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="weekday">
            {d}
          </div>
        ))}
      </div>

      {monthMatrix.map((week, wi) => (
        <div key={wi} className="week">
          {week.map((day, di) => {
            const dayKey = formatDateKey(day);
            const dayEvents = eventsByDay[dayKey] || {};
            const today = isToday(day);
            const inMonth = day.getMonth() === currentMonth.getMonth();

            return (
              <div
                key={di}
                className={`day-cell ${today ? "today" : ""} ${
                  !inMonth ? "other-month" : ""
                }`}
              >
                <div className="day-number">{day.getDate()}</div>
                <div className="events-container">
                  {Object.entries(dayEvents).map(([genre, list]) => (
                    <button
                      key={genre}
                      onClick={() =>
                        navigate(`/day/${dayKey}/${encodeURIComponent(genre)}`)
                      }
                      className="event-btn"
                      title={`${list.length} ${genre} event${
                        list.length > 1 ? "s" : ""
                      }`}
                    >
                      <span className="count">{list.length}</span>
                      <span className="genre">{genre}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
