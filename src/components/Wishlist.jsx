import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  collection,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import AnimeCard from "../components/AnimeCard";
import { FaHeartBroken, FaRegSadTear } from "react-icons/fa";
import SkeletonLoader from "../components/SkeletonLoader";

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allAnime, setAllAnime] = useState([]);

  // Fetch all anime from Firestore
  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const querySnap = await getDocs(collection(db, "animeshows"));
        setAllAnime(
          querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        console.error("Failed to fetch anime data:", err);
        setError("Failed to load anime data. Please try again later.");
      }
    };
    fetchAnime();
  }, []);

  // Fetch user's wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if (!user) return;

        setLoading(true);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setWishlist(userSnap.data().wishlist || []);
        }
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
        setError("Failed to load your wishlist. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const handleRemoveFromWishlist = async (id) => {
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        wishlist: arrayRemove(id),
      });
      setWishlist((prev) => prev.filter((animeId) => animeId !== id));
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      setError("Failed to remove item. Please try again.");
    }
  };

  const filteredAnime = allAnime.filter((anime) => wishlist.includes(anime.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 px-4 py-8 ml-44 max-sm:ml-0">
        <h1 className="text-white text-3xl font-semibold text-center mb-6 mt-9">
          Your Wishlist
        </h1>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 px-2">
          {[...Array(5)].map((_, i) => (
            <SkeletonLoader key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 px-4 py-8 ml-44 max-sm:ml-0 flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <FaRegSadTear className="text-red-500 text-5xl mx-auto mb-4" />
          <h1 className="text-white text-3xl font-semibold mb-4">Oops!</h1>
          <p className="text-red-400 text-lg mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8 ml-44 max-sm:ml-0">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-white text-3xl font-semibold text-center mb-6 mt-14">
          Your Wishlist
        </h1>
        <p className="text-gray-400 text-center mb-8">
          {filteredAnime.length} {filteredAnime.length === 1 ? "item" : "items"}{" "}
          in your list
        </p>

        {filteredAnime.length === 0 ? (
          <div className="text-center py-12">
            <FaHeartBroken className="text-pink-500 text-6xl mx-auto mb-4" />
            <p className="text-gray-300 text-xl mb-2">Your wishlist is empty</p>
            <p className="text-gray-400">
              Start adding anime to your wishlist to see them here!
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="grid max-sm:gap-3 gap-12 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ">
              {filteredAnime.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  onRemove={handleRemoveFromWishlist}
                  isInWishlist={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
