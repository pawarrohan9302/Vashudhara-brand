import React, { useEffect, useState } from "react";
import { auth, database } from "./firebase"; // Ensure firebase config and database are correctly imported
import { ref, onValue } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth"; // Import useAuthState for robust auth management

// --- Navigation Links Data for Customer Dashboard (with conceptual icons) ---
const navLinks = [
    { label: "Overview", path: "/overview", icon: "📊" },
    { label: "My Orders", path: "/orders", icon: "📦" },
    { label: "Collections & Wishlist", path: "/collections", icon: "❤️" },
    { label: "My Coupons", path: "/coupons", icon: "💸" },
    { label: "Vashudhra Credit", path: "/vashudhra-credit", icon: "💳" },

    { label: "Profile Details", path: "/profile-details", icon: "👤" },
    { label: "Saved Cards", path: "/saved-cards", icon: "💳" },
    { label: "Saved UPI", path: "/saved-upi", icon: "📱" },
    { label: "Wallets/BNPL", path: "/wallets", icon: "👛" },
    { label: "My Addresses", path: "/addresses", icon: "🏠" },
];

const Orders = () => {
    // --- State Variables ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true); // Manages loading state for orders data
    const [authChecking, setAuthChecking] = useState(true); // New state to indicate initial auth check
    const [user, authLoading, authError] = useAuthState(auth); // Firebase auth state management

    // --- Hooks for Navigation and Location ---
    const navigate = useNavigate();
    const location = useLocation();

    // --- useEffect for Authentication and Data Fetching ---
    useEffect(() => {
        // This effect runs only once on component mount to check auth status
        if (!authLoading) {
            setAuthChecking(false); // Auth check is complete
            if (!user) {
                console.log("No user logged in. Redirecting to /login.");
                navigate("/login");
            }
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (authChecking || authLoading || !user) {
            // Don't try to fetch data if auth is still being checked, loading, or no user
            return;
        }

        setLoading(true); // Start loading orders
        const userOrdersRef = ref(database, `orders/${user.uid}`);

        const unsubscribe = onValue(
            userOrdersRef,
            (snapshot) => {
                const data = snapshot.val();
                const loadedOrders = [];

                if (data) {
                    Object.keys(data).forEach((key) => {
                        loadedOrders.push({
                            id: key,
                            ...data[key],
                        });
                    });
                }

                // Sort orders by date in descending order (newest first)
                loadedOrders.sort((a, b) => {
                    const dateA = a.date ? new Date(a.date) : new Date(0);
                    const dateB = b.date ? new Date(b.date) : new Date(0);
                    return dateB.getTime() - dateA.getTime();
                });

                setOrders(loadedOrders);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching user orders from Firebase:", error);
                setLoading(false);
                alert(
                    "Failed to load your orders. Please check your internet connection or try again."
                );
            }
        );

        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, [user, authChecking, authLoading]); // Depend on user and auth check status

    // --- Event Handler for Logout ---
    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate("/login");
        } catch (error) {
            console.error("Error signing out:", error);
            alert("Failed to log out. Please try again.");
        }
    };

    // --- Helper to determine active navigation link for styling ---
    const isActive = (path) => location.pathname === path;

    // --- Helper to get status badge styling & icon ---
    const getStatusInfo = (status) => {
        const lowerStatus = status ? status.toLowerCase() : "";
        if (lowerStatus.includes("canceled") || lowerStatus.includes("failed")) {
            return { color: "#FF5555", icon: "❌" }; // Red, Cross icon
        }
        if (lowerStatus.includes("delivered")) {
            return { color: "#28a745", icon: "✅" }; // Green, Checkmark icon
        }
        if (lowerStatus.includes("shipped") || lowerStatus.includes("dispatch")) {
            return { color: "#FFC107", icon: "🚚" }; // Yellow/Orange, Truck icon
        }
        if (lowerStatus.includes("processing") || lowerStatus.includes("pending")) {
            return { color: "#17A2B8", icon: "⏳" }; // Light Blue, Hourglass icon
        }
        return { color: "#6C757D", icon: "ℹ️" }; // Default (Grey), Info icon
    };

    // --- Conditional Render for Authentication State ---
    if (authChecking || authLoading) {
        return (
            <div style={styles.authStatusContainer}>
                <span style={styles.authStatusIcon}>🔒</span>
                <p style={styles.authStatusText}>Checking authentication status...</p>
            </div>
        );
    }

    if (authError) {
        return (
            <div style={styles.authStatusContainer}>
                <span style={styles.authStatusIcon}>⚠️</span>
                <p style={styles.authStatusText}>Error: {authError.message}</p>
                <button onClick={() => navigate("/login")} style={styles.retryButton}>
                    Login Again
                </button>
            </div>
        );
    }

    return (
        <div style={styles.dashboardContainer}>
            {/* --- Sidebar Navigation --- */}
            <aside style={styles.sidebar}>
                {/* User Information Display */}
                {user && (
                    <div style={styles.userInfo}>
                        <img
                            src={user.photoURL || "https://i.imgur.com/6VBx3io.png"}
                            alt="Profile"
                            style={styles.profileImage}
                        />
                        <p style={styles.userEmail}>{user.email}</p>
                    </div>
                )}

                <h3 style={styles.accountHeading}>My Account</h3>

                {/* Navigation Links Mapping */}
                <nav>
                    {navLinks.map(({ label, path, icon }) => (
                        <p
                            key={path}
                            onClick={() => navigate(path)}
                            style={{ ...styles.navLink, ...(isActive(path) && styles.navLinkActive) }}
                        >
                            <span style={styles.navLinkIcon}>{icon}</span> {label}
                        </p>
                    ))}

                    {/* Logout Link */}
                    <p onClick={handleLogout} style={styles.logoutLink}>
                        <span style={styles.navLinkIcon}>➡️</span> Logout
                    </p>
                </nav>
            </aside>

            {/* --- Main Content Area for Orders --- */}
            <main style={styles.mainContent}>
                <h2 style={styles.mainTitle}>My Orders</h2>

                {/* Conditional Rendering: Loading, No Orders, or Display Orders */}
                {loading ? (
                    <div style={styles.loadingState}>
                        <span style={styles.loadingIcon}>⏳</span>
                        <p style={styles.loadingText}>Loading your orders...</p>
                    </div>
                ) : orders.length > 0 ? (
                    <div style={styles.ordersGrid}>
                        {orders.map((order) => {
                            const statusInfo = getStatusInfo(order.status);
                            return (
                                <div
                                    key={order.id || order.orderId || Math.random()} // Fallback key
                                    style={styles.orderCard}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-5px)";
                                        e.currentTarget.style.boxShadow =
                                            "0 5px 20px rgba(0, 255, 255, 0.3)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow =
                                            "0 0 15px rgba(0, 255, 255, 0.15)";
                                    }}
                                    onClick={() => navigate(`/order-details/${order.id}`)} // Navigate to a detailed order page
                                >
                                    <div style={styles.orderHeader}>
                                        <h3 style={styles.orderId}>
                                            Order #{order.orderId || order.id || "N/A"}
                                        </h3>
                                        {order.status && (
                                            <span
                                                style={{
                                                    ...styles.orderStatusBadge,
                                                    backgroundColor: statusInfo.color,
                                                }}
                                            >
                                                <span style={styles.orderStatusIcon}>
                                                    {statusInfo.icon}
                                                </span>{" "}
                                                {order.status}
                                            </span>
                                        )}
                                    </div>

                                    <p style={styles.orderMeta}>
                                        <span style={styles.orderMetaLabel}>Order Date:</span>{" "}
                                        {order.date
                                            ? new Date(order.date).toLocaleDateString("en-IN", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            : "N/A"}
                                    </p>
                                    <p style={styles.orderMeta}>
                                        <span style={styles.orderMetaLabel}>Total Amount:</span>{" "}
                                        ₹{order.total != null ? order.total.toFixed(2) : "N/A"}
                                    </p>

                                    <h4 style={styles.productsHeading}>Products:</h4>
                                    <ul style={styles.productsList}>
                                        {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                                            order.items.map((item, i) => (
                                                <li key={i} style={styles.productItem}>
                                                    {item.imageUrl && (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name || item.title || "Product"}
                                                            style={styles.productImage}
                                                        />
                                                    )}
                                                    <div style={styles.productDetails}>
                                                        <p style={styles.productName}>
                                                            {item.name || item.title || "Product Name"}
                                                        </p>
                                                        <p style={styles.productQuantityPrice}>
                                                            Quantity: {item.quantity || 1} | Price: ₹
                                                            {item.price != null
                                                                ? item.price.toFixed(2)
                                                                : "N/A"}{" "}
                                                            each
                                                        </p>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <li style={styles.noProductsText}>
                                                No products found for this order.
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={styles.noOrdersState}>
                        <span style={styles.noOrdersIcon}>🛒</span>
                        <p style={styles.noOrdersText}>You haven't placed any orders yet.</p>
                        <button
                            onClick={() => navigate("/")} // Navigate to your main shop page
                            style={styles.shopNowButton}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#00e6e6";
                                e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 255, 255, 0.7)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#0ff";
                                e.currentTarget.style.boxShadow = "0 0 15px rgba(0, 255, 255, 0.5)";
                            }}
                        >
                            Start Shopping Now!
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Orders;

// --- Consolidated Styles for Readability ---
const styles = {
    dashboardContainer: {
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        fontFamily: "Poppins, sans-serif",
        gap: "20px",
    },
    sidebar: {
        width: "280px",
        backgroundColor: "#1a1a1a",
        padding: "30px 20px",
        borderRight: "1px solid #333",
        boxShadow: "2px 0 10px rgba(0, 0, 0, 0.5)",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
    },
    userInfo: {
        marginBottom: "30px",
        textAlign: "center",
        paddingBottom: "20px",
        borderBottom: "1px solid #333",
    },
    profileImage: {
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        objectFit: "cover",
        marginBottom: "12px",
        border: "3px solid #0ff",
        boxShadow: "0 0 15px rgba(0, 255, 255, 0.4)",
    },
    userEmail: {
        fontSize: "15px",
        color: "#0ff",
        fontWeight: "600",
        wordBreak: "break-word", // Prevents long emails from overflowing
    },
    accountHeading: {
        fontSize: "22px",
        marginBottom: "30px",
        color: "#0ff",
        textShadow: "0 0 5px #0ff",
    },
    navLink: {
        marginBottom: "15px",
        cursor: "pointer",
        color: "#fff",
        fontWeight: "400",
        textDecoration: "none", // Default to no underline
        userSelect: "none",
        transition: "all 0.2s ease-in-out",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 10px", // Added horizontal padding for better click area
        borderRadius: "5px",
    },
    navLinkActive: {
        color: "#0ff",
        fontWeight: "700",
        textDecoration: "underline", // Only underline active
        transform: "translateX(5px)",
        backgroundColor: "rgba(0, 255, 255, 0.1)", // Subtle background for active link
    },
    navLinkIcon: {
        fontSize: "1.2em",
    },
    logoutLink: {
        marginTop: "50px",
        cursor: "pointer",
        color: "#ff5555",
        fontWeight: "700",
        userSelect: "none",
        transition: "color 0.2s ease-in-out",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 10px",
        borderRadius: "5px",
    },
    mainContent: {
        flex: 1,
        padding: "40px",
        overflowY: "auto",
    },
    mainTitle: {
        fontSize: "32px",
        marginBottom: "35px",
        textShadow: "0 0 8px #0ff, 0 0 15px #0ff",
        color: "#0ff",
    },
    loadingState: {
        fontSize: "18px",
        color: "#aaa",
        textAlign: "center",
        padding: "50px 0",
    },
    loadingIcon: {
        marginRight: "10px",
        fontSize: "2em",
        display: "block",
        marginBottom: "10px",
    },
    loadingText: {
        fontSize: "1.2em",
    },
    ordersGrid: {
        display: "grid",
        gap: "25px",
    },
    orderCard: {
        backgroundColor: "#1a1a1a",
        padding: "25px",
        borderRadius: "15px",
        boxShadow: "0 0 15px rgba(0, 255, 255, 0.15)",
        border: "1px solid #0ff5",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        cursor: "pointer",
    },
    orderHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px",
        flexWrap: "wrap", // Allow wrapping on smaller screens
    },
    orderId: {
        color: "#0ff",
        fontSize: "1.4em",
        margin: 0,
    },
    orderStatusBadge: {
        padding: "8px 15px",
        borderRadius: "25px",
        fontSize: "0.95em", // Slightly smaller for badges
        fontWeight: "bold",
        color: "#000",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "5px", // For wrapping
    },
    orderStatusIcon: {
        fontSize: "1.1em",
    },
    orderMeta: {
        fontSize: "0.95em",
        color: "#ccc",
        marginBottom: "8px",
    },
    orderMetaLabel: {
        fontWeight: "600",
    },
    productsHeading: {
        color: "#ccc",
        marginBottom: "10px",
        borderBottom: "1px dashed #444",
        paddingBottom: "5px",
    },
    productsList: {
        listStyle: "none",
        padding: 0,
        margin: 0,
    },
    productItem: {
        marginBottom: "10px",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        padding: "8px 0",
        transition: "background-color 0.1s ease-in-out",
    },
    productImage: {
        width: "80px",
        height: "80px",
        objectFit: "cover",
        borderRadius: "10px",
        border: "1px solid #0ff5",
        boxShadow: "0 0 8px rgba(0, 255, 255, 0.2)",
    },
    productDetails: {
        flexGrow: 1,
    },
    productName: {
        fontWeight: "600",
        color: "#fff",
        fontSize: "1.1em",
        marginBottom: "5px",
    },
    productQuantityPrice: {
        color: "#aaa",
        fontSize: "0.9em",
    },
    noProductsText: {
        fontSize: "14px",
        color: "#aaa",
        listStyleType: "none",
    },
    noOrdersState: {
        textAlign: "center",
        padding: "50px",
    },
    noOrdersIcon: {
        fontSize: "3em", // Larger icon
        display: "block",
        marginBottom: "15px",
    },
    noOrdersText: {
        fontSize: "20px",
        color: "#aaa",
        marginBottom: "20px",
    },
    shopNowButton: {
        backgroundColor: "#0ff",
        color: "#000",
        border: "none",
        padding: "12px 25px",
        borderRadius: "8px",
        fontSize: "18px",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
        transition: "all 0.3s ease-in-out",
    },
    authStatusContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        fontFamily: "Poppins, sans-serif",
        fontSize: "20px",
    },
    authStatusIcon: {
        fontSize: "3em",
        marginBottom: "20px",
    },
    authStatusText: {
        marginBottom: "15px",
    },
    retryButton: {
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        padding: "10px 20px",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        marginTop: "10px",
    },
};