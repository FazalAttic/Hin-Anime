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
import ScrollToTop from "./components/ScrollToTop";

import "./index.css";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />

      <Routes>
        <Route path="/anime/:titleSlug" element={<AnimePage />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Add other routes here */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Private Route for Wishlist */}
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
      </Routes>
    </>
  );
}
