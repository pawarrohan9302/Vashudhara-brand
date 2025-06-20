// src/HomePage.jsx
import React, { useCallback } from "react";
import FeaturedProducts from './FeaturedProducts.jsx';
import {
    FaShippingFast,
    FaStar,
    FaShieldAlt,
    FaFacebookF,
    FaInstagram,
    FaTwitter,
} from "react-icons/fa";

// Combine all global CSS keyframes and responsive styles here
const combinedGlobalStyles = `
/* Global CSS Keyframes */
@keyframes fadeInDown {
    0% {opacity: 0; transform: translateY(-30px);}
    100% {opacity: 1; transform: translateY(0);}
}
@keyframes fadeInUp {
    0% {opacity: 0; transform: translateY(30px);}
    100% {opacity: 1; transform: translateY(0);}
}
@keyframes fadeIn {
    0% {opacity: 0;}
    100% {opacity: 1;}
}
@keyframes slideInLeft {
    0% {opacity: 0; transform: translateX(-50px);}
    100% {opacity: 1; transform: translateX(0);}
}
@keyframes slideInRight {
    0% {opacity: 0; transform: translateX(50px);}
    100% {opacity: 1; transform: translateX(0);}
}

/* Responsive adjustments for Hero section background on smaller screens */
@media (max-width: 768px) {
    #home {
        background-size: cover !important; /* Ensure image covers the area, may crop */
        background-position: center !important; /* Center the image */
        background-repeat: no-repeat !important; /* Prevent tiling */
        padding: 50px 20px !important; /* Further reduce padding for mobile height */
        height: 60vh !important; /* Set a specific viewport height for mobile, adjust as needed */
        min-height: 400px !important; /* Ensure a minimum height so content is readable */
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        overflow: hidden; /* Hide any overflowing parts of the image */
    }
    #home h1 {
        font-size: 2rem !important; /* Smaller font size for mobile heading */
        margin-bottom: 10px !important;
    }
    #home p {
        font-size: 0.9rem !important; /* Smaller font size for mobile paragraph */
        margin-bottom: 20px !important;
    }
    #home button {
        padding: 12px 30px !important; /* Smaller button for mobile */
        font-size: 1.1rem !important;
        margin-top: 20px !important;
    }
}
`;

// Custom hook for consistent hover effects
const useHoverEffect = () => {
    const onMouseEnter = useCallback((e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 18px 45px rgba(52, 211, 153, 0.6)";
    }, []);

    const onMouseLeave = useCallback((e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "";
    }, []);

    return { onMouseEnter, onMouseLeave };
};

// Hero Section Component
const Hero = () => {
    const buttonHover = useHoverEffect();

    const handleShopNow = () => {
        window.location.href = "/collections"; // Navigate to collections page
    };

    return (
        <section
            style={{
                backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('/HD.jpg')",
                backgroundSize: "cover", // Image covers the area, good for aesthetics
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                color: "#fff",
                // *** Adjusted padding for general screens (laptops) ***
                padding: "100px 20px", // Reduced from 180px
                textAlign: "center",
                borderBottom: "6px solid #34d399",
                fontFamily: "'Poppins', sans-serif",
                animation: "fadeIn 1.5s ease-out forwards",
                userSelect: "none",
                // *** Adjusted minHeight for general screens (laptops) ***
                minHeight: "70vh", // Reduced from 75vh, adjust as needed
                height: "auto", // Let height adjust based on content and minHeight
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}
            id="home"
            aria-label="Welcome section to Vashudhara"
        >
            <h1
                style={{
                    fontSize: "clamp(3rem, 6vw, 4.5rem)",
                    fontWeight: "900",
                    marginBottom: "25px",
                    textShadow: "4px 4px 20px rgba(0,0,0,0.9)",
                    lineHeight: "1.2",
                    animation: "fadeInUp 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
                    letterSpacing: "1px",
                }}
            >
                Welcome to <span style={{ color: "#34d399" }}>Vashudhara</span>
            </h1>
            <p
                style={{
                    fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)",
                    maxWidth: "700px",
                    margin: "0 auto 40px auto",
                    lineHeight: "1.8",
                    color: "#e0e7ee",
                    fontFamily: "'Open Sans', sans-serif",
                    animation: "fadeInUp 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
                    fontWeight: "300",
                }}
            >
                Discover premium clothing, accessories, and lifestyle products — curated
                for elegance, crafted with care. Elevate your style with our exquisite collections.
            </p>
            <button
                {...buttonHover}
                onClick={handleShopNow}
                style={{
                    marginTop: "45px",
                    padding: "20px 55px",
                    backgroundColor: "#34d399",
                    border: "none",
                    borderRadius: "16px",
                    fontWeight: "800",
                    fontSize: "1.4rem",
                    color: "#0f172a",
                    cursor: "pointer",
                    transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out",
                    boxShadow: "0 8px 20px rgba(52, 211, 153, 0.6)",
                    outlineOffset: "6px",
                    outline: "2px solid rgba(52, 211, 153, 0.8)",
                }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = "0 10px 30px rgba(52,211,153,0.9)")}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "0 8px 20px rgba(52,211,153,0.6)")}
                aria-label="Shop now button, explore our collections"
            >
                Shop Now
            </button>
        </section>
    );
};

