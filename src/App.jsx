// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth context using Firebase
import { AuthProvider } from "./AuthContext.jsx";

// Your components
import Header from "./Header.jsx";
import Home from "./Home.jsx";
import Cart from "./Cart.jsx";
import About from "./About.jsx";
import Contact from "./Contact.jsx";
import Collections from "./Collections.jsx";
import CategoryPage from "./CategoryPage.jsx";
import Admin from "./Admin.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import Wishlist from "./Wishlist.jsx";
import GiftCard from "./GiftCard.jsx";
// import VashudhraCredit from "./VashudhraCredit.jsx"; // REMOVED: VashudhraCredit component

// Protected Components
import Dashboard from "./Dashboard.jsx";
import ProfileForm from "./ProfileForm.jsx";
import Payment from "./Payment.jsx";
import Orders from "./Orders.jsx";
import Profile from "./Profile.jsx";
import Coupons from "./Coupons.jsx";
import SavedCards from "./SavedCards.jsx";
import SavedUPI from "./SavedUPI.jsx"; // Keeping this import as "Saved VPA" might refer to this
import Wallets from "./Wallets.jsx";
import Addresses from "./Addresses.jsx";
import Overview from "./Overview.jsx";
import CustomerOrderView from "./CustomerOrderView.jsx";

// Your PrivateRoute
import PrivateRoute from "./PrivateRoute.jsx";

const App = () => (
  <Router>
    <AuthProvider>
      <Header />
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/collections" element={<Collections />} />

        <Route path="/mens-wear" element={<CategoryPage category="mens-wear" />} />
        <Route path="/womens-wear" element={<CategoryPage category="womens-wear" />} />
        <Route path="/accessories" element={<CategoryPage category="accessories" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/admin" element={<Admin />} />

        {/* --- Protected Routes --- */}
        <Route element={<PrivateRoute />}>
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/gift-cards" element={<GiftCard />} />
          {/* REMOVED: <Route path="/vashudhra-credit" element={<VashudhraCredit />} /> */}

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfileForm />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile-details" element={<Profile />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/saved-cards" element={<SavedCards />} />
          <Route path="/saved-upi" element={<SavedUPI />} /> {/* Keeping this route for now, assuming you just want to remove the button */}
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/customerorderview" element={<CustomerOrderView />} />
        </Route>

        {/* Catch-all 404 Route */}
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