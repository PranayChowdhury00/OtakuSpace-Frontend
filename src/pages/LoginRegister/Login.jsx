import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import Swal from 'sweetalert2';
import { AuthContext } from "../../context/authContext";
import axios from "axios";

const Login = () => {
  const { signInUser, googleSignIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInUser(formData.email, formData.password);
      
      await Swal.fire({
        title: 'Welcome back!',
        text: 'You have successfully logged in.',
        icon: 'success',
        confirmButtonText: 'Continue'
      });
      
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      
      Swal.fire({
        title: 'Login Failed',
        text: err.message || 'Invalid email or password. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      
      const result = await googleSignIn();
      const user = result.user;

      // Check if user exists in database
      try {
        const response = await axios.get(`http://localhost:5000/users/${user.uid}`);
        
        // User exists, just log them in
        if (response.data) {
          await Swal.fire({
            title: 'Welcome back!',
            text: 'You have successfully logged in with Google.',
            icon: 'success',
            confirmButtonText: 'Continue'
          });
          navigate("/");
          return;
        }
      } catch (err) {
        // If 404 error (user not found), create new user
        if (err.response?.status === 404) {
          await axios.post("http://localhost:5000/users", {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL || null,
            role: "customer",
          });
        } else {
          throw err;
        }
      }

      await Swal.fire({
        title: 'Welcome!',
        text: 'Your account has been created successfully with Google.',
        icon: 'success',
        confirmButtonText: 'Continue'
      });
      
      navigate("/");
    } catch (err) {
      setError(err.message || "Google login failed. Please try again.");
      
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Google login failed. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h2>
        
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 mb-6"
        >
          <FcGoogle className="text-xl" />
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center mb-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
          <p className="text-gray-600">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;