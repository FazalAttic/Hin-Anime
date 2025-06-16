import { useParams } from "react-router-dom";
import Main from "./Main.jsx";
import { animeData } from "../data.jsx";
import { createSlug } from "../context/utils.jsx";

export default function AnimePage() {
  const { titleSlug } = useParams(); // Changed from animeId to titleSlug

  // Find anime by matching the slugified title
  const anime = animeData.find((item) => {
    // Create URL-friendly slug from anime title
    const itemSlug = createSlug(item.title);

    // Also check against animeUrl if needed (backward compatibility)
    return (
      itemSlug === titleSlug ||
      item.animeUrl === `/${titleSlug}` ||
      item.id.toString() === titleSlug
    ); // Fallback to ID if needed
  });

  if (!anime) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 bg-white/10 backdrop-blur rounded-xl">
          <h1 className="text-2xl font-bold text-white">Anime not found</h1>
          <p className="mt-2 text-gray-300">
            No anime found matching: {titleSlug}
          </p>
        </div>
      </div>
    );
  }

  return <Main id={anime.id} />;
}
