// src/components/TopRatedAnime.jsx
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createSlug } from "../context/utils";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const TopRatedAnime = () => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [allAnime, setAllAnime] = useState([]);

  // Fetch all anime from Firestore
  useEffect(() => {
    const fetchAnime = async () => {
      const querySnap = await getDocs(collection(db, "animeshows"));
      setAllAnime(querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchAnime();
  }, []);

  // Filter and sort anime by IMDb rating (descending) and take top 10
  const topRatedAnime = [...allAnime]
    .sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0))
    .slice(0, 10);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === "left" ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Adjust multiplier for faster/slower scrolling
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="mt-8 mb-12 ml-52 max-sm:ml-4">
      <h2 className="text-2xl font-bold text-white mb-6">Top 10 Rated Anime</h2>
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full hidden md:block"
          aria-label="Scroll left"
        >
          <FaChevronLeft size={20} />
        </button>

        <div
          ref={scrollRef}
          className="overflow-x-auto whitespace-nowrap py-2 no-scrollbar"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="inline-flex space-x-6 px-2">
            {topRatedAnime.map((anime, index) => (
              <motion.div
                key={anime.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block w-48 max-sm:w-40"
              >
                <Link to={`/anime/${createSlug(anime.title)}`}>
                  <div className="relative group">
                    <div className="absolute top-0 left-0 bg-gray-800 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm z-10">
                      {index + 1}
                    </div>
                    <img
                      src={anime.imageUrl}
                      alt={anime.title}
                      className="w-full h-64 max-sm:h-52 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 rounded-b-lg backdrop-blur-sm">
                      <h3 className="text-white font-semibold text-sm line-clamp-1">
                        {anime.title}
                      </h3>
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-400 text-xs font-bold">
                          {anime.imdbRating}
                        </span>
                        <span className="text-gray-300 text-xs ml-1">/10</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full hidden md:block"
          aria-label="Scroll right"
        >
          <FaChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default TopRatedAnime;
