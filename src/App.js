// App.js
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Wishlist from "./components/Wishlist.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import Profile from "./pages/Profile.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import AnimePage from "./components/AnimePage.jsx";
import GenrePage from "./pages/GenrePage.jsx"; // Add this import
import ScrollToTop from "./components/ScrollToTop";
import About from "./pages/About.jsx"; // Add if you have an About page
import NotFound from "./pages/NotFound.jsx"; // Recommended for 404 pages

import "./index.css";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/anime/:titleSlug" element={<AnimePage />} />
        <Route path="/genre/:genre" element={<GenrePage />} />{" "}
        {/* Add this route */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<About />} />{" "}
        {/* Add if you have About */}
        {/* Private Routes */}
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
