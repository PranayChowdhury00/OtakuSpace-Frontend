import  { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Page404 = () => {
  const [countdown, setCountdown] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000); 

    const timer = setTimeout(() => {
      navigate("/"); 
    }, 8000); 

    return () => {
      clearInterval(interval); 
      clearTimeout(timer); 
    };
  }, [navigate]);

  return (
    <section className="flex items-center h-screen p-16 bg-white text-gray-800">
      <div className="container flex flex-col items-center justify-center px-5 mx-auto my-8">
        <div
          className="w-64 h-64 bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url("https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif")`,
          }}
        ></div>
        <div className="text-center">
          <h1 className="text-6xl font-bold">404</h1>
          <h2 className="text-2xl mt-4">Look like you're lost</h2>
          <p className="mt-2 text-gray-600 mb-5">
            The page you are looking for is not available!
          </p>
          <p className="mt-2 text-gray-600 mb-5">
            Redirecting to the home page in{" "}
            <span className="font-bold text-green-600">{countdown}</span>{" "}
            seconds...
          </p>
          <Link
            to="/"
            className="mt-6 px-6 py-2 text-white bg-green-600 rounded-lg shadow hover:bg-green-700 focus:outline-none"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Page404;
