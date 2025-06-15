// src/Wallets.jsx
import React from "react";
import { FaWallet } from "react-icons/fa";

const Wallets = () => {
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
            <FaWallet size={80} color="#0ff" style={{ marginBottom: "20px" }} />
            <h2 style={{ fontSize: "28px", marginBottom: "10px", color: "#0ff" }}>
                No Saved Wallets/BNPL
            </h2>
            <p style={{ fontSize: "18px", color: "#aaa", maxWidth: "500px" }}>
                Link your Wallets/BNPL while doing a payment. <br />
                It's convenient to pay with Linked Wallets/BNPL.
            </p>
        </div>
    );
};

export default Wallets;
