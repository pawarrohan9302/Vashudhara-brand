// src/components/About.jsx
import React from "react";

const About = () => {
    const aboutStyle = {
        padding: "40px 50px",
        backgroundColor: "#f1f5f9",
        textAlign: "center",
    };

    const aboutTitleStyle = {
        fontSize: "36px",
        fontWeight: "700",
        color: "#34d399",
        marginBottom: "20px",
    };

    const aboutTextStyle = {
        fontSize: "18px",
        color: "#3b3b3b",
        maxWidth: "800px",
        margin: "0 auto",
    };

    return (
        <div style={aboutStyle}>
            <h1 style={aboutTitleStyle}>About Us</h1>
            <p style={aboutTextStyle}>
                Vashudhara is your go-to destination for premium fashion, offering a wide range of clothing, accessories, and more.
                We focus on delivering high-quality, stylish products to help you look your best every day.
                Our commitment is to provide our customers with the latest trends in fashion at affordable prices,
                with excellent customer service every step of the way.
            </p>
        </div>
    );
};

export default About;
