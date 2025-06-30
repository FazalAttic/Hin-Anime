import React, { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";

function formatTimeAgo(timestamp) {
  if (!timestamp) return "";
  const diff = Date.now() - timestamp;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  return `${day} day${day > 1 ? "s" : ""} ago`;
}

const ContinueWatching = ({ continueWatching, setContinueWatching, user }) => {
  const [removingId, setRemovingId] = useState(null);
  const [allAnime, setAllAnime] = useState([]);

  // Fetch all anime from Firestore
  useEffect(() => {
    const fetchAnime = async () => {
      const querySnap = await getDocs(collection(db, "animeshows"));
      setAllAnime(querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchAnime();
  }, []);

  const handleRemove = useCallback(
    async (animeId) => {
      setRemovingId(animeId);
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (!user) {
        try {
          const local = JSON.parse(
            localStorage.getItem("continueWatching") || "[]"
          );
          const updated = local.filter(
            (item) => String(item.animeId) !== String(animeId)
          );
          localStorage.setItem("continueWatching", JSON.stringify(updated));
          setContinueWatching(updated);
        } catch (e) {
          console.error("Failed to update localStorage:", e);
        }
      } else {
        try {
          const { doc, getDoc, updateDoc } = await import("firebase/firestore");
          const { db } = await import("../firebase");
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          const remote = userSnap.data()?.continueWatching || [];
          const updated = remote.filter(
            (item) => String(item.animeId) !== String(animeId)
          );
          await updateDoc(userRef, { continueWatching: updated });
          setContinueWatching(updated);
        } catch (e) {
          console.error("Failed to update Firestore:", e);
          setContinueWatching((prev) =>
            prev.filter((item) => String(item.animeId) !== String(animeId))
          );
        }
      }
      setRemovingId(null);
    },
    [user, setContinueWatching]
  );

  if (!continueWatching || continueWatching.length === 0) return null;

  const sorted = [...continueWatching].sort(
    (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
  );

  return (
    <section
      aria-labelledby="continue-watching-heading"
      className="mb-8 ml-52 max-sm:ml-0"
    >
      <div className="flex items-center gap-2 mb-4">
        <h2
          id="continue-watching-heading"
          className="text-2xl font-bold text-white"
        >
          Continue Watching
        </h2>
        {!user && (
          <>
            <button
              data-tooltip-id="local-storage-tooltip"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Information about local storage"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <Tooltip
              id="local-storage-tooltip"
              place="right"
              className="max-w-xs z-50"
            >
              <p className="text-sm">
                Your progress is only stored on this device. To sync across
                devices, please{" "}
                <Link to="/login" className="text-blue-400 hover:underline">
                  login
                </Link>
                .
                <br />
                <br />
                Clearing browser data will remove your continue watching list.
              </p>
            </Tooltip>
          </>
        )}
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <AnimatePresence initial={false}>
            {sorted.map((progress) => {
              const anime = allAnime.find(
                (a) => String(a.id) === String(progress.animeId)
              );
              if (!anime) return null;

              const totalEpisodes = Array.isArray(anime.episodes)
                ? anime.episodes.length
                : anime.episodes || 0;

              const progressPercentage =
                totalEpisodes > 0
                  ? Math.round(
                      ((progress.episodeIndex + 1) / totalEpisodes) * 100
                    )
                  : 0;

              return (
                <motion.article
                  key={`${anime.id}-${progress.updatedAt}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: removingId === anime.id ? 0 : 1,
                    scale: removingId === anime.id ? 0.9 : 1,
                    transition: { duration: 0.3 },
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="relative flex-none w-44 min-w-[11rem]"
                >
                  <Link
                    to={`/anime/${
                      anime.title ? createSlug(anime.title) : anime.id
                    }`}
                    className="group  bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-200 flex flex-col h-full"
                  >
                    <div className="relative">
                      <motion.img
                        src={anime.imageUrl}
                        alt={`Cover for ${anime.title}`}
                        className="w-full h-56 object-cover group-hover:opacity-90 transition-opacity"
                        loading="lazy"
                        width="176"
                        height="224"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div
                          className="h-full bg-blue-500 transition-all duration-500 ease-out"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="text-white text-sm font-semibold line-clamp-2 mb-2 leading-tight">
                        {anime.title}
                      </h3>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-blue-400 text-xs font-bold">
                            Ep {progress.episodeIndex + 1}
                            {totalEpisodes ? ` / ${totalEpisodes}` : ""}
                          </span>
                          <span className="text-gray-400 text-xs flex items-center gap-1">
                            <svg
                              width="14"
                              height="14"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke="currentColor"
                                strokeWidth="2"
                                d="M12 6v6l4 2"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                            {formatTimeAgo(progress.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <motion.button
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 transition h-6 w-6 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(anime.id);
                    }}
                    aria-label={`Remove ${anime.title} from continue watching`}
                  >
                    ✕
                  </motion.button>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default React.memo(ContinueWatching);

function createSlug(title) {
  return title
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
