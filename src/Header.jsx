import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebase"; // Make sure your firebase config is here
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
} from "react-icons/fa";

const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = () => {
        auth.signOut();
        setUser(null);
        navigate("/");
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

                {/* Auth Section */}
                {user ? (
                    <>
                        <span className="user-email" title={user.email}>
                            {user.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="auth-button"
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#00ccb3"; e.currentTarget.style.transform = "scale(1.05)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--primary-color)"; e.currentTarget.style.transform = "scale(1)"; }}
                            title="Logout"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => navigate("/login")}
                        className="auth-button"
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#00ccb3"; e.currentTarget.style.transform = "scale(1.05)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--primary-color)"; e.currentTarget.style.transform = "scale(1)"; }}
                        title="Login"
                    >
                        Login
                    </button>
                )}
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

                    .auth-button {
                        padding: 8px 20px;
                        border-radius: 30px;
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