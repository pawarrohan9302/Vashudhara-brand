import React, { useState } from "react";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
    FaUser, FaBoxOpen, FaHeart, FaCreditCard, FaMoneyBill,
    FaMapMarkerAlt, FaTag, FaSignOutAlt, FaQrcode, FaEdit
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Overview = () => {
    const [user] = useAuthState(auth);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [editing, setEditing] = useState(false);
    const navigate = useNavigate();

    const sectionStyle = {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        borderRadius: "8px",
        color: "#fff",
        cursor: "pointer",
        gap: "12px",
        transition: "background-color 0.3s",
    };

    const cardStyle = {
        backgroundColor: "#111",
        padding: "20px",
        borderRadius: "15px",
        boxShadow: "0 0 15px #0ff3",
        maxWidth: "400px",
        marginBottom: "40px",
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const MenuItem = ({ icon, label, description, onClick }) => (
        <div
            style={sectionStyle}
            onClick={onClick}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0ff1")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
            <div style={{ color: "#0ff" }}>{icon}</div>
            <div>
                <div style={{ fontWeight: "600" }}>{label}</div>
                {description && (
                    <div style={{ fontSize: "13px", color: "#aaa" }}>{description}</div>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ backgroundColor: "#000", color: "#fff", padding: "40px", fontFamily: "Poppins" }}>
            <h2 style={{ fontSize: "26px", marginBottom: "20px", color: "#0ff" }}>Account Overview</h2>

            <div style={{ display: "flex", alignItems: "center", marginBottom: "30px" }}>
                {preview ? (
                    <img
                        src={preview}
                        alt="Profile Preview"
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            marginRight: 15,
                            objectFit: "cover",
                            border: "2px solid #0ff",
                        }}
                    />
                ) : (
                    <FaUser size={60} color="#0ff" style={{ marginRight: "15px" }} />
                )}
                <div>
                    <h3>{user?.displayName || "Customer"}</h3>
                    <p style={{ color: "#aaa" }}>{user?.email}</p>
                </div>
            </div>

            {/* Edit Profile Section */}
            <div style={{ ...sectionStyle, justifyContent: "space-between", marginBottom: "30px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <FaEdit style={{ marginRight: 10, color: "#0ff" }} />
                    <span>Edit Profile</span>
                </div>
                <button
                    onClick={() => setEditing(!editing)}
                    style={{
                        backgroundColor: "#0ff",
                        border: "none",
                        borderRadius: "5px",
                        padding: "6px 12px",
                        cursor: "pointer",
                        color: "#000",
                        fontWeight: "bold",
                    }}
                >
                    {editing ? "Cancel" : "Upload Image"}
                </button>
            </div>

            {editing && (
                <div style={{ marginBottom: 40 }}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{
                            padding: "8px",
                            borderRadius: "8px",
                            border: "1px solid #0ff",
                            backgroundColor: "#111",
                            color: "#fff",
                        }}
                    />
                </div>
            )}

            {/* Card with Menu */}
            <div style={cardStyle}>
                <MenuItem
                    icon={<FaBoxOpen />}
                    label="Orders"
                    description="Check your order status"
                    onClick={() => navigate("/customerorderview")}
                />
                <MenuItem
                    icon={<FaHeart />}
                    label="Collections & Wishlist"
                    description="Your saved favorites"
                    onClick={() => navigate("/collections")}
                />
                <MenuItem
                    icon={<FaCreditCard />}
                    label="Myntra Credit"
                    description="Refunds & gift cards"
                    onClick={() => navigate("/vashudhra-credit")}
                />
                <MenuItem
                    icon={<FaMoneyBill />}
                    label="MynCash"
                    description="Earn & use while shopping"
                    onClick={() => navigate("/wallets")}
                />
                <MenuItem
                    icon={<FaCreditCard />}
                    label="Saved Cards"
                    onClick={() => navigate("/saved-cards")}
                />
                <MenuItem
                    icon={<FaQrcode />}
                    label="Saved UPI"
                    onClick={() => navigate("/saved-upi")}
                />
                <MenuItem
                    icon={<FaMoneyBill />}
                    label="Wallets / BNPL"
                    onClick={() => navigate("/wallets")}
                />
                <MenuItem
                    icon={<FaMapMarkerAlt />}
                    label="Addresses"
                    onClick={() => navigate("/addresses")}
                />
                <MenuItem
                    icon={<FaTag />}
                    label="Coupons"
                    onClick={() => navigate("/coupons")}
                />
                <MenuItem
                    icon={<FaUser />}
                    label="Profile Details"
                    onClick={() => navigate("/profile-details")}
                />
            </div>

            {/* Logout */}
            <div
                style={{
                    ...sectionStyle,
                    maxWidth: "400px",
                    backgroundColor: "#111",
                    borderRadius: "15px",
                    boxShadow: "0 0 15px #f00",
                    marginTop: "20px",
                    color: "#f00",
                    fontWeight: "bold",
                    justifyContent: "center",
                }}
            >
                <FaSignOutAlt style={{ marginRight: 10 }} /> Logout
            </div>
        </div>
    );
};

export default Overview;
