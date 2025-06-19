import React, { useEffect, useState } from "react";
import { ref, onValue, set, get } from "firebase/database"; // Import 'set' and 'get'
import { database, auth } from "./firebase"; // Assuming firebase.js also exports 'auth'
import { onAuthStateChanged } from "firebase/auth"; // Import onAuthStateChanged

const MensWear = () => {
    const [products, setProducts] = useState([]);
    const [checkoutProduct, setCheckoutProduct] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [user, setUser] = useState(null); // State to store the logged-in user
    const [userWishlist, setUserWishlist] = useState({}); // State to hold the user's wishlist

    // Effect to listen for authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        // Cleanup the subscription on component unmount
        return () => unsubscribe();
    }, []);

    // Effect to fetch products for "mens-wear" category
    useEffect(() => {
        const productsRef = ref(database, "products");
        // We can't directly query by child with `equalTo` here as `onValue` doesn't support
        // advanced queries like `orderByChild` and `equalTo` directly for filtering
        // outside of specific Realtime Database query methods.
        // So, we fetch all products and filter client-side.
        const unsubscribe = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const mensProducts = Object.entries(data)
                    .map(([id, item]) => ({ id, ...item }))
                    .filter((item) => item.category === "mens-wear"); // Filters for mens-wear
                setProducts(mensProducts);
            } else {
                setProducts([]);
            }
        }, (error) => {
            console.error("Error fetching products:", error);
            // Optionally, handle error state for UI
        });
        // Cleanup the subscription on component unmount
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
            // Cleanup the subscription on component unmount
            return () => unsubscribeWishlist();
        } else {
            // Clear wishlist if user logs out
            setUserWishlist({});
        }
    }, [user]); // Re-run when user changes

    // Function to handle "Buy Now" click
    const handleBuyClick = (product) => {
        // In a real app, this would typically navigate to a product detail page or a checkout flow
        // For simplicity, here it just opens a confirmation modal
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

        // IMPORTANT: Ensure your Firebase Realtime Database rules allow this write:
        // {
        //   "rules": {
        //     "wishlists": {
        //       "$uid": {
        //         ".read": "auth != null && auth.uid === $uid",
        //         ".write": "auth != null && auth.uid === $uid"
        //       }
        //     }
        //   }
        // }
        const wishlistProductRef = ref(database, `wishlists/${user.uid}/${product.id}`);

        try {
            // Use get() for a one-time read to check if the product already exists in wishlist
            const snapshot = await get(wishlistProductRef);
            if (snapshot.exists()) {
                alert(`${product.title} is already in your wishlist!`);
            } else {
                // If not in wishlist, add it
                await set(wishlistProductRef, {
                    id: product.id,
                    title: product.title,
                    image: product.image,
                    price: product.price,
                    category: product.category,
                    brand: product.brand || "N/A",
                    addedDate: new Date().toISOString(), // Add a timestamp for when it was added
                });
                alert(`${product.title} added to your wishlist!`);
            }
        } catch (error) {
            // --- ENHANCED ERROR LOGGING STARTS HERE ---
            console.error("Error adding to wishlist:", error.code, error.message, error);
            alert(`Failed to add product to wishlist. Please try again. Error: ${error.message || 'Unknown error'}`);
            // --- ENHANCED ERROR LOGGING ENDS HERE ---
        }
    };

    // Helper function to check if a product is in the user's wishlist
    const isProductInWishlist = (productId) => {
        return userWishlist && userWishlist[productId] !== undefined;
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
                    Men's Wear {/* Title for MensWear */}
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
                    products.map((product, idx) => (
                        <div
                            key={product.id}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{
                                position: "relative",
                                backgroundColor: "#1f2937",
                                borderRadius: "20px",
                                overflow: "hidden",
                                boxShadow:
                                    hoveredIndex === idx
                                        ? "0 15px 40px rgba(52, 211, 153, 0.6)"
                                        : "0 10px 30px rgba(52, 211, 153, 0.3)",
                                cursor: "pointer",
                                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                transform: hoveredIndex === idx ? "scale(1.05)" : "scale(1)",
                                color: "#e0e7ff",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                height: "100%",
                            }}
                        >
                            <img
                                src={product.image}
                                alt={product.title}
                                style={{ width: "100%", height: "200px", objectFit: "cover" }}
                                loading="lazy"
                            />

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

                                {/* Buy Now Button */}
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

                                {/* Add to Wishlist Button */}
                                <button
                                    onClick={() => handleAddToWishlist(product)}
                                    // Disable button if product is already in wishlist
                                    disabled={isProductInWishlist(product.id)}
                                    style={{
                                        marginTop: "10px",
                                        backgroundColor: isProductInWishlist(product.id) ? "#4b5563" : "#f97316", // Gray if in wishlist, orange otherwise
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
