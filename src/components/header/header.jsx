import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import { useState, useEffect } from "react";
import "../../css/Header.css";

export default function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      setShowMobileMenu(false);
    } catch (err) {}
  };

  const handleCreateEventClick = () => {
    setShowCreateModal(true);
    setShowMobileMenu(false);
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

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setShowMobileMenu(false);
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

          {/* Desktop Navigation */}
          <nav className={`nav ${isMobile ? "mobile-nav" : ""}`}>
            {!isMobile && (
              <>
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
              </>
            )}

            {/* Mobile Hamburger Menu */}
            {isMobile && (
              <div className="mobile-menu-container">
                <button
                  className="hamburger-btn"
                  onClick={toggleMobileMenu}
                  aria-label="Toggle menu"
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </button>

                {/* Mobile Dropdown Menu */}
                {showMobileMenu && (
                  <div className="mobile-dropdown">
                    {isStaff && (
                      <button
                        onClick={handleCreateEventClick}
                        className="mobile-menu-btn create-event-mobile"
                      >
                        + Create Event
                      </button>
                    )}

                    {currentUser ? (
                      <>
                        <button
                          onClick={() => handleNavigation("/profile")}
                          className="mobile-menu-btn profile-mobile"
                        >
                          My Profile
                        </button>
                        <button
                          onClick={handleLogout}
                          className="mobile-menu-btn logout-mobile"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="mobile-menu-btn login-mobile"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          className="mobile-menu-btn register-mobile"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
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
