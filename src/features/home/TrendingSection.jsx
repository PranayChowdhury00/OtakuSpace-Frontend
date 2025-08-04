import React, { useEffect, useState } from "react";
import AnimeCard from "../../components/AnimeCard";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { Link } from "react-router-dom";

const TrendingSection = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchTrendingAnime = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          "https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=15"
        );

        if (response.status === 429) {
          if (retryCount < 3) {
            const retryAfter = parseInt(response.headers.get('Retry-After')) || 3;
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            setRetryCount(retryCount + 1);
            return fetchTrendingAnime();
          }
          throw new Error("Too many requests. Please try again later.");
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTrending(data.data || []);
      } catch (err) {
        console.error("Trending fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingAnime();
  }, [retryCount]);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Trending Now</h2>
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
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Trending Now</h2>
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

  if (!trending || trending.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Trending Now</h2>
        <div className="alert alert-info">
          <span>No trending anime found.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold">Trending Now</h2>
        <Link to="/trending-page" className="btn btn-sm btn-outline">
          View All
        </Link>
      </div>

      <div className="overflow-x-auto scrollbar-hide pb-4">
        <div className="flex gap-4">
          {trending.map((anime) => (
            <div 
              key={anime.mal_id} 
              className="min-w-[160px] sm:min-w-[200px] flex-none"
            >
              <AnimeCard 
                anime={anime} 
                showRank={true}
                rank={trending.indexOf(anime) + 1}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;