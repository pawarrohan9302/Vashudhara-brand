import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue, update } from "firebase/database";

const AdminTrackOrders = () => {
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

    const handleStatusChange = (orderId, newStatus) => {
        const orderRef = ref(database, `orders/${orderId}`);
        update(orderRef, {
            status: newStatus,
            statusUpdatedAt: new Date().toISOString(),
        }).then(() => {
            alert("✅ Status updated");
        }).catch(() => {
            alert("❌ Failed to update status");
        });
    };

    return (
        <div>
            <h2 className="text-3xl font-extrabold mb-8 text-indigo-700">
                📦 Track Orders ({orders.length})
            </h2>
            {orders.length === 0 ? (
                <p className="text-gray-600">No orders to track.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white shadow-lg rounded-xl p-6 border-l-8 border-indigo-600 relative"
                        >
                            <div className="absolute top-2 right-2 text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                                {order.status || "Placed"}
                            </div>

                            {order.image && (
                                <img
                                    src={order.image}
                                    alt={order.productTitle}
                                    className="w-full h-44 object-contain mb-4 rounded-md border"
                                />
                            )}

                            <h3 className="text-xl font-bold">{order.productTitle}</h3>
                            <p className="text-gray-600 text-sm">Customer: {order.customerName}</p>
                            <p className="text-gray-600 text-sm">₹ {order.amount} | Qty: {order.quantity}</p>
                            <p className="text-sm text-gray-500">Address: {order.address?.village}, {order.address?.district}</p>

                            <label className="block mt-4 text-sm font-semibold text-gray-700">
                                Update Status:
                            </label>
                            <select
                                value={order.status || "Placed"}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                <option value="Placed">Placed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>

                            {order.statusUpdatedAt && (
                                <p className="mt-2 text-xs text-gray-500 italic">
                                    Last updated: {new Date(order.statusUpdatedAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminTrackOrders;
