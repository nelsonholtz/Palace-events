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
import SimpleModal from "../components/SimpleModal";
import "../css/GenreDayPage.css";

export default function GenreDayPage() {
  const { date, genre } = useParams();
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    buttons: [],
    onButtonClick: null,
  });
  const navigate = useNavigate();

  const showModal = (title, message, buttons = [], onButtonClick = null) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      buttons,
      onButtonClick,
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const handleModalButtonClick = (action) => {
    if (modalConfig.onButtonClick) {
      modalConfig.onButtonClick(action);
    }

    closeModal();
  };

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

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
      console.error("Error fetching events:", error);
      showModal(
        "Error Loading Events",
        "There was a problem loading events. Please try again.",
        [{ label: "OK", type: "primary", action: "ok" }]
      );
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [date, user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, refreshTrigger]);

  const handleEventDeleted = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

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
        const g = event.genre || "uncategorized";
        if (!groups[g]) groups[g] = [];
        groups[g].push(event);
      }
    });

    return groups;
  }, [events, date]);

  const formattedDate = useMemo(() => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [date]);

  return (
    <div className="genre-day-page">
      <SimpleModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        buttons={modalConfig.buttons}
        onButtonClick={handleModalButtonClick}
      />

      <h1 className="page-header">Events on {formattedDate}</h1>

      {loading ? (
        <p className="loading-text">Loading events…</p>
      ) : Object.keys(eventsByGenre).length === 0 ? (
        <div className="no-events">No events scheduled for this day.</div>
      ) : genre ? (
        <div className="genre-cards-container">
          {eventsByGenre[genre] ? (
            <GenreCard
              key={genre}
              genre={genre}
              events={eventsByGenre[genre]}
              user={user}
              onEventDeleted={handleEventDeleted}
              showModal={showModal}
            />
          ) : (
            <div className="no-events">No events for genre: {genre}</div>
          )}
        </div>
      ) : (
        <div className="genre-cards-container">
          {Object.entries(eventsByGenre).map(([g, genreEvents]) => (
            <GenreCard
              key={g}
              genre={g}
              events={genreEvents}
              user={user}
              onEventDeleted={handleEventDeleted}
              showModal={showModal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
