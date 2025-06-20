// src/Wishlist.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeartBroken, FaShoppingBag, FaArrowLeft } from "react-icons/fa";
import { ref, onValue, remove } from "firebase/database";
import { auth, database } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const Wishlist = () => {
    const [user, setUser] = useState(null);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (user) {
            const wishlistRef = ref(database, `wishlists/${user.uid}`);
            const unsubscribeWishlist = onValue(
                wishlistRef,
                (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const itemsArray = Object.entries(data).map(([id, item]) => ({
                            id,
                            ...item,
                        }));
                        setWishlistItems(itemsArray);
                    } else {
                        setWishlistItems([]);
                    }
                    setIsLoading(false);
                },
                (error) => {
                    console.error("Error fetching user wishlist:", error);
                    alert(`Error fetching wishlist: ${error.message}`);
                    setWishlistItems([]);
                    setIsLoading(false);
                }
            );
            return () => unsubscribeWishlist();
        } else {
            setWishlistItems([]);
            setIsLoading(false);
        }
    }, [user]);

    const handleRemoveFromWishlist = async (productId) => {
        if (!user) {
            alert("You must be logged in to remove items from your wishlist.");
            return;
        }
        const itemToRemoveRef = ref(database, `wishlists/${user.uid}/${productId}`);
        try {
            await remove(itemToRemoveRef);
            alert("Item removed from wishlist!");
        } catch (error) {
            console.error("Error removing from wishlist:", error);
            alert(`Failed to remove item: ${error.message}`);
        }
    };

    if (isLoading) {
        return (
            <div className="wishlist-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
                <p style={{ fontSize: "1.5em", color: "#000" }}>Loading wishlist...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="wishlist-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
                <div className="empty-wishlist">
                    <FaHeartBroken className="empty-icon" />
                    <h2>You must be logged in to view your wishlist.</h2>
                    <p>Please log in to see your saved items or add new ones.</p>
                    <button onClick={() => navigate("/login")} className="browse-button">
                        <FaArrowLeft /> Go to Login Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                .wishlist-container {
                    padding: 20px;
                    color: #000;
                    background-color: #ffffff;
                    min-height: 100vh;
                    font-family: 'Poppins', sans-serif;
                }
                .wishlist-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                }
                .wishlist-header h1 {
                    font-size: 2rem;
                    color: #1c1c1c;
                }
                .back-to-home {
                    text-decoration: none;
                    color: #007bff;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .empty-wishlist {
                    text-align: center;
                    padding: 3rem 1rem;
                    background: #f3f3f3;
                    border-radius: 10px;
                    color: #333;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .empty-icon {
                    font-size: 3rem;
                    color: #ff4d4d;
                    margin-bottom: 1rem;
                }
                .browse-button {
                    background: #000;
                    color: #fff;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 20px;
                    font-weight: bold;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    text-decoration: none;
                }
                .wishlist-items-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                }
                .wishlist-item-card {
                    background: #f9f9f9;
                    border-radius: 10px;
                    overflow: hidden;
                    padding: 1rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    display: flex;
                    flex-direction: column;
                    color: #000;
                }
                .item-image {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    margin-bottom: 1rem;
                    border-radius: 8px;
                }
                .item-name {
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: #000;
                }
                .item-description {
                    font-size: 0.9rem;
                    color: #555;
                }
                .item-price {
                    font-size: 1.1rem;
                    margin-top: 0.5rem;
                    color: #222;
                }
                .item-actions {
                    margin-top: auto;
                    display: flex;
                    justify-content: space-between;
                    gap: 0.5rem;
                }
                .remove-button, .add-to-cart-button {
                    flex: 1;
                    padding: 0.5rem;
                    border: none;
                    border-radius: 5px;
                    font-weight: bold;
                    cursor: pointer;
                }
                .remove-button {
                    background: #ff4d4d;
                    color: #fff;
                }
                .add-to-cart-button {
                    background: #007bff;
                    color: #fff;
                    text-align: center;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                }
            `}</style>

            <div className="wishlist-container">
                <div className="wishlist-header">
                    <Link to="/" className="back-to-home">
                        <FaArrowLeft /> Back to Home
                    </Link>
                    <h1>Your Wishlist ({wishlistItems.length} items)</h1>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="empty-wishlist">
                        <FaHeartBroken className="empty-icon" />
                        <h2>Your Wishlist is Empty!</h2>
                        <p>Looks like you haven't added anything yet.</p>
                        <Link to="/" className="browse-button">
                            <FaShoppingBag /> Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="wishlist-items-grid">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="wishlist-item-card">
                                <img src={item.image} alt={item.title} className="item-image" />
                                <div className="item-name">{item.title}</div>
                                <div className="item-description">
                                    Brand: {item.brand || "N/A"} | Category: {item.category || "N/A"}
                                </div>
                                <div className="item-price">₹{item.price}</div>
                                <div className="item-actions">
                                    <button onClick={() => handleRemoveFromWishlist(item.id)} className="remove-button">
                                        <FaHeartBroken /> Remove
                                    </button>
                                    <Link to={`/product/${item.id}`} className="add-to-cart-button">
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
