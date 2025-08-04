import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaPlay, FaSpinner, FaExclamationTriangle } from "react-icons/fa";

const TopRatedAnime = () => {
  const [topAnime, setTopAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchTopAnime = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("https://api.jikan.moe/v4/top/anime?limit=12");
        
        if (response.status === 429) {
          // If rate limited, wait and retry
          if (retryCount < 3) {
            const retryAfter = parseInt(response.headers.get('Retry-After')) || 3;
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            setRetryCount(retryCount + 1);
            return fetchTopAnime();
          }
          throw new Error("Too many requests. Please try again later.");
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setTopAnime(data.data || []);
      } catch (err) {
        console.error("Error fetching top-rated anime:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopAnime();
  }, [retryCount]);

  const truncateTitle = (title, maxLength = 15) => {
    if (!title) return "Unknown Title";
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">🌟 Top Rated Anime</h2>
        <div className="flex justify-center items-center h-40">
          <FaSpinner className="animate-spin text-4xl text-primary" />
          {retryCount > 0 && (
            <span className="ml-2">Retrying... ({retryCount}/3)</span>
          )}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">🌟 Top Rated Anime</h2>
        <div className="alert alert-error">
          <FaExclamationTriangle className="text-lg" />
          <span>{error}</span>
          {error.includes("Too many requests") && (
            <button 
              className="btn btn-sm btn-ghost ml-auto"
              onClick={() => {
                setRetryCount(0);
                setLoading(true);
              }}
            >
              Retry
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold">🌟 Top Rated Anime</h2>
        
      </div>

      {topAnime.length === 0 ? (
        <div className="alert alert-info">
          <span>No top-rated anime found.</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {topAnime.map((anime) => (
            <div
              key={anime.mal_id}
              className="bg-base-100 rounded-xl shadow hover:shadow-lg transition-all border border-base-200 overflow-hidden hover:-translate-y-1 hover:scale-[1.02] group"
            >
              <Link to={`/anime/${anime.mal_id}`} className="block h-full">
                <div className="relative aspect-[3/4]">
                  <img
                    src={anime.images?.jpg?.image_url || "/placeholder-anime.jpg"}
                    alt={anime.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-anime.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="w-full">
                      <div className="badge badge-primary absolute top-2 right-2">
                        <FaStar className="mr-1" />
                        {anime.score?.toFixed(1) || "N/A"}
                      </div>
                      <button className="btn btn-primary btn-sm w-full">
                        <FaPlay className="mr-1" /> Watch Now
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h2 
                    className="text-[18px] font-medium mb-1 truncate"
                    title={anime.title}
                  >
                    {truncateTitle(anime.title)}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {anime.type} • {anime.episodes || '?'} eps
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TopRatedAnime;