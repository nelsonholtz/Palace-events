import { Routes, Route } from "react-router-dom";
import { useAuth } from "./contexts/authContext";
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Header from "./components/header/header";
import Home from "./components/home/home";
import "./App.css";

function App() {
  const { currentUser } = useAuth();

  return (
    <>
      <Header />
      <Routes>
        {/* Home page is public now */}
        <Route path="/" element={<Home />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
