// src/contexts/authContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase/firebase"; // adjust path if needed
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext();

// Hook for components to access auth
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null); // optional, usually handled by onAuthStateChanged
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loading,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
