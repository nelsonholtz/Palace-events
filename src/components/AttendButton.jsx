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

export default function AttendButton({ event, user, showModal }) {
  const [isAttending, setIsAttending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);

  useEffect(() => {
    if (!user || !event.id) return;

    const checkAttendance = async () => {
      const attendeeRef = doc(db, "events", event.id, "attendees", user.uid);
      const attendeeSnap = await getDoc(attendeeRef);
      setIsAttending(attendeeSnap.exists());
    };

    checkAttendance();
  }, [user, event.id]);

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
      if (showModal) {
        showModal("Sign In Required", "You need to sign in to attend events.", [
          { label: "OK", type: "primary", action: "ok" },
        ]);
      } else {
        alert("Please sign in to RSVP for events");
      }
      return;
    }

    setLoading(true);
    try {
      const attendeeRef = doc(db, "events", event.id, "attendees", user.uid);
      if (isAttending) {
        await deleteDoc(attendeeRef);
        setIsAttending(false);
      } else {
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
      if (showModal) {
        showModal("RSVP Failed", "Failed to update RSVP. Please try again.", [
          { label: "OK", type: "primary", action: "ok" },
        ]);
      } else {
        alert("Failed to update RSVP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAttend}
      disabled={loading}
      className="card-btn attend-btn"
    >
      {loading ? "..." : isAttending ? "✅ Attending" : "✋ Attend"}
    </button>
  );
}
