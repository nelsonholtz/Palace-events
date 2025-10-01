import { useAuth } from "../../contexts/authContext";
import Calendar from "../../pages/Calendar"; // your Big Calendar component
import { Link } from "react-router-dom";

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="p-6">
      <Calendar />

      {currentUser ? (
        <div className="mt-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            + Add Event
          </button>
        </div>
      ) : (
        <div className="mt-4 text-gray-600">
          <p>
            <Link to="/login" className="text-blue-600 underline">
              Sign in
            </Link>{" "}
            to create your own events.
          </p>
        </div>
      )}
    </div>
  );
}
