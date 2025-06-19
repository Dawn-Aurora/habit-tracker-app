import axios from 'axios';

console.log('REAL API MODULE LOADED');

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configure axios with the most permissive settings for development
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default axiosInstance;
