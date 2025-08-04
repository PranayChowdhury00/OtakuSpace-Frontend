// src/pages/WatchList.jsx
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/authContext";


const WatchList = () => {
  const { user } = useContext(AuthContext);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchWatchlist();
    }
  }, [user?.email]);

  const fetchWatchlist = () => {
    axios
      .get(`http://localhost:5000/watchList/${user.email}`)
      .then((res) => {
        // Sort by time added (newest first)
        const sorted = res.data.sort((a, b) => new Date(b.time) - new Date(a.time));
        setWatchlist(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This anime will be removed from your watchlist!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:5000/watchList/${id}`)
          .then(() => {
            setWatchlist(watchlist.filter((item) => item._id !== id));
            Swal.fire("Deleted!", "Anime has been removed.", "success");
          })
          .catch((err) => {
            console.error(err);
            Swal.fire("Error", "Failed to delete anime.", "error");
          });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">My Anime Watchlist 👀</h2>

      {watchlist.length === 0 ? (
        <p className="text-center text-gray-500">No items in watchlist yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full border border-base-300">
            <thead className="bg-base-200 text-base font-semibold text-gray-700">
              <tr>
                <th>#</th>
                <th>Poster</th>
                <th>Title</th>
                <th>Episodes</th>
                <th>Rating</th>
                <th>Added On</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((anime, idx) => (
                <tr key={anime._id}>
                  <td>{idx + 1}</td>
                  <td>
                    <img
                      src={anime.image}
                      alt={anime.title}
                      className="w-16 h-24 object-cover rounded-md"
                    />
                  </td>
                  <td className="font-semibold">{anime.title}</td>
                  <td>{anime.episodes || "?"}</td>
                  <td>{anime.rating?.toFixed(2) || "N/A"}</td>
                  <td>{new Date(anime.time).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(anime._id)}
                      className="btn btn-sm btn-error text-white"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WatchList;