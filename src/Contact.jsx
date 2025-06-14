// src/components/Contact.jsx
import React, { useState } from "react";

const Contact = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const contactStyle = {
        padding: "40px 50px",
        backgroundColor: "#f1f5f9",
        textAlign: "center",
    };

    const contactTitleStyle = {
        fontSize: "36px",
        fontWeight: "700",
        color: "#34d399",
        marginBottom: "20px",
    };

    const inputStyle = {
        padding: "12px 20px",
        marginBottom: "10px",
        width: "80%",
        maxWidth: "500px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    };

    const buttonStyle = {
        padding: "12px 20px",
        backgroundColor: "#34d399",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Your message has been sent!");
        // Implement your form submission logic here
    };

    return (
        <div style={contactStyle}>
            <h1 style={contactTitleStyle}>Contact Us</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    style={inputStyle}
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <br />
                <input
                    type="email"
                    style={inputStyle}
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <br />
                <textarea
                    style={{ ...inputStyle, height: "150px" }}
                    placeholder="Your Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                />
                <br />
                <button type="submit" style={buttonStyle}>
                    Send Message
                </button>
            </form>
        </div>
    );
};

export default Contact;
