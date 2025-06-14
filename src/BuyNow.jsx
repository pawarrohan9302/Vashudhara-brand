import React from "react";

const BuyNow = ({ product, customer }) => {
    const handlePayment = async () => {
        const res = await fetch("http://localhost:5000/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: product.price }),
        });

        const data = await res.json();

        const options = {
            key: "YOUR_RAZORPAY_KEY_ID",
            amount: data.amount,
            currency: data.currency,
            order_id: data.id,
            name: "VIP Online Store",
            description: product.title,
            image: product.image,
            handler: function (response) {
                // Save order in Firebase only after successful payment
                saveOrderToFirebase(response);
            },
            prefill: {
                name: customer.name,
                email: customer.email,
                contact: customer.phone,
            },
            theme: {
                color: "#6366f1",
            },
        };

        const razor = new window.Razorpay(options);
        razor.open();
    };

    const saveOrderToFirebase = async (response) => {
        const orderRef = ref(database, "orders");
        await push(orderRef, {
            productTitle: product.title,
            productImage: product.image,
            price: product.price,
            customer,
            razorpayPaymentId: response.razorpay_payment_id,
            orderTime: new Date().toISOString(),
        });
        alert("✅ Order confirmed & payment successful!");
    };

    return (
        <button
            onClick={handlePayment}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
            Pay & Confirm Order
        </button>
    );
};

export default BuyNow;
