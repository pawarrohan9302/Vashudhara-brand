// src/Login.js
import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase"; // Relative path

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Get the path the user was trying to access, default to '/'
    const from = location.state?.from?.pathname || "/";

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate(from, { replace: true }); // Redirect to original page
        } catch (err) {
            console.error("Login error:", err);
            switch (err.code) {
                case "auth/invalid-email":
                case "auth/user-disabled":
                case "auth/user-not-found":
                case "auth/wrong-password":
                    setError("Invalid email or password.");
                    break;
                default:
                    setError("Login failed: " + err.message);
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-500 px-4">
            <div className="max-w-md w-full bg-white rounded-lg p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Login to Your Account
                </h2>

                {error && <p className="mb-4 text-red-600 text-center">{error}</p>}

                <form onSubmit={handleLogin} className="space-y-5">
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-md font-semibold transition ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-teal-600 hover:bg-teal-700 text-white"
                            }`}
                    >
                        {loading ? "Logging In..." : "Login"}
                    </button>
                    <p className="text-center mt-3 text-gray-600">
                        <Link to="/forgot-password" className="text-teal-600 font-semibold hover:underline">
                            Forgot Password?
                        </Link>
                    </p>
                    <p className="text-center mt-3 text-gray-600">
                        Don’t have an account?{" "}
                        <Link to="/register" className="text-teal-600 font-semibold hover:underline">
                            Register here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;