import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaHeart, FaSpinner, FaFilter, FaSync } from 'react-icons/fa';
import { GiSwordman, GiLoveSong, GiTheater, GiBookshelf } from 'react-icons/gi';
import axios from 'axios';


const axiosInstance = axios.create();
let lastRequestTime = 0;

// Request interceptor for throttling
axiosInstance.interceptors.request.use(async (config) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < 1000) {
    await new Promise(resolve => 
      setTimeout(resolve, 1000 - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
  return config;
});

// Response interceptor for retry
axiosInstance.interceptors.response.use(null, async (error) => {
  const config = error.config;
  if (error.response?.status === 429 && !config.__isRetry) {
    config.__isRetry = true;
    await new Promise(resolve => setTimeout(resolve, 2000));
    return axiosInstance(config);
  }
  return Promise.reject(error);
});


const getCachedData = (key) => {
  try {
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return null;
    
    const { data, timestamp } = JSON.parse(cachedData);
    // Check if data is older than 24 hours
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return null;
  }
};

const isStorageAvailable = () => {
  try {
    const testKey = 'test';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

const setCachedData = (key, data) => {
  if (!isStorageAvailable()) return;
  
  try {
    // Check current storage usage
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      totalSize += key.length + value.length;
    }
    
    // If storage is getting full (5MB limit), clear oldest 25% of items
    if (totalSize > 4 * 1024 * 1024) {
      const allKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        allKeys.push(localStorage.key(i));
      }
      
      // Get items with timestamps
      const itemsWithTime = allKeys
        .map(key => {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            return { key, timestamp: item.timestamp };
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      
      // Sort by oldest first
      itemsWithTime.sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove oldest 25%
      const toRemove = Math.ceil(itemsWithTime.length * 0.25);
      itemsWithTime.slice(0, toRemove).forEach(item => {
        localStorage.removeItem(item.key);
      });
    }
    
    // Now store the new item
    const cacheItem = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error writing to localStorage', error);
  }
};

const GenreDetailsPage = () => {
  const { genreName } = useParams();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [sortBy, setSortBy] = useState('popularity');
  const [genreStats, setGenreStats] = useState(null);
  const [relatedGenres, setRelatedGenres] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Genre metadata
  const genreMetadata = {
    action: { icon: <GiSwordman className="text-4xl" />, color: "bg-red-500" },
    adventure: { icon: "🗺️", color: "bg-blue-500" },
    comedy: { icon: <GiTheater className="text-4xl" />, color: "bg-yellow-500" },
    romance: { icon: <GiLoveSong className="text-4xl" />, color: "bg-pink-500" },
    fantasy: { icon: <GiBookshelf className="text-4xl" />, color: "bg-indigo-500" },
  };

  const currentGenre = genreMetadata[genreName] || {
    icon: "🎬",
    color: "bg-gray-500"
  };

  // Fetch genre data
  const fetchGenreData = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Create cache keys based on the request parameters
      const genresCacheKey = `jikan-genres-${genreName}`;
      const animeCacheKey = `jikan-anime-${genreName}-${page}-${sortBy}`;
      
      // Try to get cached data first
      const cachedGenres = getCachedData(genresCacheKey);
      const cachedAnime = getCachedData(animeCacheKey);
      
      let genresRes, animeRes;
      
      // 1. Get genre ID and stats (with cache)
      if (cachedGenres) {
        genresRes = { data: { data: cachedGenres } };
      } else {
        genresRes = await axiosInstance.get('https://api.jikan.moe/v4/genres/anime');
        setCachedData(genresCacheKey, genresRes.data.data);
      }
      
      const genre = genresRes.data.data.find(g => g.name.toLowerCase() === genreName.toLowerCase());
      if (!genre) throw new Error('Genre not found');
      
      // 2. Get anime by genre (with cache)
      if (cachedAnime) {
        animeRes = { data: cachedAnime };
      } else {
        animeRes = await axiosInstance.get(
          `https://api.jikan.moe/v4/anime?genres=${genre.mal_id}&page=${page}&order_by=${sortBy}`
        );
        setCachedData(animeCacheKey, animeRes.data);
      }
      
      // 3. Calculate stats
      const validScores = animeRes.data.data.filter(a => a.score).map(a => a.score);
      const averageScore = validScores.length > 0 
        ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
        : null;

      setGenreStats({
        count: genre.count,
        averageScore,
        malId: genre.mal_id
      });

      // 4. Get related genres (genres that often appear together)
      const related = genresRes.data.data
        .filter(g => g.mal_id !== genre.mal_id)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      setRelatedGenres(related);
      setAnimeList(prev => [...prev, ...animeRes.data.data]);
      setHasNextPage(animeRes.data.pagination.has_next_page);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [genreName, page, sortBy]);

  useEffect(() => {
    fetchGenreData();
  }, [genreName, page, sortBy, fetchGenreData]);

  // Add to favorites
  const addToFavorites = async (animeId) => {
    try {
      await axios.post('/api/wishList', {
        animeId,
        userId: 'current-user-id', // Replace with actual user ID
        watched: false
      });
      setFavorites(prev => [...prev, animeId]);
    } catch (err) {
      console.error('Error adding to favorites:', err);
    }
  };

  // Sort options
  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'score', label: 'Highest Rated' },
    { value: 'aired_from', label: 'Newest' },
    { value: 'aired_to', label: 'Oldest' }
  ];

  const refreshData = () => {
    // Clear cache for this genre and reload
    const genresCacheKey = `jikan-genres-${genreName}`;
    const animeCacheKey = `jikan-anime-${genreName}-${page}-${sortBy}`;
    localStorage.removeItem(genresCacheKey);
    localStorage.removeItem(animeCacheKey);
    setAnimeList([]);
    setPage(1);
    fetchGenreData();
  };

  if (error) {
    const isRateLimit = error.message?.includes('429');
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>
            {isRateLimit 
              ? "We're loading data too quickly. Please wait a moment and try again." 
              : `Error: ${error}`}
          </span>
          {isRateLimit && (
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-sm btn-ghost mt-2"
            >
              Retry Now
            </button>
          )}
        </div>
        <Link to="/" className="btn btn-primary mt-4">
          Back to Genres
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Genre Header */}
      <div className={`${currentGenre.color} text-white rounded-xl p-6 mb-8 shadow-lg`}>
        <div className="flex flex-col md:flex-row items-center">
          <div className="mb-4 md:mb-0 md:mr-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-black bg-opacity-30">
              {currentGenre.icon}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl md:text-4xl font-bold capitalize mb-2">
                {genreName} Anime
              </h1>
              <button 
                onClick={refreshData}
                className="btn btn-sm btn-outline btn-neutral"
                title="Refresh data"
              >
                <FaSync />
              </button>
            </div>
            {genreStats && (
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="badge badge-lg badge-neutral">
                  {genreStats.count}+ Titles
                </div>
                {genreStats.averageScore && (
                  <div className="badge badge-lg badge-neutral">
                    Avg. Score: {genreStats.averageScore}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Link to="/" className="btn btn-ghost">
          <FaArrowLeft className="mr-2" /> All Genres
        </Link>
        
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-500" />
          <select 
            className="select select-bordered"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
              setAnimeList([]);
            }}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Related Genres */}
      {relatedGenres.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Related Genres</h3>
          <div className="flex flex-wrap gap-2">
            {relatedGenres.map(genre => (
              <Link
                key={genre.mal_id}
                to={`/anime/genre/${genre.name.toLowerCase()}`}
                className="badge badge-outline hover:badge-primary transition-all"
              >
                {genre.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Anime Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {animeList.map(anime => (
          <div key={anime.mal_id} className="bg-base-100 rounded-lg shadow hover:shadow-xl transition-shadow">
            <Link to={`/anime/${anime.mal_id}`} className="block">
              <div className="relative pt-[140%]">
                <img 
                  src={anime.images?.jpg?.image_url} 
                  alt={anime.title}
                  className="absolute top-0 left-0 w-full h-full object-cover rounded-t-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/210x295/333/ccc/?text=No+Image';
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                  <div className="flex items-center text-white text-sm">
                    <FaStar className="text-yellow-400 mr-1" />
                    {anime.score || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium line-clamp-2">{anime.title}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="badge badge-sm">
                    {anime.type || 'Unknown'}
                  </span>
                  <button 
                    className={`btn btn-xs btn-circle ${favorites.includes(anime.mal_id) ? 'btn-error' : 'btn-ghost'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      addToFavorites(anime.mal_id);
                    }}
                  >
                    <FaHeart />
                  </button>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Loading and Load More */}
      {loading && (
        <div className="flex justify-center my-8">
          <FaSpinner className="animate-spin text-4xl text-primary" />
        </div>
      )}

      {!loading && hasNextPage && (
        <div className="text-center mt-6">
          <button 
            onClick={() => setPage(p => p + 1)}
            className="btn btn-primary"
            disabled={loading}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default GenreDetailsPage;