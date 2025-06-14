import React, { useState } from "react";
import { database } from "./firebase";
import { ref, push, set, remove } from "firebase/database";

const ProductManager = () => {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [brand, setBrand] = useState("");
    const [category, setCategory] = useState("mens-wear");
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Image upload to Cloudinary
    const handleImageUpload = async () => {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "vashudharaupload"); // your unsigned preset name

        const response = await fetch(
            "https://api.cloudinary.com/v1_1/dimlqmmj8/image/upload",
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();
        setUploading(false);

        if (response.ok) return data.secure_url;
        else throw new Error("Image upload failed");
    };

    // Add product to products and collections both
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!imageFile) return alert("Please select an image");

        try {
            const imageUrl = await handleImageUpload();

            const newProduct = {
                title,
                price,
                brand,
                image: imageUrl,
                category,
            };

            // Add to products node and get unique key
            const dbRefProducts = ref(database, "products");
            const newProductRef = push(dbRefProducts);

            // Save product under products
            await set(newProductRef, newProduct);

            // Save product under collections/category with same key
            const dbRefCollections = ref(
                database,
                `collections/${category}/${newProductRef.key}`
            );
            await set(dbRefCollections, newProduct);

            // Reset form
            setTitle("");
            setPrice("");
            setBrand("");
            setImageFile(null);

            alert("✅ Product added successfully!");
        } catch (error) {
            console.error("Upload error:", error);
            alert("❌ Upload failed.");
        }
    };

    // Delete product from both products and collections
    const handleDelete = async (productId, category) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            await remove(ref(database, `products/${productId}`));
            await remove(ref(database, `collections/${category}/${productId}`));
            alert("✅ Product deleted successfully!");
        } catch (error) {
            console.error("Delete error:", error);
            alert("❌ Delete failed.");
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <input
                    type="text"
                    placeholder="Product Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                />
                <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                />
                <input
                    type="text"
                    placeholder="Brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="w-full"
                    required
                />
                {uploading && (
                    <p className="text-blue-500">Uploading image, please wait...</p>
                )}
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                    <option value="mens-wear">Men's Wear</option>
                    <option value="womens-wear">Women's Wear</option>
                    <option value="accessories">Accessories</option>
                </select>
                <button
                    type="submit"
                    className="w-full py-3 mt-4 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition"
                >
                    Add Product
                </button>
            </form>
        </div>
    );
};

export default ProductManager;
