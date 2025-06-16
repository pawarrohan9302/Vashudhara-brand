import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
// Make sure your firebase config is here and auth is exported from it
import { auth } from "./firebase";
import {
    FaLeaf,
    FaGem,
    FaRing,
    FaGift,
    FaStore,
    FaInfoCircle,
    FaPhoneAlt,
    FaShoppingCart,
    FaInstagram,
    FaHome,
    FaUserCircle, // Added for profile icon
    FaAngleDown, // Added for dropdown arrow
} from "react-icons/fa";

const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false); // State for dropdown visibility
    const profileRef = useRef(null); // Ref for profile button/menu for click outside logic

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Close profile menu when clicking outside
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

    const handleLogout = () => {
        auth.signOut();
        setUser(null);
        setShowProfileMenu(false); // Close menu on logout
        navigate("/");
    };

    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    // Base style for navigation links (applies to mobile first)
    const linkBaseStyle = {
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        padding: "8px 12px", // Compact padding for mobile
        borderRadius: "8px",
        fontWeight: "600",
        fontSize: "13px", // Compact font size for mobile
        gap: "6px",
        transition: "all 0.3s ease",
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        flexShrink: 0, // Prevent shrinking too much
    };

    const currentPath = window.location.pathname;

    return (
        <header className="header-container">
            {/* Logo */}
            <div
                onClick={() => navigate("/")}
                className="logo-section"
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                title="Go to Home"
            >
                <FaLeaf className="logo-icon" />
                <span>Vashudhara</span>
            </div>

            {/* Navigation Links */}
            <nav className="nav-links-section nav-scroll">
                {[
                    { to: "/", label: "Home", icon: <FaHome /> },
                    { to: "/collections", label: "Collections", icon: <FaStore /> },
                    {
                        to: "/mens-wear", // Assuming this path is for earrings
                        label: "Earring Elegance",
                        icon: <FaGem />, // Only FaGem icon now
                    },
                    { to: "/womens-wear", label: "Rings", icon: <FaRing /> },
                    { to: "/accessories", label: "Accessories", icon: <FaGift /> },
                    { to: "/cart", label: "Cart", icon: <FaShoppingCart /> },
                    { to: "/about", label: "About", icon: <FaInfoCircle /> },
                    { to: "/contact", label: "Contact", icon: <FaPhoneAlt /> },
                ].map(({ to, icon, label }, idx) => {
                    const isActive = currentPath.startsWith(to);
                    return (
                        <Link
                            key={idx}
                            to={to}
                            className="nav-link-item"
                            style={{ // Inline styles for dynamic state (active/inactive)
                                ...linkBaseStyle,
                                color: isActive ? "var(--primary-color)" : "var(--text-color)",
                                boxShadow: isActive ? "0 0 6px var(--primary-color)" : "none",
                                backgroundColor: isActive ? "var(--accent-bg-color)" : "transparent",
                                fontWeight: isActive ? "700" : "600",
                            }}
                            onMouseEnter={(e) => { // Inline styles for hover effects
                                e.currentTarget.style.color = "var(--primary-color)";
                                e.currentTarget.style.backgroundColor = "var(--accent-hover-bg-color)";
                                e.currentTarget.style.boxShadow = "0 0 10px var(--primary-color)";
                                e.currentTarget.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => { // Inline styles for leaving hover state
                                e.currentTarget.style.color = isActive ? "var(--primary-color)" : "var(--text-color)";
                                e.currentTarget.style.backgroundColor = isActive ? "var(--accent-bg-color)" : "transparent";
                                e.currentTarget.style.boxShadow = isActive ? "0 0 6px var(--primary-color)" : "none";
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                            aria-current={isActive ? "page" : undefined}
                            title={label}
                        >
                            <span className="nav-link-icon">{icon}</span>
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Authentication & Social Link */}
            <div className="user-action-section">
                {/* Instagram Icon */}
                <a
                    href="https://www.instagram.com/vashudharastore/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram"
                    className="instagram-link"
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.2)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                    <FaInstagram />
                </a>

                {/* Profile Section with Dropdown */}
                <div className="profile-dropdown-container" ref={profileRef}>
                    <button
                        onClick={toggleProfileMenu}
                        className="auth-button profile-toggle-button"
                        onMouseEnter={(e) => {
                            if (!showProfileMenu) { // Only apply hover if not already active/open
                                e.currentTarget.style.backgroundColor = "#00ccb3";
                                e.currentTarget.style.transform = "scale(1.05)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!showProfileMenu) { // Only revert if not active/open
                                e.currentTarget.style.backgroundColor = "var(--primary-color)";
                                e.currentTarget.style.transform = "scale(1)";
                            }
                        }}
                        style={{
                            backgroundColor: showProfileMenu ? "#00ccb3" : "var(--primary-color)",
                            transform: showProfileMenu ? "scale(1.05)" : "scale(1)"
                        }}
                        title={user ? user.email : "Profile"}
                        aria-expanded={showProfileMenu}
                        aria-haspopup="true"
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
                        <div className="profile-dropdown-menu">
                            <div className="dropdown-header">
                                वेलकम! (Welcome!)
                                <br />
                                अकाउंट एक्सेस और ऑर्डर मैनेज करने के लिए (To access account and manage orders)
                            </div>
                            {user ? (
                                <>
                                    {/* Link to Orders page for logged-in users */}
                                    <Link to="/orders" onClick={() => setShowProfileMenu(false)} className="dropdown-item">
                                        ऑर्डर (Orders)
                                    </Link>
                                    <button onClick={handleLogout} className="dropdown-item logout-button">
                                        लॉगआउट (Logout)
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" onClick={() => setShowProfileMenu(false)} className="dropdown-item">
                                    लॉगिन / साइनअप (Login / Signup)
                                </Link>
                            )}
                            <Link to="/orders" onClick={() => setShowProfileMenu(false)} className="dropdown-item">ऑर्डर और वापसी (Orders & Returns)</Link>
                            <Link to="/wishlist" onClick={() => setShowProfileMenu(false)} className="dropdown-item">विशलिस्ट (Wishlist)</Link>
                            <Link to="/gift-cards" onClick={() => setShowProfileMenu(false)} className="dropdown-item">गिफ्ट कार्ड्स (Gift Cards)</Link>
                            <Link to="/contact" onClick={() => setShowProfileMenu(false)} className="dropdown-item">हमसे संपर्क करें (Contact Us)</Link>
                            <div className="dropdown-section-title">वशुधारा इनसाइडर (Vashudhara Insider) <span className="new-badge">नया (New)</span></div>
                            <Link to="/vashudhara-credit" onClick={() => setShowProfileMenu(false)} className="dropdown-item">वशुधारा क्रेडिट (Vashudhara Credit)</Link>
                            <Link to="/coupons" onClick={() => setShowProfileMenu(false)} className="dropdown-item">कूपन (Coupons)</Link>
                            <Link to="/saved-cards" onClick={() => setShowProfileMenu(false)} className="dropdown-item">सहेजे गए कार्ड (Saved Cards)</Link>
                            <Link to="/saved-vpa" onClick={() => setShowProfileMenu(false)} className="dropdown-item">सहेजे गए UPI (Saved UPI)</Link>
                            <Link to="/saved-addresses" onClick={() => setShowProfileMenu(false)} className="dropdown-item">सहेजे गए पते (Saved Addresses)</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Internal CSS for Responsiveness & Modern UI */}
            <style>
                {`
                /* CSS Variables for easy theme management */
                :root {
                    --primary-gradient: linear-gradient(90deg, #0f2027, #203a43, #2c5364);
                    --primary-color: #00ffe7;
                    --text-color: #ccc;
                    --accent-bg-color: rgba(0,255,231,0.1);
                    --accent-hover-bg-color: rgba(0,255,231,0.15);
                    --instagram-color: #e1306c;
                    --dropdown-bg: #1a2a3a; /* Darker background for dropdown */
                    --dropdown-item-hover: rgba(0,255,231,0.2);
                    --border-color: rgba(0,255,231,0.3);
                }

                /* Base styles (Mobile First) */
                .header-container {
                    display: flex;
                    flex-direction: column; /* Stack vertically on small screens */
                    justify-content: center;
                    align-items: center;
                    background: var(--primary-gradient);
                    padding: 15px 20px;
                    color: var(--text-color);
                    position: sticky;
                    top: 0;
                    z-index: 9999;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
                    font-family: 'Poppins', sans-serif;
                    user-select: none;
                    min-height: auto; /* Adjust height based on content */
                    gap: 15px; /* Spacing between main sections (logo, nav, user) */
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 700;
                    font-size: 24px;
                    letter-spacing: 3px;
                    cursor: pointer;
                    color: var(--primary-color);
                    text-shadow: 0 0 10px var(--primary-color);
                    transition: transform 0.3s ease;
                    flex-shrink: 0;
                }

                .logo-icon {
                    font-size: 35px;
                    color: var(--primary-color);
                    text-shadow: 0 0 12px var(--primary-color);
                }

                .nav-links-section {
                    display: flex;
                    flex-wrap: wrap; /* Allow navigation items to wrap on multiple lines */
                    justify-content: center; /* Center items when wrapped */
                    align-items: center;
                    gap: 12px; /* Spacing between individual nav links */
                    margin: 15px 0; /* Vertical margin for separation on mobile */
                    flex: 1 1 auto; /* Allows nav to take available space */
                    min-width: 0; /* Important for flex items to prevent overflow */
                    overflow-x: hidden; /* Hide horizontal scrollbar if content overflows */
                    scrollbar-width: none; /* For Firefox */
                }

                /* Hide scrollbar for Webkit browsers */
                .nav-scroll::-webkit-scrollbar {
                    display: none;
                }

                .nav-link-icon {
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                }

                .user-action-section {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #d1d1d1;
                    flex-shrink: 0;
                    margin-top: 10px; /* Space from nav on mobile */
                    width: 100%; /* Take full width on mobile */
                    justify-content: center; /* Center content on mobile */
                    white-space: nowrap; /* Prevent line breaks within this section */
                }

                .instagram-link {
                    color: var(--instagram-color);
                    font-size: 20px;
                    text-shadow: 0 0 6px var(--instagram-color);
                    transition: transform 0.2s ease;
                }

                .user-email {
                    max-width: 100px; /* Constraint for email on smaller screens */
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    cursor: default;
                }
                .user-email-display {
                    max-width: 90px; /* Adjust for icon and arrow */
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: inline-block;
                    vertical-align: middle;
                }

                .auth-button {
                    padding: 6px 16px;
                    border-radius: 20px;
                    cursor: pointer;
                    background-color: var(--primary-color);
                    border: none;
                    color: #000;
                    font-weight: 700;
                    box-shadow: 0 0 8px var(--primary-color);
                    transition: background-color 0.3s ease, transform 0.2s ease;
                    user-select: none;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                /* Profile Dropdown Specific Styles */
                .profile-dropdown-container {
                    position: relative;
                    display: inline-block; /* Allows the button and menu to position correctly */
                }

                .profile-toggle-button {
                    min-width: 100px; /* Ensure button has enough space */
                    justify-content: center;
                    padding: 6px 12px;
                }

                .profile-icon {
                    font-size: 18px;
                }

                .dropdown-arrow {
                    margin-left: 5px;
                    transition: transform 0.3s ease;
                }

                .dropdown-arrow.open {
                    transform: rotate(180deg);
                }

                .profile-dropdown-menu {
                    position: absolute;
                    top: 100%; /* Position below the button */
                    right: 0; /* Align to the right of the button */
                    background-color: var(--dropdown-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.4);
                    min-width: 220px;
                    z-index: 10000; /* Ensure it's above other content */
                    display: flex;
                    flex-direction: column;
                    padding: 10px 0;
                    margin-top: 5px; /* Small gap between button and menu */
                }

                .dropdown-header {
                    padding: 10px 15px;
                    font-size: 14px;
                    color: var(--primary-color);
                    border-bottom: 1px solid var(--border-color);
                    margin-bottom: 10px;
                    font-weight: 600;
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    padding: 8px 15px;
                    text-decoration: none;
                    color: var(--text-color);
                    font-size: 14px;
                    font-weight: 500;
                    transition: background-color 0.2s ease, color 0.2s ease;
                    cursor: pointer;
                    white-space: nowrap; /* Prevent wrapping in dropdown */
                }

                .dropdown-item:hover {
                    background-color: var(--dropdown-item-hover);
                    color: var(--primary-color);
                }

                .dropdown-section-title {
                    padding: 10px 15px 5px;
                    font-size: 13px;
                    color: #999;
                    font-weight: 600;
                    border-top: 1px solid var(--border-color);
                    margin-top: 10px;
                }

                .new-badge {
                    background-color: #ffc107; /* Yellowish for new */
                    color: #333;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin-left: 5px;
                    font-weight: 700;
                }

                .logout-button {
                    background: none;
                    border: none;
                    color: var(--text-color);
                    cursor: pointer;
                    text-align: left;
                    width: 100%;
                    padding: 8px 15px;
                    font-size: 14px;
                    font-weight: 500;
                    transition: background-color 0.2s ease, color 0.2s ease;
                }
                .logout-button:hover {
                    background-color: var(--dropdown-item-hover);
                    color: var(--primary-color);
                }


                /* --- Tablet and Larger Screens --- */
                @media (min-width: 768px) {
                    .header-container {
                        flex-direction: row; /* Horizontal layout on larger screens */
                        justify-content: space-between;
                        padding: 15px 40px;
                        min-height: 70px;
                        gap: 20px; /* Adjust gap between sections for larger screens */
                    }

                    .logo-section {
                        font-size: 28px;
                        letter-spacing: 4px;
                        gap: 10px;
                    }
                    .logo-icon {
                        font-size: 40px;
                    }

                    .nav-links-section {
                        flex-wrap: nowrap; /* Prevent wrapping on desktop */
                        justify-content: center;
                        margin: 0 20px; /* Horizontal margin */
                        gap: 24px; /* More space between nav items */
                        overflow-x: visible; /* Allow content to be visible (no hidden scrollbar) */
                    }
                    .nav-link-item {
                        padding: 10px 16px;
                        font-size: 15px;
                        gap: 8px;
                    }
                    .nav-link-icon {
                        font-size: 18px;
                    }

                    .user-action-section {
                        margin-top: 0; /* Remove top margin */
                        width: auto; /* Revert to auto width */
                        justify-content: flex-end; /* Align to the right */
                        font-size: 14px;
                        gap: 15px;
                        margin-left: auto; /* Pushes this section to the far right */
                    }

                    .instagram-link {
                        font-size: 22px;
                        text-shadow: 0 0 8px var(--instagram-color);
                    }

                    .user-email {
                        max-width: 140px; /* More space for email on desktop */
                    }

                    .profile-toggle-button {
                        padding: 8px 20px;
                        border-radius: 30px;
                        min-width: 120px;
                    }
                    .profile-icon {
                        font-size: 20px;
                    }
                    .user-email-display {
                        max-width: 100px; /* More space for email on desktop button */
                    }

                    .profile-dropdown-menu {
                        right: 0; /* Keep aligned to right for desktop */
                        left: auto; /* Override potential left setting from mobile centering */
                    }
                }

                /* --- Larger Desktop Screens (e.g., 1024px and above) --- */
                @media (min-width: 1024px) {
                    .nav-links-section {
                        gap: 30px; /* Even more space for wide screens */
                    }
                }
                `}
            </style>
        </header>
    );
};

export default Header;
