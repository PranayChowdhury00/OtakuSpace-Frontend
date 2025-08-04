import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import axios from "axios";
import {
  FaRegHeart,
  FaSearch,
  FaHome,
  FaFire,
  FaList,
  FaThumbsUp,
} from "react-icons/fa";
import { GiNinjaHead } from "react-icons/gi";

const Navbar = () => {
  const { user, signOutUser } = useContext(AuthContext);
  const [wishListItems, setWishListItem] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user?.email) {
      axios
        .get(`http://localhost:5000/wishList/${user.email}`)
        .then((res) => setWishListItem(res.data.length))
        .catch((err) => console.error(err.message));
    }
  }, [user?.email]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setTimeout(() => {
        setIsSearching(false);
        searchInputRef.current?.blur();
      }, 500);
    }
  };

  const links = [
    { path: "/", name: "Home", icon: <FaHome className="mr-1" /> },
    { path: "/trending-page", name: "Trending", icon: <FaFire className="mr-1" /> },
    { path: "/watchlist", name: "Watchlist", icon: <FaList className="mr-1" /> },
    {
      path: "/recommendations",
      name: "Recommend",
      icon: <GiNinjaHead className="mr-1" />,
    },
    { path: "/vote", name: "Vote Now", icon: <FaThumbsUp className="mr-1" /> },

  ];

  return (
    <div className="navbar bg-base-100/80 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-primary/10">
      <div className="navbar-start">
        {/* Mobile menu toggle */}
        <div className="dropdown relative">
          <button
            aria-label="Toggle Mobile Menu"
            className="btn btn-ghost lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </button>

          {isMobileMenuOpen && (
            <ul className="menu absolute top-12 left-0 z-50 bg-base-100 p-3 shadow-md rounded-box w-64">
              

              {links.map((link) => (
                <li key={link.path} onClick={() => setIsMobileMenuOpen(false)}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      isActive ? "active text-primary font-semibold" : ""
                    }
                  >
                    {link.icon}
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Logo */}
        <Link to="/" className="btn btn-ghost hover:bg-transparent px-2">
          <img
            src="/OtakuSpaceLogo-removebg-preview.png"
            alt="OtakuSpace Logo"
            className="w-12 h-12 object-contain"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:block">
            OtakuSpace
          </span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          {links.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center ${
                    isActive ? "text-primary font-semibold" : ""
                  }`
                }
              >
                {link.icon}
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Search Bar for all sizes */}
      {/* Search Bar - Visible on all screen sizes */}
{![ "/login", "/signup"].includes(location.pathname) && (
  <div className="flex-1 mx-2">
    <form
      onSubmit={handleSearch}
      className="join w-full max-w-sm sm:max-w-md mx-auto"
    >
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search anime..."
        className="input input-bordered join-item w-[150px]"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button
        type="submit"
        className="btn btn-primary join-item"
        aria-label="Search"
        disabled={isSearching}
      >
        {isSearching ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          <FaSearch />
        )}
      </button>
    </form>
  </div>
)}


      {/* Right-side icons */}
      <div className="navbar-end gap-2">
        <Link to="/wishList" className="indicator">
          <span className="indicator-item badge badge-primary">
            {wishListItems > 0 ? wishListItems : 0}
          </span>
          <button className="btn btn-ghost btn-circle">
            <FaRegHeart className="text-xl" />
          </button>
        </Link>

        {/* Avatar & dropdown */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full ring-2 ring-primary/50 hover:ring-primary/80 transition-all">
              <img
                alt="User profile"
                src={
                  user?.photoURL ||
                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                }
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="mt-3 z-50 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
          >
            {user ? (
              <>
                <li className="menu-title">
                  <span>Hello, {user.displayName || "User"}!</span>
                </li>
                <li>
                  <Link to="/profile">Profile</Link>
                </li>
                <div className="divider my-1" />
                <li>
                  <button onClick={signOutUser} className="text-error">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login" className="text-primary font-medium">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
