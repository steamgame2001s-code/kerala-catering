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
    // Only attach token if we're on an admin route
    const isAdminRoute = config.url.includes('/admin/') || 
                        config.url === '/admin/login' ||
                        config.url === '/admin/verify-otp';
    
    if (isAdminRoute) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
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
      message: error.message
    });
    
    // Handle 401 Unauthorized for admin routes only
    if (error.response?.status === 401 && 
        error.config?.url.includes('/admin/')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;