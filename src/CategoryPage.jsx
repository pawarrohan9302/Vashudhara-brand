import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue, query, orderByChild, equalTo, push, update, set, remove, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import useAuthStatus from "./hooks/useAuthStatus";
import loadScript from "./loadRazorpayScript";

// Define the mapping outside the component for better performance and readability
const CATEGORY_HEADINGS = {
    "mens-wear": "Earrings", // Adjusted based on common men's wear items
    "womens-wear": "Rings", // As requested, if this is truly what you meant for the main women's heading
    "accessories": "Bracelets",
    "rings": "Rings" // Assuming 'Rings' is a sub-category or a specific category now
    // Add more mappings as needed, e.g.:
    // "watches": "Luxury Watches",
    // "shoes": "Footwear Collection",
};

const CategoryPage = ({ category }) => {
    const { loggedIn, checkingStatus, user } = useAuthStatus();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState("M");

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

    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [userWishlist, setUserWishlist] = useState({});

    const RAZORPAY_KEY_ID = "rzp_test_Wj5c933q6luams"; // Your Razorpay Key ID

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

    useEffect(() => {
        if (user && loggedIn) {
            const wishlistRef = ref(database, `wishlists/${user.uid}`);
            const unsubscribeWishlist = onValue(wishlistRef, (snapshot) => {
                const data = snapshot.val();
                setUserWishlist(data || {});
            }, (error) => {
                console.error("Error fetching wishlist:", error);
            });
            return () => unsubscribeWishlist();
        } else {
            setUserWishlist({});
        }
    }, [user, loggedIn]);

    useEffect(() => {
        if (user) {
            setCustomerEmail(user.email || "");
            if (user.displayName) {
                const nameParts = user.displayName.split(' ');
                setFullName(nameParts[0] || "");
                setSurname(nameParts[1] || "");
            } else {
                setFullName("");
                setSurname("");
            }
        } else {
            setFullName("");
            setSurname("");
            setCustomerEmail("");
            setPinCode("");
            setStateName("");
            setDistrict("");
            setVillage("");
        }
    }, [user]);

    const fetchPincodeDetails = async () => {
        if (pinCode.length !== 6 || !/^\d{6}$/.test(pinCode)) {
            setPincodeError('Pincode must be a valid 6-digit number.');
            setStateName('');
            setDistrict('');
            return;
        }

        setLoadingPincode(true);
        setPincodeError('');

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

    const handleProductCardClick = (product) => {
        if (checkingStatus) {
            alert('Please wait while we check your login status.');
            return;
        }
        if (!loggedIn) {
            alert('Please log in to buy or add to wishlist.');
            navigate('/login');
            return;
        }
        setSelectedProduct(product);
        setShowSelectionModal(true);
    };

    const handleBuyNow = () => {
        setShowSelectionModal(false);
        setQuantity(1);
        setSize("M");
        setPinCode("");
        setStateName("");
        setDistrict("");
        setVillage("");
        setPincodeError('');
    };

    const handleAddToWishlist = async () => {
        if (!selectedProduct || !user?.uid) {
            alert("No product selected or user not logged in.");
            return;
        }

        const wishlistProductRef = ref(database, `wishlists/${user.uid}/${selectedProduct.id}`);

        try {
            const snapshot = await get(wishlistProductRef);

            if (snapshot.exists()) {
                alert(`${selectedProduct.title} is already in your wishlist!`);
            } else {
                await set(wishlistProductRef, {
                    id: selectedProduct.id,
                    title: selectedProduct.title,
                    image: selectedProduct.image,
                    price: selectedProduct.price,
                    category: selectedProduct.category,
                    brand: selectedProduct.brand || "N/A",
                    addedDate: new Date().toISOString(),
                });
                alert(`${selectedProduct.title} added to your wishlist!`);
            }
        } catch (error) {
            console.error("Error adding to wishlist:", error.code, error.message, error);
            alert(`Failed to add product to wishlist. Please try again. Error: ${error.message || 'Unknown error'}`);
        } finally {
            setShowSelectionModal(false);
            setSelectedProduct(null);
        }
    };

    const handleCreateOrder = async () => {
        setIsSubmitting(true);

        if (!user) {
            alert("You must be logged in to place an order.");
            setIsSubmitting(false);
            navigate('/login');
            return;
        }

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
            const ordersRef = ref(database, "orders");
            const newOrderRef = push(ordersRef);
            firebaseOrderId = newOrderRef.key;

            await set(newOrderRef, {
                id: firebaseOrderId,
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

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error("Error during payment initiation:", error);
            alert(`An error occurred: ${error.message || "Please try again."}`);

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

    const isFullNameReadOnly = loggedIn && user?.displayName && user.displayName.split(' ')[0];
    const isSurnameReadOnly = loggedIn && user?.displayName && user.displayName.split(' ')[1];
    const isEmailReadOnly = loggedIn && user?.email;

    const isProductInWishlist = (productId) => {
        return userWishlist && userWishlist[productId] !== undefined;
    };


    if (checkingStatus) {
        return (
            <section className="bg-white min-h-screen py-16 px-5 font-poppins text-gray-800 flex justify-center items-center">
                <p className="text-xl text-emerald-600">Checking authentication status...</p>
            </section>
        );
    }

    if (!loggedIn) {
        return (
            <section className="bg-white min-h-screen py-16 px-5 font-poppins text-gray-800 flex justify-center items-center">
                <div className="text-center p-8 bg-gray-100 rounded-lg shadow-xl">
                    <p className="text-2xl font-bold text-red-600 mb-6">You must be logged in to purchase products or add to wishlist.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-300 transform hover:scale-105"
                    >
                        Go to Login Page
                    </button>
                    <p className="mt-4 text-gray-600">If you don't have an account, you can register there.</p>
                </div>
            </section>
        );
    }

    // Determine the heading text based on the CATEGORY_HEADINGS map
    const displayHeading = CATEGORY_HEADINGS[category] || category.replace("-", " ");

    return (
        <section className="bg-white min-h-screen py-16 px-5 font-poppins text-gray-800">
            <div className="max-w-3xl mx-auto text-center mb-10">
                <h1 className="text-4xl font-bold mb-3 text-emerald-700 capitalize">
                    {displayHeading}
                </h1>
                <p className="text-lg text-slate-600">
                    Discover our latest {category.replace("-", " ")} products.
                </p>
                {loggedIn && <p className="text-sm text-gray-600 mt-2">Logged in as: {user?.email}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {isLoading ? (
                    <p className="text-slate-600 col-span-full text-center">
                        Loading products...
                    </p>
                ) : products.length === 0 ? (
                    <p className="text-slate-600 col-span-full text-center">
                        No products found in this category.
                    </p>
                ) : (
                    products.map((product) => (
                        <div
                            key={product.id}
                            className="relative bg-gray-100 rounded-3xl overflow-hidden shadow-lg shadow-emerald-300/30 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-emerald-300/60"
                            onClick={() => handleProductCardClick(product)}
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
                                View Options
                            </div>

                            <div className="p-6">
                                <h3 className="text-2xl mb-3 text-emerald-600 font-bold">
                                    {product.title}
                                </h3>
                                <p className="text-base text-gray-600 leading-normal">
                                    Brand: {product.brand || "N/A"}
                                </p>
                                <p className="text-xl font-bold mt-2 text-emerald-800">
                                    Price: ₹{product.price || "N/A"}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* --- NEW: Product Selection Modal (Buy Now or Add to Wishlist) --- */}
            {showSelectionModal && selectedProduct && (
                <div
                    className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50 p-5"
                    onClick={() => setShowSelectionModal(false)}
                >
                    <div
                        className="bg-gray-100 rounded-xl shadow-2xl w-full max-w-sm text-gray-800 p-6 flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold mb-4 text-center text-emerald-700">
                            {selectedProduct.title}
                        </h2>
                        <img
                            src={selectedProduct.image}
                            alt={selectedProduct.title}
                            className="w-40 h-40 object-contain rounded-lg mb-6"
                            loading="lazy"
                        />
                        <p className="text-xl font-bold mb-6 text-emerald-800">
                            Price: ₹{selectedProduct.price || "N/A"}
                        </p>

                        <button
                            onClick={handleBuyNow}
                            className="w-full bg-green-500 text-white py-3 rounded-full text-lg font-semibold mb-3 hover:bg-green-600 transition-colors duration-200"
                        >
                            Buy Now
                        </button>
                        <button
                            onClick={handleAddToWishlist}
                            className={`w-full py-3 rounded-full text-lg font-semibold transition-colors duration-200 ${isProductInWishlist(selectedProduct.id)
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "bg-purple-600 text-white hover:bg-purple-700"
                                }`}
                            disabled={isProductInWishlist(selectedProduct.id)}
                        >
                            {isProductInWishlist(selectedProduct.id) ? "Already in Wishlist" : "Add to Wishlist"}
                        </button>
                        <button
                            onClick={() => {
                                setShowSelectionModal(false);
                                setSelectedProduct(null);
                            }}
                            className="w-full bg-red-500 text-white py-3 rounded-full text-lg font-semibold mt-3 hover:bg-red-600 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* --- Existing Buy Modal (only shows if selectedProduct is set AND showSelectionModal is false) --- */}
            {selectedProduct && !showSelectionModal && (
                <div
                    className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50 p-5"
                    onClick={() => !isSubmitting && setSelectedProduct(null)}
                >
                    <div
                        className="bg-gray-100 rounded-xl shadow-2xl w-full max-w-md text-gray-800 p-6 flex flex-col max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => !isSubmitting && setSelectedProduct(null)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl font-bold"
                            disabled={isSubmitting}
                        >
                            &times;
                        </button>
                        <h2 className="text-3xl font-bold mb-5 text-center text-emerald-700">
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
                                <label htmlFor="quantity" className="block text-sm font-semibold mb-1 text-gray-600">Quantity:</label>
                                <input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="size" className="block text-sm font-semibold mb-1 text-gray-600">Size:</label>
                                <select
                                    id="size"
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 outline-none focus:border-emerald-500"
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

                        {/* Customer Information Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-semibold mb-1 text-gray-600">First Name:</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 outline-none focus:border-emerald-500"
                                    required
                                    readOnly={isFullNameReadOnly}
                                />
                                {loggedIn && !isFullNameReadOnly && (
                                    <p className="text-xs text-yellow-600 mt-1">Your display name is not set. Please fill this in.</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="surname" className="block text-sm font-semibold mb-1 text-gray-600">Last Name:</label>
                                <input
                                    id="surname"
                                    type="text"
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 outline-none focus:border-emerald-500"
                                    required
                                    readOnly={isSurnameReadOnly}
                                />
                                {loggedIn && !isSurnameReadOnly && (
                                    <p className="text-xs text-yellow-600 mt-1">Your display name is not set. Please fill this in.</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="customerEmail" className="block text-sm font-semibold mb-1 text-gray-600">Email:</label>
                                <input
                                    id="customerEmail"
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 outline-none focus:border-emerald-500"
                                    required
                                    placeholder="yourname@example.com"
                                    readOnly={isEmailReadOnly}
                                />
                            </div>
                            <div>
                                <label htmlFor="pinCode" className="block text-sm font-semibold mb-1 text-gray-600">Pin Code:</label>
                                <input
                                    id="pinCode"
                                    type="text"
                                    value={pinCode}
                                    onChange={(e) => setPinCode(e.target.value)}
                                    onBlur={fetchPincodeDetails}
                                    maxLength={6}
                                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 outline-none focus:border-emerald-500"
                                    required
                                />
                                {loadingPincode && <p className="text-sm text-blue-600 mt-1">Fetching address details...</p>}
                                {pincodeError && <p className="text-sm text-red-600 mt-1">{pincodeError}</p>}
                            </div>
                            <div>
                                <label htmlFor="stateName" className="block text-sm font-semibold mb-1 text-gray-600">State:</label>
                                <input
                                    id="stateName"
                                    type="text"
                                    value={stateName}
                                    onChange={(e) => setStateName(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 outline-none focus:border-emerald-500"
                                    required
                                />
                                {pincodeError && !stateName && <p className="text-xs text-yellow-600 mt-1">Please fill State manually.</p>}
                            </div>
                            <div>
                                <label htmlFor="district" className="block text-sm font-semibold mb-1 text-gray-600">District:</label>
                                <input
                                    id="district"
                                    type="text"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 outline-none focus:border-emerald-500"
                                    required
                                />
                                {pincodeError && !district && <p className="text-xs text-yellow-600 mt-1">Please fill District manually.</p>}
                            </div>
                            <div>
                                <label htmlFor="village" className="block text-sm font-semibold mb-1 text-gray-600">Village:</label>
                                <input
                                    id="village"
                                    type="text"
                                    value={village}
                                    onChange={(e) => setVillage(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>
                        </div>

                        <p className="text-2xl font-bold mb-6 text-emerald-800 text-center">
                            Total: ₹{(selectedProduct.price * quantity).toFixed(2)}
                        </p>

                        <button
                            onClick={handleCreateOrder}
                            disabled={isSubmitting}
                            className={`w-full py-3 rounded-full text-lg font-semibold transition-colors duration-200 ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                }`}
                        >
                            {isSubmitting ? "Processing Payment..." : "Proceed to Payment"}
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default CategoryPage;