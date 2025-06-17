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

    useEffect(() => {
        // This Firebase function listens for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user); // Set currentUser to user object or null
            setLoading(false);    // Once Firebase has checked, set loading to false
        });

        // Cleanup subscription on component unmount
        return unsubscribe;
    }, []); // Empty dependency array means this runs once on mount

    // Provide currentUser and loading state to components
    const value = {
        currentUser,
        loading,
        // You might want to add login/logout functions here later,
        // which would wrap Firebase auth methods (e.g., signInWithEmailAndPassword)
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Only render children when loading is complete */}
            {!loading && children}
        </AuthContext.Provider>
    );
}