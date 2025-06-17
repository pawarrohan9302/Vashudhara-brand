import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue, push, update, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import useAuthStatus from "./hooks/useAuthStatus";
import loadScript from "./loadRazorpayScript";

const Collections = () => {
    const { loggedIn, checkingStatus, user } = useAuthStatus();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null); // For "Buy Now"
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState("M");

    // We no longer need a local `cartItems` state here,
    // as the cart will be read directly from Firebase by the Cart component.
    // However, we might want a local state just for the cart count in this component.
    const [cartItemCount, setCartItemCount] = useState(0);


    // Initialize state variables with logged-in user data if available
    const [fullName, setFullName] = useState(user?.displayName?.split(' ')[0] || "");
    const [surname, setSurname] = useState(user?.displayName?.split(' ')[1] || "");
    const [pinCode, setPinCode] = useState("");
    const [stateName, setStateName] = useState("");
    const [district, setDistrict] = useState("");
    const [village, setVillage] = useState("");
    const [customerEmail, setCustomerEmail] = useState(user?.email || "");

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingPincode, setLoadingPincode] = useState(false);
    const [pincodeError, setPincodeError] = useState('');

    const RAZORPAY_KEY_ID = "rzp_test_Wj5c933q6luams"; // Your actual test or live key

    // Effect for fetching all products
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

            // --- NEW: Listen to user's cart for real-time count ---
            const userCartRef = ref(database, `carts/${user.uid}`);
            const unsubscribeCart = onValue(userCartRef, (snapshot) => {
                const cartData = snapshot.val();
                if (cartData) {
                    const count = Object.values(cartData).reduce((total, item) => total + item.quantity, 0);
                    setCartItemCount(count);
                } else {
                    setCartItemCount(0);
                }
            }, (error) => {
                console.error("Error fetching cart count:", error);
                setCartItemCount(0);
            });

            return () => unsubscribeCart(); // Cleanup cart listener
        } else {
            // Clear fields if user logs out or is not logged in
            setFullName("");
            setSurname("");
            setCustomerEmail("");
            setPinCode("");
            setStateName("");
            setDistrict("");
            setVillage("");
            setCartItemCount(0); // Clear cart count if not logged in
        }
    }, [user]); // Re-run when user changes

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
                setPincodeError('');
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

    // Handler when a product's "Buy Now" button is clicked
    const handleBuyNowClick = (product) => {
        if (checkingStatus) {
            alert('Please wait while we check your login status.');
            return;
        }
        if (!loggedIn) {
            alert('Please log in to place an order.');
            navigate('/login');
            return;
        }

        setSelectedProduct(product);
        setQuantity(1);
        setSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M");
        setPinCode("");
        setStateName("");
        setDistrict("");
        setVillage("");
        setPincodeError('');
    };

    // --- MODIFIED: Handler for Add to Cart button (Firebase Integration) ---
    const handleAddToCart = async (product) => {
        if (checkingStatus) {
            alert('Please wait while we check your login status.');
            return;
        }
        if (!loggedIn || !user) {
            alert('Please log in to add items to your cart.');
            navigate('/login');
            return;
        }

        const userCartRef = ref(database, `carts/${user.uid}/${product.id}`); // Unique path for each product in user's cart

        try {
            // Fetch current item details from cart (if it exists)
            onValue(userCartRef, async (snapshot) => {
                const existingCartItem = snapshot.val();

                if (existingCartItem) {
                    // Item exists, update quantity
                    await update(userCartRef, {
                        quantity: existingCartItem.quantity + 1,
                        addedAt: new Date().toISOString() // Update timestamp
                    });
                    alert(`${product.title} quantity updated to ${existingCartItem.quantity + 1} in cart!`);
                } else {
                    // Item doesn't exist, add new item
                    await set(userCartRef, {
                        productId: product.id,
                        productTitle: product.title,
                        productImage: product.image,
                        price: product.price,
                        brand: product.brand || 'N/A',
                        size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M", // Default size for initial add
                        quantity: 1,
                        addedAt: new Date().toISOString()
                    });
                    alert(`${product.title} added to cart!`);
                }
            }, { onlyOnce: true }); // Use onlyOnce to prevent continuous listening here
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Failed to add item to cart. Please try again.");
        }
    };

    // Handler for initiating the Razorpay order (for single item "Buy Now" flow)
    const handleCreateOrder = async () => {
        setIsSubmitting(true);

        if (!user) {
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

        let firebaseOrderId = null;

        try {
            // 1. Save order to Firebase with "Payment Pending" status
            // IMPORTANT: This path is for "orders", not "carts"
            // We're storing orders under the user's UID for easy retrieval in the Cart/Orders component
            const userOrdersRef = ref(database, `orders/${user.uid}`);
            const newOrderRef = push(userOrdersRef); // Generates a unique ID under the user's orders
            firebaseOrderId = newOrderRef.key;

            await set(newOrderRef, {
                id: firebaseOrderId, // Store the generated key as an ID within the object
                userId: user.uid,
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
                status: "Payment Pending",
                paymentMethod: "Razorpay",
                trackingUpdates: [],
            });
            console.log("Order saved to Firebase with ID:", firebaseOrderId);

            // 2. Load Razorpay SDK
            const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

            if (!res) {
                alert("Razorpay SDK failed to load. Please check your internet connection.");
                setIsSubmitting(false);
                if (firebaseOrderId) {
                    await update(ref(database, `orders/${user.uid}/${firebaseOrderId}`), { // Corrected path
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
                name: "Vashudhara Store",
                description: `Order for ${selectedProduct.title}`,
                image: "https://via.placeholder.com/100x100?text=Shop+Logo",
                notes: {
                    firebaseOrderId: firebaseOrderId,
                    productTitle: selectedProduct.title,
                    customerName: `${fullName.trim()} ${surname.trim()}`,
                    customerEmail: customerEmail.trim(),
                    pinCode: pinCode.trim(),
                    address: `${village.trim()}, ${district.trim()}, ${stateName.trim()} - ${pinCode.trim()}`,
                    product_id: selectedProduct.id,
                    user_id: user.uid,
                },
                handler: async function (response) {
                    console.log("Payment successful:", response);
                    alert("Payment successful! Your order has been placed.");

                    if (firebaseOrderId) {
                        try {
                            await update(ref(database, `orders/${user.uid}/${firebaseOrderId}`), { // Corrected path
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

                    setSelectedProduct(null);
                    setQuantity(1);
                    setSize("M");
                    setPinCode("");
                    setStateName("");
                    setDistrict("");
                    setVillage("");
                    setIsSubmitting(false);
                },
                prefill: {
                    name: `${fullName.trim()} ${surname.trim()}`,
                    email: customerEmail.trim(),
                    contact: "",
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
                                await update(ref(database, `orders/${user.uid}/${firebaseOrderId}`), { // Corrected path
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

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error("Error during payment initiation:", error);
            alert(`An error occurred: ${error.message || "Please try again."}`);

            if (firebaseOrderId) {
                try {
                    await update(ref(database, `orders/${user.uid}/${firebaseOrderId}`), { // Corrected path
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

    const isFullNameReadOnly = loggedIn && user?.displayName && user.displayName.split(' ')[0];
    const isSurnameReadOnly = loggedIn && user?.displayName && user.displayName.split(' ')[1];
    const isEmailReadOnly = loggedIn && user?.email;

    if (checkingStatus) {
        return (
            <section className="bg-black min-h-screen py-16 px-5 font-poppins text-blue-100 flex justify-center items-center">
                <p className="text-xl text-emerald-300">Checking authentication status...</p>
            </section>
        );
    }

    if (!loggedIn) {
        return (
            <section className="bg-black min-h-screen py-16 px-5 font-poppins text-blue-100 flex justify-center items-center">
                <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl">
                    <p className="text-2xl font-bold text-red-400 mb-6">You must be logged in to access collections or add to cart.</p>
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

    return (
        <section className="bg-black min-h-screen py-16 px-5 font-poppins text-blue-100">
            <div className="max-w-3xl mx-auto text-center mb-10">
                <h1 className="text-4xl font-bold mb-3 text-emerald-300 capitalize">
                    Our Collections
                </h1>
                <p className="text-lg text-slate-400">
                    Explore all our amazing products.
                </p>
                {loggedIn && <p className="text-sm text-gray-400 mt-2">Logged in as: {user?.email}</p>}
                <div className="mt-4 text-right">
                    <button
                        onClick={() => navigate('/cart')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
                    >
                        🛒 Go to Cart ({cartItemCount})
                    </button>
                </div>
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
                            className="relative bg-gray-800 rounded-3xl overflow-hidden shadow-lg shadow-emerald-700/30 transition-all duration-300 hover:scale-105 hover:shadow-emerald-700/60"
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
                                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="flex-1 bg-yellow-500 text-black py-2 rounded-full text-md font-semibold hover:bg-yellow-600 transition-colors duration-200"
                                    >
                                        Add to Cart 🛒
                                    </button>
                                    <button
                                        onClick={() => handleBuyNowClick(product)}
                                        className="flex-1 bg-green-500 text-black py-2 rounded-full text-md font-semibold hover:bg-green-600 transition-colors duration-200"
                                    >
                                        Buy Now
                                    </button>
                                </div>
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
                            disabled={isSubmitting}
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
                                    {selectedProduct.sizes && selectedProduct.sizes.length > 0 ? (
                                        selectedProduct.sizes.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="S">Small</option>
                                            <option value="M">Medium</option>
                                            <option value="L">Large</option>
                                            <option value="XL">XL</option>
                                        </>
                                    )}
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
                                    readOnly={isFullNameReadOnly}
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
                                    readOnly={isSurnameReadOnly}
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
                                    readOnly={isEmailReadOnly}
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

export default Collections;