// src/FeaturedProducts.jsx
import React, { useState, useEffect } from 'react';
import { database } from './firebase'; // Ensure correct path to firebase.js
import { Link } from 'react-router-dom'; // Import Link for navigation
import { ref, onValue } from 'firebase/database';

// CSS for automatic scrolling (using a string for simplicity, can be moved to a CSS file)
const autoScrollStyles = `
@keyframes scrollProductsInfinite {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); } /* Scrolls half the width for continuous loop */
}

/* Hide scrollbar for Webkit browsers (Chrome, Safari) */
.hide-scrollbar::-webkit-scrollbar {
    display: none;
}
/* Hide scrollbar for Firefox */
.hide-scrollbar {
    scrollbar-width: none;
}
/* Hide scrollbar for IE/Edge */
.hide-scrollbar {
    -ms-overflow-style: none;
}
`;

const FeaturedProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const productsRef = ref(database, 'products');

        const unsubscribe = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Convert the object of products into an array for easier mapping
                const loadedProducts = Object.entries(data).map(([id, product]) => ({
                    id, // Firebase auto-generated unique key
                    ...product,
                }));
                setProducts(loadedProducts);
            } else {
                setProducts([]); // No products found
            }
            setLoading(false); // Data loading is complete
        }, (err) => {
            // Error handling for fetching data
            console.error("Error fetching products:", err);
            setError("Failed to load products. Please try again later.");
            setLoading(false);
        });

        // Cleanup function to detach the Firebase listener when the component unmounts
        return () => unsubscribe();
    }, []); // Empty dependency array ensures this runs only once on component mount

    // Conditional rendering for loading, error, or no products
    if (loading || error || products.length === 0) {
        return (
            <section
                className="py-12 px-4 bg-gray-100"
                style={{ fontFamily: "'Poppins', sans-serif", userSelect: "none" }}
                aria-label="Featured products section"
            >
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
                        Our Latest Arrivals
                    </h2>
                    {loading && <p className="text-center text-gray-600">Loading products...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    {!loading && products.length === 0 && !error && (
                        <p className="text-center text-gray-600">No products available yet. Check back soon!</p>
                    )}
                </div>
            </section>
        );
    }

    // Duplicate products array for seamless infinite horizontal scroll
    // This creates an array that is twice the length, so when the first set scrolls off, the second set seamlessly appears
    const productsToDisplay = [...products, ...products];

    return (
        <section
            className="py-12 px-4 bg-gray-100" // Tailwind classes for padding, background, etc.
            style={{ fontFamily: "'Poppins', sans-serif", userSelect: "none" }}
            aria-label="Featured products section"
        >
            {/* Inject the auto-scroll keyframe styles into the DOM */}
            <style>{autoScrollStyles}</style>

            <div className="container mx-auto overflow-hidden"> {/* Added overflow-hidden to contain the scrolling */}
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
                    Our Latest Arrivals
                </h2>

                {/* Horizontal Scrolling Product Row */}
                <div
                    className="flex flex-nowrap hide-scrollbar" // Use flex-nowrap to keep items on one line, hide-scrollbar for clean look
                    style={{
                        // Animation duration scales with the number of products for consistent speed
                        // 5s per product in the original list, so 20s for 4 products to scroll one full loop
                        animation: `scrollProductsInfinite ${products.length * 5}s linear infinite`,
                        minWidth: 'fit-content', // Ensure the container respects its content's width
                    }}
                >
                    {productsToDisplay.map((product, index) => (
                        <div
                            // Using a combined key for duplicated items to ensure uniqueness
                            key={`${product.id}-${index}`}
                            className="flex-none w-72 mr-6 bg-white rounded-lg shadow-md overflow-hidden" // flex-none ensures fixed width, w-72 for card width
                            style={{ minWidth: '288px' }} // Explicit min-width to prevent shrinking
                        >
                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-56 object-cover" // Fixed height for consistent card appearance
                                loading="lazy" // Optimize image loading
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {product.title}
                                </h3>
                                <p className="text-gray-700 font-bold mt-1">
                                    ₹ {parseFloat(product.price).toFixed(2)} {/* Format price to 2 decimal places */}
                                </p>
                                <p className="text-sm text-gray-500">{product.brand}</p>
                                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full mt-2 inline-block">
                                    {/* Format category string (e.g., "mens-wear" -> "Men's Wear") */}
                                    {product.category.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </span>
                                {/* Link to the product detail page */}
                                <Link
                                    to={`/product/${product.id}`} // Dynamic link using product.id
                                    className="mt-4 block w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition text-center"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedProducts;