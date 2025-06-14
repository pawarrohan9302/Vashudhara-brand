const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

app.post('/create-payment', async (req, res) => {
    const { orderId, orderAmount, customerName, customerPhone, customerEmail } = req.body;

    try {
        const response = await axios.post(
            'https://sandbox.cashfree.com/pg/orders',
            {
                order_id: orderId,
                order_amount: orderAmount,
                order_currency: 'INR',
                customer_details: {
                    customer_id: customerPhone,
                    customer_name: customerName,
                    customer_email: customerEmail,
                    customer_phone: customerPhone,
                },
                order_meta: {
                    return_url: "http://localhost:3000/payment-success?order_id={order_id}",
                },
            },
            {
                headers: {
                    'x-api-version': '2022-09-01',
                    'x-client-id': APP_ID,
                    'x-client-secret': SECRET_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error("Cashfree error", error.response?.data || error.message);
        res.status(500).json({ error: "Payment creation failed" });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
