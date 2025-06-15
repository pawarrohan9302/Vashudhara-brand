import React, { useState } from "react";
import { FaCreditCard } from "react-icons/fa";

const VashudhraCredit = () => {
    const [balance, setBalance] = useState(0);

    const handleTopUp = () => {
        const amount = prompt("Enter amount to Top Up (₹):");
        if (amount && !isNaN(amount) && Number(amount) > 0) {
            setBalance((prev) => prev + Number(amount));
            alert(`₹${amount} added to your Vashudhra Credit!`);
        } else {
            alert("Invalid amount entered.");
        }
    };

    const handleAddGiftCard = () => {
        const giftCardCode = prompt("Enter your Gift Card code:");
        if (giftCardCode) {
            // Agar gift card code ke basis pe balance add karna ho to yahan logic dal sakte ho
            // For example, hardcoded demo:
            const giftCardValue = 100; // example ₹100 per gift card
            setBalance((prev) => prev + giftCardValue);

            alert(`Gift Card "${giftCardCode}" redeemed! ₹${giftCardValue} added to your balance.`);
        } else {
            alert("No Gift Card code entered.");
        }
    };

    return (
        <div
            style={{
                backgroundColor: "#000",
                color: "#fff",
                fontFamily: "Poppins, sans-serif",
                minHeight: "100vh",
                width: "100vw",
                padding: "40px",
                maxWidth: "700px",
                margin: "auto",
                boxSizing: "border-box",
            }}
        >
            <h2
                style={{
                    color: "#0ff",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <FaCreditCard size={40} style={{ marginRight: "10px" }} />
                Vashudhra Credit
            </h2>

            <p>A quick and convenient way to pay and refund</p>

            <section style={{ marginTop: "30px" }}>
                <h3 style={{ color: "#0ff" }}>Instant Checkout</h3>
                <p>One-click, easy and fast checkout</p>

                <h3 style={{ color: "#0ff", marginTop: "20px" }}>Faster Refunds</h3>
                <p>Get instant refunds as Vashudhra Credit</p>

                <h3 style={{ color: "#0ff", marginTop: "20px" }}>Consolidated Money</h3>
                <p>Gift cards, refunds and cashbacks in one place</p>

                <h3 style={{ color: "#0ff", marginTop: "20px" }}>Many More Benefits</h3>
                <p>Benefits and offers on using Vashudhra Credit</p>

                <h3 style={{ color: "#0ff", marginTop: "40px" }}>
                    Top-up your Vashudhra Credit now!
                </h3>
                <div style={{ fontSize: "32px", margin: "10px 0" }}>₹{balance.toFixed(2)}</div>
                <button
                    onClick={handleTopUp}
                    style={{
                        backgroundColor: "#0ff",
                        color: "#000",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        marginRight: "15px",
                    }}
                >
                    Top Up
                </button>
                <button
                    onClick={handleAddGiftCard}
                    style={{
                        backgroundColor: "transparent",
                        color: "#0ff",
                        border: "1px solid #0ff",
                        padding: "10px 20px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    Have a Gift Card? Add Gift Card
                </button>
            </section>

            <section style={{ marginTop: "40px", fontSize: "14px", color: "#888" }}>
                <h4>Credit Details</h4>
                <p>Please note:</p>
                <ul>
                    <li>Vashudhra Credit can't be cancelled or transferred to another account.</li>
                    <li>It can't be withdrawn as cash or transferred to any bank account.</li>
                    <li>It can't be used to purchase Gift Cards.</li>
                    <li>
                        Net-banking and credit/debit cards issued in India can be used for
                        Vashudhra Credit top up.
                    </li>
                    <li>Credits have an expiry. Check FAQs for more details.</li>
                </ul>
                <p style={{ marginTop: "10px" }}>
                    <a href="#" style={{ color: "#0ff" }}>
                        Vashudhra Credit T&amp;C &gt;
                    </a>{" "}
                    &nbsp;|&nbsp;{" "}
                    <a href="#" style={{ color: "#0ff" }}>
                        Gift Card T&amp;C &gt;
                    </a>{" "}
                    &nbsp;|&nbsp;{" "}
                    <a href="#" style={{ color: "#0ff" }}>
                        FAQs &gt;
                    </a>
                </p>
            </section>
        </div>
    );
};

export default VashudhraCredit;
