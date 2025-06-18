import React, { useEffect, useState } from "react";
import { auth, database } from "./firebase"; // Ensure firebase config and database are correctly imported
import { ref, onValue } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth"; // Import useAuthState for robust auth management

// --- Navigation Links Data ---
const navLinks = [
    { label: "Overview", path: "/overview" },
    { label: "Orders & Returns", path: "/orders" },
    { label: "Collections & Wishlist", path: "/collections" },
    { label: "Coupons", path: "/coupons" },
    { label: "Vashudhra Credit", path: "/vashudhra-credit" },
    { label: "MynCash", path: "/cash" },
    { label: "Profile Details", path: "/profile-details" },
    { label: "Saved Cards", path: "/saved-cards" },
    { label: "Saved UPI", path: "/saved-upi" },
    { label: "Wallets/BNPL", path: "/wallets" },
    { label: "Addresses", path: "/addresses" },
];

const Orders = () => {
    // --- State Variables ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true); // Manages loading state for orders data
    const [user, authLoading, authError] = useAuthState(auth); // Firebase auth state management

    // --- Hooks for Navigation and Location ---
    const navigate = useNavigate();
    const location = useLocation();

    // --- useEffect for Authentication and Data Fetching ---
    useEffect(() => {
        // Step 1: Handle Authentication State
        if (authLoading) {
            // Authentication state is still being determined (e.g., checking local storage for token)
            // Do nothing until auth state is resolved.
            return;
        }

        if (authError) {
            // An error occurred during authentication (e.g., network issues)
            console.error("Authentication error:", authError);
            setLoading(false); // Stop loading as we can't fetch data without auth
            // Optionally, display an error message to the user
            alert("Error checking user authentication. Please try again.");
            return;
        }

        if (!user) {
            // No user is logged in. Redirect to the login page.
            console.log("No user logged in. Redirecting to /login.");
            navigate("/login");
            setLoading(false); // No user, so no orders to load
            return;
        }

        // Step 2: User is logged in, now fetch their specific orders
        // Set loading to true as we are about to start fetching data
        setLoading(true);

        // Define the Firebase Realtime Database reference for the current user's orders.
        // This assumes your data structure is: /orders/{user.uid}/{order_id}
        const userOrdersRef = ref(database, `orders/${user.uid}`);

        // Set up a real-time listener for the user's orders.
        // onValue will trigger initially with the data, and then again whenever data changes.
        const unsubscribe = onValue(userOrdersRef, (snapshot) => {
            const data = snapshot.val(); // Get the data object from the snapshot
            const loadedOrders = [];

            if (data) {
                // If data exists, convert the Firebase object into an array of order objects.
                Object.keys(data).forEach((key) => {
                    loadedOrders.push({
                        id: key, // Use the Firebase generated key (e.g., "-Mxyz123") as the unique order ID
                        ...data[key], // Spread all other order details
                    });
                });
            }

            // Sort orders by date in descending order (newest orders first).
            // This ensures canceled orders also appear in their chronological place.
            loadedOrders.sort((a, b) => {
                const dateA = a.date ? new Date(a.date) : new Date(0); // Handle missing 'date' gracefully
                const dateB = b.date ? new Date(b.date) : new Date(0); // Handle missing 'date' gracefully
                return dateB.getTime() - dateA.getTime(); // Use getTime() for numeric comparison
            });

            setOrders(loadedOrders); // Update the state with the fetched and sorted orders
            setLoading(false); // Data has been successfully loaded
        }, (error) => {
            // Error callback for onValue: handles any errors during data fetching
            console.error("Error fetching user orders from Firebase:", error);
            setLoading(false); // Stop loading on error
            alert("Failed to load your orders. Please check your internet connection or try again.");
        });

        // Cleanup function for useEffect: This unsubscribes the Firebase listener
        // when the component unmounts or its dependencies change. This is crucial
        // to prevent memory leaks and unnecessary data fetches.
        return () => unsubscribe();
    }, [user, authLoading, authError, navigate]); // Dependencies: re-run effect if these values change

    // --- Event Handler for Logout ---
    const handleLogout = async () => {
        try {
            await auth.signOut(); // Sign out the user from Firebase
            navigate("/login"); // Redirect to the login page after logout
        } catch (error) {
            console.error("Error signing out:", error);
            alert("Failed to log out. Please try again."); // Inform the user about logout failure
        }
    };

    // --- Helper to determine active navigation link for styling ---
    const isActive = (path) => location.pathname === path;

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                backgroundColor: "#000",
                color: "#fff",
                fontFamily: "Poppins, sans-serif",
            }}
        >
            {/* --- Sidebar Navigation --- */}
            <aside
                style={{
                    width: "280px",
                    backgroundColor: "#111",
                    padding: "30px 20px",
                    borderRight: "1px solid #222",
                    zIndex: 2,
                    position: "relative",
                    flexShrink: 0, // Prevent sidebar from shrinking
                }}
            >
                {/* User Information Display (if user is logged in) */}
                {user && (
                    <div style={{ marginBottom: "30px", textAlign: "center" }}>
                        <img
                            src={user.photoURL || "https://i.imgur.com/6VBx3io.png"} // Fallback image if user has no photo
                            alt="Profile"
                            style={{
                                width: "70px",
                                height: "70px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                marginBottom: "10px",
                                border: "2px solid #0ff", // Add a subtle border
                            }}
                        />
                        <p style={{ fontSize: "14px", color: "#0ff" }}>{user.email}</p>
                    </div>
                )}

                <h3 style={{ fontSize: "20px", marginBottom: "30px", color: "#0ff" }}>
                    Account
                </h3>

                {/* Navigation Links Mapping */}
                <nav>
                    {navLinks.map(({ label, path }) => (
                        <p
                            key={path}
                            onClick={() => navigate(path)}
                            style={{
                                marginBottom: "14px",
                                cursor: "pointer",
                                color: isActive(path) ? "#0ff" : "#fff",
                                fontWeight: isActive(path) ? "600" : "400",
                                textDecoration: isActive(path) ? "underline" : "none",
                                userSelect: "none",
                                transition: "color 0.2s, font-weight 0.2s, text-decoration 0.2s" // Smooth transitions
                            }}
                        >
                            {label}
                        </p>
                    ))}

                    {/* Logout Link */}
                    <p
                        onClick={handleLogout}
                        style={{
                            marginTop: "40px",
                            cursor: "pointer",
                            color: "#ff5555",
                            fontWeight: "600",
                            userSelect: "none",
                            transition: "color 0.2s" // Smooth transition for logout
                        }}
                    >
                        Logout
                    </p>
                </nav>
            </aside>

            {/* --- Main Content Area for Orders --- */}
            <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
                <h2
                    style={{
                        fontSize: "28px",
                        marginBottom: "30px",
                        textShadow: "0 0 5px #0ff", // Neon glow effect for title
                    }}
                >
                    My Orders
                </h2>

                {/* Conditional Rendering: Loading, No Orders, or Display Orders */}
                {loading ? (
                    <p style={{ fontSize: "16px", color: "#aaa" }}>Loading your orders...</p>
                ) : orders.length > 0 ? (
                    <div style={{ display: "grid", gap: "20px" }}>
                        {orders.map((order) => (
                            <div
                                // Use order.id (Firebase key) for unique key. Fallback to order.orderId or Math.random().
                                key={order.id || order.orderId || Math.random()}
                                style={{
                                    backgroundColor: "#111",
                                    padding: "20px",
                                    borderRadius: "12px",
                                    boxShadow: "0 0 10px rgba(0, 255, 255, 0.2)", // Subtle glow effect
                                    border: "1px solid #0ff3", // Light border to match theme
                                }}
                            >
                                <h3 style={{ marginBottom: "10px", color: "#0ff" }}>
                                    Order #{order.orderId || order.id || 'N/A'} {/* Display unique order ID */}
                                </h3>
                                <p>Date: {order.date ? new Date(order.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "N/A"}</p>
                                <p>Total: ₹{order.total != null ? order.total.toFixed(2) : "N/A"}</p>

                                {/* Display Order Status with conditional styling */}
                                {order.status && (
                                    <p
                                        style={{
                                            marginTop: "15px",
                                            fontSize: "15px",
                                            fontWeight: "bold",
                                            // Dynamic color based on status for better visibility
                                            color: order.status.toLowerCase().includes('canceled') ? '#ff5555' :
                                                order.status.toLowerCase().includes('failed') ? '#ff5555' :
                                                    order.status.toLowerCase().includes('delivered') ? '#00ff00' :
                                                        '#0ff', // Default for other statuses
                                        }}
                                    >
                                        Status: {order.status}
                                    </p>
                                )}

                                <h4 style={{ marginTop: "15px", marginBottom: "8px", color: "#ccc" }}>Items:</h4>
                                <ul>
                                    {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                                        order.items.map((item, i) => (
                                            <li key={i} style={{ marginBottom: "5px", fontSize: "14px", listStyleType: "disc", marginLeft: "20px" }}>
                                                {item.name} x {item.quantity} (₹{item.price != null ? item.price.toFixed(2) : "N/A"} each)
                                            </li>
                                        ))
                                    ) : (
                                        <li style={{ fontSize: "14px", color: "#aaa" }}>No items found for this order.</li>
                                    )}
                                </ul>
                                {/* You can add more details like delivery address, tracking info etc. here */}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ fontSize: "16px", color: "#aaa" }}>You haven't placed any orders yet.</p>
                )}
            </main>
        </div>
    );
};

export default Orders;