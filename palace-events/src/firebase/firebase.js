import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9vPZJR_YCmtb-w3ynqcuR58UUjggkFKI",
  authDomain: "palace-community-events.firebaseapp.com",
  projectId: "palace-community-events",
  storageBucket: "palace-community-events.appspot.com",
  messagingSenderId: "66073630797",
  appId: "1:66073630797:web:e7b959864c10b9e1a2a404",
  measurementId: "G-RCTPQD83FK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

// Configure the Google Auth Provider
provider.setCustomParameters({
  prompt: "select_account",
});

// Debug: Log Firestore configuration
console.log("🔥 Firestore initialized for project:", firebaseConfig.projectId);
console.log("🔗 Firestore instance:", db);

// Optional: If you're using emulators during development
// if (window.location.hostname === 'localhost') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   console.log("🔧 Connected to Firestore Emulator");
// }

export { app };
