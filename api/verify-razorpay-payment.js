// api/verify-razorpay-payment.js
import crypto from 'crypto'; // Node.js built-in module

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Missing payment details.' });
        }

        try {
            // IMPORTANT: Use environment variables for production!
            const key_secret = process.env.RAZORPAY_KEY_SECRET;

            const body = razorpay_order_id + "|" + razorpay_payment_id;

            const expectedSignature = crypto
                .createHmac('sha256', key_secret)
                .update(body.toString())
                .digest('hex');

            const isAuthentic = expectedSignature === razorpay_signature;

            if (isAuthentic) {
                // Payment is authentic. Now you can save the order to your database.
                // In a real application, you'd save the order details (product, user, address, payment_id etc.)
                // to your Firebase Realtime Database here.
                console.log("Payment successfully verified!");
                res.status(200).json({ success: true, message: 'Payment verified successfully!' });
            } else {
                console.log("Payment verification failed: Invalid signature.");
                res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature.' });
            }

        } catch (error) {
            console.error('Error verifying Razorpay payment:', error);
            res.status(500).json({ success: false, error: error.message || 'Failed to verify payment.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}