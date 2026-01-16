import axios from 'axios';

// Use environment variable for production, fallback to localhost for dev
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://kerala-catering.onrender.com/api'
  : 'http://localhost:5000/api';

console.log('🔧 API Configuration:', {
  nodeEnv: process.env.NODE_ENV,
  apiUrl: API_BASE_URL,
  envApiUrl: process.env.REACT_APP_API_URL
});

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - ATTACHES TOKEN
axiosInstance.interceptors.request.use(
  (config) => {
    // Get admin token from localStorage
    const adminToken = localStorage.getItem('adminToken');
    
    // Add Authorization header if token exists AND it's not a login/forgot-password request
    if (adminToken && 
        !config.url.includes('/admin/login') &&
        !config.url.includes('/admin/forgot-password') &&
        !config.url.includes('/admin/verify-otp') &&
        !config.url.includes('/admin/reset-password')) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - HANDLES ERRORS
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      config: error.config
    });
    
    // Handle 401 Unauthorized for admin routes only
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      // Only redirect if we're on an admin page
      if (window.location.pathname.includes('/admin') && 
          !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;