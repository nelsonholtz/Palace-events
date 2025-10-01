import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9vPZJR_YCmtb-w3ynqcuR58UUjggkFKI",
  authDomain: "palace-community-events.firebaseapp.com",
  projectId: "palace-community-events",
  storageBucket: "palace-community-events.appspot.com", // fixed
  messagingSenderId: "66073630797",
  appId: "1:66073630797:web:e7b959864c10b9e1a2a404",
  measurementId: "G-RCTPQD83FK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { app, auth, db, provider, analytics };
