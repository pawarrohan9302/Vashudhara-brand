import React, { useState } from "react";
import { auth } from "./firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email);
            alert("Password reset email sent!");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
            <h2>Forgot Password</h2>
            <form onSubmit={handleReset}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: "100%", padding: 10, marginBottom: 10 }}
                />
                <button type="submit" style={{ width: "100%", padding: 10 }}>
                    Send Reset Email
                </button>
            </form>
            <p>
                <Link to="/login">Back to Login</Link>
            </p>
        </div>
    );
};

export default ForgotPassword;
