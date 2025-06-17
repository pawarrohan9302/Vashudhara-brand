import React, { useState, useEffect, useCallback } from 'react';
import { database } from './firebase'; // Ensure this path is correct for your Firebase config
import { ref, onValue, update } from 'firebase/database';
import { jsPDF } from 'jspdf';
import emailjs from '@emailjs/browser';

// A flag to ensure EmailJS is initialized only once
// This helps prevent re-initialization on hot reloads in development
let emailjsInitialized = false;

const OrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
    const [trackingInput, setTrackingInput] = useState('');
    const [currentTrackingOrderId, setCurrentTrackingOrderId] = useState(null);

    // --- Firebase Data Fetching and EmailJS Initialization ---
    useEffect(() => {
        // Debug logs for EmailJS Initialization - KEEP THESE UNTIL YOU ARE SURE IT WORKS IN PROD
        console.log("--- useEffect: EmailJS Initialization Check ---");
        console.log("VITE_EMAILJS_PUBLIC_KEY in useEffect:", import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
        console.log("emailjsInitialized (before attempt):", emailjsInitialized);

        // Initialize EmailJS only once, and only if public key is available
        // IMPORTANT: Using import.meta.env for Vite environment variables
        if (!emailjsInitialized && import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
            try {
                emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
                emailjsInitialized = true; // Set the flag to true upon successful initialization
                console.log("EmailJS initialized successfully.");
            } catch (err) {
                console.error("Failed to initialize EmailJS (inside useEffect catch):", err);
                alert("Warning: EmailJS failed to initialize. Email notifications may not work. Check console for details.");
            }
        } else if (!import.meta.env.VITE_EMAILJS_PUBLIC_KEY && !emailjsInitialized) {
            console.warn("EmailJS Public Key (VITE_EMAILJS_PUBLIC_KEY) is missing from environment variables. Email sending may not work.");
        }
        console.log("emailjsInitialized (after attempt):", emailjsInitialized); // Check the final state of the flag

        // Firebase data fetching logic
        const ordersRef = ref(database, 'orders');
        const unsubscribe = onValue(ordersRef, (snapshot) => {
            const data = snapshot.val();
            const loadedOrders = [];
            if (data) {
                Object.keys(data).forEach((key) => {
                    loadedOrders.push({
                        id: key,
                        ...data[key],
                    });
                });
            }
            // Sort orders by orderDate, newest first for easier management
            loadedOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            setOrders(loadedOrders);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            setLoading(false);
            alert("Error fetching orders from Firebase. Please check your Firebase connection and rules.");
        });

        // Cleanup function for Firebase listener to prevent memory leaks
        return () => unsubscribe();
    }, []); // Empty dependency array ensures this runs only once on mount

    // --- Handle Order Status Change & Email Sending ---
    const handleStatusChange = useCallback(async (orderId, newStatus) => {
        if (!window.confirm(`Are you sure you want to change the status of Order ${orderId} to "${newStatus}"?`)) {
            return;
        }

        const orderToUpdate = orders.find(o => o.id === orderId);

        if (!orderToUpdate) {
            console.error(`Order with ID ${orderId} not found for status update.`);
            alert("Error: Order data not found. Cannot update status.");
            return;
        }

        // Accessing environment variables
        const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        try {
            // Update the order status in Firebase first
            const orderRef = ref(database, `orders/${orderId}`);
            await update(orderRef, { status: newStatus });
            console.log(`Firebase: Order ${orderId} status updated to ${newStatus}.`);

            // --- EmailJS Integration Start ---
            // Extract customer details from the fetched order data
            const customerEmail = orderToUpdate.customerEmail;
            const customerName = orderToUpdate.customerName;

            // Debug logs for the raw values of customerEmail and customerName
            console.log(`DEBUG: Raw customerEmail for order ${orderId}:`, customerEmail);
            console.log(`DEBUG: Raw customerName for order ${orderId}:`, customerName);

            // Prepare the 'orders' array for the EmailJS template.
            // Assuming your orderToUpdate object has productTitle, quantity, pricePerItem, and imageUrl.
            // If an order can have multiple items, you'd loop through them here.
            // For now, we assume a single product per order, formatted as an array for the template loop.
            const orderItemsForEmail = [
                {
                    name: orderToUpdate.productTitle || 'Product Name N/A', // Maps to {{name}} in template
                    units: orderToUpdate.quantity || 1,                     // Maps to {{units}} in template
                    price: orderToUpdate.pricePerItem || '0.00',             // Maps to {{price}} in template (should be a number/string)
                    image_url: orderToUpdate.productImageUrl || 'https://via.placeholder.com/60' // Maps to {{image_url}}
                }
                // Example if you have a 'products' array in your order object:
                // ...(orderToUpdate.products || []).map(product => ({
                //     name: product.name || 'Product N/A',
                //     units: product.quantity || 1,
                //     price: product.price || '0.00',
                //     image_url: product.imageUrl || 'https://via.placeholder.com/60'
                // }))
            ];

            // Prepare cost object for the template.
            // Make sure these fields (shippingCost, taxAmount) are present in your Firebase order data
            const costDetailsForEmail = {
                shipping: orderToUpdate.shippingCost || '0.00',
                tax: orderToUpdate.taxAmount || '0.00',
                total: orderToUpdate.totalAmount || '0.00' // This is the overall order total
            };


            // Crucial check: Ensure all necessary data and EmailJS is configured
            const canSendEmail = emailjsInitialized &&
                customerEmail && customerEmail.trim() !== '' &&
                customerName && customerName.trim() !== '' &&
                EMAILJS_SERVICE_ID && EMAILJS_SERVICE_ID.trim() !== '' &&
                EMAILJS_TEMPLATE_ID && EMAILJS_TEMPLATE_ID.trim() !== '' &&
                EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY.trim() !== '';

            // Detailed debug log for canSendEmail status
            console.log(`EmailJS DEBUG: Can send email status for Order ID: ${orderId}.
                Customer Email: ${!!customerEmail && customerEmail.trim() !== ''},
                Customer Name: ${!!customerName && customerName.trim() !== ''},
                EmailJS Initialized Flag: ${emailjsInitialized},
                Service ID: ${!!EMAILJS_SERVICE_ID && EMAILJS_SERVICE_ID.trim() !== ''},
                Template ID: ${!!EMAILJS_TEMPLATE_ID && EMAILJS_TEMPLATE_ID.trim() !== ''},
                Public Key: ${!!EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY.trim() !== ''},
                Products for Email: ${orderItemsForEmail.length > 0 && orderItemsForEmail[0].name !== 'Product Name N/A'},
                Total Cost: ${!!costDetailsForEmail.total && costDetailsForEmail.total !== '0.00'}
            `);

            if (canSendEmail) {
                const templateParams = {
                    customer_name: customerName,
                    customer_email: customerEmail, // This is the key field for EmailJS to send to!
                    order_id: orderId,
                    new_status: newStatus,
                    order_date: orderToUpdate.orderDate ? new Date(orderToUpdate.orderDate).toLocaleString() : 'N/A',
                    shipping_address: `${orderToUpdate.village || ''}, ${orderToUpdate.district || ''}, ${orderToUpdate.state || ''} - ${orderToUpdate.pinCode || ''}`,
                    current_year: new Date().getFullYear(), // For the copyright year in the footer

                    // Product and Cost Details for the EmailJS Template
                    orders: orderItemsForEmail, // Array of product objects
                    cost: costDetailsForEmail,  // Object for shipping, tax, total
                };

                // Add a debug log for templateParams right before sending
                console.log("EmailJS DEBUG: Sending email with templateParams:", templateParams);

                try {
                    await emailjs.send(
                        EMAILJS_SERVICE_ID,
                        EMAILJS_TEMPLATE_ID,
                        templateParams,
                        EMAILJS_PUBLIC_KEY
                    );
                    console.log('EmailJS: Order status email sent successfully!');
                } catch (emailError) {
                    console.error('EmailJS: Failed to send email during `emailjs.send` call.', emailError);
                    alert("⚠️ Order status updated, but failed to send email notification. Check console for EmailJS error details.");
                }
            } else {
                console.warn(`EmailJS: Skipping email for Order ID: ${orderId}. Missing required data or EmailJS configuration. See previous debug log for exact missing parts`);
                alert("Order status updated, but email notification might not be sent due to missing data (like customer email) or EmailJS configuration. Check console for details.");
            }
            // --- EmailJS Integration End ---

            alert(`✅ Order ${orderId} status updated to ${newStatus}!`);

        } catch (error) {
            console.error("Error updating order status in Firebase:", error);
            alert("❌ Failed to update order status in database. Check console for details.");
        }
    }, [orders]); // Depend on orders to ensure `orderToUpdate` is always current

    // --- Tracking Update Functions ---
    const handleOpenTrackingInput = useCallback((orderId) => {
        setCurrentTrackingOrderId(orderId);
        // Pre-fill tracking input with the last update if available
        const order = orders.find(o => o.id === orderId);
        if (order && order.trackingUpdates && order.trackingUpdates.length > 0) {
            setTrackingInput(order.trackingUpdates[order.trackingUpdates.length - 1].status);
        } else {
            setTrackingInput('');
        }
    }, [orders]); // Depend on orders to get current tracking updates

    const handleAddTrackingUpdate = useCallback(async () => {
        if (!currentTrackingOrderId || !trackingInput.trim()) {
            alert("Please enter a tracking status before saving.");
            return;
        }

        try {
            const orderRef = ref(database, `orders/${currentTrackingOrderId}`);
            const currentOrder = orders.find(order => order.id === currentTrackingOrderId);
            const currentTrackingUpdates = currentOrder?.trackingUpdates || [];

            const updatedTrackingUpdates = [
                ...currentTrackingUpdates,
                {
                    time: Date.now(), // Timestamp for the update
                    status: trackingInput.trim(),
                },
            ];

            await update(orderRef, { trackingUpdates: updatedTrackingUpdates });
            alert(`✅ Tracking update added for Order ${currentTrackingOrderId}!`);
            setTrackingInput('');
            setCurrentTrackingOrderId(null); // Close the input field
        } catch (error) {
            console.error("Error adding tracking update:", error);
            alert("❌ Failed to add tracking update to Firebase.");
        }
    }, [currentTrackingOrderId, trackingInput, orders]); // Depend on currentTrackingOrderId, trackingInput, and orders

    const handleCancelTrackingUpdate = useCallback(() => {
        setTrackingInput('');
        setCurrentTrackingOrderId(null);
    }, []);

    // --- Invoice Functions ---
    const handleViewInvoice = useCallback((order) => {
        setSelectedOrderForInvoice(order);
    }, []);

    const handleCloseInvoice = useCallback(() => {
        setSelectedOrderForInvoice(null);
    }, []);

    const handleDownloadInvoice = useCallback((order) => {
        // Construct a clean filename
        const customerFullName = order.customerName && order.customerSurname
            ? `${order.customerName} ${order.customerSurname}`
            : "Customer";

        const cleanedCustomerName = customerFullName.replace(/[^a-zA-Z0-9_]/g, '_'); // Remove special chars
        const invoiceFileName = `Invoice_${cleanedCustomerName}_${order.id || 'Unknown'}.pdf`;

        const doc = new jsPDF();

        // Title
        doc.setFontSize(22);
        doc.text("Invoice", 105, 20, null, null, "center");

        // Shop Details
        doc.setFontSize(10);
        doc.text("Vashudhara Store", 20, 30);
        doc.text("123, Example Street, City, State - 123456", 20, 35); // Replace with your actual shop address
        doc.text("Contact: your@shop.com | +91-9876543210", 20, 40); // Replace with your actual contact info

        // Order Details
        doc.setFontSize(12);
        doc.text(`Order ID: ${order.id || 'N/A'}`, 20, 55);
        doc.text(`Order Date: ${order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}`, 20, 60);
        doc.text(`Payment Status: ${order.status || 'N/A'}`, 20, 65);
        if (order.razorpayPaymentId) {
            doc.text(`Payment ID: ${order.razorpayPaymentId}`, 20, 70);
        }
        if (order.razorpayOrderId) {
            doc.text(`Razorpay Order ID: ${order.razorpayOrderId}`, 20, 75);
        }

        // Billing Address
        doc.setFontSize(14);
        doc.text("Bill To:", 20, 90);
        doc.setFontSize(12);
        doc.text(`${customerFullName}`, 20, 95);
        doc.text(`${order.village || ''}, ${order.district || ''}, ${order.state || ''} - ${order.pinCode || ''}`, 20, 100);

        // Product Table Header
        let y = 115;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text("Product", 20, y);
        doc.text("Qty", 100, y);
        doc.text("Price/Item", 120, y);
        doc.text("Total", 170, y);
        doc.setFont(undefined, 'normal');

        // Product Details
        y += 7;
        doc.text(order.productTitle || 'N/A', 20, y);
        doc.text(order.quantity ? order.quantity.toString() : 'N/A', 100, y);
        doc.text(`₹${order.pricePerItem || 'N/A'}`, 120, y);
        doc.text(`₹${order.totalAmount || 'N/A'}`, 170, y);
        y += 10;

        // Grand Total
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text("Grand Total:", 120, y + 10);
        doc.text(`₹${order.totalAmount || 'N/A'}`, 170, y + 10);
        doc.setFont(undefined, 'normal');

        // Footer
        doc.setFontSize(10);
        doc.text("Thank you for your purchase!", 105, 250, null, null, "center");
        doc.text("This is a computer-generated invoice and does not require a signature.", 105, 255, null, null, "center");

        doc.save(invoiceFileName);
        console.log(`Invoice for Order ${order.id} downloaded as ${invoiceFileName}`);
    }, []);

    // --- Function to copy address to clipboard ---
    const copyAddressToClipboard = useCallback((order) => {
        const address = `${order.customerName || ''} ${order.customerSurname || ''}\n${order.customerPhone || ''}\n${order.customerEmail || ''}\n${order.village || ''}, ${order.district || ''}, ${order.state || ''} - ${order.pinCode || ''}`;
        navigator.clipboard.writeText(address)
            .then(() => {
                alert('Address copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy address:', err);
                alert('Failed to copy address. Please try manually copying from the "View Invoice" modal.');
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p className="ml-4 text-xl">Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 font-poppins">
            <h2 className="text-3xl font-bold mb-8 text-emerald-400 text-center">Manage Orders</h2>
            {orders.length === 0 ? (
                <p className="text-center text-gray-400 text-lg">No orders found yet.</p>
            ) : (
                <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs uppercase bg-gray-700 text-gray-300">
                            <tr>
                                <th scope="col" className="py-3 px-6">Order ID</th>
                                <th scope="col" className="py-3 px-6">Customer</th>
                                <th scope="col" className="py-3 px-6">Product</th>
                                <th scope="col" className="py-3 px-6">Qty/Size</th>
                                <th scope="col" className="py-3 px-6">Amount</th>
                                <th scope="col" className="py-3 px-6">Order Date</th>
                                <th scope="col" className="py-3 px-6">Status</th>
                                <th scope="col" className="py-3 px-6">Last Update</th>
                                <th scope="col" className="py-3 px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <React.Fragment key={order.id}>
                                    <tr className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700">
                                        <th scope="row" className="py-4 px-6 font-medium text-white whitespace-nowrap">
                                            {order.id}
                                        </th>
                                        <td className="py-4 px-6">
                                            {order.customerName} {order.customerSurname}
                                            <br />
                                            <span
                                                className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition-colors"
                                                onClick={() => copyAddressToClipboard(order)}
                                                title="Click to copy address"
                                            >
                                                {order.village || ''}, {order.district || ''}, {order.state || ''} - {order.pinCode || ''}
                                            </span>
                                            {order.customerEmail && <><br /><span className="text-xs text-gray-500">{order.customerEmail}</span></>}
                                            {order.customerPhone && <><br /><span className="text-xs text-gray-500">Ph: {order.customerPhone}</span></>}
                                        </td>
                                        <td className="py-4 px-6">{order.productTitle || 'N/A'}</td>
                                        <td className="py-4 px-6">{order.quantity || 'N/A'} / {order.size || 'N/A'}</td>
                                        <td className="py-4 px-6">₹{order.totalAmount || 'N/A'}</td>
                                        <td className="py-4 px-6">{order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                ${order.status === 'Payment Successful' ? 'bg-green-600 text-white' : ''}
                                                ${order.status === 'Payment Pending' ? 'bg-yellow-600 text-white' : ''}
                                                ${order.status === 'Processing' ? 'bg-blue-600 text-white' : ''}
                                                ${order.status === 'Shipped' ? 'bg-purple-600 text-white' : ''}
                                                ${order.status === 'Delivered' ? 'bg-emerald-600 text-white' : ''}
                                                ${order.status === 'Cancelled' ? 'bg-red-600 text-white' : ''}
                                                ${order.status && (order.status.includes('Failed') || order.status.includes('Cancelled By User')) ? 'bg-red-800 text-white' : ''}
                                                `}>
                                                {order.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-400">
                                            {order.trackingUpdates && order.trackingUpdates.length > 0 ? (
                                                <span title={new Date(order.trackingUpdates[order.trackingUpdates.length - 1].time).toLocaleString()}>
                                                    {order.trackingUpdates[order.trackingUpdates.length - 1].status}
                                                </span>
                                            ) : (
                                                "No updates"
                                            )}
                                        </td>
                                        <td className="py-4 px-6 space-y-2">
                                            <select
                                                value={order.status || 'Payment Pending'}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            >
                                                <option value="Payment Pending">Payment Pending</option>
                                                <option value="Payment Successful">Payment Successful</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                                <option value="Refunded">Refunded</option>
                                            </select>
                                            <button
                                                onClick={() => handleOpenTrackingInput(order.id)}
                                                className="w-full text-blue-400 hover:text-blue-200 text-xs py-1 mt-1"
                                            >
                                                Add Tracking
                                            </button>
                                            <button
                                                onClick={() => handleViewInvoice(order)}
                                                className="w-full text-emerald-400 hover:text-emerald-200 text-xs py-1 mt-1"
                                            >
                                                View Invoice
                                            </button>
                                            <button
                                                onClick={() => handleDownloadInvoice(order)}
                                                className="w-full text-purple-400 hover:text-purple-200 text-xs py-1 mt-1"
                                            >
                                                Download Invoice
                                            </button>
                                        </td>
                                    </tr>
                                    {currentTrackingOrderId === order.id && (
                                        <tr className="bg-gray-700">
                                            <td colSpan="9" className="py-3 px-6">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="text"
                                                        value={trackingInput}
                                                        onChange={(e) => setTrackingInput(e.target.value)}
                                                        placeholder="Enter tracking status (e.g., 'Out for delivery', 'In transit')"
                                                        className="flex-grow p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                                    />
                                                    <button
                                                        onClick={handleAddTrackingUpdate}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                                    >
                                                        Save Update
                                                    </button>
                                                    <button
                                                        onClick={handleCancelTrackingUpdate}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Invoice View Modal */}
            {selectedOrderForInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                        <button
                            onClick={handleCloseInvoice}
                            className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold"
                        >
                            &times;
                        </button>
                        <h3 className="text-2xl font-bold mb-4 text-emerald-300 text-center">Invoice Details</h3>
                        <div className="space-y-3 text-gray-200">
                            <p><strong>Order ID:</strong> {selectedOrderForInvoice.id || 'N/A'}</p>
                            <p><strong>Order Date:</strong> {selectedOrderForInvoice.orderDate ? new Date(selectedOrderForInvoice.orderDate).toLocaleString() : 'N/A'}</p>
                            <p><strong>Product:</strong> {selectedOrderForInvoice.productTitle || 'N/A'}</p>
                            <p><strong>Quantity:</strong> {selectedOrderForInvoice.quantity || 'N/A'}</p>
                            <p><strong>Size:</strong> {selectedOrderForInvoice.size || 'N/A'}</p>
                            <p><strong>Price Per Item:</strong> ₹{selectedOrderForInvoice.pricePerItem || 'N/A'}</p>
                            <p><strong>Total Amount:</strong> ₹{selectedOrderForInvoice.totalAmount || 'N/A'}</p>
                            <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                ${selectedOrderForInvoice.status === 'Payment Successful' ? 'bg-green-600 text-white' : ''}
                                ${selectedOrderForInvoice.status === 'Payment Pending' ? 'bg-yellow-600 text-white' : ''}
                                ${selectedOrderForInvoice.status === 'Processing' ? 'bg-blue-600 text-white' : ''}
                                ${selectedOrderForInvoice.status === 'Shipped' ? 'bg-purple-600 text-white' : ''}
                                ${selectedOrderForInvoice.status === 'Delivered' ? 'bg-emerald-600 text-white' : ''}
                                ${selectedOrderForInvoice.status === 'Cancelled' ? 'bg-red-600 text-white' : ''}
                                ${selectedOrderForInvoice.status && (selectedOrderForInvoice.status.includes('Failed') || selectedOrderForInvoice.status.includes('Cancelled By User')) ? 'bg-red-800 text-white' : ''}
                            `}>
                                {selectedOrderForInvoice.status || 'N/A'}
                            </span></p>
                            <p><strong>Customer:</strong> {selectedOrderForInvoice.customerName} {selectedOrderForInvoice.customerSurname}</p>
                            <p><strong>Address:</strong> {selectedOrderForInvoice.village || ''}, {selectedOrderForInvoice.district || ''}, {selectedOrderForInvoice.state || ''} - {selectedOrderForInvoice.pinCode || ''}</p>
                            {selectedOrderForInvoice.customerEmail && (<p><strong>Email:</strong> {selectedOrderForInvoice.customerEmail}</p>)}
                            {selectedOrderForInvoice.customerPhone && (<p><strong>Phone:</strong> {selectedOrderForInvoice.customerPhone}</p>)}
                            {selectedOrderForInvoice.razorpayPaymentId && (
                                <p><strong>Razorpay Payment ID:</strong> {selectedOrderForInvoice.razorpayPaymentId}</p>
                            )}
                            {selectedOrderForInvoice.razorpayOrderId && (
                                <p><strong>Razorpay Order ID:</strong> {selectedOrderForInvoice.razorpayOrderId}</p>
                            )}
                            {selectedOrderForInvoice.razorpaySignature && (
                                <p><strong>Razorpay Signature:</strong> {selectedOrderForInvoice.razorpaySignature}</p>
                            )}

                            <h4 className="text-xl font-bold mt-6 mb-2 text-emerald-300">Tracking History:</h4>
                            {selectedOrderForInvoice.trackingUpdates && selectedOrderForInvoice.trackingUpdates.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">
                                    {selectedOrderForInvoice.trackingUpdates.map((update, index) => (
                                        <li key={index} className="text-gray-300">
                                            <span className="font-semibold">{new Date(update.time).toLocaleString()}:</span> {update.status}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400">No tracking updates yet.</p>
                            )}

                        </div>
                        <div className="flex justify-center mt-6 space-x-4">
                            <button
                                onClick={() => handleDownloadInvoice(selectedOrderForInvoice)}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Download Invoice
                            </button>
                            <button
                                onClick={handleCloseInvoice}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersList;