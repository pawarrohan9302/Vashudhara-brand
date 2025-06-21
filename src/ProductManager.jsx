import React, { useState } from "react";
import { database } from "./firebase";
import { ref, push, set, remove as firebaseRemove } from "firebase/database"; // Renamed remove to firebaseRemove to avoid conflict

const ProductManager = () => {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [brand, setBrand] = useState("");
    const [category, setCategory] = useState("mens-wear");
    const [imageFiles, setImageFiles] = useState([]); // Changed to an array for multiple files
    const [uploading, setUploading] = useState(false);

    // Image upload to Cloudinary (handles a single file)
    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "vashudharaupload"); // your unsigned preset name

        const response = await fetch(
            "https://api.cloudinary.com/v1_1/dimlqmmj8/image/upload",
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();
        if (response.ok) return data.secure_url;
        else throw new Error(`Image upload failed for ${file.name}`);
    };

    // Add product to products and collections both
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (imageFiles.length === 0) {
            alert("Please select at least one image.");
            return;
        }

        setUploading(true); // Start uploading indicator

        try {
            // Upload all selected images in parallel
            const imageUrls = await Promise.all(
                imageFiles.map((file) => handleImageUpload(file))
            );

            const newProduct = {
                title,
                price: parseFloat(price), // Ensure price is stored as a number
                brand,
                images: imageUrls, // Store an array of image URLs
                category,
            };

            // Add to products node and get a unique key
            const dbRefProducts = ref(database, "products");
            const newProductRef = push(dbRefProducts);

            // Save product under 'products'
            await set(newProductRef, newProduct);

            // Save product under 'collections/category' with the same key
            const dbRefCollections = ref(
                database,
                `collections/${category}/${newProductRef.key}`
            );
            await set(dbRefCollections, newProduct);

            // Reset form fields
            setTitle("");
            setPrice("");
            setBrand("");
            setCategory("mens-wear"); // Reset category to default
            setImageFiles([]); // Clear selected image files

            alert("✅ Product added successfully with multiple images!");
        } catch (error) {
            console.error("Upload error:", error);
            alert(`❌ Upload failed: ${error.message || "An unknown error occurred."}`);
        } finally {
            setUploading(false); // End uploading indicator regardless of success or failure
        }
    };

    // This handleDelete function is not strictly used by the Admin component's product list,
    // as Admin component handles its own product deletion logic.
    // However, it's kept here for completeness if you decide to add deletion capabilities directly within ProductManager later.
    const handleDelete = async (productId, categoryToDelete) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            await firebaseRemove(ref(database, `products/${productId}`));
            await firebaseRemove(ref(database, `collections/${categoryToDelete}/${productId}`));
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
                    multiple // Key change: allows selecting multiple files
                    onChange={(e) => setImageFiles(Array.from(e.target.files))} // Store all selected files in state
                    className="w-full"
                    required
                />
                {/* Display number of selected images */}
                {imageFiles.length > 0 && (
                    <p className="text-gray-600 text-sm">
                        Selected {imageFiles.length} image(s).
                    </p>
                )}
                {uploading && (
                    <p className="text-blue-500">Uploading image(s), please wait...</p>
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
                    className="w-full py-3 mt-4 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={uploading} // Disable button during upload
                >
                    {uploading ? "Adding Product..." : "Add Product"}
                </button>
            </form>
        </div>
    );
};

export default ProductManager;