// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// All components are assumed to be directly in the src/ folder
import Header from "./Header";
import Home from "./Home";
import Cart from "./Cart";
import About from "./About";
import Contact from "./Contact";
import Collections from "./Collections";
import CategoryPage from "./CategoryPage"; // Still used for specific category display
import Admin from "./Admin";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";

// Protected Components
import ProfileForm from "./ProfileForm";
import Payment from "./Payment";
import Orders from "./Orders";
import Profile from "./Profile";
import Coupons from "./Coupons";
import SavedCards from "./SavedCards";
import SavedUPI from "./SavedUPI";
import Wallets from "./Wallets";
import Addresses from "./Addresses";
import Overview from "./Overview";
import VashudhraCredit from "./VashudhraCredit";
import CustomerOrderView from "./CustomerOrderView";

// Import the new PrivateRoute component
import PrivateRoute from "./PrivateRoute"; // Assuming PrivateRoute is directly in src/

const App = () => (
  <Router>
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      <Route path="/collections" element={<Collections />} />

      {/* Category-specific pages - also typically need login for purchase features */}
      <Route path="/mens-wear" element={<CategoryPage category="mens-wear" />} />
      <Route path="/womens-wear" element={<CategoryPage category="womens-wear" />} />
      <Route path="/accessories" element={<CategoryPage category="accessories" />} />

      <Route path="/admin" element={<Admin />} /> {/* Admin route might need its own specific admin protection */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* --- Protected Routes --- */}
      {/* All routes nested inside PrivateRoute will only be accessible if logged in */}
      <Route path="/" element={<PrivateRoute />}>
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

    </Routes>
  </Router>
);

export default App;