import React from "react";
// You might use an icon library like react-icons, for example:
// import { RiCoupon3Line } from "react-icons/ri";

const Coupons = () => (
    <div
        style={{
            backgroundColor: "#1a1a1a",
            color: "#f0f0f0",
            padding: "50px",
            fontFamily: "Poppins, sans-serif",
            borderRadius: "12px", // More rounded
            textAlign: "center",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)", // Stronger shadow
            maxWidth: "550px",
            margin: "50px auto",
            border: "1px solid #333", // Subtle border
        }}
    >
        {/* If using react-icons, you'd render <RiCoupon3Line size={60} style={{ marginBottom: "20px" }} /> */}
        <div style={{ fontSize: "60px", marginBottom: "20px" }}>🎫</div>{" "}
        {/* Placeholder for an icon */}
        <h2 style={{ fontSize: "2.8em", marginBottom: "15px", fontWeight: "600" }}>
            My Coupons
        </h2>
        <p style={{ fontSize: "1.3em", opacity: "0.8", lineHeight: "1.6" }}>
            Looks like you don't have any active coupons right now.
            <br />
            Explore our latest deals and promotions to find some!
        </p>
        <button
            style={{
                marginTop: "30px",
                padding: "12px 25px",
                fontSize: "1.1em",
                backgroundColor: "#007bff", // A common button color
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
            onClick={() => console.log("Navigate to deals page")} // Example action
        >
            Browse Deals
        </button>
    </div>
);

export default Coupons;