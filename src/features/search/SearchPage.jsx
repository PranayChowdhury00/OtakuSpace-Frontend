
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import AnimeCard from "../../components/AnimeCard";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [animeResults, setAnimeResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      setLoading(true);
      axios
        .get(`https://api.jikan.moe/v4/anime?q=${query}&limit=12`)
        .then((res) => {
          setAnimeResults(res.data.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [query]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Search results for: "{query}"</h2>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : animeResults.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {animeResults.map((anime) => (
            <AnimeCard key={anime.mal_id} anime={anime} />
          ))}
        </div>
      ) : (
        <p>No anime found.</p>
      )}
    </div>
  );
};

export default SearchPage;
