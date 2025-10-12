import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  addDoc,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import GenreCard from "../components/GenreCard";

export default function GenreDayPage() {
  const { date } = useParams();
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  // Add auth listener
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  // Fetch events function that can be called multiple times
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const start = new Date(`${date}T00:00:00`);
      const end = new Date(`${date}T23:59:59`);

      const q = query(
        collection(db, "events"),
        where("start", "<=", Timestamp.fromDate(end)),
        where("end", ">=", Timestamp.fromDate(start))
      );

      const snapshot = await getDocs(q);
      const eventsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const toDate = (val) => (val?.toDate ? val.toDate() : new Date(val));
        return {
          id: doc.id,
          ...data,
          start: toDate(data.start),
          end: toDate(data.end),
        };
      });
      setEvents(eventsData);
    } catch (error) {
      // handle error silently
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [date, user]);

  // Fetch events when date changes or when refresh is triggered
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, refreshTrigger]);

  // Callback for when an event is deleted
  const handleEventDeleted = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Test Firestore connection
  const testFirestoreConnection = async () => {
    // Test connection removed for production
    return;
  };

  // Group events by genre for this specific day
  const eventsByGenre = useMemo(() => {
    const groups = {};

    events.forEach((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const currentDay = new Date(date);

      const startsOnDay =
        eventStart.toDateString() === currentDay.toDateString();
      const endsOnDay = eventEnd.toDateString() === currentDay.toDateString();
      const spansDay = eventStart <= currentDay && eventEnd >= currentDay;

      if (startsOnDay || endsOnDay || spansDay) {
        const genre = event.genre || "uncategorized";
        if (!groups[genre]) groups[genre] = [];
        groups[genre].push(event);
      }
    });

    return groups;
  }, [events, date]);

  return (
    <div
      className="genre-day-page"
      style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}
    >
      <button onClick={() => navigate(-1)} style={{ marginBottom: "16px" }}>
        ← Back
      </button>

      {/* Manual refresh and test connection removed for production */}

      <h1 style={{ marginBottom: "12px" }}>Events on {date}</h1>

      {/* Debug info removed for production */}

      {loading ? (
        <p>Loading…</p>
      ) : Object.keys(eventsByGenre).length === 0 ? (
        <p>No events for this day.</p>
      ) : (
        Object.entries(eventsByGenre).map(([genre, genreEvents]) => (
          <GenreCard
            key={genre}
            genre={genre}
            events={genreEvents}
            user={user}
            onEventDeleted={handleEventDeleted}
          />
        ))
      )}
    </div>
  );
}
