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
import TemporaryFailureCard from "../components/TemporaryFailureCard";
import "../css/ImportTicketmasterPage.css";

export default function ImportTicketmasterPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState({
    query: "Art",
    location: "London",
    category: "",
    startDate: "",
  });
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [apiFailed, setApiFailed] = useState(false);
  const navigate = useNavigate();

  const apiKey = import.meta.env.VITE_TICKETMASTER_API_KEY;

  const fetchEvents = async () => {
    if (!auth.currentUser) {
      showMessageModal("Please sign in to import events");
      return;
    }

    const currentUserUID = auth.currentUser.uid;
    setLoading(true);
    setMessage("");
    setApiFailed(false);

    try {
      let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}`;

      if (search.query.trim()) {
        url += `&keyword=${encodeURIComponent(search.query.trim())}`;
      }

      url += `&city=${encodeURIComponent(search.location)}`;

      if (search.category && search.category !== "") {
        url += `&classificationName=${encodeURIComponent(search.category)}`;
      }

      if (search.startDate) {
        const startDateTime = `${search.startDate}T00:00:00Z`;
        url += `&startDateTime=${startDateTime}`;
      }

      url += `&size=100&sort=date,asc`;

      console.log("Fetching events from:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.fault) {
        throw new Error(`Ticketmaster API error: ${data.fault.faultstring}`);
      }

      const eventsData = data._embedded?.events || [];

      if (eventsData.length === 0) {
        setMessage(
          "No events found. Try different search terms or categories."
        );
        setEvents([]);
        return;
      }

      const eventsByTitle = {};
      const today = new Date();

      eventsData.forEach((event) => {
        if (!event.dates?.start?.dateTime) return;

        const startDate = new Date(event.dates.start.dateTime);

        if (startDate < today) return;

        let endDate = event.dates.end?.dateTime
          ? new Date(event.dates.end.dateTime)
          : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

        if (endDate < startDate) {
          endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
        }

        const eventKey = `${event.name}-${
          event._embedded?.venues?.[0]?.name || "unknown"
        }-${startDate.toDateString()}`;

        if (!eventsByTitle[eventKey]) {
          eventsByTitle[eventKey] = {
            ticketmasterId: event.id,
            title: event.name,
            start: startDate,
            end: endDate,
            description: event.info || event.description || event.name,
            link: event.url,
            location: event._embedded?.venues?.[0]?.name || "Location TBA",
            venue: event._embedded?.venues?.[0],
            genre: "ticketmaster", // Set to "ticketmaster" instead of the original genre
            userId: currentUserUID,
          };
        }
      });

      const formattedEvents = Object.values(eventsByTitle);

      formattedEvents.sort((a, b) => a.start - b.start);

      setEvents(formattedEvents);

      if (formattedEvents.length === 0) {
        setMessage("No upcoming events found. Try a different search.");
      } else {
        setMessage(`Found ${formattedEvents.length} upcoming events 🎉`);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setApiFailed(true);
      setMessage("Failed to fetch events. Please try again.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUseMockData = (mockEvents) => {
    const eventsWithUser = mockEvents.map((event) => ({
      ...event,
      userId: auth.currentUser.uid,
    }));
    setEvents(eventsWithUser);
    setMessage(`Demo mode: Showing ${mockEvents.length} sample events 🎭`);
    setApiFailed(false);
  };

  const handleRetryConnection = () => {
    fetchEvents();
  };

  const showMessageModal = (msg) => {
    setModalMessage(msg);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
  };

  const addToCalendar = async (event) => {
    if (!auth.currentUser) {
      showMessageModal("Please sign in to add events");
      return;
    }

    try {
      const q = query(
        collection(db, "events"),
        where("ticketmasterId", "==", event.ticketmasterId)
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        showMessageModal(`"${event.title}" is already in your calendar`);
        return;
      }

      await addDoc(collection(db, "events"), {
        ...event,
        ticketmasterId: event.ticketmasterId,
        start: Timestamp.fromDate(event.start),
        end: Timestamp.fromDate(event.end),
        userId: auth.currentUser.uid,
        genre: "ticketmaster", // Force the genre to be "ticketmaster"
      });

      showMessageModal(`✅ "${event.title}" added to calendar`);
    } catch (error) {
      console.error("Error adding event:", error);
      showMessageModal("Failed to add event to calendar");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const updateSearch = (field, value) => {
    setSearch((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const quickSearch = (query, category = "") => {
    setSearch((prev) => ({ ...prev, query, category }));
    // Auto-search after a brief delay
    setTimeout(() => {
      fetchEvents();
    }, 100);
  };

  return (
    <div className="import-page-container">
      <div className="import-page">
        <div className="page-header">
          <h1>Import Events from Ticketmaster</h1>
          <p>Discover and import exciting events to your community calendar</p>
        </div>

        <form onSubmit={handleSearch} className="search-section">
          <div className="search-controls-row">
            <input
              type="text"
              placeholder="Search events, artists, or venues…"
              value={search.query}
              onChange={(e) => updateSearch("query", e.target.value)}
              className="search-input"
            />

            <input
              type="text"
              placeholder="City or location"
              value={search.location}
              onChange={(e) => updateSearch("location", e.target.value)}
              className="search-input"
            />

            <select
              value={search.category}
              onChange={(e) => updateSearch("category", e.target.value)}
              className="category-select"
            >
              <option value="">All Categories</option>
              <option value="music">Music</option>
              <option value="sports">Sports</option>
              <option value="arts">Arts & Theater</option>
              <option value="family">Family</option>
              <option value="comedy">Comedy</option>
            </select>

            <div className="date-filter-single">
              <input
                type="date"
                placeholder="From Date"
                value={search.startDate}
                onChange={(e) => updateSearch("startDate", e.target.value)}
                className="date-input"
              />
              {/* Remove the clear button and its conditional rendering */}
            </div>
          </div>

          <div className="search-button-row">
            <button type="submit" disabled={loading} className="search-button">
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
        </form>

        {message && (
          <div
            className={`message ${
              message.includes("✅") ||
              message.includes("🎉") ||
              message.includes("Demo mode")
                ? "success"
                : message.includes("❌") ||
                  message.includes("Failed") ||
                  message.includes("error") ||
                  message.includes("down")
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
        ) : apiFailed ? (
          <TemporaryFailureCard
            searchQuery={search.query}
            searchLocation={search.location}
            onUseMockData={handleUseMockData}
            onRetry={handleRetryConnection}
          />
        ) : events.length === 0 ? (
          <div className="no-events">
            <h3>No Events Found</h3>
            <p>Try adjusting your search terms, location, or category</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((e) => (
              <div key={e.ticketmasterId} className="event-card">
                <div className="event-header">
                  <h3>{e.title}</h3>
                  <span className="event-badge">
                    {e.ticketmasterId.startsWith("mock")
                      ? "Demo"
                      : "Ticketmaster"}
                  </span>
                </div>

                <div className="event-details">
                  <div className="event-date">
                    <span className="icon">📅</span>
                    {e.start.toLocaleDateString()} at{" "}
                    {e.start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="event-location">
                    <span className="icon">📍</span>
                    {e.location}
                  </div>
                  <div className="event-genre">
                    <span className="icon">🎟️</span>
                    Ticketmaster Event
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
                    {e.ticketmasterId.startsWith("mock")
                      ? "View Details"
                      : "View on Ticketmaster"}
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

        {/* Modal Popup */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-message">{modalMessage}</div>
              <button onClick={closeModal} className="modal-ok-button">
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
