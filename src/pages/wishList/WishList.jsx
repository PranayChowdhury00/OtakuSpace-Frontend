import { useContext, useEffect, useState } from "react";
import axios from "axios";

import { FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/authContext";

const WishList = () => {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      axios
        .get(`http://localhost:5000/wishList/${user.email}`)
        .then((res) => {
          setWishlist(res.data);
          setLoading(false);
        })
        .catch((err) => console.error(err));
    }
  }, [user?.email]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This anime will be removed from your wishlist!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:5000/wishList/${id}`)
          .then(() => {
            setWishlist(wishlist.filter((item) => item._id !== id));
            Swal.fire("Deleted!", "Anime has been removed.", "success");
          })
          .catch((err) => {
            console.error(err);
            Swal.fire("Error", "Failed to delete anime.", "error");
          });
      }
    });
  };

  const toggleWatched = async (id) => {
  try {
    // Find the anime in wishlist
    const animeToMove = wishlist.find(item => item._id === id);
    
    // Prepare data for watchlist
    const watchlistItem = {
      animeId: animeToMove.animeId,
      title: animeToMove.title,
      image: animeToMove.image,
      rating: animeToMove.rating,
      episodes: animeToMove.episodes,
      userEmail: user.email,
      time: new Date().toISOString()
    };
    
    // Add to watchlist
    await axios.post('http://localhost:5000/watchList', watchlistItem);
    
    // Remove from wishlist
    await axios.delete(`http://localhost:5000/wishList/${id}`);
    
    // Update local state
    setWishlist(wishlist.filter(item => item._id !== id));
    
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Moved to Watchlist",
      showConfirmButton: false,
      timer: 1500
    });
  } catch (error) {
    console.error("Error moving to watchlist:", error);
    Swal.fire("Error", "Failed to move to watchlist", "error");
  }
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
      <h2 className="text-3xl font-bold mb-6 text-center">My Anime Wishlist 💖</h2>

      {wishlist.length === 0 ? (
        <p className="text-center text-gray-500">No items in wishlist yet.</p>
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
                <th>Status</th>
                <th>Watched</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {wishlist.map((anime, idx) => (
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
                  <td>{anime.rating || "?"}</td>
                  <td>
                    <span
                      className={`badge ${
                        anime.watched ? "badge-success" : "badge-warning"
                      }`}
                    >
                      {anime.watched ? "Watched" : "In Wishlist"}
                    </span>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={anime.watched || false}
                      onChange={() => toggleWatched(anime._id)}
                    />
                  </td>
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

export default WishList;
