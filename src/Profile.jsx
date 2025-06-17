import React, { useState, useEffect } from "react";
import { auth, database } from "./firebase"; // Ensure firebase config and database are correctly imported
import { ref, set, onValue } from "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";
import { FaUserCircle, FaEnvelope, FaMobileAlt, FaBirthdayCake, FaMapMarkerAlt, FaVenusMars, FaPen } from "react-icons/fa"; // Importing relevant icons

const Profile = () => {
    const [user, authLoading] = useAuthState(auth); // Get user and loading state from react-firebase-hooks
    const [profileData, setProfileData] = useState({
        fullName: "",
        mobileNumber: "",
        emailId: "", // This will be from Firebase auth.email
        gender: "",
        dateOfBirth: "",
        location: "",
        alternateMobile: "",
        hintName: "", // This often refers to a recovery contact or similar
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [error, setError] = useState(null);

    // --- Fetch User Profile Data from Realtime Database ---
    useEffect(() => {
        if (authLoading) return; // Wait for Firebase auth to initialize

        if (user) {
            setLoadingProfile(true);
            const userProfileRef = ref(database, `users/${user.uid}/profile`);

            const unsubscribe = onValue(userProfileRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setProfileData((prevData) => ({
                        ...prevData,
                        ...data,
                        emailId: user.email, // Always take email from auth object
                        fullName: data.fullName || user.displayName || "", // Prioritize saved, then auth, then empty
                        mobileNumber: data.mobileNumber || user.phoneNumber || "", // Prioritize saved, then auth, then empty
                    }));
                } else {
                    // If no profile data exists, initialize with auth details
                    setProfileData({
                        fullName: user.displayName || "",
                        mobileNumber: user.phoneNumber || "",
                        emailId: user.email || "",
                        gender: "",
                        dateOfBirth: "",
                        location: "",
                        alternateMobile: "",
                        hintName: "",
                    });
                }
                setLoadingProfile(false);
            }, (err) => {
                console.error("Error fetching user profile:", err);
                setError("Failed to load profile data. Please try again.");
                setLoadingProfile(false);
            });

            return () => unsubscribe(); // Cleanup listener
        } else {
            setLoadingProfile(false); // No user, so not loading profile
            setProfileData({ // Reset profile data if user logs out
                fullName: "", mobileNumber: "", emailId: "", gender: "",
                dateOfBirth: "", location: "", alternateMobile: "", hintName: ""
            });
        }
    }, [user, authLoading]); // Depend on user and authLoading

    // --- Handle Input Changes in Edit Mode ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // --- Save Profile Changes to Firebase ---
    const handleSaveProfile = async () => {
        if (!user) {
            alert("You must be logged in to save profile changes.");
            return;
        }
        setLoadingProfile(true);
        setError(null);

        try {
            // Filter out emailId as it comes from auth, not direct input save
            const { emailId, ...dataToSave } = profileData;
            const userProfileRef = ref(database, `users/${user.uid}/profile`);
            await set(userProfileRef, dataToSave); // Overwrites existing data or creates new
            alert("Profile updated successfully!");
            setIsEditing(false); // Exit edit mode
        } catch (err) {
            console.error("Error saving profile:", err);
            setError("Failed to save profile changes. Please try again.");
        } finally {
            setLoadingProfile(false);
        }
    };

    if (authLoading || loadingProfile) {
        return (
            <div style={containerStyle}>
                <p style={loadingErrorStyle}>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={containerStyle}>
                <p style={{ ...loadingErrorStyle, color: "#f00" }}>{error}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={containerStyle}>
                <p style={loadingErrorStyle}>You are not logged in. Please log in to view your profile.</p>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <h2 style={headingStyle}>Profile Overview</h2>

            <div style={profileCardStyle}>
                {!isEditing ? (
                    // --- Display Mode ---
                    <>
                        <div style={profileRowStyle}>
                            <FaUserCircle size={20} color="#0ff" style={iconStyle} />
                            <p><strong>Full Name:</strong> {profileData.fullName || "Not added"}</p>
                        </div>
                        <div style={profileRowStyle}>
                            <FaMobileAlt size={20} color="#0ff" style={iconStyle} />
                            <p><strong>Mobile Number:</strong> {profileData.mobileNumber || "Not added"}</p>
                        </div>
                        <div style={profileRowStyle}>
                            <FaEnvelope size={20} color="#0ff" style={iconStyle} />
                            <p><strong>Email ID:</strong> {profileData.emailId || "Not added"}</p>
                        </div>
                        <div style={profileRowStyle}>
                            <FaVenusMars size={20} color="#0ff" style={iconStyle} />
                            <p><strong>Gender:</strong> {profileData.gender || "Not added"}</p>
                        </div>
                        <div style={profileRowStyle}>
                            <FaBirthdayCake size={20} color="#0ff" style={iconStyle} />
                            <p><strong>Date of Birth:</strong> {profileData.dateOfBirth || "Not added"}</p>
                        </div>
                        <div style={profileRowStyle}>
                            <FaMapMarkerAlt size={20} color="#0ff" style={iconStyle} />
                            <p><strong>Location:</strong> {profileData.location || "Not added"}</p>
                        </div>
                        <div style={profileRowStyle}>
                            <FaMobileAlt size={20} color="#0ff" style={iconStyle} />
                            <p><strong>Alternate Mobile:</strong> {profileData.alternateMobile || "Not added"}</p>
                        </div>
                        <div style={profileRowStyle}>
                            <FaPen size={20} color="#0ff" style={iconStyle} /> {/* Using FaPen for Hint Name as it implies a custom identifier */}
                            <p><strong>Hint Name:</strong> {profileData.hintName || "Not added"}</p>
                        </div>

                        <button
                            onClick={() => setIsEditing(true)}
                            style={editButtonStyle}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#00e6e6'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.7)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0ff'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)'; }}
                        >
                            EDIT
                        </button>
                    </>
                ) : (
                    // --- Edit Mode ---
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} style={formStyle}>
                        <div style={inputGroupStyle}>
                            <label htmlFor="fullName" style={labelStyle}>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                id="fullName"
                                value={profileData.fullName}
                                onChange={handleInputChange}
                                style={inputFieldStyle}
                                required
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label htmlFor="mobileNumber" style={labelStyle}>Mobile Number</label>
                            <input
                                type="tel"
                                name="mobileNumber"
                                id="mobileNumber"
                                value={profileData.mobileNumber}
                                onChange={handleInputChange}
                                style={inputFieldStyle}
                                pattern="[0-9]{10}"
                                title="Please enter a 10-digit mobile number"
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label htmlFor="emailId" style={labelStyle}>Email ID</label>
                            <input
                                type="email"
                                name="emailId"
                                id="emailId"
                                value={profileData.emailId}
                                style={{ ...inputFieldStyle, cursor: 'not-allowed', opacity: 0.7 }} // Email usually not editable directly
                                disabled
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label htmlFor="gender" style={labelStyle}>Gender</label>
                            <select
                                name="gender"
                                id="gender"
                                value={profileData.gender}
                                onChange={handleInputChange}
                                style={inputFieldStyle}
                            >
                                <option value="">Select Gender</option>
                                <option value="MALE">MALE</option>
                                <option value="FEMALE">FEMALE</option>
                                <option value="OTHER">OTHER</option>
                            </select>
                        </div>
                        <div style={inputGroupStyle}>
                            <label htmlFor="dateOfBirth" style={labelStyle}>Date of Birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                id="dateOfBirth"
                                value={profileData.dateOfBirth}
                                onChange={handleInputChange}
                                style={inputFieldStyle}
                                placeholder="YYYY-MM-DD" // Added placeholder for date
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label htmlFor="location" style={labelStyle}>Location</label>
                            <input
                                type="text"
                                name="location"
                                id="location"
                                value={profileData.location}
                                onChange={handleInputChange}
                                style={inputFieldStyle}
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label htmlFor="alternateMobile" style={labelStyle}>Alternate Mobile</label>
                            <input
                                type="tel"
                                name="alternateMobile"
                                id="alternateMobile"
                                value={profileData.alternateMobile}
                                onChange={handleInputChange}
                                style={inputFieldStyle}
                                pattern="[0-9]{10}"
                                title="Please enter a 10-digit mobile number"
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label htmlFor="hintName" style={labelStyle}>Hint Name</label>
                            <input
                                type="text"
                                name="hintName"
                                id="hintName"
                                value={profileData.hintName}
                                onChange={handleInputChange}
                                style={inputFieldStyle}
                            />
                        </div>

                        <div style={buttonGroupStyle}>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                style={cancelButtonStyle}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#555'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#333'; }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={saveButtonStyle}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#00e6e6'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.7)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0ff'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)'; }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

// --- Styles ---
// Consider adding a global CSS reset or normalize.css in your project's main CSS file.
// For example:
// html { box-sizing: border-box; }
// *, *::before, *::after { box-sizing: inherit; }

const containerStyle = {
    backgroundColor: "#000",
    color: "#fff",
    fontFamily: "Poppins, sans-serif",
    minHeight: "100vh", // Ensures the background covers the full height
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start", // Align items to the top
    textAlign: "center",
};

const headingStyle = {
    fontSize: "32px",
    marginBottom: "35px",
    textShadow: "0 0 8px #0ff, 0 0 15px #0ff",
    color: "#0ff",
    textAlign: "center",
};

const profileCardStyle = {
    backgroundColor: "#1a1a1a",
    padding: "30px 40px",
    borderRadius: "15px",
    boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)",
    border: "1px solid #0ff5",
    maxWidth: "600px",
    width: "100%",
    boxSizing: "border-box", // Include padding in width calculation
    position: "relative",
};

const profileRowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "15px",
    fontSize: "1.1em",
    color: "#ccc",
    textAlign: "left",
};

const iconStyle = {
    flexShrink: 0, // Prevent icon from shrinking
};

const editButtonStyle = {
    backgroundColor: "#0ff",
    color: "#000",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
    transition: "all 0.3s ease-in-out",
    marginTop: "30px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Make button full width in the card
};

const loadingErrorStyle = {
    fontSize: "20px",
    color: "#0ff",
    marginTop: "50px",
};

// Styles for Edit Form
const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    textAlign: "left", // Align labels/inputs to the left within the form
};

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
    "&:focus": { // This pseudo-selector for focus won't work directly in React's inline styles.
        // You'd typically use a CSS stylesheet or a styling library for this.
        borderColor: "#0ff",
        boxShadow: "0 0 15px rgba(0, 255, 255, 0.6)",
        transform: "translateY(-1px)",
    },
    "&::placeholder": { // Same applies here for placeholder styling.
        color: "#888",
    },
};

const buttonGroupStyle = {
    display: "flex",
    gap: "15px",
    marginTop: "20px",
    justifyContent: "space-between", // Space out buttons
    flexWrap: "wrap", // Allow buttons to wrap
};

const saveButtonStyle = {
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
    flex: 1, // Allow button to grow
    minWidth: "150px", // Minimum width for responsiveness
};

const cancelButtonStyle = {
    backgroundColor: "#333",
    color: "#eee",
    border: "1px solid #555",
    padding: "12px 25px",
    borderRadius: "8px",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    flex: 1, // Allow button to grow
    minWidth: "150px",
};

export default Profile;