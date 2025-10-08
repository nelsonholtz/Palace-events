import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import { registerUser } from "../../firebase/auth";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import "../../css/AuthForm.css";

const Register = () => {
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [staffCode, setStaffCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("=== REGISTRATION START ===");
    console.log("Staff code entered:", staffCode);
    console.log("Staff code check:", staffCode === "PALACE123");

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      console.log("1. Creating Firebase auth user...");
      const userCredential = await registerUser(email, password);
      const user = userCredential.user;
      console.log("2. Auth user created:", user.uid);

      // SUPER SIMPLE STAFF CHECK
      const isStaff = staffCode === "PALACE123";
      console.log("3. Staff status:", isStaff);

      console.log("4. Updating profile...");
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
        photoURL: photoURL || null,
      });

      console.log("5. Storing user in Firestore...");
      const userData = {
        uid: user.uid,
        displayName: `${firstName} ${lastName}`,
        email: user.email,
        photoURL: photoURL || null,
        role: isStaff ? "staff" : "community",
        createdAt: new Date(),
      };

      console.log("6. User data to store:", userData);

      await setDoc(doc(db, "users", user.uid), userData);
      console.log("7. Firestore document created successfully");

      setCurrentUser(user);

      if (isStaff) {
        alert("🎉 Welcome staff member! You can now create events.");
      } else {
        alert("🎉 Welcome to the community! You can RSVP to events.");
      }

      console.log("8. Navigation to home...");
      navigate("/");
    } catch (error) {
      console.error("❌ REGISTRATION ERROR:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      // Better error messages
      if (error.code === "auth/email-already-in-use") {
        alert("❌ This email is already registered. Please log in instead.");
        navigate("/login");
      } else if (error.code === "auth/weak-password") {
        alert("❌ Password is too weak. Please use at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        alert("❌ Invalid email address. Please check your email.");
      } else {
        alert(`❌ Registration failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
        disabled={loading}
      />

      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
        disabled={loading}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
        disabled={loading}
      />

      <div style={{ position: "relative" }}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          disabled={loading}
        />
        <button
          type="button"
          className="toggle-btn"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={loading}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <div style={{ position: "relative" }}>
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
          disabled={loading}
        />
        <button
          type="button"
          className="toggle-btn"
          onClick={() => setShowConfirmPassword((prev) => !prev)}
          disabled={loading}
        >
          {showConfirmPassword ? "Hide" : "Show"}
        </button>
      </div>

      {/* Simple Staff Code Field */}
      <input
        type="password"
        placeholder="Staff Code (optional)"
        value={staffCode}
        onChange={(e) => setStaffCode(e.target.value)}
        disabled={loading}
      />
      <small
        style={{
          color: "#666",
          fontSize: "12px",
          marginTop: "-10px",
          marginBottom: "10px",
          display: "block",
        }}
      >
        Enter "PALACE123" to become a staff member and create events
      </small>

      <input
        type="url"
        placeholder="Photo URL (optional)"
        value={photoURL}
        onChange={(e) => setPhotoURL(e.target.value)}
        disabled={loading}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Creating Account..." : "Register"}
      </button>
    </form>
  );
};

export default Register;
