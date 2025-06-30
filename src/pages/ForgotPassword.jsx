// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { AiOutlineMail } from "react-icons/ai";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError(err.message);
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <AiOutlineMail className="text-4xl text-red-500 mb-2" />
          <h2 className="text-2xl font-bold text-white mb-1">Reset Password</h2>
          <p className="text-gray-400 text-sm text-center">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>
        {message && (
          <div className="mb-4 text-green-400 bg-green-900/30 rounded px-4 py-2 text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 text-red-400 bg-red-900/30 rounded px-4 py-2 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Remember your password?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-red-400 hover:underline font-semibold"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
