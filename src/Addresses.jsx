// src/Addresses.jsx
import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

const Addresses = () => {
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
            <FaMapMarkerAlt size={80} color="#0ff" style={{ marginBottom: "20px" }} />
            <h2 style={{ fontSize: "28px", marginBottom: "10px", color: "#0ff" }}>
                No Saved Addresses
            </h2>
            <p style={{ fontSize: "18px", color: "#aaa", maxWidth: "500px" }}>
                Add and manage your delivery addresses here for faster checkout.
            </p>
        </div>
    );
};

export default Addresses;
