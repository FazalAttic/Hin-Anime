import React from "react";
import { Link } from "react-router-dom";
import { animeData } from "../data";

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

const ContinueWatching = ({ continueWatching }) => {
  if (!continueWatching || continueWatching.length === 0)
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          Continue Watching
        </h2>
        <div className="text-gray-400">
          No anime to continue. Start watching something!
        </div>
      </div>
    );

  // Sort by last updated
  const sorted = [...continueWatching].sort(
    (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
  );

  return (
    <div className="mb-8 ml-52 max-sm:ml-0  ">
      <h2 className="text-2xl font-bold text-white mb-4">Continue Watching</h2>
      <div className="flex flex-wrap gap-4">
        {sorted.map((progress) => {
          const anime = animeData.find(
            (a) => String(a.id) === String(progress.animeId)
          );
          if (!anime) return null;
          return (
            <Link key={anime.id} to={`/anime/${anime.id}`}>
              <div className="w-44 bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-200">
                <img
                  src={anime.imageUrl}
                  alt={anime.title}
                  className="w-full h-56 object-cover"
                  loading="lazy"
                />
                <div className="p-2">
                  <h3 className="text-white text-sm font-semibold truncate">
                    {anime.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-400 text-xs">
                      Ep {progress.episodeIndex + 1}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {formatTimeAgo(progress.updatedAt)}
                    </span>
                  </div>
                  {/* Progress bar placeholder, if you add time tracking later */}
                  {/* <div className="w-full bg-gray-700 h-1 rounded mt-2">
                    <div
                      className="bg-blue-500 h-1 rounded"
                      style={{ width: "40%" }}
                    />
                  </div> */}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ContinueWatching;
