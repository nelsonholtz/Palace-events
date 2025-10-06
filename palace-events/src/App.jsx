import { Routes, Route } from "react-router-dom";
import { useAuth } from "./contexts/authContext";
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Header from "./components/header/header";
import Home from "./components/home/home";
import CreateEventPage from "./pages/CreateEventPage";
import GenreDayPage from "./pages/GenreDayPage";
import ImportTicketmasterPage from "./pages/ImportTicketmasterPage";

import "./css/App.css";

function App() {
  const { currentUser } = useAuth();

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-event" element={<CreateEventPage />} />
        <Route path="/day/:date/:genre" element={<GenreDayPage />} />
        <Route
          path="/import-ticketmaster"
          element={<ImportTicketmasterPage />}
        />
      </Routes>
    </>
  );
}

export default App;
