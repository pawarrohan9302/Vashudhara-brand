// src/ForgotPassword.js (or .jsx)
import React, { useState } from "react";
import { auth } from "./firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(""); // For success messages
    const [error, setError] = useState("");     // For error messages
    const [loading, setLoading] = useState(false); // For loading state

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        setMessage(""); // Clear previous messages
        setLoading(true); // Set loading to true

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Password reset email sent! Check your inbox.");
            setEmail(""); // Clear email field after sending
        } catch (err) {
            console.error("Password reset error:", err); // Log the full error for debugging
            // Provide more specific error messages based on Firebase error codes
            switch (err.code) {
                case "auth/invalid-email":
                    setError("Please enter a valid email address.");
                    break;
                case "auth/user-not-found":
                    setError("No user found with that email address.");
                    break;
                default:
                    setError("Failed to send reset email: " + err.message);
                    break;
            }
        } finally {
            setLoading(false); // Always reset loading to false
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-400 to-red-500 px-4">
            <div className="max-w-md w-full bg-white rounded-lg p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Forgot Password
                </h2>

                {error && <p className="mb-4 text-red-600 text-center">{error}</p>}
                {message && <p className="mb-4 text-green-600 text-center">{message}</p>}

                <form onSubmit={handleResetPassword} className="space-y-5">
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading} // Disable button when loading
                        className={`w-full py-3 rounded-md font-semibold transition ${loading
                                ? "bg-gray-400 cursor-not-allowed" // Greyed out when loading
                                : "bg-orange-600 hover:bg-orange-700 text-white" // Normal styling
                            }`}
                    >
                        {loading ? "Sending..." : "Send Reset Email"}
                    </button>
                    <p className="text-center mt-3 text-gray-600">
                        <Link to="/login" className="text-orange-600 font-semibold hover:underline">
                            Back to Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;