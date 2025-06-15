// src/CategoryPage.jsx
import React, { useEffect, useState } from "react";
// All imports are now directly from the same src/ folder
import { database, app } from "./firebase"; // firebase.js is in src/
import { ref, onValue, query, orderByChild, equalTo, push, update } from "firebase/database";
import { getFunctions, httpsCallable } from "firebase/functions";
import loadScript from "./loadRazorpayScript"; // loadRazorpayScript.js is in src/

const CategoryPage = ({ category }) => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState("M");
    const [fullName, setFullName] = useState("");
    const [surname, setSurname] = useState("");
    const [pinCode, setPinCode] = useState("");
    const [stateName, setStateName] = useState("");
    const [district, setDistrict] = useState("");
    const [village, setVillage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const functions = getFunctions(app);
    const createRazorpayOrder = httpsCallable(functions, 'createRazorpayOrder');

    useEffect(() => {
        setIsLoading(true);
        const productsRef = ref(database, "products");
        const categoryQuery = query(productsRef, orderByChild("category"), equalTo(category));
        const unsubscribe = onValue(categoryQuery, (snapshot) => {
            const data = snapshot.val();
            const productArray = data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : [];
            setProducts(productArray);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching products:", error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [category]);

    const handleBuyClick = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setSize("M");
        setFullName("");
        setSurname("");
        setPinCode("");
        setStateName("");
        setDistrict("");
        setVillage("");
    };

    const handleCreateOrder = async () => {
        if (!fullName || !surname || !pinCode || !stateName || !district || !village) {
            alert("Please fill all required address fields.");
            return;
        }

        if (!/^\d{6}$/.test(pinCode)) {
            alert("Please enter a valid 6-digit PIN code.");
            return;
        }

        if (!selectedProduct) {
            alert("No product selected for purchase.");
            return;
        }

        setIsSubmitting(true);

        const itemPrice = parseFloat(selectedProduct.price);
        if (isNaN(itemPrice) || itemPrice <= 0) {
            alert("Product price is invalid. Please select another product or contact support.");
            setIsSubmitting(false);
            return;
        }
        const amount = itemPrice * quantity; // Total amount in INR

        let firebaseOrderId = null;

        try {
            const ordersRef = ref(database, "orders");
            const newOrderRef = await push(ordersRef, {
                productId: selectedProduct.id,
                productTitle: selectedProduct.title,
                productImage: selectedProduct.image,
                pricePerItem: selectedProduct.price,
                quantity: quantity,
                size: size,
                customerName: fullName,
                customerSurname: surname,
                pinCode: pinCode,
                state: stateName,
                district: district,
                village: village,
                totalAmount: amount,
                orderDate: new Date().toISOString(),
                status: "Payment Pending",
                paymentMethod: "Razorpay",
            });
            firebaseOrderId = newOrderRef.key;
            console.log("Order saved to Firebase with ID:", firebaseOrderId);

            console.log("Calling Cloud Function to create Razorpay order...");
            const razorpayAmountInPaisa = amount * 100;

            const result = await createRazorpayOrder({
                amount: razorpayAmountInPaisa,
                currency: "INR",
                receipt: firebaseOrderId,
                notes: {
                    firebaseOrderId: firebaseOrderId,
                    productTitle: selectedProduct.title,
                    customerName: `${fullName} ${surname}`,
                    pinCode: pinCode
                }
            });

            const { orderId: razorpayServerOrderId } = result.data;
            console.log("Razorpay Order ID from server:", razorpayServerOrderId);

            const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

            if (!res) {
                alert("Razorpay SDK failed to load. Please check your internet connection.");
                setIsSubmitting(false);
                if (firebaseOrderId) {
                    await update(ref(database, `orders/${firebaseOrderId}`), {
                        status: "Payment Initiation Failed (SDK Load)",
                    });
                }
                return;
            }

            const options = {
                key: "rzp_test_eVi31zd0UZULF8", // Your TEST Key ID from Razorpay
                amount: razorpayAmountInPaisa,
                currency: "INR",
                name: "Vashudhara Store",
                description: `Order for ${selectedProduct.title}`,
                image: "https://example.com/your_logo.png", // Replace with your store's logo URL
                order_id: razorpayServerOrderId, // IMPORTANT: Use the order ID received from your Cloud Function
                handler: async function (response) {
                    console.log("Payment successful:", response);
                    alert("Payment successful! Your order has been placed.");

                    if (firebaseOrderId) {
                        try {
                            await update(ref(database, `orders/${firebaseOrderId}`), {
                                status: "Payment Successful",
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpaySignature: response.razorpay_signature,
                            });
                            console.log("Order status updated in Firebase.");
                        } catch (updateError) {
                            console.error("Error updating order status in Firebase:", updateError);
                            alert("Payment successful, but there was an error updating order status in our system. Please contact support with your payment ID: " + response.razorpay_payment_id);
                        }
                    }

                    setSelectedProduct(null);
                    setIsSubmitting(false);
                },
                prefill: {
                    name: `${fullName} ${surname}`,
                    email: "customer@example.com",
                    contact: "9999999999",
                },
                notes: {
                    address: `${village}, ${district}, ${stateName} - ${pinCode}`,
                    customer_full_name: `${fullName} ${surname}`,
                    product_title: selectedProduct.title,
                    product_id: selectedProduct.id,
                    firebaseOrderId: firebaseOrderId,
                },
                theme: {
                    color: "#3399cc",
                },
                modal: {
                    ondismiss: async function () {
                        console.log('Payment dismissed by user.');
                        alert("Payment was cancelled or failed. Please try again.");
                        if (firebaseOrderId) {
                            try {
                                await update(ref(database, `orders/${firebaseOrderId}`), {
                                    status: "Payment Cancelled By User",
                                });
                                console.log("Order status updated to 'Payment Cancelled' in Firebase.");
                            } catch (updateError) {
                                console.error("Error updating order status on dismiss:", updateError);
                            }
                        }
                        setIsSubmitting(false);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error("Error during order creation or payment initiation:", error);
            alert(`An error occurred: ${error.message || "Please try again."}`);

            if (firebaseOrderId) {
                try {
                    await update(ref(database, `orders/${firebaseOrderId}`), {
                        status: "Payment Initiation Failed (Cloud Function Error)",
                        errorMessage: error.message,
                    });
                } catch (updateErr) {
                    console.error("Failed to update status after initiation error:", updateErr);
                }
            }
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-black min-h-screen py-16 px-5 font-poppins text-blue-100">
            <div className="max-w-3xl mx-auto text-center mb-10">
                <h1 className="text-4xl font-bold mb-3 text-emerald-300 capitalize">
                    {category.replace("-", " ")}
                </h1>
                <p className="text-lg text-slate-400">
                    Discover our latest {category.replace("-", " ")} products.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {isLoading ? (
                    <p className="text-slate-400 col-span-full text-center">
                        Loading products...
                    </p>
                ) : products.length === 0 ? (
                    <p className="text-slate-400 col-span-full text-center">
                        No products found in this category.
                    </p>
                ) : (
                    products.map((product) => (
                        <div
                            key={product.id}
                            className="relative bg-gray-800 rounded-3xl overflow-hidden shadow-lg shadow-emerald-700/30 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-emerald-700/60"
                            onClick={() => handleBuyClick(product)}
                        >
                            {product.tag && (
                                <span className="absolute top-4 left-4 bg-green-500 text-white py-1.5 px-3 rounded-full text-xs font-bold uppercase tracking-wider z-10">
                                    {product.tag}
                                </span>
                            )}

                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-52 object-cover"
                                loading="lazy"
                            />

                            <div className="absolute bottom-0 w-full bg-emerald-600/85 text-emerald-50 text-center py-3 opacity-0 transition-opacity duration-300 font-semibold text-base rounded-b-3xl group-hover:opacity-100 hover-overlay">
                                View Details
                            </div>

                            <div className="p-6">
                                <h3 className="text-2xl mb-3 text-emerald-200 font-bold">
                                    {product.title}
                                </h3>
                                <p className="text-base text-gray-300 leading-normal">
                                    Brand: {product.brand || "N/A"}
                                </p>
                                <p className="text-xl font-bold mt-2 text-emerald-50">
                                    Price: ₹{product.price || "N/A"}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedProduct && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-5"
                    onClick={() => !isSubmitting && setSelectedProduct(null)}
                >
                    <div
                        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md text-white p-6 flex flex-col max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-3xl font-bold mb-5 text-center text-emerald-300">
                            Buy {selectedProduct.title}
                        </h2>
                        <img
                            src={selectedProduct.image}
                            alt={selectedProduct.title}
                            className="w-full h-48 object-contain rounded-lg mb-6"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">Quantity:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">Size:</label>
                                <select
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                >
                                    <option value="S">Small</option>
                                    <option value="M">Medium</option>
                                    <option value="L">Large</option>
                                    <option value="XL">XL</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">Full Name:</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">Surname:</label>
                                <input
                                    type="text"
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">Pin Code:</label>
                                <input
                                    type="text"
                                    value={pinCode}
                                    onChange={(e) => setPinCode(e.target.value)}
                                    maxLength={6}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">State:</label>
                                <input
                                    type="text"
                                    value={stateName}
                                    onChange={(e) => setStateName(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">District:</label>
                                <input
                                    type="text"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">Village:</label>
                                <input
                                    type="text"
                                    value={village}
                                    onChange={(e) => setVillage(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-900 text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        <p className="text-xl font-bold mb-6 text-emerald-50">
                            Total Price: ₹{selectedProduct.price * quantity || "N/A"}
                        </p>

                        <button
                            onClick={handleCreateOrder}
                            className="bg-green-500 text-black py-3 rounded-full text-lg font-semibold mb-3 hover:bg-green-600 transition-colors duration-200"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Processing Payment..." : "Confirm Purchase & Pay"}
                        </button>
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="bg-red-500 text-white py-3 rounded-full text-lg font-semibold hover:bg-red-600 transition-colors duration-200"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default CategoryPage;