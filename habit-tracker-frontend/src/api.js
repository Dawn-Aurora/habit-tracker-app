import axios from 'axios';

console.log('REAL API MODULE LOADED');

// Configure axios with the most permissive settings for development
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default axiosInstance;
