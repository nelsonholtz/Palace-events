// src/pages/CreateEventPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import {
  addDoc,
  collection,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { isUserStaff } from "../utils/userRoles";

// SIMPLIFIED date parsing - store exactly what the user enters
function parseLocalDateTime(value) {
  if (!value) return null;

  // Create date from input string (this will be in local time)
  const date = new Date(value);

  // Create a new date that preserves the exact year, month, day, hours, minutes
  // but sets it as UTC to avoid timezone shifting
  const fixedDate = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    )
  );

  console.log("DATE PARSING:", {
    input: value,
    localDate: date.toString(),
    fixedDate: fixedDate.toString(),
    fixedUTC: fixedDate.toUTCString(),
  });

  return fixedDate;
}

export default function CreateEventPage() {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [genre, setGenre] = useState("music");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("You must be signed in to create an event");
      navigate("/login");
      return;
    }

    const staffCheck = await isUserStaff(user.uid);
    if (!staffCheck) {
      alert("❌ Staff access required! Only staff members can create events.");
      return;
    }

    // Parse dates
    const startDate = parseLocalDateTime(start);
    const endDate = parseLocalDateTime(end);

    if (!startDate || !endDate) {
      alert("Please enter valid start and end dates");
      return;
    }

    if (endDate <= startDate) {
      alert("End date must be after start date");
      return;
    }

    const newEvent = {
      title,
      start: Timestamp.fromDate(startDate),
      end: Timestamp.fromDate(endDate),
      location,
      duration,
      genre,
      description,
      link,
      userId: user.uid,
      createdAt: serverTimestamp(),
    };

    console.log("SAVING EVENT TO FIRESTORE:", {
      ...newEvent,
      startDate: startDate.toString(),
      endDate: endDate.toString(),
    });

    try {
      await addDoc(collection(db, "events"), newEvent);
      navigate("/");
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Error saving event. Please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <label className="text-sm">Start Date & Time</label>
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <label className="text-sm">End Date & Time</label>
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Duration (e.g. 2 hours)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="music">Music</option>
          <option value="performance">Performance</option>
          <option value="talk">Talk</option>
          <option value="exhibition">Exhibition</option>
        </select>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="url"
          placeholder="Event Link (optional)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Save Event
        </button>
      </form>
    </div>
  );
}
