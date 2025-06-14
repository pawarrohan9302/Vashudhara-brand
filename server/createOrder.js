import axios from "axios";

const createOrder = async (req, res) => {
    const { order_id, order_amount, customer_name, customer_email, customer_phone } = req.body;

    const data = {
        order_id,
        order_amount,
        order_currency: "INR",
        customer_details: {
            customer_id: order_id,
            customer_name,
            customer_email,
            customer_phone
        },
        order_meta: {
            return_url: "http://localhost:3000/payment-success?order_id={order_id}"
        }
    };

    try {
        const response = await axios.post(
            "https://sandbox.cashfree.com/pg/orders",
            data,
            {
                headers: {
                    "x-api-version": "2022-09-01",
                    "x-client-id": process.env.CASHFREE_APP_ID,
                    "x-client-secret": process.env.CASHFREE_SECRET_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        res.status(200).json(response.data);
    } catch (err) {
        console.error("Error creating order:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to create order" });
    }
};

export default createOrder;
