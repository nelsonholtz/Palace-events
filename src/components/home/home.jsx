import { useAuth } from "../../contexts/authContext";
import Calendar from "../../pages/Calendar"; // your Big Calendar component
import { Link } from "react-router-dom";

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="p-6">
      <Calendar />
    </div>
  );
}
