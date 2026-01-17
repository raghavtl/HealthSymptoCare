import axios from 'axios';

// We're using a relative URL for the API
// This works with the Vite proxy configuration in vite.config.js

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api', // Use relative URL to work with Vite proxy
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Enhanced logging for all environments
api.interceptors.request.use(request => {
  console.log(`API Request: ${request.method} ${request.url}`, {
    headers: request.headers,
    data: request.data,
    params: request.params,
    baseURL: request.baseURL
  });
  return request;
});

api.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status} ${response.config.url}`, {
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`API Error: ${error.response.status} ${error.config?.url}`, {
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`API No Response: ${error.config?.url}`, {
        request: error.request
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error(`API Request Setup Error: ${error.message}`, {
        config: error.config
      });
    }
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token (supports both localStorage and sessionStorage)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
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
  delete: (id) => api.delete(`/wellness-logs/${id}`),
  uploadImage: (logId, formData) => {
    return api.post(`/wellness-logs/${logId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteImage: (logId, imageId) => api.delete(`/wellness-logs/${logId}/images/${imageId}`)
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
  // Existing mock plan endpoints
  getPlans: (healthGoal, dietaryPreference, fitnessLevel) => {
    console.log('Calling API for plans with:', { healthGoal, dietaryPreference, fitnessLevel });
    return api.post('/diet-and-fitness/plans', { healthGoal, dietaryPreference, fitnessLevel })
      .catch(error => {
        console.error('API error in getPlans:', error);
        throw error;
      });
  },
  getDietPlan: (healthGoal, dietaryPreference) => {
    console.log('Calling API for diet plan with:', { healthGoal, dietaryPreference });
    return api.post('/diet-and-fitness/diet-plan', { healthGoal, dietaryPreference })
      .catch(error => {
        console.error('API error in getDietPlan:', error);
        throw error;
      });
  },
  getWorkoutPlan: (healthGoal, fitnessLevel) => {
    console.log('Calling API for workout plan with:', { healthGoal, fitnessLevel });
    return api.post('/diet-and-fitness/workout-plan', { healthGoal, fitnessLevel })
      .catch(error => {
        console.error('API error in getWorkoutPlan:', error);
        throw error;
      });
  },
  // New real endpoints
  getProfile: () => api.get('/diet-and-fitness/profile'),
  saveProfile: (profile) => api.put('/diet-and-fitness/profile', profile),

  searchFoods: (q, veg) => api.get('/diet-and-fitness/foods', { params: { q, veg } }),

  getFoodLogsByDate: (date) => api.get('/diet-and-fitness/food-logs', { params: { date } }),
  addFoodLog: (data) => api.post('/diet-and-fitness/food-logs', data),
  updateFoodLog: (id, data) => api.put(`/diet-and-fitness/food-logs/${id}`, data),
  deleteFoodLog: (id) => api.delete(`/diet-and-fitness/food-logs/${id}`),

  listRecipes: (q, veg, minCal, maxCal, tags) => api.get('/diet-and-fitness/recipes', { params: { q, veg, minCal, maxCal, tags } }),
  listOnlineRecipes: (q, veg, minCal, maxCal) => api.get('/diet-and-fitness/recipes/online', { params: { q, veg, minCal, maxCal } }),
  getRecipe: (id) => api.get(`/diet-and-fitness/recipes/${id}`),

  listWorkouts: (level, category) => api.get('/diet-and-fitness/workouts', { params: { level, category } }),
  scheduleWorkout: (data) => api.post('/diet-and-fitness/workout-schedule', data),
  getWorkoutScheduleByDate: (date) => api.get('/diet-and-fitness/workout-schedule', { params: { date } }),
  setWorkoutStatus: (id, status) => api.put(`/diet-and-fitness/workout-schedule/${id}/status`, { status }),

  addWaterLog: (data) => api.post('/diet-and-fitness/water-logs', data),
  getWaterTotalByDate: (date) => api.get('/diet-and-fitness/water-logs', { params: { date } }),
  getWaterRange: (startDate, endDate) => api.get('/diet-and-fitness/water-logs/range', { params: { startDate, endDate } }),

  addWeightLog: (data) => api.post('/diet-and-fitness/weight-logs', data),
  getWeightRange: (startDate, endDate) => api.get('/diet-and-fitness/weight-logs/range', { params: { startDate, endDate } }),

  getReminders: () => api.get('/diet-and-fitness/reminders'),
  saveReminder: (payload) => api.put('/diet-and-fitness/reminders', payload),
  sendEmail: ({ subject, text, html }) => api.post('/diet-and-fitness/email', { subject, text, html }),

  getDashboardStats: (rangeDays = 7) => api.get('/diet-and-fitness/dashboard', { params: { rangeDays } }),
};

// Users API
const usersApi = {
  register: (userData) => {
    console.log('API Service: Making registration request with data:', {
      ...userData,
      password: '***' // Don't log actual password
    });
    return api.post('/users/register', userData);
  },
  login: (credentials) => {
    console.log('API Service: Making login request with email:', credentials.email);
    return api.post('/users/login', credentials);
  },
  getProfile: (id) => api.get(`/users/profile/${id}`),
  updateProfile: (id, userData) => api.put(`/users/profile/${id}`, userData),
  logout: () => api.post('/users/logout')
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