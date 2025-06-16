import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "./firebase";

import {
    FaLeaf,
    FaGem,
    FaRing,
    FaGift,
    FaStore,
    FaInfoCircle,
    FaShoppingCart,
    FaInstagram,
    FaHome,
    FaUserCircle,
    FaAngleDown,
} from "react-icons/fa";

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            console.log("Firebase Auth State Changed. Current User:", currentUser ? currentUser.email : "No user logged in");
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            setUser(null);
            setShowProfileMenu(false);
            navigate("/");
            console.log("User logged out successfully.");
        } catch (error) {
            console.error("Error logging out:", error.message);
        }
    };

    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    const currentPath = location.pathname;

    const navLinks = [
        { to: "/", label: "Home", icon: <FaHome /> },
        { to: "/collections", label: "Collections", icon: <FaStore /> },
        { to: "/mens-wear", label: "Earring Elegance", icon: <FaGem /> },
        { to: "/womens-wear", label: "Rings", icon: <FaRing /> },
        { to: "/accessories", label: "Accessories", icon: <FaGift /> },
        { to: "/cart", label: "Cart", icon: <FaShoppingCart /> },
        { to: "/about", label: "About", icon: <FaInfoCircle /> },
    ];

    return (
        <header className="header-container">
            <div
                onClick={() => navigate("/")}
                className="logo-section"
                title="Go to Home"
            >
                <FaLeaf className="logo-icon" />
                <span>Vashudhara</span>
            </div>

            <nav className="nav-links-section" aria-label="Main Navigation">
                {navLinks.map(({ to, icon, label }) => {
                    const isSpecificActive = (to === '/' && currentPath === '/') || (to !== '/' && currentPath.startsWith(to));

                    return (
                        <Link
                            key={label}
                            to={to}
                            className={`nav-link-item ${isSpecificActive ? "active" : ""}`}
                            aria-current={isSpecificActive ? "page" : undefined}
                            title={label}
                        >
                            <span className="nav-link-icon">{icon}</span>
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="user-action-section">
                <a
                    href="https://www.instagram.com/vashudharastore/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Visit us on Instagram"
                    className="instagram-link"
                    aria-label="Instagram Profile"
                >
                    <FaInstagram />
                </a>

                <div className="profile-dropdown-container" ref={profileRef}>
                    <button
                        onClick={toggleProfileMenu}
                        className={`auth-button profile-toggle-button ${showProfileMenu ? 'active-profile-button' : ''}`}
                        title={user ? `Logged in as ${user.email}` : "Profile / Login"}
                        aria-expanded={showProfileMenu}
                        aria-haspopup="true"
                        aria-controls="profile-menu"
                    >
                        <FaUserCircle className="profile-icon" />
                        <span className="profile-text">
                            {user ? (
                                <span className="user-email-display">{user.email}</span>
                            ) : (
                                "Profile"
                            )}
                        </span>
                        <FaAngleDown className={`dropdown-arrow ${showProfileMenu ? 'open' : ''}`} />
                    </button>

                    {showProfileMenu && (
                        <div id="profile-menu" className="profile-dropdown-menu" role="menu">
                            <div className="dropdown-header">
                                Welcome{user ? `, ${user.email.split('@')[0]}` : ""}!
                                <br />
                                To access account and manage orders
                            </div>
                            {user ? (
                                <button onClick={handleLogout} className="dropdown-item logout-button" role="menuitem">
                                    Logout
                                </button>
                            ) : (
                                <Link to="/login" onClick={() => setShowProfileMenu(false)} className="dropdown-item" role="menuitem">
                                    Login / Signup
                                </Link>
                            )}
                            <Link to="/orders" onClick={() => setShowProfileMenu(false)} className="dropdown-item" role="menuitem">Orders</Link>
                            <Link to="/wishlist" onClick={() => setShowProfileMenu(false)} className="dropdown-item" role="menuitem">Wishlist</Link>
                            <Link to="/gift-cards" onClick={() => setShowProfileMenu(false)} className="dropdown-item" role="menuitem">Gift Cards</Link>
                            <div className="dropdown-section-title">Vashudhara Insider <span className="new-badge">New</span></div>
                            <Link to="/vashudhara-credit" onClick={() => setShowProfileMenu(false)} className="dropdown-item" role="menuitem">Vashudhara Credit</Link>
                            <Link to="/coupons" onClick={() => setShowProfileMenu(false)} className="dropdown-item" role="menuitem">Coupons</Link>
                            <Link to="/saved-cards" onClick={() => setShowProfileMenu(false)} className="dropdown-item" role="menuitem">Saved Cards</Link>
                            <Link to="/saved-vpa" onClick={() => setShowProfileMenu(false)} className="dropdown-item" role="menuitem">Saved VPA</Link>
                            <Link to="/saved-addresses" onClick={() => setShowProfileMenu(false)} className="dropdown-item" role="menuitem">Saved Addresses</Link>
                            <Link to="/contact" onClick={() => setShowProfileMenu(false)} className="dropdown-item contact-dropdown-item" role="menuitem">Contact Us</Link>
                        </div>
                    )}
                </div>
            </div>

            <style>
                {`
                /* CSS Variables for easy theme management */
                :root {
                    --primary-gradient: linear-gradient(90deg, #0f2027, #203a43, #2c5364);
                    --primary-color: #00ffe7; /* Bright cyan/teal */
                    --text-color: #e0e0e0; /* Lighter grey for general text */
                    --accent-bg-color: rgba(0,255,231,0.1); /* Light transparent cyan */
                    --accent-hover-color: #00ccb3; /* Slightly darker primary color on hover */
                    --instagram-color: #e1306c; /* Instagram's signature pinkish-red */
                    --dropdown-bg: #152535; /* Darker background for dropdown */
                    --dropdown-item-hover: rgba(0,255,231,0.25); /* More visible transparent cyan for dropdown item hover */
                    --border-color: rgba(0,255,231,0.3); /* Stronger transparent cyan for borders */
                    --light-text-color: #a0a0a0; /* Lighter grey for secondary text */
                    --button-text-color: #000; /* Black for primary buttons */
                    --new-badge-bg: #ffc107; /* Yellowish for new badge */
                    --new-badge-text: #333; /* Dark text for new badge */
                }

                /* General reset/base styles for better consistency */
                *, *::before, *::after {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                body {
                    font-family: 'Poppins', sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    background-color: #1a1a1a; /* A dark background for contrast */
                }


                /* Base styles (Mobile First - applies to all screens by default) */
                .header-container {
                    display: flex;
                    flex-direction: column; /* Stacks vertically on small screens */
                    justify-content: center; /* Center horizontally in column mode */
                    align-items: center; /* Center horizontally in column mode */
                    background: var(--primary-gradient);
                    padding: 10px 15px; /* Slightly more padding for mobile */
                    color: var(--text-color);
                    position: sticky;
                    top: 0;
                    z-index: 9999;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.4); /* Stronger, deeper shadow */
                    font-family: 'Poppins', sans-serif;
                    user-select: none; /* Prevent text selection */
                    min-height: auto; /* Allow height to adjust */
                    gap: 12px; /* Increased spacing between main sections (logo, nav, user actions) */
                    flex-wrap: wrap; /* Allow main sections to wrap if needed */
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 8px; /* Slightly larger gap for mobile */
                    font-weight: 700;
                    font-size: 22px; /* A bit larger for mobile logo */
                    letter-spacing: 2.5px; /* Refined letter spacing */
                    cursor: pointer;
                    color: var(--primary-color);
                    text-shadow: 0 0 10px var(--primary-color), 0 0 15px rgba(0,255,231,0.5); /* More pronounced glow */
                    transition: transform 0.2s ease, text-shadow 0.2s ease;
                    flex-shrink: 0; /* Prevent shrinking */
                }
                .logo-section:hover {
                    transform: scale(1.08); /* Scale up on hover */
                    text-shadow: 0 0 12px var(--primary-color), 0 0 20px rgba(0,255,231,0.7); /* Intensify glow on hover */
                }
                .logo-icon {
                    font-size: 32px; /* Slightly larger icon for mobile */
                    color: var(--primary-color);
                    text-shadow: 0 0 12px var(--primary-color); /* Stronger shadow */
                }

                /* Navigation Links Section - Key for Horizontal Scroll */
                .nav-links-section {
                    display: flex;
                    flex-wrap: nowrap; /* IMPORTANT: Ensures items stay in a single row */
                    justify-content: flex-start; /* Aligns items to start for scroll */
                    align-items: center;
                    gap: 12px; /* Increased spacing between individual nav links */
                    margin: 8px 0; /* Vertical margin for separation */
                    width: 100%; /* IMPORTANT: Ensures it takes full width for scroll to work */
                    overflow-x: auto; /* IMPORTANT: Enables horizontal scrolling */
                    -webkit-overflow-scrolling: touch; /* Smooth scrolling for iOS */
                    scrollbar-width: none; /* Hide scrollbar for Firefox */
                    padding-bottom: 8px; /* Space for potential scrollbar/visual cue on mobile */
                    border-bottom: 1px solid rgba(255,255,255,0.1); /* Subtle bottom border as scroll indicator */
                    min-width: 0; /* Fixes potential flexbox overflow issues on narrow screens */
                }
                /* Hide scrollbar for Webkit browsers (Chrome, Safari) */
                .nav-links-section::-webkit-scrollbar {
                    display: none;
                }

                .nav-link-item {
                    display: flex;
                    flex-direction: column; /* Stack icon and text vertically */
                    align-items: center; /* Center horizontally within the link */
                    text-decoration: none;
                    padding: 8px 10px; /* Reduced horizontal padding to prevent crowding */
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 13px;
                    gap: 4px; /* Reduced gap between icon and text */
                    transition: all 0.25s ease;
                    cursor: pointer;
                    user-select: none;
                    white-space: nowrap; /* Ensures text never wraps */
                    flex-shrink: 0; /* Prevents items from shrinking */
                    color: var(--text-color);
                    background-color: transparent; /* No background by default */
                    box-shadow: none;
                    position: relative; /* For the active bottom line */
                    overflow: hidden;
                    border: 1px solid transparent; /* No border by default */
                }

                /* Active state indicator (only bottom line now) */
                .nav-link-item.active {
                    color: var(--primary-color);
                    background-color: transparent; /* Keep background transparent */
                    border-color: transparent; /* No border in active state */
                    box-shadow: none; /* No box shadow in active state */
                }
                .nav-link-item.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 3px; /* Thickness of the line */
                    background-color: var(--primary-color);
                    border-radius: 0 0 3px 3px;
                    box-shadow: 0 0 5px var(--primary-color);
                    animation: slideInBottom 0.3s ease-out forwards;
                }
                @keyframes slideInBottom {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                /* Hover effect: Only change icon and text color */
                .nav-link-item:hover {
                    color: var(--accent-hover-color); /* Change text and icon color on hover */
                    background-color: transparent; /* Ensure no background change */
                    box-shadow: none; /* No box shadow on hover */
                    transform: translateY(-2px); /* Slight lift on hover, optional */
                }
                /* Keep active item text color and glow, but no extra transform on hover */
                .nav-link-item.active:hover {
                    color: var(--primary-color); /* Active item remains primary color on hover */
                    transform: translateY(0); /* Active items stay in place */
                    background-color: transparent;
                    box-shadow: none;
                }
                .nav-link-icon {
                    font-size: 15px; /* Larger icons for mobile nav */
                    display: flex;
                    align-items: center;
                }

                .user-action-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-color);
                    flex-shrink: 0;
                    margin-top: 12px;
                    width: 100%;
                    justify-content: center;
                    white-space: nowrap;
                    position: relative;
                }

                .instagram-link {
                    color: var(--instagram-color);
                    font-size: 20px;
                    text-shadow: 0 0 8px var(--instagram-color);
                    transition: transform 0.2s ease, text-shadow 0.2s ease;
                }
                .instagram-link:hover {
                    transform: scale(1.25);
                    text-shadow: 0 0 12px var(--instagram-color), 0 0 20px rgba(225,48,108,0.7);
                }

                .user-email-display {
                    max-width: 90px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: inline-block;
                    vertical-align: middle;
                    color: var(--button-text-color);
                }

                .auth-button {
                    padding: 8px 15px;
                    border-radius: 25px;
                    cursor: pointer;
                    background-color: var(--primary-color);
                    border: none;
                    color: var(--button-text-color);
                    font-weight: 700;
                    box-shadow: 0 0 8px var(--primary-color);
                    transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
                    user-select: none;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    min-width: 100px;
                    justify-content: center;
                }
                .auth-button:hover {
                    background-color: #00ccb3;
                    transform: scale(1.05);
                    box-shadow: 0 0 12px #00ccb3;
                }
                .auth-button.active-profile-button {
                    background-color: #00ccb3;
                    transform: scale(1.05);
                    box-shadow: 0 0 12px #00ccb3;
                }
                .profile-icon {
                    font-size: 18px;
                }
                .dropdown-arrow {
                    margin-left: 4px;
                    transition: transform 0.2s ease;
                }
                .dropdown-arrow.open {
                    transform: rotate(180deg);
                }

                .profile-dropdown-container {
                    position: relative;
                    display: inline-block;
                    margin-left: 8px;
                }
                .profile-dropdown-menu {
                    position: absolute;
                    top: calc(100% + 10px);
                    right: 0;
                    background-color: var(--dropdown-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.5);
                    min-width: 220px;
                    max-width: 95vw;
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    padding: 10px 0;
                    transform-origin: top right;
                    animation: fadeInScale 0.3s ease-out forwards;
                }
                @keyframes fadeInScale {
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .dropdown-header {
                    padding: 10px 15px;
                    font-size: 14px;
                    color: var(--primary-color);
                    border-bottom: 1px solid var(--border-color);
                    margin-bottom: 10px;
                    font-weight: 600;
                    line-height: 1.5;
                }
                .dropdown-item {
                    display: flex;
                    align-items: center;
                    padding: 9px 15px;
                    text-decoration: none;
                    color: var(--text-color);
                    font-size: 14px;
                    font-weight: 500;
                    transition: background-color 0.2s ease, color 0.2s ease, border-left-color 0.2s ease;
                    cursor: pointer;
                    white-space: nowrap;
                    border-left: 4px solid transparent;
                }
                .dropdown-item:hover {
                    background-color: var(--dropdown-item-hover);
                    color: var(--primary-color);
                    border-left-color: var(--primary-color);
                }
                .dropdown-section-title {
                    padding: 10px 15px 5px;
                    font-size: 13px;
                    color: var(--light-text-color);
                    font-weight: 600;
                    border-top: 1px solid var(--border-color);
                    margin-top: 12px;
                }
                .new-badge {
                    background-color: var(--new-badge-bg);
                    color: var(--new-badge-text);
                    font-size: 9px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin-left: 5px;
                    font-weight: 700;
                    vertical-align: middle;
                }
                .logout-button {
                    background: none;
                    border: none;
                    color: var(--text-color);
                    cursor: pointer;
                    text-align: left;
                    width: 100%;
                    padding: 9px 15px;
                    font-size: 14px;
                    font-weight: 500;
                    transition: background-color 0.2s ease, color 0.2s ease, border-left-color 0.2s ease;
                    border-left: 4px solid transparent;
                }
                .logout-button:hover {
                    background-color: var(--dropdown-item-hover);
                    color: var(--primary-color);
                    border-left-color: var(--primary-color);
                }
                .contact-dropdown-item {
                    margin-top: 10px;
                }


                /* --- Tablet and Larger Screens (@media (min-width: 768px)) --- */
                @media (min-width: 768px) {
                    .header-container {
                        flex-direction: row;
                        justify-content: space-between;
                        padding: 18px 45px;
                        min-height: 80px;
                        gap: 25px;
                        flex-wrap: nowrap;
                        box-shadow: 0 5px 25px rgba(0,0,0,0.4);
                        width: 100%;
                    }
                    .logo-section {
                        font-size: 30px;
                        letter-spacing: 4px;
                        gap: 12px;
                        flex-shrink: 0;
                    }
                    .logo-icon {
                        font-size: 42px;
                    }
                    .nav-links-section {
                        flex-wrap: nowrap;
                        justify-content: center;
                        margin: 0 auto;
                        gap: 35px; /* Increased gap for desktop nav items */
                        overflow-x: visible;
                        padding-bottom: 0;
                        border-bottom: none;
                        flex-grow: 1;
                        min-width: 0;
                        flex-basis: auto;
                    }
                    .nav-link-item {
                        padding: 10px 15px; /* Adjusted padding for desktop */
                        font-size: 15px; /* Slightly smaller font for more items to fit */
                        gap: 6px; /* Slightly more gap between icon and text */
                        border-radius: 10px;
                        flex-shrink: 0;
                    }
                    .nav-link-item.active {
                        box-shadow: none; /* No box-shadow on active state on desktop */
                    }
                    .nav-link-item.active::after {
                        height: 4px;
                    }
                    .nav-link-item:hover {
                        transform: translateY(-3px); /* Subtle lift on hover */
                    }
                    .nav-link-item.active:hover {
                        transform: translateY(0);
                    }
                    .nav-link-icon {
                        font-size: 18px; /* Adjusted icon size for desktop */
                    }
                    .user-action-section {
                        margin-top: 0;
                        width: auto;
                        justify-content: flex-end;
                        font-size: 15px;
                        gap: 20px;
                        margin-left: auto;
                        flex-shrink: 0;
                    }
                    .instagram-link {
                        font-size: 24px;
                        text-shadow: 0 0 10px var(--instagram-color);
                    }
                    .user-email-display {
                        max-width: 150px;
                    }
                    .auth-button {
                        padding: 10px 25px;
                        border-radius: 30px;
                        min-width: 160px;
                    }
                    .profile-icon {
                        font-size: 22px;
                    }
                    .profile-dropdown-menu {
                        right: 0;
                        left: auto;
                        min-width: 280px;
                        padding: 12px 0;
                    }
                    .dropdown-header {
                        padding: 15px 20px;
                        font-size: 16px;
                        margin-bottom: 15px;
                    }
                    .dropdown-item {
                        padding: 10px 20px;
                        font-size: 15px;
                    }
                    .dropdown-section-title {
                        padding: 12px 20px 8px;
                        font-size: 14px;
                        margin-top: 15px;
                    }
                }
                `}
            </style>
        </header>
    );
};

export default Header;