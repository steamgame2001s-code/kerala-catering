// frontend/src/components/admin/AdminLogin.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import axiosInstance from '../../api/axiosConfig'; // Import axios directly
import { FaLock, FaEnvelope, FaSignInAlt, FaArrowLeft, FaKey, FaExclamationCircle } from 'react-icons/fa';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('upasanacatering@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState({});
  const { login, admin } = useAdmin();
  const navigate = useNavigate();

  // Debug: Check current state
  useEffect(() => {
    console.log('🔍 AdminLogin Component Mounted');
    console.log('📡 Axios baseURL:', axiosInstance.defaults.baseURL);
    console.log('👤 Admin context:', admin ? 'Logged in' : 'Not logged in');
    console.log('🌐 Current path:', window.location.pathname);
    
    // Collect debug info
    setDebugInfo({
      apiUrl: axiosInstance.defaults.baseURL,
      hasAdmin: !!admin,
      timestamp: new Date().toISOString(),
      localStorageToken: localStorage.getItem('adminToken') ? 'Exists' : 'None'
    });
  }, [admin]);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    console.log('🔐 AdminLogin - Auth Check:');
    console.log('- Token in localStorage:', token ? `Exists (${token.length} chars)` : 'None');
    console.log('- Admin data in localStorage:', adminData ? 'Exists' : 'None');
    console.log('- Admin in context:', admin ? 'Exists' : 'None');
    
    // Only redirect if we have a token AND admin data
    if (token && adminData && admin) {
      console.log('✅ Valid session found, redirecting to dashboard');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 100);
    } else if (token && !adminData) {
      // Token exists but no admin data - clear invalid session
      console.log('⚠️ Token without admin data, clearing session');
      localStorage.removeItem('adminToken');
    }
  }, [admin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true);
    
    console.log('📝 Form submitted');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('API URL being used:', axiosInstance.defaults.baseURL);
    
    try {
      // Direct API call for debugging
      console.log('🔐 Attempting admin login...');
      console.log('Email:', email);
      console.log('API URL:', axiosInstance.defaults.baseURL);
      
      const response = await axiosInstance.post('/admin/login', {
        email: email.trim().toLowerCase(),
        password: password
      }, {
        timeout: 15000, // 15 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Login response:', response.data);
      
      if (response.data.success) {
        console.log('✅ Login successful!');
        console.log('Admin:', response.data.admin);
        console.log('Token length:', response.data.token?.length || 0);
        
        // Store in localStorage
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        
        console.log('💾 Token and admin data stored in localStorage');
        
        // Update context
        const result = await login(email, password);
        
        if (result.success) {
          console.log('✅ Context updated, redirecting to dashboard');
          
          // Small delay for user to see success
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 800);
        } else {
          console.log('❌ Context update failed:', result.error);
          setError('Login successful but session setup failed. Please try again.');
          setIsLoading(false);
        }
      } else {
        console.log('❌ Login failed:', response.data.error);
        setError(response.data.error || 'Invalid email or password. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      
      // Detailed error handling
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check your internet connection and try again.';
        console.error('🌐 Network error - Backend might be down or URL is incorrect');
        console.error('Attempted URL:', axiosInstance.defaults.baseURL + '/admin/login');
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Server endpoint not found. Please contact support.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const testDirectLogin = async () => {
    console.log('🧪 Testing direct login...');
    
    try {
      const response = await fetch('https://kerala-catering.onrender.com/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'upasanacatering@gmail.com',
          password: password || 'Arun@2000'
        })
      });
      
      const data = await response.json();
      console.log('Direct fetch result:', data);
      
      if (data.success) {
        alert(`✅ Direct login works! Token: ${data.token.substring(0, 20)}...`);
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        
        // Update context
        await login('upasanacatering@gmail.com', password || 'Arun@2000');
        navigate('/admin/dashboard');
      } else {
        alert(`❌ Direct login failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Direct test error:', error);
      alert(`❌ Direct test error: ${error.message}`);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log('🧹 All storage cleared');
    setError('Storage cleared. Please login again.');
    window.location.reload();
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        {/* Back to Home Button */}
        <Link to="/" className="back-to-home">
          <FaArrowLeft /> Back to Home
        </Link>

        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-circle">
            <FaLock size={28} />
          </div>
          <h1>Admin Portal</h1>
          <p className="subtitle">Kerala Catering Management System</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <FaExclamationCircle /> {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="icon" /> Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
              className="form-input"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="icon" /> Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="form-input"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              type="submit" 
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading">
                  <span className="spinner"></span> Logging in...
                </span>
              ) : (
                <>
                  <FaSignInAlt /> Login to Dashboard
                </>
              )}
            </button>
            
            {/* Forgot Password Link */}
            <div className="forgot-password-link">
              <Link to="/admin/forgot-password">
                <FaKey /> Forgot Password?
              </Link>
            </div>
          </div>
        </form>

        {/* Debug Section (Always visible for troubleshooting) */}
        <div className="debug-section">
          <h4>🔧 Troubleshooting</h4>
          <div className="debug-info">
            <p><strong>API URL:</strong> {debugInfo.apiUrl || 'Loading...'}</p>
            <p><strong>Session:</strong> {debugInfo.hasAdmin ? 'Logged in' : 'Not logged in'}</p>
            <p><strong>Token in storage:</strong> {debugInfo.localStorageToken || 'Checking...'}</p>
            <p><strong>Time:</strong> {debugInfo.timestamp ? new Date(debugInfo.timestamp).toLocaleTimeString() : '...'}</p>
          </div>
          
          <div className="debug-buttons">
            <button 
              type="button" 
              className="debug-btn"
              onClick={testDirectLogin}
            >
              Test Direct Login
            </button>
            <button 
              type="button" 
              className="debug-btn"
              onClick={clearStorage}
            >
              Clear Storage
            </button>
            <button 
              type="button" 
              className="debug-btn"
              onClick={() => window.location.reload(true)}
            >
              Hard Refresh
            </button>
          </div>
        </div>

        {/* Test Credentials */}
        <div className="test-credentials">
          <p><strong>Test Credentials:</strong></p>
          <p>Email: upasanacatering@gmail.com</p>
          <p>Password: Arun@2000</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;