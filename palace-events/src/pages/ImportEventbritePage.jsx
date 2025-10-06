// src/pages/ImportEventbritePage.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function ImportEventbritePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queryText, setQueryText] = useState("art");
  const [location, setLocation] = useState("London");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Generate mock events as fallback
  const generateMockEvents = () => {
    const baseTime = new Date();
    return [
      {
        id: "mock-art-1",
        title: "Contemporary Art Exhibition Opening",
        start: new Date(baseTime.getTime() + 86400000), // Tomorrow
        end: new Date(baseTime.getTime() + 86400000 + 7200000), // +2 hours
        description:
          "Experience cutting-edge contemporary art from emerging London artists. This exhibition features mixed media, digital art, and immersive installations.",
        link: "#",
        location: "London Art Gallery, Shoreditch",
        genre: "eventbrite-art",
        userId: "eventbrite",
      },
      {
        id: "mock-art-2",
        title: "Watercolor Workshop for Beginners",
        start: new Date(baseTime.getTime() + 172800000), // Day after tomorrow
        end: new Date(baseTime.getTime() + 172800000 + 10800000), // +3 hours
        description:
          "Learn fundamental watercolor techniques in this hands-on workshop. All materials provided. Perfect for absolute beginners.",
        link: "#",
        location: "Creative Studio London, Camden",
        genre: "eventbrite-art",
        userId: "eventbrite",
      },
      {
        id: "mock-art-3",
        title: "Street Art Walking Tour",
        start: new Date(baseTime.getTime() + 259200000), // 3 days from now
        end: new Date(baseTime.getTime() + 259200000 + 9000000), // +2.5 hours
        description:
          "Guided tour through London's most vibrant street art districts. Discover hidden murals and learn about urban art culture.",
        link: "#",
        location: "Brick Lane, London",
        genre: "eventbrite-art",
        userId: "eventbrite",
      },
    ];
  };

  // Process events from API response
  const processEvents = (parsed) => {
    console.log("✅ Parsed remote data:", parsed);

    // Normalize events array from possible shapes
    let remoteEvents = [];
    if (Array.isArray(parsed.events)) remoteEvents = parsed.events;
    else if (Array.isArray(parsed.data?.events))
      remoteEvents = parsed.data.events;
    else if (Array.isArray(parsed)) remoteEvents = parsed;
    else if (Array.isArray(parsed.items)) remoteEvents = parsed.items;
    else if (Array.isArray(parsed._embedded?.events))
      remoteEvents = parsed._embedded.events;

    if (!remoteEvents || remoteEvents.length === 0) {
      setMessage("No events found for this search.");
      setEvents([]);
      return;
    }

    // Map whatever remote format into our internal event shape (defensive)
    const upcoming = remoteEvents.map((e, idx) => ({
      id: e.id || e._id || `ev-${Date.now()}-${idx}`,
      title: e.name?.text || e.title || e.name || "Untitled Event",
      // support multiple possible datetime fields
      start: e.start?.utc
        ? new Date(e.start.utc)
        : e.start
        ? new Date(e.start)
        : e.dates?.start?.dateTime
        ? new Date(e.dates.start.dateTime)
        : new Date(),
      end: e.end?.utc
        ? new Date(e.end.utc)
        : e.end
        ? new Date(e.end)
        : e.dates?.end?.dateTime
        ? new Date(e.dates.end.dateTime)
        : new Date(Date.now() + 3600000),
      description:
        (e.description?.text && e.description.text.slice(0, 200)) ||
        (typeof e.description === "string" && e.description.slice(0, 200)) ||
        e.info ||
        "No description.",
      link: e.url || e.link || "#",
      location: e.online_event
        ? "Online"
        : e.venue?.name ||
          e.location ||
          e._embedded?.venues?.[0]?.name ||
          "TBA",
      genre: "eventbrite-art",
      userId: "eventbrite",
    }));

    setEvents(upcoming);
    setMessage(`Found ${upcoming.length} real events 🎨`);
  };

  const fetchWithProxy = async (targetUrl) => {
    // Use CORS proxy
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
      targetUrl
    )}`;

    console.log("🌐 Trying proxy URL:", proxyUrl);
    const res = await fetch(proxyUrl);

    if (!res.ok) throw new Error(`Proxy fetch failed: ${res.status}`);

    const wrapper = await res.json();

    if (!wrapper || typeof wrapper.contents !== "string") {
      throw new Error("Proxy returned unexpected response");
    }

    // Check if contents is HTML error page
    if (
      wrapper.contents.includes("<!doctype html>") ||
      wrapper.contents.includes("404") ||
      wrapper.contents.includes("NOT_FOUND")
    ) {
      throw new Error("API service returned 404 - endpoint not found");
    }

    const parsed = JSON.parse(wrapper.contents);
    return parsed;
  };

  const fetchEvents = async () => {
    setLoading(true);
    setMessage("");
    console.log("🔍 Fetching events...");

    try {
      // Try multiple API endpoints with proxy
      const endpoints = [
        // Try the original endpoint with proxy
        `https://open-event-api.vercel.app/api/events?q=${encodeURIComponent(
          queryText
        )}&city=${encodeURIComponent(location)}`,

        // Try alternative endpoint format
        `https://open-event-api.vercel.app/events?q=${encodeURIComponent(
          queryText
        )}&city=${encodeURIComponent(location)}`,

        // Try public events API as backup
        `https://publicapi.ticketmaster.com/discovery/v2/events.json?keyword=${encodeURIComponent(
          queryText
        )}&city=${encodeURIComponent(
          location
        )}&apikey=GG4a1Kb8Km7bA1bZ8l2e9GbAQHGAepE2`,
      ];

      let success = false;

      for (let targetUrl of endpoints) {
        try {
          console.log(`🔄 Trying endpoint: ${targetUrl}`);
          const data = await fetchWithProxy(targetUrl);

          // Check if we got meaningful data
          if (
            data &&
            (Array.isArray(data) ||
              Array.isArray(data.events) ||
              Array.isArray(data._embedded?.events) ||
              Array.isArray(data.data?.events))
          ) {
            processEvents(data);
            success = true;
            console.log(`✅ Success with endpoint`);
            break;
          }
        } catch (err) {
          console.log(`❌ Endpoint failed: ${err.message}`);
          continue;
        }
      }

      if (!success) {
        throw new Error("All API endpoints failed");
      }
    } catch (err) {
      console.log("❌ All APIs failed, using mock data:", err);

      // Fallback to mock data
      const mockEvents = generateMockEvents();
      setEvents(mockEvents);
      setMessage(
        `Demo mode: ${mockEvents.length} sample art events 🎨 (Real service unavailable)`
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Add to Calendar ---
  const addToCalendar = async (eventData) => {
    try {
      // duplicate check based on event id field
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "16px" }}>
        ← Back
      </button>

      <h1>Import Art Events</h1>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Search for art events in your area. If the live service is unavailable,
        demo data will be shown.
      </p>

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
        <button
          onClick={fetchEvents}
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
          }}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {message && (
        <p
          style={{
            marginBottom: "12px",
            padding: "10px",
            borderRadius: "6px",
            background: message.includes("Demo mode") ? "#fff3cd" : "#d1ecf1",
            border: `1px solid ${
              message.includes("Demo mode") ? "#ffeaa7" : "#bee5eb"
            }`,
          }}
        >
          {message}
        </p>
      )}

      {loading ? (
        <p>Fetching events…</p>
      ) : events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        events.map((e) => (
          <div
            key={e.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <h3 style={{ margin: "0 0 6px 0" }}>{e.title}</h3>
            <div style={{ fontSize: 14, marginBottom: 6 }}>
              📅 {e.start.toLocaleString()} — {e.end.toLocaleString()}
            </div>
            <div style={{ fontSize: 14, marginBottom: 6 }}>📍 {e.location}</div>
            <div style={{ marginBottom: 8 }}>{e.description}</div>
            <a href={e.link} target="_blank" rel="noreferrer">
              🔗 View
            </a>
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => addToCalendar(e)}
                style={{
                  padding: "6px 12px",
                  background: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
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
