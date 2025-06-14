import React, { useState } from 'react';
import { database, auth } from './firebase';
import { ref, push } from 'firebase/database';

const BuyForm = ({ product }) => {
    const [customer, setCustomer] = useState({ name: '', address: '' });

    const handleSubmit = async () => {
        const mobile = auth.currentUser?.phoneNumber;
        if (!mobile) return alert('Please login first');

        const order = {
            product,
            customer: { ...customer, mobile },
            timestamp: Date.now(),
        };

        try {
            await push(ref(database, 'orders'), order);
            alert('Order placed successfully!');
        } catch (err) {
            alert('Failed to place order');
            console.error(err);
        }
    };

    return (
        <div style={{ marginTop: 20 }}>
            <input
                type="text"
                placeholder="Your Name"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
            <input
                type="text"
                placeholder="Delivery Address"
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
            />
            <button onClick={handleSubmit}>Confirm Order</button>
        </div>
    );
};

export default BuyForm;
