import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/authContext"; // make sure path is correct
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Header from "./components/header/header";
import Home from "./components/home/home";
import "./App.css";

// PrivateRoute wrapper for authenticated pages
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <p>Loading...</p>; // optional loader

  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
