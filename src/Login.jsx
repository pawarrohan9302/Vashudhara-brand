// src/Login.js
import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth"; // Import sendEmailVerification too
import { auth } from "./firebase"; // Ensure 'auth' is correctly exported from your Firebase config

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State for form inputs
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // State for UI feedback
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState(""); // Added for email verification reminder
    const [isLoading, setIsLoading] = useState(false);
    const [resendingVerification, setResendingVerification] = useState(false); // For resend button loading

    // Determine the redirect path after successful login.
    // Defaults to the homepage ('/') if no specific 'from' state is provided.
    const redirectTo = location.state?.from?.pathname || "/";

    /**
     * Handles the login form submission.
     * Prevents default form submission, initiates loading state,
     * attempts Firebase email/password authentication, and navigates on success.
     * Catches and displays relevant errors for the user.
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default browser reload on form submission
        setErrorMessage(""); // Clear any previous error messages
        setSuccessMessage(""); // Clear any previous success messages
        setIsLoading(true); // Indicate that the login process has started

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // *** IMPORTANT: Check if email is verified ***
            if (!user.emailVerified) {
                // If email is not verified, log out the user immediately
                // This prevents unverified users from accessing protected routes
                await auth.signOut();
                setErrorMessage(
                    "Your email address is not verified. Please check your inbox for a verification link."
                );
                // Optionally set a success message if you want to guide them to resend
                setSuccessMessage("You can also click 'Resend Verification Email' below if you haven't received it.");
                // We stay on the login page, but clear the password field for security
                setPassword("");
                return; // Stop the function here
            }

            // On successful authentication AND email verification, navigate to the intended page.
            // `replace: true` ensures the user can't go back to the login page using the browser's back button.
            navigate(redirectTo, { replace: true });

        } catch (error) {
            // Log the full error for debugging purposes (developer console)
            console.error("Firebase Login Error:", error.code, error.message);

            // Provide user-friendly error messages based on Firebase error codes
            let userFriendlyMessage = "An unexpected error occurred. Please try again.";
            switch (error.code) {
                case "auth/invalid-email":
                case "auth/user-not-found":
                case "auth/wrong-password":
                    userFriendlyMessage = "Invalid email or password. Please check your credentials.";
                    break;
                case "auth/user-disabled":
                    userFriendlyMessage = "Your account has been disabled. Please contact support.";
                    break;
                case "auth/too-many-requests":
                    userFriendlyMessage = "Too many failed login attempts. Please try again in a few minutes.";
                    break;
                case "auth/network-request-failed":
                    userFriendlyMessage = "Network error. Please check your internet connection.";
                    break;
                default:
                    userFriendlyMessage = "Login failed. Please ensure your details are correct.";
                    break;
            }
            setErrorMessage(userFriendlyMessage); // Set the error message to be displayed to the user
        } finally {
            setIsLoading(false); // Always reset loading state, regardless of success or failure
        }
    };

    /**
     * Handles resending the email verification link.
     * Assumes the user is already signed in (even if unverified) for this to work.
     * It's generally safer to guide the user to the Forgot Password flow or
     * back to Register if they are completely logged out.
     * This function would be called if they failed login due to unverified email.
     */
    const handleResendVerificationEmail = async () => {
        setErrorMessage("");
        setSuccessMessage("");
        setResendingVerification(true);
        try {
            // Get the current user from auth state
            const user = auth.currentUser;
            if (user) {
                await sendEmailVerification(user);
                setSuccessMessage("Verification email resent! Please check your inbox.");
            } else {
                setErrorMessage("No active user session. Please try logging in again.");
            }
        } catch (error) {
            console.error("Error resending verification email:", error);
            setErrorMessage("Failed to resend verification email. Please try again later.");
        } finally {
            setResendingVerification(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 sm:p-10 transform transition-all duration-300 ease-in-out hover:scale-[1.01] border border-gray-100">
                {/* Company Logo / Login Icon Container */}
                <div className="flex justify-center mb-8 h-32">
                    <img
                        className="w-auto h-full object-contain"
                        src="/Login vrctor proginal.png" // **IMPORTANT: Replace this with your actual image URL or path!**
                        alt="Company Logo"
                    />
                </div>

                {/* Page Title */}
                <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900">
                    Welcome Back!
                </h2>

                {/* Error Message Display */}
                {errorMessage && (
                    <p className="mb-6 text-red-600 text-center font-medium bg-red-50 p-3 rounded-md border border-red-200 animate-fade-in">
                        {errorMessage}
                    </p>
                )}
                {successMessage && (
                    <p className="mb-6 text-green-600 text-center font-medium bg-green-50 p-3 rounded-md border border-green-200 animate-fade-in">
                        {successMessage}
                    </p>
                )}


                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email-address" className="sr-only">Email address</label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out placeholder-gray-500 text-gray-800"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out placeholder-gray-500 text-gray-800"
                        />
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 rounded-lg font-bold text-lg transition duration-300 ease-in-out
                            ${isLoading
                                ? "bg-indigo-300 cursor-not-allowed text-indigo-800"
                                : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            }`}
                    >
                        {isLoading ? "Logging In..." : "Login Securely"}
                    </button>

                    {/* Resend Verification Email Button (appears if unverified) */}
                    {errorMessage.includes("Your email address is not verified") && (
                        <button
                            type="button"
                            onClick={handleResendVerificationEmail}
                            disabled={resendingVerification || isLoading}
                            className={`w-full py-3 mt-4 rounded-lg font-semibold text-sm transition duration-300 ease-in-out
                                ${resendingVerification || isLoading
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "text-indigo-600 border border-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                }`}
                        >
                            {resendingVerification ? "Resending..." : "Resend Verification Email"}
                        </button>
                    )}


                    {/* Forgot Password Link */}
                    <p className="text-center mt-4 text-gray-600 text-sm">
                        <Link
                            to="/forgot-password"
                            className="text-indigo-600 font-semibold hover:underline hover:text-indigo-700 transition duration-200 ease-in-out"
                        >
                            Forgot Password?
                        </Link>
                    </p>

                    {/* Register Link */}
                    <p className="text-center mt-3 text-gray-600 text-sm">
                        Don’t have an account?{" "}
                        <Link
                            to="/register"
                            className="text-indigo-600 font-semibold hover:underline hover:text-indigo-700 transition duration-200 ease-in-out"
                        >
                            Register here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;