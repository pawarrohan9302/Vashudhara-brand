import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";
import { FaEnvelope, FaRedo } from "react-icons/fa";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [linkSent, setLinkSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // Countdown logic
    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendTimer]);

    const sendResetLink = async () => {
        setError("");
        setMessage("");
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("✅ Reset link sent! Check your inbox or spam.");
            setLinkSent(true);
            setResendTimer(30); // Start 30s countdown
        } catch (err) {
            switch (err.code) {
                case "auth/invalid-email":
                    setError("❌ Invalid email address.");
                    break;
                case "auth/user-not-found":
                    setError("❌ No user found with this email.");
                    break;
                default:
                    setError("❌ " + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        if (!email) return setError("Please enter your email.");
        sendResetLink();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-400 to-red-500 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl">
                <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800">
                    Forgot Password
                </h2>

                {error && <p className="mb-4 text-red-600 text-center font-semibold">{error}</p>}
                {message && <p className="mb-4 text-green-600 text-center font-semibold">{message}</p>}

                <form onSubmit={handleResetPassword} className="space-y-5">
                    <div className="flex items-center border rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-orange-400">
                        <FaEnvelope className="text-orange-500 mr-3" />
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setLinkSent(false);
                                setResendTimer(0);
                            }}
                            className="w-full outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-md font-semibold transition text-white ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-orange-600 hover:bg-orange-700"
                            }`}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                    {linkSent && (
                        resendTimer > 0 ? (
                            <p className="text-center mt-2 text-gray-600">
                                ⏳ Resend available in <strong>{resendTimer}s</strong>
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={sendResetLink}
                                className="w-full py-2 mt-2 text-orange-600 flex items-center justify-center gap-2 hover:underline"
                            >
                                <FaRedo /> Resend Reset Link
                            </button>
                        )
                    )}

                    <p className="text-center mt-4 text-gray-600">
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
