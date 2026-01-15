// frontend/src/context/AdminContext.jsx - UPDATED
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ADD THIS

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ADD THIS

  useEffect(() => {
    // Check for existing admin session on app load
    const checkAdminSession = async () => {
      const token = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');
      
      if (token && adminData) {
        try {
          // Validate token with backend - USE THE CORRECT ENDPOINT
          const response = await axios.get('http://localhost:5000/api/admin/validate-token', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success && response.data.valid) {
            setAdmin(JSON.parse(adminData));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          
          // If it's a 401 error (token expired/invalid), clear storage
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
          }
        }
      }
      setLoading(false);
    };
    
    checkAdminSession();
  }, []);

  const login = async (email, password) => {
    try {
      // CORRECT ENDPOINT: /api/admin/login (not /api/auth/login)
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        email,
        password
      });
      
      if (response.data.success) {
        const { token, admin } = response.data; // Note: response has "admin" not "user"
        
        // Store token and admin data
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(admin));
        
        // Set admin in state
        setAdmin(admin);
        
        return { success: true, admin: admin };
      }
      
      return { success: false, error: response.data.error };
      
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
    navigate('/'); // REDIRECT TO HOME PAGE
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