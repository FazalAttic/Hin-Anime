import { useParams } from "react-router-dom";
import Main from "./Main.jsx";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { createSlug } from "../context/utils";

export default function AnimePage() {
  const { titleSlug } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      const querySnap = await getDocs(collection(db, "animeshows"));
      const foundAnime = querySnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .find((anime) => createSlug(anime.title) === titleSlug);

      setAnime(foundAnime || null);
      setLoading(false);
    };
    fetchAnime();
  }, [titleSlug]);

  if (loading) {
    return <div />; // or null for no flash, or a spinner if you want
  }

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

  return <Main anime={anime} />;
}
