import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";

export default function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // call Firebase signOut
      navigate("/"); // redirect to homepage after logout
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="p-4 bg-gray-800 text-white flex justify-between">
      <Link to="/" className="text-xl font-bold">
        Palace Events
      </Link>
      <nav>
        {currentUser ? (
          <button
            onClick={handleLogout}
            className="ml-4 bg-red-500 px-3 py-1 rounded"
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="ml-4">
              Login
            </Link>
            <Link to="/register" className="ml-4">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
