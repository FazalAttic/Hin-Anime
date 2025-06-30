import React, { useState, useEffect, useCallback } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaEnvelope, FaCheck, FaTimes } from "react-icons/fa";

// List of reserved usernames
const RESERVED_USERNAMES = [
  // Administrative terms
  "admin",
  "administrator",
  "owner",
  "mod",
  "moderator",
  "system",
  "support",
  "root",
  "staff",
  "official",
  "help",
  "contact",
  "server",
  "null",
  "undefined",

  // Sexual/explicit content
  "sex",
  "sexy",
  "sexytime",
  "sexybabe",
  "sexygirl",
  "sexyboy",
  "sexybitch",
  "xxx",
  "porn",
  "porno",
  "nude",
  "nudes",
  "onlyfans",
  "fansly",
  "nsfw",
  "hentai",
  "cum",
  "cums",
  "cumshot",
  "dick",
  "cock",
  "penis",
  "pussy",
  "vagina",
  "boobs",
  "tits",
  "ass",
  "anal",
  "blowjob",
  "handjob",
  "bj",
  "hj",
  "masterbate",

  // Offensive language
  "fuck",
  "fuckyou",
  "fuckyourself",
  "fucking",
  "fucker",
  "fucked",
  "fucks",
  "shit",
  "shitter",
  "bullshit",
  "bitch",
  "bitches",
  "whore",
  "slut",
  "cunt",
  "asshole",
  "dickhead",
  "motherfucker",
  "mf",
  "mfer",
  "damn",
  "godamn",
  "hell",

  // Racial slurs and offensive terms
  "nigger",
  "nigga",
  "n1gg3r",
  "n1gger",
  "nigg3r",
  "n1gga",
  "niggah",
  "kike",
  "spic",
  "wetback",
  "chink",
  "gook",
  "raghead",
  "towelhead",
  "sandnigger",
  "beaner",
  "coon",
  "darkie",
  "halfbreed",
  "redskin",
  "slanteye",
  "whitey",

  // LGBTQ+ slurs
  "fag",
  "faggot",
  "fagot",
  "dyke",
  "queer",
  "homo",
  "tranny",
  "shemale",
  "lesbo",
  "poof",
  "twink",
  "bear",
  "butch",
  "femme",

  // Violence/harm
  "kill",
  "killer",
  "killing",
  "murder",
  "rape",
  "rapist",
  "suicide",
  "hang",
  "shoot",
  "shooter",
  "stab",
  "cut",
  "cutter",
  "terrorist",
  "isis",
  "alqaeda",
  "nazi",
  "kkk",
  "hitler",
  "schoolshooter",
  "bomb",
  "terror",
  "jihad",

  // Drugs/alcohol
  "weed",
  "cocaine",
  "coke",
  "heroin",
  "meth",
  "methhead",
  "crack",
  "ecstasy",
  "mdma",
  "lsd",
  "acid",
  "shrooms",
  "mushrooms",
  "ketamine",
  "opium",
  "xanax",
  "valium",
  "oxy",
  "perc",
  "fentanyl",
  "alcohol",
  "beer",
  "whiskey",
  "vodka",
  "rum",
  "tequila",
  "gin",
  "brandy",
  "moonshine",
  "dope",
  "joint",
  "blunt",

  // Bypass attempts (common variations)
  "f_u_c_k",
  "f.uck",
  "f-uck",
  "f*ck",
  "fck",
  "fuk",
  "phuck",
  "phuk",
  "fvck",
  "sh1t",
  "sh!t",
  "sht",
  "$hit",
  "b!tch",
  "b1tch",
  "biatch",
  "beotch",
  "b1tch",
  "n1gg",
  "n!gg",
  "n*gg",
  "nigg",
  "n1g",
  "n!g",
  "n*g",
  "n1g3r",
  "n!g3r",
  "n*g3r",

  // Self-harm/suicide
  "cutting",
  "selfharm",
  "selfharmm",
  "suicidal",
  "killmyself",
  "enditall",
  "depressed",
  "depression",
  "anxiety",
  "mentalillness",
  "mentalhealth",

  // Illegal activities
  "hacker",
  "hacking",
  "cracker",
  "cracking",
  "pirate",
  "piracy",
  "warez",
  "cracks",
  "keygen",
  "serial",
  "torrent",
  "illegal",
  "stolen",
  "fraud",
  "scammer",
  "scamming",
  "phishing",
  "spammer",
  "spamming",
  "cheat",
  "cheater",
  "hacks",
  "aimbot",
  "wallhack",
  "exploit",
  "ddos",
  "botnet",
  "virus",
  "malware",

  // Other offensive terms
  "retard",
  "retarded",
  "spastic",
  "mong",
  "downsyndrome",
  "autistic",
  "aspergers",
  "cripple",
  "gimp",
  "midget",
  "dwarf",
  "fatso",
  "lardass",
  "ugly",
  "stupid",
  "idiot",
  "moron",
  "imbecile",
  "dumbass",
  "dummy",
  "freak",
  "weirdo",
  "loser",

  // Common bypass patterns
  "1337",
  "420",
  "666",
  "69",
  "xxx",
  "xyz",
  "abc",
  "qwerty",
  "asdf",
  "password",
  "admin123",
  "root123",
  "test",
  "demo",
  "guest",
  "user",
  "anonymous",

  // Empty/space variants
  " ",
  "  ",
  "   ",
  "-",
  "--",
  "---",
  "...",
  "..",
  ".",
  "_",
  "__",
  "___",
];

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({
    available: null,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Validate username format
  const validateUsername = useCallback((username) => {
    if (!username) return { valid: false, message: "" };

    const isTooShort = username.length < 3;
    const isTooLong = username.length > 20;
    const hasInvalidChars = !/^[a-zA-Z0-9_]+$/.test(username);
    const isReserved = RESERVED_USERNAMES.includes(username.toLowerCase());

    return {
      valid: !isTooShort && !isTooLong && !hasInvalidChars && !isReserved,
      message: isTooShort
        ? "Must be at least 3 characters"
        : isTooLong
        ? "Must be 20 characters or less"
        : hasInvalidChars
        ? "Only letters, numbers and _"
        : isReserved
        ? "This username is reserved"
        : "",
    };
  }, []);

  // Check username availability (debounced)
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!username || username.length < 3) {
        setUsernameStatus({
          available: null,
          message: "",
        });
        return;
      }

      const validation = validateUsername(username);
      if (!validation.valid) {
        setUsernameStatus({
          available: false,
          message: validation.message,
        });
        return;
      }

      setIsCheckingUsername(true);
      try {
        const usernameDoc = await getDoc(
          doc(db, "usernames", username.toLowerCase())
        );

        setUsernameStatus({
          available: !usernameDoc.exists(),
          message: usernameDoc.exists() ? "Username taken" : "Available",
        });
      } catch (err) {
        console.error("Username check error:", err);
        setUsernameStatus({
          available: false,
          message: "Error checking username",
        });
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timer = setTimeout(checkUsernameAvailability, 500);
    return () => clearTimeout(timer);
  }, [username, validateUsername]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Final validation
    const validation = validateUsername(username);
    if (!validation.valid) {
      setError(validation.message);
      setIsSubmitting(false);
      return;
    }

    if (usernameStatus.available === false) {
      setError(usernameStatus.message);
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Create auth account
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2. Reserve username (atomic operation)
      await setDoc(doc(db, "usernames", username.toLowerCase()), {
        userId: userCred.user.uid,
        createdAt: new Date(),
      });

      // 3. Create user document
      await setDoc(doc(db, "users", userCred.user.uid), {
        email: email,
        wishlist: [],
        profile: {
          username: username,
          photoURL: "",
          bio: "",
          createdAt: new Date(),
        },
      });

      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
      if (err.code === "permission-denied") {
        setError("Username was taken just now. Please try another.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be 6+ characters");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format");
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-900 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: -20, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-purple-900 to-blue-800 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-purple-200 mt-1">Join our anime community</p>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-900/50 text-red-200 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-1">
              <label className="text-gray-300 flex items-center gap-2">
                <FaEnvelope className="text-blue-400" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 flex items-center gap-2">
                <FaLock className="text-blue-400" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 flex items-center gap-2">
                <FaUser className="text-blue-400" />
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim())}
                  placeholder="3-20 characters (a-z, 0-9, _)"
                  required
                  minLength={3}
                  maxLength={20}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition pr-10"
                />
                {isCheckingUsername && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute right-3 top-3.5"
                  >
                    <div className="h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </motion.div>
                )}
                {usernameStatus.available === true && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute right-3 top-3.5 text-green-400"
                  >
                    <FaCheck />
                  </motion.div>
                )}
                {usernameStatus.available === false && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute right-3 top-3.5 text-red-400"
                  >
                    <FaTimes />
                  </motion.div>
                )}
              </div>

              {username && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="text-xs mt-1"
                >
                  <div
                    className={`px-2 py-1 rounded ${
                      usernameStatus.available === true
                        ? "bg-green-900/30 text-green-300"
                        : usernameStatus.available === false
                        ? "bg-red-900/30 text-red-300"
                        : "bg-gray-700/50 text-gray-400"
                    }`}
                  >
                    {usernameStatus.message || "Enter a username"}
                  </div>
                </motion.div>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={
                isSubmitting ||
                isCheckingUsername ||
                usernameStatus.available !== true
              }
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
              className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                isSubmitting
                  ? "bg-purple-800 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </span>
              ) : (
                "Sign Up"
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 hover:underline transition"
            >
              Login here
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Signup;
