// frontend/src/api/axiosConfig.js - UPDATED
import axios from 'axios';

console.log('🔧 Axios Config Loading...');

// Get API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL;

console.log('🔧 Using env variable:', API_URL);

// Fallback URLs for different environments
const getApiUrl = () => {
  if (API_URL) {
    return API_URL;
  }

  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:10000/api';
  }

  // Production fallback
  return 'https://kerala-catering.onrender.com/api';
};

const BASE_URL = getApiUrl();

console.log('🎯 FINAL API URL:', BASE_URL);
console.log('🌍 Hostname:', window.location.hostname);
console.log('⚙️ NODE_ENV:', process.env.NODE_ENV);

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} Request:`, config.url);
    
    // Add authorization token if available
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token attached to request');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} Response:`, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Handle common errors
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - Clearing token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('adminData');
      
      // Only redirect if not on login page
      if (!window.location.pathname.includes('/admin/login') && 
          !window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;