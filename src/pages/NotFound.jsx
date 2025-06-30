import React from "react";
import { FaSadTear } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white text-center px-4 ">
      <FaSadTear className="text-8xl mb-4 animate-bounce" />
      <h1 className="text-5xl font-bold mb-2">404 - Page Not Found</h1>
      <p className="text-xl mb-6">
        Oops! Looks like you're lost in the anime multiverse 😢
      </p>
      <Link
        to="/"
        className="bg-white text-pink-600 font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-pink-100 transition duration-300"
      >
        ⬅️ Back to Home
      </Link>
      <p className="mt-6 text-sm opacity-80">
        Maybe you're trying to find the One Piece? 🏴‍☠️🍖
      </p>
    </div>
  );
}
