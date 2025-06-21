import React, { useEffect, useState } from "react";
import { ref, onValue, set, get } from "firebase/database";
import { database, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const MensWear = () => {
    const [products, setProducts] = useState([]);
    const [checkoutProduct, setCheckoutProduct] = useState(null);
    const [user, setUser] = useState(null);
    const [userWishlist, setUserWishlist] = useState({});
    const [currentImageIndex, setCurrentImageIndex] = useState({}); // State to manage the current image index for each product on hover

    // Effect to listen for authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Effect to fetch products for "mens-wear" category
    useEffect(() => {
        const productsRef = ref(database, "products");
        const unsubscribe = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const mensProducts = Object.entries(data)
                    .map(([id, item]) => {
                        let productImages = [];
                        // Check if 'images' property exists and is an array
                        if (Array.isArray(item.images)) {
                            productImages = item.images;
                        }
                        // Fallback for old 'image' property (singular) if 'images' array is not found
                        else if (item.image) {
                            productImages = [item.image];
                        }

                        return {
                            id,
                            images: productImages, // Ensure this is always an array
                            ...item, // Spread other properties (title, price, brand, category etc.)
                        };
                    })
                    .filter((item) => item.category === "mens-wear");
                setProducts(mensProducts);
            } else {
                setProducts([]);
            }
        }, (error) => {
            console.error("Error fetching products:", error);
            // Optionally, set an error state to display to the user
        });
        return () => unsubscribe();
    }, []);

    // Effect to fetch user's wishlist once user is available
    useEffect(() => {
        if (user) {
            const wishlistRef = ref(database, `wishlists/${user.uid}`);
            const unsubscribeWishlist = onValue(wishlistRef, (snapshot) => {
                const data = snapshot.val();
                setUserWishlist(data || {});
            }, (error) => {
                console.error("Error fetching user wishlist:", error);
            });
            return () => unsubscribeWishlist();
        } else {
            setUserWishlist({});
        }
    }, [user]);

    // Function to handle "Buy Now" click
    const handleBuyClick = (product) => {
        if (!user) {
            alert("Please log in to purchase products.");
            return;
        }
        setCheckoutProduct(product);
    };

    // Function to handle "Add to Wishlist" click
    const handleAddToWishlist = async (product) => {
        if (!user) {
            alert("Please log in to add items to your wishlist.");
            return;
        }

        const wishlistProductRef = ref(database, `wishlists/${user.uid}/${product.id}`);

        try {
            const snapshot = await get(wishlistProductRef);
            if (snapshot.exists()) {
                alert(`${product.title} is already in your wishlist!`);
            } else {
                await set(wishlistProductRef, {
                    id: product.id,
                    title: product.title,
                    images: product.images, // Store the array of images
                    price: product.price,
                    category: product.category,
                    brand: product.brand || "N/A",
                    addedDate: new Date().toISOString(),
                });
                alert(`${product.title} added to your wishlist!`);
            }
        } catch (error) {
            console.error("Error adding to wishlist:", error.code, error.message, error);
            alert(`Failed to add product to wishlist. Please try again. Error: ${error.message || 'Unknown error'}`);
        }
    };

    // Helper function to check if a product is in the user's wishlist
    const isProductInWishlist = (productId) => {
        return userWishlist && userWishlist[productId] !== undefined;
    };

    // New handlers for image hover to implement slider
    const handleProductMouseEnter = (productId) => {
        const product = products.find(p => p.id === productId);
        if (product && product.images && product.images.length > 1) {
            let index = 0;
            // Set initial image to 0
            setCurrentImageIndex(prev => ({
                ...prev,
                [productId]: 0
            }));
            // Start an interval to cycle through images
            const intervalId = setInterval(() => {
                setCurrentImageIndex(prev => {
                    const nextIndex = (prev[productId] + 1) % product.images.length;
                    return {
                        ...prev,
                        [productId]: nextIndex
                    };
                });
            }, 1000); // Change image every 1 second (adjust as needed)
            // Store the interval ID to clear it later
            setCurrentImageIndex(prev => ({
                ...prev,
                [`interval-${productId}`]: intervalId
            }));
        } else {
            // If only one image or no images, ensure index is 0
            setCurrentImageIndex(prev => ({
                ...prev,
                [productId]: 0
            }));
        }
    };

    const handleProductMouseLeave = (productId) => {
        // Clear the interval when mouse leaves
        const intervalId = currentImageIndex[`interval-${productId}`];
        if (intervalId) {
            clearInterval(intervalId);
        }
        // Reset to first image or clear the entry
        setCurrentImageIndex(prev => {
            const newState = { ...prev };
            delete newState[productId]; // Remove the specific product's image index
            delete newState[`interval-${productId}`]; // Remove the interval ID
            return newState;
        });
    };

    return (
        <section
            style={{
                backgroundColor: "#000",
                minHeight: "100vh",
                padding: "60px 20px",
                fontFamily: "'Poppins', sans-serif",
                color: "#e0e7ff",
            }}
        >
            <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
                <h1
                    style={{
                        fontSize: "36px",
                        fontWeight: "700",
                        marginBottom: "24px",
                        color: "#a7f3d0",
                    }}
                >
                    Men's Wear
                </h1>
                <p style={{ fontSize: "18px", color: "#94a3b8", marginBottom: "50px" }}>
                    Explore our exclusive collection of men's fashion.
                </p>
                {user && <p style={{ fontSize: "14px", color: "#6b7280" }}>Logged in as: {user.email}</p>}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "30px",
                    maxWidth: "1000px",
                    margin: "0 auto",
                }}
            >
                {products.length === 0 ? (
                    <p style={{ color: "#94a3b8", textAlign: "center", gridColumn: "1 / -1" }}>
                        No men's wear products found.
                    </p>
                ) : (
                    products.map((product) => (
                        <div
                            key={product.id}
                            onMouseEnter={() => handleProductMouseEnter(product.id)}
                            onMouseLeave={() => handleProductMouseLeave(product.id)}
                            style={{
                                position: "relative",
                                backgroundColor: "#1f2937",
                                borderRadius: "20px",
                                overflow: "hidden",
                                boxShadow: "0 10px 30px rgba(52, 211, 153, 0.3)", // Base shadow
                                cursor: "pointer",
                                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                transform: currentImageIndex[`interval-${product.id}`] ? "scale(1.05)" : "scale(1)", // Scale if actively sliding
                                color: "#e0e7ff",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                height: "100%",
                            }}
                        >
                            {/* Image Container for Slider */}
                            <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
                                {/* Display image only if product.images is an array and has elements */}
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        // Display the image based on currentImageIndex state for this product
                                        // currentImageIndex[product.id] will be undefined initially, so || 0 ensures first image
                                        src={product.images[currentImageIndex[product.id] || 0]}
                                        alt={product.title}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        loading="lazy"
                                    />
                                ) : (
                                    // Placeholder if no images
                                    <div style={{ width: "100%", height: "100%", backgroundColor: "#334155", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                                        No Image
                                    </div>
                                )}

                                {/* Image Navigation Dots */}
                                {product.images && product.images.length > 1 && ( // Only show dots if more than one image
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: "10px",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            display: "flex",
                                            gap: "5px",
                                            zIndex: 10,
                                        }}
                                    >
                                        {product.images.map((_, dotIndex) => (
                                            <span
                                                key={dotIndex}
                                                style={{
                                                    width: "8px",
                                                    height: "8px",
                                                    borderRadius: "50%",
                                                    backgroundColor:
                                                        currentImageIndex[product.id] === dotIndex
                                                            ? "#34d399" // Active dot color
                                                            : "rgba(255, 255, 255, 0.5)", // Inactive dot color
                                                    transition: "background-color 0.3s ease",
                                                }}
                                            ></span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: "20px" }}>
                                <h2
                                    style={{
                                        fontSize: "22px",
                                        marginBottom: "8px",
                                        color: "#a7f3d0",
                                        fontWeight: "700",
                                    }}
                                >
                                    {product.title}
                                </h2>
                                <p style={{ fontSize: "16px", color: "#94a3b8", marginBottom: "6px" }}>
                                    {product.brand}
                                </p>
                                <p style={{ fontSize: "18px", fontWeight: "bold", color: "#34d399" }}>
                                    ₹{product.price}
                                </p>

                                <button
                                    onClick={() => handleBuyClick(product)}
                                    style={{
                                        marginTop: "15px",
                                        backgroundColor: "#22c55e",
                                        color: "black",
                                        padding: "12px 0",
                                        border: "none",
                                        width: "100%",
                                        borderRadius: "9999px",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                        fontWeight: "700",
                                        boxShadow: "0 6px 12px rgba(34, 197, 94, 0.6)",
                                        transition: "background-color 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#16a34a")}
                                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#22c55e")}
                                >
                                    Buy Now
                                </button>

                                <button
                                    onClick={() => handleAddToWishlist(product)}
                                    disabled={isProductInWishlist(product.id)}
                                    style={{
                                        marginTop: "10px",
                                        backgroundColor: isProductInWishlist(product.id) ? "#4b5563" : "#f97316",
                                        color: "white",
                                        padding: "12px 0",
                                        border: "none",
                                        width: "100%",
                                        borderRadius: "9999px",
                                        cursor: isProductInWishlist(product.id) ? "not-allowed" : "pointer",
                                        fontSize: "16px",
                                        fontWeight: "700",
                                        boxShadow: isProductInWishlist(product.id) ? "none" : "0 6px 12px rgba(249, 115, 22, 0.6)",
                                        transition: "background-color 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isProductInWishlist(product.id)) {
                                            e.target.style.backgroundColor = "#ea580c";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isProductInWishlist(product.id)) {
                                            e.target.style.backgroundColor = "#f97316";
                                        }
                                    }}
                                >
                                    {isProductInWishlist(product.id) ? "Added to Wishlist" : "Add to Wishlist"}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Checkout Modal */}
            {checkoutProduct && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}
                    onClick={() => setCheckoutProduct(null)}
                >
                    <div
                        style={{
                            backgroundColor: "#111827",
                            padding: "30px",
                            borderRadius: "20px",
                            minWidth: "320px",
                            textAlign: "center",
                            boxShadow: "0 8px 24px rgba(34, 197, 94, 0.8)",
                            color: "#d1fae5",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2
                            style={{
                                fontSize: "26px",
                                fontWeight: "bold",
                                marginBottom: "12px",
                                color: "#22c55e",
                            }}
                        >
                            Confirm Purchase
                        </h2>
                        <p style={{ fontSize: "18px", marginBottom: "20px" }}>
                            Proceed with payment for{" "}
                            <strong style={{ color: "#86efac" }}>{checkoutProduct.title}</strong>
                        </p>
                        <button
                            onClick={() => setCheckoutProduct(null)}
                            style={{
                                marginTop: "10px",
                                backgroundColor: "#dc2626",
                                color: "white",
                                padding: "12px 24px",
                                border: "none",
                                borderRadius: "12px",
                                cursor: "pointer",
                                fontSize: "16px",
                                fontWeight: "bold",
                                boxShadow: "0 4px 12px rgba(220, 38, 38, 0.8)",
                                transition: "background-color 0.3s ease",
                            }}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = "#b91c1c")}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = "#dc2626")}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default MensWear;