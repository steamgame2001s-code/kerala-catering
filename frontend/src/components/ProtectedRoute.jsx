import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('adminToken');
      console.log('ProtectedRoute - Token:', token);
      console.log('Current path:', location.pathname);
      
      if (!token) {
        console.log('No token found, redirecting to login');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Set the token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Try to get admin profile to verify token
        const response = await axios.get('http://localhost:5000/api/admin/profile');
        console.log('Token verification response:', response.data);
        
        if (response.data) {
          console.log('Token valid, allowing access');
          setIsAuthenticated(true);
        } else {
          console.log('Token invalid, redirecting');
          setIsAuthenticated(false);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        console.log('Removing invalid token');
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [location]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to /admin');
    return <Navigate to="/admin" replace />;
  }

  console.log('Authenticated, rendering children');
  return children;
};

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f8f9fa',
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #ff7e30',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
};

// Add this to your App.css or create a style tag
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default ProtectedRoute;