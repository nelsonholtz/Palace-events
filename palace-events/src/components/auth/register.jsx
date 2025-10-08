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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await registerUser(email, password);
      const user = userCredential.user;

      // SUPER SIMPLE STAFF CHECK
      const isStaff = staffCode === "PALACE123"; // Your easy-to-remember code

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
        photoURL: photoURL || null,
      });

      // Store user with role
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: `${firstName} ${lastName}`,
        email: user.email,
        photoURL: photoURL || null,
        role: isStaff ? "staff" : "community",
        createdAt: new Date(),
      });

      setCurrentUser(user);

      if (isStaff) {
        alert("🎉 Welcome staff member! You can now create events.");
      } else {
        alert("🎉 Welcome to the community! You can RSVP to events.");
      }

      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
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
      />

      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      <div style={{ position: "relative" }}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <button
          type="button"
          className="toggle-btn"
          onClick={() => setShowPassword((prev) => !prev)}
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
        />
        <button
          type="button"
          className="toggle-btn"
          onClick={() => setShowConfirmPassword((prev) => !prev)}
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
      />

      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
