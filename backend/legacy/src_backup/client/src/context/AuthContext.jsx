import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Check if user is already logged in (token exists in localStorage)
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);
  
  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Normalize email to lowercase and trim whitespace for consistent login
      const normalizedEmail = email.toLowerCase().trim();
      console.log('Attempting login with email:', email);
      console.log('Normalized email for login:', normalizedEmail);
      
      const response = await axios.post('/api/users/login', { 
        email: normalizedEmail, 
        password 
      });
      
      const { token, user } = response.data;
      
      // Save token and user to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(user);
      console.log('Login successful');
      return user;
    } catch (error) {
      // Handle different types of errors
      let errorMessage = 'Login failed';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || 'Login failed';
        console.error('Login error response:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your internet connection.';
        console.error('Login error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'Login failed';
        console.error('Login error message:', error.message);
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Register function
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Normalize email to lowercase and trim whitespace for consistent registration
      const normalizedEmail = email.toLowerCase().trim();
      console.log('Registering new user:', { username, email });
      console.log('Normalized email for registration:', normalizedEmail);
      
      const response = await axios.post('/api/users/register', {
        username,
        email: normalizedEmail,
        password
      });
      
      console.log('Registration successful');
      
      // Return registration data without auto-login
      // This allows the user to be redirected to the login page
      return { 
        registrationData: response.data, 
        user: response.data.user 
      };

    } catch (error) {
      // Handle different types of errors
      let errorMessage = 'Registration failed';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 409) {
          errorMessage = 'An account with this email already exists';
        } else if (error.response.data?.errors) {
          // Handle validation errors
          const validationErrors = error.response.data.errors;
          if (validationErrors.length > 0) {
            errorMessage = validationErrors[0].message;
          } else {
            errorMessage = error.response.data.message || 'Registration failed';
          }
        } else {
          errorMessage = error.response.data?.message || 'Registration failed';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your internet connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'Registration failed';
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await axios.post('/api/users/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Remove token and user from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Remove authorization header
      delete axios.defaults.headers.common['Authorization'];
      
      setCurrentUser(null);
    }
  };
  
  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };
  
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};