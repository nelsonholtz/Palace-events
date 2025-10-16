import React, { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebase";
import "../css/AuthForm.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Password reset email sent! Check your inbox.");
      setEmail("");
    } catch (error) {
      console.error("Password reset error:", error);
      if (error.code === "auth/user-not-found") {
        setError("❌ No account found with this email address.");
      } else if (error.code === "auth/invalid-email") {
        setError("❌ Please enter a valid email address.");
      } else {
        setError("❌ Failed to send reset email. Please try again.");
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
        <h2>Reset Your Password</h2>
        <p>Enter your email and we'll send you a reset link</p>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <div className="auth-switch">
          <Link to="/login">← Back to Login</Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
