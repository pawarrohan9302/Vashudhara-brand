import React, { useEffect, useState } from "react";
import { database, auth } from "./firebase";
import { ref, onValue } from "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";

const statusStages = ["Ordered", "Packed", "Shipped", "Delivered"];

const CustomerOrderView = () => {
    const [user] = useAuthState(auth);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (user) {
            const ordersRef = ref(database, `orders/${user.uid}`);
            onValue(ordersRef, (snapshot) => {
                const data = snapshot.val();
                setOrders(data ? Object.values(data) : []);
            });
        }
    }, [user]);

    return (
        <div style={{
            backgroundColor: "#000",
            color: "#fff",
            padding: "40px 20px",
            fontFamily: "Poppins",
            minHeight: "100vh"
        }}>
            <h2 style={{ fontSize: "26px", marginBottom: "30px", color: "#0ff" }}>
                Live Order Tracking
            </h2>

            {orders.length > 0 ? (
                orders.map((order, index) => (
                    <div
                        key={index}
                        style={{
                            backgroundColor: "#111",
                            padding: "20px",
                            borderRadius: "12px",
                            boxShadow: "0 0 10px #0ff5",
                            marginBottom: "30px"
                        }}
                    >
                        <h3 style={{ color: "#0ff" }}>
                            Order #{order.orderId || index + 1}
                        </h3>
                        <p>Date: {order.date ? new Date(order.date).toLocaleDateString() : "N/A"}</p>
                        <p>Total: ₹{order.total || "N/A"}</p>
                        <p>Status: <strong style={{ color: "#0f0" }}>{order.status || "Pending"}</strong></p>

                        {/* Status Tracker */}
                        <div style={{ marginTop: "15px" }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                {statusStages.map((stage, i) => {
                                    const currentIndex = statusStages.indexOf(order.status);
                                    return (
                                        <div
                                            key={stage}
                                            style={{
                                                padding: "8px 14px",
                                                borderRadius: "20px",
                                                backgroundColor:
                                                    currentIndex >= i ? "#0f08" : "#333",
                                                color: currentIndex >= i ? "#0f0" : "#999",
                                                fontWeight: currentIndex === i ? "bold" : "normal",
                                                border:
                                                    currentIndex === i ? "2px solid #0ff" : "1px solid #444"
                                            }}
                                        >
                                            {stage}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Item List */}
                        <div style={{ marginTop: "15px" }}>
                            <h4 style={{ color: "#ccc" }}>Items:</h4>
                            <ul style={{ paddingLeft: "20px", color: "#eee" }}>
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item, i) => (
                                        <li key={i}>
                                            {item.name} × {item.quantity}
                                        </li>
                                    ))
                                ) : (
                                    <li>No items listed.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                ))
            ) : (
                <p style={{ fontSize: "16px", color: "#aaa" }}>
                    No orders found.
                </p>
            )}
        </div>
    );
};

export default CustomerOrderView;
