import React from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const AnimeCard = ({ anime, showRank = false, rank }) => {
  const getMedalEmoji = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  return (
    <div className="relative bg-base-100 rounded-xl shadow hover:shadow-xl hover:scale-[1.03] transition-all duration-300 overflow-hidden border border-base-200">
      <Link to={`/anime/${anime.mal_id}`} className="block">
        {/* Image */}
        <div className="relative">
          <img
            src={anime.images?.jpg?.image_url || "https://via.placeholder.com/300x400"}
            alt={anime.title}
            className="w-full h-60 object-cover"
          />

          {/* Rank badge */}
          {showRank && (
            <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded shadow-md">
              #{rank} {getMedalEmoji(rank)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h2 className="text-base font-semibold line-clamp-2 min-h-[3rem]">
            {anime.title || "Unknown Title"}
          </h2>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <FaStar className="text-yellow-500 mr-1" />
            {anime.score || "N/A"}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Episodes: {anime.episodes || "?"}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default AnimeCard;
