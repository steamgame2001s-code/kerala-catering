// frontend/src/api/axiosConfig.js - FINAL SIMPLE VERSION
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor - ATTACHES TOKEN
axiosInstance.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      config.headers['Content-Type'] = 'application/json';
      console.log('✅ Token attached:', adminToken.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No admin token found');
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
    console.log('✅ Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - redirecting to login');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;