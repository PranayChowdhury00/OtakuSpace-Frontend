# 🌌 OtakuSpace - Anime Discovery Platform

**OtakuSpace** is a modern, AI-powered anime discovery platform designed for true fans. From trending anime to personalized recommendations, OtakuSpace brings the anime universe to your fingertips.

![OtakuSpace Banner pc](https://github.com/PranayChowdhury00/OtakuSpace-Frontend/blob/main/forPc.png?raw=true)

[OtakuSpace Banner mobile](https://github.com/PranayChowdhury00/OtakuSpace-Frontend/blob/main/forMobile.png?raw=true)

---

## 🚀 Live Preview

🔗 [Visit OtakuSpace Now](https://your-live-site-link.com)

---

## ✨ Features

- 🎬 **Trending Now** – Real-time updates from Jikan API by popularity
- 🧠 **AI-Powered Recommendations** – Smart suggestions using MongoDB & custom queries
- 🗳️ **Community Picks** – Vote for your favorite anime, ranked live
- 🕒 **Recently Released Episodes** – Timeline of latest releases
- 🏆 **Top Rated Anime** – Display highest-rated gems
- 🔍 **Smart Search** – Auto-suggestions, search history, and fallback logic
- 📚 **News Feed** – Anime news parsed from ANN RSS (with image extraction)
- ❤️ **Wishlist & Watchlist** – Save your must-watch list
- 📱 **Responsive & Dark Mode** – Optimized for every screen

---

## 📦 Tech Stack

| Tech          | Use                            |
|---------------|---------------------------------|
| `React 19`    | Frontend UI                    |
| `Vite`        | Lightning-fast dev environment |
| `TailwindCSS` | Styling (with DaisyUI plugin)  |
| `Swiper.js`   | Hero slider                    |
| `Axios`       | API calls                      |
| `Firebase`    | Authentication (optional)      |
| `MongoDB`     | Backend database               |
| `Express.js`  | Server-side routes             |
| `Jikan API`   | Anime data source              |
| `SweetAlert2` | Alerts & confirmations         |
| `AOS`         | Scroll animations              |

---

## git bash
git clone https://github.com/PranayChowdhury00/OtakuSpace-Frontend.git
cd otakuspace-frontend
npm install
npm run dev

## AI Recommendation Logic
User types a natural query:
"I watched Naruto, what next?"
Server searches MongoDB recommendations collection
If match found → return custom suggestions
If not → fallback to Jikan search API

## 💻 Contributors
Made with  by Pranay Chowdhury 


📜 License
MIT License © 2025 OtakuSpace

## 📁 Project Structure

