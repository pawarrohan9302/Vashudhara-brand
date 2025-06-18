import React from "react";

const About = () => {
    // Define primary and accent colors for easier modification
    const colors = {
        backgroundLight: "#ffffff", // Main background: white
        textDark: "#333333",        // Main text color: dark grey
        textMedium: "#555555",      // Slightly lighter text
        textSubtle: "#777777",      // Subtle text for roles/descriptions
        vibrantGreen: "#10B981",    // A strong green for titles and accents
        deepGreen: "#059669",       // Deeper green for underlines/highlights
        brightGreen: "#34D399",     // Brighter green for key highlights
        cardLight: "#f9f9f9",       // Light grey for card backgrounds
        cardBorder: "#e0e0e0",      // Light grey border for cards
        shadowColor: "rgba(0, 0, 0, 0.1)", // Soft shadow for depth
    };

    // Main styles object for consistent design across the component
    const styles = {
        aboutSection: {
            padding: "80px 30px",
            backgroundColor: colors.backgroundLight, // Set main background to white
            textAlign: "center",
            fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            color: colors.textDark, // Adjust text color for readability on white
            lineHeight: "1.7",
            overflowX: "hidden",
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
            color: colors.textDark, // Changed for better contrast on white
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
            color: colors.textMedium, // Adjusted for readability
        },
        highlightText: {
            fontWeight: "700",
            color: colors.deepGreen, // Ensure highlights stand out
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
            color: colors.textDark, // Adjusted for readability
            marginBottom: "8px",
        },
        teamRole: {
            fontSize: "18px",
            color: colors.textSubtle, // Adjusted for readability
        },
        // --- Styles for Alternating Layout ---
        contentBlock: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "40px",
            maxWidth: "1100px",
            margin: "60px auto",
            padding: "0 20px",
            textAlign: "left",
            "@media (min-width: 768px)": {
                flexDirection: "row",
                textAlign: "left",
            },
        },
        imageContainer: {
            flex: "1",
            minWidth: "300px",
            maxWidth: "500px",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: `0 10px 30px ${colors.shadowColor}`,
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
        },
        blockImage: {
            width: "100%",
            height: "auto",
            display: "block",
        },
        textContainer: {
            flex: "1.5",
            padding: "20px",
            backgroundColor: colors.cardLight, // Light background for text blocks
            borderRadius: "10px",
            boxShadow: `0 8px 20px ${colors.shadowColor}`,
            color: colors.textMedium, // Text color inside blocks
            border: `1px solid ${colors.cardBorder}`, // Subtle border for definition
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
        socialIcon: {
            width: "150px",
            height: "150px",
            objectFit: "contain",
            borderRadius: "10px",
            boxShadow: `0 5px 15px ${colors.shadowColor}`,
        },
        socialTextContainer: {
            flex: "1.5",
            padding: "20px",
            backgroundColor: colors.cardLight, // Light background for social text blocks
            borderRadius: "10px",
            boxShadow: `0 8px 20px ${colors.shadowColor}`,
            color: colors.textMedium, // Text color inside blocks
            textAlign: "left",
            border: `1px solid ${colors.cardBorder}`, // Subtle border for definition
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

            <h2 style={styles.sectionHeading}>
                Meet Our Founder
                <span style={styles.sectionHeadingUnderline}></span>
            </h2>
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

            <h2 style={styles.sectionHeading}>
                Our Mission
                <span style={styles.sectionHeadingUnderline}></span>
            </h2>
            <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                backgroundColor: colors.cardLight, // Changed to light card background
                minHeight: "300px",
                maxWidth: "1100px",
                margin: "60px auto",
                borderRadius: "10px",
                boxShadow: `0 8px 20px ${colors.shadowColor}`,
                border: `1px solid ${colors.cardBorder}` // Added a light border
            }}>
                <div style={{
                    flex: 1,
                    paddingRight: "1rem",
                    color: colors.textMedium // Adjusted text color
                }}>
                    <h3 style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        marginBottom: "0.5rem",
                        color: colors.vibrantGreen // Adjusted heading color
                    }}>Our Mission</h3>
                    <p style={{
                        fontSize: "0.95rem",
                        lineHeight: "1.5",
                        color: colors.textMedium // Adjusted text color
                    }}>
                        Our mission is to <strong style={{ color: colors.highlightText, fontWeight: "bold" }}>empower every individual</strong> to express their unique style with confidence. We aim to provide a blend of modern trends and rich Indian tradition – especially through our <strong style={{ color: colors.highlightText, fontWeight: "bold" }}>stunning earrings, rings, and festive wear</strong>.
                    </p>
                </div>

                <img
                    src="/ChatGPT Image Jun 14, 2025, 01_43_06 PM.png"
                    alt="Vashudhara Mission"
                    style={{
                        width: "20%",
                        height: "20%",
                        borderRadius: "10px",
                        filter: "none", // Removed dark filter for white background
                        marginLeft: "2rem",
                        border: `1px solid ${colors.cardBorder}` // Added a light border
                    }}
                />
            </div>

            ---

            <h2 style={styles.sectionHeading}>
                Our Vision
                <span style={styles.sectionHeadingUnderline}></span>
            </h2>
            <div style={styles.contentBlock}>
                <div style={styles.textContainer}>
                    <h3 style={styles.blockHeading}>Our Vision</h3>
                    <p style={styles.blockText}>
                        Our vision is to become a <strong style={styles.highlightText}>leading e-commerce destination in India</strong>, where customers receive not just the finest **accessories and festive wear**, but also an incredible shopping experience and unparalleled customer service.
                    </p>
                </div>
                <div style={styles.imageContainer}>
                    <img
                        src="https://images.unsplash.com/photo-1621252873837-773a4b9c5f6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDcxMzJ8MHwxfHNlYXJjaHw4fHxmaW5lJTIwamV3ZWxsZXJ5fGVufDB8fHx8MTcxODUwNzE3MHww&ixlib=rb-4.0.3&q=80&w=1080"
                        alt="Vashudhara Vision"
                        style={styles.blockImage}
                    />
                </div>
            </div>

            ---

            <h2 style={styles.sectionHeading}>
                Why Trust Us?
                <span style={styles.sectionHeadingUnderline}></span>
            </h2>
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
                        src="https://images.unsplash.com/photo-1620799140403-edc65215099e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDcxMzJ8MHwxfHNlYXJjaHw3OXx8cXVhbGl0eSUyMGluc3BlY3Rpb258ZW58MHx8fHwxNzE4Mzg2MzI2fDA&ixlib=rb-4.0.3&q=80&w=1080"
                        alt="Quality Assurance"
                        style={styles.blockImage}
                    />
                </div>
            </div>

            ---

            <h2 style={styles.sectionHeading}>
                Your Order, Your Convenience
                <span style={styles.sectionHeadingUnderline}></span>
            </h2>
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
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png"
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
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/WhatsApp_logo.png/597px-WhatsApp_logo.png"
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