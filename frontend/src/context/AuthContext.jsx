import React, { createContext, useContext, useEffect, useState } from 'react';
import { usersApi } from '../services/api';

// Create the auth context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authReady, setAuthReady] = useState(false); // true once we've rehydrated from storage

  // Initialize auth state from storage on mount (supports localStorage and sessionStorage)
  useEffect(() => {
    (async () => {
      try {
        // Prefer sessionStorage (non-persistent) for login-first UX
        const sessionUser = sessionStorage.getItem('user');
        const sessionToken = sessionStorage.getItem('token');
        const localUser = localStorage.getItem('user');
        const localToken = localStorage.getItem('token');
        const remember = localStorage.getItem('remember') === 'true';

        // If a local token exists but user didn't opt in to remember, clear it
        if ((localUser || localToken) && !remember) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }

        const storedUser = sessionUser || localUser;
        const token = sessionToken || (remember ? localToken : null);
        if (storedUser && token) {
          try {
            const parsed = JSON.parse(storedUser);
            // Optimistically set, then verify with backend
            setCurrentUser(parsed);
            try {
              const res = await usersApi.getProfile(parsed.id);
              if (!res?.data?.id) throw new Error('Invalid profile');
              // Verified
              console.log('Session verified with server for', parsed.username);
            } catch (verifyErr) {
              console.warn('Token verification failed, clearing session');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              sessionStorage.removeItem('token');
              sessionStorage.removeItem('user');
              setCurrentUser(null);
            }
          } catch (e) {
            console.error('Error parsing stored user data:', e);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('token');
          }
        } else {
          console.log('No authenticated user found in storage');
        }
      } finally {
        setAuthReady(true);
      }
    })();
  }, []);

  // Real login function
  const login = async (email, password, { remember = false } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.login({ email, password });
      const { token, user } = response.data;
      // Persist (remember=true -> localStorage, else sessionStorage)
      const store = remember ? localStorage : sessionStorage;
      store.setItem('token', token);
      store.setItem('user', JSON.stringify(user));
      if (remember) {
        localStorage.setItem('remember', 'true');
      } else {
        localStorage.removeItem('remember');
      }
      // Always clear the other store to avoid conflicts
      (remember ? sessionStorage : localStorage).removeItem('token');
      (remember ? sessionStorage : localStorage).removeItem('user');
      setCurrentUser(user);
      return user;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mock logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('remember');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Registration function
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      console.log('AuthContext: Sending registration request');
      const response = await usersApi.register({ username, email, password });
      console.log('AuthContext: Registration response received:', response);
      
      // Ensure we have a valid response with user data
      if (response && response.data) {
        // Format the response to include user object if it's not already there
        // This ensures consistent response format for the Register component
        if (!response.data.user && response.data.id) {
          // If the API returns user data directly instead of nested in a user object
          return {
            user: response.data,
            message: response.data.message || 'Registration successful!'
          };
        }
        return response.data;
      } else {
        throw new Error('Invalid response format from registration API');
      }
    } catch (err) {
      console.error('AuthContext: Registration error:', err);
      if (err.response) {
        console.error('AuthContext: Server response error:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      } else if (err.request) {
        console.error('AuthContext: No response received:', err.request);
      } else {
        console.error('AuthContext: Request setup error:', err.message);
      }
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  // Allow consumers to update current user (e.g., after profile edit)
  const updateCurrentUser = (updater) => {
    setCurrentUser(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('user', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  // Function to check if token is valid (not expired)
  const isTokenValid = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return false;
    try {
      // Decode JWT (without verification) to check exp
      const [, payloadBase64] = token.split('.');
      if (!payloadBase64) return true; // non-standard token; assume backend validates
      const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(decodeURIComponent(escape(payloadJson)));
      if (payload && payload.exp) {
        const nowSec = Math.floor(Date.now() / 1000);
        return payload.exp > nowSec;
      }
      return true;
    } catch (error) {
      console.warn('Non-decodable token, deferring to server:', error?.message);
      return true;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    authReady,
    isTokenValid,
    login,
    logout,
    register,
    isAdmin,
    updateCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};