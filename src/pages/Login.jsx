import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaEnvelope } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const user = await login(email, password);

      // Handle successful login
      const animeToAdd = location.state?.animeToAdd;
      if (animeToAdd) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          wishlist: arrayUnion(animeToAdd),
        });
      }

      navigate(location.state?.redirectAfterLogin || "/");
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === "auth/wrong-password") {
        setError("Wrong password");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden relative">
      {/* Floating anime particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 20 + 10}px`,
            height: `${Math.random() * 20 + 10}px`,
            background: `rgba(${Math.random() * 100 + 155}, ${
              Math.random() * 100 + 155
            }, 255, 0.2)`,
            borderRadius: "50%",
            filter: "blur(2px)",
          }}
          initial={{ scale: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: [0, (Math.random() - 0.5) * 200],
            y: [0, (Math.random() - 0.5) * 200],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md px-4 sm:px-6 py-8 z-10"
      >
        {/* Anime character silhouette */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 0.1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute -bottom-20 -right-20 w-64 h-64 pointer-events-none"
          style={{
            backgroundImage: "url('https://i.imgur.com/JYw0DvP.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom right",
            filter: "brightness(0.5)",
          }}
        />

        {/* Glassmorphism form container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl overflow-hidden border border-white/10"
          style={{
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
          }}
        >
          <div className="px-8 py-12">
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-bold text-center text-white mb-8 tracking-wider"
              style={{
                textShadow: "0 2px 10px rgba(165, 180, 252, 0.5)",
                fontFamily: "'Arial Rounded MT Bold', sans-serif",
              }}
            >
              Welcome Back!
            </motion.h2>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-6 p-3 bg-red-500/20 text-red-100 rounded-lg text-sm border border-red-500/30"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-white/50" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 focus:border-pink-400 focus:ring-2 focus:ring-pink-300/30 text-white placeholder-white/40 outline-none transition duration-300 hover:border-white/20"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-white/50" />
                  </div>
                  <input
                    value={password}
                    type={showPassword ? "password" : "password"}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full pl-10 pr-10 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 focus:border-pink-400 focus:ring-2 focus:ring-pink-300/30 text-white placeholder-white/40 outline-none transition duration-300 hover:border-white/20"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 px-6 rounded-xl text-white font-bold transition-all duration-300 ${
                    isLoading
                      ? "bg-indigo-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 shadow-lg"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    <span className="block transform transition duration-300 hover:scale-105">
                      Login
                    </span>
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.div
              variants={itemVariants}
              className="mt-8 text-center text-sm"
            >
              <Link
                to="/forgot-password"
                className="text-red-400 hover:underline font-semibold"
              >
                Forgot Password?
              </Link>
              <span className="mx-2 text-white/30">•</span>
              <Link
                to="/signup"
                className="text-indigo-400 hover:text-indigo-300 transition duration-300"
              >
                Create new account
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Decorative floating elements */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute top-1/4 -right-20 w-32 h-32 bg-pink-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20"
        />
      </motion.div>
    </div>
  );
};

export default Login;
