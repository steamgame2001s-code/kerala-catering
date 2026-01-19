import axios from 'axios';

console.log('🔧 Axios Config Loading...');

// Helper to clean up URL
const cleanBaseUrl = (url) => {
  if (!url) return url;
  
  // Remove trailing slashes
  url = url.replace(/\/+$/, '');
  
  // If URL ends with /api, remove it (we'll add it back)
  if (url.endsWith('/api')) {
    return url.replace('/api', '');
  }
  
  return url;
};

// Get base URL from environment or use fallback
const getBaseUrl = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  
  if (API_URL) {
    return cleanBaseUrl(API_URL);
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
console.log('📡 Full API Endpoint:', `${BASE_URL}/api`);

// Create axios instance
const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} Request:`, {
      url: `${config.baseURL}${config.url}`,
      hasAuth: !!config.headers.Authorization,
      contentType: config.headers['Content-Type']
    });
    
    // Add authorization token if available
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For FormData requests, don't set Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('📦 Request contains FormData');
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
    if (error.response) {
      console.error('❌ Response Error:', {
        url: error.config?.url,
        status: error.response.status,
        message: error.response.data?.message || error.response.data?.error || error.message
      });
    } else if (error.request) {
      console.error('❌ Network Error:', error.message);
    } else {
      console.error('❌ Request Error:', error.message);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - Clearing tokens');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('adminData');
      
      // Only redirect if not on login page
      if (!window.location.pathname.includes('/admin/login') && 
          !window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 1000);
      }
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout');
      alert('Request timeout. The server is taking too long to respond.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;