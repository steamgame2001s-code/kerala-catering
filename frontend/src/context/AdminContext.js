import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api/axiosConfig';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminSession = async () => {
      const token = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');
      
      console.log('🔍 Checking admin session...');
      console.log('Token exists:', !!token);
      console.log('Admin data exists:', !!adminData);
      
      if (token && adminData) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const storedAdmin = JSON.parse(adminData);
          console.log('✅ Restored admin session from localStorage');
          setAdmin(storedAdmin);
        } catch (error) {
          console.error('❌ Error restoring session:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
        }
      } else {
        console.log('ℹ️ No stored session found');
      }
      setLoading(false);
    };
    
    checkAdminSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/admin/login', { email, password });
      
      if (response.data.success) {
        const { token, admin: adminData } = response.data;
        
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(adminData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setAdmin(adminData);
        
        return { success: true, admin: adminData };
      }
      
      return { success: false, error: response.data.error };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed.' 
      };
    }
  };

  const logout = () => {
    console.log('👋 Logging out admin');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
    
    // Use window.location instead of navigate
    window.location.href = '/';  // ← FIXED: Redirects to homepage
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