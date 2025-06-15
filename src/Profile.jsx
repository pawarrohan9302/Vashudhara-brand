import React from "react";
import { auth } from "./firebase";

const Profile = () => {
    const user = auth.currentUser;

    return (
        <div style={{ backgroundColor: "#000", color: "#fff", padding: "40px", fontFamily: "Poppins" }}>
            <h2 style={{ marginBottom: "20px" }}>Profile Overview</h2>
            {user ? (
                <div>
                    <p><strong>Name:</strong> {user.displayName || "N/A"}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>UID:</strong> {user.uid}</p>
                </div>
            ) : (
                <p>You are not logged in.</p>
            )}
        </div>
    );
};

export default Profile;
