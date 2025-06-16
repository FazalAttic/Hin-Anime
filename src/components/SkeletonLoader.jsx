// components/SkeletonLoader.jsx
import React from "react";

const SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
        {/* Image placeholder */}
        <div className="w-full h-48 bg-gray-700 rounded-t-lg"></div>

        {/* Content placeholder */}
        <div className="p-3">
          {/* Title placeholder */}
          <div className="h-5 w-3/4 bg-gray-700 rounded mb-3"></div>

          {/* Details placeholder */}
          <div className="flex justify-between items-center mt-2">
            <div className="h-4 w-16 bg-gray-700 rounded"></div>
            <div className="h-4 w-16 bg-gray-700 rounded"></div>
          </div>

          {/* Button placeholder */}
          <div className="mt-4 h-8 w-full bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
