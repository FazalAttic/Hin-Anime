import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaDiscord,
  FaHome,
  FaInfoCircle,
  FaBars,
  FaUser,
  FaHeart,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaSearch, // <-- Add this
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import AnimeSearchBar from "./AnimeSearchBar.jsx";
import { db } from "../firebase.jsx";
import { doc, onSnapshot } from "firebase/firestore";

const Navbars = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false); // <-- Add this
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});

  useEffect(() => {
    if (!user?.uid) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data().profile || {});
      }
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (isOpen) setShowMobileSearch(false);
  }, [isOpen]);

  const displayName = profile.username || user?.email?.split("@")[0] || "User";
  const profileImage =
    profile.photoURL ||
    "https://cdn.vectorstock.com/i/2000v/97/68/account-avatar-dark-mode-glyph-ui-icon-vector-44429768.avif";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      setIsOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Top search bar (desktop only) */}
      <div className="fixed top-0 left-0 right-0 backdrop-blur-lg bg-gray-900 bg-opacity-80 border-b border-gray-700 shadow-xl z-30 mb-60 hidden md:block">
        <div className="container mx-auto px-4 py-2">
          <AnimeSearchBar />
        </div>
      </div>

      {/* Mobile top bar with blur and icons */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden backdrop-blur-lg bg-gray-900 bg-opacity-80 border-b border-gray-700 shadow-xl flex items-center justify-between px-4 h-14">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleNavbar}
          className="text-white bg-gray-900 bg-opacity-70 p-2 rounded-full hover:bg-opacity-90 transition-all"
          aria-label="Toggle menu"
        >
          <FaBars size={24} />
        </button>

        {/* Centered Title */}
        <Link to="/">
          <h1 className="text-white text-xl font-bold select-none">
            Hin-Anime
          </h1>
        </Link>

        {/* Mobile search icon */}
        <button
          onClick={() => setShowMobileSearch(true)}
          className="text-white bg-gray-900 bg-opacity-70 p-2 rounded-full hover:bg-opacity-90 transition-all"
          aria-label="Open search"
        >
          <FaSearch size={22} />
        </button>
      </div>

      {/* Mobile search overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-80 md:hidden">
          <div className="w-full max-w-md mt-16 px-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-lg font-semibold">
                Search Anime
              </span>
              <button
                onClick={() => setShowMobileSearch(false)}
                className="text-white text-2xl px-2"
                aria-label="Close search"
              >
                &times;
              </button>
            </div>
            <AnimeSearchBar onResultClick={() => setShowMobileSearch(false)} />
          </div>
        </div>
      )}

      {/* Sidebar */}
      <header
        className={`fixed z-40 h-full transform transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0 w-48" : "-translate-x-full w-0"
        } md:translate-x-0 md:w-48`}
      >
        <div className="mt-4 ml-4 md:ml-6">
          <Link to="/" onClick={() => setIsOpen(false)}>
            <img
              src="https://i.postimg.cc/XvdWdLrm/hinanime-logo-removebg-preview.png"
              className="h-16 w-auto relative z-20 hover:opacity-90 transition-opacity"
              alt="Logo"
            />
          </Link>
        </div>

        <nav className="backdrop-blur-lg bg-gray-900 bg-opacity-80 border-r border-gray-700 shadow-xl h-full w-full md:w-48 fixed top-0 left-0 flex flex-col items-start pt-24 pb-8 text-white overflow-y-auto">
          <ul className="space-y-2 w-full">
            <li>
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-800 hover:text-blue-400 transition-colors duration-200"
              >
                <FaHome className="text-xl" />
                <span className="font-medium">HOME</span>
              </Link>
            </li>

            {user && (
              <li>
                <Link
                  to="/wishlist"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-800 hover:text-blue-400 transition-colors duration-200"
                >
                  <FaHeart className="text-xl" />
                  <span className="font-medium">WISHLIST</span>
                </Link>
              </li>
            )}

            <li>
              <a
                href="https://discord.gg/2JBnqk2kne"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-800 hover:text-blue-400 transition-colors duration-200"
              >
                <FaDiscord className="text-xl" />
                <span className="font-medium">DISCORD</span>
              </a>
            </li>

            <li>
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-800 hover:text-blue-400 transition-colors duration-200"
              >
                <FaInfoCircle className="text-xl" />
                <span className="font-medium">ABOUT</span>
              </Link>
            </li>

            {/* Authenticated User */}
            {user ? (
              <>
                <li className="border-t border-gray-700 mt-4 pt-4">
                  <div className="flex items-center space-x-3 py-2 px-4">
                    <img
                      src={profileImage}
                      alt="User"
                      className="h-8 w-8 rounded-full object-cover border border-white"
                    />
                    <span className="font-medium text-blue-400">
                      Hi, {displayName}
                    </span>
                  </div>
                </li>
                <li>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-800 hover:text-blue-400 transition-colors duration-200"
                  >
                    <FaUser className="text-xl" />
                    <span className="font-medium">PROFILE</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full py-3 px-4 rounded-lg bg-gray-700 hover:bg-gray-800 hover:text-red-400 transition-colors duration-200"
                  >
                    <FaSignOutAlt className="text-xl" />
                    <span className="font-medium">LOGOUT</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="border-t border-gray-700 mt-4 pt-4">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-800 hover:text-blue-400 transition-colors duration-200"
                  >
                    <FaSignInAlt className="text-xl" />
                    <span className="font-medium">LOGIN</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                  >
                    <FaUserPlus className="text-xl" />
                    <span className="font-medium">SIGN UP</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navbars;
