import { Routes, Route } from "react-router-dom";
import { useAuth } from "./contexts/authContext";
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Header from "./components/header/header";
import Home from "./components/home/home";
import CreateEventPage from "./pages/CreateEventPage";
import GenreDayPage from "./pages/GenreDayPage";
import ImportEventbritePage from "./pages/ImportEventbritePage";
import "./css/App.css";

function App() {
  const { currentUser } = useAuth();

  // {
  //   user && (
  //     <button onClick={() => navigate("/import-eventbrite")}>
  //       📥 Import from Eventbrite
  //     </button>
  //   );
  // }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-event" element={<CreateEventPage />} />
        <Route path="/day/:date/:genre" element={<GenreDayPage />} />
        <Route path="/import-eventbrite" element={<ImportEventbritePage />} />
      </Routes>
    </>
  );
}

export default App;
