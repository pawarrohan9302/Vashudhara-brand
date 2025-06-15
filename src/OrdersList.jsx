import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue } from "firebase/database";

const OrdersList = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const ordersRef = ref(database, "orders");
        onValue(ordersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const orderArray = Object.entries(data).map(([id, value]) => ({
                    id,
                    ...value,
                }));
                setOrders(orderArray.reverse());
            } else {
                setOrders([]);
            }
        });
    }, []);

    return (
        <div>
            <h2 className="text-3xl font-extrabold mb-8 text-indigo-700">
                🧾 Customer Orders ({orders.length})
            </h2>
            {orders.length === 0 ? (
                <p className="text-gray-600">No orders yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="relative bg-white border-l-8 border-indigo-500 shadow-xl rounded-xl p-6 hover:scale-[1.02] transition"
                        >
                            <div className="absolute top-2 right-2 bg-green-200 text-green-800 px-3 py-1 text-xs font-bold rounded-full shadow">
                                {order.status || "ORDER CONFIRMED"}
                            </div>

                            {order.image && (
                                <img
                                    src={order.image}
                                    alt={order.productTitle}
                                    className="w-full h-44 object-contain mb-4 rounded-md border"
                                />
                            )}

                            <h3 className="text-xl font-bold text-gray-800">{order.productTitle}</h3>
                            <p className="text-sm text-gray-500 mb-1">Brand: {order.brand}</p>
                            <p className="text-gray-700 font-semibold">₹ {order.amount}</p>
                            <p className="text-sm text-gray-600 mb-1">Qty: {order.quantity} | Size: {order.size}</p>
                            <p className="text-sm text-gray-600">Payment: ✅ Paid</p>

                            <div className="mt-4 text-sm text-gray-700">
                                <p><span className="font-bold">Customer:</span> {order.customerName}</p>
                                <p><span className="font-bold">Address:</span> {order.address?.village}, {order.address?.district}, {order.address?.stateName} - {order.address?.pinCode}</p>
                            </div>

                            <p className="mt-2 text-xs text-gray-500 italic">
                                ⏱ {new Date(order.createdAt).toLocaleString()}
                            </p>

                            {order.trackingUpdates && (
                                <div className="mt-4 bg-gray-100 rounded-lg p-3 text-sm text-gray-700">
                                    <p className="font-semibold mb-1">📦 Tracking Updates:</p>
                                    <ul className="list-disc ml-5 space-y-1">
                                        {order.trackingUpdates.map((update, idx) => (
                                            <li key={idx}>
                                                {new Date(update.time).toLocaleString()} - {update.status}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <button
                                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-md font-semibold shadow hover:bg-indigo-700 transition"
                                onClick={() => alert("Download feature coming soon...")}
                            >
                                📥 Download Invoice
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersList;
