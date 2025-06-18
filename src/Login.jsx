import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // updated
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation(); // updated
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

<<<<<<< HEAD
    const from = location.state?.from?.pathname || "/"; // updated

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate(from); // redirect to original page
        } catch (err) {
            setError("Invalid email or password");
=======
    const from = location.state?.from?.pathname || "/";

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate(from, { replace: true });
        } catch (err) {
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
>>>>>>> parent of 4056cb3 (Temporarily saving current work before revert operation)
        }
    };

    return (
<<<<<<< HEAD
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#000",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#fff",
                fontFamily: "'Poppins', sans-serif",
                padding: "20px",
            }}
        >
            <form
                onSubmit={handleLogin}
                style={{
                    backgroundColor: "#111",
                    padding: "40px",
                    borderRadius: "16px",
                    boxShadow: "0 0 20px #ffffff10",
                    width: "100%",
                    maxWidth: "400px",
                }}
            >
                <h2
                    style={{
                        marginBottom: "30px",
                        textAlign: "center",
                        color: "#fff",
                        textShadow: "0 0 8px #fff",
                    }}
                >
                    Login to Vashudhara
=======
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-10 sm:px-6 lg:px-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Login to Your Account
>>>>>>> parent of 4056cb3 (Temporarily saving current work before revert operation)
                </h2>

                {error && (
                    <p style={{ color: "#ff4d4d", marginBottom: "15px", textAlign: "center" }}>
                        {error}
                    </p>
                )}

<<<<<<< HEAD
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "16px",
                        borderRadius: "8px",
                        border: "1px solid #444",
                        backgroundColor: "#000",
                        color: "#fff",
                        boxShadow: "0 0 8px #fff1",
                        outline: "none",
                    }}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "20px",
                        borderRadius: "8px",
                        border: "1px solid #444",
                        backgroundColor: "#000",
                        color: "#fff",
                        boxShadow: "0 0 8px #fff1",
                        outline: "none",
                    }}
                />

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "30px",
                        backgroundColor: "#fff",
                        color: "#000",
                        fontWeight: "700",
                        border: "none",
                        boxShadow: "0 0 12px #fff",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ddd")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                >
                    Login
                </button>

                <p style={{ marginTop: "16px", textAlign: "center", fontSize: "14px", color: "#aaa" }}>
                    Don’t have an account?{" "}
                    <span
                        onClick={() => navigate("/register")}
                        style={{ color: "#fff", cursor: "pointer", textDecoration: "underline" }}
                    >
                        Register
                    </span>
                </p>
            </form>
=======
                <form onSubmit={handleLogin} className="space-y-5">
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-md font-semibold transition ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                            }`}
                    >
                        {loading ? "Logging In..." : "Login"}
                    </button>
                    <p className="text-center mt-3 text-gray-600 text-sm">
                        <Link to="/forgot-password" className="text-indigo-600 font-semibold hover:underline">
                            Forgot Password?
                        </Link>
                    </p>
                    <p className="text-center mt-3 text-gray-600 text-sm">
                        Don’t have an account?{" "}
                        <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
                            Register here
                        </Link>
                    </p>
                </form>
            </div>
>>>>>>> parent of 4056cb3 (Temporarily saving current work before revert operation)
        </div>
    );
};

export default Login;
