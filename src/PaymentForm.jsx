import React, { useState } from "react";

const PaymentForm = () => {
    const [upiId, setUpiId] = useState("");
    const [upiError, setUpiError] = useState("");
    const [totalAmount, setTotalAmount] = useState(199); // Customize amount

    const validateUpi = () => {
        const upiRegex = /^[\w.-]+@[\w.-]+$/;
        if (!upiId) {
            setUpiError("⚠️ UPI ID cannot be empty.");
            return false;
        } else if (!upiRegex.test(upiId)) {
            setUpiError("❌ Invalid UPI ID format (e.g. ricky@upi).");
            return false;
        }
        setUpiError("");
        return true;
    };

    const handlePayment = () => {
        if (!validateUpi()) return;

        const upiUrl = `upi://pay?pa=${upiId}&pn=VashudharaStore&am=${totalAmount}&cu=INR`;
        window.location.href = upiUrl;
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">🪙 Pay Using UPI</h2>

            <label className="block mb-2 font-semibold">Enter your UPI ID:</label>
            <input
                type="text"
                placeholder="e.g. ricky@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {upiError && <p className="text-red-500 text-sm mt-1">{upiError}</p>}

            <p className="mt-4 text-gray-700">Amount: ₹{totalAmount}</p>

            <button
                onClick={handlePayment}
                className="mt-6 bg-indigo-600 text-white font-semibold py-2 px-6 rounded hover:bg-indigo-700 transition"
            >
                Pay Now
            </button>
        </div>
    );
};

export default PaymentForm;
