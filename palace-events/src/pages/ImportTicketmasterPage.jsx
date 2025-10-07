import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function ImportTicketmasterPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState({ query: "art", location: "London" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const apiKey = import.meta.env.VITE_TICKETMASTER_API_KEY;

  const fetchEvents = async () => {
    // Check if user is signed in
    if (!auth.currentUser) {
      setMessage("Please sign in to import events");
      return;
    }

    const currentUserUID = auth.currentUser.uid;
    console.log("👤 Importing events for user:", currentUserUID);

    setLoading(true);
    setMessage("");

    try {
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${encodeURIComponent(
        search.query
      )}&city=${encodeURIComponent(search.location)}&apikey=${apiKey}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();
      const eventsData = data._embedded?.events || [];

      if (eventsData.length === 0) {
        setMessage("No events found for this search.");
        setEvents([]);
        return;
      }

      const formattedEvents = eventsData.map((event) => {
        const startDate = new Date(event.dates.start.dateTime);
        let endDate = event.dates.end?.dateTime
          ? new Date(event.dates.end.dateTime)
          : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

        if (endDate < startDate) {
          endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
        }

        return {
          ticketmasterId: event.id, // Store Ticketmaster ID separately
          title: event.name,
          start: startDate,
          end: endDate,
          description: event.info || "No description available",
          link: event.url,
          location: event._embedded.venues[0]?.name || "Location TBA",
          genre: "ticketmaster",
          userId: currentUserUID, // Store actual user UID
        };
      });

      console.log("✅ Formatted events:", formattedEvents);
      setEvents(formattedEvents);
      setMessage(`Found ${formattedEvents.length} events 🎉`);
    } catch (error) {
      console.error("Error fetching events:", error);
      setMessage("Failed to fetch events. Please try again.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCalendar = async (event) => {
    if (!auth.currentUser) {
      setMessage("Please sign in to add events");
      return;
    }

    try {
      // Check if event already exists using ticketmasterId
      const q = query(
        collection(db, "events"),
        where("ticketmasterId", "==", event.ticketmasterId)
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        setMessage(`"${event.title}" is already in your calendar`);
        return;
      }

      // Add to Firestore - let Firestore generate its own document ID
      await addDoc(collection(db, "events"), {
        ...event,
        ticketmasterId: event.ticketmasterId, // Store separately
        start: Timestamp.fromDate(event.start),
        end: Timestamp.fromDate(event.end),
        userId: auth.currentUser.uid,
      });

      setMessage(`✅ "${event.title}" added to calendar`);
    } catch (error) {
      console.error("Error adding event:", error);
      setMessage("Failed to add event to calendar");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const updateSearch = (field, value) => {
    setSearch((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "16px" }}>
        ← Back
      </button>
      <h1>Import Events from Ticketmaster</h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search events…"
          value={search.query}
          onChange={(e) => updateSearch("query", e.target.value)}
          style={{ padding: "8px", flex: "1" }}
        />
        <input
          type="text"
          placeholder="Location"
          value={search.location}
          onChange={(e) => updateSearch("location", e.target.value)}
          style={{ padding: "8px", flex: "1" }}
        />
        <button
          onClick={fetchEvents}
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {message && <p style={{ marginBottom: "12px" }}>{message}</p>}

      {loading ? (
        <p>Fetching events...</p>
      ) : events.length === 0 ? (
        <p>No events found. Try another search.</p>
      ) : (
        events.map((e) => (
          <div
            key={e.ticketmasterId}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              marginBottom: "12px",
              padding: "12px",
              background: "#fff",
            }}
          >
            <h3>{e.title}</h3>
            <p>
              📅 {e.start.toLocaleDateString()} – {e.end.toLocaleDateString()}
            </p>
            <p>📍 {e.location}</p>
            <p>{e.description}</p>
            <a href={e.link} target="_blank" rel="noreferrer">
              🔗 View on Ticketmaster
            </a>
            <div style={{ marginTop: "8px" }}>
              <button
                onClick={() => addToCalendar(e)}
                style={{
                  padding: "6px 12px",
                  background: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                + Add to Calendar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
