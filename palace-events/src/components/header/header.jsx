import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import "../../css/Header.css";

export default function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      // handle error silently
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Brand on the left */}
        <div className="brand" onClick={() => navigate("/")}>
          <div className="brand-text">
            <h1>Palace Events</h1>
            <span>Community Platform</span>
          </div>
        </div>

        {/* Navigation pushed to the right */}
        <nav className="nav">
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
  );
}
