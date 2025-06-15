// ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

const ProtectedRoute = ({ children }) => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <p style={{ color: "#fff", textAlign: "center" }}>Loading...</p>;

    return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
