import React from "react";
import { Link } from "react-router-dom";

const BrowseByGenres = () => {
  const genres = [
    { name: "Action", icon: "⚔️", color: "bg-red-500 hover:bg-red-600" },
    { name: "Adventure", icon: "🗺️", color: "bg-blue-500 hover:bg-blue-600" },
    { name: "Comedy", icon: "😂", color: "bg-yellow-500 hover:bg-yellow-600" },
    { name: "Drama", icon: "🎭", color: "bg-purple-500 hover:bg-purple-600" },
    { name: "Fantasy", icon: "🦄", color: "bg-indigo-500 hover:bg-indigo-600" },
    { name: "Horror", icon: "👻", color: "bg-gray-800 hover:bg-gray-900" },
    { name: "Mystery", icon: "🔍", color: "bg-teal-500 hover:bg-teal-600" },
    { name: "Romance", icon: "💖", color: "bg-pink-500 hover:bg-pink-600" },
    { name: "Sci-Fi", icon: "🚀", color: "bg-green-500 hover:bg-green-600" },
    {
      name: "Slice of Life",
      icon: "☕",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    { name: "Sports", icon: "🏀", color: "bg-amber-500 hover:bg-amber-600" },
    {
      name: "Supernatural",
      icon: "✨",
      color: "bg-violet-500 hover:bg-violet-600",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Browse By Genres
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover anime by your favorite genres
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {genres.map((genre) => (
          // Change the Link component to point to the new route
          <Link
            key={genre.name}
            to={`/anime/genre/${genre.name.toLowerCase()}`}
            className={`${genre.color} text-white rounded-xl p-6 flex flex-col items-center justify-center aspect-square transition-all transform hover:scale-105 shadow-lg hover:shadow-xl`}
          >
            <span className="text-3xl mb-2">{genre.icon}</span>
            <h3 className="font-bold text-lg text-center">{genre.name}</h3>
          </Link>
        ))}
      </div>

      
    </section>
  );
};

export default BrowseByGenres;
