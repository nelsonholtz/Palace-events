import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import { useState } from "react";
import "../../css/Header.css";

export default function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {}
  };

  const handleCreateEventClick = () => {
    setShowCreateModal(true);
  };

  const handleLocalEvent = () => {
    setShowCreateModal(false);
    navigate("/create-event");
  };

  const handleTicketmasterEvent = () => {
    setShowCreateModal(false);
    navigate("/import-ticketmaster");
  };

  const closeModal = () => {
    setShowCreateModal(false);
  };

  const isStaff =
    currentUser &&
    (currentUser.role === "staff" || currentUser.role === "admin");

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="brand" onClick={() => navigate("/")}>
            <div className="brand-text">
              <h1>Palace Events</h1>
              <span>Community Platform</span>
            </div>
          </div>

          <nav className="nav">
            {isStaff && (
              <button
                onClick={handleCreateEventClick}
                className="create-event-btn"
              >
                + Create Event
              </button>
            )}

            {currentUser ? (
              <div className="user-nav">
                <button
                  onClick={() => navigate("/profile")}
                  className="profile-btn"
                >
                  My Profile
                </button>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-nav">
                <Link to="/login" className="login-btn">
                  Login
                </Link>
                <Link to="/register" className="register-btn">
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {showCreateModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <p>How you'd like to create an event:</p>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-actions">
                <button
                  onClick={handleLocalEvent}
                  className="modal-btn local-event-btn"
                >
                  Create Local Event
                </button>
                <button
                  onClick={handleTicketmasterEvent}
                  className="modal-btn ticketmaster-btn"
                >
                  Import Ticketmaster Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
