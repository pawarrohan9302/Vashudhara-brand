import React, { useState } from "react";
import axios from "axios";

const PaymentComponent = () => {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");

    const handlePayment = async () => {
        if (!name || !amount) {
            alert("Please enter both name and amount.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/create-order", {
                amount: amount,
            });

            const options = {
                key: "rzp_test_Wj5c933q6luams", // your Razorpay key
                amount: res.data.amount,
                currency: res.data.currency,
                order_id: res.data.id,
                name: "Vashudhara Fashion",
                description: "Order Payment",
                handler: function (response) {
                    alert("Payment successful! ID: " + response.razorpay_payment_id);
                },
                prefill: {
                    name: name,
                    email: "test@example.com",
                    contact: "9999999999",
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error("Payment error:", error);
            alert("Payment initiation failed.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Pay with Razorpay</h2>
            <input
                type="text"
                placeholder="Customer Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ display: "block", margin: "10px", padding: "8px" }}
            />
            <input
                type="number"
                placeholder="Amount (in ₹)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ display: "block", margin: "10px", padding: "8px" }}
            />
            <button onClick={handlePayment} style={{ padding: "10px 20px", fontSize: "16px" }}>
                Pay Now
            </button>
        </div>
    );
};

export default PaymentComponent;
