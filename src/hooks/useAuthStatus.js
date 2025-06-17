// src/hooks/useAuthStatus.js (recommended path)
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const useAuthStatus = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [user, setUser] = useState(null); // To store the authenticated user object

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setLoggedIn(true);
                setUser(user); // Set the user object
            } else {
                setLoggedIn(false);
                setUser(null); // Clear user object if not logged in
            }
            setCheckingStatus(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return { loggedIn, checkingStatus, user };
};

export default useAuthStatus;