// src/Collections.jsx
import React, { useState, useEffect } from "react";
import { database } from "./firebase"; // Assuming firebase.js is correctly configured
import { ref, onValue, push } from "firebase/database";

const Collections = () => {
    const [collections, setCollections] = useState({});
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("mens-wear"); // Default category
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loadingPayment, setLoadingPayment] = useState(false); // State for loading indicator

    // State variables for the purchase form
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState("M");
    const [fullName, setFullName] = useState("");
    const [surname, setSurname] = useState("");
    const [pinCode, setPinCode] = useState("");
    const [stateName, setStateName] = useState("");

    const [district, setDistrict] = useState("");
    const [village, setVillage] = useState("");

    // --- Data Fetching ---
    useEffect(() => {
        const collectionsRef = ref(database, `collections/${category}`);
        const unsubscribe = onValue(collectionsRef, (snapshot) => {
            const data = snapshot.val() || {};
            setCollections(data);
        });
        return () => unsubscribe();
    }, [category]);

    const collectionItems = Object.entries(collections).map(([key, value]) => ({
        id: key,
        ...value,
    }));

    const filteredItems = collectionItems.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
    );

    // --- Event Handlers ---
    const handleViewDetailsClick = (product) => {
        setSelectedProduct(product);
        // Reset form fields when a new product is selected
        setQuantity(1);
        setSize("M"); // Default size
        setFullName("");
        setSurname("");
        setPinCode("");
        setStateName("");
        setDistrict("");
        setVillage("");
    };

    // This function now handles payment via Razorpay
    const handleRazorpayPayment = async () => {
        if (loadingPayment) return; // Prevent double clicks

        // Basic validation for address fields
        if (!fullName || !surname || !pinCode || !stateName || !district || !village) {
            alert("Please fill all required address fields.");
            return;
        }

        if (!selectedProduct) {
            alert("No product selected for purchase.");
            return;
        }

        setLoadingPayment(true);

        const totalAmount = (selectedProduct.price * quantity) || 100; // Calculate total amount
        const amountInPaise = totalAmount * 100; // Razorpay expects amount in paise

        // Step 1: Create an Order on your Server (Backend)
        try {
            // ✅ IMPORTANT: Use the full backend URL here
            const orderCreationResponse = await fetch('http://localhost:5000/api/create-razorpay-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: amountInPaise }),
            });

            // Check if the response was OK (status 2xx) before trying to parse JSON
            if (!orderCreationResponse.ok) {
                const errorText = await orderCreationResponse.text(); // Read as text in case of non-JSON error
                console.error("Backend order creation failed (HTTP error):", orderCreationResponse.status, errorText);
                alert(`Error from backend: ${errorText || 'Failed to create order.'}`);
                setLoadingPayment(false);
                return;
            }

            const orderData = await orderCreationResponse.json();

            if (orderData.error) {
                alert(`Error creating Razorpay order: ${orderData.error}`);
                setLoadingPayment(false);
                return;
            }

            // Step 2: Open Razorpay Checkout (Client-Side)
            const options = {
                key: 'rzp_test_eVi31zd0UZULF8', // ✅ Your provided Key ID
                amount: orderData.amount, // Amount in paise, from server response
                currency: orderData.currency,
                name: 'Vashudhara Store',
                description: `Purchase of ${selectedProduct.title} (Qty: ${quantity})`,
                order_id: orderData.orderId, // Order ID from your server
                handler: async (response) => {
                    // This function is called after successful payment
                    // Step 3: Verify Payment on your Server (Backend)
                    try {
                        // ✅ IMPORTANT: Use the full backend URL here
                        const verificationRes = await fetch('http://localhost:5000/api/verify-razorpay-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        if (!verificationRes.ok) {
                            const errorText = await verificationRes.text();
                            console.error("Backend verification failed (HTTP error):", verificationRes.status, errorText);
                            alert(`Payment verification error from backend: ${errorText || 'Failed to verify payment.'}`);
                            setLoadingPayment(false);
                            return;
                        }

                        const verificationData = await verificationRes.json();

                        if (verificationData.success) {
                            // Payment successfully verified on server!
                            // Now, save the complete order details to Firebase
                            const ordersRef = ref(database, "orders");
                            await push(ordersRef, {
                                productId: selectedProduct.id,
                                productTitle: selectedProduct.title,
                                productImage: selectedProduct.image,
                                pricePerItem: selectedProduct.price,
                                quantity: quantity,
                                size: size,
                                customerName: fullName,
                                customerSurname: surname,
                                pinCode: pinCode,
                                state: stateName,
                                district: district,
                                village: village,
                                totalAmount: totalAmount, // Use totalAmount in INR
                                orderDate: new Date().toISOString(),
                                status: "Payment Confirmed", // Update status
                                paymentMethod: "Razorpay",
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpayOrderId: response.razorpay_order_id,
                            });

                            alert("Payment Successful! Your order has been placed.");
                            setSelectedProduct(null); // Close modal
                            // Optionally, redirect to an order confirmation page
                            // navigate('/order-confirmation/' + orderData.orderId);
                        } else {
                            // Payment failed verification on server
                            alert("Payment verification failed. Please contact support.");
                            // You might still save a 'failed' or 'pending' order to Firebase here
                        }
                    } catch (error) {
                        console.error("Error during payment verification or saving order:", error);
                        alert("An error occurred during payment. Please try again or contact support.");
                    } finally {
                        setLoadingPayment(false);
                    }
                },
                prefill: {
                    name: `${fullName} ${surname}`,
                    // email: 'user@example.com', // Add user's email if available
                    // contact: '9999999999', // Add user's contact if available
                },
                notes: {
                    address: `${village}, ${district}, ${stateName} - ${pinCode}`,
                    orderDescription: `Order for ${selectedProduct.title}`,
                },
                theme: {
                    color: '#34D399', // Tailwind's emerald-400
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('razorpay_payment_and_checkout_closed', function (response) {
                // Payment modal closed by user, not necessarily a failure
                if (!response.error) {
                    console.log("Razorpay checkout closed by user without error.");
                } else {
                    console.log("Razorpay checkout closed with error:", response.error.code, response.error.description);
                }
                setLoadingPayment(false); // Stop loading when modal closes
            });
            rzp.on('razorpay_payment_failed', function (response) {
                alert(`Payment failed: ${response.error.description}. Please try again.`);
                console.error("Razorpay payment failed:", response.error);
                setLoadingPayment(false);
                // Optionally save a 'failed' order status to Firebase
            });
            rzp.open();

        } catch (error) {
            console.error("Error initiating Razorpay payment:", error);
            alert("Could not initiate payment. Please try again.");
            setLoadingPayment(false);
        }
    };

    // --- Component Render ---
    return (
        <section className="bg-black min-h-screen py-16 px-5 font-poppins text-blue-100">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-3">Our Collections</h1>
                <p className="text-lg text-slate-400 mb-10">
                    Explore the latest collections of clothing, accessories, and more!
                </p>

                {/* Category Select */}
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="p-3.5 px-5 rounded-full border-2 border-emerald-400 bg-gray-900 text-blue-100 text-base mb-8 focus:outline-none focus:border-emerald-500"
                >
                    <option value="mens-wear">Men's Wear</option>
                    <option value="womens-wear">Women's Wear</option>
                    <option value="accessories">Accessories</option>
                    <option value="earrings">Earring Elegance</option>
                </select>

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search collections..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="p-3.5 px-6 rounded-full border-2 border-emerald-400 w-3/4 max-w-sm text-base bg-gray-900 text-blue-100 outline-none mb-12 transition-colors duration-300 focus:border-emerald-500"
                />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {filteredItems.length === 0 ? (
                    <p className="text-slate-400 col-span-full text-center">
                        No collections found.
                    </p>
                ) : (
                    filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="relative bg-gray-800 rounded-3xl overflow-hidden shadow-lg shadow-emerald-700/30 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-emerald-700/60"
                            onClick={() => handleViewDetailsClick(item)}
                        >
                            {item.tag && (
                                <span className="absolute top-4 left-4 bg-green-500 text-white py-1.5 px-3 rounded-full text-xs font-bold uppercase tracking-wider z-10">
                                    {item.tag}
                                </span>
                            )}

                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-52 object-cover"
                                loading="lazy"
                            />

                            {/* Hover Overlay */}
                            <div className="absolute bottom-0 w-full bg-emerald-600/85 text-emerald-50 text-center py-3 opacity-0 transition-opacity duration-300 font-semibold text-base rounded-b-3xl group-hover:opacity-100 hover-overlay">
                                View Details
                            </div>

                            <div className="p-6">
                                <h2 className="text-2xl mb-3 text-emerald-200 font-bold">
                                    {item.title}
                                </h2>
                                <p className="text-base text-gray-300 leading-normal">
                                    {item.description || item.brand || ""}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* --- Purchase Modal --- */}
            {selectedProduct && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-5"
                    onClick={() => setSelectedProduct(null)}
                >
                    <div
                        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md text-white p-6 flex flex-col max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-3xl font-bold mb-5 text-center text-emerald-300">
                            Buy {selectedProduct.title}
                        </h2>
                        <img
                            src={selectedProduct.image}
                            alt={selectedProduct.title}
                            className="w-full h-48 object-contain rounded-lg mb-6"
                            loading="lazy"
                        />

                        {/* Quantity and Size */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">Quantity:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">Size:</label>
                                <select
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                >
                                    <option value="S">Small</option>
                                    <option value="M">Medium</option>
                                    <option value="L">Large</option>
                                    <option value="XL">XL</option>
                                </select>
                            </div>
                        </div>

                        {/* Address Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">Full Name:</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">Surname:</label>
                                <input
                                    type="text"
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">Pin Code:</label>
                                <input
                                    type="text"
                                    value={pinCode}
                                    onChange={(e) => setPinCode(e.target.value)}
                                    maxLength={6}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">State:</label>
                                <input
                                    type="text"
                                    value={stateName}
                                    onChange={(e) => setStateName(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">District:</label>
                                <input
                                    type="text"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">Village:</label>
                                <input
                                    type="text"
                                    value={village}
                                    onChange={(e) => setVillage(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        <p className="text-xl font-bold mb-6 text-emerald-50">
                            Total Price: ₹{selectedProduct.price * quantity || "N/A"}
                        </p>

                        <button
                            onClick={handleRazorpayPayment}
                            className="bg-green-500 text-black py-3 rounded-full text-lg font-semibold mb-3 hover:bg-green-600 transition-colors duration-200"
                            disabled={loadingPayment}
                        >
                            {loadingPayment ? 'Processing Payment...' : 'Pay with Razorpay'}
                        </button>
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="bg-red-500 text-white py-3 rounded-full text-lg font-semibold hover:bg-red-600 transition-colors duration-200"
                            disabled={loadingPayment}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Collections;