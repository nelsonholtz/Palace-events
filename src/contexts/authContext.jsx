// src/contexts/authContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase/firebase"; // adjust path if needed
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            const mergedUser = {
              ...user,

              role: userData.role,
              displayName: userData.displayName || user.displayName,
              photoURL: userData.photoURL || user.photoURL,

              ...userData,
            };
            setCurrentUser(mergedUser);
          } else {
            console.warn("No user document found in Firestore for:", user.uid);
            setCurrentUser(user);
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);

          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
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
