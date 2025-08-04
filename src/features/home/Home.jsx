
import AnimeCharacterQuiz from './AnimeCharacterQuiz';
import AnimeNews from './AnimeNews';
import BrowseByGenres from './BrowseByGenres';
import FeaturedAnimeBanner from './FeaturedAnimeBanner';
import LatestReleases from './LatestReleases';
import RandomTrailerBox from './RandomTrailerBox';
import RecommendedByFans from './RecommendedByFans';
import TopRatedAnime from './TopRatedAnime';
import TrendingSection from './TrendingSection';

const Home = () => {
 return (
  <div>
   <FeaturedAnimeBanner></FeaturedAnimeBanner>
   <TrendingSection></TrendingSection>
   <LatestReleases></LatestReleases>
   <TopRatedAnime></TopRatedAnime>
   <AnimeNews></AnimeNews>
   <BrowseByGenres></BrowseByGenres>
   <RecommendedByFans></RecommendedByFans>
   <RandomTrailerBox></RandomTrailerBox>
   <AnimeCharacterQuiz></AnimeCharacterQuiz>
  </div>
 );
};

export default Home;