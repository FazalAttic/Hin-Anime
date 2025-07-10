import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import AnimeCard from "../components/AnimeCard.jsx";
import { motion, AnimatePresence } from "framer-motion";

import AnimeSlider from "../components/AnimeSlider.jsx";
import TopRatedAnime from "../components/TopRatedAnime.jsx";
import ContinueWatching from "../components/ContinueWatching.jsx";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [allAnime, setAllAnime] = useState([]);
  const animeRefs = useRef([]);

  // Fetch all anime from Firestore
  useEffect(() => {
    const fetchAnime = async () => {
      const querySnap = await getDocs(collection(db, "animeshows"));
      setAllAnime(querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchAnime();
  }, []);

  // Filter out wishlist-exclusive anime from home page
  const animeItems = allAnime.filter((anime) => !anime.isWishlistExclusive);

  // Initialize refs
  useEffect(() => {
    animeRefs.current = animeRefs.current.slice(0, animeItems.length);
  }, [animeItems]);

  // Intersection Observer setup with smooth transitions
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = entry.target.dataset.index;
          if (entry.isIntersecting) {
            setVisibleItems((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentRefs = animeRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [animeItems]);

  // Fetch wishlist with loading states
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setWishlist(userSnap.data().wishlist || []);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  // Fetch continue watching list
  useEffect(() => {
    const fetchContinueWatching = async () => {
      let local = [];
      try {
        local = JSON.parse(localStorage.getItem("continueWatching")) || [];
      } catch (e) {
        local = [];
      }

      if (!user) {
        setContinueWatching(local);
        return;
      }

      // If user is logged in, fetch from Firestore and merge
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const remote = userSnap.data()?.continueWatching || [];

      // Merge: keep the latest progress for each anime
      const mergedMap = new Map();
      [...local, ...remote].forEach((item) => {
        const key = String(item.animeId);
        if (
          !mergedMap.has(key) ||
          (item.updatedAt || 0) > (mergedMap.get(key)?.updatedAt || 0)
        ) {
          mergedMap.set(key, item);
        }
      });
      const merged = Array.from(mergedMap.values());

      // If there was local progress, update Firestore and clear localStorage
      if (local.length > 0) {
        await updateDoc(userRef, { continueWatching: merged });
        localStorage.removeItem("continueWatching");
      }

      setContinueWatching(merged);
    };

    fetchContinueWatching();
  }, [user]);

  const handleWishlistAction = async (id, isAdding) => {
    if (!user) {
      navigate("/login", {
        state: {
          redirectAfterLogin: "/",
          [isAdding ? "animeToAdd" : "animeToRemove"]: id,
        },
      });
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        wishlist: isAdding ? arrayUnion(id) : arrayRemove(id),
      });
      setWishlist((prev) =>
        isAdding ? [...prev, id] : prev.filter((animeId) => animeId !== id)
      );
    } catch (error) {
      console.error("Wishlist error:", error);
      alert("Failed to update wishlist. Please try again.");
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
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <AnimeSlider />
      <TopRatedAnime />
      <ContinueWatching
        continueWatching={continueWatching}
        setContinueWatching={setContinueWatching}
        user={user}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="main ml-40 flex justify-center max-sm:ml-0"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="main-glass bg-gray-900 border-whitegood backdrop-blur shadow-lg h-auto w-113 px-4  rounded-xl"
        >
          <h1 className="text-3xl font-bold text-white text-center mb-8 -mt-4 max-sm:-mt-8">
            Discover New Anime
          </h1>
          <div className="center-img">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap justify-center gap-4 md:gap-6"
            >
              <AnimatePresence>
                {animeItems.map((anime, index) => (
                  <motion.div
                    key={anime.id}
                    ref={(el) => (animeRefs.current[index] = el)}
                    data-index={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    initial="hidden"
                    animate={
                      visibleItems.includes(index.toString())
                        ? "visible"
                        : "hidden"
                    }
                    exit="hidden"
                  >
                    <AnimeCard
                      anime={anime}
                      isInWishlist={wishlist.includes(anime.id)}
                      // ...other props
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Home;
