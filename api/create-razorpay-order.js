// api/create-razorpay-order.js
import Razorpay from 'razorpay';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { amount } = req.body;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount provided.' });
        }

        try {
            // Initialize Razorpay instance with your API keys
            // IMPORTANT: Use environment variables for production!
            const instance = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID, // Use environment variable
                key_secret: process.env.RAZORPAY_KEY_SECRET, // Use environment variable
            });

            const options = {
                amount: amount, // amount in the smallest currency unit (e.g., paise for INR)
                currency: 'INR',
                receipt: `receipt_order_${Date.now()}`,
                payment_capture: 1, // Auto-capture the payment
            };

            const order = await instance.orders.create(options);

            res.status(200).json({
                orderId: order.id,
                currency: order.currency,
                amount: order.amount,
            });

        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            res.status(500).json({ error: error.message || 'Failed to create Razorpay order.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}