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

    const from = location.state?.from?.pathname || "/"; // updated

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate(from); // redirect to original page
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    return (
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
                </h2>

                {error && (
                    <p style={{ color: "#ff4d4d", marginBottom: "15px", textAlign: "center" }}>
                        {error}
                    </p>
                )}

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
        </div>
    );
};

export default Login;
