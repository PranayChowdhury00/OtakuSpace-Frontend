import React, { useEffect, useState, useRef } from "react";
import { FaSearch, FaSpinner, FaExclamationTriangle, FaHistory, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import AnimeCard from "../../components/AnimeCard";
import axios from "axios";
import Swal from "sweetalert2";

const RecommendPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Sample queries from your database plus additional variations
  const commonQueries = [
    "I watched Naruto",
    "I watched One Piece",
    "I watched Bleach",
    "I watched Black Clover",
    "I watched Dragon Ball Z",
    "I watched My Hero Academia",
    "I watched Jujutsu Kaisen",
    "I watched Chainsaw Man",
    "I watched Fullmetal Alchemist",
    "I watched Sword Art Online",
    "I watched Death Note",
    "I watched Tokyo Ghoul",
    "I watched Attack on Titan",
    "I watched Demon Slayer",
    "I watched Mob Psycho 100",
    "I watched Akame ga Kill!",
    "I watched Elfen Lied",
    "I watched Seraph of the End",
    "I watched The Rising of the Shield Hero",
    "I watched Future Diary",
    // Additional variations
    "Anime like Naruto",
    "Similar to One Piece",
    "Shows like Attack on Titan",
    "Recommend me anime like Death Note",
    "What should I watch after Demon Slayer?",
    "Suggest me anime similar to Jujutsu Kaisen",
    "I enjoyed Fullmetal Alchemist, what next?",
    "More anime like Chainsaw Man",
    "Recommendations for fans of Tokyo Ghoul",
    "Anime similar to Sword Art Online"
  ];

  useEffect(() => {
    // Load saved history from localStorage
    const saved = localStorage.getItem("searchHistory");
    if (saved) setHistory(JSON.parse(saved));

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        fetchRecommendationsWithVariations(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        Swal.fire({
          icon: 'error',
          title: 'Voice Recognition Error',
          text: `Error: ${event.error}`,
        });
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
        Swal.fire({
          icon: 'error',
          title: 'Microphone Access Needed',
          text: 'Please allow microphone access to use voice search.',
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Voice Search Not Supported',
        text: 'Your browser does not support speech recognition. Try Chrome or Edge.',
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const fetchRecommendationsWithVariations = async (q) => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // Add history
      if (!history.includes(q)) {
        const updated = [q, ...history.slice(0, 4)];
        setHistory(updated);
        localStorage.setItem("searchHistory", JSON.stringify(updated));
      }

      // Try to find exact match first
      const aiResponse = await axios.post("http://localhost:5000/ai-recommend", { query: q });
      
      if (aiResponse.data?.length > 0) {
        setResults(aiResponse.data);
      } else {
        // If no exact match, try to extract anime title and search again
        const extractedTitle = extractAnimeTitle(q);
        if (extractedTitle) {
          const secondTry = await axios.post("http://localhost:5000/ai-recommend", { 
            query: `I watched ${extractedTitle}` 
          });
          
          if (secondTry.data?.length > 0) {
            setResults(secondTry.data);
          } else {
            // Fallback to Jikan API search
            const jikanResponse = await axios.get(
              `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(extractedTitle || q)}&limit=20`
            );
            setResults(jikanResponse.data.data);
          }
        } else {
          // Fallback to Jikan API search with original query
          const jikanResponse = await axios.get(
            `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=20`
          );
          setResults(jikanResponse.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching recommendations.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract anime title from various query formats
  const extractAnimeTitle = (query) => {
    // Patterns to match:
    // "I watched [Title]"
    // "Anime like [Title]"
    // "Similar to [Title]"
    // "Recommend me anime like [Title]"
    const patterns = [
      /(?:I watched|I've watched|I saw|I've seen)\s(.+)/i,
      /(?:anime like|similar to|shows like|recommend me anime like)\s(.+)/i,
      /(?:what should I watch after|more anime like|recommendations for fans of)\s(.+)/i,
      /(.+)\s(?:similar|recommendations|like)/i
    ];
    
    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        // Clean up the title (remove question marks, etc.)
        return match[1].replace(/[?.,!]/g, '').trim();
      }
    }
    
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) fetchRecommendationsWithVariations(query.trim());
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    fetchRecommendationsWithVariations(suggestion);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Anime Recommendations
      </h2>
      <p className="text-center text-gray-500 mb-8">
        Find your next favorite anime! Search by title or describe what you're looking for.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row items-center gap-4 mb-6"
      >
        <div className="relative w-full md:flex-1">
          <input
            type="text"
            placeholder="Try: 'I watched Naruto' or 'Anime like Attack on Titan'"
            className="input input-bordered w-full pr-12"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // Show suggestions based on input
              const input = e.target.value.toLowerCase();
              const filtered = commonQueries.filter(item =>
                item.toLowerCase().includes(input)
              );
              setSuggestions(filtered.slice(0, 5));
            }}
          />
          <button
            type="button"
            className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
            onClick={isListening ? stopListening : startListening}
            title={isListening ? "Stop listening" : "Voice search"}
          >
            {isListening ? (
              <FaMicrophoneSlash className="text-red-500 animate-pulse" />
            ) : (
              <FaMicrophone />
            )}
          </button>
        </div>
        <button className="btn btn-primary" type="submit">
          <FaSearch className="mr-2" /> Search
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="mb-4 bg-base-200 p-4 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 text-gray-600">Try these:</h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(sug)}
                className="badge badge-outline hover:badge-secondary cursor-pointer transition-all"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mb-6 bg-base-200 p-4 rounded-lg">
          <h4 className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-600">
            <FaHistory /> Recent Searches
          </h4>
          <div className="flex flex-wrap gap-2">
            {history.map((item, idx) => (
              <button
                key={idx}
                className="badge badge-secondary hover:badge-primary cursor-pointer"
                onClick={() => handleSuggestionClick(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center mt-10 gap-4">
          <FaSpinner className="animate-spin text-4xl text-primary" />
          <p className="text-gray-500">Finding the perfect recommendations...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error shadow-lg">
          <div>
            <FaExclamationTriangle /> 
            <span>{error}</span>
          </div>
        </div>
      ) : results.length > 0 ? (
        <>
          <h3 className="text-xl font-semibold mb-4">
            {results.length} {results.length === 1 ? 'Recommendation' : 'Recommendations'} Found
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {results.map((anime) => (
              <AnimeCard 
                key={anime.mal_id || anime._id} 
                anime={anime} 
                className="hover:scale-105 transition-transform duration-200"
              />
            ))}
          </div>
        </>
      ) : query ? (
        <div className="text-center py-10">
          <p className="text-gray-400 mb-4">No recommendations found for "{query}"</p>
          <button 
            className="btn btn-outline"
            onClick={() => {
              const randomQuery = commonQueries[Math.floor(Math.random() * commonQueries.length)];
              setQuery(randomQuery);
              fetchRecommendationsWithVariations(randomQuery);
            }}
          >
            Try a random search
          </button>
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2">How to use:</h3>
            <ul className="text-left list-disc pl-5 space-y-2 text-gray-600 mb-6">
              <li>Search by anime title ("I watched Naruto")</li>
              <li>Ask for similar anime ("Like Attack on Titan")</li>
              <li>Describe what you want ("Dark psychological thriller")</li>
              <li>Try voice search for hands-free searching</li>
            </ul>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                className="btn btn-outline"
                onClick={() => {
                  const randomQuery = commonQueries[Math.floor(Math.random() * commonQueries.length)];
                  setQuery(randomQuery);
                  fetchRecommendationsWithVariations(randomQuery);
                }}
              >
                I'm feeling lucky
              </button>
              <button
                className="btn btn-primary gap-2"
                onClick={startListening}
                disabled={isListening}
              >
                <FaMicrophone /> Voice Search
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RecommendPage;