import React from "react";
import { FaCreditCard } from "react-icons/fa"; // Only FaCreditCard is needed now

const SavedCards = () => (
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
        <FaCreditCard
            size={80}
            color="#0ff"
            style={{ marginBottom: "20px", textShadow: "0 0 10px rgba(0, 255, 255, 0.6)" }}
        />
        <h2
            style={{
                fontSize: "28px",
                marginBottom: "10px",
                color: "#0ff",
                textShadow: "0 0 8px #0ff, 0 0 15px #0ff",
            }}
        >
            No Saved Cards
        </h2>
        <p style={{ fontSize: "18px", color: "#aaa", maxWidth: "500px", lineHeight: "1.5" }}>
            Add your debit or credit cards here for faster and more convenient payments. Your card details will be securely saved.
        </p>
        {/* The "Add New Card" button has been removed from here */}
    </div>
);

export default SavedCards;