import axios from 'axios';

// SMART API URL DETECTION
const getApiBaseUrl = () => {
  // Priority 1: Environment variable
  if (process.env.REACT_APP_API_URL) {
    console.log('🔧 Using env variable:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Priority 2: Detect Vercel production
  const hostname = window.location.hostname;
  const isVercel = hostname.includes('vercel.app');
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isVercel || isProduction) {
    console.log('🌐 Production detected, using Render backend');
    return 'https://kerala-catering.onrender.com/api';
  }
  
  // Priority 3: Local development
  console.log('💻 Local development, using localhost:10000');
  return 'http://localhost:10000/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🎯 FINAL API URL:', API_BASE_URL);
console.log('🌍 Hostname:', window.location.hostname);
console.log('⚙️ NODE_ENV:', process.env.NODE_ENV);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Handle responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      
      if (window.location.pathname.includes('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;