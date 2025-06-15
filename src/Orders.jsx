// src/Orders.jsx
import React, { useEffect, useState } from "react";
import { auth, database } from "./firebase";
import { ref, onValue } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";

const navLinks = [
    { label: "Overview", path: "/overview" },
    { label: "Orders & Returns", path: "/orders" },
    { label: "Collections & Wishlist", path: "/collections" },
    { label: "Coupons", path: "/coupons" },
    { label: "Vashudhra Credit", path: "/vashudhra-credit" },  // updated label and path
    { label: "MynCash", path: "/cash" },
    { label: "Profile Details", path: "/profile-details" },
    { label: "Saved Cards", path: "/saved-cards" },
    { label: "Saved UPI", path: "/saved-upi" },
    { label: "Wallets/BNPL", path: "/wallets" },
    { label: "Addresses", path: "/addresses" },
];

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userOrdersRef = ref(database, `orders/${currentUser.uid}`);
                onValue(userOrdersRef, (snapshot) => {
                    const data = snapshot.val();
                    setOrders(data ? Object.values(data) : []);
                });
            } else {
                navigate("/login");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = () => {
        auth.signOut();
        navigate("/login");
    };

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
            {/* Sidebar */}
            <aside
                style={{
                    width: "280px",
                    backgroundColor: "#111",
                    padding: "30px 20px",
                    borderRight: "1px solid #222",
                    zIndex: 2,
                    position: "relative",
                }}
            >
                {/* User Info */}
                {user && (
                    <div style={{ marginBottom: "30px", textAlign: "center" }}>
                        <img
                            src={user.photoURL || "https://i.imgur.com/6VBx3io.png"}
                            alt="Profile"
                            style={{
                                width: "70px",
                                height: "70px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                marginBottom: "10px",
                            }}
                        />
                        <p style={{ fontSize: "14px", color: "#0ff" }}>{user.email}</p>
                    </div>
                )}

                <h3 style={{ fontSize: "20px", marginBottom: "30px", color: "#0ff" }}>
                    Account
                </h3>

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
                            }}
                        >
                            {label}
                        </p>
                    ))}

                    <p
                        onClick={handleLogout}
                        style={{
                            marginTop: "40px",
                            cursor: "pointer",
                            color: "#ff5555",
                            fontWeight: "600",
                            userSelect: "none",
                        }}
                    >
                        Logout
                    </p>
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: "40px" }}>
                <h2
                    style={{
                        fontSize: "28px",
                        marginBottom: "30px",
                        textShadow: "0 0 5px #0ff",
                    }}
                >
                    My Orders
                </h2>

                {orders.length > 0 ? (
                    <div style={{ display: "grid", gap: "20px" }}>
                        {orders.map((order, index) => (
                            <div
                                key={index}
                                style={{
                                    backgroundColor: "#111",
                                    padding: "20px",
                                    borderRadius: "12px",
                                    boxShadow: "0 0 10px #fff2",
                                }}
                            >
                                <h3 style={{ marginBottom: "10px", color: "#0ff" }}>
                                    Order #{order.orderId || index + 1}
                                </h3>
                                <p>Date: {order.date ? new Date(order.date).toLocaleDateString() : "N/A"}</p>
                                <p>Total: ₹{order.total || "N/A"}</p>
                                <h4 style={{ marginTop: "10px", color: "#ccc" }}>Items:</h4>
                                <ul>
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map((item, i) => (
                                            <li key={i}>
                                                {item.name} x {item.quantity}
                                            </li>
                                        ))
                                    ) : (
                                        <li>No items found.</li>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ fontSize: "16px", color: "#aaa" }}>No past orders found.</p>
                )}
            </main>
        </div>
    );
};

export default Orders;
