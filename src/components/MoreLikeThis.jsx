import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { animeData } from "../data";
import { AiFillStar, AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { createSlug } from "../context/utils";

export default function MoreLikeThis({ currentAnimeId }) {
  const { user } = useAuth();
  const [userWishlist, setUserWishlist] = React.useState([]);
  const [hoveredAnime, setHoveredAnime] = React.useState(null);

  // Get current anime details
  const currentAnime = animeData.find((anime) => anime.id === currentAnimeId);

  // Calculate similar anime based on genres and rating
  const similarAnime = React.useMemo(() => {
    return animeData
      .filter((anime) => anime.id !== currentAnimeId)
      .map((anime) => {
        // Calculate genre similarity
        const genreMatch =
          currentAnime?.genres?.filter((genre) => anime.genres?.includes(genre))
            .length || 0;

        // Calculate rating similarity
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
  }, [currentAnimeId, currentAnime]);

  // Check if anime is in wishlist
  const isInWishlist = (animeId) => userWishlist.includes(animeId);

  // Toggle wishlist status
  const handleWishlistToggle = async (animeId) => {
    if (!user) return;

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

  // Load user wishlist
  React.useEffect(() => {
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

  return (
    <div className="mt-16 px-4 lg:ml-60">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">More Like This</h2>
        </div>

        {/* Responsive grid */}
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
                    className="w-full h-full object-cover rounded-sm"
                    src={anime.imageUrl}
                    alt={anime.title}
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/300x450?text=No+Image")
                    }
                  />

                  {/* Rating badge */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 flex items-center rounded">
                    <AiFillStar className="text-yellow-400 mr-1" />
                    {anime.imdbRating || "N/A"}
                  </div>

                  {/* Overlay that appears on hover */}
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

              {/* Title and wishlist button */}
              <div className="mt-2">
                <h2 className="text-white text-sm font-medium truncate">
                  {anime.title}
                </h2>
                <button
                  onClick={() => handleWishlistToggle(anime.id)}
                  className={`w-full mt-1 text-xs px-2 py-1 rounded-sm flex items-center justify-center gap-1 ${
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
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
