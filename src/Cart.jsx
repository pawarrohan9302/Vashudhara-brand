import React, { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { database } from "./firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Cart = () => {
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);

    const auth = getAuth();

    useEffect(() => {
        onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u);
                const ordersRef = ref(database, "orders");
                get(ordersRef)
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            const allOrders = Object.values(snapshot.val());
                            const userOrders = allOrders.filter((order) => order.userId === u.uid);
                            setOrders(userOrders);
                        } else setOrders([]);
                    })
                    .catch(console.error);
            } else {
                setUser(null);
                setOrders([]);
            }
        });
    }, [auth]);

    if (!user) return <p>Please login to see your orders.</p>;

    return (
        <div style={{ padding: 40, backgroundColor: "#f1f5f9", minHeight: "100vh" }}>
            <h1>Your Orders</h1>
            {orders.length === 0 ? (
                <p>No orders yet.</p>
            ) : (
                orders.map((order, idx) => (
                    <div
                        key={idx}
                        style={{
                            backgroundColor: "#fff",
                            marginBottom: 20,
                            padding: 15,
                            borderRadius: 10,
                            boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                            display: "flex",
                            alignItems: "center",
                            gap: 20,
                        }}
                    >
                        <img
                            src={order.productImage}
                            alt={order.productTitle}
                            style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }}
                        />
                        <div>
                            <h3 style={{ marginBottom: 8 }}>{order.productTitle}</h3>
                            <p>Brand: {order.brand}</p>
                            <p>Price: ₹{order.price}</p>
                            <p>Size: <strong>{order.selectedSize}</strong></p>
                            <p>
                                Customer: {order.customer.name} | Mobile: {order.customer.mobile}
                            </p>
                            <p>Address: {order.customer.address}</p>
                            <p>Ordered on: {new Date(order.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Cart;
