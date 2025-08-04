import React, { useEffect, useState } from "react";
import AnimeCard from "../../components/AnimeCard";
import { 
  FaSpinner, 
  FaFilter, 
  FaTimes, 
  FaStar, 
  FaCalendarAlt, 
  FaListUl, 
  FaTh,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";
import { useSearchParams } from "react-router-dom";

const TrendingPage = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [pagination, setPagination] = useState({ 
    current_page: 1, 
    has_next_page: false 
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({ 
    genre: searchParams.get("genre") || "", 
    minScore: searchParams.get("minScore") || "", 
    year: searchParams.get("year") || "",
    status: searchParams.get("status") || "",
    type: searchParams.get("type") || ""
  });
  const [viewMode, setViewMode] = useState(
    localStorage.getItem("animeViewMode") || "grid"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [loadingGenres, setLoadingGenres] = useState(true);

  const currentPage = Number(searchParams.get("page")) || 1;

  // Fetch available genres from Jikan API
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("https://api.jikan.moe/v4/genres/anime");
        const data = await response.json();
        if (data.data) {
          setGenres(data.data);
        }
      } catch (error) {
        console.error("Error fetching genres:", error);
      } finally {
        setLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  // Fetch trending anime with filters
  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        let url = `https://api.jikan.moe/v4/anime?order_by=popularity&sort=desc&page=${currentPage}&sfw`;

        // Apply filters
        if (filters.minScore) url += `&min_score=${filters.minScore}`;
        if (filters.year) url += `&start_date=${filters.year}-01-01&end_date=${filters.year}-12-31`;
        if (filters.genre) url += `&genres=${filters.genre}`;
        if (filters.status) url += `&status=${filters.status}`;
        if (filters.type) url += `&type=${filters.type}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data?.data) {
          setAnimeList(data.data);
          setPagination(data.pagination);
        } else {
          setAnimeList([]);
        }
      } catch (error) {
        console.error("Error fetching trending anime:", error);
        setAnimeList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [currentPage, filters]);

  const handlePageChange = (newPage) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page: newPage });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = { ...Object.fromEntries(searchParams) };
    if (value) {
      params[key] = value;
    } else {
      delete params[key];
    }
    delete params.page; // Reset to page 1 when filters change
    setSearchParams(params);
  };

  const resetFilters = () => {
    setFilters({
      genre: "",
      minScore: "",
      year: "",
      status: "",
      type: ""
    });
    setSearchParams({});
  };

  const toggleViewMode = () => {
    const newMode = viewMode === "grid" ? "list" : "grid";
    setViewMode(newMode);
    localStorage.setItem("animeViewMode", newMode);
  };

  const animeStatuses = [
    { value: "airing", label: "Currently Airing" },
    { value: "complete", label: "Completed" },
    { value: "upcoming", label: "Upcoming" }
  ];

  const animeTypes = [
    { value: "tv", label: "TV" },
    { value: "movie", label: "Movie" },
    { value: "ova", label: "OVA" },
    { value: "special", label: "Special" },
    { value: "ona", label: "ONA" }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold"> Trending Anime</h1>
          <p className="text-gray-500">
            {pagination.items?.total ? `Showing ${animeList.length} of ${pagination.items.total} results` : "Discover popular anime"}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button 
            className="btn btn-sm btn-outline gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filters {showFilters ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          <button 
            className={`btn btn-sm gap-2 ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={toggleViewMode}
          >
            {viewMode === 'grid' ? <FaTh /> : <FaListUl />}
            {viewMode === 'grid' ? 'Grid' : 'List'}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-base-200 p-4 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <FaStar /> Min Score
                </span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                placeholder="e.g. 7"
                className="input input-bordered w-full"
                value={filters.minScore}
                onChange={(e) => handleFilterChange("minScore", e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <FaCalendarAlt /> Year
                </span>
              </label>
              <input
                type="number"
                min="1990"
                max={new Date().getFullYear() + 1}
                placeholder="e.g. 2023"
                className="input input-bordered w-full"
                value={filters.year}
                onChange={(e) => handleFilterChange("year", e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Genre</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={filters.genre}
                onChange={(e) => handleFilterChange("genre", e.target.value)}
              >
                <option value="">All Genres</option>
                {loadingGenres ? (
                  <option disabled>Loading genres...</option>
                ) : (
                  genres.map((genre) => (
                    <option key={genre.mal_id} value={genre.mal_id}>
                      {genre.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Statuses</option>
                {animeStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option value="">All Types</option>
                {animeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button 
              className="btn btn-sm btn-outline gap-2"
              onClick={resetFilters}
            >
              <FaTimes /> Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Anime Grid/List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <FaSpinner className="animate-spin text-4xl text-primary" />
          <p>Loading trending anime...</p>
        </div>
      ) : animeList.length > 0 ? (
        <div className={`${viewMode === "grid" 
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6" 
          : "space-y-4"}`}
        >
          {animeList.map((anime, index) => (
            <AnimeCard
              key={anime.mal_id}
              anime={anime}
              showRank={true}
              rank={(currentPage - 1) * 25 + index + 1}
              listView={viewMode === "list"}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your filters or search criteria
            </p>
            <button 
              className="btn btn-outline"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.has_next_page || currentPage > 1 ? (
        <div className="mt-10 flex justify-center gap-4">
          <button
            className="btn btn-outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
          <span className="flex items-center px-4">
            Page {currentPage}
          </span>
          <button
            className="btn btn-outline"
            disabled={!pagination.has_next_page}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
};

export default TrendingPage;