import React from "react";
import styled from "styled-components";

// Define primary and accent colors for easier modification
const colors = {
    backgroundLight: "#ffffff", // Main background: white
    textDark: "#333333",        // Main text color: dark grey
    textMedium: "#555555",      // Slightly lighter text
    textSubtle: "#777777",      // Subtle text for roles/descriptions
    vibrantGreen: "#10B981",    // A strong green for titles and accents
    deepGreen: "#059669",      // Deeper green for underlines/highlights
    brightGreen: "#34D399",     // Brighter green for key highlights
    cardLight: "#f9f9f9",       // Light grey for card backgrounds
    cardBorder: "#e0e0e0",      // Light grey border for cards
    shadowColor: "rgba(0, 0, 0, 0.1)", // Soft shadow for depth
};

// Styled Components for a more professional and maintainable design

const AboutSection = styled.div`
    padding: 80px 30px;
    background-color: ${colors.backgroundLight};
    text-align: center;
    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: ${colors.textDark};
    line-height: 1.7;
    overflow-x: hidden; /* Prevent horizontal scroll on smaller screens */

    @media (max-width: 768px) {
        padding: 40px 15px; /* Reduce padding on smaller screens */
    }
`;

const Title = styled.h1`
    font-size: 48px;
    font-weight: 800;
    color: ${colors.vibrantGreen};
    margin-bottom: 30px;
    text-transform: uppercase;
    letter-spacing: 3px;
    position: relative;
    padding-bottom: 10px;
    display: inline-block; // Ensures the underline positions correctly under the text

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 4px;
        background-color: ${colors.deepGreen};
        border-radius: 2px;
    }

    @media (max-width: 992px) { /* Medium screens */
        font-size: 40px;
    }

    @media (max-width: 768px) { /* Smaller screens */
        font-size: 32px;
        letter-spacing: 2px;
        margin-bottom: 20px;
        &::after {
            width: 60px;
            height: 3px;
        }
    }
    @media (max-width: 480px) { /* Extra small screens */
        font-size: 28px;
        &::after {
            width: 50px;
            height: 2px;
        }
    }
`;

const SectionHeading = styled.h2`
    font-size: 32px;
    font-weight: 700;
    color: ${colors.textDark};
    margin-top: 50px;
    margin-bottom: 25px;
    position: relative;
    padding-bottom: 10px;
    display: inline-block; // Ensures the underline positions correctly under the text

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 3px;
        background-color: ${colors.deepGreen};
        border-radius: 1.5px;
    }

    @media (max-width: 992px) {
        font-size: 28px;
    }
    @media (max-width: 768px) {
        font-size: 24px;
        margin-top: 40px;
        margin-bottom: 20px;
        &::after {
            width: 40px;
            height: 2px;
        }
    }
    @media (max-width: 480px) {
        font-size: 20px;
        &::after {
            width: 30px;
            height: 2px;
        }
    }
`;

const Paragraph = styled.p`
    font-size: 19px;
    max-width: 950px;
    margin: 0 auto 25px auto;
    text-align: left;
    padding: 0 15px;
    color: ${colors.textMedium};

    @media (max-width: 992px) {
        font-size: 18px;
        max-width: 800px;
    }
    @media (max-width: 768px) {
        font-size: 16px;
        text-align: center; /* Center text on mobile for better readability */
        padding: 0 10px;
        margin-bottom: 20px;
    }
    @media (max-width: 480px) {
        font-size: 15px;
        padding: 0 5px;
    }
`;

const HighlightText = styled.strong`
    font-weight: 700;
    color: ${colors.deepGreen};
`;

const ContactLink = styled.a`
    color: ${colors.vibrantGreen};
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;

    &:hover {
        color: ${colors.deepGreen};
        text-decoration: underline;
    }
`;

const SingleTeamMember = styled.div`
    display: block;
    margin: 40px auto 20px auto;
    max-width: 250px;
`;

const TeamImage = styled.img`
    width: 180px;
    height: 180px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid ${colors.vibrantGreen};
    margin-bottom: 20px;
    box-shadow: 0 6px 20px ${colors.shadowColor};
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 25px ${colors.shadowColor};
    }

    @media (max-width: 768px) {
        width: 150px;
        height: 150px;
    }
`;

const TeamName = styled.p`
    font-size: 26px;
    font-weight: 700;
    color: ${colors.textDark};
    margin-bottom: 8px;

    @media (max-width: 768px) {
        font-size: 22px;
    }
`;

const TeamRole = styled.p`
    font-size: 18px;
    color: ${colors.textSubtle};

    @media (max-width: 768px) {
        font-size: 16px;
    }
`;

