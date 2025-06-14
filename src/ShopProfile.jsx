import React from "react";

const ShopProfile = () => {
    const shopData = {
        shopName: "Vashudhara",
        address: "Makan N-11, Ward No-123, Post Bodarli, Teh- Burhanpur, Dongargoan",
        logoURL: "https://your-logo-url.com/logo.png", // replace with actual logo URL
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-10">
            {shopData.logoURL && (
                <div className="flex justify-center mb-6">
                    <img
                        src={shopData.logoURL}
                        alt={`${shopData.shopName} Logo`}
                        className="w-32 h-32 object-contain rounded-lg shadow-md border"
                    />
                </div>
            )}

            <h1 className="text-4xl font-bold text-gray-900 mb-3 text-center">
                {shopData.shopName}
            </h1>

            <p className="text-center text-gray-600 text-lg mb-6">
                {shopData.address}
            </p>

            <div className="flex justify-center">
                <button
                    onClick={() => alert("Edit option coming soon")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow"
                >
                    Edit Profile
                </button>
            </div>
        </div>
    );
};

export default ShopProfile;
