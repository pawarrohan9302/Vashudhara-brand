import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { database, storage } from './firebase'; // Assuming correct path to your Firebase config
import { ref, onValue, update, get, push, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import {
    MdOutlineLocalShipping,
    MdOutlineRestore,
    MdOutlineCreditCard,
    MdShoppingCart,
    MdOutlinePayment,
    MdStar,
    MdStarOutline,
    MdClose,
    MdCameraAlt // For review image upload
} from 'react-icons/md';
import { FaBoxOpen, FaRegLightbulb, FaUserCircle } from 'react-icons/fa';

const ProductDetail = () => {
    const { id: productId } = useParams();

    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [quantityToAdd, setQuantityToAdd] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');

    // Review states
    const [productReviews, setProductReviews] = useState([]);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewImage, setReviewImage] = useState(null);
    const [reviewImagePreview, setReviewImagePreview] = useState(null);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [showAllReviews, setShowAllReviews] = useState(false); // This can still be used for showing all reviews if needed

    // NEW STATE: To control which section is open. 'none' means all are closed.
    const [openSection, setOpenSection] = useState('none'); // Can be 'reviews', 'shipping', or 'none'

    // State for extended customer information (pre-filled if logged in)
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [village, setVillage] = useState('');
    const [showCustomerInfoModal, setShowCustomerInfoModal] = useState(false);

    const fileInputRef = useRef(null);
    const auth = getAuth();

    // Effect for Firebase Authentication state changes and pre-filling user data
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                const displayNameParts = user.displayName ? user.displayName.split(' ') : [];
                setFirstName(displayNameParts[0] || '');
                setLastName(displayNameParts.slice(1).join(' ') || '');
                setCustomerEmail(user.email || '');
                // You might want to fetch phone, pincode, address from user profile in Firebase if stored
                // For now, these will remain empty unless explicitly set by user.
            } else {
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
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.id = 'razorpay-checkout-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
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

    // Effect to fetch product details and reviews
    useEffect(() => {
        if (!productId) {
            setError('Product ID is missing.');
            setLoading(false);
            return;
        }

        const productRef = ref(database, `products/${productId}`);
        const reviewsRef = ref(database, `reviews/${productId}`);
        const allProductsRef = ref(database, 'products');

        let unsubscribeProductListener;
        let unsubscribeReviewsListener;
        let unsubscribeAllProductsListener;

        setLoading(true);

        unsubscribeProductListener = onValue(
            productRef,
            (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setProduct({ id: productId, ...data });
                    // Only set selectedSize if product has sizes and it's not already selected
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
                                    .filter((p) => p.category === data.category && p.id !== productId)
                                    .slice(0, 4); // Show up to 4 similar products
                                setSimilarProducts(filteredSimilar);
                            } else {
                                setSimilarProducts([]);
                            }
                            setLoading(false); // Set loading to false after both product and similar products are fetched
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

        // Listen for reviews for this product
        unsubscribeReviewsListener = onValue(
            reviewsRef,
            (snapshot) => {
                const reviewsData = snapshot.val();
                if (reviewsData) {
                    const loadedReviews = Object.entries(reviewsData).map(([reviewId, review]) => ({
                        id: reviewId,
                        ...review,
                    }));
                    setProductReviews(loadedReviews);

                    const total = loadedReviews.reduce((sum, review) => sum + review.rating, 0);
                    setAverageRating(loadedReviews.length > 0 ? (total / loadedReviews.length) : 0);
                    setTotalReviews(loadedReviews.length);

                } else {
                    setProductReviews([]);
                    setAverageRating(0);
                    setTotalReviews(0);
                }
            },
            (err) => {
                console.error('Error fetching product reviews:', err);
                toast.warn('Could not load product reviews.');
            }
        );

        return () => {
            if (unsubscribeProductListener) unsubscribeProductListener();
            if (unsubscribeReviewsListener) unsubscribeReviewsListener();
            if (unsubscribeAllProductsListener) unsubscribeAllProductsListener();
        };
    }, [productId, selectedSize]); // Dependency on selectedSize to re-evaluate default selection

    const handleAddToCart = async () => {
        if (!currentUser) {
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
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            toast.error('Please select a size before adding to cart.');
            return;
        }

        const cartItemId = selectedSize ? `${product.id}_${selectedSize}` : product.id;
        const userCartItemRef = ref(database, `carts/${currentUser.uid}/${cartItemId}`);

        try {
            const snapshot = await get(userCartItemRef);
            const existingItem = snapshot.val();

            let newQuantity = quantityToAdd;
            if (existingItem) {
                newQuantity += existingItem.quantity;
                toast.info(`Updated quantity for "${product.title}" in your cart.`);
            }

            await update(userCartItemRef, {
                productId: product.id,
                productTitle: product.title,
                productImage: product.image,
                price: parseFloat(product.price),
                brand: product.brand,
                size: selectedSize || product.size || 'N/A', // Ensure size is always recorded
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

    const initiateBuyNow = () => {
        if (!currentUser) {
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
        setShowCustomerInfoModal(true);
    };

    const handleProceedToPayment = async (e) => {
        e.preventDefault();

        if (!firstName.trim() || !lastName.trim() || !customerEmail.trim() || !customerPhone.trim() || !pinCode.trim() || !state.trim() || !district.trim() || !village.trim()) {
            toast.error('Please fill in all required customer details (Name, Email, Phone, Pin Code, State, District, Village).');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
            toast.error('Please enter a valid email address.');
            return;
        }
        if (!/^\d{10}$/.test(customerPhone)) {
            toast.error('Please enter a valid 10-digit phone number.');
            return;
        }
        if (!/^\d{6}$/.test(pinCode)) {
            toast.error('Please enter a valid 6-digit Pin Code.');
            return;
        }

        setShowCustomerInfoModal(false);

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            console.error("Razorpay script failed to load. Aborting payment.");
            return;
        }

        const productPrice = parseFloat(product.price || 0);
        const totalAmountInRupees = productPrice * quantityToAdd;
        const totalAmountInPaisa = Math.round(totalAmountInRupees * 100);

        if (typeof window.Razorpay === 'undefined') {
            toast.error('Razorpay is not loaded. Please try again or refresh the page.');
            console.error('window.Razorpay is undefined after script load attempt.');
            return;
        }

        const options = {
            key: 'rzp_test_Wj5c933q6luams', // Replace with your actual Razorpay Key ID
            amount: totalAmountInPaisa,
            currency: 'INR',
            name: 'Vashudhara Fashion',
            description: `Purchase of ${product.title} (Qty: ${quantityToAdd}, Size: ${selectedSize || product.size || 'N/A'})`,
            image: '/favicon.png', // Your logo
            handler: function (response) {
                toast.success('Payment successful! Payment ID: ' + response.razorpay_payment_id, {
                    position: 'top-center',
                });
                console.log('Razorpay Payment Response:', response);

                if (currentUser && product) {
                    const ordersRef = ref(database, 'orders');
                    const newOrderRef = push(ordersRef);

                    const orderDetails = {
                        orderId: newOrderRef.key,
                        userId: currentUser.uid,
                        productId: product.id,
                        productTitle: product.title,
                        productImage: product.image,
                        price: productPrice,
                        quantity: quantityToAdd,
                        size: selectedSize || product.size || 'N/A',
                        color: product.color || 'N/A',
                        totalAmount: totalAmountInRupees,
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
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                            method: 'Razorpay',
                        },
                        orderStatus: 'Processing',
                        orderedAt: new Date().toISOString(),
                    };

                    set(newOrderRef, orderDetails)
                        .then(() => {
                            console.log("Order details successfully saved to Firebase:", orderDetails);
                            toast.info("Your order has been placed successfully!");
                        })
                        .catch(error => {
                            console.error("Error saving order details to Firebase:", error);
                            toast.error("Order placed but failed to save details. Please contact support with Payment ID: " + response.razorpay_payment_id);
                        });
                } else {
                    console.warn("Cannot save order: User not logged in or product data missing.");
                    toast.error("Payment successful, but order details could not be saved. Please contact support.");
                }
            },
            prefill: {
                name: `${firstName} ${lastName}`,
                email: customerEmail,
                contact: customerPhone,
            },
            notes: {
                shipping_address: `${village}, ${district}, ${state} - ${pinCode}`,
                product_id: product.id,
                user_id: currentUser ? currentUser.uid : 'Guest',
            },
            theme: {
                color: '#16a34a', // A nice green color
            },
        };

        try {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error('Payment failed: ' + response.error.description, { position: 'top-center' });
                console.error('Razorpay Payment Error:', response.error);
            });
            rzp.on('modal.close', function () {
                toast.info('Payment process canceled.', { position: 'top-center' });
            });
            rzp.open();
        } catch (error) {
            console.error('Error creating or opening Razorpay instance:', error);
            toast.error('An error occurred while preparing payment. Please check console for details.');
        }
    };

    // Handle review image selection
    const handleReviewImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast.error("Image size too large. Max 2MB allowed.");
                setReviewImage(null);
                setReviewImagePreview(null);
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error("Only image files are allowed.");
                setReviewImage(null);
                setReviewImagePreview(null);
                return;
            }
            setReviewImage(file);
            setReviewImagePreview(URL.createObjectURL(file));
        } else {
            setReviewImage(null);
            setReviewImagePreview(null);
        }
    };

    // Handle review submission
    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            toast.error('Please log in to submit a review.');
            return;
        }
        if (reviewRating === 0) {
            toast.error('Please select a star rating.');
            return;
        }
        if (reviewComment.trim().length < 10) {
            toast.error('Please write a more descriptive review (at least 10 characters).');
            return;
        }

        let imageUrl = '';
        if (reviewImage) {
            try {
                const imageFileName = `${currentUser.uid}_${productId}_${Date.now()}_${reviewImage.name}`;
                const reviewImageRef = storageRef(storage, `review_images/${imageFileName}`);
                const snapshot = await uploadBytes(reviewImageRef, reviewImage);
                imageUrl = await getDownloadURL(snapshot.ref);
                toast.success("Review image uploaded!");
            } catch (imageError) {
                console.error("Error uploading review image:", imageError);
                toast.error("Failed to upload review image. Please try again.");
                return;
            }
        }

        const reviewsRef = ref(database, `reviews/${productId}`);
        const newReviewRef = push(reviewsRef);

        const newReview = {
            userId: currentUser.uid,
            userName: currentUser.displayName || 'Anonymous User',
            userEmail: currentUser.email || 'N/A',
            rating: reviewRating,
            comment: reviewComment.trim(),
            imageUrl: imageUrl,
            timestamp: new Date().toISOString(),
        };

        try {
            await set(newReviewRef, newReview);
            toast.success('Your review has been submitted!');
            // Reset review form fields
            setReviewRating(0);
            setReviewComment('');
            setReviewImage(null);
            setReviewImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Clear file input
            }
        } catch (dbError) {
            console.error('Error submitting review to Firebase:', dbError);
            toast.error('Failed to submit review. Please try again.');
        }
    };

    const basePrice = parseFloat(product?.price || 0);
    const displayPrice = (basePrice * quantityToAdd).toFixed(2);

    // Function to toggle a section
    const toggleSection = (sectionName) => {
        setOpenSection(prev => prev === sectionName ? 'none' : sectionName);
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

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-poppins">
            <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden p-6 md:p-10 transform transition-all duration-300 hover:shadow-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left side: Product Image */}
                    <div className="flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl p-6 shadow-inner relative group">
                        <img
                            src={product.image || 'https://via.placeholder.com/600x600?text=No+Image'}
                            alt={product.title || 'Product Image'}
                            className="max-w-full max-h-[500px] object-contain rounded-lg transform transition-transform duration-500 group-hover:scale-105"
                            loading="eager"
                        />
                        {/* Optional: Add a subtle overlay on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity duration-300 rounded-xl"></div>
                    </div>

                    {/* Right side: Product Details Content */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                                {product.title || 'Unknown Product'}
                            </h1>
                            <p className="text-3xl font-bold text-green-700 mb-6">
                                ₹ {displayPrice}
                            </p>

                            {/* Average Rating Display */}
                            <div className="flex items-center mb-6">
                                <div className="flex text-yellow-500 mr-2">
                                    {[...Array(5)].map((_, i) => (
                                        i < Math.floor(averageRating) ? (
                                            <MdStar key={i} className="w-6 h-6" />
                                        ) : (
                                            <MdStarOutline key={i} className="w-6 h-6" />
                                        )
                                    ))}
                                </div>
                                <span className="text-gray-700 font-medium">
                                    {averageRating.toFixed(1)} ({totalReviews} Reviews)
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-6 text-lg text-gray-700">
                                <p>
                                    <strong className="font-semibold text-gray-800">Brand:</strong>{' '}
                                    {product.brand || 'N/A'}
                                </p>
                                {product.color && (
                                    <p>
                                        <strong className="font-semibold text-gray-800">Color:</strong>{' '}
                                        {product.color}
                                    </p>
                                )}
                                {product.category && (
                                    <p>
                                        <strong className="font-semibold text-gray-800">Category:</strong>{' '}
                                        {product.category}
                                    </p>
                                )}
                            </div>

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

                            {/* Size Selector */}
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
                    </div>
                </div>

                {/* --- Collapsible Sections --- */}
                <div className="mt-12">
                    {/* Reviews Section */}
                    <div className="border border-gray-200 rounded-lg mb-4 shadow-sm">
                        <button
                            className="flex justify-between items-center w-full p-6 text-xl font-semibold text-gray-800 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onClick={() => toggleSection('reviews')}
                            aria-expanded={openSection === 'reviews'}
                        >
                            <span>Reviews ({totalReviews})</span>
                            <span className="text-gray-500 text-2xl">
                                {openSection === 'reviews' ? '-' : '+'}
                            </span>
                        </button>
                        {openSection === 'reviews' && (
                            <div className="p-6 bg-white animate-fade-in">
                                {/* Current Reviews */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
                                    Customer Reviews
                                </h3>
                                {productReviews.length > 0 ? (
                                    <div className="space-y-8">
                                        {(showAllReviews ? productReviews : productReviews.slice(0, 3)).map((review) => (
                                            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                                                <div className="flex items-center mb-2">
                                                    <FaUserCircle className="w-8 h-8 text-gray-500 mr-3" />
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{review.userName}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(review.timestamp).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex text-yellow-500 mb-3">
                                                    {[...Array(5)].map((_, i) => (
                                                        i < review.rating ? (
                                                            <MdStar key={i} className="w-5 h-5" />
                                                        ) : (
                                                            <MdStarOutline key={i} className="w-5 h-5" />
                                                        )
                                                    ))}
                                                </div>
                                                <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                                                {review.imageUrl && (
                                                    <img
                                                        src={review.imageUrl}
                                                        alt="Review"
                                                        className="w-32 h-32 object-cover rounded-md shadow-md mt-2"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        {productReviews.length > 3 && (
                                            <button
                                                onClick={() => setShowAllReviews(!showAllReviews)}
                                                className="mt-4 px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                                            >
                                                {showAllReviews ? 'Show Less' : `Show All (${totalReviews}) Reviews`}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-lg">No reviews yet. Be the first to review this product!</p>
                                )}

                                {/* Review Submission Form */}
                                <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-6 border-b pb-2">
                                    Write a Review
                                </h3>
                                <form onSubmit={handleReviewSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-gray-700 text-lg font-medium mb-2">Your Rating:</label>
                                        <div className="flex space-x-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <MdStar
                                                    key={star}
                                                    className={`w-10 h-10 cursor-pointer transition-colors duration-200 ${star <= reviewRating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                                                        }`}
                                                    onClick={() => setReviewRating(star)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="reviewComment" className="block text-gray-700 text-lg font-medium mb-2">Your Comment:</label>
                                        <textarea
                                            id="reviewComment"
                                            rows="5"
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-y"
                                            placeholder="Tell us about your experience..."
                                            required
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label htmlFor="reviewImage" className="block text-gray-700 text-lg font-medium mb-2">Add Image (Optional):</label>
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="file"
                                                id="reviewImage"
                                                ref={fileInputRef}
                                                accept="image/*"
                                                onChange={handleReviewImageChange}
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current.click()}
                                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition-colors duration-200 flex items-center"
                                            >
                                                <MdCameraAlt className="w-5 h-5 mr-2" /> Upload Image
                                            </button>
                                            {reviewImagePreview && (
                                                <div className="relative">
                                                    <img src={reviewImagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-md" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setReviewImage(null);
                                                            setReviewImagePreview(null);
                                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                                                        aria-label="Remove image"
                                                    >
                                                        <MdClose />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-300"
                                    >
                                        Submit Review
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Shipping & Returns Section */}
                    <div className="border border-gray-200 rounded-lg shadow-sm">
                        <button
                            className="flex justify-between items-center w-full p-6 text-xl font-semibold text-gray-800 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onClick={() => toggleSection('shipping')}
                            aria-expanded={openSection === 'shipping'}
                        >
                            <span>Shipping & Returns</span>
                            <span className="text-gray-500 text-2xl">
                                {openSection === 'shipping' ? '-' : '+'}
                            </span>
                        </button>
                        {openSection === 'shipping' && (
                            <div className="p-6 bg-white animate-fade-in">
                                <div className="space-y-6 text-gray-700 text-lg">
                                    <div className="flex items-start">
                                        <MdOutlineLocalShipping className="w-7 h-7 text-green-600 mr-3 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-xl mb-1">Estimated Delivery:</h4>
                                            <p>Typically delivers within **5-7 business days** to most locations in India after dispatch.</p>
                                            <p className="text-sm text-gray-500 mt-1">Please note: Delivery times may vary based on your location and unforeseen circumstances.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <FaBoxOpen className="w-7 h-7 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-xl mb-1">Shipping Charges:</h4>
                                            <p>Enjoy **Free Shipping** on all orders across India!</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <MdOutlineRestore className="w-7 h-7 text-red-600 mr-3 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-xl mb-1">Easy Returns:</h4>
                                            <p>We offer a **7-day easy return policy** from the date of delivery.</p>
                                            <p>Products must be unused, unwashed, with original tags intact, and in their original packaging.</p>
                                            <p className="text-sm text-gray-500 mt-1">For more details, please refer to our <Link to="/return-policy" className="text-indigo-600 hover:underline">Return Policy</Link>.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <FaRegLightbulb className="w-7 h-7 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-xl mb-1">Important Information:</h4>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>All orders are dispatched after successful payment confirmation.</li>
                                                <li>You will receive tracking information via email/SMS once your order is shipped.</li>
                                                <li>In case of any issues with delivery, please contact our customer support.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Similar Products Section --- */}
                {similarProducts.length > 0 && (
                    <div className="mt-16 bg-gradient-to-r from-teal-50 to-blue-50 p-8 rounded-xl shadow-inner">
                        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-10 relative">
                            <span className="relative z-10">Similar Products</span>
                            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-indigo-500 rounded-full z-0"></span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {similarProducts.map((p) => (
                                <Link
                                    to={`/product/${p.id}`}
                                    key={p.id}
                                    className="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
                                    onClick={() => setLoading(true)} // Optional: Reset loading state when navigating to similar product
                                >
                                    <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                                        <img
                                            src={p.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                                            alt={p.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate group-hover:text-indigo-600 transition-colors duration-200">
                                            {p.title}
                                        </h3>
                                        <p className="text-md text-gray-600 mb-2">{p.brand}</p>
                                        <p className="text-xl font-bold text-green-700">₹ {parseFloat(p.price).toFixed(2)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Customer Info Modal (if needed for Buy Now) */}
            {showCustomerInfoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative transform scale-95 animate-scale-in">
                        <button
                            onClick={() => setShowCustomerInfoModal(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-3xl"
                        >
                            <MdClose />
                        </button>
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center border-b pb-4">
                            Your Delivery Details
                        </h2>
                        <form onSubmit={handleProceedToPayment} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-gray-700 text-sm font-medium mb-2">First Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-gray-700 text-sm font-medium mb-2">Last Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="customerEmail" className="block text-gray-700 text-sm font-medium mb-2">Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    id="customerEmail"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="customerPhone" className="block text-gray-700 text-sm font-medium mb-2">Phone Number <span className="text-red-500">*</span></label>
                                <input
                                    type="tel"
                                    id="customerPhone"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                    maxLength="10"
                                />
                            </div>
                            <div>
                                <label htmlFor="pinCode" className="block text-gray-700 text-sm font-medium mb-2">Pin Code <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    id="pinCode"
                                    value={pinCode}
                                    onChange={(e) => setPinCode(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                    maxLength="6"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="state" className="block text-gray-700 text-sm font-medium mb-2">State <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="state"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="district" className="block text-gray-700 text-sm font-medium mb-2">District <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="district"
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="village" className="block text-gray-700 text-sm font-medium mb-2">Village/Address <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    id="village"
                                    value={village}
                                    onChange={(e) => setVillage(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="House No., Street, Landmark"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 mt-6 bg-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                            >
                                Proceed to Payment (₹ {displayPrice})
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;