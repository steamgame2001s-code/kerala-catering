// frontend/src/context/AdminContext.js - FIXED FOR VERCEL + RENDER
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api/axiosConfig'; // USE YOUR AXIOS CONFIG
import { useNavigate } from 'react-router-dom';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing admin session on app load
    const checkAdminSession = async () => {
      const token = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');
      
      console.log('🔍 Checking admin session...');
      console.log('Token exists:', !!token);
      console.log('Admin data exists:', !!adminData);
      
      if (token && adminData) {
        try {
          // Set axios default auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Validate token with backend
          const response = await axios.get('/admin/profile');
          
          if (response.data.success) {
            console.log('✅ Admin session valid');
            setAdmin(JSON.parse(adminData));
          } else {
            console.log('❌ Admin session invalid');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
          }
        } catch (error) {
          console.error('❌ Token validation failed:', error.message);
          
          // If it's a 401 error (token expired/invalid), clear storage
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('🔄 Clearing invalid session');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      }
      setLoading(false);
    };
    
    checkAdminSession();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting admin login...');
      console.log('Email:', email);
      console.log('API URL:', axios.defaults.baseURL);
      
      // CORRECT ENDPOINT: /admin/login (not /api/admin/login because baseURL already has /api)
      const response = await axios.post('/admin/login', {
        email,
        password
      });
      
      console.log('📡 Login response:', response.data);
      
      if (response.data.success) {
        const { token, admin: adminData } = response.data;
        
        console.log('✅ Login successful!');
        console.log('Admin:', adminData.email);
        console.log('Role:', adminData.role);
        
        // Store token and admin data
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(adminData));
        
        // Set default auth header for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Set admin in state
        setAdmin(adminData);
        
        return { success: true, admin: adminData };
      }
      
      console.log('❌ Login failed:', response.data.error);
      return { success: false, error: response.data.error };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error details:', error.response?.data);
      
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed. Please check your credentials and try again.' 
      };
    }
  };

  const logout = () => {
    console.log('👋 Logging out admin');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
    navigate('/');
  };

  const value = {
    admin,
    login,
    logout,
    loading
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};