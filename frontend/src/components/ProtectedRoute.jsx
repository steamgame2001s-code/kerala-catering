// frontend/src/components/ProtectedRoute.jsx - COMPLETE FIXED VERSION
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdmin();
  
  console.log('🔒 ProtectedRoute Check:');
  console.log('   Loading:', loading);
  console.log('   Admin:', admin ? admin.email : 'null');
  
  // Show loading spinner while checking session
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Verifying authentication...</p>
      </div>
    );
  }

  // If no admin, redirect to login
  if (!admin) {
    console.log('❌ Not authenticated, redirecting to /admin/login');
    return <Navigate to="/admin/login" replace />;
  }

  // Admin is authenticated, render the protected component
  console.log('✅ Admin authenticated:', admin.email);
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
  loadingText: {
    color: '#666',
    fontSize: '16px',
    fontWeight: '500',
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