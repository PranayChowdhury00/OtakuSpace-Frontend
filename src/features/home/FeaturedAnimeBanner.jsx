import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/autoplay";
import { Autoplay, EffectFade } from "swiper/modules";
import { Link } from "react-router-dom";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";

const FeaturedAnimeBanner = () => {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          "https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=5"
        );

        if (response.status === 429) {
          if (retryCount < 3) {
            const retryAfter = parseInt(response.headers.get('Retry-After')) || 3;
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            setRetryCount(retryCount + 1);
            return fetchAnimes();
          }
          throw new Error("Too many requests. Please try again later.");
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAnimes(data.data || []);
      } catch (err) {
        console.error("Banner fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, [retryCount]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-4 px-2 md:px-6">
        <div className="rounded-xl overflow-hidden shadow-xl bg-base-200 h-[70vh] md:h-[75vh] flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
            <p>Loading featured anime...</p>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500">Retrying ({retryCount}/3)</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto py-4 px-2 md:px-6">
        <div className="rounded-xl overflow-hidden shadow-xl bg-base-200 h-[70vh] md:h-[75vh] flex items-center justify-center">
          <div className="alert alert-error max-w-md mx-auto">
            <FaExclamationTriangle />
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
        </div>
      </div>
    );
  }

  if (!animes || animes.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto py-4 px-2 md:px-6">
        <div className="rounded-xl overflow-hidden shadow-xl bg-base-200 h-[70vh] md:h-[75vh] flex items-center justify-center">
          <div className="alert alert-info max-w-md mx-auto">
            <span>No featured anime available at the moment.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-2 md:px-6">
      <Swiper
        spaceBetween={30}
        effect="fade"
        autoplay={{ delay: 4000 }}
        loop
        modules={[Autoplay, EffectFade]}
        className="rounded-xl overflow-hidden shadow-xl"
      >
        {animes.map((anime) => (
          <SwiperSlide key={anime.mal_id}>
            <div className="relative h-[70vh] md:h-[75vh] w-full">
              <img
                src={anime.images?.jpg?.large_image_url || "/placeholder-banner.jpg"}
                alt={anime.title}
                className="absolute inset-0 w-full h-full object-cover brightness-75"
                onError={(e) => {
                  e.target.src = "/placeholder-banner.jpg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              <div className="relative z-10 p-6 md:p-10 text-white max-w-xl">
                <h2 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-md">
                  {anime.title || "Untitled Anime"}
                </h2>
                <p className="text-sm md:text-base text-gray-300 line-clamp-3 mb-4">
                  {anime.synopsis || "No synopsis available."}
                </p>
                <Link
                  to={`/anime/${anime.mal_id}`}
                  className="btn btn-primary btn-sm md:btn-md"
                >
                  Explore Anime
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FeaturedAnimeBanner;