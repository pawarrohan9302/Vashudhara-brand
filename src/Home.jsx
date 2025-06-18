import React, { useCallback } from "react";
import {
    FaLeaf, // Not used in the provided code, but kept for completeness
    FaShippingFast,
    FaStar,
    FaShieldAlt,
    FaFacebookF,
    FaInstagram,
    FaTwitter,
} from "react-icons/fa";

// CSS keyframes inside a <style> tag or external CSS is recommended,
// but here we inject via React for convenience
const styles = `
@keyframes fadeInDown {
    0% {opacity: 0; transform: translateY(-20px);}
    100% {opacity: 1; transform: translateY(0);}
}
@keyframes fadeInUp {
    0% {opacity: 0; transform: translateY(20px);}
    100% {opacity: 1; transform: translateY(0);}
}
@keyframes fadeIn {
    0% {opacity: 0;}
    100% {opacity: 1;}
}
`;

const useHoverEffect = () => {
    const onMouseEnter = useCallback((e) => {
        e.currentTarget.style.transform = "scale(1.07)";
        e.currentTarget.style.boxShadow = "0 15px 40px rgba(52, 211, 153, 0.7)";
    }, []);

    const onMouseLeave = useCallback((e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "";
    }, []);

    return { onMouseEnter, onMouseLeave };
};

const Hero = () => {
    const buttonHover = useHoverEffect();

    const handleShopNow = () => {
        window.location.href = "/collections";
    };

    return (
        <section
            style={{
                // Removed the linear-gradient overlay here
                backgroundImage: "url('/HD.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                color: "#fff", // Changed text color to white for better contrast with potentially dark image
                padding: "160px 20px",
                textAlign: "center",
                borderBottom: "5px solid #34d399",
                fontFamily: "'Poppins', sans-serif",
                animation: "fadeInDown 1.2s ease forwards",
                userSelect: "none",
            }}
            id="home"
            aria-label="Welcome section"
        >
            <h1
                style={{
                    fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                    fontWeight: "900",
                    marginBottom: "20px",
                    textShadow: "3px 3px 15px rgba(0,0,0,0.8)", // Adjusted text shadow for dark text
                    lineHeight: "1.1",
                    animation: "fadeInUp 1.5s ease forwards",
                }}
            >
                Welcome to <span style={{ color: "#34d399" }}>Vashudhara</span>
            </h1>
            <p
                style={{
                    fontSize: "clamp(1rem, 2vw, 1.25rem)",
                    maxWidth: "620px",
                    margin: "0 auto",
                    lineHeight: "1.7",
                    color: "#d1d5db", // Light text color for better readability on original image
                    fontFamily: "'Open Sans', sans-serif",
                    animation: "fadeInUp 1.7s ease forwards",
                }}
            >
                Discover premium clothing, accessories, and lifestyle products — curated
                for elegance, crafted with care.
            </p>
            <button
                {...buttonHover}
                onClick={handleShopNow}
                style={{
                    marginTop: "45px",
                    padding: "18px 48px",
                    backgroundColor: "#34d399",
                    border: "none",
                    borderRadius: "14px",
                    fontWeight: "700",
                    fontSize: "1.25rem",
                    color: "#0f172a",
                    cursor: "pointer",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    boxShadow: "0 6px 15px rgba(52, 211, 153, 0.7)",
                    outlineOffset: "4px",
                }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = "0 8px 25px rgba(52,211,153,0.9)")}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "0 6px 15px rgba(52,211,153,0.7)")}
                aria-label="Shop now button"
            >
                Shop Now
            </button>
        </section>
    );
};

