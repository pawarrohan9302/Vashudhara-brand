import React, { useState, useEffect } from "react";
import { database } from "./firebase";
import { ref, onValue, remove } from "firebase/database";

import ShopProfile from "./ShopProfile";
import ProductManager from "./ProductManager";
import OrdersList from "./OrdersList";

const Admin = () => {
    const [passwordInput, setPasswordInput] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("shopProfile");
    const [products, setProducts] = useState([]);
    const correctPassword = "23122017";

    // Fetch products
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

    // Delete product from products and collections
    const handleDelete = (productId) => {
        // Find the product to get its category
        const product = products.find((p) => p.id === productId);
        if (!product) {
            alert("Product not found!");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this product?")) return;

        const productRef = ref(database, `products/${productId}`);
        const collectionRef = ref(database, `collections/${product.category}/${productId}`);

        Promise.all([remove(productRef), remove(collectionRef)])
            .then(() => {
                setProducts(products.filter((p) => p.id !== productId));
                alert("✅ Product deleted successfully from both products and collections!");
            })
            .catch((error) => {
                console.error("Delete error:", error);
                alert("❌ Failed to delete product.");
            });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (passwordInput === correctPassword) {
            setAuthenticated(true);
            setError("");
        } else {
            setError("Wrong password! Try again.");
        }
    };

    if (!authenticated) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                <div className="bg-white rounded-lg shadow-lg p-10 w-96">
                    <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
                        Admin Login
                    </h2>
                    <form onSubmit={handleLogin} className="flex flex-col space-y-4">
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                        <button
                            type="submit"
                            className="py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition"
                        >
                            Login
                        </button>
                    </form>
                    {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg p-6 flex flex-col">
                <h1 className="text-2xl font-extrabold mb-8 text-gray-900">Admin Panel</h1>
                <nav className="flex flex-col space-y-3">
                    <button
                        className={`text-left px-4 py-3 rounded-md font-medium transition ${activeTab === "shopProfile"
                            ? "bg-indigo-600 text-white shadow"
                            : "text-gray-700 hover:bg-indigo-100"
                            }`}
                        onClick={() => setActiveTab("shopProfile")}
                    >
                        Shop Profile
                    </button>
                    <button
                        className={`text-left px-4 py-3 rounded-md font-medium transition ${activeTab === "productManager"
                            ? "bg-indigo-600 text-white shadow"
                            : "text-gray-700 hover:bg-indigo-100"
                            }`}
                        onClick={() => setActiveTab("productManager")}
                    >
                        Product Manager
                    </button>
                    <button
                        className={`text-left px-4 py-3 rounded-md font-medium transition ${activeTab === "ordersList"
                            ? "bg-indigo-600 text-white shadow"
                            : "text-gray-700 hover:bg-indigo-100"
                            }`}
                        onClick={() => setActiveTab("ordersList")}
                    >
                        Orders List
                    </button>
                    <button
                        className={`text-left px-4 py-3 rounded-md font-medium transition ${activeTab === "productsList"
                            ? "bg-indigo-600 text-white shadow"
                            : "text-gray-700 hover:bg-indigo-100"
                            }`}
                        onClick={() => setActiveTab("productsList")}
                    >
                        Products List ({products.length})
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-auto">
                {activeTab === "shopProfile" && <ShopProfile />}
                {activeTab === "productManager" && <ProductManager />}
                {activeTab === "ordersList" && <OrdersList />}

                {/* Products List */}
                {activeTab === "productsList" && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Products List ({products.length})</h2>
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-full h-48 object-cover rounded-md"
                                    />
                                    <h3 className="text-xl font-semibold mt-2">{product.title}</h3>
                                    <p className="text-gray-600">₹ {product.price}</p>
                                    <p className="text-sm text-gray-500">{product.brand}</p>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        {product.category}
                                    </span>
                                    <button
                                        className="mt-4 w-full bg-red-500 text-white py-2 rounded-md font-bold hover:bg-red-600 transition"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        Delete Product
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Admin;
