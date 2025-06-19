import React, { useEffect, useState } from "react";
// Import auth and storage from your firebase config
import { auth, storage } from "./firebase"; // Ensure correct import from your firebase.js
import { useAuthState } from "react-firebase-hooks/auth";
import { updateProfile } from "firebase/auth"; // Import updateProfile from firebase/auth
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import storage functions

import {
    FaUser, FaBoxOpen, FaHeart, FaCreditCard, FaMoneyBill,
    FaMapMarkerAlt, FaTag, FaSignOutAlt, FaQrcode, FaEdit
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify'; // Import for toast notifications
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

// Define route constants for better maintainability
const ROUTES = {
    LOGIN: "/login",
    ORDERS: "/orders",
    COLLECTIONS: "/collections",
    VASHUDHRA_CREDIT: "/vashudhra-credit",
    MYNCASH: "/cash",
    COUPONS: "/coupons",
    SAVED_CARDS: "/saved-cards",
    SAVED_UPI: "/saved-upi",
    WALLETS: "/wallets",
    ADDRESSES: "/addresses",
    PROFILE_DETAILS: "/profile-details",
};

const Overview = () => {
    // --- State Variables ---
    const [user, authLoading, authError] = useAuthState(auth); // Firebase auth state, loading, and error
    const [image, setImage] = useState(null); // Holds the File object of the selected image
    const [preview, setPreview] = useState(null); // Holds the URL for image preview (local or Firebase)
    const [editing, setEditing] = useState(false); // Controls visibility of the image upload section
    const [uploading, setUploading] = useState(false); // Indicates if an upload is in progress
    const [inputKey, setInputKey] = useState(Date.now()); // Key to force re-render/reset of file input
    const navigate = useNavigate();

    // --- Authentication Guard and Initial Profile Image Load ---
    useEffect(() => {
        // If authentication state is still loading, do nothing
        if (authLoading) {
            return;
        }

        // If there's an authentication error, log it and alert the user
        if (authError) {
            console.error("Authentication error:", authError);
            toast.error("Error checking your login status. Please try again.");
            return;
        }

        // If no user is logged in, redirect to the login page
        if (!user) {
            console.log("No user logged in. Redirecting to /login.");
            navigate(ROUTES.LOGIN);
            return;
        }

        // When user data is available, set the initial profile picture preview
        // This ensures the image persists across sessions and loads correctly
        if (user && user.photoURL && !preview) {
            setPreview(user.photoURL);
        }

    }, [user, authLoading, authError, navigate, preview]); // Dependencies for useEffect

    // --- Inline Styles for Reusability ---
    // Moved these out of the component to prevent re-creation on every render
    const sectionStyle = {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        borderRadius: "8px",
        color: "#000",
        cursor: "pointer",
        gap: "12px",
        transition: "background-color 0.3s",
    };

    const cardStyle = {
        backgroundColor: "#f5f5f5",
        padding: "20px",
        borderRadius: "15px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        maxWidth: "400px",
        marginBottom: "40px",
    };

    const buttonStyle = {
        border: "none",
        borderRadius: "5px",
        padding: "6px 12px",
        cursor: "pointer",
        color: "#fff",
        fontWeight: "bold",
        transition: "background-color 0.2s, box-shadow 0.2s",
    };

    // --- Event Handlers ---

    // Handles file selection for image input
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file); // Store the actual file object
            setPreview(URL.createObjectURL(file)); // Create a local URL for instant visual preview
        } else {
            // If the user clears the selection, revert to the existing profile photo or default
            setImage(null);
            setPreview(user?.photoURL || "https://i.imgur.com/6VBx3io.png"); // Fallback to default if no user photo
        }
    };

    // Handles the actual image upload to Firebase Storage and updating user profile
    const handleUploadImage = async () => {
        if (!image) {
            toast.warn("Please select an image first!");
            return;
        }
        if (!user) {
            toast.error("You must be logged in to upload an image.");
            return;
        }

        setUploading(true); // Set uploading state to true to disable button and show feedback
        try {
            // 1. Create a reference to the storage location
            const imageRef = ref(storage, `profile_images/${user.uid}/profile.jpg`);

            // 2. Upload the image file to Firebase Storage
            const snapshot = await uploadBytes(imageRef, image);
            console.log('Uploaded image!', snapshot);

            // 3. Get the public download URL of the uploaded image
            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('File available at', downloadURL);

            // 4. Update the user's Firebase Authentication profile with the new photoURL
            await updateProfile(user, { photoURL: downloadURL });

            // Update local state to reflect the new profile picture permanently
            setPreview(downloadURL); // Update preview to the permanent URL
            setImage(null); // Clear the selected file from state
            setEditing(false); // Exit editing mode
            setInputKey(Date.now()); // Reset input file visual
            toast.success("Profile image updated successfully!");

        } catch (error) {
            console.error("Error uploading image or updating profile:", error);
            toast.error("Failed to upload image: " + error.message);
        } finally {
            setUploading(false); // Reset uploading state
        }
    };

    // Handles user logout using Firebase Authentication
    const handleLogout = async () => {
        try {
            await auth.signOut(); // Sign out from Firebase
            toast.info("Logged out successfully!");
            navigate(ROUTES.LOGIN); // Redirect to login page after successful logout
        } catch (error) {
            console.error("Error signing out:", error);
            toast.error("Failed to log out. Please try again.");
        }
    };

    // --- Reusable MenuItem Component ---
    // Props: icon (React element), label (string), description (string, optional), onClick (function)
    const MenuItem = ({ icon, label, description, onClick }) => (
        <div
            style={sectionStyle}
            onClick={onClick}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8e8e8")} // Subtle hover background
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
            <div style={{ color: "#007bff" }}>{icon}</div> {/* Blue icon for better contrast on white */}
            <div>
                <div style={{ fontWeight: "600" }}>{label}</div>
                {description && (
                    <div style={{ fontSize: "13px", color: "#666" }}>{description}</div> // Darker grey for description
                )}
            </div>
        </div>
    );

    // --- Conditional Rendering for Loading/Authentication ---
    // Show a loading message while auth state is being determined
    if (authLoading) {
        return (
            <div style={{ backgroundColor: "#fff", color: "#000", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" }}>
                <span style={{ marginRight: "10px" }}>⏳</span> Loading user data...
            </div>
        );
    }

    // If no user is logged in (after authLoading is false), this check triggers redirection
    if (!user) {
        // Redirection is handled by useEffect, but this can be a temporary display
        return (
            <div style={{ backgroundColor: "#fff", color: "#000", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" }}>
                Redirecting to login...
            </div>
        );
    }

    // --- Main Component Render ---
    return (
        <div style={{ backgroundColor: "#fff", color: "#000", padding: "40px", fontFamily: "Poppins" }}>
            <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <h2 style={{ fontSize: "26px", marginBottom: "20px", color: "#007bff", textShadow: "0 0 5px rgba(0, 123, 255, 0.2)" }}>Account Overview</h2>

            {/* User Profile Section with Current Image/Default */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "30px" }}>
                <img
                    // The 'preview' state holds the local URL (if selected) or the permanent user.photoURL
                    // If neither, it falls back to the default placeholder image.
                    src={preview || user.photoURL || "https://i.imgur.com/6VBx3io.png"}
                    alt="Profile"
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        marginRight: 15,
                        objectFit: "cover",
                        border: "2px solid #007bff", // Blue border for profile pic
                        boxShadow: "0 0 8px rgba(0, 123, 255, 0.2)", // Subtle glow
                    }}
                />
                <div>
                    <h3>{user?.displayName || "Customer"}</h3>
                    <p style={{ color: "#666" }}>{user?.email}</p>
                </div>
            </div>

            {/* Edit Profile Image Section (Toggleable) */}
            <div style={{ ...sectionStyle, justifyContent: "space-between", marginBottom: "30px", backgroundColor: "#f5f5f5", borderRadius: "15px", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <FaEdit style={{ marginRight: 10, color: "#007bff" }} />
                    <span>Edit Profile Image</span>
                </div>
                <button
                    onClick={() => {
                        setEditing(!editing); // Toggle editing mode
                        // If cancelling edit, clear the selected image and revert preview
                        if (editing) {
                            setImage(null);
                            setPreview(user?.photoURL || "https://i.imgur.com/6VBx3io.png");
                            setInputKey(Date.now()); // Reset input file visual
                        }
                    }}
                    style={{
                        ...buttonStyle,
                        backgroundColor: "#007bff", // Blue button
                        boxShadow: "0 0 8px rgba(0, 123, 255, 0.4)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0056b3'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                    {editing ? "Cancel" : "Change Image"}
                </button>
            </div>

            {/* Image Upload Input and Upload Button (Visible when editing) */}
            {editing && (
                <div style={{ marginBottom: 40, display: "flex", gap: "10px", alignItems: "center", maxWidth: "400px" }}>
                    <input
                        key={inputKey} // Use key to force input reset
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{
                            flexGrow: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #007bff", // Blue border for input
                            backgroundColor: "#fff", // White input background
                            color: "#000", // Black text for input
                            cursor: "pointer",
                        }}
                    />
                    <button
                        onClick={handleUploadImage}
                        disabled={uploading || !image} // Disable if uploading or no image selected
                        style={{
                            ...buttonStyle,
                            backgroundColor: uploading || !image ? "#ccc" : "#28a745", // Green for upload, grey when disabled
                            cursor: uploading || !image ? "not-allowed" : "pointer",
                            boxShadow: uploading || !image ? "none" : "0 0 8px rgba(40, 167, 69, 0.4)",
                        }}
                        onMouseEnter={e => !uploading && !image && (e.currentTarget.style.backgroundColor = '#218838')}
                        onMouseLeave={e => !uploading && !image && (e.currentTarget.style.backgroundColor = '#28a745')}
                    >
                        {uploading ? "Uploading..." : "Upload"}
                    </button>
                </div>
            )}

            {/* Card with Main Account Menu Items */}
            <div style={cardStyle}>
                <MenuItem
                    icon={<FaBoxOpen size={20} />}
                    label="Orders"
                    description="Check your order status and history"
                    onClick={() => navigate(ROUTES.ORDERS)}
                />
                <MenuItem
                    icon={<FaHeart size={20} />}
                    label="Collections & Wishlist"
                    description="Your saved favorites and curated lists"
                    onClick={() => navigate(ROUTES.COLLECTIONS)}
                />
                <MenuItem
                    icon={<FaCreditCard size={20} />}
                    label="Vashudhra Credit"
                    description="View refunds & gift cards"
                    onClick={() => navigate(ROUTES.VASHUDHRA_CREDIT)}
                />
                <MenuItem
                    icon={<FaMoneyBill size={20} />}
                    label="MynCash"
                    description="Earn & use while shopping"
                    onClick={() => navigate(ROUTES.MYNCASH)}
                />
                <MenuItem
                    icon={<FaTag size={20} />}
                    label="My Coupons"
                    description="Your available discounts and offers"
                    onClick={() => navigate(ROUTES.COUPONS)}
                />
            </div>

            {/* Card with Payment & Address Details */}
            <div style={cardStyle}>
                <MenuItem
                    icon={<FaCreditCard size={20} />}
                    label="Saved Cards"
                    description="Manage your credit and debit cards"
                    onClick={() => navigate(ROUTES.SAVED_CARDS)}
                />
                <MenuItem
                    icon={<FaQrcode size={20} />}
                    label="Saved UPI"
                    description="Manage your UPI IDs"
                    onClick={() => navigate(ROUTES.SAVED_UPI)}
                />
                <MenuItem
                    icon={<FaMoneyBill size={20} />}
                    label="Wallets / BNPL"
                    description="Connect your digital wallets or Buy Now Pay Later options"
                    onClick={() => navigate(ROUTES.WALLETS)}
                />
                <MenuItem
                    icon={<FaMapMarkerAlt size={20} />}
                    label="My Addresses"
                    description="Add or edit your delivery addresses"
                    onClick={() => navigate(ROUTES.ADDRESSES)}
                />
                <MenuItem
                    icon={<FaUser size={20} />}
                    label="Profile Details"
                    description="Manage your personal information"
                    onClick={() => navigate(ROUTES.PROFILE_DETAILS)}
                />
            </div>

            {/* Logout Section */}
            <div
                onClick={handleLogout} // Attached the actual logout handler
                style={{
                    ...sectionStyle,
                    maxWidth: "400px",
                    backgroundColor: "#f5f5f5", // Light grey background for logout section
                    borderRadius: "15px",
                    boxShadow: "0 0 10px rgba(255, 0, 0, 0.1)", // Subtle red shadow
                    marginTop: "20px",
                    color: "#dc3545", // Red color for logout text
                    fontWeight: "bold",
                    justifyContent: "center",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ffebeb")} // Lighter red on hover
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
            >
                <FaSignOutAlt style={{ marginRight: 10, color: '#dc3545' }} size={20} /> Logout
            </div>
        </div>
    );
};

export default Overview;