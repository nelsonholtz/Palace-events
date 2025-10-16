import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import SimpleModal from "../components/SimpleModal";
import ProfileEventCard from "../components/ProfileEventCard";
import "../css/ProfilePage.css";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    buttons: [],
  });
  const navigate = useNavigate();

  const showModal = (title, message, buttons = []) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      buttons,
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserEvents(currentUser.uid);
      } else {
        setUser(null);
        setUserEvents([]);
        setLoading(false);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserEvents = async (userId) => {
    try {
      setLoading(true);

      const eventsRef = collection(db, "events");
      const eventsSnapshot = await getDocs(eventsRef);

      const userAttendingEvents = [];

      for (const eventDoc of eventsSnapshot.docs) {
        const eventData = eventDoc.data();
        const attendeeRef = doc(db, "events", eventDoc.id, "attendees", userId);
        const attendeeSnap = await getDoc(attendeeRef);

        if (attendeeSnap.exists()) {
          userAttendingEvents.push({
            id: eventDoc.id,
            ...eventData,
            start: eventData.start?.toDate(),
            end: eventData.end?.toDate(),
          });
        }
      }

      setUserEvents(userAttendingEvents);
    } catch (error) {
      console.error("Error fetching user events:", error);
      showModal(
        "Error Loading Events",
        "There was a problem loading your events. Please try again.",
        [{ label: "OK", type: "primary", action: "ok" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRSVP = async (eventId, eventTitle) => {
    if (!user) return;

    showModal(
      "Remove RSVP",
      `Are you sure you want to remove yourself from "${eventTitle}"?`,
      [
        { label: "Remove", type: "danger", action: "remove" },
        { label: "Cancel", type: "secondary", action: "cancel" },
      ],
      async (action) => {
        if (action === "remove") {
          try {
            const attendeeRef = doc(
              db,
              "events",
              eventId,
              "attendees",
              user.uid
            );
            await deleteDoc(attendeeRef);

            fetchUserEvents(user.uid);

            showModal("RSVP Removed", "You have been removed from the event.", [
              { label: "OK", type: "primary", action: "ok" },
            ]);
          } catch (error) {
            console.error("Error removing RSVP:", error);
            showModal(
              "Remove Failed",
              "Failed to remove RSVP. Please try again.",
              [{ label: "OK", type: "primary", action: "ok" }]
            );
          }
        }
      }
    );
  };

  const toggleEventDetails = (eventId) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
    } else {
      setExpandedEvent(eventId);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Loading your profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-error">Please log in to view your profile</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <SimpleModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        buttons={modalConfig.buttons}
        onButtonClick={closeModal}
      />

      <div className="profile-content">
        {/* User Info Section */}
        <div className="user-info-card">
          <div className="user-avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {user.displayName
                  ? user.displayName.charAt(0).toUpperCase()
                  : user.email?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-details">
            <h2>{user.displayName || "User"}</h2>
            <p className="user-email">{user.email}</p>
            <p className="events-count">
              Attending {userEvents.length} event
              {userEvents.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="events-section">
          <h3>My Events</h3>

          {userEvents.length === 0 ? (
            <div className="no-events">
              <p>You haven't RSVP'd to any events yet.</p>
              <button
                onClick={() => navigate("/")}
                className="browse-events-button"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="events-grid">
              {userEvents.map((event) => (
                <ProfileEventCard
                  key={event.id}
                  event={event}
                  onRemoveRSVP={handleRemoveRSVP}
                  isExpanded={expandedEvent === event.id}
                  onToggleDetails={toggleEventDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
