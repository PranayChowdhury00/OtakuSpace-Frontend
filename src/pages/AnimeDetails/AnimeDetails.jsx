import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaStar, FaPlay, FaHeart } from "react-icons/fa";
import { AuthContext } from "../../context/authContext";


const AnimeDetails = () => {
  const { id } = useParams(); // Get anime ID from URL
  const { user } = useContext(AuthContext); // Firebase Auth context

  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistAdded, setWishlistAdded] = useState(false);

  // Fetch anime from Jikan API
  useEffect(() => {
    axios
      .get(`https://api.jikan.moe/v4/anime/${id}`)
      .then((res) => {
        setAnime(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching anime:", err);
        setLoading(false);
      });
  }, [id]);

  // Add to wishlist function
  const handleAddToWishlist = () => {
    if (!user) {
      return alert("Please log in first to save to wishlist!");
    }

    const wishData = {
      animeId: anime.mal_id,
      title: anime.title,
      image: anime.images?.jpg?.image_url,
      rating: anime.score,
      episodes: anime.episodes,
      userEmail: user.email,
      time: new Date()
    };

    axios
      .post("http://localhost:5000/wishList", wishData)
      .then((res) => {
        if (res.data.insertedId) {
          setWishlistAdded(true);
          alert("Added to wishlist!");
        } else {
          alert("Already in wishlist or something went wrong.");
        }
      })
      .catch((err) => {
        console.error("Wishlist error:", err);
        alert("Failed to add to wishlist.");
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-ring loading-lg text-primary" />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="text-center mt-10 text-red-500">
        Anime not found 😢
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Anime Image */}
        <img
          src={anime.images?.jpg?.large_image_url || "https://via.placeholder.com/400x600"}
          alt={anime.title}
          className="rounded-xl shadow-lg w-full object-cover"
        />

        {/* Anime Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{anime.title}</h1>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center text-yellow-500">
              <FaStar className="mr-1" />
              <span>{anime.score || "N/A"}</span>
            </div>
            <span className="text-gray-500">{anime.episodes} Episodes</span>
            <span className="text-gray-500 capitalize">{anime.status}</span>
          </div>

          <p className="text-gray-700 mb-4">
            {anime.synopsis || "No description available."}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {anime.genres?.map((genre) => (
              <span
                key={genre.mal_id}
                className="badge badge-outline badge-secondary text-sm"
              >
                {genre.name}
              </span>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap">
            <button className="btn btn-primary">
              <FaPlay className="mr-2" /> Start Watching
            </button>
            <button
              onClick={handleAddToWishlist}
              className={`btn ${wishlistAdded ? "btn-success" : "btn-secondary"}`}
            >
              <FaHeart className="mr-2" />
              {wishlistAdded ? "In Wishlist" : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
