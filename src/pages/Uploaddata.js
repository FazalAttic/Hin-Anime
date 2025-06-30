import React, { useState } from "react";
import { db } from "../firebase";
import { collection, setDoc, doc } from "firebase/firestore";
import data from "../data.json"; // <-- Import your local JSON file

const Uploaddata = () => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  // Helper to create a slug from title
  const createSlug = (title) =>
    title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const handleUpload = async () => {
    setResult(null);
    setUploading(true);

    try {
      if (!Array.isArray(data)) {
        setResult("JSON must be an array of anime objects.");
        setUploading(false);
        return;
      }

      let success = 0;
      let failed = 0;

      for (const anime of data) {
        try {
          const docId = anime.id ? String(anime.id) : undefined;
          const animeWithSlug = { ...anime, slug: createSlug(anime.title) };
          if (docId) {
            await setDoc(
              doc(collection(db, "animeshows"), docId),
              animeWithSlug
            );
          } else {
            await setDoc(doc(collection(db, "animeshows")), animeWithSlug);
          }
          success++;
        } catch (err) {
          failed++;
        }
      }

      setResult(`Upload complete! Success: ${success}, Failed: ${failed}`);
    } catch (err) {
      setResult("Failed to upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">
          Upload Local Anime JSON to Firestore
        </h1>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload from data.json"}
        </button>
        {result && <div className="mt-4 text-center text-white">{result}</div>}
        <div className="mt-4 text-gray-400 text-xs">
          <p>
            This will upload all anime from <b>src/data.json</b> to Firestore.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Uploaddata;