const ContentBlock = styled.div`
    display: flex;
    flex-direction: row; // Default to row for larger screens
    align-items: center;
    gap: 40px;
    max-width: 1100px;
    margin: 60px auto;
    padding: 0 20px;
    text-align: left;

    /* Reverse order on smaller screens for alternating layout */
    &:nth-of-type(even) { /* This targets the 2nd, 4th, etc. ContentBlock */
        flex-direction: row-reverse;
        @media (max-width: 768px) {
            flex-direction: column; /* Revert to column for mobile */
        }
    }

    @media (max-width: 992px) {
        gap: 30px;
        margin: 50px auto;
        padding: 0 15px;
    }
    @media (max-width: 768px) {
        flex-direction: column; /* Stack vertically on smaller screens */
        gap: 25px;
        margin: 40px auto;
        padding: 0 10px;
        text-align: center; /* Center content within the block on mobile */
    }
`;

const ImageContainer = styled.div`
    flex: 1;
    min-width: 300px; /* Ensure image doesn't get too small */
    max-width: 500px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 10px 30px ${colors.shadowColor};
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px ${colors.shadowColor};
    }

    @media (max-width: 768px) {
        min-width: unset; /* Remove min-width on mobile to allow shrinking */
        width: 90%; /* Take up more width on smaller screens */
        max-width: 400px; /* Cap max width on mobile for larger images */
    }
    @media (max-width: 480px) {
        width: 100%;
        max-width: 300px;
    }
`;

const BlockImage = styled.img`
    width: 100%;
    height: auto;
    display: block;
`;

const TextContainer = styled.div`
    flex: 1.5;
    padding: 20px;
    background-color: ${colors.cardLight};
    border-radius: 10px;
    box-shadow: 0 8px 20px ${colors.shadowColor};
    color: ${colors.textMedium};
    border: 1px solid ${colors.cardBorder};

    @media (max-width: 992px) {
        padding: 18px;
    }
    @media (max-width: 768px) {
        padding: 15px;
        text-align: center; /* Center text in blocks on mobile */
        flex: unset; /* Allow it to adjust naturally */
        width: 100%;
    }
`;

const BlockHeading = styled.h3`
    font-size: 28px;
    font-weight: 700;
    color: ${colors.vibrantGreen};
    margin-bottom: 15px;

    @media (max-width: 992px) {
        font-size: 24px;
    }
    @media (max-width: 768px) {
        font-size: 20px;
        margin-bottom: 10px;
    }
    @media (max-width: 480px) {
        font-size: 18px;
    }
`;

const BlockText = styled.p`
    font-size: 17px;
    line-height: 1.6;
    margin-bottom: 10px;

    @media (max-width: 992px) {
        font-size: 16px;
    }
    @media (max-width: 768px) {
        font-size: 15px;
        line-height: 1.5;
        margin-bottom: 8px;
    }
    @media (max-width: 480px) {
        font-size: 14px;
    }
`;

const List = styled.ul`
    list-style: none; /* Remove default bullet points */
    padding: 0;
    margin: 0;
    text-align: left; /* Keep text left-aligned within the list items */
    
    @media (max-width: 768px) {
        text-align: center; /* Center list items on mobile */
    }
`;

const ListItem = styled.li`
    margin-bottom: 15px; /* Space between list items */
    position: relative;
    padding-left: 25px; /* Space for custom bullet */

    &::before {
        content: '✓'; /* Custom checkmark bullet */
        color: ${colors.vibrantGreen};
        font-weight: bold;
        position: absolute;
        left: 0;
        top: 0;
    }

    &:last-child {
        margin-bottom: 0; /* No margin after the last item */
    }
`;


const SocialIcon = styled.img`
    width: 120px;
    height: 120px;
    object-fit: contain;
    border-radius: 10px;
    box-shadow: 0 5px 15px ${colors.shadowColor};
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    padding: 10px;
    background-color: ${colors.backgroundLight};

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 8px 20px ${colors.shadowColor};
    }

    @media (max-width: 768px) {
        width: 80px;
        height: 80px;
    }
`;

const SocialCard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    flex: 1; /* Allows cards to take equal space in a row */
    min-width: 300px;
    padding: 30px;
    background-color: ${colors.cardLight};
    border-radius: 10px;
    box-shadow: 0 8px 20px ${colors.shadowColor};
    border: 1px solid ${colors.cardBorder};
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 25px ${colors.shadowColor};
    }

    @media (max-width: 768px) {
        min-width: unset;
        width: 90%; /* Take more width on smaller screens */
        padding: 20px;
        margin-bottom: 0; /* Remove specific margin, handled by gap in container */
        max-width: 350px; /* Cap width for better form */
    }
    @media (max-width: 480px) {
        width: 100%; /* Full width on very small screens */
        padding: 15px;
    }
