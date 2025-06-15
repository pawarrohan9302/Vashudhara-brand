// src/SavedUPI.jsx
import React from "react";
import { FaQrcode } from "react-icons/fa";

const SavedUPI = () => {
    return (
        <div
            style={{
                backgroundColor: "#000",
                color: "#fff",
                fontFamily: "Poppins, sans-serif",
                minHeight: "100vh",
                padding: "40px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
            }}
        >
            <FaQrcode size={80} color="#0ff" style={{ marginBottom: "20px" }} />
            <h2 style={{ fontSize: "28px", marginBottom: "10px", color: "#0ff" }}>
                Save your UPI ID while doing a payment
            </h2>
            <p style={{ fontSize: "18px", color: "#aaa", maxWidth: "500px" }}>
                It's convenient to pay with saved UPI IDs.
            </p>
        </div>
    );
};

export default SavedUPI;
