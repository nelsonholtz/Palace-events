import React from "react";
import { db } from "../firebase/firebase";
import { deleteDoc, doc, getDoc } from "firebase/firestore";

export default function GenreCard({ genre, events, user, onEventDeleted }) {
  const handleDelete = async (event) => {
    const firestoreId = event.id; // This is the actual Firestore document ID

    console.log("=== 🗑️ DELETE ATTEMPT ===");
    console.log("Firestore Document ID:", firestoreId);
    console.log("Event title:", event.title);
    console.log("Current user UID:", user?.uid);
    console.log("Event user ID:", event.userId);
    console.log("User matches event owner?", user?.uid === event.userId);

    if (!window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      console.log("Delete cancelled by user");
      return;
    }

    try {
      // Step 1: Create the document reference using the Firestore ID
      const eventRef = doc(db, "events", firestoreId);
      console.log("1. Document path:", eventRef.path);

      // Step 2: Verify the document exists before deleting
      console.log("2. Checking if document exists before delete...");
      const beforeDelete = await getDoc(eventRef);
      if (!beforeDelete.exists()) {
        console.log(
          "❌ Event doesn't exist in Firestore with ID:",
          firestoreId
        );
        console.log("Available data:", beforeDelete);
        alert(`Event not found with ID: ${firestoreId}`);
        return;
      }

      console.log("✅ Event exists, data before delete:", beforeDelete.data());

      // Step 3: Perform the delete
      console.log("3. Attempting delete operation...");
      await deleteDoc(eventRef);
      console.log("4. Delete command completed without error");

      // Step 4: Verify the document is gone
      console.log("5. Verifying deletion...");
      setTimeout(async () => {
        const afterDelete = await getDoc(eventRef);
        if (afterDelete.exists()) {
          console.log("❌ EVENT STILL EXISTS AFTER DELETE!");
          console.log("Current data:", afterDelete.data());
          alert(
            "Delete failed - event still exists. Check console for details."
          );
        } else {
          console.log("✅ EVENT SUCCESSFULLY DELETED!");
          // Refresh the UI
          if (onEventDeleted) {
            onEventDeleted();
          }
        }
      }, 1500);
    } catch (error) {
      console.error("❌ Delete error:", {
        message: error.message,
        code: error.code,
        fullError: error,
      });
      alert(`Delete failed: ${error.message}`);
    }
  };

  // Force delete as backup
  const forceDelete = async (event) => {
    const firestoreId = event.id;

    console.log("💥 FORCE DELETE ATTEMPT:", firestoreId);
    console.log("Event title:", event.title);

    if (!window.confirm(`FORCE DELETE: "${event.title}"?`)) return;

    try {
      const eventRef = doc(db, "events", firestoreId);

      console.log("Method 1: Direct delete");
      await deleteDoc(eventRef);

      console.log("✅ Force delete completed");

      // Wait and refresh
      setTimeout(() => {
        if (onEventDeleted) {
          onEventDeleted();
        }
      }, 2000);
    } catch (error) {
      console.error("❌ Force delete failed:", error);
      alert("Force delete also failed: " + error.message);
    }
  };

  return (
    <div
      className="genre-card"
      style={{
        marginBottom: "24px",
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2
        style={{
          marginBottom: "16px",
          color: "#333",
          borderBottom: "2px solid #eee",
          paddingBottom: "8px",
        }}
      >
        {genre === "ticketmaster" ? "🎟️ Ticketmaster Events" : genre}
      </h2>

      <div className="events-list">
        {events.map((event) => (
          <div
            key={event.id}
            className="event-item"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginBottom: "8px",
              background: "#fff",
            }}
          >
            <div className="event-content" style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 8px 0" }}>{event.title}</h3>
              <p style={{ margin: "4px 0" }}>
                📅 {event.start.toLocaleDateString()}
                {event.end &&
                  event.end.toDateString() !== event.start.toDateString() &&
                  ` - ${event.end.toLocaleDateString()}`}
              </p>
              <p style={{ margin: "4px 0" }}>
                📍 {event.location || "No location specified"}
              </p>
              {event.description && (
                <p style={{ margin: "4px 0" }}>{event.description}</p>
              )}
              {event.link && (
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", margin: "4px 0" }}
                >
                  🔗 More Info
                </a>
              )}

              {/* Debug info for each event */}
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "8px",
                  padding: "5px",
                  background: "#f9f9f9",
                  borderRadius: "3px",
                }}
              >
                <strong>Debug:</strong> Firestore ID: {event.id} | Event UserId:{" "}
                {event.userId} | Your UID: {user?.uid} | Can Delete:{" "}
                {event.userId === user?.uid ? "✅ YES" : "❌ NO"}
              </div>
            </div>

            {/* Show delete button for events owned by current user */}
            {event.userId === user?.uid && user && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginLeft: "12px",
                }}
              >
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(event)}
                  style={{
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  🗑️ Delete
                </button>

                <button
                  className="force-delete-btn"
                  onClick={() => forceDelete(event)}
                  style={{
                    background: "#ff6b35",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "10px",
                  }}
                >
                  💥 Force Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
