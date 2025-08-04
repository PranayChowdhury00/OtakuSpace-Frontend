import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRandom, FaPlay, FaRedo } from 'react-icons/fa';
import ReactPlayer from 'react-player';
import Swal from 'sweetalert2';

const RandomTrailerBox = () => {
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchRandomAnime = async () => {
    try {
      setLoading(true);
      setShowTrailer(false);
      
      const randomPage = Math.floor(Math.random() * 100) + 1;
      const response = await axios.get(
        `https://api.jikan.moe/v4/top/anime?page=${randomPage}&limit=1`
      );
      
      if (response.data.data.length > 0) {
        const randomAnime = response.data.data[0];
        
        const detailsResponse = await axios.get(
          `https://api.jikan.moe/v4/anime/${randomAnime.mal_id}/full`,
          {
            timeout: 5000
          }
        );
        
        setAnime(detailsResponse.data.data);
        setRetryCount(0);
      } else {
        throw new Error('No anime found');
      }
    } catch (error) {
      console.error("Error fetching random anime:", error);
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(fetchRandomAnime, 2000); // Retry after 2 seconds
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Failed to fetch anime. Please try again later.',
          icon: 'error'
        });
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomAnime();

    // Cleanup function
    return () => {
      // Cancel any pending requests
      axios.CancelToken.source().cancel('Component unmounted');
    };
  }, []);

  const handleNewAnime = () => {
    setRetryCount(0);
    fetchRandomAnime();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="ml-3">Finding a cool anime for you...</p>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="bg-base-200 rounded-xl p-6 shadow-lg text-center h-64 flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-4">Couldn't load anime</h2>
        <button 
          onClick={handleNewAnime}
          className="btn btn-primary mx-auto"
        >
          <FaRedo className="mr-2" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-base-200 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaRandom /> Watch a Random Trailer
        </h2>
        <button 
          onClick={handleNewAnime}
          className="btn btn-sm btn-outline"
        >
          <FaRedo /> New Anime
        </button>
      </div>

      {anime && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <img
              src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
              alt={anime.title}
              className="w-full h-64 object-cover rounded-lg shadow"
            />
            <h3 className="text-xl font-semibold mt-3">{anime.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-3">
              {anime.synopsis || 'No synopsis available'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {anime.genres?.slice(0, 3).map(genre => (
                <span key={genre.mal_id} className="badge badge-primary">
                  {genre.name}
                </span>
              ))}
            </div>
            <button
              onClick={() => setShowTrailer(!showTrailer)}
              className="btn btn-primary mt-4 w-full"
            >
              <FaPlay className="mr-2" />
              {showTrailer ? 'Hide Trailer' : 'Show Trailer'}
            </button>
          </div>

          <div className="md:w-2/3">
            {showTrailer && (
              <div className="aspect-w-16 aspect-h-9">
                {anime.trailer?.embed_url ? (
                  <ReactPlayer
                    url={anime.trailer.embed_url}
                    width="100%"
                    height="400px"
                    controls={true}
                    className="rounded-lg overflow-hidden"
                  />
                ) : (
                  <div className="flex justify-center items-center h-64 bg-base-300 rounded-lg">
                    <p className="text-lg">No trailer available for this anime</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomTrailerBox;
