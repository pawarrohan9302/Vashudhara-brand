import React, { useState, useEffect } from "react";
import { database } from "./firebase";
import { ref, onValue, push } from "firebase/database"; // Import 'push' for saving orders

const Collections = () => {
    const [collections, setCollections] = useState({});
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("mens-wear"); // Default category
    const [selectedProduct, setSelectedProduct] = useState(null);

    // State variables for the purchase form
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState("M");
    const [fullName, setFullName] = useState("");
    const [surname, setSurname] = useState("");
    const [pinCode, setPinCode] = useState("");
    const [stateName, setStateName] = useState("");
    const [district, setDistrict] = useState("");
    const [village, setVillage] = useState("");

    // --- Data Fetching ---
    useEffect(() => {
        const collectionsRef = ref(database, `collections/${category}`);
        const unsubscribe = onValue(collectionsRef, (snapshot) => {
            const data = snapshot.val() || {};
            setCollections(data);
        });
        return () => unsubscribe();
    }, [category]);

    const collectionItems = Object.entries(collections).map(([key, value]) => ({
        id: key,
        ...value,
    }));

    const filteredItems = collectionItems.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
    );

    // --- Event Handlers ---
    const handleViewDetailsClick = (product) => {
        setSelectedProduct(product);
        // Reset form fields when a new product is selected
        setQuantity(1);
        setSize("M"); // Default size
        setFullName("");
        setSurname("");
        setPinCode("");
        setStateName("");
        setDistrict("");
        setVillage("");
    };

    const handleCreateOrder = async () => {
        // Basic validation for address fields
        if (!fullName || !surname || !pinCode || !stateName || !district || !village) {
            alert("Please fill all required address fields.");
            return;
        }

        if (!selectedProduct) {
            alert("No product selected for purchase.");
            return;
        }

        const upiId = "9302909397@ybl"; // Your UPI ID
        const amount = (selectedProduct.price * quantity) || 100; // Calculate total amount
        const customer = `${fullName} ${surname}`;
        const note = `Order for ${selectedProduct.title} by ${customer}`;

        const upiUrl = `upi://pay?pa=${upiId}&pn=Vashudhara%20Store&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

        // Save order details to Firebase for admin
        try {
            const ordersRef = ref(database, "orders"); // Reference to your 'orders' collection
            await push(ordersRef, {
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
                status: "Pending Payment Confirmation",
                paymentMethod: "UPI",
                upiIdUsed: upiId,
            });

            alert("Order details saved! You will now be redirected to your UPI app for payment.\nAfter successful payment, please contact 9302909397 with your payment confirmation details to finalize your order.");
            window.location.href = upiUrl;
            setSelectedProduct(null); // Close modal after initiating payment and saving order
        } catch (error) {
            console.error("Error saving order to Firebase:", error);
            alert("There was an error placing your order. Please try again.");
        }
    };

    // --- Component Render ---
    return (
        <section className="bg-black min-h-screen py-16 px-5 font-poppins text-blue-100">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-3">Our Collections</h1>
                <p className="text-lg text-slate-400 mb-10">
                    Explore the latest collections of clothing, accessories, and more!
                </p>

                {/* Category Select */}
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="p-3.5 px-5 rounded-full border-2 border-emerald-400 bg-gray-900 text-blue-100 text-base mb-8 focus:outline-none focus:border-emerald-500"
                >
                    <option value="mens-wear">Men's Wear</option>
                    <option value="womens-wear">Women's Wear</option>
                    <option value="accessories">Accessories</option>
                    <option value="earrings">Earring Elegance</option>
                </select>

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search collections..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="p-3.5 px-6 rounded-full border-2 border-emerald-400 w-3/4 max-w-sm text-base bg-gray-900 text-blue-100 outline-none mb-12 transition-colors duration-300 focus:border-emerald-500"
                />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {filteredItems.length === 0 ? (
                    <p className="text-slate-400 col-span-full text-center">
                        No collections found.
                    </p>
                ) : (
                    filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="relative bg-gray-800 rounded-3xl overflow-hidden shadow-lg shadow-emerald-700/30 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-emerald-700/60"
                            onClick={() => handleViewDetailsClick(item)}
                        >
                            {item.tag && (
                                <span className="absolute top-4 left-4 bg-green-500 text-white py-1.5 px-3 rounded-full text-xs font-bold uppercase tracking-wider z-10">
                                    {item.tag}
                                </span>
                            )}

                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-52 object-cover"
                                loading="lazy"
                            />

                            {/* Hover Overlay */}
                            <div className="absolute bottom-0 w-full bg-emerald-600/85 text-emerald-50 text-center py-3 opacity-0 transition-opacity duration-300 font-semibold text-base rounded-b-3xl group-hover:opacity-100 hover-overlay">
                                View Details
                            </div>

                            <div className="p-6">
                                <h2 className="text-2xl mb-3 text-emerald-200 font-bold">
                                    {item.title}
                                </h2>
                                <p className="text-base text-gray-300 leading-normal">
                                    {item.description || item.brand || ""}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* --- Purchase Modal --- */}
            {selectedProduct && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-5"
                    onClick={() => setSelectedProduct(null)}
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

                        {/* Quantity and Size */}
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

                        {/* Address Fields */}
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
                        >
                            Confirm Purchase & Pay
                        </button>
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="bg-red-500 text-white py-3 rounded-full text-lg font-semibold hover:bg-red-600 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Collections;