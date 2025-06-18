import React, { useEffect, useState } from "react";
import { ref, onValue, update, remove } from "firebase/database";
import { database } from "./firebase"; // Ensure firebase.js exports 'database'
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

                // Reference to the current user's CART in Firebase
                // This assumes your cart structure is: /carts/{uid}/{product_id_as_key}/
                const userCartRef = ref(database, `carts/${u.uid}`);

                const unsubscribeData = onValue(userCartRef, (snapshot) => {
                    const data = snapshot.val();
                    const loadedCartItems = [];
                    if (data) {
                        Object.keys(data).forEach((key) => {
                            loadedCartItems.push({
                                id: key, // The product ID is the key in Firebase
                                ...data[key],
                            });
                        });
                    }
                    // Sort items, perhaps by when they were added, or just keep insertion order
                    // For consistent display, sorting by productTitle or addedAt might be good
                    loadedCartItems.sort((a, b) => (a.addedAt || '').localeCompare(b.addedAt || ''));

                    setCartItems(loadedCartItems);
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching user cart:", error);
                    setLoading(false);
                    setCartItems([]);
                });

                // Cleanup function for the Firebase Realtime Database listener
                return () => unsubscribeData();

            } else {
                // If no user is logged in, clear cart and stop loading
                setUser(null);
                setCartItems([]);
                setLoading(false);
            }
        });

        // Cleanup function for the Firebase Auth listener
        return () => unsubscribeAuth();
    }, [auth]); // Dependency array: re-run if 'auth' object changes (rare, but good practice)

    // Function to update quantity of an item in Firebase cart
    const handleQuantityChange = async (itemId, newQuantity) => {
        if (!user) {
            alert("Please log in to manage your cart.");
            return;
        }

        const quantity = parseInt(newQuantity);
        if (isNaN(quantity)) return; // Prevent non-numeric input

        const itemRef = ref(database, `carts/${user.uid}/${itemId}`);

        try {
            if (quantity <= 0) {
                // If quantity is 0 or less, remove the item
                await remove(itemRef);
                alert("Item removed from cart.");
            } else {
                await update(itemRef, { quantity: quantity, addedAt: new Date().toISOString() }); // Also update timestamp for re-ordering if needed
            }
        } catch (error) {
            console.error("Error updating cart item quantity:", error);
            alert("Failed to update item quantity. Please try again.");
        }
    };

    // Function to remove an item from Firebase cart
    const handleRemoveItem = async (itemId) => {
        if (!user) {
            alert("Please log in to manage your cart.");
            return;
        }

        if (window.confirm("Are you sure you want to remove this item from your cart?")) {
            const itemRef = ref(database, `carts/${user.uid}/${itemId}`);
            try {
                await remove(itemRef);
                alert("Item removed from cart.");
            } catch (error) {
                console.error("Error removing item from cart:", error);
                alert("Failed to remove item. Please try again.");
            }
        }
    };

    // Calculate total price of items in the cart
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

    // Conditional rendering for different states
    if (loading) {
        return (
            <section className="bg-white min-h-screen py-16 px-5 font-poppins text-gray-800 flex justify-center items-center">
                <p className="text-xl text-green-700">Loading your cart...</p>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="bg-white min-h-screen py-16 px-5 font-poppins text-gray-800 flex justify-center items-center">
                <div className="text-center p-8 bg-gray-100 rounded-lg shadow-xl border border-gray-200">
                    <p className="text-2xl font-bold text-red-600 mb-6">Please log in to view your cart.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
                    >
                        Go to Login Page
                    </button>
                    <p className="mt-4 text-gray-600">If you don't have an account, you can register there.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white min-h-screen py-16 px-5 font-poppins text-gray-800">
            <div className="max-w-4xl mx-auto text-center mb-10">
                <h1 className="text-4xl font-bold mb-3 text-green-700 capitalize">
                    Your Shopping Cart
                </h1>
                <p className="text-lg text-gray-600">
                    Review your selected items before proceeding to checkout.
                </p>
                {user && <p className="text-sm text-gray-500 mt-2">Logged in as: {user.email}</p>}
            </div>

            <div className="max-w-4xl mx-auto">
                {cartItems.length === 0 ? (
                    <div className="text-center p-10 bg-gray-100 rounded-lg shadow-lg border border-gray-200">
                        <p className="text-2xl text-gray-600 mb-6">Your cart is currently empty!</p>
                        <button
                            onClick={() => navigate('/collections')}
                            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-gray-100 rounded-xl shadow-lg flex flex-col sm:flex-row items-center p-4 sm:p-6 gap-4 border border-gray-200"
                                >
                                    <img
                                        src={item.productImage || "https://via.placeholder.com/100"}
                                        alt={item.productTitle}
                                        className="w-32 h-32 object-cover rounded-lg flex-shrink-0 border border-gray-300"
                                    />
                                    <div className="flex-grow text-center sm:text-left">
                                        <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-2">
                                            {item.productTitle || 'Unknown Product'}
                                        </h3>
                                        <p className="text-gray-700 text-sm sm:text-base">Brand: {item.brand || 'N/A'}</p>
                                        <p className="text-gray-700 text-sm sm:text-base">Size: <strong className="text-green-700">{item.size || 'N/A'}</strong></p>
                                        <p className="text-lg sm:text-xl font-semibold text-gray-900 mt-1">
                                            Price: ₹{item.price != null ? parseFloat(item.price).toFixed(2) : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 mt-4 sm:mt-0">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                className="bg-gray-300 text-gray-800 p-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                className="w-16 p-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-center outline-none focus:border-green-500"
                                            />
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                className="bg-gray-300 text-gray-800 p-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors duration-200 mt-2"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-6 bg-gray-100 rounded-xl shadow-lg text-gray-900 border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xl font-bold">Cart Total:</span>
                                <span className="text-2xl font-extrabold text-green-700">
                                    ₹{calculateCartTotal().toFixed(2)}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    // In a real application, this would navigate to a detailed checkout form
                                    // and then initiate a multi-item Razorpay order.
                                    alert(`Proceeding to checkout with a total of ₹${calculateCartTotal().toFixed(2)}. This is where your full checkout logic would go!`);
                                    // Example: navigate('/checkout');
                                }}
                                className="w-full py-3 bg-green-600 text-white font-bold rounded-full text-lg hover:bg-green-700 transition-colors duration-300"
                            >
                                Proceed to Checkout
                            </button>
                            <button
                                onClick={() => navigate('/collections')}
                                className="w-full mt-4 py-3 bg-blue-600 text-white font-bold rounded-full text-lg hover:bg-blue-700 transition-colors duration-300"
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