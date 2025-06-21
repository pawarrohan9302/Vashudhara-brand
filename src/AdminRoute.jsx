// src/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Import your useAuth hook

const AdminRoute = () => {
    const { currentUser, loading, isAdmin } = useAuth(); // Destructure isAdmin from useAuth()

    // Show a loading indicator while authentication status is being determined
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-700">Loading admin authentication...</p>
            </div>
        );
    }

    // Check if there's a currentUser AND if that user has admin privileges
    if (currentUser && isAdmin) {
        // If both conditions are met, render the nested routes (i.e., the Admin component)
        return <Outlet />;
    } else {
        // If not authenticated or not an admin, redirect them.
        // You can choose to redirect to /login, or a specific /forbidden page.
        // For now, redirecting to /login is a good starting point.
        console.warn("Attempted to access admin route without admin privileges. Redirecting to login.");
        return <Navigate to="/login" replace />;
    }
};

export default AdminRoute;