const Categories = () => {
    // Updated order of categories as requested
    const categories = [
        "Women's Earrings",
        "Rings",
        "Festive Mauve Lehenga Set ✨",
        "Accessories"
    ];
    const hoverEffect = useHoverEffect();

    return (
        <section
            style={{
                backgroundColor: "#ffffff", // Changed to white
                padding: "60px 20px",
                textAlign: "center",
                fontFamily: "'Poppins', sans-serif",
            }}
            id="categories"
            aria-label="Product categories"
        >
            <h2
                style={{
                    fontSize: "clamp(2rem, 4vw, 2.5rem)",
                    fontWeight: "700",
                    color: "#1a202c", // Changed to dark for contrast
                    marginBottom: "50px",
                    animation: "fadeIn 1.5s ease forwards",
                    userSelect: "none",
                }}
            >
                Explore Our Categories
            </h2>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "30px",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "0 20px",
                }}
            >
                {categories.map((category, index) => {
                    let imagePath = "";
                    let targetUrl = `/collections/${category.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, '')}`;

                    switch (category) {
                        case "Rings":
                            imagePath = "/Rings Hd.webp";
                            targetUrl = "/womens-wear"; // Specific target for "Rings"
                            break;
                        case "Accessories":
                            imagePath = "/Untitled design (2).png";
                            targetUrl = "/accessories"; // Changed target URL to /accessories
                            break;
                        case "Festive Mauve Lehenga Set ✨":
                            imagePath = "/Untitled design (1).png";
                            targetUrl = "/collections"; // Specific target for this item
                            break;
                        case "Women's Earrings":
                            imagePath = "/womens%20earrings.jpg";
                            targetUrl = "/mens-wear"; // Specific target
                            break;
                        default:
                            // Fallback for any other categories
                            imagePath = `/${category.toLowerCase().replace(/ /g, "").replace(/[^a-z0-9]/g, '')}.webp`;
                    }

                    return (
                        <div
                            key={index}
                            role="button"
                            tabIndex={0}
                            onClick={() => window.location.href = targetUrl} // Use dynamic targetUrl
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    window.location.href = targetUrl; // Use dynamic targetUrl
                                }
                            }}
                            {...hoverEffect}
                            style={{
                                backgroundColor: "#edf2f7", // Light background for cards
                                borderRadius: "16px",
                                boxShadow: "0 6px 25px rgba(52, 211, 153, 0.3)",
                                overflow: "hidden",
                                transition: "transform 0.3s ease, boxShadow 0.3s ease",
                                cursor: "pointer",
                                height: "350px",
                                position: "relative",
                                outline: "none",
                                userSelect: "none",
                            }}
                            aria-label={`${category} category`}
                        >
                            <img
                                src={imagePath}
                                alt={category}
                                loading="lazy"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    filter: "brightness(0.95)", // Slightly adjusted brightness
                                    transition: "transform 0.3s ease",
                                }}
                            />
                            <h3
                                style={{
                                    position: "absolute",
                                    bottom: "20px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    padding: "12px 28px",
                                    backgroundColor: "rgba(255, 255, 255, 0.8)", // Adjusted for white background
                                    color: "#34d399",
                                    fontWeight: "700",
                                    fontSize: "1.3rem",
                                    borderRadius: "10px",
                                    letterSpacing: "1.2px",
                                    pointerEvents: "none",
                                    userSelect: "none",
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)", // Added shadow for text clarity
                                }}
                            >
                                {category}
                            </h3>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

