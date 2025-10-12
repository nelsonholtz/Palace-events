import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showStaffCode, setShowStaffCode] = useState(false); // New state for staff code

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await registerUser(email, password);
      const user = userCredential.user;

      const isStaff = staffCode === "PALACE123";

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
        photoURL: photoURL || null,
      });

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

      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in instead.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address. Please check your email.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <form
        className={`auth-form ${loading ? "loading" : ""}`}
        onSubmit={handleSubmit}
      >
        <h2>Join Our Community</h2>
        <p>Create your Palace Events account</p>

        {error && <div className="error-message">{error}</div>}

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

        <div className="password-input-wrapper">
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

        <div className="password-input-wrapper">
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

        {/* Staff Code with Show/Hide Toggle */}
        <div className="password-input-wrapper">
          <input
            type={showStaffCode ? "text" : "password"}
            placeholder="Staff Code (optional)"
            value={staffCode}
            onChange={(e) => setStaffCode(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setShowStaffCode((prev) => !prev)}
            disabled={loading}
          >
            {showStaffCode ? "Hide" : "Show"}
          </button>
        </div>

        <div className="staff-code-hint">
          Enter "PALACE123" to become a staff member and create events
        </div>

        <input
          type="url"
          placeholder="Photo URL (optional)"
          value={photoURL}
          onChange={(e) => setPhotoURL(e.target.value)}
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
