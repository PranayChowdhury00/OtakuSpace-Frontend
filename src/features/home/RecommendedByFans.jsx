
import React, { useEffect, useState, useContext } from "react";

import axios from "axios";
import { FaThumbsUp } from "react-icons/fa";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/authContext";

const RecommendedByFans = () => {
  const [animeList, setAnimeList] = useState([]);
  const { user } = useContext(AuthContext);

useEffect(() => {
  axios
    .get("http://localhost:5000/top-voted")
    .then((res) => setAnimeList(res.data))
    .catch((err) => console.error(err));
}, []);

  const handleVote = (anime) => {
    if (!user?.email) {
      return Swal.fire("Login Required", "Please login to vote.", "warning");
    }

    const voteData = {
      animeId: anime.animeId,
      title: anime.title,
      image: anime.image,
      userEmail: user.email
    };

    axios.post("http://localhost:5000/community/vote", voteData).then((res) => {
      Swal.fire("Voted!", "Thanks for your vote 💖", "success");
    });
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-6">🎌 Recommended by Fans</h2>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {animeList?.map((anime) => (
          <div
            key={anime.animeId}
            className="bg-base-100 border border-base-200 rounded-xl shadow hover:shadow-lg transition-all"
          >
            <img
              src={anime.image}
              alt={anime.title}
              className="w-full h-48 object-cover rounded-t-xl"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{anime.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-gray-400">Votes: {anime.votes || 0}</p>
                <button
                  className="btn btn-sm btn-outline btn-primary"
                  onClick={() => handleVote(anime)}
                >
                  <FaThumbsUp className="mr-1" /> Vote
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedByFans;
