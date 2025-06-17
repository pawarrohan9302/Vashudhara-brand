import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrashAlt, FaTimes } from "react-icons/fa";
import { auth, database } from "./firebase";
import { ref, onValue, push, set, remove } from "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";

const Addresses = () => {
    const [user, authLoading] = useAuthState(auth);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentAddress, setCurrentAddress] = useState(null); // For editing
    const [formData, setFormData] = useState({
        fullName: "",
        mobile: "",
        pincode: "",
        state: "",
        streetAddress: "",
        locality: "",
        city: "",
        addressType: "Home",
        isDefault: false,
    });
    const navigate = useNavigate();

    // --- Fetch Addresses on Component Mount ---
    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            navigate("/login");
            return;
        }

        setLoading(true);
        const userAddressesRef = ref(database, `users/${user.uid}/addresses`);

        const unsubscribe = onValue(userAddressesRef, (snapshot) => {
            const data = snapshot.val();
            const loadedAddresses = [];
            if (data) {
                Object.keys(data).forEach((key) => {
                    loadedAddresses.push({ id: key, ...data[key] });
                });
            }
            loadedAddresses.sort((a, b) => (b.isDefault - a.isDefault));
            setAddresses(loadedAddresses);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching addresses:", error);
            setLoading(false);
            alert("Failed to load addresses. Please try again.");
        });

        return () => unsubscribe();
    }, [user, authLoading, navigate]);

    // --- Handle Form Input Changes ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // --- Add/Update Address ---
    const handleSaveAddress = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("You must be logged in to save an address.");
            return;
        }

        const addressesRef = ref(database, `users/${user.uid}/addresses`);

        try {
            if (formData.isDefault) {
                const currentDefault = addresses.find(addr => addr.isDefault);
                if (currentDefault && currentDefault.id !== currentAddress?.id) {
                    const defaultAddressRef = ref(database, `users/${user.uid}/addresses/${currentDefault.id}`);
                    await set(defaultAddressRef, { ...currentDefault, isDefault: false });
                }
            }

            if (currentAddress) {
                const addressToUpdateRef = ref(database, `users/${user.uid}/addresses/${currentAddress.id}`);
                await set(addressToUpdateRef, formData);
                alert("Address updated successfully!");
            } else {
                await push(addressesRef, formData);
                alert("Address added successfully!");
            }
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error("Error saving address:", error);
            alert("Failed to save address. Please try again.");
        }
    };

    // --- Set Address as Default ---
    const handleSetDefault = async (addressId) => {
        if (!user) return;

        try {
            const currentDefault = addresses.find(addr => addr.isDefault);
            if (currentDefault && currentDefault.id !== addressId) {
                const defaultAddressRef = ref(database, `users/${user.uid}/addresses/${currentDefault.id}`);
                await set(defaultAddressRef, { ...currentDefault, isDefault: false });
            }

            const newDefaultAddress = addresses.find(addr => addr.id === addressId);
            if (newDefaultAddress) {
                const newDefaultRef = ref(database, `users/${user.uid}/addresses/${addressId}`);
                await set(newDefaultRef, { ...newDefaultAddress, isDefault: true });
                alert("Address set as default!");
            }
        } catch (error) {
            console.error("Error setting default address:", error);
            alert("Failed to set default address. Please try again.");
        }
    };

    // --- Edit Address ---
    const handleEditAddress = (address) => {
        setCurrentAddress(address);
        setFormData(address);
        setShowModal(true);
    };

    // --- Delete Address ---
    const handleDeleteAddress = async (addressId) => {
        if (!user) {
            alert("You must be logged in to delete an address.");
            return;
        }
        if (window.confirm("Are you sure you want to delete this address?")) {
            try {
                const addressToDeleteRef = ref(database, `users/${user.uid}/addresses/${addressId}`);
                await remove(addressToDeleteRef);
                alert("Address deleted successfully!");
            } catch (error) {
                console.error("Error deleting address:", error);
                alert("Failed to delete address. Please try again.");
            }
        }
    };

    // --- Reset Form Data ---
    const resetForm = () => {
        setFormData({
            fullName: "",
            mobile: "",
            pincode: "",
            state: "",
            streetAddress: "",
            locality: "",
            city: "",
            addressType: "Home",
            isDefault: false,
        });
        setCurrentAddress(null);
    };

    // --- Open Add Address Modal ---
    const handleAddAddressClick = () => {
        resetForm();
        setShowModal(true);
    };

    // --- Close Modal ---
    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    if (authLoading || loading) {
        return (
            <div style={{ backgroundColor: "#000", color: "#fff", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" }}>
                Loading addresses...
            </div>
        );
    }

    return (
        <div
            style={{
                backgroundColor: "#000",
                color: "#fff",
                fontFamily: "Poppins, sans-serif",
                minHeight: "100vh",
                padding: "40px",
            }}
        >
            <h2
                style={{
                    fontSize: "32px",
                    marginBottom: "35px",
                    textShadow: "0 0 8px #0ff, 0 0 15px #0ff",
                    color: "#0ff",
                    textAlign: "center",
                }}
            >
                My Addresses
            </h2>

            {addresses.length === 0 && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        marginTop: "50px",
                    }}
                >
                    <FaMapMarkerAlt size={80} color="#0ff" style={{ marginBottom: "20px" }} />
                    <h3 style={{ fontSize: "28px", marginBottom: "10px", color: "#0ff" }}>
                        No Saved Addresses
                    </h3>
                    <p style={{ fontSize: "18px", color: "#aaa", maxWidth: "500px" }}>
                        Add and manage your delivery addresses here for faster checkout.
                    </p>
                </div>
            )}

            <div style={{ textAlign: "center", marginBottom: "30px", marginTop: addresses.length === 0 ? "30px" : "0" }}>
                <button
                    onClick={handleAddAddressClick}
                    style={{
                        backgroundColor: "#0ff",
                        color: "#000",
                        border: "none",
                        padding: "12px 25px",
                        borderRadius: "8px",
                        fontSize: "18px",
                        fontWeight: "600",
                        cursor: "pointer",
                        boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
                        transition: "all 0.3s ease-in-out",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#00e6e6'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.7)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0ff'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)'; }}
                >
                    <FaPlus /> Add New Address
                </button>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "25px",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    paddingBottom: "50px",
                }}
            >
                {addresses.map((address) => (
                    <div
                        key={address.id}
                        style={{
                            backgroundColor: "#1a1a1a",
                            padding: "25px",
                            borderRadius: "15px",
                            boxShadow: "0 0 15px rgba(0, 255, 255, 0.15)",
                            border: "1px solid #0ff5",
                            position: "relative",
                            transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 255, 255, 0.3)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.15)';
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                            <h3 style={{ color: "#0ff", fontSize: "1.4em", margin: 0 }}>
                                {address.fullName}
                            </h3>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{
                                    backgroundColor: "#00e6e6",
                                    color: "#000",
                                    padding: "5px 10px",
                                    borderRadius: "5px",
                                    fontSize: "0.85em",
                                    fontWeight: "bold",
                                }}>
                                    {address.addressType}
                                </span>
                                {address.isDefault && (
                                    <span style={{
                                        backgroundColor: "#ffd700",
                                        color: "#000",
                                        padding: "5px 10px",
                                        borderRadius: "5px",
                                        fontSize: "0.85em",
                                        fontWeight: "bold",
                                    }}>
                                        Default
                                    </span>
                                )}
                            </div>
                        </div>
                        <p style={{ fontSize: "0.95em", color: "#ccc", marginBottom: "8px" }}>
                            {address.streetAddress}
                        </p>
                        <p style={{ fontSize: "0.95em", color: "#ccc", marginBottom: "8px" }}>
                            {address.locality}, {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p style={{ fontSize: "0.95em", color: "#ccc", marginBottom: "15px" }}>
                            Mobile: {address.mobile}
                        </p>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                            {!address.isDefault && (
                                <button
                                    onClick={() => handleSetDefault(address.id)}
                                    style={{
                                        background: "none",
                                        border: "1px solid #ffd700",
                                        color: "#ffd700",
                                        padding: "8px 15px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        fontSize: "0.9em",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        transition: "background-color 0.2s, color 0.2s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.2)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Set as Default
                                </button>
                            )}
                            <button
                                onClick={() => handleEditAddress(address)}
                                style={{
                                    background: "none",
                                    border: "1px solid #0ff",
                                    color: "#0ff",
                                    padding: "8px 15px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontSize: "0.9em",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    transition: "background-color 0.2s, color 0.2s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0ff3'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <FaEdit /> Edit
                            </button>
                            <button
                                onClick={() => handleDeleteAddress(address.id)}
                                style={{
                                    background: "none",
                                    border: "1px solid #f00",
                                    color: "#f00",
                                    padding: "8px 15px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontSize: "0.9em",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    transition: "background-color 0.2s, color 0.2s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.2)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <FaTrashAlt /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Address Modal */}
            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#1a1a1a",
                            padding: "30px",
                            borderRadius: "15px",
                            boxShadow: "0 0 30px rgba(0, 255, 255, 0.5)",
                            maxWidth: "600px", // Increased max-width for more horizontal space
                            width: "90%",
                            position: "relative",
                            maxHeight: "90vh",
                            overflowY: "auto",
                        }}
                    >
                        <button
                            onClick={handleCloseModal}
                            style={{
                                position: "absolute",
                                top: "15px",
                                right: "15px",
                                background: "none",
                                border: "none",
                                color: "#0ff",
                                fontSize: "24px",
                                cursor: "pointer",
                            }}
                        >
                            <FaTimes />
                        </button>
                        <h3 style={{ color: "#0ff", marginBottom: "25px", fontSize: "24px" }}>
                            {currentAddress ? "Edit Address" : "Add New Address"}
                        </h3>
                        <form onSubmit={handleSaveAddress} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

                            {/* Row 1: Full Name and Mobile */}
                            <div style={formRowStyle}>
                                <div style={inputGroupStyle}>
                                    <label htmlFor="fullName" style={labelStyle}>Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        id="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                        style={inputFieldStyle}
                                    />
                                </div>
                                <div style={inputGroupStyle}>
                                    <label htmlFor="mobile" style={labelStyle}>Mobile *</label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        id="mobile"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        required
                                        style={inputFieldStyle}
                                        pattern="[0-9]{10}"
                                        title="Please enter a 10-digit mobile number"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Pincode & State */}
                            <div style={formRowStyle}>
                                <div style={inputGroupStyle}>
                                    <label htmlFor="pincode" style={labelStyle}>Pincode *</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        id="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        required
                                        style={inputFieldStyle}
                                    />
                                </div>
                                <div style={inputGroupStyle}>
                                    <label htmlFor="state" style={labelStyle}>State *</label>
                                    <input
                                        type="text"
                                        name="state"
                                        id="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        required
                                        style={inputFieldStyle}
                                    />
                                </div>
                            </div>

                            {/* Row 3: Address (House No, Building, Street, Area) - Full width */}
                            <div style={inputGroupStyle}>
                                <label htmlFor="streetAddress" style={labelStyle}>Address (House No, Building, Street, Area) *</label>
                                <input
                                    type="text"
                                    name="streetAddress"
                                    id="streetAddress"
                                    value={formData.streetAddress}
                                    onChange={handleInputChange}
                                    required
                                    style={inputFieldStyle}
                                />
                            </div>

                            {/* Row 4: Locality/Town and City/District */}
                            <div style={formRowStyle}>
                                <div style={inputGroupStyle}>
                                    <label htmlFor="locality" style={labelStyle}>Locality/Town</label>
                                    <input
                                        type="text"
                                        name="locality"
                                        id="locality"
                                        value={formData.locality}
                                        onChange={handleInputChange}
                                        style={inputFieldStyle}
                                    />
                                </div>
                                <div style={inputGroupStyle}>
                                    <label htmlFor="city" style={labelStyle}>City/District *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        id="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        style={inputFieldStyle}
                                    />
                                </div>
                            </div>

                            {/* Row 5: Type of Address */}
                            <div style={inputGroupStyle}>
                                <label htmlFor="addressType" style={labelStyle}>Type of Address *</label>
                                <select
                                    name="addressType"
                                    id="addressType"
                                    value={formData.addressType}
                                    onChange={handleInputChange}
                                    style={inputFieldStyle}
                                >
                                    <option value="Home">Home</option>
                                    <option value="Office">Office</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Make this my default address checkbox */}
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    id="isDefaultCheckbox"
                                    checked={formData.isDefault}
                                    onChange={handleInputChange}
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        accentColor: "#0ff",
                                        cursor: "pointer",
                                    }}
                                />
                                <label htmlFor="isDefaultCheckbox" style={{ fontSize: "1.1em", cursor: "pointer", color: "#ccc" }}>
                                    Make this my default address
                                </label>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    backgroundColor: "#0ff",
                                    color: "#000",
                                    border: "none",
                                    padding: "12px 25px",
                                    borderRadius: "8px",
                                    fontSize: "18px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
                                    transition: "all 0.3s ease-in-out",
                                    marginTop: "20px",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#00e6e6'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.7)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0ff'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)'; }}
                            >
                                {currentAddress ? "Update Address" : "Add Address"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Reusable styles
const inputGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
};

const labelStyle = {
    fontSize: "0.95em",
    color: "#0ff",
    fontWeight: "600",
    textAlign: "left",
};

const inputFieldStyle = {
    padding: "14px 15px",
    borderRadius: "10px",
    border: "1px solid #0ff5",
    backgroundColor: "#222",
    color: "#fff",
    fontSize: "16px",
    outline: "none",
    boxShadow: "0 2px 8px rgba(0, 255, 255, 0.1)",
    transition: "all 0.3s ease",
    "&:focus": {
        borderColor: "#0ff",
        boxShadow: "0 0 15px rgba(0, 255, 255, 0.6)",
        transform: "translateY(-1px)",
    },
    "&::placeholder": {
        color: "#888",
    },
};

// New style for horizontal rows
const formRowStyle = {
    display: "flex",
    gap: "15px", // Space between columns
    flexWrap: "wrap", // Allow items to wrap on smaller screens
    width: "100%", // Take full width of the form
};

export default Addresses;