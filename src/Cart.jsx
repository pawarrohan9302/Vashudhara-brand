// src/Cart.jsx
import React, { useEffect, useState } from "react";
import { ref, onValue, update, remove } from "firebase/database";
import { database } from "./firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u);
                setLoading(true);
                const userCartRef = ref(database, `carts/${u.uid}`);
                const unsubscribeData = onValue(userCartRef, (snapshot) => {
                    const data = snapshot.val();
                    const loadedCartItems = [];
                    if (data) {
                        Object.keys(data).forEach((key) => {
                            loadedCartItems.push({
                                id: key,
                                ...data[key],
                            });
                        });
                    }
                    loadedCartItems.sort((a, b) => (a.addedAt || '').localeCompare(b.addedAt || ''));
                    setCartItems(loadedCartItems);
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching user cart:", error);
                    setLoading(false);
                    setCartItems([]);
                });
                return () => unsubscribeData();
            } else {
                setUser(null);
                setCartItems([]);
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, [auth]);

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (!user) return alert("Please log in to manage your cart.");
        const quantity = parseInt(newQuantity);
        if (isNaN(quantity)) return;
        const itemRef = ref(database, `carts/${user.uid}/${itemId}`);
        try {
            if (quantity <= 0) {
                await remove(itemRef);
                alert("Item removed from cart.");
            } else {
                await update(itemRef, { quantity }); // ✅ No addedAt here
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
            alert("Failed to update item. Try again.");
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (!user) return alert("Please log in to manage your cart.");
        if (window.confirm("Remove this item from your cart?")) {
            const itemRef = ref(database, `carts/${user.uid}/${itemId}`);
            try {
                await remove(itemRef);
                alert("Item removed.");
            } catch (error) {
                console.error("Error removing item:", error);
                alert("Failed to remove item.");
            }
        }
    };

    const calculateCartTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity);
            if (!isNaN(price) && !isNaN(quantity)) {
                return total + (price * quantity);
            }
            return total;
        }, 0);
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleRazorpayPayment = async () => {
        const res = await loadRazorpayScript();
        if (!res) {
            alert("Razorpay SDK failed to load.");
            return;
        }

        const totalAmount = calculateCartTotal().toFixed(2);

        const options = {
            key: "rzp_test_Wj5c933q6luams",
            amount: totalAmount * 100,
            currency: "INR",
            name: "Vashudhara Fashion",
            description: "Cart Payment",
            image: "/favicon.png",
            handler: function (response) {
                alert("Payment successful!\nPayment ID: " + response.razorpay_payment_id);
            },
            prefill: {
                name: user?.displayName || "Customer",
                email: user?.email || "example@example.com",
            },
            theme: {
                color: "#16a34a",
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    if (loading) {
        return (
            <section className="bg-white min-h-screen flex justify-center items-center">
                <p className="text-xl text-green-700">Loading your cart...</p>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="bg-white min-h-screen flex justify-center items-center">
                <div className="text-center p-8 bg-gray-100 rounded-lg shadow-xl border border-gray-200">
                    <p className="text-2xl font-bold text-red-600 mb-6">Please log in to view your cart.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                    >
                        Go to Login Page
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white min-h-screen py-16 px-5">
            <div className="max-w-4xl mx-auto text-center mb-10">
                <h1 className="text-4xl font-bold mb-3 text-green-700">Your Shopping Cart</h1>
                <p className="text-lg text-gray-600">Review your selected items before proceeding to checkout.</p>
                <p className="text-sm text-gray-500 mt-2">Logged in as: {user.email}</p>
            </div>

            <div className="max-w-4xl mx-auto">
                {cartItems.length === 0 ? (
                    <div className="text-center p-10 bg-gray-100 rounded-lg shadow-lg border border-gray-200">
                        <p className="text-2xl text-gray-600 mb-6">Your cart is currently empty!</p>
                        <button
                            onClick={() => navigate('/collections')}
                            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {cartItems.map((item) => {
                                const quantity = parseInt(item.quantity) || 1;
                                return (
                                    <div
                                        key={item.id}
                                        className="bg-gray-100 rounded-xl shadow-lg flex flex-col sm:flex-row items-center p-4 sm:p-6 gap-4"
                                    >
                                        <img
                                            src={item.productImage || "https://via.placeholder.com/100"}
                                            alt={item.productTitle}
                                            className="w-32 h-32 object-cover rounded-lg"
                                        />
                                        <div className="flex-grow text-center sm:text-left">
                                            <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-2">
                                                {item.productTitle || 'Unknown Product'}
                                            </h3>
                                            <p className="text-gray-700 text-sm">Brand: {item.brand || 'N/A'}</p>
                                            <p className="text-gray-700 text-sm">Size: {item.size || 'N/A'}</p>
                                            <p className="text-lg font-semibold text-gray-900 mt-1">
                                                Price: ₹{parseFloat(item.price).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, quantity - 1)}
                                                    className="bg-gray-300 text-gray-800 px-2 rounded-md"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={quantity}
                                                    onChange={(e) =>
                                                        handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                                                    }
                                                    className="w-16 p-2 rounded-lg border text-center"
                                                />
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, quantity + 1)}
                                                    className="bg-gray-300 text-gray-800 px-2 rounded-md"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 p-6 bg-gray-100 rounded-xl shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xl font-bold">Cart Total:</span>
                                <span className="text-2xl font-extrabold text-green-700">
                                    ₹{calculateCartTotal().toFixed(2)}
                                </span>
                            </div>
                            <button
                                onClick={handleRazorpayPayment}
                                className="w-full py-3 bg-green-600 text-white font-bold rounded-full text-lg hover:bg-green-700"
                            >
                                Pay Now with Razorpay
                            </button>
                            <button
                                onClick={() => navigate('/collections')}
                                className="w-full mt-4 py-3 bg-blue-600 text-white font-bold rounded-full text-lg hover:bg-blue-700"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export default Cart;
