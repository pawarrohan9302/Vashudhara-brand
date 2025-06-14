import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue, push } from "firebase/database";
import paymentOptions from "./paymentDetails";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);

    useEffect(() => {
        const dbRef = ref(database, "products");
        onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedProducts = Object.entries(data).map(([id, item]) => ({
                    id,
                    ...item,
                }));
                setProducts(loadedProducts);
            } else {
                setProducts([]);
            }
        });
    }, []);

    const handleConfirmPayment = () => {
        const orderRef = ref(database, "orders");
        const timestamp = Date.now();
        const orderData = {
            productTitle: selectedProduct.title,
            brand: selectedProduct.brand,
            productPrice: selectedProduct.price,
            image: selectedProduct.image,
            paymentMethod: selectedPayment.label,
            timestamp,
        };
        push(orderRef, orderData);
        setPaymentConfirmed(true);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-3xl font-bold mb-6 text-center">All Products</h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white rounded-lg shadow-md p-4 cursor-pointer transition hover:scale-105"
                        onClick={() => {
                            setSelectedProduct(product);
                            setSelectedPayment(null);
                            setPaymentConfirmed(false);
                        }}
                    >
                        <img src={product.image} alt={product.title} className="w-full h-48 object-cover rounded-md" />
                        <h3 className="text-xl font-semibold mt-2">{product.title}</h3>
                        <p className="text-gray-600">₹ {product.price}</p>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{product.category}</span>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {selectedProduct && (
                <div
                    className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
                    onClick={() => setSelectedProduct(null)}
                >
                    <div
                        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-80 object-cover rounded-md mb-4" />
                        <h2 className="text-2xl font-bold">{selectedProduct.title}</h2>
                        <p className="text-lg text-gray-700">{selectedProduct.brand}</p>
                        <p className="text-xl font-semibold text-green-600">₹ {selectedProduct.price}</p>

                        {/* Payment Options */}
                        {!selectedPayment && !paymentConfirmed && (
                            <div className="mt-4">
                                <h3 className="text-md font-semibold mb-2">Select Payment Method</h3>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {Object.entries(paymentOptions).map(([key, option]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedPayment(option)}
                                            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Show QR/UPI */}
                        {selectedPayment && !paymentConfirmed && (
                            <div className="mt-4">
                                <h4 className="text-lg font-bold">Pay via {selectedPayment.label}</h4>
                                {selectedPayment.qr && (
                                    <img
                                        src={selectedPayment.qr}
                                        alt="QR"
                                        className="w-48 h-48 mx-auto mt-2 rounded border"
                                    />
                                )}
                                {selectedPayment.upiId && (
                                    <p className="mt-2 text-gray-700 text-sm">
                                        UPI ID: <strong>{selectedPayment.upiId}</strong>
                                    </p>
                                )}
                                {selectedPayment.upiLink && (
                                    <a
                                        href={selectedPayment.upiLink}
                                        className="block text-blue-600 mt-2 underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        🔗 Click to Pay
                                    </a>
                                )}
                                <button
                                    onClick={handleConfirmPayment}
                                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    ✅ I Have Paid
                                </button>
                            </div>
                        )}

                        {/* Confirmed Message */}
                        {paymentConfirmed && (
                            <div className="mt-4">
                                <p className="text-green-600 text-xl font-bold">🎉 Payment Confirmed!</p>
                                <p className="text-sm text-gray-600">Your order has been placed.</p>
                            </div>
                        )}

                        <button
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                            onClick={() => setSelectedProduct(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
