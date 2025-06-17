import React, { useEffect, useState } from "react";
import { database } from "./firebase"; // Ensure 'database' is exported from firebase.js
import { ref, onValue, push, update, set } from "firebase/database"; // Added 'set'
import loadScript from "./loadRazorpayScript"; // Import the helper function

const Collections = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState("M");
    const [fullName, setFullName] = useState("");
    const [surname, setSurname] = useState("");
    const [pinCode, setPinCode] = useState("");
    const [stateName, setStateName] = useState("");
    const [district, setDistrict] = useState("");
    const [village, setVillage] = useState("");
    const [customerEmail, setCustomerEmail] = useState(""); // Added customerEmail state
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingPincode, setLoadingPincode] = useState(false); // State for pincode loading
    const [pincodeError, setPincodeError] = useState(''); // State for pincode error

    // IMPORTANT: Replace with your actual Razorpay Test Key ID
    // NEVER expose your Key Secret in client-side code for a production app!
    const RAZORPAY_KEY_ID = "rzp_test_Wj5c933q6luams"; // <-- PASTE YOUR RAZORPAY TEST KEY ID HERE

    useEffect(() => {
        setIsLoading(true);
        const productsRef = ref(database, "products");
        const unsubscribe = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            const productArray = data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : [];
            setProducts(productArray);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching products:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Function to fetch pincode details
    const fetchPincodeDetails = async () => {
        if (pinCode.length !== 6) {
            setPincodeError('Pincode must be 6 digits.');
            return;
        }

        setLoadingPincode(true);
        setPincodeError('');
        // No need to clear stateName, district, village here as they can be manually overridden

        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
            const data = await response.json();

            if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
                const postOffice = data[0].PostOffice[0];
                setStateName(postOffice.State);
                setDistrict(postOffice.District);
                // setVillage(postOffice.Name); // Uncomment if you want to auto-fill village/post office name
            } else {
                setPincodeError('Invalid or unserviceable pincode. Please enter manually.');
                // Clear auto-filled fields if pincode is invalid/unserviceable for user to manually enter
                setStateName('');
                setDistrict('');
            }
        } catch (error) {
            console.error("Error fetching pincode details:", error);
            setPincodeError('Failed to fetch pincode details. Please enter manually.');
            // Clear auto-filled fields on error for user to manually enter
            setStateName('');
            setDistrict('');
        } finally {
            setLoadingPincode(false);
        }
    };

    const handleBuyClick = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setSize("M");
        setFullName("");
        setSurname("");
        setPinCode("");
        setStateName("");
        setDistrict("");
        setVillage("");
        setCustomerEmail(""); // Reset customer email
        setPincodeError(''); // Clear any previous pincode error
    };

    const handleCreateOrder = async () => {
        setIsSubmitting(true);

        // --- Form Validation ---
        if (!fullName.trim() || !surname.trim() || !pinCode.trim() || !stateName.trim() || !district.trim() || !village.trim() || !customerEmail.trim()) {
            alert("Please fill all required address fields, including your email.");
            setIsSubmitting(false);
            return;
        }

        if (!/^\d{6}$/.test(pinCode.trim())) {
            alert("Please enter a valid 6-digit PIN code.");
            setIsSubmitting(false);
            return;
        }

        if (!selectedProduct) {
            alert("No product selected for purchase.");
            setIsSubmitting(false);
            return;
        }
        if (quantity <= 0) {
            alert("Quantity must be at least 1.");
            setIsSubmitting(false);
            return;
        }
        if (!size) {
            alert("Please select a size for the product.");
            setIsSubmitting(false);
            return;
        }

        const itemPrice = parseFloat(selectedProduct.price);
        if (isNaN(itemPrice) || itemPrice <= 0) {
            alert("Product price is invalid. Please select another product or contact support.");
            setIsSubmitting(false);
            return;
        }
        const amount = itemPrice * quantity;
        const razorpayAmountInPaisa = Math.round(amount * 100);

        let firebaseOrderId = null;

        try {
            // Step 1: Save the order to Firebase with 'Payment Pending' status
            const ordersRef = ref(database, "orders");
            const newOrderRef = push(ordersRef); // Use push to get a new ref
            firebaseOrderId = newOrderRef.key; // Get the unique key generated by push

            await set(newOrderRef, { // Use set to write data at the new ref
                id: firebaseOrderId, // Store the ID within the order data
                productId: selectedProduct.id,
                productTitle: selectedProduct.title,
                productImage: selectedProduct.image,
                pricePerItem: selectedProduct.price,
                quantity: quantity,
                size: size,
                customerName: fullName.trim(),
                customerSurname: surname.trim(),
                customerEmail: customerEmail.trim(), // Save customer email
                pinCode: pinCode.trim(),
                state: stateName.trim(),
                district: district.trim(),
                village: village.trim(),
                totalAmount: amount,
                orderDate: new Date().toISOString(),
                status: "Payment Pending",
                paymentMethod: "Razorpay",
                trackingUpdates: [], // Initialize tracking updates
            });
            console.log("Order saved to Firebase with ID:", firebaseOrderId);

            // Step 2: Load the Razorpay SDK script dynamically
            const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

            if (!res) {
                alert("Razorpay SDK failed to load. Please check your internet connection.");
                setIsSubmitting(false);
                if (firebaseOrderId) {
                    await update(ref(database, `orders/${firebaseOrderId}`), {
                        status: "Payment Initiation Failed (SDK Load)",
                    });
                }
                return;
            }

            // Step 3: Configure Razorpay payment options
            const options = {
                key: RAZORPAY_KEY_ID,
                amount: razorpayAmountInPaisa,
                currency: "INR",
                name: "Vashudhara Store",
                description: `Order for ${selectedProduct.title}`,
                image: "https://via.placeholder.com/100x100?text=Shop+Logo", // Replace with your actual shop logo
                notes: {
                    firebaseOrderId: firebaseOrderId,
                    productTitle: selectedProduct.title,
                    customerName: `${fullName.trim()} ${surname.trim()}`,
                    customerEmail: customerEmail.trim(), // Pass customer email to Razorpay notes
                    pinCode: pinCode.trim(),
                    address: `${village.trim()}, ${district.trim()}, ${stateName.trim()} - ${pinCode.trim()}`,
                    product_id: selectedProduct.id,
                },
                handler: async function (response) {
                    console.log("Payment successful:", response);
                    alert("Payment successful! Your order has been placed.");

                    // Step 4: Update order status in Firebase to 'Payment Successful'
                    if (firebaseOrderId) {
                        try {
                            await update(ref(database, `orders/${firebaseOrderId}`), {
                                status: "Payment Successful",
                                razorpayPaymentId: response.razorpay_payment_id || null,
                                razorpayOrderId: response.razorpay_order_id || null,
                                razorpaySignature: response.razorpay_signature || null,
                            });
                            console.log("Order status updated in Firebase.");
                        } catch (updateError) {
                            console.error("Error updating order status in Firebase:", updateError);
                            alert("Payment successful, but there was an error updating order status in our system. Please contact support with your payment ID: " + response.razorpay_payment_id);
                        }
                    }

                    // Reset form fields
                    setSelectedProduct(null);
                    setQuantity(1);
                    setSize("M");
                    setFullName("");
                    setSurname("");
                    setPinCode("");
                    setStateName("");
                    setDistrict("");
                    setVillage("");
                    setCustomerEmail("");
                    setPincodeError('');
                    setIsSubmitting(false);
                },
                prefill: {
                    name: `${fullName.trim()} ${surname.trim()}`,
                    email: customerEmail.trim(), // Use actual customer email
                    contact: "9999999999", // Consider making this dynamic based on user input if you collect phone number
                },
                theme: {
                    color: "#3399cc",
                },
                modal: {
                    ondismiss: async function () {
                        console.log('Payment dismissed by user.');
                        alert("Payment was cancelled or failed. Please try again.");
                        if (firebaseOrderId) {
                            try {
                                await update(ref(database, `orders/${firebaseOrderId}`), {
                                    status: "Payment Cancelled By User",
                                });
                                console.log("Order status updated to 'Payment Cancelled' in Firebase.");
                            } catch (updateError) {
                                console.error("Error updating order status on dismiss:", updateError);
                            }
                        }
                        setIsSubmitting(false);
                    }
                }
            };

            // Step 4: Open the Razorpay payment gateway
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error("Error during payment initiation:", error);
            alert(`An error occurred: ${error.message || "Please try again."}`);

            if (firebaseOrderId) {
                try {
                    await update(ref(database, `orders/${firebaseOrderId}`), {
                        status: "Payment Initiation Failed (Client-side Error)",
                        errorMessage: error.message || null,
                    });
                } catch (updateErr) {
                    console.error("Failed to update status after initiation error:", updateErr);
                }
            }
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-black min-h-screen py-16 px-5 font-poppins text-blue-100">
            <div className="max-w-3xl mx-auto text-center mb-10">
                <h1 className="text-4xl font-bold mb-3 text-emerald-300 capitalize">
                    Our Collections
                </h1>
                <p className="text-lg text-slate-400">
                    Explore all our amazing products.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {isLoading ? (
                    <p className="text-slate-400 col-span-full text-center">
                        Loading products...
                    </p>
                ) : products.length === 0 ? (
                    <p className="text-slate-400 col-span-full text-center">
                        No products found in our collection.
                    </p>
                ) : (
                    products.map((product) => (
                        <div
                            key={product.id}
                            className="relative bg-gray-800 rounded-3xl overflow-hidden shadow-lg shadow-emerald-700/30 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-emerald-700/60"
                            onClick={() => handleBuyClick(product)}
                        >
                            {product.tag && (
                                <span className="absolute top-4 left-4 bg-green-500 text-white py-1.5 px-3 rounded-full text-xs font-bold uppercase tracking-wider z-10">
                                    {product.tag}
                                </span>
                            )}

                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-52 object-cover"
                                loading="lazy"
                            />

                            <div className="absolute bottom-0 w-full bg-emerald-600/85 text-emerald-50 text-center py-3 opacity-0 transition-opacity duration-300 font-semibold text-base rounded-b-3xl group-hover:opacity-100 hover-overlay">
                                View Details
                            </div>

                            <div className="p-6">
                                <h3 className="text-2xl mb-3 text-emerald-200 font-bold">
                                    {product.title}
                                </h3>
                                <p className="text-base text-gray-300 leading-normal">
                                    Brand: {product.brand || "N/A"}
                                </p>
                                <p className="text-xl font-bold mt-2 text-emerald-50">
                                    Price: ₹{product.price || "N/A"}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedProduct && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-5"
                    onClick={() => !isSubmitting && setSelectedProduct(null)}
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-semibold mb-1 text-gray-300">Quantity:</label>
                                <input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="size" className="block text-sm font-semibold mb-1 text-gray-300">Size:</label>
                                <select
                                    id="size"
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                    required
                                >
                                    <option value="S">Small</option>
                                    <option value="M">Medium</option>
                                    <option value="L">Large</option>
                                    <option value="XL">XL</option>
                                    {selectedProduct.sizes && selectedProduct.sizes.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-semibold mb-1 text-gray-300">First Name:</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="surname" className="block text-sm font-semibold mb-1 text-gray-300">Last Name:</label>
                                <input
                                    id="surname"
                                    type="text"
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="customerEmail" className="block text-sm font-semibold mb-1 text-gray-300">Email:</label>
                                <input
                                    id="customerEmail"
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                    required
                                    placeholder="yourname@example.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="pinCode" className="block text-sm font-semibold mb-1 text-gray-300">Pin Code:</label>
                                <input
                                    id="pinCode"
                                    type="text"
                                    value={pinCode}
                                    onChange={(e) => setPinCode(e.target.value)}
                                    onBlur={fetchPincodeDetails}
                                    maxLength={6}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                    required
                                />
                                {loadingPincode && <p className="text-sm text-blue-400 mt-1">Fetching address details...</p>}
                                {pincodeError && <p className="text-sm text-red-400 mt-1">{pincodeError}</p>}
                            </div>
                            <div>
                                <label htmlFor="stateName" className="block text-sm font-semibold mb-1 text-gray-300">State:</label>
                                <input
                                    id="stateName"
                                    type="text"
                                    value={stateName}
                                    onChange={(e) => setStateName(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="district" className="block text-sm font-semibold mb-1 text-gray-300">District:</label>
                                <input
                                    id="district"
                                    type="text"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="village" className="block text-sm font-semibold mb-1 text-gray-300">Village:</label>
                                <input
                                    id="village"
                                    type="text"
                                    value={village}
                                    onChange={(e) => setVillage(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>
                        </div>

                        <p className="text-xl font-bold mb-6 text-emerald-50">
                            Total Price: ₹{selectedProduct.price * quantity || "N/A"}
                        </p>

                        <button
                            onClick={handleCreateOrder}
                            className="bg-green-500 text-black py-3 rounded-full text-lg font-semibold mb-3 hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || loadingPincode}
                        >
                            {isSubmitting ? "Processing Payment..." : "Confirm Purchase & Pay"}
                        </button>
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="bg-red-500 text-white py-3 rounded-full text-lg font-semibold hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
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