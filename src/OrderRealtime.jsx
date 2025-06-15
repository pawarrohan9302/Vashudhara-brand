import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue } from "firebase/database";

const OrderRealtime = ({ customerId }) => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const ordersRef = ref(database, "orders");
        onValue(ordersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const orderArray = Object.entries(data)
                    .map(([id, value]) => ({
                        id,
                        ...value,
                    }))
                    .filter(order => order.customerId === customerId);
                setOrders(orderArray.reverse());
            } else {
                setOrders([]);
            }
        });
    }, [customerId]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-indigo-700 mb-6">🛒 My Orders</h2>
            {orders.length === 0 ? (
                <p className="text-gray-500">No orders found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orders.map(order => (
                        <div
                            key={order.id}
                            className="bg-white border border-gray-300 shadow rounded-lg p-5 hover:shadow-lg transition"
                        >
                            <div className="flex flex-col md:flex-row gap-4">
                                <img
                                    src={order.image}
                                    alt={order.productTitle}
                                    className="w-full md:w-40 h-40 object-contain border rounded"
                                />
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold">{order.productTitle}</h3>
                                    <p className="text-gray-600">Brand: {order.brand}</p>
                                    <p className="text-gray-700 font-semibold">₹ {order.amount}</p>
                                    <p className="text-sm text-gray-600">Size: {order.size} | Qty: {order.quantity}</p>
                                    <p className="text-sm mt-1">
                                        <span className="font-semibold">Status:</span>{" "}
                                        <span className="text-indigo-600 font-bold">{order.status || "Processing"}</span>
                                    </p>

                                    {order.trackingUpdates && (
                                        <div className="mt-3 bg-gray-100 rounded p-2 text-sm">
                                            <p className="font-semibold mb-1">📦 Tracking:</p>
                                            <ul className="list-disc ml-5 space-y-1">
                                                {order.trackingUpdates.map((update, i) => (
                                                    <li key={i}>
                                                        {new Date(update.time).toLocaleString()} - {update.status}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-400 mt-2">
                                        Ordered on: {new Date(order.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderRealtime;
