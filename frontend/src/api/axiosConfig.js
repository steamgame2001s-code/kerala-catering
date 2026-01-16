// frontend/src/api/axiosConfig.js - UPDATED FOR VERCEL + RENDER
import axios from 'axios';

// Smart URL detection - works in ALL environments
const getApiBaseUrl = () => {
  // Priority 1: Use environment variable if set
  if (process.env.REACT_APP_API_URL) {
    console.log('🔧 Using env variable:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Priority 2: Detect production by hostname
  const isProduction = window.location.hostname.includes('vercel.app') || 
                      process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    const renderUrl = 'https://kerala-catering.onrender.com/api';
    console.log('🌐 Detected production, using:', renderUrl);
    return renderUrl;
  }
  
  // Priority 3: Default to localhost for development
  console.log('💻 Detected development, using:', 'http://localhost:10000/api');
  return 'http://localhost:10000/api'; // CHANGED FROM 5000 to 10000
};

const API_BASE_URL = getApiBaseUrl();

console.log('🎯 Final API URL:', API_BASE_URL);
console.log('🌍 Hostname:', window.location.hostname);
console.log('⚙️ NODE_ENV:', process.env.NODE_ENV);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for Render cold starts
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for CORS
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`📡 ${config.method?.toUpperCase()} Request to:`, config.baseURL + config.url);
    
    // Add auth token if available
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Auth token attached');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response from:', response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.message);
    
    if (error.message === 'Network Error') {
      console.error('💀 NETWORK ERROR - Check:');
      console.error('   1. Backend URL:', error.config?.baseURL);
      console.error('   2. Backend is running');
      console.error('   3. CORS is configured');
    }
    
    if (error.response?.status === 401) {
      console.error('🔒 Unauthorized - Token may be expired');
      // Auto-logout on 401
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    
    if (error.response?.status === 403) {
      console.error('🚫 Forbidden - Access denied');
    }
    
    if (error.response?.status === 404) {
      console.error('🔍 Not Found:', error.config.url);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;