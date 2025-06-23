// Enhanced MoreLikeThis.jsx with all improvements
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { AiFillStar, AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { toast } from "react-hot-toast";

function createSlug(title) {
  return title
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function MoreLikeThis({ currentAnimeId }) {
  const { user } = useAuth();
  const [userWishlist, setUserWishlist] = React.useState([]);
  const [hoveredAnime, setHoveredAnime] = React.useState(null);
  const [allAnime, setAllAnime] = useState([]);

  const navigate = useNavigate();

  // Fetch all anime from Firestore
  useEffect(() => {
    const fetchAnime = async () => {
      const querySnap = await getDocs(collection(db, "animeshows"));
      setAllAnime(querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchAnime();
  }, []);

  const currentAnime = allAnime.find(
    (anime) => String(anime.id) === String(currentAnimeId)
  );

  const similarAnime = useMemo(() => {
    if (!currentAnime) return [];
    return allAnime
      .filter((anime) => anime.id !== currentAnimeId)
      .map((anime) => {
        const genreMatch =
          currentAnime?.genres?.filter((genre) => anime.genres?.includes(genre))
            .length || 0;

        const ratingDiff =
          1 /
          (1 +
            Math.abs(
              (currentAnime?.imdbRating || 0) - (anime.imdbRating || 0)
            ));

        return {
          ...anime,
          similarityScore: genreMatch * 0.7 + ratingDiff * 0.3,
        };
      })
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 5);
  }, [allAnime, currentAnimeId, currentAnime]);

  const isInWishlist = (animeId) => userWishlist.includes(animeId);

  const handleWishlistToggle = async (animeId) => {
    if (!user) {
      toast("Please log in to modify your wishlist.");
      navigate("/login");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      if (isInWishlist(animeId)) {
        await updateDoc(userRef, {
          wishlist: arrayRemove(animeId),
        });
        setUserWishlist((prev) => prev.filter((id) => id !== animeId));
      } else {
        await updateDoc(userRef, {
          wishlist: arrayUnion(animeId),
        });
        setUserWishlist((prev) => [...prev, animeId]);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchWishlist = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserWishlist(userSnap.data().wishlist || []);
      }
    };

    fetchWishlist();
  }, [user]);

  if (!currentAnime) return null;

  return (
    <div className="mt-16 px-4 lg:ml-60">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">More Like This</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {similarAnime.map((anime) => (
            <motion.div
              key={anime.id}
              whileHover={{ y: -5 }}
              className="relative group"
              onMouseEnter={() => setHoveredAnime(anime.id)}
              onMouseLeave={() => setHoveredAnime(null)}
            >
              <Link to={`/anime/${createSlug(anime.title)}`} className="block">
                <div className="relative aspect-[2/3] w-full">
                  <img
                    loading="lazy"
                    className="w-full h-full object-cover rounded-sm"
                    src={anime.imageUrl}
                    alt={anime.title}
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/300x450?text=No+Image")
                    }
                  />

                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 flex items-center rounded">
                    <AiFillStar
                      className="text-yellow-400 mr-1"
                      title="Rating"
                    />
                    {anime.imdbRating || "N/A"}
                  </div>

                  {hoveredAnime === anime.id && (
                    <div className="absolute bottom-0 left-1/2 w-full sm:w-[260px] h-full transform -translate-x-1/2 bg-black/55 backdrop-blur-lg text-white p-4 rounded-lg shadow-xl z-20 hidden sm:block transition-all duration-300 ease-out opacity-0 group-hover:opacity-100">
                      <h3 className="text-lg mb-2">{anime.title}</h3>
                      <p className="text-sm mb-2 line-clamp-3">
                        {anime.description || "No description available"}
                      </p>
                      <div className="flex justify-between text-sm">
                        <div className="flex flex-col">
                          <span>Season: {anime.season || "1"}</span>
                          <span>
                            Episodes: {anime.totalEpisodes || "Unknown"}
                          </span>
                          <span>
                            Duration: {(anime.animeduration || "24") + "m"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span>Year: {anime.animeyear || "202X"}</span>
                          <span>Rating: {anime.imdbRating || "0"}/10</span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {anime.genres?.map((genre, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-700 rounded-full text-xs transition-colors duration-200 hover:bg-gray-600"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Link>

              <div className="mt-2">
                <h2 className="text-white text-sm font-medium truncate">
                  {anime.title}
                </h2>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleWishlistToggle(anime.id)}
                  title={
                    isInWishlist(anime.id)
                      ? "Remove from Wishlist"
                      : "Add to Wishlist"
                  }
                  className={`w-full mt-1 text-xs px-2 py-1 rounded-sm flex items-center justify-center gap-1 transition-all duration-300 ease-in-out ${
                    isInWishlist(anime.id)
                      ? "bg-red-600 text-white"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  {isInWishlist(anime.id) ? (
                    <>
                      <AiFillHeart /> Remove
                    </>
                  ) : (
                    <>
                      <AiOutlineHeart /> Add
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
