// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import AuthProvider from AuthContext.jsx
// This wraps your entire application to provide authentication context
import { AuthProvider } from "./AuthContext.jsx";

// Import all your components directly from the src/ folder.
// Ensure these files are named with a .jsx extension (e.g., Header.jsx, Home.jsx).
import Header from "./Header.jsx";
import Home from "./Home.jsx";
import Cart from "./Cart.jsx";
import About from "./About.jsx";
import Contact from "./Contact.jsx";
import Collections from "./Collections.jsx";
import CategoryPage from "./CategoryPage.jsx";
import Admin from "./Admin.jsx"; // Consider adding specific admin protection here
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import ForgotPassword from "./ForgotPassword.jsx";

// Protected Components
// These are the components that should only be accessible to logged-in users.
import Dashboard from "./Dashboard.jsx"; // Example: A protected dashboard page
import ProfileForm from "./ProfileForm.jsx";
import Payment from "./Payment.jsx";
import Orders from "./Orders.jsx";
import Profile from "./Profile.jsx";
import Coupons from "./Coupons.jsx";
import SavedCards from "./SavedCards.jsx";
import SavedUPI from "./SavedUPI.jsx";
import Wallets from "./Wallets.jsx";
import Addresses from "./Addresses.jsx";
import Overview from "./Overview.jsx";
import VashudhraCredit from "./VashudhraCredit.jsx";
import CustomerOrderView from "./CustomerOrderView.jsx";

// Import the PrivateRoute component itself
// This component acts as a guard for your protected routes.
import PrivateRoute from "./PrivateRoute.jsx";

const App = () => (
  <Router>
    {/* The Header is placed outside <Routes> so it's visible on every page */}
    <Header />
    <Routes>
      {/* --- Public Routes --- */}
      {/* These routes are accessible to all users, whether they're logged in or not. */}
      <Route path="/" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/collections" element={<Collections />} />

      {/* Category-specific pages */}
      <Route path="/mens-wear" element={<CategoryPage category="mens-wear" />} />
      <Route path="/womens-wear" element={<CategoryPage category="womens-wear" />} />
      <Route path="/accessories" element={<CategoryPage category="accessories" />} />

      {/* Authentication Pages - These are also public by nature */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin Route - IMPORTANT: This route is currently public.
                For a real admin panel, you'd want to create a more specific
                'AdminRoute' component that checks for user roles/permissions. */}
      <Route path="/admin" element={<Admin />} />

      {/* --- Protected Routes --- */}
      {/* Routes nested inside <PrivateRoute> will only render if the user is authenticated.
                If not, they will be redirected to the login page. */}
      <Route element={<PrivateRoute />}>
        {/* Example of a protected Dashboard page.
                    If your "/" (Home) route should be the protected dashboard,
                    you would move <Route path="/" element={<Dashboard />} /> here. */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Other protected profile and account management routes */}
        <Route path="/profile" element={<ProfileForm />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile-details" element={<Profile />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/saved-cards" element={<SavedCards />} />
        <Route path="/saved-upi" element={<SavedUPI />} />
        <Route path="/wallets" element={<Wallets />} />
        <Route path="/addresses" element={<Addresses />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/vashudhra-credit" element={<VashudhraCredit />} />
        <Route path="/customerorderview" element={<CustomerOrderView />} />
      </Route>
      {/* --- End Protected Routes --- */}

      {/* Catch-all route for any paths that don't match the above routes.
                This acts as a basic 404 "Page Not Found" handler. */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-200">
            <h1 className="text-3xl font-bold text-gray-700">404 - Page Not Found</h1>
          </div>
        }
      />
    </Routes>
  </Router>
);

export default App;