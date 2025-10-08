import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";

export default function AttendButton({ event, user }) {
  const [isAttending, setIsAttending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);

  // Check if user is already attending
  useEffect(() => {
    if (!user || !event.id) return;

    const checkAttendance = async () => {
      const attendeeRef = doc(db, "events", event.id, "attendees", user.uid);
      const attendeeSnap = await getDoc(attendeeRef);
      setIsAttending(attendeeSnap.exists());
    };

    checkAttendance();
  }, [user, event.id]);

  // Listen to attendee count
  useEffect(() => {
    if (!event.id) return;

    const attendeesRef = collection(db, "events", event.id, "attendees");
    const unsubscribe = onSnapshot(attendeesRef, (snapshot) => {
      setAttendeeCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [event.id]);

  const handleAttend = async () => {
    if (!user) {
      alert("Please sign in to RSVP for events");
      return;
    }

    setLoading(true);
    try {
      const attendeeRef = doc(db, "events", event.id, "attendees", user.uid);

      if (isAttending) {
        // Remove RSVP
        await deleteDoc(attendeeRef);
        setIsAttending(false);
      } else {
        // Add RSVP
        await setDoc(attendeeRef, {
          userId: user.uid,
          userName: user.displayName || user.email,
          userEmail: user.email,
          userPhoto: user.photoURL,
          joinedAt: new Date(),
        });
        setIsAttending(true);
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      alert("Failed to update RSVP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <button
        onClick={handleAttend}
        disabled={loading}
        style={{
          background: isAttending ? "#28a745" : "#6c757d",
          color: "white",
          border: "none",
          padding: "6px 12px",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "12px",
          transition: "all 0.2s ease",
        }}
      >
        {loading ? "..." : isAttending ? "✅ Attending" : "✋ Attend"}
      </button>
      <span style={{ fontSize: "12px", color: "#666" }}>
        {attendeeCount} attending
      </span>
    </div>
  );
}
