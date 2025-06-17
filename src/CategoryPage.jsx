import React, { useEffect, useState } from "react";
import { database } from "./firebase"; // Assuming 'app' is not directly used here
import { ref, onValue, query, orderByChild, equalTo, push, update, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import useAuthStatus from "./hooks/useAuthStatus"; // Make sure this path is correct
import loadScript from "./loadRazorpayScript"; // Make sure this path is correct

const CategoryPage = ({ category }) => {
    const { loggedIn, checkingStatus, user } = useAuthStatus(); // Use the auth hook
    const navigate = useNavigate(); // Initialize navigate

    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState("M");

    // Initialize state variables with logged-in user data if available
    // These will be further updated by useEffect if user object changes
    const [fullName, setFullName] = useState(user?.displayName?.split(' ')[0] || "");
    const [surname, setSurname] = useState(user?.displayName?.split(' ')[1] || "");
    const [pinCode, setPinCode] = useState("");
    const [stateName, setStateName] = useState("");
    const [district, setDistrict] = useState("");
    const [village, setVillage] = useState("");
    const [customerEmail, setCustomerEmail] = useState(user?.email || ""); // Pre-fill with user email

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingPincode, setLoadingPincode] = useState(false);
    const [pincodeError, setPincodeError] = useState('');

    const RAZORPAY_KEY_ID = "rzp_test_Wj5c933q6luams"; // Ensure this is your actual test or live key

    // Effect for fetching products based on category
    useEffect(() => {
        setIsLoading(true);
        const productsRef = ref(database, "products");
        const categoryQuery = query(productsRef, orderByChild("category"), equalTo(category));

        const unsubscribe = onValue(categoryQuery, (snapshot) => {
            const data = snapshot.val();
            const productArray = data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : [];
            setProducts(productArray);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching products:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [category]);

    // Effect for updating customer details if user object changes (e.g., after login)
    useEffect(() => {
        if (user) {
            setCustomerEmail(user.email || "");
            if (user.displayName) {
                const nameParts = user.displayName.split(' ');
                setFullName(nameParts[0] || "");
                setSurname(nameParts[1] || "");
            } else {
                // If user is logged in but displayName is null, allow manual entry
                setFullName("");
                setSurname("");
            }
        } else {
            // Clear fields if user logs out or is not logged in
            setFullName("");
            setSurname("");
            setCustomerEmail("");
            setPinCode("");
            setStateName("");
            setDistrict("");
            setVillage("");
        }
    }, [user]);

    // Function to fetch pincode details from external API
    const fetchPincodeDetails = async () => {
        if (pinCode.length !== 6 || !/^\d{6}$/.test(pinCode)) {
            setPincodeError('Pincode must be a valid 6-digit number.');
            setStateName('');
            setDistrict('');
            return;
        }

        setLoadingPincode(true);
        setPincodeError(''); // Clear previous errors

        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
            const data = await response.json();

            if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
                const postOffice = data[0].PostOffice[0];
                setStateName(postOffice.State);
                setDistrict(postOffice.District);
                // Intentionally NOT auto-filling village as per previous discussion
                setPincodeError(''); // Clear error if successful
            } else {
                setPincodeError('Invalid or unserviceable pincode. Please enter State and District manually.');
                setStateName('');
                setDistrict('');
            }
        } catch (error) {
            console.error("Error fetching pincode details:", error);
            setPincodeError('Failed to fetch pincode details. Please enter State and District manually.');
            setStateName('');
            setDistrict('');
        } finally {
            setLoadingPincode(false);
        }
    };

    // Handler when a product's "Buy" button is clicked
    const handleBuyClick = (product) => {
        // --- Authentication Check ---
        if (checkingStatus) {
            alert('Please wait while we check your login status.');
            return;
        }
        if (!loggedIn) {
            alert('Please log in to place an order.');
            navigate('/login'); // Redirect to your login page
            return;
        }
        // --- End Authentication Check ---

        setSelectedProduct(product);
        setQuantity(1);
        setSize("M");
        // Clear address fields for a new order. User data fields remain from useEffect.
        setPinCode("");
        setStateName("");
        setDistrict("");
        setVillage("");
        setPincodeError('');
    };

    // Handler for initiating the Razorpay order
    const handleCreateOrder = async () => {
        setIsSubmitting(true);

        if (!user) { // Double check user is logged in
            alert("You must be logged in to place an order.");
            setIsSubmitting(false);
            navigate('/login');
            return;
        }

        // Basic validation for all required fields
        if (!fullName.trim() || !surname.trim() || !customerEmail.trim() || !pinCode.trim() || !stateName.trim() || !district.trim() || !village.trim()) {
            alert("Please fill all required address fields: First Name, Last Name, Email, Pin Code, State, District, and Village.");
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

        let firebaseOrderId = null; // Variable to store the Firebase order ID

        try {
            // 1. Save order to Firebase with "Payment Pending" status
            const ordersRef = ref(database, "orders");
            const newOrderRef = push(ordersRef); // Generates a unique ID
            firebaseOrderId = newOrderRef.key;

            await set(newOrderRef, {
                id: firebaseOrderId,
                userId: user.uid, // Store the Firebase User ID
                productId: selectedProduct.id,
                productTitle: selectedProduct.title,
                productImage: selectedProduct.image,
                pricePerItem: selectedProduct.price,
                quantity: quantity,
                size: size,
                customerName: fullName.trim(),
                customerSurname: surname.trim(),
                customerEmail: customerEmail.trim(),
                pinCode: pinCode.trim(),
                state: stateName.trim(),
                district: district.trim(),
                village: village.trim(),
                totalAmount: amount,
                orderDate: new Date().toISOString(),
                status: "Payment Pending", // Initial status
                paymentMethod: "Razorpay",
                trackingUpdates: [],
            });
            console.log("Order saved to Firebase with ID:", firebaseOrderId);

            // 2. Load Razorpay SDK
            const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

            if (!res) {
                alert("Razorpay SDK failed to load. Please check your internet connection.");
                setIsSubmitting(false);
                // Update Firebase order status to reflect SDK load failure
                if (firebaseOrderId) {
                    await update(ref(database, `orders/${firebaseOrderId}`), {
                        status: "Payment Initiation Failed (SDK Load)",
                    });
                }
                return;
            }

            // 3. Configure Razorpay options
            const options = {
                key: RAZORPAY_KEY_ID,
                amount: razorpayAmountInPaisa,
                currency: "INR",
                name: "Vashudhara Store", // Your shop name
                description: `Order for ${selectedProduct.title}`,
                image: "https://via.placeholder.com/100x100?text=Shop+Logo", // Replace with your actual shop logo URL
                notes: {
                    firebaseOrderId: firebaseOrderId, // Pass Firebase order ID to Razorpay
                    productTitle: selectedProduct.title,
                    customerName: `${fullName.trim()} ${surname.trim()}`,
                    customerEmail: customerEmail.trim(),
                    pinCode: pinCode.trim(),
                    address: `${village.trim()}, ${district.trim()}, ${stateName.trim()} - ${pinCode.trim()}`,
                    product_id: selectedProduct.id,
                    user_id: user.uid,
                },
                handler: async function (response) {
                    // This function is called on successful payment
                    console.log("Payment successful:", response);
                    alert("Payment successful! Your order has been placed.");

                    if (firebaseOrderId) {
                        try {
                            // Update Firebase order status to "Payment Successful"
                            await update(ref(database, `orders/${firebaseOrderId}`), {
                                status: "Payment Successful",
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpaySignature: response.razorpay_signature,
                            });
                            console.log("Order status updated in Firebase to Successful.");
                        } catch (updateError) {
                            console.error("Error updating order status in Firebase after successful payment:", updateError);
                            alert("Payment successful, but there was an error updating order status in our system. Please contact support with your payment ID: " + response.razorpay_payment_id);
                        }
                    }

                    // Reset form after successful payment
                    setSelectedProduct(null);
                    setQuantity(1);
                    setSize("M");
                    setPinCode("");
                    setStateName("");
                    setDistrict("");
                    setVillage("");
                    // fullName, surname, customerEmail will be re-populated by useEffect on 'user' change or stay as is.
                    setIsSubmitting(false);
                },
                prefill: {
                    name: `${fullName.trim()} ${surname.trim()}`,
                    email: customerEmail.trim(),
                    contact: "", // Add a contact number state if you collect it
                },
                theme: {
                    color: "#3399cc",
                },
                modal: {
                    ondismiss: async function () {
                        // This function is called if the user closes the Razorpay modal
                        console.log('Payment dismissed by user.');
                        alert("Payment was cancelled or failed. Please try again.");
                        if (firebaseOrderId) {
                            try {
                                // Update Firebase order status to "Payment Cancelled"
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

            // 4. Open Razorpay payment gateway
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error("Error during payment initiation:", error);
            alert(`An error occurred: ${error.message || "Please try again."}`);

            // Update Firebase order status to reflect initiation failure
            if (firebaseOrderId) {
                try {
                    await update(ref(database, `orders/${firebaseOrderId}`), {
                        status: "Payment Initiation Failed (Client-side Error)",
                        errorMessage: error.message,
                    });
                } catch (updateErr) {
                    console.error("Failed to update status after initiation error:", updateErr);
                }
            }
            setIsSubmitting(false);
        }
    };

    // Render loading or login message if not authenticated
    if (checkingStatus) {
        return (
            <section className="bg-black min-h-screen py-16 px-5 font-poppins text-blue-100 flex justify-center items-center">
                <p className="text-xl text-emerald-300">Checking authentication status...</p>
            </section>
        );
    }

    // Explicitly handle not logged in case to prevent purchase actions
    if (!loggedIn) {
        return (
            <section className="bg-black min-h-screen py-16 px-5 font-poppins text-blue-100 flex justify-center items-center">
                <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl">
                    <p className="text-2xl font-bold text-red-400 mb-6">You must be logged in to purchase products.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-300 transform hover:scale-105"
                    >
                        Go to Login Page
                    </button>
                    <p className="mt-4 text-gray-400">If you don't have an account, you can register there.</p>
                </div>
            </section>
        );
    }

    // Determine read-only status for user-related fields
    const isFullNameReadOnly = loggedIn && user?.displayName && user.displayName.split(' ')[0];
    const isSurnameReadOnly = loggedIn && user?.displayName && user.displayName.split(' ')[1];
    const isEmailReadOnly = loggedIn && user?.email; // Email is almost always present if loggedIn

    return (
        <section className="bg-black min-h-screen py-16 px-5 font-poppins text-blue-100">
            <div className="max-w-3xl mx-auto text-center mb-10">
                <h1 className="text-4xl font-bold mb-3 text-emerald-300 capitalize">
                    {category.replace("-", " ")}
                </h1>
                <p className="text-lg text-slate-400">
                    Discover our latest {category.replace("-", " ")} products.
                </p>
                {loggedIn && <p className="text-sm text-gray-400 mt-2">Logged in as: {user?.email}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {isLoading ? (
                    <p className="text-slate-400 col-span-full text-center">
                        Loading products...
                    </p>
                ) : products.length === 0 ? (
                    <p className="text-slate-400 col-span-full text-center">
                        No products found in this category.
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
                        <button
                            onClick={() => !isSubmitting && setSelectedProduct(null)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold"
                            disabled={isSubmitting} // Disable close button while submitting
                        >
                            &times;
                        </button>
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
                                    {/* Default options */}
                                    <option value="S">Small</option>
                                    <option value="M">Medium</option>
                                    <option value="L">Large</option>
                                    <option value="XL">XL</option>
                                    {/* Dynamic options from product, if any */}
                                    {selectedProduct.sizes && selectedProduct.sizes.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Customer Information Fields */}
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
                                    readOnly={isFullNameReadOnly} // Adjusted readOnly logic
                                />
                                {loggedIn && !isFullNameReadOnly && (
                                    <p className="text-xs text-yellow-400 mt-1">Your display name is not set. Please fill this in.</p>
                                )}
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
                                    readOnly={isSurnameReadOnly} // Adjusted readOnly logic
                                />
                                {loggedIn && !isSurnameReadOnly && (
                                    <p className="text-xs text-yellow-400 mt-1">Your display name is not set. Please fill this in.</p>
                                )}
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
                                    readOnly={isEmailReadOnly} // Adjusted readOnly logic
                                />
                            </div>
                            <div>
                                <label htmlFor="pinCode" className="block text-sm font-semibold mb-1 text-gray-300">Pin Code:</label>
                                <input
                                    id="pinCode"
                                    type="text"
                                    value={pinCode}
                                    onChange={(e) => setPinCode(e.target.value)}
                                    onBlur={fetchPincodeDetails} // Trigger pincode fetch on blur
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
                                {pincodeError && !stateName && <p className="text-xs text-yellow-400 mt-1">Please fill State manually.</p>}
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
                                {pincodeError && !district && <p className="text-xs text-yellow-400 mt-1">Please fill District manually.</p>}
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
                                <p className="text-xs text-gray-400 mt-1">Enter your specific village/locality name (not auto-filled).</p>
                            </div>
                        </div>

                        <p className="text-xl font-bold mb-6 text-emerald-50">
                            Total Price: ₹{(selectedProduct.price * quantity).toFixed(2) || "N/A"}
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

export default CategoryPage;