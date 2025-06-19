// src/Register.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "./firebase"; // Import auth from your firebase.js
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

const Register = () => {
    const navigate = useNavigate();

    // State for form inputs
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // OTP state is no longer strictly needed for this Firebase method,
    // but we can keep it if you plan to integrate phone number OTP later.
    // For now, it will be removed as Email/Password auth doesn't use it directly in this flow.
    // const [otp, setOtp] = useState("");

    // State for UI feedback
    const [step, setStep] = useState(1); // 1: Registration Form, 2: Email Verification Info
    const [formError, setFormError] = useState(""); // General error message for the form
    const [formMessage, setFormMessage] = useState(""); // Success/info message for the form
    const [isLoading, setIsLoading] = useState(false); // For showing loading state on buttons

    // No need for OTP specific refs/timers with this Firebase flow unless
    // you want to simulate a "resend verification email" timer.
    // const otpInputRef = useRef(null);
    // const [resendTimer, setResendTimer] = useState(60);
    // const [canResendOtp, setCanResendOtp] = useState(false);

    // If you want to add a resend email verification timer, you'd re-introduce
    // useEffect for timer and corresponding state variables.
    // For simplicity, I'm omitting it initially, but you can add it back if desired.

    /**
     * Handles the user registration with Firebase Email/Password.
     * Sends an email verification link upon successful creation.
     */
    const handleRegisterUser = async (e) => {
        e.preventDefault();
        setFormError("");
        setFormMessage("");
        setIsLoading(true);

        if (password !== confirmPassword) {
            setIsLoading(false);
            return setFormError("Passwords do not match. Please ensure both fields are identical.");
        }
        if (password.length < 8) {
            setIsLoading(false);
            return setFormError("Password must be at least 8 characters long.");
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setIsLoading(false);
            return setFormError("Please enter a valid email address.");
        }

        try {
            // 1. Create User with Email and Password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Send Email Verification
            await sendEmailVerification(user);

            setFormMessage(
                `Registration successful! A verification email has been sent to ${email}. ` +
                `Please verify your email address to log in.`
            );
            setStep(2); // Move to a step indicating email verification is pending

            // Optionally, you might clear inputs after successful registration
            // setEmail("");
            // setPassword("");
            // setConfirmPassword("");

        } catch (error) {
            console.error("Firebase Registration Error:", error);
            let errorMessage = "Failed to register account. Please try again.";
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "This email address is already in use. Please try logging in or use a different email.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "The email address is not valid.";
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = "Email/Password sign-in is not enabled. Please contact support.";
                    break;
                case 'auth/weak-password':
                    errorMessage = "The password is too weak. Please choose a stronger password.";
                    break;
                default:
                    errorMessage = error.message || "An unexpected error occurred during registration.";
            }
            setFormError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // No handleVerifyOtpAndRegister needed for this Firebase Email/Password flow
    // If you plan to implement phone OTP or a custom email OTP flow with Firebase
    // functions, then you would re-introduce that logic.

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8 font-inter">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 sm:p-10 transform transition-all duration-300 ease-in-out hover:scale-[1.01] border border-gray-100">
                <div className="flex justify-center mb-8 h-32">
                    <img
                        className="w-auto h-full object-contain"
                        src="/Login vector.png"
                        alt="Registration Icon"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x150/E9D5FF/8B5CF6?text=Register" }}
                    />
                </div>

                <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900">
                    {step === 1 ? "Create Your Account" : "Verify Your Email"}
                </h2>

                {formError && (
                    <p className="mb-6 text-red-600 text-center font-medium bg-red-50 p-3 rounded-md border border-red-200 animate-fade-in">
                        {formError}
                    </p>
                )}
                {formMessage && (
                    <p className="mb-6 text-green-600 text-center font-medium bg-green-50 p-3 rounded-md border border-green-200 animate-fade-in">
                        {formMessage}
                    </p>
                )}

                {/* Step 1: Registration Form */}
                {step === 1 && (
                    <form onSubmit={handleRegisterUser} className="space-y-6 animate-fade-in">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 ease-in-out placeholder-gray-500 text-gray-800"
                                autoComplete="email"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Create Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Create a strong password (min 8 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 ease-in-out placeholder-gray-500 text-gray-800"
                                autoComplete="new-password"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 ease-in-out placeholder-gray-500 text-gray-800"
                                autoComplete="new-password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 rounded-lg font-bold text-lg transition duration-300 ease-in-out
                                ${isLoading
                                    ? "bg-purple-300 cursor-not-allowed text-purple-800"
                                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                }`}
                        >
                            {isLoading ? "Registering..." : "Register"}
                        </button>
                        <p className="text-center mt-4 text-gray-600 text-sm">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-purple-600 font-semibold hover:underline hover:text-purple-700 transition duration-200 ease-in-out"
                            >
                                Login here
                            </Link>
                        </p>
                    </form>
                )}

                {/* Step 2: Email Verification Info */}
                {step === 2 && (
                    <div className="space-y-6 animate-fade-in text-center">
                        <p className="text-gray-700 text-md">
                            Thank you for registering!
                        </p>
                        <p className="text-gray-700 text-md">
                            A verification link has been sent to <strong className="text-purple-600">{email}</strong>.
                            Please click the link in your email to verify your account and then you can log in.
                        </p>
                        <p className="text-gray-600 text-sm mt-4">
                            Didn't receive the email? Check your spam folder or try again.
                        </p>
                        {/* You could add a "Resend Verification Email" button here
                            along with a timer, similar to your previous OTP logic. */}
                        <Link
                            to="/login"
                            className="w-full py-3 mt-6 inline-block rounded-lg font-bold text-lg text-white
                            bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700
                            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
                            transition duration-300 ease-in-out"
                        >
                            Go to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;