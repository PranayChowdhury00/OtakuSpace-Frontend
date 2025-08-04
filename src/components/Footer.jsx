import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaDiscord } from "react-icons/fa";
import { GiNinjaHead } from "react-icons/gi";

const Footer = () => {
  return (
    <footer className="bg-base-200 text-base-content mt-10 border-t border-base-300">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Logo & Description */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <GiNinjaHead className="text-3xl text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              OtakuSpace
            </span>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your ultimate anime companion — track, discover, and dive deep into the world of anime.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3 text-primary">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/trending" className="hover:underline">Trending</Link></li>
            <li><Link to="/watchlist" className="hover:underline">Watchlist</Link></li>
            <li><Link to="/recommendations" className="hover:underline">Recommendations</Link></li>
          </ul>
        </div>

        {/* Genres */}
        <div>
          <h3 className="font-semibold mb-3 text-primary">Genres</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/genre/action" className="hover:underline">Action</Link></li>
            <li><Link to="/genre/romance" className="hover:underline">Romance</Link></li>
            <li><Link to="/genre/comedy" className="hover:underline">Comedy</Link></li>
            <li><Link to="/genre/fantasy" className="hover:underline">Fantasy</Link></li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="font-semibold mb-3 text-primary">Connect With Us</h3>
          <div className="flex gap-4 text-xl">
            <a href="#" className="hover:text-primary"><FaFacebookF /></a>
            <a href="#" className="hover:text-primary"><FaTwitter /></a>
            <a href="#" className="hover:text-primary"><FaInstagram /></a>
            <a href="#" className="hover:text-primary"><FaDiscord /></a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="text-center py-4 border-t border-base-300 text-xs text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} OtakuSpace. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
