// backend/server.js

// आवश्यक मॉड्यूल्स
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
require('dotenv').config(); // Loads environment variables from .env file

// Express ऐप इनिशियलाइज़ करें
const app = express();
const PORT = process.env.PORT || 5000; // Backend server runs on port 5000 by default

// मिडलवेयर कॉन्फ़िगर करें
// VERY IMPORTANT: Allow requests ONLY from your frontend's exact URL (http://localhost:5173)
app.use(cors({
    origin: 'http://localhost:5173' // <--- THIS IS YOUR FRONTEND'S PORT!
}));
app.use(express.json()); // To parse JSON data from frontend requests

// Optional: A simple route to check if your backend server is alive
app.get('/', (req, res) => {
    res.status(200).send('Razorpay Backend server is running and ready for API calls!');
});

// Razorpay इंस्टेंस इनिशियलाइज़ करें
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,       // Loaded from .env
    key_secret: process.env.RAZORPAY_KEY_SECRET, // Loaded from .env
});

// Razorpay ऑर्डर बनाने के लिए API एंडपॉइंट (Frontend calls this)
app.post('/api/create-razorpay-order', async (req, res) => {
    try {
        const { amount } = req.body; // Amount should be in paise from frontend

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive number.' });
        }

        const options = {
            amount: amount, // Amount in paise (e.g., 50000 for ₹500)
            currency: "INR",
            receipt: "order_receipt_" + Date.now(),
        };

        const order = await razorpayInstance.orders.create(options);

        // Send order details back to frontend
        res.status(200).json({
            orderId: order.id,
            currency: order.currency,
            amount: order.amount,
        });

    } catch (error) {
        console.error("Error creating Razorpay order on backend:", error);
        res.status(500).json({
            error: 'Failed to create Razorpay order.',
            details: error.message || 'An unexpected error occurred.'
        });
    }
});

// Razorpay पेमेंट वेरिफाई करने के लिए API एंडपॉइंट (Frontend calls this AFTER payment)
app.post('/api/verify-razorpay-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const crypto = require('crypto'); // Node.js built-in module
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature === razorpay_signature) {
            res.status(200).json({ success: true, message: 'Payment verified successfully.' });
            // HERE: Update your database to mark the order as paid!
        } else {
            res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature.' });
        }

    } catch (error) {
        console.error("Error verifying Razorpay payment on backend:", error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during payment verification.',
            details: error.message
        });
    }
});

// सर्वर शुरू करें
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Your frontend should connect to http://localhost:${PORT}`);
});