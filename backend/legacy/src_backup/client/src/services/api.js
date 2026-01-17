import axios from 'axios';

// We're using a relative URL for the API
// This works with the Vite proxy configuration in vite.config.js

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api', // Use relative URL for both development and production
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Health Tips API
const healthTipsApi = {
  getAll: () => api.get('/health-tips'),
  getByCategory: (category) => api.get(`/health-tips/category/${category}`),
  getById: (id) => api.get(`/health-tips/${id}`)
};

// Wellness Logs API
const wellnessLogsApi = {
  getByUserId: (userId) => api.get(`/wellness-logs/user/${userId}`),
  getById: (id) => api.get(`/wellness-logs/${id}`),
  create: (data) => api.post('/wellness-logs', data),
  update: (id, data) => api.put(`/wellness-logs/${id}`, data),
  delete: (id) => api.delete(`/wellness-logs/${id}`)
};

// Symptoms API
const symptomsApi = {
  getAll: () => api.get('/symptoms'),
  getBodyParts: () => api.get('/symptoms/body-parts'),
  getByBodyPart: (bodyPart) => api.get(`/symptoms/body-part/${bodyPart}`),
  checkSymptoms: (symptomIds) => api.post('/symptoms/check', { symptomIds })
};

// Diet and Fitness API
const dietAndFitnessApi = {
  getPlans: (healthGoal, dietaryPreference, fitnessLevel) => 
    api.post('/diet-and-fitness/plans', { healthGoal, dietaryPreference, fitnessLevel }),
  getDietPlan: (healthGoal, dietaryPreference) => 
    api.post('/diet-and-fitness/diet-plan', { healthGoal, dietaryPreference }),
  getWorkoutPlan: (healthGoal, fitnessLevel) => 
    api.post('/diet-and-fitness/workout-plan', { healthGoal, fitnessLevel })
};

// Users API
const usersApi = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, userData) => api.put(`/users/${id}`, userData)
};

// Medicines API
const medicinesApi = {
  getAll: () => api.get('/medicines'),
  getById: (id) => api.get(`/medicines/${id}`),
  getByCondition: (conditionId) => api.get(`/medicines/condition/${conditionId}`),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`)
};

// Export all API services
export {
  api,
  healthTipsApi,
  wellnessLogsApi,
  symptomsApi,
  dietAndFitnessApi,
  usersApi,
  medicinesApi
};