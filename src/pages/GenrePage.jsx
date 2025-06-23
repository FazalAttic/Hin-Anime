// pages/GenrePage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import AnimeCard from "../components/AnimeCard.jsx";
import { motion } from "framer-motion";

const GenrePage = () => {
  const { genre } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allAnime, setAllAnime] = useState([]);

  // Fetch all anime from Firestore
  useEffect(() => {
    const fetchAnime = async () => {
      const querySnap = await getDocs(collection(db, "animeshows"));
      setAllAnime(querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchAnime();
  }, []);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist([]);
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
      }
    };
    fetchWishlist();
  }, [user]);

  // Filter anime by genre (case insensitive)
  const filteredAnime = allAnime.filter(
    (anime) =>
      anime.genres?.some((g) => g.toLowerCase() === genre.toLowerCase()) &&
      !anime.isWishlistExclusive
  );

  const handleWishlistAction = async (id, isAdding) => {
    if (!user) {
      navigate("/login", {
        state: {
          redirectAfterLogin: `/genre/${genre}`,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="main ml-40 flex justify-center max-sm:ml-0 "
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="main-glass bg-gray-900 border-whitegood backdrop-blur shadow-lg h-auto w-113 px-4 rounded-xl mt-28"
        >
          <h1 className="text-3xl font-bold text-white text-center mb-8 -mt-4 max-sm:-mt-8">
            {genre.charAt(0).toUpperCase() + genre.slice(1)} Anime
          </h1>
          {filteredAnime.length === 0 ? (
            <div className="text-center text-white py-10">
              <p className="text-xl">No anime found in this genre.</p>
              <Link
                to="/"
                className="text-blue-400 hover:underline mt-4 inline-block"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {filteredAnime.map((anime) => (
                <motion.div
                  key={anime.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <AnimeCard
                    anime={anime}
                    onAdd={() => handleWishlistAction(anime.id, true)}
                    onRemove={() => handleWishlistAction(anime.id, false)}
                    isInWishlist={wishlist.includes(anime.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

export default GenrePage;
