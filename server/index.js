import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/create-order", async (req, res) => {
    const { customerName, customerEmail, amount } = req.body;

    try {
        const response = await axios.post(
            "https://sandbox.cashfree.com/pg/orders",
            {
                order_amount: amount,
                order_currency: "INR",
                customer_details: {
                    customer_id: Date.now().toString(),
                    customer_email: customerEmail,
                    customer_name: customerName
                },
                order_note: "Vashudhara Purchase",
                order_meta: {
                    return_url: "http://localhost:3000" // ya Netlify live URL
                }
            },
            {
                headers: {
                    "x-client-id": process.env.CASHFREE_APP_ID,
                    "x-client-secret": process.env.CASHFREE_SECRET_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({ payment_link: response.data.payment_link });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Payment link not created" });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
