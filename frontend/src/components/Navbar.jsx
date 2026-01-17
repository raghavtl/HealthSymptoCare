import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAdmin } = useAuth();
  const dropdownRef = React.useRef(null);

  // Global dark mode state and handlers
  const [darkMode, setDarkMode] = useState(false);
  // Always start light; only go dark after user clicks
  useEffect(() => {
    setDarkMode(false);
    setTimeout(() => document.documentElement.classList.remove('dark'), 1);
  }, []);
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    // Apply with a tiny delay for a smooth feel
    setTimeout(() => {
      document.documentElement.classList.toggle('dark', next);
      window.dispatchEvent(new CustomEvent('themechange', { detail: { dark: next } }));
    }, 1);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMenuOpen(false);
  };
  
  // Main navigation links
  const mainNavLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Symptom Checker', path: '/symptom-checker' },
    { name: 'Nearby Hospitals', path: '/nearby-hospitals' },
    { name: 'Wellness Logger', path: '/wellness-logger' },
    { name: 'Dashboard', path: '/dashboard' }
  ];
  
  // Additional links for dropdown menu
  const baseDropdownLinks = [
    { name: 'Health Conditions', path: '/health-conditions' },
    { name: 'HealthSage', path: '/health-tips' },
    { name: 'Diet & Fitness', path: '/diet-fitness' },
    { name: 'De-stress Zone', path: '/de-stress' }
  ];
  const dropdownLinks = React.useMemo(() => {
    const links = [...baseDropdownLinks];
    if (currentUser) links.push({ name: 'User Profile', path: '/profile' });
    return links;
  }, [currentUser]);
  
  // State for dropdown menu
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
<nav className="bg-gradient-to-b from-white to-sky-50 dark:from-gray-900 dark:to-gray-900 border-b border-slate-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Link to="/home" className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span className="text-xl font-bold text-gray-800 dark:text-gray-100">HealthSymptoCare</span>
            </Link>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4 items-center">
            {mainNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-sky-600' : 'text-slate-700 dark:text-gray-300 hover:text-sky-600'}`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={toggleDropdown}
className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-gray-300 hover:text-sky-600 flex items-center transition-colors"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                More {isDropdownOpen ? '▲' : '▼'}
              </button>
              
              {isDropdownOpen && (
                <div 
className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 z-10 border border-slate-200 dark:border-gray-700"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {dropdownLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
className={`block px-4 py-2 text-sm transition-colors ${location.pathname === link.path ? 'text-sky-600 font-medium' : 'text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700'}`}
                      onClick={() => setIsDropdownOpen(false)}
                      role="menuitem"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {currentUser ? (
              <div className="flex items-center space-x-4">
                {isAdmin() && (
                  <Link
                    to="/admin"
className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-white hover:text-sky-600 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
className="px-4 py-2 rounded-md bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
className="px-4 py-2 rounded-md border border-sky-600 text-sky-600 text-sm font-medium hover:bg-sky-600 hover:text-white transition-colors duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 dark:text-gray-300 hover:text-primary focus:outline-none transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {/* Main Navigation Links */}
              {mainNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === link.path ? 'bg-sky-600 text-white' : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Dropdown Section Header */}
              <div className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                More Options
              </div>
              
              {/* Dropdown Links */}
              {dropdownLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === link.path ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {currentUser ? (
                <>
                  {isAdmin() && (
                    <Link
                      to="/admin"
className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-white">
                    Logged in as: {currentUser.username || currentUser.name || currentUser.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600 mx-3 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
className="px-3 py-2 rounded-md text-sm font-medium bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
className="px-3 py-2 rounded-md text-sm font-medium border border-sky-600 text-sky-600 hover:bg-sky-600 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;