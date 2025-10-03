// src/pages/GenreDayPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import GenreCard from "../components/GenreCard";

export default function GenreDayPage() {
  const { date } = useParams(); // date = YYYY-MM-DD
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const start = new Date(`${date}T00:00:00`);
        const end = new Date(`${date}T23:59:59`);

        const q = query(
          collection(db, "events"),
          where("start", "<=", Timestamp.fromDate(end)), // started before day ends
          where("end", ">=", Timestamp.fromDate(start)) // ends after day starts
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

  // Group events by genre
  const eventsByGenre = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const g = ev.genre || "uncategorized";
      if (!map[g]) map[g] = [];
      map[g].push(ev);
    });
    return map;
  }, [events]);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "16px" }}>
        ← Back
      </button>

      <h1 style={{ marginBottom: "12px" }}>Events on {date}</h1>

      {loading ? (
        <p>Loading…</p>
      ) : Object.keys(eventsByGenre).length === 0 ? (
        <p>No events for this day.</p>
      ) : (
        Object.entries(eventsByGenre).map(([genre, evs]) => (
          <GenreCard key={genre} genre={genre} events={evs} />
        ))
      )}
    </div>
  );
}
