import React from "react";
import axios from "axios";

const Payment = () => {
    const handlePayment = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/create-order", {
                order_id: "ORDER_" + Date.now(),
                order_amount: 299.0, // example amount
                customer_name: "Rohan Pawar",
                customer_email: "rohan@example.com",
                customer_phone: "9876543210",
            });

            const paymentSessionId = response.data.payment_session_id;

            // Redirect to Cashfree checkout page
            window.location.href = `https://sandbox.cashfree.com/pg/orders/pay/${paymentSessionId}`;
        } catch (error) {
            console.error("Payment error:", error);
            alert("Payment failed. Try again.");
        }
    };

    return (
        <div style={{ padding: "30px", textAlign: "center" }}>
            <h2>Proceed to Payment</h2>
            <button onClick={handlePayment} style={{ padding: "10px 20px", fontSize: "16px" }}>
                Pay ₹299
            </button>
        </div>
    );
};

export default Payment;