const WhyUs = () => {
    const reasons = [
        {
            icon: <FaStar />,
            title: "Premium Quality",
            description:
                "Handpicked materials & detailed craftsmanship for a luxurious experience.",
        },
        {
            icon: <FaShippingFast />,
            title: "Instant Delivery",
            description:
                "Get your order delivered in just 7days! Fast, safe, and trackable delivery.",
        },
        {
            icon: <FaShieldAlt />,
            title: "Secure Shopping",
            description:
                "Your data and purchases are protected with top-tier encryption & trust.",
        },
    ];

    const hoverEffect = useHoverEffect();

    return (
        <section
            style={{
                padding: "80px 20px",
                backgroundColor: "#ffffff", // Changed to white
                textAlign: "center",
                fontFamily: "'Poppins', sans-serif",
                userSelect: "none",
            }}
            aria-label="Why choose us"
        >
            <h2
                style={{
                    fontSize: "clamp(2.25rem, 4vw, 2.5rem)",
                    color: "#1a202c", // Changed to dark for contrast
                    fontWeight: "700",
                    marginBottom: "50px",
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
                    maxWidth: "1100px",
                    margin: "0 auto",
                }}
            >
                {reasons.map((item, index) => (
                    <div
                        key={index}
                        {...hoverEffect}
                        tabIndex={0}
                        aria-label={`${item.title} feature`}
                        style={{
                            backgroundColor: "#edf2f7", // Light background for cards
                            padding: "36px 24px",
                            borderRadius: "22px",
                            width: "300px",
                            boxShadow: "0 14px 38px rgba(52, 211, 153, 0.3)",
                            transition: "transform 0.3s ease, boxShadow 0.3s ease",
                            cursor: "pointer",
                            textAlign: "center",
                            color: "#4a5568", // Changed to dark for contrast
                            outline: "none",
                            userSelect: "none",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "48px",
                                color: "#34d399",
                                marginBottom: "20px",
                            }}
                        >
                            {item.icon}
                        </div>
                        <h4
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "700",
                                color: "#1a202c", // Changed to dark for contrast
                                marginBottom: "15px",
                            }}
                        >
                            {item.title}
                        </h4>
                        <p
                            style={{
                                fontSize: "1rem",
                                color: "#4a5568", // Changed to dark for contrast
                                lineHeight: "1.7",
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

const DeliveryGuarantee = () => {
    return (
        <section
            style={{
                backgroundColor: "#ffffff", // Changed to white
                padding: "60px 20px",
                display: "flex",
                justifyContent: "center",
                userSelect: "none",
            }}
            aria-label="Delivery guarantee"
        >
            <div
                style={{
                    maxWidth: "700px",
                    backgroundColor: "#edf2f7", // Light background for the content box
                    borderRadius: "20px",
                    padding: "44px 36px",
                    boxShadow: "0 12px 38px rgba(52, 211, 153, 0.45)",
                    textAlign: "center",
                    color: "#1a202c", // Changed to dark for contrast
                    fontFamily: "'Poppins', sans-serif",
                    lineHeight: "1.75",
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    border: "2.5px solid #34d399",
                    animation: "fadeIn 1.8s ease forwards",
                }}
            >
                <p style={{ marginBottom: "14px" }}>
                    <strong style={{ color: "#34d399", fontSize: "1.3rem" }}>
                        Fast & Reliable Delivery
                    </strong>
                </p>
                <p>
                    Experience prompt delivery with Vashudhara — we ensure your order
                    reaches you swiftly and safely, usually within 7days.
                    our commitment to quality service means you can trust us to deliver
                    your products right to your doorstep, no matter where you are
                </p>
                <p style={{ marginTop: "24px", fontStyle: "italic", color: "#4a5568" }}> {/* Darker italic text */}
                    Wherever you are, enjoy seamless doorstep delivery tailored for your
                    convenience.
                </p>
            </div>
        </section>
    );
};

const AboutUs = () => {
    return (
        <section
            style={{
                padding: "80px 20px",
                backgroundColor: "#ffffff", // Changed to white
                color: "#1a202c", // Changed to dark for contrast
                textAlign: "center",
                fontFamily: "'Poppins', sans-serif",
                animation: "fadeIn 2s ease forwards",
                userSelect: "none",
            }}
            aria-label="About us"
        >
            <h2
                style={{
                    fontSize: "clamp(2rem, 4vw, 2.5rem)",
                    fontWeight: "700",
                    marginBottom: "30px",
                    color: "#34d399",
                }}
            >
                About Us
            </h2>
            <p
                style={{
                    maxWidth: "850px",
                    margin: "0 auto",
                    fontSize: "1.125rem",
                    lineHeight: "1.75",
                    fontFamily: "'Open Sans', sans-serif",
                    color: "#4a5568", // Darker text color
                }}
            >
                Vashudhara is dedicated to bringing you the finest quality products with
                unparalleled service. Our mission is to blend tradition with modern
                lifestyle, providing convenience and elegance at your fingertips.
            </p>
        </section>
    );
};

const Footer = () => {
    const hoverEffect = useHoverEffect();

    return (
        <footer
            style={{
                backgroundColor: "#f7fafc", // Light background for the footer
                color: "#4a5568", // Darker text color
                padding: "40px 20px",
                textAlign: "center",
                fontFamily: "'Poppins', sans-serif",
                userSelect: "none",
            }}
        >
            <div style={{ marginBottom: "20px" }}>
                {[{
                    href: "https://facebook.com",
                    label: "Facebook",
                    icon: <FaFacebookF />
                }, {
                    href: "https://www.instagram.com/vashudharastore/",
                    label: "Instagram",
                    icon: <FaInstagram />
                }, {
                    href: "https://twitter.com",
                    label: "Twitter",
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
                            margin: "0 14px",
                            color: "#4a5568", // Darker icon color
                            fontSize: "24px",
                            transition: "color 0.3s ease",
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
            <p style={{ fontSize: "1rem", userSelect: "none" }}>
                © 2025 Vashudhara. All rights reserved.
            </p>
        </footer>
    );
};

const HomePage = () => {
    return (
        <>
            {/* Inject styles for animations */}
            <style>{styles}</style>
            <Hero />
            <Categories />
            <WhyUs />
            <DeliveryGuarantee />
            <AboutUs />
            <Footer />
        </>
    );
};

export default HomePage;