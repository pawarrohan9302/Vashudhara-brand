// src/FeaturedProducts.jsx
import React, { useState, useEffect } from 'react';
import { database } from './firebase'; // Ensure correct path to firebase.js
import { Link } from 'react-router-dom'; // Import Link for navigation
import { ref, onValue } from 'firebase/database';

// CSS for automatic scrolling (using a string for simplicity, can be moved to a CSS file)
const autoScrollStyles = `
@keyframes scrollProductsInfinite {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); } /* Still -50% because productsToDisplay is duplicated once */
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
                const loadedProducts = Object.entries(data).map(([id, product]) => ({
                    id,
                    ...product,
                }));
                setProducts(loadedProducts);
            } else {
                setProducts([]);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching products:", err);
            setError("Failed to load products. Please try again later.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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

    // Calculate animation duration dynamically based on the number of original products.
    // The -50% translation means we scroll exactly half of the total duplicated content,
    // which corresponds to the full width of the original products.
    const animationDuration = products.length * 5; // 5 seconds per product is a reasonable speed

    return (
        <section
            className="py-12 px-4 bg-gray-100"
            style={{ fontFamily: "'Poppins', sans-serif", userSelect: "none" }}
            aria-label="Featured products section"
        >
            {/* Inject the auto-scroll keyframe styles into the DOM */}
            {/* We're dynamically setting the duration for the animation here */}
            <style>
                {`
                @keyframes scrollProductsInfinite {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    scrollbar-width: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                }
                `}
            </style>

            <div className="container mx-auto overflow-hidden">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
                    Our Latest Arrivals
                </h2>

                <div
                    className="flex flex-nowrap hide-scrollbar"
                    style={{
                        animation: `scrollProductsInfinite ${animationDuration}s linear infinite`,
                        minWidth: 'fit-content', // Ensure the container respects its content's width
                        // Add some space at the end to prevent last item from sticking to the edge on reset
                        // This might require more nuanced calculation if you have very specific widths.
                        // For now, `minWidth: 'fit-content'` combined with `translateX(-50%)`
                        // and duplicated content should work for a basic infinite scroll.
                    }}
                >
                    {productsToDisplay.map((product, index) => (
                        <div
                            key={`${product.id}-${index}`} // Combined key for uniqueness
                            className="flex-none w-72 mr-6 bg-white rounded-lg shadow-md overflow-hidden"
                            style={{ minWidth: '288px' }} // Explicit min-width to prevent shrinking
                        >
                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-56 object-cover"
                                loading="lazy"
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {product.title}
                                </h3>
                                <p className="text-gray-700 font-bold mt-1">
                                    ₹ {parseFloat(product.price).toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500">{product.brand}</p>
                                {/* Category display (removed as per previous request) */}
                                <Link
                                    to={`/product/${product.id}`}
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