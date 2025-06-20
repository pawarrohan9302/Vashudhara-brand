// src/ProductDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { database } from './firebase'; // Ensure correct path to firebase.js
import { ref, onValue, update, get, push, set } from 'firebase/database'; // Import push and set
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify'; // Make sure you have react-toastify installed
import {
    MdOutlineLocalShipping,
    MdOutlineRestore,
    MdOutlineCreditCard,
    MdShoppingCart,
    MdOutlinePayment
} from 'react-icons/md';
import { FaBoxOpen, FaRegLightbulb } from 'react-icons/fa';

const ProductDetail = () => {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [quantityToAdd, setQuantityToAdd] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');

    // State for extended customer information
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [village, setVillage] = useState('');
    const [showCustomerInfoModal, setShowCustomerInfoModal] = useState(false);

    const auth = getAuth();

    // Effect for Firebase Authentication state changes and pre-filling user data
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Pre-fill name and email if user is logged in
                const displayNameParts = currentUser.displayName ? currentUser.displayName.split(' ') : [];
                setFirstName(displayNameParts[0] || '');
                setLastName(displayNameParts.slice(1).join(' ') || '');
                setCustomerEmail(currentUser.email || '');

                // Optional: Fetch more user profile data if available in Firebase
                // This is a good place to load existing address/contact info if you store it in userProfiles
                // const userProfileRef = ref(database, `userProfiles/${currentUser.uid}`);
                // get(userProfileRef).then(snapshot => {
                //     if (snapshot.exists()) {
                //         const profile = snapshot.val();
                //         setCustomerPhone(profile.phone || '');
                //         setPinCode(profile.pinCode || '');
                //         setState(profile.state || '');
                //         setDistrict(profile.district || '');
                //         setVillage(profile.village || '');
                //     }
                // }).catch(err => console.error("Error fetching user profile:", err));
            } else {
                // Clear fields if user logs out
                setFirstName('');
                setLastName('');
                setCustomerEmail('');
                setCustomerPhone('');
                setPinCode('');
                setState('');
                setDistrict('');
                setVillage('');
            }
        });
        return () => unsubscribeAuth();
    }, [auth]);

    // Memoized function for Razorpay script loading
    const loadRazorpayScript = useCallback(() => {
        return new Promise((resolve) => {
            if (document.getElementById('razorpay-checkout-script')) {
                console.log("Razorpay script already present.");
                resolve(true); // Script already loaded
                return;
            }
            console.log("Loading Razorpay script...");
            const script = document.createElement('script');
            script.id = 'razorpay-checkout-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                console.log("Razorpay script loaded successfully.");
                resolve(true);
            };
            script.onerror = () => {
                console.error('Failed to load payment gateway script.');
                toast.error('Failed to load payment gateway script. Please try again.');
                resolve(false);
            };
            document.body.appendChild(script);
        });
    }, []);

    // Effect to fetch product details and then similar products
    useEffect(() => {
        if (!id) {
            setError('Product ID is missing.');
            setLoading(false);
            return;
        }

        const productRef = ref(database, `products/${id}`);
        const allProductsRef = ref(database, 'products');

        let unsubscribeProductListener;
        let unsubscribeAllProductsListener;

        setLoading(true);

        unsubscribeProductListener = onValue(
            productRef,
            (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setProduct({ id, ...data });
                    // Set default size if product has sizes and no size is selected yet
                    if (data.sizes && data.sizes.length > 0 && !selectedSize) {
                        setSelectedSize(data.sizes[0]);
                    }

                    unsubscribeAllProductsListener = onValue(
                        allProductsRef,
                        (allSnapshot) => {
                            const allData = allSnapshot.val();
                            if (allData) {
                                const loadedAllProducts = Object.entries(allData).map(
                                    ([prodId, prod]) => ({
                                        id: prodId,
                                        ...prod,
                                    })
                                );
                                const filteredSimilar = loadedAllProducts
                                    .filter((p) => p.category === data.category && p.id !== id)
                                    .slice(0, 4);
                                setSimilarProducts(filteredSimilar);
                            } else {
                                setSimilarProducts([]);
                            }
                            setLoading(false);
                        },
                        (err) => {
                            console.error('Error fetching all products for similar items:', err);
                            toast.warn('Could not load similar products.');
                            setLoading(false);
                        }
                    );
                } else {
                    setProduct(null);
                    setError('Product not found.');
                    setSimilarProducts([]);
                    setLoading(false);
                }
            },
            (err) => {
                console.error('Error fetching product details:', err);
                setError('Failed to load product details. Please try again later.');
                setLoading(false);
            }
        );

        // Cleanup function for Firebase listeners
        return () => {
            if (unsubscribeProductListener) unsubscribeProductListener();
            if (unsubscribeAllProductsListener) unsubscribeAllProductsListener();
        };
    }, [id, selectedSize]); // Re-run if ID or selectedSize changes

    // Handle "Add to Cart" functionality
    const handleAddToCart = async () => {
        if (!user) {
            toast.error('Please log in to add items to your cart.', { position: 'top-center' });
            return;
        }
        if (!product) {
            toast.error('Cannot add an unknown product to cart.');
            return;
        }
        if (quantityToAdd <= 0) {
            toast.error('Quantity must be at least 1.');
            return;
        }
        // Validate size if product has sizes
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            toast.error('Please select a size before adding to cart.');
            return;
        }

        // Use a combined ID for cart items to differentiate by product and size
        const cartItemId = selectedSize ? `${product.id}_${selectedSize}` : product.id;
        const userCartItemRef = ref(database, `carts/${user.uid}/${cartItemId}`);

        try {
            const snapshot = await get(userCartItemRef);
            const existingItem = snapshot.val();

            let newQuantity = quantityToAdd;
            if (existingItem) {
                newQuantity += existingItem.quantity;
                toast.info(`Updated quantity for "${product.title}" in your cart.`);
            }

            await update(userCartItemRef, {
                productId: product.id, // Store original product ID
                productTitle: product.title,
                productImage: product.image,
                price: parseFloat(product.price),
                brand: product.brand,
                size: selectedSize || product.size || 'N/A', // Use selectedSize if available
                color: product.color || 'N/A',
                quantity: newQuantity,
                addedAt: new Date().toISOString(),
            });
            toast.success(`${quantityToAdd} item(s) of "${product.title}" added to cart!`, {
                position: 'bottom-right',
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add item to cart. Please try again.');
        }
    };

    // New function to handle initiation of the buy now process (show form)
    const initiateBuyNow = () => {
        if (!user) {
            toast.error('Please log in to make a purchase.', { position: 'top-center' });
            return;
        }
        if (!product) {
            toast.error('Cannot purchase an unknown product.');
            return;
        }
        if (quantityToAdd <= 0) {
            toast.error('Quantity must be at least 1 for purchase.');
            return;
        }
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            toast.error('Please select a size before proceeding to purchase.');
            return;
        }
        setShowCustomerInfoModal(true); // Show the customer info form
    };

    // Handle "Buy Now" (direct Razorpay payment) functionality - now called AFTER info is collected
    const handleProceedToPayment = async (e) => {
        e.preventDefault(); // Prevent default form submission

        console.log("Initiating handleProceedToPayment...");

        // All required validations
        if (!firstName.trim() || !lastName.trim() || !customerEmail.trim() || !customerPhone.trim() || !pinCode.trim() || !state.trim() || !district.trim() || !village.trim()) {
            toast.error('Please fill in all required customer details (Name, Email, Phone, Pin Code, State, District, Village).');
            console.warn("Validation failed: Missing customer details.");
            return;
        }
        // Basic email format validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
            toast.error('Please enter a valid email address.');
            console.warn("Validation failed: Invalid email format.");
            return;
        }
        // Basic phone number format validation (e.g., 10 digits for India)
        if (!/^\d{10}$/.test(customerPhone)) {
            toast.error('Please enter a valid 10-digit phone number.');
            console.warn("Validation failed: Invalid phone number format.");
            return;
        }
        // Basic pin code format validation (e.g., 6 digits for India)
        if (!/^\d{6}$/.test(pinCode)) {
            toast.error('Please enter a valid 6-digit Pin Code.');
            console.warn("Validation failed: Invalid Pin Code format.");
            return;
        }

        console.log("Customer Info Validated. Hiding modal.");
        setShowCustomerInfoModal(false); // Hide the modal

        console.log("Attempting to load Razorpay script...");
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            console.error("Razorpay script failed to load. Aborting payment.");
            return; // Error toast already shown by loadRazorpayScript
        }
        console.log("Razorpay script loaded successfully. Proceeding with payment setup.");


        const totalAmount = (parseFloat(product.price) * quantityToAdd).toFixed(2);
        console.log("Calculated Total Amount (INR):", totalAmount);

        // Ensure window.Razorpay is available before proceeding
        if (typeof window.Razorpay === 'undefined') {
            toast.error('Razorpay is not loaded. Please try again or refresh the page.');
            console.error('window.Razorpay is undefined after script load attempt.');
            return;
        }

        const options = {
            key: 'rzp_test_Wj5c933q6luams', // Replace with your actual Razorpay Key ID
            amount: Math.round(totalAmount * 100), // Amount in paisa, must be an integer
            currency: 'INR',
            name: 'Vashudhara Fashion',
            description: `Purchase of ${product.title} (Qty: ${quantityToAdd}, Size: ${selectedSize || product.size || 'N/A'})`,
            image: '/favicon.png', // Ensure this path is correct for your public folder
            handler: function (response) {
                toast.success('Payment successful! Payment ID: ' + response.razorpay_payment_id, {
                    position: 'top-center',
                });
                console.log('Razorpay Payment Response:', response);

                // --- START: Firebase Save Logic ---
                if (user && product) { // Ensure user and product are available
                    const ordersRef = ref(database, 'orders'); // Reference to the 'orders' path
                    const newOrderRef = push(ordersRef); // Generates a unique ID for the new order

                    const orderDetails = {
                        orderId: newOrderRef.key, // Save the unique order ID
                        userId: user.uid,
                        productId: product.id,
                        productTitle: product.title,
                        productImage: product.image,
                        price: parseFloat(product.price),
                        quantity: quantityToAdd,
                        size: selectedSize || product.size || 'N/A',
                        color: product.color || 'N/A',
                        totalAmount: parseFloat(totalAmount),
                        customer: {
                            firstName: firstName,
                            lastName: lastName,
                            email: customerEmail,
                            phone: customerPhone,
                            address: {
                                village: village,
                                district: district,
                                state: state,
                                pinCode: pinCode,
                            },
                        },
                        payment: {
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id, // If you integrate with your backend to create Razorpay orders
                            razorpaySignature: response.razorpay_signature, // For verification on backend
                            method: 'Razorpay', // Or 'Card', 'UPI', etc. based on actual payment method
                        },
                        orderStatus: 'Processing', // Initial status, you might have different statuses
                        orderedAt: new Date().toISOString(), // Timestamp for the order
                    };

                    set(newOrderRef, orderDetails)
                        .then(() => {
                            console.log("Order details successfully saved to Firebase:", orderDetails);
                            toast.info("Your order has been placed successfully!");
                            // Optionally, clear cart or redirect user here
                        })
                        .catch(error => {
                            console.error("Error saving order details to Firebase:", error);
                            toast.error("Order placed but failed to save details. Please contact support with Payment ID: " + response.razorpay_payment_id);
                        });
                } else {
                    console.warn("Cannot save order: User not logged in or product data missing.");
                    toast.error("Payment successful, but order details could not be saved. Please contact support.");
                }
                // --- END: Firebase Save Logic ---
            },
            prefill: {
                name: `${firstName} ${lastName}`,
                email: customerEmail,
                contact: customerPhone,
            },
            notes: {
                shipping_address: `${village}, ${district}, ${state} - ${pinCode}`,
                product_id: product.id,
                user_id: user.uid,
            },
            theme: {
                color: '#16a34a', // A pleasant green
            },
        };

        console.log("Razorpay Options constructed:", options);

        try {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error('Payment failed: ' + response.error.description, { position: 'top-center' });
                console.error('Razorpay Payment Error:', response.error);
                // Optionally save failed payment attempt to Firebase for analysis
            });
            rzp.on('modal.close', function () {
                toast.info('Payment process canceled.', { position: 'top-center' });
                console.log("Razorpay modal closed by user.");
            });
            console.log("Opening Razorpay modal...");
            rzp.open();
        } catch (error) {
            console.error('Error creating or opening Razorpay instance:', error);
            toast.error('An error occurred while preparing payment. Please check console for details.');
        }
    };

    // Conditional Rendering for Loading, Error, or No Product Found
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
                <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
                    <p className="mt-4 text-xl text-gray-700 font-semibold">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 text-red-700 p-4">
                <p className="text-2xl font-bold mb-4">{error}</p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300"
                >
                    Go to Home
                </Link>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-yellow-50 text-yellow-700 p-4">
                <p className="text-2xl font-bold mb-4">Product details not available.</p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-700 transition duration-300"
                >
                    Go to Home
                </Link>
            </div>
        );
    }

    // Main Layout for Displaying Product Details and Similar Products
    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-poppins">
            <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden p-6 md:p-10 transform transition-all duration-300 hover:shadow-3xl">
                <div className="flex flex-col md:flex-row gap-10">
                    {/* Left side: Product Image */}
                    <div className="md:w-1/2 flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl p-6 shadow-inner">
                        <img
                            src={product.image || 'https://via.placeholder.com/600x600?text=No+Image'}
                            alt={product.title || 'Product Image'}
                            className="max-w-full max-h-[500px] object-contain rounded-lg transform transition-transform duration-500 hover:scale-105"
                            loading="eager"
                        />
                    </div>

                    {/* Right side: Product Details Content */}
                    <div className="md:w-1/2 flex flex-col justify-between">
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                                {product.title || 'Unknown Product'}
                            </h1>
                            <p className="text-3xl font-bold text-green-700 mb-6">
                                ₹ {parseFloat(product.price || 0).toFixed(2)}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-6 text-lg text-gray-700">
                                <p>
                                    <strong className="font-semibold text-gray-800">Brand:</strong>{' '}
                                    {product.brand || 'N/A'}
                                </p>
                                {/* This is the line where "Category:" was removed */}

                                {product.color && ( // Display color only if it exists
                                    <p>
                                        <strong className="font-semibold text-gray-800">Color:</strong>{' '}
                                        {product.color}
                                    </p>
                                )}
                            </div>

                            {product.description && (
                                <div className="mt-6 border-t border-b border-gray-200 py-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">About this item</h3>
                                    <p className="text-gray-600 leading-relaxed text-base">
                                        {product.description}
                                    </p>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            <div className="mt-8 flex items-center space-x-5">
                                <label htmlFor="quantity" className="text-xl font-bold text-gray-800">
                                    Quantity:
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    min="1"
                                    value={quantityToAdd}
                                    onChange={(e) => setQuantityToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-24 p-3 border-2 border-gray-300 rounded-lg text-center text-lg font-medium focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition duration-200"
                                    aria-label="Select quantity"
                                />
                            </div>

                            {/* Size Selector (newly added/updated) */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div className="mt-6">
                                    <label className="block text-xl font-bold text-gray-800 mb-3">
                                        Size: <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {product.sizes.map((sizeOption) => (
                                            <button
                                                key={sizeOption}
                                                type="button"
                                                onClick={() => setSelectedSize(sizeOption)}
                                                className={`px-5 py-2 border rounded-lg text-lg font-medium transition duration-200
                                                ${selectedSize === sizeOption
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                                                    }
                                                    focus:outline-none focus:ring-4 focus:ring-blue-200`}
                                            >
                                                {sizeOption}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Action buttons (Add to Cart, Buy Now) */}
                        <div className="mt-10 flex flex-col sm:flex-row gap-5">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 flex items-center justify-center px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
                                aria-label="Add to cart"
                            >
                                <MdShoppingCart className="w-6 h-6 mr-3" /> Add to Cart
                            </button>
                            <button
                                onClick={initiateBuyNow}
                                className="flex-1 flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                                aria-label="Buy now"
                            >
                                <MdOutlinePayment className="w-6 h-6 mr-3" /> Buy Now
                            </button>
                        </div>

                        {/* New Section: Shipping & Returns Info */}
                        <div className="mt-10 pt-6 border-t-2 border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-5">Why Shop With Us?</h3>
                            <div className="space-y-4">
                                <div className="flex items-center text-gray-800 text-lg">
                                    <MdOutlineLocalShipping className="w-8 h-8 mr-4 text-blue-500 flex-shrink-0" />
                                    <span>
                                        <strong className="font-semibold">Fast Shipping:</strong> Orders processed in
                                        <span className="font-bold text-blue-600"> 3-5 business days</span>.
                                    </span>
                                </div>
                                <div className="flex items-center text-gray-800 text-lg">
                                    <MdOutlineRestore className="w-8 h-8 mr-4 text-green-500 flex-shrink-0" />
                                    <span>
                                        <strong className="font-semibold">Hassle-Free Returns:</strong> Easy returns
                                        within <span className="font-bold text-green-600">30 days</span> of purchase.
                                    </span>
                                </div>
                                <div className="flex items-center text-gray-800 text-lg">
                                    <MdOutlineCreditCard className="w-8 h-8 mr-4 text-purple-500 flex-shrink-0" />
                                    <span>
                                        <strong className="font-semibold">Secure Payments:</strong> All transactions
                                        are <span className="font-bold text-purple-600">securely processed</span>.
                                    </span>
                                </div>
                                <div className="flex items-center text-gray-800 text-lg">
                                    <FaBoxOpen className="w-7 h-7 mr-4 text-orange-500 flex-shrink-0" />
                                    <span>
                                        <strong className="font-semibold">Quality Assured:</strong> Every product is{' '}
                                        <span className="font-bold text-orange-600">inspected for quality</span>.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            ---

            {/* --- Similar Products Section --- */}
            {similarProducts.length > 0 && (
                <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden p-6 md:p-10 mt-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center border-b-2 pb-4 border-gray-200">
                        More Like This
                        <FaRegLightbulb className="inline-block ml-3 text-yellow-500 transform -translate-y-1" />
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {similarProducts.map((p) => (
                            <Link
                                key={p.id}
                                to={`/product/${p.id}`}
                                className="block bg-gray-50 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                onClick={() => window.scrollTo(0, 0)} // Scroll to top on similar product click
                            >
                                <img
                                    src={p.image || 'https://via.placeholder.com/400x400?text=No+Image'}
                                    alt={p.title || 'Product Image'}
                                    className="w-full h-48 object-cover rounded-t-lg"
                                />
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">
                                        {p.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2">{p.brand}</p>
                                    <p className="text-xl font-bold text-green-700">
                                        ₹{parseFloat(p.price).toFixed(2)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* --- Customer Information Modal --- */}
            {showCustomerInfoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Enter Your Details</h2>
                        <form onSubmit={handleProceedToPayment}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="customerEmail"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="customerPhone"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    maxLength="10"
                                    minLength="10"
                                    pattern="\d{10}"
                                    title="Please enter a 10-digit phone number"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="pinCode" className="block text-sm font-medium text-gray-700 mb-1">
                                        Pin Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="pinCode"
                                        value={pinCode}
                                        onChange={(e) => setPinCode(e.target.value)}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        maxLength="6"
                                        minLength="6"
                                        pattern="\d{6}"
                                        title="Please enter a 6-digit Pin Code"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="state"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                                        District <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="district"
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="village" className="block text-sm font-medium text-gray-700 mb-1">
                                        Village/Locality <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="village"
                                        value={village}
                                        onChange={(e) => setVillage(e.target.value)}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCustomerInfoModal(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-100 transition duration-150"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-150"
                                >
                                    Proceed to Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;