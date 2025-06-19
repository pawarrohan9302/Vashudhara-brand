import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { FaHeartBroken, FaShoppingBag, FaBoxes, FaArrowLeft } from "react-icons/fa";
import { ref, onValue, remove } from "firebase/database"; // Firebase Realtime Database imports
import { auth, database } from "./firebase"; // Assuming firebase.js exports both auth and database
import { onAuthStateChanged } from "firebase/auth"; // Firebase Auth import

const Wishlist = () => {
    // State to store the logged-in user
    const [user, setUser] = useState(null);
    // State to hold the user's wishlist items, initially empty
    const [wishlistItems, setWishlistItems] = useState([]);
    // State for loading status (e.g., checking auth, fetching data)
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate(); // Initialize navigate hook for redirection

    // Effect to listen for Firebase authentication state changes
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsLoading(false); // Authentication check is complete
        });
        // Cleanup the authentication subscription when the component unmounts
        return () => unsubscribeAuth();
    }, []);

    // Effect to fetch the user's wishlist once the user object is available
    useEffect(() => {
        // Only proceed if a user is logged in
        if (user) {
            // Create a reference to the specific user's wishlist in Firebase
            // Data structure: /wishlists/{user.uid}/{productId}: { ...productData }
            const wishlistRef = ref(database, `wishlists/${user.uid}`);

            // Set up a real-time listener for changes in the wishlist
            const unsubscribeWishlist = onValue(wishlistRef, (snapshot) => {
                const data = snapshot.val(); // Get the data as a JavaScript object
                if (data) {
                    // Convert the object of wishlist items into an array for easier rendering
                    const itemsArray = Object.entries(data).map(([id, item]) => ({
                        id, // Firebase key is the product ID
                        ...item // Rest of the product data
                    }));
                    setWishlistItems(itemsArray);
                } else {
                    setWishlistItems([]); // If no data, the wishlist is empty
                }
                setIsLoading(false); // Data fetching is complete
            }, (error) => {
                // Log and alert if there's an error fetching wishlist data
                console.error("Error fetching user wishlist:", error.code, error.message, error);
                alert(`Error fetching wishlist: ${error.message || "Please try again."}`);
                setWishlistItems([]); // Clear wishlist on error
                setIsLoading(false); // Data fetching attempt is complete
            });

            // Cleanup the wishlist data subscription when the component unmounts or user changes
            return () => unsubscribeWishlist();
        } else {
            // If no user is logged in, clear the wishlist and set loading to false
            setWishlistItems([]);
            setIsLoading(false);
        }
    }, [user]); // This effect runs whenever the 'user' state changes

    // Function to remove an item from the wishlist in Firebase
    const handleRemoveFromWishlist = async (productId) => {
        if (!user) {
            alert("You must be logged in to remove items from your wishlist.");
            return;
        }

        // Create a reference to the specific item to be removed
        const itemToRemoveRef = ref(database, `wishlists/${user.uid}/${productId}`);

        try {
            await remove(itemToRemoveRef); // Execute the remove operation in Firebase
            // The onValue listener will automatically update the local state,
            // so no need to manually filter `setWishlistItems` here.
            alert("Item removed from wishlist!");
            console.log(`Item with ID ${productId} removed from Firebase wishlist.`);
        } catch (error) {
            // Log and alert if there's an error during removal
            console.error("Error removing from wishlist:", error.code, error.message, error);
            alert(`Failed to remove item from wishlist. Error: ${error.message || "Unknown error"}`);
        }
    };

    // Show loading status while authentication is being checked or data is being fetched
    if (isLoading) {
        return (
            <div className="wishlist-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
                <p style={{ fontSize: "1.5em", color: "var(--primary-color)" }}>Loading wishlist...</p>
            </div>
        );
    }

    // Redirect to login if not logged in after authentication check is complete
    if (!user) {
        return (
            <div className="wishlist-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
                <div className="empty-wishlist" style={{ boxShadow: "0 8px 25px rgba(0,255,231,0.3)" }}>
                    <FaHeartBroken className="empty-icon" />
                    <h2>You must be logged in to view your wishlist.</h2>
                    <p>Please log in to see your saved items or add new ones.</p>
                    <button
                        onClick={() => navigate('/login')} // Use navigate for programmatic redirection
                        className="browse-button" // Reuse existing button style
                    >
                        <FaArrowLeft /> Go to Login Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* CSS embedded directly in the component (as per your original code) */}
            <style jsx>{`
                /* CSS Variables for consistency */
                :root {
                    --primary-gradient: linear-gradient(90deg, #0f2027, #203a43, #2c5364);
                    --primary-color: #00ffe7; /* Bright cyan/teal */
                    --text-color: #e0e0e0; /* Lighter grey for general text */
                    --accent-bg-color: rgba(0,255,231,0.1); /* Light transparent cyan */
                    --accent-hover-color: #00ccb3; /* Slightly darker primary color on hover */
                    --error-color: #ff4d4d; /* Red for errors/removals */
                    --button-bg-light: #f0f0f0; /* Light background for buttons */
                    --button-text-dark: #333; /* Dark text for light buttons */
                    --card-bg: #1c2e3a; /* Slightly lighter dark background for cards */
                    --border-color: rgba(0,255,231,0.3); /* Stronger transparent cyan for borders */
                    --shadow-color: rgba(0,0,0,0.6);
                    --light-text-color: #a0a0a0;
                }

                /* General Styles (Applies to all screen sizes - Mobile First) */
                .wishlist-container {
                    padding: 20px 15px;
                    max-width: 1200px;
                    margin: 20px auto;
                    font-family: 'Poppins', sans-serif;
                    color: var(--text-color);
                    background-color: #1a1a1a; /* Match body background */
                    min-height: calc(100vh - 100px); /* Adjust based on header/footer height */
                }

                .wishlist-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid var(--border-color);
                }

                .wishlist-header h1 {
                    font-size: 2em;
                    color: var(--primary-color);
                    text-align: center;
                    text-shadow: 0 0 10px var(--primary-color);
                    margin: 0;
                }

                .back-to-home {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                    color: var(--light-text-color);
                    font-size: 0.9em;
                    transition: color 0.2s ease, transform 0.2s ease;
                    align-self: flex-start; /* Align to the start of the column */
                }

                .back-to-home:hover {
                    color: var(--primary-color);
                    transform: translateX(-5px);
                }

                /* Empty Wishlist State */
                .empty-wishlist {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 40px 20px;
                    background-color: var(--card-bg);
                    border-radius: 12px;
                    box-shadow: 0 5px 20px var(--shadow-color);
                    margin-top: 30px;
                }

                .empty-icon {
                    font-size: 4em;
                    color: var(--error-color);
                    margin-bottom: 20px;
                    animation: bounceIn 0.8s ease-out;
                }

                .empty-wishlist h2 {
                    font-size: 1.8em;
                    color: var(--primary-color);
                    margin-bottom: 15px;
                }

                .empty-wishlist p {
                    font-size: 1.1em;
                    color: var(--light-text-color);
                    margin-bottom: 30px;
                    max-width: 500px;
                }

                .browse-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 25px;
                    background-color: var(--primary-color);
                    color: var(--button-text-dark);
                    text-decoration: none;
                    border-radius: 30px;
                    font-weight: 600;
                    font-size: 1.1em;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0,255,231,0.4);
                    border: none; /* Ensure no default button border */
                    cursor: pointer; /* Ensure cursor is pointer for buttons */
                }

                .browse-button:hover {
                    background-color: var(--accent-hover-color);
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(0,255,231,0.6);
                }

                /* Wishlist Items Grid */
                .wishlist-items-grid {
                    display: grid;
                    grid-template-columns: 1fr; /* Single column for mobile */
                    gap: 25px;
                }

                .wishlist-item-card {
                    display: flex;
                    flex-direction: column; /* Stack content vertically on mobile */
                    background-color: var(--card-bg);
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px var(--shadow-color);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    border: 1px solid var(--border-color);
                }

                .wishlist-item-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0,255,231,0.3);
                }

                .item-image-wrapper {
                    width: 100%;
                    height: 200px; /* Fixed height for image */
                    overflow: hidden;
                    background-color: #0d1a25; /* Dark background for image placeholder */
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .item-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover; /* Ensures image covers the area */
                    display: block;
                }

                .item-details {
                    padding: 15px;
                    text-align: center; /* Center details on mobile */
                    flex-grow: 1; /* Allows details to take available space */
                }

                .item-name {
                    font-size: 1.3em;
                    color: var(--primary-color);
                    margin-bottom: 8px;
                    font-weight: 700;
                }

                .item-description {
                    font-size: 0.9em;
                    color: var(--light-text-color);
                    margin-bottom: 12px;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2; /* Limit to 2 lines */
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .item-price {
                    font-size: 1.2em;
                    color: var(--text-color);
                    font-weight: 600;
                }

                .item-actions {
                    display: flex;
                    flex-direction: column; /* Stack buttons on mobile */
                    gap: 10px;
                    padding: 15px;
                    border-top: 1px solid rgba(255,255,255,0.05); /* Subtle separator */
                }

                .remove-button,
                .add-to-cart-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px 15px;
                    border-radius: 25px;
                    font-weight: 600;
                    font-size: 1em;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none; /* For Link component */
                    white-space: nowrap;
                }

                .remove-button {
                    background-color: var(--error-color);
                    color: white;
                    border: none;
                    box-shadow: 0 2px 10px rgba(255,77,77,0.4);
                }

                .remove-button:hover {
                    background-color: #cc0000;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255,77,77,0.6);
                }

                .add-to-cart-button { /* Renamed from add-to-cart-button to view-item-button in JSX to be more accurate */
                    background-color: var(--primary-color);
                    color: var(--button-text-dark);
                    border: none;
                    box-shadow: 0 2px 10px rgba(0,255,231,0.4);
                }

                .add-to-cart-button:hover {
                    background-color: var(--accent-hover-color);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0,255,231,0.6);
                }

                /* Animations */
                @keyframes bounceIn {
                    0% {
                        transform: scale(0.3);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.05);
                        opacity: 1;
                    }
                    70% {
                        transform: scale(0.9);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                /* --- Tablet and Larger Screens (@media (min-width: 768px)) --- */
                @media (min-width: 768px) {
                    .wishlist-container {
                        padding: 30px 25px;
                    }

                    .wishlist-header {
                        flex-direction: row; /* Row for wider screens */
                        justify-content: space-between;
                        align-items: flex-end; /* Align title and back button better */
                        margin-bottom: 40px;
                    }

                    .wishlist-header h1 {
                        font-size: 2.5em;
                        text-align: left;
                        flex-grow: 1; /* Allow title to take space */
                        margin-left: 20px; /* Space from back button */
                    }

                    .back-to-home {
                        font-size: 1em;
                        align-self: flex-start; /* Ensure it stays at the start */
                    }

                    .empty-wishlist {
                        padding: 60px 30px;
                    }

                    .empty-icon {
                        font-size: 5em;
                    }

                    .empty-wishlist h2 {
                        font-size: 2.2em;
                    }

                    .empty-wishlist p {
                        font-size: 1.2em;
                    }

                    .browse-button {
                        padding: 15px 30px;
                        font-size: 1.2em;
                    }

                    .wishlist-items-grid {
                        grid-template-columns: repeat(2, 1fr); /* Two columns for tablets */
                    }

                    .wishlist-item-card {
                        flex-direction: column; /* Keep column layout for cards on tablet */
                    }

                    .item-image-wrapper {
                        height: 220px;
                    }

                    .item-details {
                        padding: 20px;
                        text-align: left; /* Align text left in card details */
                    }

                    .item-name {
                        font-size: 1.5em;
                    }

                    .item-description {
                        font-size: 1em;
                    }

                    .item-price {
                        font-size: 1.3em;
                    }

                    .item-actions {
                        flex-direction: row; /* Buttons side-by-side */
                        justify-content: space-around;
                        padding: 20px;
                    }

                    .remove-button,
                    .add-to-cart-button {
                        flex: 1; /* Distribute space evenly */
                        max-width: 150px; /* Limit button width */
                    }
                }

                /* --- Desktop and Larger Screens (@media (min-width: 1024px)) --- */
                @media (min-width: 1024px) {
                    .wishlist-container {
                        padding: 40px 30px;
                    }

                    .wishlist-header h1 {
                        font-size: 3em;
                    }

                    .wishlist-items-grid {
                        grid-template-columns: repeat(3, 1fr); /* Three columns for desktops */
                        gap: 30px;
                    }

                    .wishlist-item-card {
                        flex-direction: column; /* Keep column layout */
                    }

                    .item-image-wrapper {
                        height: 250px; /* Slightly larger image area */
                    }

                    .item-details {
                        padding: 25px;
                    }

                    .item-actions {
                        padding: 25px;
                        flex-direction: row; /* Keep side-by-side */
                        justify-content: space-between; /* Space out buttons */
                    }

                    .remove-button,
                    .add-to-cart-button {
                        max-width: 160px; /* Slightly larger buttons */
                        padding: 12px 18px;
                    }
                }

                /* --- Extra Large Screens (@media (min-width: 1440px)) --- */
                @media (min-width: 1440px) {
                    .wishlist-container {
                        max-width: 1400px; /* Max width for very large screens */
                        padding: 50px 40px;
                    }
                    .wishlist-items-grid {
                        grid-template-columns: repeat(4, 1fr); /* Four columns for extra large screens */
                    }
                }
            `}</style>

            {/* Component JSX continues here */}
            <div className="wishlist-container">
                <div className="wishlist-header">
                    <Link to="/" className="back-to-home" title="Back to Home">
                        <FaArrowLeft />
                        <span>Back to Home</span>
                    </Link>
                    <h1>Your Wishlist ({wishlistItems.length} items)</h1>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="empty-wishlist">
                        <FaHeartBroken className="empty-icon" />
                        <h2>Your Wishlist is Empty!</h2>
                        <p>Looks like you haven't added anything yet. Start Browse to find your favorites.</p>
                        {/* Changed Link target from "/collections" to "/" as a common fallback for home/browse.
                            Adjust if you have a specific /collections route. */}
                        <Link to="/" className="browse-button">
                            <FaShoppingBag /> Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="wishlist-items-grid">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="wishlist-item-card">
                                <div className="item-image-wrapper">
                                    {/* Using item.image and item.title from Firebase data */}
                                    <img src={item.image} alt={item.title} className="item-image" />
                                </div>
                                <div className="item-details">
                                    {/* Using item.title from Firebase data */}
                                    <h3 className="item-name">{item.title}</h3>
                                    {/* Using item.brand and item.category from Firebase data (description might not be there) */}
                                    <p className="item-description">Brand: {item.brand || "N/A"} | Category: {item.category || "N/A"}</p>
                                    {/* Using item.price from Firebase data */}
                                    <p className="item-price">₹{item.price ? item.price.toLocaleString() : "N/A"}</p>
                                    {/* Displaying addedDate if available from Firebase */}
                                    {item.addedDate && (
                                        <p style={{ fontSize: "0.8em", color: "var(--light-text-color)", marginTop: "5px" }}>
                                            Added: {new Date(item.addedDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <div className="item-actions">
                                    <button
                                        onClick={() => handleRemoveFromWishlist(item.id)}
                                        className="remove-button"
                                        title={`Remove ${item.title}`}
                                    >
                                        <FaHeartBroken /> Remove
                                    </button>
                                    {/* Assuming a product detail page exists at /product/:id */}
                                    <Link to={`/product/${item.id}`} className="add-to-cart-button" title={`View ${item.title} details`}>
                                        <FaShoppingBag /> View Item
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Wishlist;
