// src/Register.js
import React, { useState } from "react";
import { auth } from "./firebase"; // Relative path
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleRegister = async (e) => {
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
            await createUserWithEmailAndPassword(auth, email, password);
            setMessage("Registration successful! You can now log in.");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setTimeout(() => {
                navigate("/login");
            }, 2000); // Redirect to login after 2 seconds
        } catch (err) {
            console.error("Registration error:", err);
            // More user-friendly error messages based on Firebase error codes
            switch (err.code) {
                case "auth/email-already-in-use":
                    setError("This email is already registered.");
                    break;
                case "auth/invalid-email":
                    setError("Invalid email address.");
                    break;
                case "auth/weak-password":
                    setError("Password is too weak. Please choose a stronger one.");
                    break;
                default:
                    setError("Failed to register: " + err.message);
                    break;
            }
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

                <form onSubmit={handleRegister} className="space-y-5">
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
                        {loading ? "Registering..." : "Register"}
                    </button>
                    <p className="text-center mt-3 text-gray-600">
                        Already have an account?{" "}
                        <Link to="/login" className="text-purple-600 font-semibold hover:underline">
                            Login here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;