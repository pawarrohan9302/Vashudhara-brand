// src/Dashboard.js
import React from "react";
import { useAuth } from "./AuthContext"; // Relative path
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase"; // Relative path

const Dashboard = () => {
    const { currentUser } = useAuth(); // Get current user from context
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login"); // Redirect to login after logout
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md w-full">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">
                    Welcome to Your Dashboard!
                </h2>
                {currentUser && (
                    <p className="text-lg text-gray-700 mb-6">
                        You are logged in as: <span className="font-semibold">{currentUser.email}</span>
                    </p>
                )}
                <button
                    onClick={handleLogout}
                    className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Dashboard;