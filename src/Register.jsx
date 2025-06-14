import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import {
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    updatePassword,
    createUserWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const actionCodeSettings = {
    url: window.location.origin + "/register", // Same page for handling link
    handleCodeInApp: true,
};

const Register = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    // On mount, check if this is email sign-in link
    useEffect(() => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let storedEmail = window.localStorage.getItem("emailForRegistration");

            if (!storedEmail) {
                storedEmail = window.prompt("Please provide your email for confirmation");
            }

            setIsVerifying(true);
            signInWithEmailLink(auth, storedEmail, window.location.href)
                .then((result) => {
                    window.localStorage.removeItem("emailForRegistration");
                    setMessage("Email verified! Now set your password.");
                    setIsVerifying(false);
                    setEmail(storedEmail);
                })
                .catch((err) => {
                    setError("Invalid or expired link. Please register again.");
                    setIsVerifying(false);
                });
        }
    }, []);

    const handleSendLink = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password should be at least 6 characters.");
            return;
        }

        try {
            // Store email locally to confirm on link click
            window.localStorage.setItem("emailForRegistration", email);

            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            setMessage(
                `Verification link sent to ${email}. Please check your inbox and click the link to verify your email.`
            );
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(err.message);
        }
    };

    // After email verified, user sets password
    const handleSetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password should be at least 6 characters.");
            return;
        }

        try {
            // Update password for current user
            if (auth.currentUser) {
                await updatePassword(auth.currentUser, password);
                setMessage("Password set successfully! You can now login.");
                // Optionally logout user after setting password
                await signOut(auth);
                navigate("/login");
            } else {
                setError("User not signed in properly.");
            }
        } catch (err) {
            setError(err.message);
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

                {/* Show email input and send link if not verified yet */}
                {!auth.currentUser && !isVerifying && (
                    <form onSubmit={handleSendLink} className="space-y-5">
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
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold transition"
                        >
                            Send Verification Link
                        </button>
                        <p className="text-center mt-3 text-gray-600">
                            Already registered?{" "}
                            <Link to="/login" className="text-purple-600 font-semibold hover:underline">
                                Login here
                            </Link>
                        </p>
                    </form>
                )}

                {/* If email verified, show password set form */}
                {auth.currentUser && (
                    <form onSubmit={handleSetPassword} className="space-y-5 mt-6">
                        <p className="text-center text-gray-700 mb-4">
                            Set your password for the account {email}
                        </p>
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
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold transition"
                        >
                            Set Password
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Register;
