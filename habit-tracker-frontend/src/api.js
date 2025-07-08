import axios from 'axios';

// API URL configuration for different environments
let API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? window.location.origin + '/api'
    : 'http://localhost:5000/api');

// Ensure API_URL always ends with /api if it doesn't already
if (!API_URL.endsWith('/api')) {
  API_URL = API_URL + '/api';
}

// Configure axios with the most permissive settings for development
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - clear auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Reload page to show login form
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
