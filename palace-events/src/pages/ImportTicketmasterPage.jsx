import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
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
  const [queryText, setQueryText] = useState("art");
  const [location, setLocation] = useState("London");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const functionUrl = import.meta.env.VITE_TICKETMASTER_FUNCTION_URL;

  const fetchEvents = async () => {
    setLoading(true);
    setMessage("");

    try {
      const url = new URL(functionUrl);

      if (queryText) url.searchParams.append("keyword", queryText);
      if (location) url.searchParams.append("city", location);
      if (startDate)
        url.searchParams.append("startDateTime", startDate.toISOString());
      if (endDate)
        url.searchParams.append("endDateTime", endDate.toISOString());

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Ticketmaster fetch failed: ${res.status}`);

      const data = await res.json();

      if (
        !data._embedded ||
        !data._embedded.events ||
        data._embedded.events.length === 0
      ) {
        setMessage("No events found for this search.");
        setEvents([]);
        return;
      }

      const upcoming = data._embedded.events.map((e) => {
        const start = new Date(e.dates.start.dateTime);
        let end = e.dates.end?.dateTime
          ? new Date(e.dates.end.dateTime)
          : new Date(start.getTime() + 2 * 60 * 60 * 1000);

        if (end < start) end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

        return {
          id: e.id,
          title: e.name,
          start,
          end,
          description: e.info || "No description.",
          link: e.url,
          location: e._embedded.venues[0]?.name || "TBA",
          genre: "ticketmaster",
          userId: "ticketmaster",
        };
      });

      setEvents(upcoming);
      setMessage(`Found ${upcoming.length} events 🎨`);
    } catch (err) {
      console.error("🔥 Error fetching Ticketmaster events:", err);
      setMessage("Failed to fetch Ticketmaster events 😢");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCalendar = async (eventData) => {
    try {
      const q = query(
        collection(db, "events"),
        where("id", "==", eventData.id)
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        setMessage(`⚠️ "${eventData.title}" is already in your calendar`);
        return;
      }

      await addDoc(collection(db, "events"), {
        ...eventData,
        start: Timestamp.fromDate(eventData.start),
        end: Timestamp.fromDate(eventData.end),
      });

      setMessage(`✅ "${eventData.title}" added to your calendar`);
    } catch (err) {
      console.error(err);
      setMessage("Failed to add event to calendar.");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          style={{ padding: "8px", flex: "1" }}
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ padding: "8px", flex: "1" }}
        />
        <input
          type="date"
          value={startDate.toISOString().split("T")[0]}
          onChange={(e) => setStartDate(new Date(e.target.value))}
          style={{ padding: "8px" }}
        />
        <input
          type="date"
          value={endDate.toISOString().split("T")[0]}
          onChange={(e) => setEndDate(new Date(e.target.value))}
          style={{ padding: "8px" }}
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
            key={e.id}
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
