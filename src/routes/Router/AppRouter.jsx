import {
  createBrowserRouter,
} from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import Page404 from "../../pages/Page404/Page404";
import Home from "../../features/home/Home";
import Login from "../../pages/LoginRegister/Login";
import Register from "../../pages/LoginRegister/Register";
import ForgotPassword from "../../pages/LoginRegister/ForgotPassword";
import SearchPage from "../../features/search/SearchPage";
import AnimeDetails from "../../pages/AnimeDetails/AnimeDetails";
import WishList from "../../pages/wishList/WishList";
import GenreDetailsPage from "../../features/home/GenreDetailsPage";
import VoteNow from "../../features/home/VoteNow";
import WatchList from "../../pages/WatchList/WatchList";
import TrendingPage from "../../pages/TrendingPage/TrendingPage";
import RecommendPage from "../../pages/RecommendPage/RecommendPage";

const router = createBrowserRouter([
  {
    path:'*',
    element:<Page404></Page404>
  },
  {
    path: "/",
    element:<MainLayout></MainLayout>,
    children:[
      {
        path:'/',
        element:<Home></Home>
      },
      {
        path:'/login',
        element:<Login></Login>
      },
      {
        path:'/register',
        element:<Register></Register>
      },
      {
        path:'/forgot-password',
        element:<ForgotPassword></ForgotPassword>
      },
      {
        path:'/search',
        element:<SearchPage></SearchPage>
      },
      {
        path:"/anime/:id",
        element:<AnimeDetails></AnimeDetails>
      },
      {
        path:'/wishList',
        element:<WishList></WishList>
      },
      {
        path:"/anime/genre/:genreName",
        element:<GenreDetailsPage></GenreDetailsPage>
      },
      {
        path:'/vote',
        element:<VoteNow></VoteNow>
      },
      {
        path:'/watchlist',
        element:<WatchList></WatchList>
      },
      {
        path:'/trending-page',
        element:<TrendingPage></TrendingPage>
      },
      {
        path:'/recommendations',
        element:<RecommendPage></RecommendPage>
      }
    ]
  },
]);

export default router;