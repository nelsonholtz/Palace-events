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
import "../css/CreateEventPage.css";

function parseLocalDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  return date;
}

export default function CreateEventPage() {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [genre, setGenre] = useState("music");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      alert("You must be signed in to create an event");
      navigate("/login");
      return;
    }

    const staffCheck = await isUserStaff(user.uid);
    if (!staffCheck) {
      alert("❌ Staff access required! Only staff members can create events.");
      setLoading(false);
      return;
    }

    const startDate = parseLocalDateTime(start);
    const endDate = parseLocalDateTime(end);

    if (!startDate || !endDate) {
      alert("Please enter valid start and end dates");
      setLoading(false);
      return;
    }

    if (endDate <= startDate) {
      alert("End date must be after start date");
      setLoading(false);
      return;
    }

    const newEvent = {
      title,
      start: Timestamp.fromDate(startDate),
      end: Timestamp.fromDate(endDate),
      location,
      genre,
      description,
      link,
      userId: user.uid,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "events"), newEvent);
      navigate("/");
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Error saving event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-container">
      <div className="create-event-page">
        <div className="page-header">
          <h1>Create New Event</h1>
          <p>Add a new event to the community calendar</p>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Event Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date & Time *</label>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date & Time *</label>
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="form-input"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Event Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="form-select"
              disabled={loading}
            >
              <option value="music">Music</option>
              <option value="performance">Performance</option>
              <option value="talk">Talk</option>
              <option value="exhibition">Exhibition</option>
              <option value="workshop">Workshop</option>
              <option value="social">Social</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Event Description</label>
            <textarea
              placeholder="Describe your event..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              rows="4"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="url"
              placeholder="Event Link (optional)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="form-input"
              disabled={loading}
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creating Event...
              </>
            ) : (
              "Create Event"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
