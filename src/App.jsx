import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Home from "./Home";
import Cart from "./Cart";
import About from "./About";
import Contact from "./Contact";
import Collections from "./Collections";
import Admin from "./Admin";
import CategoryPage from "./CategoryPage";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import ProfileForm from "./ProfileForm";
import Payment from "./Payment"; // ✅ Payment component

const App = () => (
  <Router>
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/mens-wear" element={<CategoryPage category="mens-wear" />} />
      <Route path="/womens-wear" element={<CategoryPage category="womens-wear" />} />
      <Route path="/accessories" element={<CategoryPage category="accessories" />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/profile" element={<ProfileForm />} />
      <Route path="/payment" element={<Payment />} /> {/* ✅ Payment page */}
    </Routes>
  </Router>
);

export default App;
