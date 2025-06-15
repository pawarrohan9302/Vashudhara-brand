// src/components/About.jsx
import React from "react";

const About = () => {
    // Define primary and accent colors for easier modification
    const colors = {
        backgroundDark: "#1a1a1a",
        textLight: "#e0e0e0",
        textMedium: "#d0d0d0",
        textSubtle: "#c0c0c0",
        vibrantGreen: "#34d399", // Main brand green
        deepGreen: "#28a745",    // Deeper green for contrast/accents
        brightGreen: "#6be097",  // Brighter green for highlights
        cardDark: "#2a2a2a",
        cardBorder: "#3a3a3a",
        shadowColor: "rgba(0, 0, 0, 0.4)",
    };

    // Main styles object for consistent design across the component
    const styles = {
        aboutSection: {
            padding: "80px 30px",
            backgroundColor: colors.backgroundDark,
            textAlign: "center",
            fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            color: colors.textLight,
            lineHeight: "1.7",
            overflowX: "hidden", // Prevents horizontal scroll from potential content overflow
        },
        title: {
            fontSize: "48px",
            fontWeight: "800",
            color: colors.vibrantGreen,
            marginBottom: "30px",
            textTransform: "uppercase",
            letterSpacing: "3px",
            position: "relative",
            paddingBottom: "10px",
        },
        titleUnderline: {
            content: '""',
            position: "absolute",
            bottom: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80px",
            height: "4px",
            backgroundColor: colors.deepGreen,
            borderRadius: "2px",
        },
        sectionHeading: {
            fontSize: "32px",
            fontWeight: "700",
            color: colors.vibrantGreen,
            marginTop: "50px",
            marginBottom: "25px",
            position: "relative",
            paddingBottom: "10px",
        },
        sectionHeadingUnderline: {
            content: '""',
            position: "absolute",
            bottom: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: "60px",
            height: "3px",
            backgroundColor: colors.deepGreen,
            borderRadius: "1.5px",
        },
        paragraph: {
            fontSize: "19px",
            maxWidth: "950px",
            margin: "0 auto 25px auto",
            textAlign: "left",
            padding: "0 15px",
            color: colors.textMedium,
        },
        highlightText: {
            fontWeight: "700",
            color: colors.brightGreen,
        },
        contactLink: {
            color: colors.vibrantGreen,
            textDecoration: "none",
            fontWeight: "600",
            transition: "color 0.3s ease",
        },
        singleTeamMember: {
            display: "block",
            margin: "40px auto 20px auto",
            maxWidth: "250px",
        },
        teamImage: {
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            objectFit: "cover",
            border: `4px solid ${colors.vibrantGreen}`,
            marginBottom: "20px",
            boxShadow: `0 6px 20px ${colors.shadowColor}`,
        },
        teamName: {
            fontSize: "26px",
            fontWeight: "700",
            color: colors.textLight,
            marginBottom: "8px",
        },
        teamRole: {
            fontSize: "18px",
            color: colors.textSubtle,
        },
        // --- Styles for Alternating Layout (keeping content left, image right consistent) ---
        contentBlock: {
            display: "flex",
            flexDirection: "column", // Default for mobile: stack content
            alignItems: "center",
            gap: "40px",
            maxWidth: "1100px",
            margin: "60px auto",
            padding: "0 20px",
            textAlign: "left", // Text content aligns left within its block
            "@media (min-width: 768px)": {
                flexDirection: "row", // Desktop: row layout (content left, image right)
                textAlign: "left",
            },
        },
        imageContainer: {
            flex: "1", // Image takes up 1 part of available space
            minWidth: "300px", // Minimum size for image on desktop
            maxWidth: "500px",
            borderRadius: "10px",
            overflow: "hidden", // Ensures image respects border-radius
            boxShadow: `0 10px 30px ${colors.shadowColor}`,
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
        },
        blockImage: {
            width: "100%",
            height: "auto", // Maintain aspect ratio
            display: "block",
        },
        textContainer: {
            flex: "1.5", // Text takes up more space than image
            padding: "20px", // Padding inside the text block
            backgroundColor: colors.cardDark,
            borderRadius: "10px",
            boxShadow: `0 8px 20px ${colors.shadowColor}`,
            color: colors.textMedium,
        },
        blockHeading: {
            fontSize: "28px",
            fontWeight: "700",
            color: colors.vibrantGreen,
            marginBottom: "15px",
        },
        blockText: {
            fontSize: "17px",
            lineHeight: "1.6",
            marginBottom: "10px",
        },
        // Styles for social media icons/images (aligned to the right as part of contentBlock)
        socialIcon: {
            width: "150px", // Size of social media icons
            height: "150px",
            objectFit: "contain", // Ensure the full icon is visible
            borderRadius: "10px", // Slightly rounded corners for the icons
            boxShadow: `0 5px 15px ${colors.shadowColor}`,
        },
        socialTextContainer: {
            flex: "1.5",
            padding: "20px",
            backgroundColor: colors.cardDark,
            borderRadius: "10px",
            boxShadow: `0 8px 20px ${colors.shadowColor}`,
            color: colors.textMedium,
            textAlign: "left", // Align text left within the block
        }
    };

    return (
        <div style={styles.aboutSection}>
            <h1 style={styles.title}>
                About Vashudhara
                <span style={styles.titleUnderline}></span>
            </h1>

            <p style={styles.paragraph}>
                At <strong style={styles.highlightText}>Vashudhara</strong>, we are with you every step of the way to make each day special. We believe that your beauty shines not just on your face, but also through your **style and accessories**. Since our inception, our goal has been to offer you a unique collection of **premium quality earrings, rings, other exquisite accessories, and splendid festive wear**, blending the latest trends with the richness of Indian tradition.
            </p>
            <p style={styles.paragraph}>
                We meticulously select each product, ensuring it meets our <strong style={styles.highlightText}>high-quality standards</strong> for craftsmanship, durability, and elegance. At Vashudhara, you don't just get products; you gain an experience – where your style journey truly begins.
            </p>

            ---

            ## Meet Our Founder
            <div style={styles.singleTeamMember}>
                <img
                    src="/rohn.jpg" // Founder's image
                    alt="Rohan Pawar"
                    style={styles.teamImage}
                />
                <p style={styles.teamName}>Rohan Pawar</p>
                <p style={styles.teamRole}>Founder & CEO, Vashudhara</p>
            </div>
            <p style={{ ...styles.paragraph, textAlign: "center", marginTop: "20px" }}>
                Rohan Pawar's vision and passion laid the foundation of Vashudhara. His aim was to empower every individual to express their unique identity through style. Vashudhara is the culmination of his dream, where quality, innovation, and customer satisfaction are paramount.
            </p>

            ---

            <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                backgroundColor: "#000",
                minHeight: "300px"
            }}>
                <div style={{
                    flex: 1,
                    paddingRight: "1rem",
                    color: "#fff"
                }}>
                    <h3 style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        marginBottom: "0.5rem",
                        color: "#fff"
                    }}>Our Mission</h3>
                    <p style={{
                        fontSize: "0.95rem",
                        lineHeight: "1.5",
                        color: "#ccc"
                    }}>
                        Our mission is to <strong style={{ color: "#C19A6B", fontWeight: "bold" }}>empower every individual</strong> to express their unique style with confidence. We aim to provide a blend of modern trends and rich Indian tradition – especially through our <strong style={{ color: "#C19A6B", fontWeight: "bold" }}>stunning earrings, rings, and festive wear</strong>.
                    </p>
                </div>

                <img
                    src="/ChatGPT Image Jun 14, 2025, 01_43_06 PM.png"
                    alt="Vashudhara Mission"
                    style={{
                        width: "20%",
                        height: "20%",
                        borderRadius: "10px",
                        filter: "brightness(30%)",
                        marginLeft: "2rem"  // creates space between content and image
                    }}
                />
            </div>

            <div style={styles.contentBlock}>
                <div style={styles.textContainer}>
                    <h3 style={styles.blockHeading}>Our Vision</h3>
                    <p style={styles.blockText}>
                        Our vision is to become a <strong style={styles.highlightText}>leading e-commerce destination in India</strong>, where customers receive not just the finest **accessories and festive wear**, but also an incredible shopping experience and unparalleled customer service.
                    </p>
                </div>
                <div style={styles.imageContainer}>
                    <img
                        src="https://images.unsplash.com/photo-1621252873837-773a4b9c5f6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDcxMzJ8MHwxfHNlYXJjaHw4fHxmaW5lJTIwamV3ZWxsZXJ5fGVufDB8fHx8MTcxODUwNzE3MHww&ixlib=rb-4.0.3&q=80&w=1080" // Example image: fine jewelry/accessories
                        alt="Vashudhara Vision"
                        style={styles.blockImage}
                    />
                </div>
            </div>

            ---

            ## Why Trust Us?
            <div style={styles.contentBlock}>
                <div style={styles.textContainer}>
                    <p style={styles.blockText}>
                        <strong style={styles.highlightText}>Quality Assurance:</strong> We take full responsibility for the quality of every **earring, ring, and festive wear** item. You'll only receive what we ourselves would love to wear – crafted to the highest standards of workmanship and durability.
                    </p>
                    <p style={styles.blockText}>
                        <strong style={styles.highlightText}>Unmatched Customer Service:</strong> Your satisfaction is our top priority. Our dedicated team is always ready to assist you, every step of your **accessory and festive shopping** journey.
                    </p>
                    <p style={styles.blockText}>
                        <strong style={styles.highlightText}>Fusion of Trend and Tradition:</strong> We blend modern **accessory trends** with rich Indian culture and tradition, ensuring you always stand out with a unique and elegant style, whether for casual wear or any festive occasion.
                    </p>
                    <p style={styles.blockText}>
                        <strong style={styles.highlightText}>Secure & Easy Shopping:</strong> The security of your personal information and payment details is our highest priority. Our website and ordering process are completely secure and user-friendly.
                    </p>
                </div>
                <div style={styles.imageContainer}>
                    <img
                        src="https://images.unsplash.com/photo-1620799140403-edc65215099e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDcxMzJ8MHwxfHNlYXJjaHw3OXx8cXVhbGl0eSUyMGluc3BlY3Rpb258ZW58MHx8fHwxNzE4Mzg2MzI2fDA&ixlib=rb-4.0.3&q=80&w=1080" // Example: quality inspection
                        alt="Quality Assurance"
                        style={styles.blockImage}
                    />
                </div>
            </div>

            ---

            ## Your Order, Your Convenience
            <p style={styles.paragraph}>
                Shopping at Vashudhara is now even easier! In addition to our website, you can also place your orders via **Instagram and WhatsApp** at your convenience. We are committed to creating the best shopping experience for you.
            </p>

            <div style={styles.contentBlock}>
                <div style={styles.socialTextContainer}>
                    <p style={{ ...styles.blockText, fontSize: "19px" }}>
                        <strong style={styles.highlightText}>Order via Instagram:</strong> Follow us on Instagram for our latest collection of **earrings, rings, festive wear, and other accessories** and daily updates. To order directly from our posts and stories, simply DM us!
                        <br />
                        <a href="https://www.instagram.com/vashudharastore/" target="_blank" rel="noopener noreferrer" style={styles.contactLink}>
                            <strong style={styles.highlightText}>@vashudharastore</strong>
                        </a>
                    </p>
                </div>
                <div style={{ flex: "0 0 auto", textAlign: "center" }}>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png" // High-res Instagram logo
                        alt="Instagram Logo"
                        style={styles.socialIcon}
                    />
                </div>
            </div>

            <div style={styles.contentBlock}>
                <div style={styles.socialTextContainer}>
                    <p style={{ ...styles.blockText, fontSize: "19px" }}>
                        <strong style={styles.highlightText}>Order via WhatsApp:</strong> For personal assistance or quick orders, message us on WhatsApp. Our team is always available to help you.
                        <br />
                        <a href="https://wa.me/918518909397" target="_blank" rel="noopener noreferrer" style={styles.contactLink}>
                            <strong style={styles.highlightText}>+91 8518909397</strong>
                        </a>
                    </p>
                </div>
                <div style={{ flex: "0 0 auto", textAlign: "center" }}>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/WhatsApp_logo.png/597px-WhatsApp_logo.png" // High-res WhatsApp logo
                        alt="WhatsApp Logo"
                        style={styles.socialIcon}
                    />
                </div>
            </div>

            <p style={{ ...styles.paragraph, marginTop: "60px", fontSize: "20px", fontWeight: "600", color: colors.vibrantGreen, textAlign: "center" }}>
                Thank you for visiting Vashudhara. We hope you find your new style here and have a memorable shopping experience!
            </p>
        </div>
    );
};

export default About;