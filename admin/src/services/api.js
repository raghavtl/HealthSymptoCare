import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api', // Use relative URL to work with Vite proxy
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method} ${config.url}`, {
      headers: config.headers,
      data: config.data,
      params: config.params,
      baseURL: config.baseURL
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, {
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`API Error: ${error.response.status} ${error.config?.url}`, {
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Handle authentication errors
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`API No Response: ${error.config?.url}`, {
        request: error.request
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// User API
const userApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

// Auth API
const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me')
};

// Health Tips API
const healthTipsApi = {
  getAll: () => api.get('/health-tips'),
  getByCategory: (category) => api.get(`/health-tips/category/${category}`),
  getById: (id) => api.get(`/health-tips/${id}`),
  create: (data) => api.post('/health-tips', data),
  update: (id, data) => api.put(`/health-tips/${id}`, data),
  delete: (id) => api.delete(`/health-tips/${id}`)
};

// Wellness Logs API
const wellnessLogsApi = {
  getAll: () => api.get('/wellness-logs'),
  getByUserId: (userId) => api.get(`/wellness-logs/user/${userId}`),
  getById: (id) => api.get(`/wellness-logs/${id}`),
  create: (data) => api.post('/wellness-logs', data),
  update: (id, data) => api.put(`/wellness-logs/${id}`, data),
  delete: (id) => api.delete(`/wellness-logs/${id}`)
};

export { api, userApi, authApi, healthTipsApi, wellnessLogsApi };