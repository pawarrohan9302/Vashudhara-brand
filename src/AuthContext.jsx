// src/AuthContext.jsx
import React, { useContext, useState, useEffect, createContext } from "react";
import { auth } from "./firebase"; // Relative path to your firebase config
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // Initial loading state is true
    const [isAdmin, setIsAdmin] = useState(false); // 🔥 NEW: State to store admin status

    useEffect(() => {
        // This Firebase function listens for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => { // Make it async to use await
            setCurrentUser(user);

            if (user) {
                try {
                    // 🔥 NEW: Get the user's ID token result.
                    // Pass 'true' to force a refresh, ensuring we get the latest custom claims.
                    const idTokenResult = await user.getIdTokenResult(true);
                    // Check if the 'isAdmin' custom claim exists and is true
                    setIsAdmin(idTokenResult.claims.isAdmin === true);
                } catch (error) {
                    console.error("Error fetching user ID token or claims:", error);
                    setIsAdmin(false); // If there's an error, assume not admin
                }
            } else {
                // If no user is logged in, they cannot be an admin
                setIsAdmin(false);
            }
            setLoading(false); // Authentication state (and admin status) has been determined
        });

        // Cleanup subscription on component unmount
        return unsubscribe;
    }, []); // Empty dependency array means this runs once on mount

    // Provide currentUser, loading, AND isAdmin status to components
    const value = {
        currentUser,
        loading,
        isAdmin, // 🔥 NEW: Expose the isAdmin status
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Only render children when loading is complete */}
            {!loading && children}
        </AuthContext.Provider>
    );
}