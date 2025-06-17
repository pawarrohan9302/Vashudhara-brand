// src/Register.js
import React, { useState } from "react";
// import { auth } from "./firebase"; // We might not use this directly for initial creation with OTP
// import { createUserWithEmailAndPassword } from "firebase/auth"; // Might be called from a Cloud Function now
import { useNavigate, Link } from "react-router-dom";

// Assume you have a way to call Firebase Cloud Functions, e.g.,
// import { getFunctions, httpsCallable } from "firebase/functions";
// const functions = getFunctions();
// const requestOtpFunction = httpsCallable(functions, 'requestEmailOTP');
// const verifyOtpFunction = httpsCallable(functions, 'verifyEmailOTPAndRegister');

const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState(""); // New state for OTP
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Input Email/Pass, 2: Verify OTP
    // const [confirmationResult, setConfirmationResult] = useState(null); // For phone auth, not directly email OTP

    // --- Phase 1: Request OTP ---
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password !== confirmPassword) {
            return setError("Passwords do not match.");
        }
        if (password.length < 6) {
            return setError("Password should be at least 6 characters.");
        }

        setLoading(true);
        try {
            // Call a Firebase Cloud Function to send OTP to email
            // await requestOtpFunction({ email, password }); // Pass password to function if it creates user later
            // For now, let's simulate this, you'd replace it with actual function call
            console.log(`Simulating sending OTP to ${email}`);
            setMessage("An OTP has been sent to your email. Please check your inbox and spam folder.");
            setStep(2); // Move to OTP verification step

        } catch (err) {
            console.error("Request OTP error:", err);
            setError("Failed to send OTP. Please try again.");
            // Add specific error handling based on your cloud function's errors
        } finally {
            setLoading(false);
        }
    };

    // --- Phase 2: Verify OTP and Finalize Registration ---
    const handleVerifyOtpAndRegister = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!otp) {
            return setError("Please enter the OTP.");
        }

        setLoading(true);
        try {
            // Call a Firebase Cloud Function to verify OTP and then create the user
            // This function would receive email, password, and otp
            // It would verify OTP, and if valid, call admin.auth().createUser() and then admin.auth().updateUser() if needed
            // const result = await verifyOtpFunction({ email, password, otp });

            // For now, let's simulate success. In real app, this would be a backend call.
            console.log(`Simulating OTP verification for ${email} with OTP ${otp}`);
            // If verification successful:
            setMessage("OTP verified! Account registered successfully. Redirecting to login...");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setOtp("");
            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            console.error("OTP verification/registration error:", err);
            // More user-friendly error messages based on Cloud Function response
            setError(err.message || "Failed to verify OTP or register account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 px-4">
            <div className="max-w-md w-full bg-white rounded-lg p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Register Account
                </h2>

                {error && <p className="mb-4 text-red-600 text-center">{error}</p>}
                {message && <p className="mb-4 text-green-600 text-center">{message}</p>}

                {step === 1 && (
                    <form onSubmit={handleRequestOtp} className="space-y-5">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Create Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-md font-semibold transition ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                                }`}
                        >
                            {loading ? "Sending OTP..." : "Register & Send OTP"}
                        </button>
                        <p className="text-center mt-3 text-gray-600">
                            Already have an account?{" "}
                            <Link to="/login" className="text-purple-600 font-semibold hover:underline">
                                Login here
                            </Link>
                        </p>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtpAndRegister} className="space-y-5">
                        <p className="text-center text-gray-700">
                            An OTP has been sent to **{email}**. Please enter it below.
                        </p>
                        <input
                            type="text" // OTP is typically text/number
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-md font-semibold transition ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                                }`}
                        >
                            {loading ? "Verifying..." : "Verify OTP & Register"}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setStep(1); setError(""); setMessage(""); setLoading(false); }}
                            className="w-full py-3 mt-2 rounded-md font-semibold text-purple-600 border border-purple-600 hover:bg-purple-50 transition"
                        >
                            Go Back / Edit Details
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Register;