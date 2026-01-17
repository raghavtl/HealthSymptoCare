import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toastShownRef = useRef(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ SHOW REGISTRATION SUCCESS TOAST ONLY ONCE
  useEffect(() => {
    if (toastShownRef.current) return;

    const params = new URLSearchParams(location.search);
    const registered = params.get('registered');
    const emailParam = params.get('email');

    if (registered === 'true') {
      toastShownRef.current = true;

      toast.dismiss(); // 🔥 clear any existing toast

      toast.success('Registration successful! Please log in.', {
        autoClose: 500,
        pauseOnHover: false,
        draggable: false,
      });

      if (emailParam) setEmail(emailParam);

      // 🔥 Remove query params so it NEVER repeats
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter both email and password', {
        autoClose: 1500,
        pauseOnHover: false,
        draggable: false,
      });
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password, { remember: false });

      // ❌ DO NOT SHOW SUCCESS TOAST HERE
      // ✅ JUST NAVIGATE
      navigate('/dashboard', { replace: true });

    } catch (error) {
      let errorMessage = 'Login failed. Please check your credentials.';

      if (error?.response?.data?.message === 'Invalid credentials') {
        errorMessage = 'Incorrect email or password. Please try again.';
      }

      toast.error(errorMessage, {
        autoClose: 1500,
        pauseOnHover: false,
        draggable: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 mt-6">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span className="text-xl font-bold text-gray-800">
            Health Sympto Care
          </span>
        </div>
      </div>

      <div className="max-w-md mx-auto mt-6 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login to Your Account
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              className="shadow border rounded w-full py-2 px-3"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                className="shadow border rounded w-full py-2 px-3 pr-10"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-center mt-4 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default Login;
