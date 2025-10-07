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
      console.log("🔐 Auth state changed:", user?.uid);
      setUser(user);
    });
  }, []);

  // Fetch events function that can be called multiple times
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const start = new Date(`${date}T00:00:00`);
      const end = new Date(`${date}T23:59:59`);

      console.log("📅 Fetching events for date:", date);
      console.log("👤 Current user UID:", user?.uid);

      const q = query(
        collection(db, "events"),
        where("start", "<=", Timestamp.fromDate(end)),
        where("end", ">=", Timestamp.fromDate(start))
      );

      const snapshot = await getDocs(q);
      const eventsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const toDate = (val) => (val?.toDate ? val.toDate() : new Date(val));

        const event = {
          id: doc.id, // This is the ACTUAL Firestore document ID
          ...data,
          start: toDate(data.start),
          end: toDate(data.end),
        };

        console.log(
          "📋 Loaded event - Firestore ID:",
          doc.id,
          "Title:",
          event.title,
          "by user:",
          event.userId
        );
        return event;
      });

      console.log("✅ Fetched events:", eventsData.length);
      console.log(
        "📊 All Firestore IDs:",
        eventsData.map((e) => e.id)
      );
      setEvents(eventsData);
    } catch (error) {
      console.error("❌ Failed to fetch events:", error);
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
    console.log("🔄 Refreshing events after deletion...");
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Test Firestore connection
  const testFirestoreConnection = async () => {
    console.log("🧪 Testing Firestore connection...");

    try {
      // Try to read any event
      const eventsRef = collection(db, "events");
      const snapshot = await getDocs(eventsRef);
      console.log(
        "✅ Firestore connection working. Total events:",
        snapshot.size
      );

      // Log all event IDs to see the actual Firestore document IDs
      snapshot.docs.forEach((doc) => {
        console.log(
          "📄 Firestore Document:",
          doc.id,
          "Title:",
          doc.data().title
        );
      });
    } catch (error) {
      console.error("❌ Firestore test failed:", error);
    }
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

      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={() => setRefreshTrigger((prev) => prev + 1)}
          style={{
            marginRight: "10px",
            background: "#28a745",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "4px",
          }}
        >
          🔄 Manual Refresh
        </button>

        <button
          onClick={testFirestoreConnection}
          style={{
            background: "#17a2b8",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "4px",
          }}
        >
          🧪 Test Connection
        </button>
      </div>

      <h1 style={{ marginBottom: "12px" }}>Events on {date}</h1>

      {/* Debug info */}
      {user && (
        <div
          style={{
            background: "#f0f0f0",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "5px",
            fontSize: "14px",
          }}
        >
          <strong>Debug Info:</strong> User UID: {user.uid} | Events:{" "}
          {events.length}
        </div>
      )}

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
