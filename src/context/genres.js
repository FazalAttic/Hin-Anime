// utils/genres.js
export const getAllGenres = (animeData) => {
  const genres = new Set();
  animeData.forEach((anime) => {
    anime.genres?.forEach((genre) => genres.add(genre));
  });
  return Array.from(genres).sort();
};

// Then in your Navbar.jsx, you can use:
import { getAllGenres } from "../utils/genres";
const allGenres = getAllGenres(animeData);
