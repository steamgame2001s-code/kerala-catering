import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import axiosInstance from '../api/axiosConfig';

const ProtectedRoute = ({ children }) => {
  const { admin, loading: contextLoading, login } = useAdmin();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const location = useLocation();
  
  console.log('🔒 ProtectedRoute Check:');
  console.log('   Current Path:', location.pathname);
  console.log('   Context Admin:', admin ? admin.email : 'null');
  console.log('   Context Loading:', contextLoading);
  
  useEffect(() => {
    const verifyAuth = async () => {
      setIsVerifying(true);
      
      // Check for token in localStorage
      const token = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');
      
      console.log('🔐 Token exists:', !!token);
      console.log('📦 Admin data exists:', !!adminData);
      
      if (!token) {
        console.log('❌ No token found');
        setIsValidToken(false);
        setIsVerifying(false);
        return;
      }
      
      try {
        console.log('📡 Verifying token with backend...');
        
        // Verify token with backend
        const response = await axiosInstance.get('/admin/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Token verification response:', response.data);
        
        if (response.data.success && response.data.admin) {
          console.log('✅ Token is valid');
          setIsValidToken(true);
          
          // Ensure context is updated
          if (!admin && response.data.admin.email) {
            console.log('🔄 Updating admin context...');
            // Store in localStorage to persist
            localStorage.setItem('adminData', JSON.stringify(response.data.admin));
          }
        } else {
          console.log('❌ Invalid token in response');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          setIsValidToken(false);
        }
      } catch (error) {
        console.error('❌ Token verification error:', error.message);
        
        // If unauthorized, clear invalid tokens
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('🚫 Unauthorized - clearing tokens');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
        }
        
        setIsValidToken(false);
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyAuth();
  }, [admin, login, location.pathname]);
  
  // Check if we should show loading
  const showLoading = isVerifying || contextLoading;
  
  if (showLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Verifying authentication...</p>
        <p style={styles.loadingSubtext}>This may take a moment</p>
      </div>
    );
  }
  
  // Check if authenticated
  const isAuthenticated = (admin && admin.email) || isValidToken;
  
  console.log('📊 Final Auth Check:');
  console.log('   Has Admin Context:', !!(admin && admin.email));
  console.log('   Has Valid Token:', isValidToken);
  console.log('   Is Authenticated:', isAuthenticated);
  
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to /admin/login');
    
    // Store the attempted URL for redirect after login
    if (location.pathname !== '/admin/login') {
      sessionStorage.setItem('redirectAfterLogin', location.pathname);
    }
    
    return <Navigate to="/admin/login" replace />;
  }
  
  // Admin is authenticated, render the protected component
  console.log('✅ Admin authenticated, rendering children');
  return children;
};

// Inline styles
const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    padding: '20px',
  },
  loadingSpinner: {
    width: '60px',
    height: '60px',
    border: '6px solid rgba(255, 126, 48, 0.2)',
    borderTop: '6px solid #ff7e30',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '25px',
  },
  loadingText: {
    color: '#495057',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '10px',
    textAlign: 'center',
  },
  loadingSubtext: {
    color: '#6c757d',
    fontSize: '14px',
    textAlign: 'center',
    maxWidth: '300px',
    lineHeight: '1.5',
  }
};

// Add animation keyframes
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default ProtectedRoute;