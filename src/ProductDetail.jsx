import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { database } from './firebase'; // Ensure correct path to firebase.js
import { ref, onValue, update, get } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import {
    MdOutlineLocalShipping,
    MdOutlineRestore,
    MdOutlineCreditCard,
    MdShoppingCart, // For cart icon
    MdOutlinePayment // For buy now icon
} from 'react-icons/md';
import { FaBoxOpen, FaRegLightbulb } from 'react-icons/fa'; // Added for feature highlights

const ProductDetail = () => {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [quantityToAdd, setQuantityToAdd] = useState(1);

    const auth = getAuth();

    // Effect for Firebase Authentication state changes
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribeAuth();
    }, [auth]);

    // Memoized function for Razorpay script loading
    const loadRazorpayScript = useCallback(() => {
        return new Promise((resolve) => {
            if (document.getElementById('razorpay-checkout-script')) {
                resolve(true); // Script already loaded
                return;
            }
            const script = document.createElement('script');
            script.id = 'razorpay-checkout-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => {
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

        setLoading(true); // Start loading when ID changes

        unsubscribeProductListener = onValue(
            productRef,
            (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setProduct({ id, ...data });

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
                            setLoading(false); // Finished loading similar products
                        },
                        (err) => {
                            console.error('Error fetching all products for similar items:', err);
                            // Not critical enough to set global error, but inform user
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

        // Cleanup function
        return () => {
            if (unsubscribeProductListener) unsubscribeProductListener();
            if (unsubscribeAllProductsListener) unsubscribeAllProductsListener();
        };
    }, [id]); // Dependency array includes 'id'

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

        const userCartItemRef = ref(database, `carts/${user.uid}/${product.id}`);

        try {
            const snapshot = await get(userCartItemRef);
            const existingItem = snapshot.val();

            let newQuantity = quantityToAdd;
            if (existingItem) {
                newQuantity += existingItem.quantity;
            }

            await update(userCartItemRef, {
                productTitle: product.title,
                productImage: product.image,
                price: parseFloat(product.price),
                brand: product.brand,
                size: product.size || 'N/A',
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

    // Handle "Buy Now" (direct Razorpay payment) functionality
    const handleBuyNow = async () => {
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

        const res = await loadRazorpayScript();
        if (!res) {
            return; // Error toast already shown by loadRazorpayScript
        }

        const totalAmount = (parseFloat(product.price) * quantityToAdd).toFixed(2);

        const options = {
            key: 'rzp_test_Wj5c933q6luams', // Replace with your actual Razorpay Key ID
            amount: totalAmount * 100,
            currency: 'INR',
            name: 'Vashudhara Fashion',
            description: `Purchase of ${product.title} (Qty: ${quantityToAdd})`,
            image: '/favicon.png', // Ensure this path is correct for your public folder
            handler: function (response) {
                toast.success('Payment successful! Payment ID: ' + response.razorpay_payment_id, {
                    position: 'top-center',
                });
                console.log('Razorpay Payment Response:', response);
                // Implement backend verification and order fulfillment here
            },
            prefill: {
                name: user?.displayName || 'Customer',
                email: user?.email || 'example@example.com',
            },
            theme: {
                color: '#16a34a',
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
            toast.error('Payment failed: ' + response.error.description, { position: 'top-center' });
            console.error('Razorpay Payment Error:', response.error);
        });
        rzp.on('modal.close', function () {
            toast.info('Payment process canceled.', { position: 'top-center' });
        });
        rzp.open();
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
                            loading="eager" // Prioritize loading for the main image
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
                                <p>
                                    <strong className="font-semibold text-gray-800">Category:</strong>{' '}
                                    {product.category
                                        ? product.category
                                            .replace(/-/g, ' ')
                                            .split(' ')
                                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                            .join(' ')
                                        : 'N/A'}
                                </p>
                                {product.size && (
                                    <p>
                                        <strong className="font-semibold text-gray-800">Size:</strong>{' '}
                                        {product.size}
                                    </p>
                                )}
                                {product.color && (
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
                                onClick={handleBuyNow}
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
                                to={`/product/${p.id}`}
                                key={p.id}
                                className="block group focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-lg"
                            >
                                <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-[1.03] hover:shadow-xl border border-gray-200">
                                    <div className="relative w-full h-56 bg-white flex items-center justify-center p-3">
                                        <img
                                            src={p.image || 'https://via.placeholder.com/300x220?text=No+Image'}
                                            alt={p.title || 'Product Image'}
                                            className="max-w-full max-h-full object-contain rounded-md"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                                            {p.title || 'Untitled Product'}
                                        </h3>
                                        <p className="text-green-700 font-bold text-xl mb-2">
                                            ₹ {parseFloat(p.price || 0).toFixed(2)}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-3">{p.brand || 'No Brand'}</p>
                                        <span className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full font-medium tracking-wide">
                                            {p.category
                                                ? p.category
                                                    .replace(/-/g, ' ')
                                                    .split(' ')
                                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(' ')
                                                : 'Uncategorized'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
            {/* --- End Similar Products Section --- */}

            {/* Back to Home link */}
            <div className="text-center mt-12 mb-6">
                <Link
                    to="/"
                    className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-300 text-lg hover:underline-offset-4"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H16a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default ProductDetail;