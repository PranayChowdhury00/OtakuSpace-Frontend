import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlay, FaSpinner, FaExclamationTriangle } from "react-icons/fa";

const LatestReleases = () => {
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchLatestReleases = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("https://api.jikan.moe/v4/seasons/now?limit=12");

        if (response.status === 429) {
          if (retryCount < 3) {
            const retryAfter = parseInt(response.headers.get('Retry-After')) || 3;
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            setRetryCount(retryCount + 1);
            return fetchLatestReleases();
          }
          throw new Error("Too many requests. Please try again later.");
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();
        setLatest(data.data || []);
      } catch (err) {
        console.error("Failed to fetch latest releases:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestReleases();
  }, [retryCount]);

  const truncateTitle = (title, maxLength = 15) => {
    if (!title) return "Untitled Anime";
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Latest Releases</h2>
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
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Latest Releases</h2>
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

  if (!latest || latest.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Latest Releases</h2>
        <div className="alert alert-info">
          <span>No recent releases found.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold">Latest Releases</h2>
        
      </div>

      <div className="overflow-x-auto scrollbar-hide pb-2">
        <div className="flex gap-4">
          {latest.map((anime) => (
            <div
              key={anime.mal_id}
              className="min-w-[240px] bg-base-100 rounded-xl shadow hover:shadow-lg transition-all border border-base-200 hover:-translate-y-1 hover:scale-[1.02] group"
            >
              <Link to={`/anime/${anime.mal_id}`} className="block h-full">
                <div className="relative aspect-[3/4]">
                  <img
                    src={anime.images?.jpg?.image_url || "/placeholder-anime.jpg"}
                    alt={anime.title}
                    className="w-full h-full object-cover rounded-t-xl"
                    onError={(e) => {
                      e.target.src = "/placeholder-anime.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <button className="btn btn-primary btn-sm w-full">
                      <FaPlay className="mr-1" /> Watch Now
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h2 
                    className="text-[18px] font-medium line-clamp-2"
                    title={anime.title}
                  >
                    {truncateTitle(anime.title)}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {anime.type} • {anime.episodes || '?'} eps
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestReleases;