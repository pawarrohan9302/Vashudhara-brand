// src/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStatus from './hooks/useAuthStatus'; // Assuming useAuthStatus is in src/hooks/

const PrivateRoute = () => {
    const { loggedIn, checkingStatus } = useAuthStatus();

    if (checkingStatus) {
        // Optionally, render a loading spinner or message while checking status
        return (
            <div className="bg-black min-h-screen py-16 px-5 font-poppins text-blue-100 flex justify-center items-center">
                <p className="text-xl text-emerald-300">Checking authentication status...</p>
            </div>
        );
    }

    // If logged in, render the child routes, otherwise navigate to login
    return loggedIn ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;