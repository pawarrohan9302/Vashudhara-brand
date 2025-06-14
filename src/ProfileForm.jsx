// src/ProfileForm.jsx
import React, { useState, useEffect } from "react";
import { ref, set, get } from "firebase/database";
import { auth, database } from "./firebase";
import { useNavigate } from "react-router-dom";

const ProfileForm = () => {
    const [profile, setProfile] = useState({
        name: "",
        mobile: "",
        address: "",
    });

    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUser(currentUser);
            const userRef = ref(database, `users/${currentUser.uid}`);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    setProfile(snapshot.val());
                }
            });
        }
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        await set(ref(database, `users/${user.uid}`), profile);
        alert("Profile saved!");
        navigate("/");
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-black text-white p-6">
                <h2 className="text-2xl font-bold mb-4">Profile Setup</h2>
                <p>Fill your personal details to proceed.</p>
            </div>

            {/* Profile Form */}
            <div className="flex-1 p-10 bg-gray-50">
                <h1 className="text-3xl font-semibold mb-6">Complete Your Profile</h1>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                    <div>
                        <label className="block font-medium">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-medium">Mobile Number</label>
                        <input
                            type="tel"
                            name="mobile"
                            value={profile.mobile}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-medium">Address</label>
                        <textarea
                            name="address"
                            value={profile.address}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
                    >
                        Save Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileForm;
