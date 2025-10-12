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
import "../css/ImportTicketmasterPage.css";

export default function ImportTicketmasterPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState({ query: "art", location: "London" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const apiKey = import.meta.env.VITE_TICKETMASTER_API_KEY;

  const fetchEvents = async () => {
    if (!auth.currentUser) {
      setMessage("Please sign in to import events");
      return;
    }

    const currentUserUID = auth.currentUser.uid;
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
          ticketmasterId: event.id,
          title: event.name,
          start: startDate,
          end: endDate,
          description: event.info || "No description available",
          link: event.url,
          location: event._embedded.venues[0]?.name || "Location TBA",
          genre: "ticketmaster",
          userId: currentUserUID,
        };
      });

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
      const q = query(
        collection(db, "events"),
        where("ticketmasterId", "==", event.ticketmasterId)
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        setMessage(`"${event.title}" is already in your calendar`);
        return;
      }

      await addDoc(collection(db, "events"), {
        ...event,
        ticketmasterId: event.ticketmasterId,
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
    <div className="import-page-container">
      <div className="import-page">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>

        <div className="page-header">
          <h1>Import Events from Ticketmaster</h1>
          <p>Discover and import exciting events to your community calendar</p>
        </div>

        <div className="search-section">
          <div className="search-controls">
            <input
              type="text"
              placeholder="Search events…"
              value={search.query}
              onChange={(e) => updateSearch("query", e.target.value)}
              className="search-input"
            />
            <input
              type="text"
              placeholder="Location"
              value={search.location}
              onChange={(e) => updateSearch("location", e.target.value)}
              className="search-input"
            />
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="search-button"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Searching...
                </>
              ) : (
                "Search Events"
              )}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`message ${
              message.includes("✅")
                ? "success"
                : message.includes("❌")
                ? "error"
                : "info"
            }`}
          >
            {message}
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner large"></div>
            <p>Fetching events from Ticketmaster...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="no-events">
            <div className="no-events-icon">🎭</div>
            <h3>No Events Found</h3>
            <p>Try adjusting your search terms or location</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((e) => (
              <div key={e.ticketmasterId} className="event-card">
                <div className="event-header">
                  <h3>{e.title}</h3>
                  <span className="event-badge">Ticketmaster</span>
                </div>

                <div className="event-details">
                  <div className="event-date">
                    <span className="icon">📅</span>
                    {e.start.toLocaleDateString()} –{" "}
                    {e.end.toLocaleDateString()}
                  </div>
                  <div className="event-location">
                    <span className="icon">📍</span>
                    {e.location}
                  </div>
                  <p className="event-description">{e.description}</p>
                </div>

                <div className="event-actions">
                  <a
                    href={e.link}
                    target="_blank"
                    rel="noreferrer"
                    className="ticketmaster-link"
                  >
                    <span className="icon">🔗</span>
                    View on Ticketmaster
                  </a>
                  <button
                    onClick={() => addToCalendar(e)}
                    className="add-to-calendar-btn"
                  >
                    <span className="icon">+</span>
                    Add to Calendar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
