// src/CalendarPage.jsx
import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import EventFormModal from "../components/eventFormModal";
import { useNavigate } from "react-router-dom";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Load all events from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snapshot) => {
      setEvents(
        snapshot.docs.map((doc) => {
          const d = doc.data();
          const toDate = (val) => (val?.toDate ? val.toDate() : val);
          return {
            id: doc.id,
            title: d.title,
            start: toDate(d.start),
            end: toDate(d.end),
            allDay: d.allDay,
            userId: d.userId, // used for delete permission
          };
        })
      );
    });
    return () => unsub();
  }, []);

  // Save new event
  const handleSaveEvent = async (newEvent) => {
    if (!user) return;
    await addDoc(collection(db, "events"), {
      ...newEvent,
      start: Timestamp.fromDate(newEvent.start),
      end: Timestamp.fromDate(newEvent.end),
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
    setAddModalOpen(false);
  };

  // When user clicks an event
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Community Calendar</h1>
        {user ? (
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            + Add Event
          </button>
        ) : (
          <button
            onClick={() => navigate("/signin")}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Sign in to Add Event
          </button>
        )}
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "75vh" }}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        onSelectEvent={handleSelectEvent} // open details modal
      />

      {/* Add Event Modal */}
      <EventFormModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveEvent}
      />

      {/* Event Details + Delete Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
            <h2 className="text-xl font-bold mb-4">{selectedEvent.title}</h2>
            <p className="mb-4">
              {selectedEvent.start.toLocaleString()} -{" "}
              {selectedEvent.end.toLocaleString()}
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-3 py-2 bg-gray-300 rounded"
              >
                Close
              </button>

              {/* Only show delete if user is creator */}
              {user?.uid === selectedEvent.userId && (
                <button
                  onClick={async () => {
                    const confirmDelete = window.confirm(
                      `Delete "${selectedEvent.title}"?`
                    );
                    if (!confirmDelete) return;

                    await deleteDoc(doc(db, "events", selectedEvent.id));
                    setSelectedEvent(null);
                  }}
                  className="px-3 py-2 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
