// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth context using Firebase
import { AuthProvider } from "./AuthContext.jsx"; // This is where isAdmin is now determined

// Your components
import Header from "./Header.jsx";
import Home from "./Home.jsx";
import Cart from "./Cart.jsx";
import About from "./About.jsx";
import Contact from "./Contact.jsx";
import Collections from "./Collections.jsx";
import CategoryPage from "./CategoryPage.jsx";
import Admin from "./Admin.jsx"; // The Admin dashboard component
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import Wishlist from "./Wishlist.jsx";
import GiftCard from "./GiftCard.jsx";

// Product Detail Component
import ProductDetail from "./ProductDetail.jsx";

// Protected Components (for regular users)
import Dashboard from "./Dashboard.jsx";
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
import CustomerOrderView from "./CustomerOrderView.jsx";

// Your custom route wrappers
import PrivateRoute from "./PrivateRoute.jsx"; // For regular user protected routes
import AdminRoute from "./AdminRoute.jsx";   // 🔥 NEW: For admin-specific protected routes

const App = () => (
  <Router>
    <AuthProvider> {/* AuthProvider makes user and isAdmin status available everywhere */}
      <Header />
      <Routes>
        {/* --- Public Routes --- */}
        {/* These routes are accessible to anyone */}
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/collections" element={<Collections />} />

        {/* Dynamic route for individual product details */}
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* Category specific pages */}
        <Route path="/mens-wear" element={<CategoryPage category="mens-wear" />} />
        <Route path="/womens-wear" element={<CategoryPage category="womens-wear" />} />
        <Route path="/accessories" element={<CategoryPage category="accessories" />} />

        {/* Authentication related pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* --- Admin Protected Route --- */}
        {/* Only users with the 'isAdmin: true' custom claim can access the /admin path */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* --- Regular User Protected Routes --- */}
        {/* These routes require a user to be logged in (but not necessarily an admin) */}
        <Route element={<PrivateRoute />}>
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/gift-cards" element={<GiftCard />} />
          {/* VashudhraCredit route was intentionally removed based on your comment */}

          <Route path="/dashboard" element={<Dashboard />} />
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
          <Route path="/customerorderview" element={<CustomerOrderView />} />
        </Route>

        {/* Catch-all 404 Route */}
        {/* Renders if no other route matches the URL */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-200">
              <h1 className="text-3xl font-bold text-gray-700">404 - Page Not Found</h1>
            </div>
          }
        />
      </Routes>
    </AuthProvider>
  </Router>
);

export default App;