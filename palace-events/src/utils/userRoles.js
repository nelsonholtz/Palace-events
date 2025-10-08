import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

// Simple function to check if user is staff
export const isUserStaff = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().role === "staff";
    }
    return false; // Default to community member
  } catch (error) {
    console.error("Error checking user role:", error);
    return false; // If anything fails, they're not staff
  }
};
