import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const isUserStaff = async (userId) => {
  try {
    console.log("🔍 Checking user role for:", userId);
    const userDoc = await getDoc(doc(db, "users", userId));
    console.log("📄 User document exists:", userDoc.exists());

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("👤 User data:", userData);
      console.log("🎯 User role:", userData.role);
      return userData.role === "staff";
    }

    console.log("❌ No user document found");
    return false;
  } catch (error) {
    console.error("❌ Error checking user role:", error);
    return false;
  }
};
