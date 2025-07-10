import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  AiFillYoutube,
  AiOutlineClose,
  AiOutlineMessage,
  AiOutlineLike,
  AiFillLike,
  AiOutlineDislike,
  AiFillDislike,
} from "react-icons/ai";
import MoreLikeThis from "./MoreLikeThis";
import { FiEdit2 } from "react-icons/fi";
import { FaArrowLeft, FaArrowRight, FaReply } from "react-icons/fa";

// Add this utility function at the top (outside the component)
function isColorLight(hex) {
  if (!hex) return false;
  hex = hex.replace("#", "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((x) => x + x)
      .join("");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 170;
}

export default function Main({ anime }) {
  // All hooks declared at the top
  const { user } = useAuth();
  const [userWishlist, setUserWishlist] = React.useState([]);
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = React.useState(false);
  const [showTrailer, setShowTrailer] = React.useState(false);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = React.useState(0);
  const [comments, setComments] = React.useState([]);
  const [newComment, setNewComment] = React.useState("");
  const [loadingComments, setLoadingComments] = React.useState(true);
  const [userProfiles, setUserProfiles] = React.useState({});
  const [profilePopup, setProfilePopup] = React.useState(null);
  const [replyingTo, setReplyingTo] = React.useState(null);
  const [replyContent, setReplyContent] = React.useState("");
  const [activeComment, setActiveComment] = React.useState(null);
  const [animeLikes, setAnimeLikes] = React.useState(0);
  const [animeDislikes, setAnimeDislikes] = React.useState(0);
  const [userReaction, setUserReaction] = React.useState(null);
  const videoRef = useRef(null);

  // Timer ref to track if 25 seconds have passed
  const saveTimeoutRef = useRef(null);

  // Update the useEffect that listens for user profile changes
  React.useEffect(() => {
    if (!user) return;

    const unsubscribeUser = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setUserProfiles((prev) => ({
          ...prev,
          [user.uid]: {
            ...prev[user.uid],
            ...userData.profile,
            username:
              userData.profile?.username ||
              user.email?.split("@")[0] ||
              "Anonymous",
            photoURL: userData.profile?.photoURL || null,
          },
        }));
      }
    });

    // Add a real-time listener for all user profiles in comments
    const commentUserIds = comments.reduce((ids, comment) => {
      ids.add(comment.userId);
      comment.replies.forEach((reply) => ids.add(reply.userId));
      return ids;
    }, new Set());

    const unsubscribes = Array.from(commentUserIds).map((userId) => {
      return onSnapshot(doc(db, "users", userId), (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setUserProfiles((prev) => ({
            ...prev,
            [userId]: {
              ...prev[userId],
              ...userData.profile,
              username:
                userData.profile?.username ||
                userData.email?.split("@")[0] ||
                "Anonymous",
              photoURL: userData.profile?.photoURL || null,
            },
          }));
        }
      });
    });

    return () => {
      unsubscribeUser();
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [user, comments]); // Add comments to dependencies

  React.useEffect(() => {
    if (!user) return;

    const fetchWishlist = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const wishlist = userSnap.data().wishlist || [];
        setUserWishlist(wishlist);
        setIsInWishlist(wishlist.includes(anime.id));
      }
    };

    fetchWishlist();
  }, [user, anime.id]);

  React.useEffect(() => {
    const checkWishlist = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setIsInWishlist(userSnap.data().wishlist?.includes(anime.id));
      }
    };
    checkWishlist();
  }, [user, anime.id]);

  React.useEffect(() => {
    if (!anime.id) return;

    const animeRef = doc(db, "anime", String(anime.id));
    const unsubscribeAnime = onSnapshot(animeRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setAnimeLikes(data.likeCount || 0);
        setAnimeDislikes(data.dislikeCount || 0);

        if (user) {
          setUserReaction(
            data.likes?.includes(user.uid)
              ? "like"
              : data.dislikes?.includes(user.uid)
              ? "dislike"
              : null
          );
        }
      } else {
        setAnimeLikes(0);
        setAnimeDislikes(0);
        setUserReaction(null);
      }
    });

    setLoadingComments(true);
    const commentsRef = collection(db, "anime", String(anime.id), "comments");
    const q = query(commentsRef, orderBy("timestamp", "desc"));

    const unsubscribeComments = onSnapshot(
      q,
      async (snapshot) => {
        const commentsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            if (!userProfiles[data.userId]) {
              const profile = await fetchUserProfile(data.userId);
              setUserProfiles((prev) => ({ ...prev, [data.userId]: profile }));
            }
            return {
              id: doc.id,
              ...data,
              username:
                userProfiles[data.userId]?.username ||
                data.username ||
                "Anonymous",
              userPhoto:
                userProfiles[data.userId]?.photoURL || data.userPhoto || null,
              timestamp: data.timestamp?.toDate(),
              likes: data.likes || [],
              dislikes: data.dislikes || [],
              likeCount: data.likeCount || 0,
              dislikeCount: data.dislikeCount || 0,
            };
          })
        );

        const mainComments = commentsData.filter((c) => !c.parentId);
        const replies = commentsData.filter((c) => c.parentId);

        const organizedComments = mainComments.map((comment) => ({
          ...comment,
          replies: replies
            .filter((reply) => reply.parentId === comment.id)
            .sort((a, b) => a.timestamp - b.timestamp),
        }));

        setComments(organizedComments);
        setLoadingComments(false);
      },
      (error) => {
        console.error("Error loading comments:", error);
        setLoadingComments(false);
      }
    );

    return () => {
      unsubscribeAnime();
      unsubscribeComments();
    };
  }, [anime.id, user]);
  const handleAddToWishlist = async (animeId) => {
    if (!user) return navigate("/login");

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      wishlist: arrayUnion(animeId),
    });

    setUserWishlist((prev) => [...prev, animeId]);
  };

  // Helper functions
  const fetchUserProfile = async (userId) => {
    if (userProfiles[userId]) {
      return userProfiles[userId];
    }

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const profileData = userSnap.data().profile || {};
        const profile = {
          ...profileData,
          userId,
          username:
            profileData.username ||
            userSnap.data().email?.split("@")[0] ||
            "Anonymous",
          photoURL: profileData.photoURL || null,
          bannerURL: profileData.bannerURL || null,
          bio: profileData.bio || "",
          createdAt:
            profileData.createdAt?.toDate() ||
            userSnap.data().metadata?.creationTime ||
            new Date(),
          gradientColorTop: profileData.gradientColorTop || "#2d3748", // fallback gray-800
          gradientColorBottom: profileData.gradientColorBottom || "#2d3748",
        };

        setUserProfiles((prev) => ({ ...prev, [userId]: profile }));
        return profile;
      }
      return {
        userId,
        username: "Anonymous",
        photoURL: null,
        bannerURL: null,
        bio: "",
        createdAt: new Date(),
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return {
        userId,
        username: "Anonymous",
        photoURL: null,
        bannerURL: null,
        bio: "",
        createdAt: new Date(),
      };
    }
  };

  const handleProfileClick = async (userId) => {
    const profile = await fetchUserProfile(userId);
    setProfilePopup(profile);
  };

  const handleAnimeReaction = async (reaction) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const animeRef = doc(db, "anime", String(anime.id));
      const animeSnap = await getDoc(animeRef);

      if (!animeSnap.exists()) {
        await setDoc(animeRef, {
          likes: [],
          dislikes: [],
          likeCount: 0,
          dislikeCount: 0,
        });
      }

      const data = animeSnap.data() || {};
      const currentLikes = data.likes || [];
      const currentDislikes = data.dislikes || [];
      const isLiked = currentLikes.includes(user.uid);
      const isDisliked = currentDislikes.includes(user.uid);

      const updates = {};

      if (reaction === "like") {
        if (isLiked) {
          updates.likes = arrayRemove(user.uid);
          updates.likeCount = (data.likeCount || 0) - 1;
          setUserReaction(null);
        } else {
          updates.likes = arrayUnion(user.uid);
          updates.likeCount = (data.likeCount || 0) + 1;
          setUserReaction("like");

          if (isDisliked) {
            updates.dislikes = arrayRemove(user.uid);
            updates.dislikeCount = (data.dislikeCount || 0) - 1;
          }
        }
      } else {
        if (isDisliked) {
          updates.dislikes = arrayRemove(user.uid);
          updates.dislikeCount = (data.dislikeCount || 0) - 1;
          setUserReaction(null);
        } else {
          updates.dislikes = arrayUnion(user.uid);
          updates.dislikeCount = (data.dislikeCount || 0) + 1;
          setUserReaction("dislike");

          if (isLiked) {
            updates.likes = arrayRemove(user.uid);
            updates.likeCount = (data.likeCount || 0) - 1;
          }
        }
      }

      await updateDoc(animeRef, updates);
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };

  const handleCommentReaction = async (commentId, reaction) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const commentRef = doc(
        db,
        "anime",
        String(anime.id),
        "comments",
        commentId
      );
      const commentSnap = await getDoc(commentRef);

      if (commentSnap.exists()) {
        const data = commentSnap.data();
        const currentLikes = data.likes || [];
        const currentDislikes = data.dislikes || [];
        const isLiked = currentLikes.includes(user.uid);
        const isDisliked = currentDislikes.includes(user.uid);

        let updates = {};

        if (reaction === "like") {
          if (isLiked) {
            updates = {
              likes: arrayRemove(user.uid),
              likeCount: (data.likeCount || 0) - 1,
            };
          } else {
            updates = {
              likes: arrayUnion(user.uid),
              likeCount: (data.likeCount || 0) + 1,
            };
            if (isDisliked) {
              updates.dislikes = arrayRemove(user.uid);
              updates.dislikeCount = (data.dislikeCount || 0) - 1;
            }
          }
        } else {
          if (isDisliked) {
            updates = {
              dislikes: arrayRemove(user.uid),
              dislikeCount: (data.dislikeCount || 0) - 1,
            };
          } else {
            updates = {
              dislikes: arrayUnion(user.uid),
              dislikeCount: (data.dislikeCount || 0) + 1,
            };
            if (isLiked) {
              updates.likes = arrayRemove(user.uid);
              updates.likeCount = (data.likeCount || 0) - 1;
            }
          }
        }

        await updateDoc(commentRef, updates);
      }
    } catch (error) {
      console.error("Error reacting to comment:", error);
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1)
      return `${interval} year${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1)
      return `${interval} month${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1)
      return `${interval} hour${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1)
      return `${interval} minute${interval === 1 ? "" : "s"} ago`;

    return `${Math.floor(seconds)} sec${seconds === 1 ? "" : "s"} ago`;
  };

  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    if (!user || !replyContent.trim()) return;

    try {
      const profile = await fetchUserProfile(user.uid);
      const commentsRef = collection(db, "anime", String(anime.id), "comments");

      await addDoc(commentsRef, {
        text: replyContent,
        userId: user.uid,
        username: profile.username,
        userPhoto: profile.photoURL,
        timestamp: serverTimestamp(),
        parentId,
        isReply: true,
        likes: [],
        dislikes: [],
        likeCount: 0,
        dislikeCount: 0,
      });

      setReplyContent("");
      setReplyingTo(null);
      setActiveComment(null);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !anime.id) return;

    const submitButton = e.currentTarget.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      const profile = await fetchUserProfile(user.uid);
      const commentsRef = collection(db, "anime", String(anime.id), "comments");

      await addDoc(commentsRef, {
        text: newComment,
        userId: user.uid,
        username: profile.username || user.email?.split("@")[0] || "Anonymous",
        userPhoto: profile.photoURL || user.photoURL || null,
        timestamp: serverTimestamp(),
        likes: [],
        dislikes: [],
        likeCount: 0,
        dislikeCount: 0,
        parentId: null,
        isReply: false,
      });

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate("/login", {
        state: { redirectAfterLogin: window.location.pathname },
      });
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      if (isInWishlist) {
        await updateDoc(userRef, {
          wishlist: arrayRemove(anime.id),
        });
      } else {
        await updateDoc(userRef, {
          wishlist: arrayUnion(anime.id),
        });
      }
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const getYouTubeId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // --- MOVE THESE TWO useEffect HOOKS TO HERE, BEFORE ANY RETURN ---
  useEffect(() => {
    if (!anime.id) return;

    // Clear previous timer if any
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    // Start 25s timer
    saveTimeoutRef.current = setTimeout(() => {
      const progress = {
        animeId: anime.id,
        episodeIndex: currentEpisodeIndex,
        updatedAt: Date.now(),
      };

      if (!user) {
        // Save to localStorage for guests
        let local = [];
        try {
          local = JSON.parse(localStorage.getItem("continueWatching")) || [];
        } catch (e) {
          local = [];
        }
        local = local.filter(
          (item) => String(item.animeId) !== String(anime.id)
        );
        local.push(progress);
        localStorage.setItem("continueWatching", JSON.stringify(local));
      } else {
        // Save to Firestore for logged-in users
        const saveProgress = async () => {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          let remote = userSnap.data()?.continueWatching || [];
          remote = remote.filter(
            (item) => String(item.animeId) !== String(anime.id)
          );
          remote.push(progress);
          await updateDoc(userRef, { continueWatching: remote });
        };
        saveProgress();
      }
    }, 25000); // 25 seconds

    // Cleanup timer on episode change/unmount
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [currentEpisodeIndex, anime.id, user]);

  useEffect(() => {
    if (!user) return;
    const fetchProgress = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const cw = userSnap.data()?.continueWatching || [];
      const progress = cw.find((p) => String(p.animeId) === String(anime.id));
      if (progress) setCurrentEpisodeIndex(progress.episodeIndex || 0);
    };
    fetchProgress();
  }, [user, anime.id]);

  if (!anime || !anime.id)
    return <div className="text-center py-20">Anime not found</div>;

  const episodes = Array.isArray(anime.episodes) ? anime.episodes : [];
  if (episodes.length === 0) {
    return (
      <div className="text-center py-20">
        No episodes available for this anime
      </div>
    );
  }

  const youtubeId = anime?.youtube ? getYouTubeId(anime.youtube) : null;

  const handleNextEpisode = () => {
    setCurrentEpisodeIndex((prev) =>
      prev + 1 < episodes.length ? prev + 1 : prev
    );
  };

  const handlePrevEpisode = () => {
    setCurrentEpisodeIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
  };

  // Compute text color for profile popup
  let profileTextColor = "white";
  if (profilePopup) {
    const top = profilePopup.gradientColorTop || "#2d3748";
    const bottom = profilePopup.gradientColorBottom || "#2d3748";
    if (isColorLight(top) && isColorLight(bottom)) {
      profileTextColor = "black";
    }
  }

  // The complete JSX return
  return (
    <>
      <div className="bg-gray-900 min-h-screen text-white pb-10">
        <AnimatePresence>
          {profilePopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
              onClick={() => setProfilePopup(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-md rounded-xl overflow-hidden shadow-2xl"
                style={{
                  background: `linear-gradient(to bottom, ${
                    profilePopup.gradientColorTop || "#2d3748"
                  }, ${profilePopup.gradientColorBottom || "#2d3748"})`,
                  color: profileTextColor,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="h-36 bg-gradient-to-r from-purple-900 to-blue-800 rounded-t-xl">
                  {profilePopup.bannerURL && (
                    <img
                      src={profilePopup.bannerURL}
                      alt="Banner"
                      className="w-full h-full object-cover rounded-t-xl"
                    />
                  )}
                </div>

                <div className="p-6 relative">
                  <div
                    className="absolute -top-16 left-6 border-4 border-gray-800 rounded-full cursor-pointer"
                    onClick={() => handleProfileClick(profilePopup.userId)}
                  >
                    <img
                      src={
                        profilePopup.photoURL ||
                        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      }
                      alt="Profile"
                      className="w-28 h-28 rounded-full object-cover"
                    />
                  </div>

                  <div className="mt-16">
                    <div className="relative">
                      <div className="flex flex-col">
                        <h2 className="text-2xl font-bold">
                          {profilePopup.username}
                        </h2>
                        {/* Joined date */}
                        <p
                          className={`${
                            profileTextColor === "black"
                              ? "text-gray-700"
                              : "text-gray-200"
                          } text-sm mt-1`}
                        >
                          Joined{" "}
                          {profilePopup.createdAt
                            ? (profilePopup.createdAt.toDate
                                ? profilePopup.createdAt.toDate()
                                : new Date(profilePopup.createdAt)
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : ""}
                        </p>
                      </div>

                      {user?.uid === profilePopup.userId && (
                        <button
                          className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded-full"
                          onClick={() => navigate("/profile")}
                          title="Edit Profile"
                        >
                          <FiEdit2 size={16} />
                        </button>
                      )}
                    </div>
                    {/* About section */}
                    <div className="mt-4">
                      <h3
                        className={`text-lg font-semibold ${
                          profileTextColor === "black"
                            ? "text-gray-800"
                            : "text-gray-300"
                        }`}
                      >
                        About
                      </h3>
                      <p
                        className={`mt-2 ${
                          profileTextColor === "black"
                            ? "text-gray-700"
                            : "text-gray-300"
                        }`}
                      >
                        {profilePopup.bio ||
                          "This user hasn't written a bio yet."}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="container mx-auto px-4 py-8">
          <div className="ml-60 flex flex-col lg:flex-row gap-8 mb-10 mt-16 max-sm:ml-0 max-xl:ml-0">
            <div className="w-full lg:w-1/3 xl:w-1/4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative rounded-xl overflow-hidden shadow-2xl"
              >
                <img
                  className="w-full h-auto object-cover"
                  src={anime.imageUrl}
                  alt={anime.title}
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/300x450?text=No+Image")
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition w-full"
                  >
                    <AiFillYoutube size={20} />
                    <span>Play Trailer</span>
                  </button>
                </div>
              </motion.div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={handleWishlistToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition w-full justify-center ${
                    isInWishlist
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gray-800 hover:bg-gray-700 text-white"
                  }`}
                >
                  {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
                </button>
              </div>
            </div>

            <div className="w-full lg:w-2/3 xl:w-3/4">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl md:text-4xl font-bold">
                  {anime.title}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded">
                    IMDB: {anime.imdbRating}
                  </span>
                </div>
              </div>

              <motion.div
                className="flex items-center gap-4 mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  onClick={() => handleAnimeReaction("like")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg transition w-full ${
                    userReaction === "like"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {userReaction === "like" ? (
                    <AiFillLike className="text-xl" />
                  ) : (
                    <AiOutlineLike className="text-xl" />
                  )}
                  <span>{animeLikes}</span>
                </motion.button>

                <motion.button
                  onClick={() => handleAnimeReaction("dislike")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg transition w-full ${
                    userReaction === "dislike"
                      ? "bg-red-600 text-white"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {userReaction === "dislike" ? (
                    <AiFillDislike className="text-xl" />
                  ) : (
                    <AiOutlineDislike className="text-xl" />
                  )}
                  <span>{animeDislikes}</span>
                </motion.button>
              </motion.div>

              <div className="flex flex-wrap gap-2 mt-4">
                {anime.genres?.map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-bold mb-2">Synopsis</h2>
                <p className="text-gray-300 leading-relaxed">
                  {anime.description || "No description available."}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-400">Language</h3>
                  <p className="font-medium">Hindi Dubbed</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-400">Quality</h3>
                  <p className="font-medium">1080p, 720p, 480p</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-400">Duration</h3>
                  <p className="font-medium">
                    {anime.animeduration || 24}m per ep
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-400">Status</h3>
                  <p className="font-medium">{anime.Status || "Completed"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10 ml-60 max-sm:ml-0">
            <h2 className="text-2xl font-bold mb-4">Watch Now</h2>
            <div className="flex flex-col items-center p-4 w-full relative">
              <div
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30"
                style={{ backgroundImage: `url('${anime.imageUrl}')` }}
              ></div>

              <motion.div
                key={currentEpisodeIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-4xl h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] border rounded-lg overflow-hidden"
              >
                {episodes[currentEpisodeIndex]?.url ? (
                  <iframe
                    ref={videoRef}
                    src={episodes[currentEpisodeIndex].url}
                    className="w-full h-full"
                    allowFullScreen
                    title={episodes[currentEpisodeIndex].title || "Episode"}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <p>Episode source not available</p>
                  </div>
                )}
              </motion.div>

              <div className="relative flex mt-4 text-white backdrop-blur-lg p-4 rounded-lg max-sm:mt-6">
                <h2 className="h-auto w-auto lg:w-97 bg-gray-800 px-4 py-2 rounded-lg mr-2 max-sm:text-sm">
                  {episodes[currentEpisodeIndex]?.title || "Episode"}
                </h2>
                <div className="flex gap-2">
                  {currentEpisodeIndex > 0 && (
                    <motion.button
                      onClick={handlePrevEpisode}
                      className="h-10 flex items-center justify-center gap-2 bg-gray-800 px-4 py-2 rounded-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaArrowLeft className="text-lg" /> Previous
                    </motion.button>
                  )}
                  {currentEpisodeIndex < episodes.length - 1 && (
                    <motion.button
                      onClick={handleNextEpisode}
                      className="h-10 flex items-center justify-center gap-2 bg-gray-800 px-4 py-2 rounded-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      Next <FaArrowRight className="text-lg" />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 ml-60 max-sm:ml-0">
            <h2 className="text-2xl font-bold mb-4">Episodes</h2>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center">
                <img
                  src={anime.imageUrl}
                  alt="Season cover"
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="ml-4">
                  <h3 className="font-bold">Season {anime.season || 1}</h3>
                  <p className="text-sm text-gray-400">
                    {episodes.length} Episodes •{" "}
                    {anime.animeyear || "Unknown year"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {episodes.map((episode, index) => {
                  if (!episode || typeof episode !== "object") return null;

                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentEpisodeIndex(index)}
                      className={`p-2 rounded text-left ${
                        currentEpisodeIndex === index
                          ? "bg-red-600"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      <p className="text-sm font-medium truncate">
                        {episode.title || `Episode ${index + 1}`}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Replace the entire comments section with this code */}

          <div className="mt-8 ml-60 max-sm:ml-0">
            <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">
                  Discussion ({comments.length})
                </h2>
                <div className="flex items-center gap-2 text-sm sm:text-base">
                  <AiOutlineMessage className="text-gray-400" />
                  <span className="text-gray-400">
                    {comments.reduce(
                      (acc, curr) => acc + 1 + curr.replies.length,
                      0
                    )}{" "}
                    total
                  </span>
                </div>
              </div>

              {/* Comment input form */}
              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div
                      className="relative cursor-pointer flex-shrink-0"
                      onClick={() => handleProfileClick(user.uid)}
                    >
                      <img
                        src={
                          user.photoURL ||
                          userProfiles[user?.uid]?.photoURL ||
                          "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        }
                        alt="You"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts about this anime..."
                        className="w-full bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm sm:text-base"
                        rows="3"
                      />
                      <div className="flex justify-end mt-2 ">
                        <button
                          type="submit"
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm sm:text-base w-full"
                          disabled={!newComment.trim()}
                        >
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-8 text-center py-4 bg-gray-700/50 rounded-lg">
                  <button
                    onClick={() => navigate("/login")}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition text-sm sm:text-base"
                  >
                    Login to join the discussion
                  </button>
                </div>
              )}

              {/* Comments list */}
              {comments.length === 0 ? (
                <div className="text-center py-8 bg-gray-700/20 rounded-lg">
                  <p className="text-gray-400">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      className="comment-container"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex gap-3 sm:gap-4">
                        {/* User avatar */}
                        <div
                          className="relative cursor-pointer flex-shrink-0"
                          onClick={() => handleProfileClick(comment.userId)}
                        >
                          <img
                            src={
                              userProfiles[comment.userId]?.photoURL ||
                              comment.userPhoto ||
                              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                            }
                            alt={
                              userProfiles[comment.userId]?.username ||
                              comment.username
                            }
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </div>

                        {/* Comment content */}
                        <div className="flex-grow min-w-0">
                          <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                            {/* Comment header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className="font-semibold text-red-400 cursor-pointer hover:underline text-sm sm:text-base truncate max-w-[120px] sm:max-w-[200px]"
                                  onClick={() =>
                                    handleProfileClick(comment.userId)
                                  }
                                >
                                  {userProfiles[comment.userId]?.username ||
                                    comment.username}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {comment.timestamp
                                    ? formatTimeAgo(comment.timestamp)
                                    : "Just now"}
                                </span>
                              </div>

                              {/* Comment actions */}
                              <div className="flex items-center justify-end sm:justify-start gap-3">
                                {/* Like/dislike buttons */}
                                <div className="flex items-center gap-1">
                                  <motion.button
                                    onClick={() =>
                                      handleCommentReaction(comment.id, "like")
                                    }
                                    className={`flex items-center gap-1 ${
                                      comment.likes?.includes(user?.uid)
                                        ? "text-blue-500"
                                        : "text-gray-400"
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    {comment.likes?.includes(user?.uid) ? (
                                      <AiFillLike className="text-base" />
                                    ) : (
                                      <AiOutlineLike className="text-base" />
                                    )}
                                    <span className="text-xs">
                                      {comment.likeCount || 0}
                                    </span>
                                  </motion.button>

                                  <span className="text-gray-500">|</span>

                                  <motion.button
                                    onClick={() =>
                                      handleCommentReaction(
                                        comment.id,
                                        "dislike"
                                      )
                                    }
                                    className={`flex items-center gap-1 ${
                                      comment.dislikes?.includes(user?.uid)
                                        ? "text-red-500"
                                        : "text-gray-400"
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    {comment.dislikes?.includes(user?.uid) ? (
                                      <AiFillDislike className="text-base" />
                                    ) : (
                                      <AiOutlineDislike className="text-base" />
                                    )}
                                    <span className="text-xs">
                                      {comment.dislikeCount || 0}
                                    </span>
                                  </motion.button>
                                </div>

                                {/* Reply button */}
                                <button
                                  onClick={() => {
                                    setReplyingTo(
                                      replyingTo === comment.id
                                        ? null
                                        : comment.id
                                    );
                                    setActiveComment(
                                      activeComment === comment.id
                                        ? null
                                        : comment.id
                                    );
                                  }}
                                  className="flex items-center gap-1 text-gray-400 hover:text-blue-400 text-xs sm:text-sm"
                                >
                                  <FaReply size={14} />
                                  <span>Reply</span>
                                </button>
                              </div>
                            </div>

                            {/* Comment text */}
                            <p className="text-gray-200 text-sm sm:text-base break-words">
                              {comment.text}
                            </p>
                          </div>

                          {/* Reply form */}
                          {replyingTo === comment.id && (
                            <motion.form
                              onSubmit={(e) => handleReplySubmit(e, comment.id)}
                              className="mt-3 ml-2 sm:ml-6"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <div className="flex items-start gap-3">
                                <img
                                  src={
                                    user.photoURL ||
                                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                                  }
                                  alt="You"
                                  className="w-8 h-8 rounded-full flex-shrink-0"
                                />
                                <div className="flex-grow">
                                  <textarea
                                    value={replyContent}
                                    onChange={(e) =>
                                      setReplyContent(e.target.value)
                                    }
                                    placeholder={`Replying to ${comment.username}...`}
                                    className="w-full bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm resize-none"
                                    rows="2"
                                  />
                                  <div className="flex justify-end gap-2 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReplyingTo(null);
                                        setActiveComment(null);
                                      }}
                                      className="text-gray-400 hover:text-white px-3 py-1 rounded text-xs sm:text-sm"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs sm:text-sm"
                                      disabled={!replyContent.trim()}
                                    >
                                      Reply
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.form>
                          )}

                          {/* Replies list */}
                          {comment.replies.length > 0 && (
                            <motion.div
                              className="mt-3 ml-2 sm:ml-6 space-y-3 border-l-2 border-gray-700 pl-3 sm:pl-4"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              {comment.replies.map((reply) => (
                                <motion.div
                                  key={reply.id}
                                  className="flex gap-3"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  {/* Reply user avatar */}
                                  <div
                                    className="relative cursor-pointer flex-shrink-0"
                                    onClick={() =>
                                      handleProfileClick(reply.userId)
                                    }
                                  >
                                    <img
                                      src={
                                        userProfiles[reply.userId]?.photoURL ||
                                        reply.userPhoto ||
                                        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                                      }
                                      alt={
                                        userProfiles[reply.userId]?.username ||
                                        reply.username
                                      }
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  </div>

                                  {/* Reply content */}
                                  <div className="flex-grow min-w-0">
                                    <div className="bg-gray-700 rounded-lg p-3">
                                      {/* Reply header */}
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                          <span
                                            className="font-semibold text-sm text-red-400 cursor-pointer hover:underline truncate max-w-[100px] sm:max-w-[150px]"
                                            onClick={() =>
                                              handleProfileClick(reply.userId)
                                            }
                                          >
                                            {userProfiles[reply.userId]
                                              ?.username || reply.username}
                                          </span>
                                          <span className="text-xs text-gray-400">
                                            {reply.timestamp
                                              ? formatTimeAgo(reply.timestamp)
                                              : "Just now"}
                                          </span>
                                        </div>

                                        {/* Reply actions */}
                                        <div className="flex items-center justify-end sm:justify-start gap-2">
                                          <motion.button
                                            onClick={() =>
                                              handleCommentReaction(
                                                reply.id,
                                                "like"
                                              )
                                            }
                                            className={`flex items-center gap-1 ${
                                              reply.likes?.includes(user?.uid)
                                                ? "text-blue-500"
                                                : "text-gray-400"
                                            }`}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                          >
                                            {reply.likes?.includes(
                                              user?.uid
                                            ) ? (
                                              <AiFillLike className="text-sm" />
                                            ) : (
                                              <AiOutlineLike className="text-sm" />
                                            )}
                                            <span className="text-xs">
                                              {reply.likeCount || 0}
                                            </span>
                                          </motion.button>

                                          <span className="text-gray-500 text-xs">
                                            |
                                          </span>

                                          <motion.button
                                            onClick={() =>
                                              handleCommentReaction(
                                                reply.id,
                                                "dislike"
                                              )
                                            }
                                            className={`flex items-center gap-1 ${
                                              reply.dislikes?.includes(
                                                user?.uid
                                              )
                                                ? "text-red-500"
                                                : "text-gray-400"
                                            }`}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                          >
                                            {reply.dislikes?.includes(
                                              user?.uid
                                            ) ? (
                                              <AiFillDislike className="text-sm" />
                                            ) : (
                                              <AiOutlineDislike className="text-sm" />
                                            )}
                                            <span className="text-xs">
                                              {reply.dislikeCount || 0}
                                            </span>
                                          </motion.button>
                                        </div>
                                      </div>

                                      {/* Reply text */}
                                      <p className="text-gray-200 text-xs sm:text-sm break-words">
                                        {reply.text}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showTrailer && youtubeId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            >
              <motion.div
                initial={{ backdropFilter: "blur(0px)" }}
                animate={{ backdropFilter: "blur(8px)" }}
                exit={{ backdropFilter: "blur(0px)" }}
                className="absolute inset-0 bg-black/80"
                onClick={() => setShowTrailer(false)}
              />

              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-4xl"
              >
                <button
                  onClick={() => setShowTrailer(false)}
                  className="absolute -top-12 right-0 text-white hover:text-red-500 transition"
                  aria-label="Close trailer"
                >
                  <AiOutlineClose size={30} />
                </button>

                <div className="aspect-w-16 aspect-h-9 bg-black rounded-xl overflow-hidden shadow-2xl">
                  <iframe
                    className="w-full h-[500px]"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${anime.title} Trailer`}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <MoreLikeThis currentAnimeId={anime.id} />
      </div>
    </>
  );
}
