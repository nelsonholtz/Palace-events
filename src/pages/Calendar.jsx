import React, { useEffect, useState, useMemo } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getGenreColour } from "../utils/eventColours";
import "../css/CalendarPage.css";

export default function CalendarPage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  // Detect mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const capitalizeGenre = (genre) => {
    if (!genre || genre === "ticketmaster") return genre;
    return genre.charAt(0).toUpperCase() + genre.slice(1);
  };

  // Abbreviate genre names for mobile
  const getGenreDisplay = (genre, count) => {
    if (genre === "ticketmaster") {
      return isMobile ? `🎟️${count}` : `🎟️ Events (${count})`;
    }

    if (isMobile) {
      // Return first letter capitalized for mobile
      return `${genre.charAt(0).toUpperCase()}${count}`;
    }

    return `${capitalizeGenre(genre)} (${count})`;
  };

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

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

  const visibleEvents = useMemo(() => {
    return events;
  }, [events, user]);

  const eventsByDay = useMemo(() => {
    const map = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    visibleEvents.forEach((event) => {
      if (!event.start || isNaN(event.start)) return;

      const start = new Date(event.start);
      const end = event.end && !isNaN(event.end) ? new Date(event.end) : start;

      const current = new Date(start);
      while (current <= end) {
        const dateKey =
          current.getFullYear() +
          "-" +
          String(current.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(current.getDate()).padStart(2, "0");
        if (!map[dateKey]) map[dateKey] = {};
        if (!map[dateKey][event.genre]) map[dateKey][event.genre] = [];

        map[dateKey][event.genre].push(event);
        current.setDate(current.getDate() + 1);
      }
    });

    return map;
  }, [visibleEvents]);

  const changeMonth = (direction) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)
    );
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weekdays = isMobile
    ? ["M", "T", "W", "T", "F", "S", "S"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const days = [];

  let firstDayOfWeek = firstDay.getDay();
  let paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  for (let i = 0; i < paddingDays; i++) days.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="calendar-page">
      <h1>Community Calendar</h1>
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
        {weekdays.map((day, index) => (
          <div key={index}>{day}</div>
        ))}
      </div>

      <div className="days-grid">
        {days.map((day, index) => {
          if (!day) return <div key={index} className="day-cell"></div>;

          const dateKey =
            day.getFullYear() +
            "-" +
            String(day.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(day.getDate()).padStart(2, "0");
          const dayEvents = eventsByDay[dateKey] || {};
          const genres = Object.keys(dayEvents);

          return (
            <div
              key={dateKey}
              className={`day-cell ${isToday(day) ? "current-day" : ""}`}
              onClick={() => {
                navigate(`/day/${dateKey}`);
              }}
            >
              <div className="day-number">{day.getDate()}</div>

              {Object.entries(dayEvents).map(([genre, events]) => {
                const colour = getGenreColour(genre);
                const displayGenre = getGenreDisplay(genre, events.length);

                return (
                  <button
                    key={genre}
                    className={`genre-button ${
                      genre === "ticketmaster" ? "ticketmaster-genre" : ""
                    } ${isMobile ? "mobile-genre" : ""}`}
                    style={{
                      backgroundColor: colour.background,
                      color: colour.text,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/day/${dateKey}/${genre}`);
                    }}
                    title={
                      isMobile
                        ? `${capitalizeGenre(genre)} (${events.length})`
                        : ""
                    }
                  >
                    {displayGenre}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
