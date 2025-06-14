import React, { useState } from "react";
import axios from "axios";

const PaymentComponent = () => {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");

    const handlePayment = async () => {
        try {
            const res = await axios.post("http://localhost:5000/api/create-order", {
                customerName: name,
                amount: amount,
            });

            window.location.href = res.data.paymentLink; // Redirect to Cashfree link
        } catch (error) {
            console.error("Payment error:", error);
            alert("Payment initiation failed.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Pay with Cashfree</h2>
            <input
                type="text"
                placeholder="Customer Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ display: "block", margin: "10px" }}
            />
            <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ display: "block", margin: "10px" }}
            />
            <button onClick={handlePayment}>Pay Now</button>
        </div>
    );
};

export default PaymentComponent;
