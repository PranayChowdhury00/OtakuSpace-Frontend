import React, { useEffect, useState } from "react";
import { FaNewspaper, FaCalendarAlt, FaExternalLinkAlt, FaSpinner } from "react-icons/fa";
import { Link } from "react-router-dom";

const AnimeNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:5000/api/news');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        setNews(data);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError(err.message);
        // Fallback to dummy data if API fails
        setNews(getDummyNews());
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  console.log(news)

  const getDummyNews = () => [
    {
      id: 1,
      title: "Demon Slayer: Hashira Training Arc Anime Announced",
      summary: "Ufotable returns to animate the next arc of the hit series, premiering Spring 2024.",
      date: new Date().toISOString(),
      source: "AnimeNewsNetwork",
      url: "#",
      image: "https://via.placeholder.com/300x200/4a148c/ffffff?text=Demon+Slayer"
    },
    // Add more dummy items as needed
  ];

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
          <FaNewspaper className="mr-2 text-primary" /> Anime News & Updates
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-base-200 rounded-lg h-80 animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  if (error && news.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
          <FaNewspaper className="mr-2 text-primary" /> Anime News & Updates
        </h2>
        <div className="alert alert-error">
          <span>Error loading news: {error}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center">
          <FaNewspaper className="mr-2 text-primary" /> Anime News & Updates
        </h2>
        
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {news.map((item) => (
          <div 
            key={item.id} 
            className="bg-base-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-base-200"
          >
            <div className="relative h-40">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Multiple fallback strategies
                  e.target.src = "https://www.animenewsnetwork.com/images/ann.ico";
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.className = "w-full h-full object-contain p-4 bg-gray-100";
                }}
                />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="flex items-center text-xs text-white">
                  <FaCalendarAlt className="mr-1" />
                  {new Date(item.date).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{item.summary}</p>
              <div className="flex justify-between items-center">
                <span className="badge badge-outline">{item.source}</span>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-xs btn-ghost"
                >
                  Read <FaExternalLinkAlt className="ml-1" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AnimeNews;