import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
} from "firebase/auth";
import { auth } from "./firebase";

export const registerUser = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);
export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);
export const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};
export const signOutUser = () => auth.signOut();
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);
export const changePassword = (password) =>
  updatePassword(auth.currentUser, password);
export const sendVerificationEmail = () =>
  sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/home`,
  });