`;

const SocialCardText = styled(BlockText)`
    font-size: 18px;
    color: ${colors.textMedium};
    margin-bottom: 0;

    @media (max-width: 768px) {
        font-size: 16px;
    }
    @media (max-width: 480px) {
        font-size: 14px;
    }
`;

const SocialCardsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 40px; /* Space between cards */
    max-width: 1000px;
    margin: 40px auto 60px auto;

    @media (max-width: 992px) {
        gap: 30px;
    }
    @media (max-width: 768px) {
        flex-direction: column; /* Stack cards vertically on mobile */
        align-items: center;
        gap: 20px;
        margin: 30px auto 50px auto;
    }
`;

const MissionBlock = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    background-color: ${colors.cardLight};
    min-height: 300px;
    max-width: 1100px;
    margin: 60px auto;
    border-radius: 15px;
    box-shadow: 0 10px 25px ${colors.shadowColor};
    border: 1px solid ${colors.cardBorder};

    @media (max-width: 992px) {
        padding: 1.2rem;
        min-height: 250px;
        gap: 30px;
    }
    @media (max-width: 768px) {
        flex-direction: column;
        min-height: unset;
        margin: 40px auto;
        padding: 1rem;
        border-radius: 10px;
        text-align: center;
        gap: 20px;
    }
`;

const MissionImage = styled.img`
    width: 25%;
    height: auto;
    border-radius: 10px;
    margin-left: 2rem;
    border: 1px solid ${colors.cardBorder};

    @media (max-width: 992px) {
        width: 30%;
        margin-left: 1.5rem;
    }
    @media (max-width: 768px) {
        width: 50%;
        margin-left: 0;
        margin-top: 20px;
    }
    @media (max-width: 480px) {
        width: 65%;
    }
`;

const MissionTextContent = styled.div`
    flex: 1;
    padding-right: 1.5rem;
    color: ${colors.textMedium};

    @media (max-width: 768px) {
        padding-right: 0;
    }

    h3 {
        font-size: 1.8rem;
        font-weight: bold;
        margin-bottom: 0.75rem;
        color: ${colors.vibrantGreen};

        @media (max-width: 992px) {
            font-size: 1.6rem;
        }
        @media (max-width: 768px) {
            font-size: 1.4rem;
            margin-bottom: 0.5rem;
        }
        @media (max-width: 480px) {
            font-size: 1.2rem;
        }
    }

    p {
        font-size: 1.1rem;
        line-height: 1.6;
        color: ${colors.textMedium};

        @media (max-width: 992px) {
            font-size: 1rem;
        }
        @media (max-width: 768px) {
            font-size: 0.95rem;
        }
        @media (max-width: 480px) {
            font-size: 0.9rem;
        }
    }
