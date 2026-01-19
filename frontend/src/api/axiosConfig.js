// frontend/src/api/axiosConfig.js - CORRECT FOR REACT
import axios from 'axios';

console.log('🔧 Axios Config Loading...');

// For React CRA, use process.env
const API_URL = process.env.REACT_APP_API_URL;

console.log('🔧 REACT_APP_API_URL:', API_URL);

// Fallback URLs
const getBaseUrl = () => {
  if (API_URL) {
    // Ensure no duplicate /api
    if (API_URL.endsWith('/api')) {
      return API_URL.replace('/api', '');
    }
    return API_URL;
  }

  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }

  // Production fallback
  return 'https://kerala-catering.onrender.com';
};

const BASE_URL = getBaseUrl();
console.log('🎯 FINAL BASE URL:', BASE_URL);
console.log('🌍 Environment:', process.env.NODE_ENV);

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`, // Add /api here
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} Request to: ${config.baseURL}${config.url}`);
    
    // Add authorization token if available
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token attached');
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
    console.log(`✅ ${response.status} Response from: ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ Response Error:', {
        url: error.config?.url,
        status: error.response.status,
        message: error.response.data?.message || error.message,
      });
    } else {
      console.error('❌ Network Error:', error.message);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - Clearing tokens');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('adminData');
      
      // Only redirect if not on login page
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;