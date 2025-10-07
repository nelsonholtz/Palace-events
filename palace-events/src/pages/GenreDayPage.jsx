import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import GenreCard from "../components/GenreCard";

export default function GenreDayPage() {
  const { date } = useParams(); // YYYY-MM-DD
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Watch for login status
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const start = new Date(`${date}T00:00:00`);
        const end = new Date(`${date}T23:59:59`);

        const q = query(
          collection(db, "events"),
          where("start", "<=", Timestamp.fromDate(end)),
          where("end", ">=", Timestamp.fromDate(start))
        );

        const snap = await getDocs(q);
        const loaded = snap.docs.map((d) => {
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

        setEvents(loaded);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [date]);

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

  // Filter: Ticketmaster visible only to logged-in users
  const visibleEvents = useMemo(() => {
    return events.filter((ev) => {
      if (ev.genre === "ticketmaster" && !user) return false;
      return true;
    });
  }, [events, user]);

  // Group events by genre
  const eventsByGenre = useMemo(() => {
    const map = {};
    visibleEvents.forEach((ev) => {
      const dayKeys = getDateRangeKeys(ev.start, ev.end);
      if (!dayKeys.includes(date)) return;

      const g = ev.genre || "uncategorized";
      if (!map[g]) map[g] = [];
      map[g].push(ev);
    });
    return map;
  }, [visibleEvents, date]);

  // Handler to remove an event from state after deletion
  const handleRemoveEvent = (eventId) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "16px" }}>
        ← Back
      </button>

      <h1 style={{ marginBottom: "12px" }}>Events on {date}</h1>

      {loading ? (
        <p>Loading…</p>
      ) : Object.keys(eventsByGenre).length === 0 ? (
        <p>
          {user
            ? "No events for this day."
            : "No public events for this day. (Log in to see Ticketmaster ones 🎟️)"}
        </p>
      ) : (
        Object.entries(eventsByGenre).map(([genre, evs]) => (
          <GenreCard
            key={genre}
            genre={genre}
            events={evs}
            user={user}
            onDelete={handleRemoveEvent} // ✅ pass delete callback
          />
        ))
      )}
    </div>
  );
}