// Categories Section Component
const Categories = () => {
    const categories = [
        "Women's Earrings",
        "Rings",
        "Bracelets",
        "Accessories"
    ];
    const hoverEffect = useHoverEffect();

    return (
        <section
            style={{
                backgroundColor: "#ffffff",
                padding: "80px 20px",
                textAlign: "center",
                fontFamily: "'Poppins', sans-serif",
            }}
            id="categories"
            aria-label="Product categories you can explore"
        >
            <h2
                style={{
                    fontSize: "clamp(2.5rem, 4.5vw, 3rem)",
                    fontWeight: "700",
                    color: "#1a202c",
                    marginBottom: "60px",
                    animation: "fadeIn 1.5s ease forwards",
                    userSelect: "none",
                }}
            >
                Explore Our <span style={{ color: "#34d399" }}>Categories</span>
            </h2>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "35px",
                    maxWidth: "1280px",
                    margin: "0 auto",
                    padding: "0 20px",
                }}
            >
                {categories.map((category, index) => {
                    let imagePath = "";
                    let targetUrl = `/collections/${category.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, '')}`;

                    switch (category) {
                        case "Rings":
                            imagePath = "/Rings%20Hd.webp";
                            targetUrl = "/womens-wear";
                            break;
                        case "Accessories":
                            imagePath = "/Untitled%20design%20(2).png";
                            targetUrl = "/collections";
                            break;
                        case "Bracelets":
                            imagePath = "/Bracelet.jpg";
                            targetUrl = "/accessories";
                            break;
                        case "Women's Earrings":
                            imagePath = "/womens%20earrings.jpg";
                            targetUrl = "/mens-wear";
                            break;
                        default:
                            imagePath = `/${category.toLowerCase().replace(/ /g, "").replace(/[^a-z0-9]/g, '')}.webp`;
                    }

                    return (
                        <div
                            key={index}
                            role="button"
                            tabIndex={0}
                            onClick={() => window.location.href = targetUrl}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    window.location.href = targetUrl;
                                }
                            }}
                            {...hoverEffect}
                            style={{
                                backgroundColor: "#edf2f7",
                                borderRadius: "20px",
                                boxShadow: "0 8px 30px rgba(52, 211, 153, 0.35)",
                                overflow: "hidden",
                                transition: "transform 0.3s ease, boxShadow 0.3s ease",
                                cursor: "pointer",
                                height: "380px",
                                position: "relative",
                                outline: "none",
                                userSelect: "none",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                animation: `fadeInUp 1s ease forwards ${index * 0.1}s`,
                                willChange: 'transform, box-shadow',
                            }}
                            aria-label={`${category} category link`}
                        >
                            <img
                                src={imagePath}
                                alt={category}
                                loading="lazy"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    filter: "brightness(0.9) contrast(1.05)",
                                    transition: "transform 0.3s ease",
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    zIndex: 1,
                                }}
                            />
                            <div
                                style={{
                                    position: "relative",
                                    zIndex: 2,
                                    width: "100%",
                                    padding: "20px 0",
                                    backgroundColor: "rgba(255, 255, 255, 0.85)",
                                    backdropFilter: "blur(4px)",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <h3
                                    style={{
                                        color: "#34d399",
                                        fontWeight: "700",
                                        fontSize: "1.45rem",
                                        letterSpacing: "1.5px",
                                        pointerEvents: "none",
                                        userSelect: "none",
                                        textShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    {category}
                                </h3>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

// Why Us Section Component
const WhyUs = () => {
    const reasons = [
        {
            icon: <FaStar />,
            title: "Premium Quality",
            description:
                "Handpicked materials & detailed craftsmanship for a luxurious experience in every product.",
        },
        {
            icon: <FaShippingFast />,
            title: "Instant Delivery",
            description:
                "Get your order delivered in just 7 days! Fast, secure, and trackable delivery for your peace of mind.",
        },
        {
            icon: <FaShieldAlt />,
            title: "Secure Shopping",
            description:
                "Your data and purchases are protected with top-tier encryption & trusted payment gateways.",
        },
    ];

    const hoverEffect = useHoverEffect();

    return (
        <section
            style={{
                padding: "100px 20px",
                backgroundColor: "#f7fafc",
                textAlign: "center",
                fontFamily: "'Poppins', sans-serif",
                userSelect: "none",
            }}
            aria-label="Why choose Vashudhara, our key features"
        >
            <h2
                style={{
                    fontSize: "clamp(2.5rem, 4.5vw, 3rem)",
                    color: "#1a202c",
                    fontWeight: "700",
                    marginBottom: "60px",
                    animation: "fadeIn 1.5s ease forwards",
                }}
            >
                Why Choose <span style={{ color: "#34d399" }}>Vashudhara</span>?
            </h2>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "40px",
                    flexWrap: "wrap",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "0 20px",
                }}
            >
                {reasons.map((item, index) => (
                    <div
                        key={index}
                        {...hoverEffect}
                        tabIndex={0}
                        aria-label={`${item.title} feature description`}
                        style={{
                            backgroundColor: "#ffffff",
                            padding: "40px 28px",
                            borderRadius: "24px",
                            width: "320px",
                            boxShadow: "0 16px 40px rgba(52, 211, 153, 0.2)",
                            transition: "transform 0.3s ease, boxShadow 0.3s ease",
                            cursor: "pointer",
                            textAlign: "center",
                            color: "#4a5568",
                            outline: "none",
                            userSelect: "none",
                            animation: `fadeInUp 1s ease forwards ${index * 0.15}s`,
                            willChange: 'transform, box-shadow',
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "52px",
                                color: "#34d399",
                                marginBottom: "25px",
                                animation: "fadeIn 1s ease forwards",
                            }}
                        >
                            {item.icon}
                        </div>
                        <h4
                            style={{
                                fontSize: "1.6rem",
                                fontWeight: "700",
                                color: "#1a202c",
                                marginBottom: "18px",
                            }}
                        >
                            {item.title}
                        </h4>
                        <p
                            style={{
                                fontSize: "1.05rem",
                                color: "#4a5568",
                                lineHeight: "1.8",
                                fontFamily: "'Open Sans', sans-serif",
                            }}
                        >
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

// Delivery Guarantee Section Component
const DeliveryGuarantee = () => {
    return (
        <section
            style={{
                backgroundColor: "#ffffff",
                padding: "80px 20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                userSelect: "none",
            }}
            aria-label="Our commitment to fast and reliable delivery"
        >
            <div
                style={{
                    maxWidth: "800px",
                    backgroundColor: "#edf2f7",
                    borderRadius: "25px",
                    padding: "50px 40px",
                    boxShadow: "0 15px 45px rgba(52, 211, 153, 0.35)",
                    textAlign: "center",
                    color: "#1a202c",
                    fontFamily: "'Poppins', sans-serif",
                    lineHeight: "1.8",
                    fontSize: "1.15rem",
                    fontWeight: "600",
                    border: "3px solid #34d399",
                    animation: "fadeIn 2s ease forwards",
                }}
            >
                <p style={{ marginBottom: "18px" }}>
                    <strong style={{ color: "#34d399", fontSize: "1.45rem", display: "block", marginBottom: "10px" }}>
                        Fast & Reliable Delivery Guaranteed!
                    </strong>
                    Experience prompt delivery with Vashudhara — we ensure your order
                    reaches you swiftly and safely, usually within 7 days.
                    Our commitment to quality service means you can trust us to deliver
                    your products right to your doorstep, with care and efficiency.
                </p>
                <p style={{ marginTop: "30px", fontStyle: "italic", color: "#6b7280", fontSize: "1.05rem" }}>
                    Wherever you are, enjoy seamless doorstep delivery tailored for your ultimate
                    convenience and satisfaction.
                </p>
            </div>
        </section>
    );
};

// About Us Section Component
const AboutUs = () => {
    return (
        <section
            style={{
                padding: "100px 20px",
                backgroundColor: "#ffffff",
                color: "#1a202c",
                textAlign: "center",
                fontFamily: "'Poppins', sans-serif",
                animation: "fadeIn 2s ease forwards",
                userSelect: "none",
            }}
            aria-label="Learn more about Vashudhara"
        >
            <h2
                style={{
                    fontSize: "clamp(2.5rem, 4.5vw, 3rem)",
                    fontWeight: "700",
                    marginBottom: "40px",
                    color: "#34d399",
                }}
            >
                About Us
            </h2>
            <p
                style={{
                    maxWidth: "900px",
                    margin: "0 auto",
                    fontSize: "1.15rem",
                    lineHeight: "1.9",
                    fontFamily: "'Open Sans', sans-serif",
                    color: "#4a5568",
                }}
            >
                Vashudhara is dedicated to bringing you the finest quality products with
                unparalleled service. Our mission is to blend timeless tradition with modern
                lifestyle, providing convenience, elegance, and ethical sourcing at your fingertips.
                We believe in creating a seamless shopping experience for every customer.
            </p>
        </section>
    );
};

// Footer Section Component
const Footer = () => {
    const hoverEffect = useHoverEffect();

    return (
        <footer
            style={{
                backgroundColor: "#f7fafc",
                color: "#4a5568",
                padding: "50px 20px",
                textAlign: "center",
                fontFamily: "'Poppins', sans-serif",
                userSelect: "none",
                borderTop: "1px solid #e2e8f0",
            }}
        >
            <div style={{ marginBottom: "30px" }}>
                {[{
                    href: "https://facebook.com",
                    label: "Facebook profile link",
                    icon: <FaFacebookF />
                }, {
                    href: "https://www.instagram.com/vashudharastore/",
                    label: "Instagram profile link",
                    icon: <FaInstagram />
                }, {
                    href: "https://twitter.com",
                    label: "Twitter profile link",
                    icon: <FaTwitter />
                }].map(({ href, label, icon }, idx) => (
                    <a
                        key={idx}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        {...hoverEffect}
                        style={{
                            margin: "0 18px",
                            color: "#4a5568",
                            fontSize: "28px",
                            transition: "color 0.3s ease, transform 0.3s ease",
                            outline: "none",
                            display: "inline-block",
                        }}
                        onFocus={(e) => (e.currentTarget.style.color = "#34d399")}
                        onBlur={(e) => (e.currentTarget.style.color = "#4a5568")}
                    >
                        {icon}
                    </a>
                ))}
            </div>
            <p style={{ fontSize: "1.05rem", userSelect: "none", color: "#6b7280" }}>
                © 2025 Vashudhara. All rights reserved. Designed with ❤️ in India.
            </p>
        </footer>
    );
};

// Main HomePage Component
const HomePage = () => {
    return (
        <>
            {/* Inject combined global styles for animations and responsive Hero background */}
            <style>{combinedGlobalStyles}</style>
            <Hero />
            <FeaturedProducts />
            <Categories />
            <WhyUs />
            <DeliveryGuarantee />
            <AboutUs />
            <Footer />
        </>
    );
};

export default HomePage;