`;


const About = () => {
    return (
        <AboutSection>
            <Title>
                About Vashudhara
            </Title>

            <Paragraph>
                At <HighlightText>Vashudhara</HighlightText>, we are with you every step of the way to make each day special. We believe that your beauty shines not just on your face, but also through your **style and accessories**. Since our inception, our goal has been to offer you a unique collection of **premium quality earrings, rings, other exquisite accessories, and splendid festive wear**, blending the latest trends with the richness of Indian tradition.
            </Paragraph>
            <Paragraph>
                We meticulously select each product, ensuring it meets our <HighlightText>high-quality standards</HighlightText> for craftsmanship, durability, and elegance. At Vashudhara, you don't just get products; you gain an experience – where your style journey truly begins.
            </Paragraph>

            ---

            <SectionHeading>
                Meet Our Founder
            </SectionHeading>
            <SingleTeamMember>
                <TeamImage
                    src="/rohn.jpg"
                    alt="Rohan Pawar - Founder of Vashudhara"
                    loading="lazy" // Add lazy loading for performance
                />
                <TeamName>Rohan Pawar</TeamName>
                <TeamRole>Founder & CEO, Vashudhara</TeamRole>
            </SingleTeamMember>
            <Paragraph style={{ textAlign: "center", marginTop: "20px" }}>
                Rohan Pawar's vision and passion laid the foundation of Vashudhara. His aim was to empower every individual to express their unique identity through style. Vashudhara is the culmination of his dream, where quality, innovation, and customer satisfaction are paramount.
            </Paragraph>

            ---

            <SectionHeading>
                Our Mission
            </SectionHeading>
            <MissionBlock>
                <MissionTextContent>
                    <h3>Our Mission</h3>
                    <p>
                        Our mission is to <HighlightText>empower every individual</HighlightText> to express their unique style with confidence. We aim to provide a blend of modern trends and rich Indian tradition – especially through our <HighlightText>stunning earrings, rings, and festive wear</HighlightText>.
                    </p>
                </MissionTextContent>

                <MissionImage
                    src="/bg remove modal2.png"
                    alt="Vashudhara Mission - A woman confidently showcasing accessories"
                    loading="lazy"
                />
            </MissionBlock>

            ---

            <SectionHeading>
                Our Vision
            </SectionHeading>
            <ContentBlock>
                <TextContainer>
                    <BlockHeading>Our Vision</BlockHeading>
                    <BlockText>
                        Our vision is to become a <HighlightText>leading e-commerce destination in India</HighlightText>, where customers receive not just the finest **accessories and festive wear**, but also an incredible shopping experience and unparalleled customer service.
                    </BlockText>
                </TextContainer>
                <ImageContainer>
                    <BlockImage
                        src="/Ecommerce checkout laptop-rafiki.png"
                        alt="Vashudhara Vision - Representing growth and reach"
                        loading="lazy"
                    />
                </ImageContainer>
            </ContentBlock>

            ---

            <SectionHeading>
                Why Trust Us?
            </SectionHeading>
            <ContentBlock>
                <TextContainer>
                    <List>
                        <ListItem>
                            <BlockText as="span"> {/* Use 'as="span"' to avoid redundant <p> tag within <li> */}
                                <HighlightText>Quality Assurance:</HighlightText> We take full responsibility for the quality of every **earring, ring, and festive wear** item. You'll only receive what we ourselves would love to wear – crafted to the highest standards of workmanship and durability.
                            </BlockText>
                        </ListItem>
                        <ListItem>
                            <BlockText as="span">
                                <HighlightText>Unmatched Customer Service:</HighlightText> Your satisfaction is our top priority. Our dedicated team is always ready to assist you, every step of your **accessory and festive shopping** journey.
                            </BlockText>
                        </ListItem>
                        <ListItem>
                            <BlockText as="span">
                                <HighlightText>Fusion of Trend and Tradition:</HighlightText> We blend modern **accessory trends** with rich Indian culture and tradition, ensuring you always stand out with a unique and elegant style, whether for casual wear or any festive occasion.
                            </BlockText>
                        </ListItem>
                        <ListItem>
                            <BlockText as="span">
                                <HighlightText>Secure & Easy Shopping:</HighlightText> The security of your personal information and payment details is our highest priority. Our website and ordering process are completely secure and user-friendly.
                            </BlockText>
                        </ListItem>
                    </List>
                </TextContainer>
                <ImageContainer>
                    <BlockImage
                        src="/Rcomlaptop.png"
                        alt="Why trust us - Representing quality and trust"
                        loading="lazy"
                    />
                </ImageContainer>
            </ContentBlock>

            ---

            <SectionHeading>
                Your Order, Your Convenience
            </SectionHeading>
            <Paragraph>
                Shopping at Vashudhara is now even easier! In addition to our website, you can also place your orders via **Instagram and WhatsApp** at your convenience. We are committed to creating the best shopping experience for you.
            </Paragraph>

            <SocialCardsContainer>
                <SocialCard>
                    <SocialIcon
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png"
                        alt="Instagram Logo"
                        loading="lazy"
                    />
                    <SocialCardText>
                        <HighlightText>Order via Instagram:</HighlightText> Follow us on Instagram for our latest collection of **earrings, rings, festive wear, and other accessories** and daily updates. To order directly from our posts and stories, simply DM us!
                        <br />
                        <ContactLink href="https://www.instagram.com/vashudharastore/" target="_blank" rel="noopener noreferrer">
                            <HighlightText>@vashudharastore</HighlightText>
                        </ContactLink>
                    </SocialCardText>
                </SocialCard>

                <SocialCard>
                    <SocialIcon
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/WhatsApp_logo.png/597px-WhatsApp_logo.png"
                        alt="WhatsApp Logo"
                        loading="lazy"
                    />
                    <SocialCardText>
                        <HighlightText>Order via WhatsApp:</HighlightText> For personal assistance or quick orders, message us on WhatsApp. Our team is always available to help you.
                        <br />
                        <ContactLink href="https://wa.me/918518909397" target="_blank" rel="noopener noreferrer">
                            <HighlightText>+91 8518909397</HighlightText>
                        </ContactLink>
                    </SocialCardText>
                </SocialCard>
            </SocialCardsContainer>

            <Paragraph style={{ marginTop: "60px", fontSize: "20px", fontWeight: "600", color: colors.vibrantGreen, textAlign: "center" }}>
                Thank you for visiting Vashudhara. We hope you find your new style here and have a memorable shopping experience!
            </Paragraph>
        </AboutSection>
    );
};

export default About;