import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "./firebase";

import {
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
                <img
                    src={"/Vashudhara Logo.jpg"}
                    alt="Vashudhara Logo"
                    className="logo-image"
                />
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
                                <span className="user-email-display">{user.email.split('@')[0]}</span>
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
                            <Link to="/coupons" onClick={() => setShowProfileMenu(false)} className="dropdown-item" role="menuitem">Coupons</Link>
                            <Link to="/saved-cards" onClick={() => setShowProfileMenu(false)} className="dropdown-item" role="menuitem">Saved Cards</Link>
                            <Link to="/addresses" onClick={() => setShowProfileMenu(false)} className="dropdown-item" role="menuitem">Saved Addresses</Link>

                            <a
                                href="https://www.instagram.com/vashudharastore/"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setShowProfileMenu(false)}
                                className="dropdown-item instagram-dropdown-link"
                                role="menuitem"
                            >
                                <FaInstagram style={{ marginRight: '8px', color: 'var(--instagram-color)' }} /> Visit our Instagram
                            </a>

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
                    --primary-color: #00ffe7;
                    --text-color-dark: #e0e0e0; /* Renamed for clarity in white background */
                    --text-color-light: #333; /* For text on white background */
                    --text-color-medium: #555;
                    --text-color-light-gray: #777;

                    --accent-bg-color: rgba(0,255,231,0.1);
                    --accent-hover-color: #00ccb3;
                    --instagram-color: #e1306c;
                    --dropdown-bg: #FFFFFF; /* White dropdown background */
                    --dropdown-item-hover: rgba(0,255,231,0.1); /* Lighter hover for white bg */
                    --border-color-light: rgba(0,0,0,0.1); /* Light border for white bg */
                    --light-text-color: #a0a0a0; /* This variable might need adjustment based on final use */
                    --button-text-color: #000;
                    --new-badge-bg: #ffc107;
                    --new-badge-text: #333;

                    --shadow-light: rgba(0,0,0,0.2);
                    --shadow-medium: rgba(0,0,0,0.4);
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
                    background-color: #1a1a1a;
                }

                /* Base styles (Mobile First - applies to all screens by default) */
                .header-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background: #FFFFFF; /* Changed to white */
                    padding: 10px 15px;
                    color: var(--text-color-light); /* Changed to light text color */
                    position: sticky;
                    top: 0;
                    z-index: 9999;
                    box-shadow: 0 4px 15px var(--shadow-medium); /* Adjusted shadow for white background */
                    font-family: 'Poppins', sans-serif;
                    user-select: none;
                    min-height: auto;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 700;
                    font-size: 22px;
                    letter-spacing: 2.5px;
                    cursor: pointer;
                    color: var(--text-color-light); /* Adjusted for white background */
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    flex-shrink: 0;
                }
                .logo-section:hover {
                    transform: scale(1.08);
                }

                .logo-image {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                    box-shadow: 0 0 10px rgba(0,0,0,0.2), 0 0 15px rgba(0,0,0,0.1); /* Adjusted for white background */
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .logo-section:hover .logo-image {
                    transform: scale(1.08);
                    box-shadow: 0 0 12px rgba(0,0,0,0.3), 0 0 20px rgba(0,0,0,0.2); /* Adjusted for white background */
                }


                /* Navigation Links Section - MOBILE SPECIFIC 3-TAB LAYOUT */
                .nav-links-section {
                    display: flex;
                    flex-wrap: nowrap; /* Keep items in a row initially */
                    justify-content: flex-start; /* Aligns items to start for scroll */
                    align-items: center;
                    gap: 8px; /* Reduced gap between links (closer) */
                    margin: 8px 0;
                    width: 100%;
                    overflow-x: auto; /* Enable horizontal scrolling initially */
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                    padding-bottom: 8px;
                    border-bottom: 1px solid var(--border-color-light); /* Subtle bottom border */
                    min-width: 0;
                }
                .nav-links-section::-webkit-scrollbar {
                    display: none;
                }

                /* Mobile 3-Tab Layout (for smaller screens) */
                @media (max-width: 600px) { /* Adjust breakpoint as needed, e.g., 500px, 480px */
                    .nav-links-section {
                        overflow-x: hidden; /* Hide scroll on very small screens */
                        justify-content: space-around; /* Distribute items evenly */
                        flex-wrap: wrap; /* Allow wrapping if needed, though 3 tabs should fit */
                        gap: 0; /* No gap needed for space-around */
                        padding-left: 0;
                        padding-right: 0;
                    }
                    .nav-link-item {
                        flex: 1 1 auto; /* Make each item take equal space */
                        min-width: 0; /* Allow shrinking */
                        max-width: 33.33%; /* Approximately 3 items per row */
                        padding: 8px 5px; /* Reduced padding */
                        font-size: 11px; /* Smaller font for 3 tabs */
                        gap: 2px; /* Even less gap between icon/text */
                    }
                     .nav-link-item span {
                        text-align: center;
                        width: 100%;
                     }
                    .nav-link-icon {
                        font-size: 14px; /* Slightly smaller icons for 3 tabs */
                    }
                }

                .nav-link-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-decoration: none;
                    padding: 8px 10px; /* Reduced horizontal padding */
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 13px;
                    gap: 4px; /* Reduced gap between icon and text */
                    transition: all 0.25s ease;
                    cursor: pointer;
                    user-select: none;
                    white-space: nowrap;
                    flex-shrink: 0;
                    color: var(--text-color-medium); /* Adjusted for white background */
                    background-color: transparent;
                    box-shadow: none;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid transparent;
                }

                /* Active state indicator */
                .nav-link-item.active {
                    color: var(--primary-color); /* Retain original primary color for active */
                    background-color: transparent;
                    border-color: transparent;
                    box-shadow: none;
                }
                .nav-link-item.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
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
                    color: var(--primary-color);
                    background-color: transparent;
                    box-shadow: none;
                    transform: translateY(-2px);
                }
                .nav-link-item.active:hover {
                    color: var(--primary-color);
                    transform: translateY(0);
                    background-color: transparent;
                    box-shadow: none;
                }
                .nav-link-icon {
                    font-size: 15px;
                    display: flex;
                    align-items: center;
                }

                .user-action-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-color-light); /* Adjusted for white background */
                    flex-shrink: 0;
                    margin-top: 12px;
                    width: 100%;
                    justify-content: center;
                    white-space: nowrap;
                    position: relative;
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
                    box-shadow: 0 0 8px rgba(0,0,0,0.15);
                    transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
                    user-select: none;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    min-width: 100px;
                    justify-content: center;
                }
                .auth-button:hover {
                    background-color: var(--accent-hover-color);
                    transform: scale(1.05);
                    box-shadow: 0 0 12px rgba(0,0,0,0.25);
                }
                .auth-button.active-profile-button {
                    background-color: var(--accent-hover-color);
                    transform: scale(1.05);
                    box-shadow: 0 0 12px rgba(0,0,0,0.25);
                }
                .profile-icon {
                    font-size: 18px;
                    color: var(--button-text-color);
                }
                .dropdown-arrow {
                    margin-left: 4px;
                    transition: transform 0.2s ease;
                    color: var(--button-text-color);
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
                    border: 1px solid var(--border-color-light);
                    border-radius: 10px;
                    box-shadow: 0 8px 20px var(--shadow-light);
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
                    border-bottom: 1px solid var(--border-color-light);
                    margin-bottom: 10px;
                    font-weight: 600;
                    line-height: 1.5;
                }
                .dropdown-item {
                    display: flex;
                    align-items: center;
                    padding: 9px 15px;
                    text-decoration: none;
                    color: var(--text-color-medium);
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
                    color: var(--text-color-light-gray);
                    font-weight: 600;
                    border-top: 1px solid var(--border-color-light);
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
                    color: var(--text-color-medium);
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

                .instagram-dropdown-link {
                }
                .instagram-dropdown-link:hover {
                    color: var(--primary-color);
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
                        box-shadow: 0 5px 25px var(--shadow-light);
                        width: 100%;
                    }
                    .logo-section {
                        font-size: 30px;
                        letter-spacing: 4px;
                        gap: 12px;
                        flex-shrink: 0;
                    }
                    .logo-image {
                        width: 55px;
                        height: 55px;
                    }
                    .nav-links-section {
                        flex-wrap: nowrap;
                        justify-content: center;
                        margin: 0 auto;
                        gap: 15px; /* Further reduced gap for desktop */
                        overflow-x: visible;
                        padding-bottom: 0;
                        border-bottom: none;
                        flex-grow: 1;
                        min-width: 0;
                        flex-basis: auto;
                    }
                    .nav-link-item {
                        padding: 10px 12px; /* Adjusted padding for desktop */
                        font-size: 14px; /* Adjusted font size for desktop */
                        gap: 5px;
                        border-radius: 10px;
                        flex-shrink: 0;
                    }
                    .nav-link-item.active {
                        box-shadow: none;
                    }
                    .nav-link-item.active::after {
                        height: 4px;
                    }
                    .nav-link-item:hover {
                        transform: translateY(-3px);
                    }
                    .nav-link-item.active:hover {
                        transform: translateY(0);
                    }
                    .nav-link-icon {
                        font-size: 18px;
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