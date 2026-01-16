// frontend/src/components/admin/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import axiosInstance from '../../api/axiosConfig';
import { FaLock, FaEnvelope, FaSignInAlt, FaArrowLeft, FaKey, FaExclamationCircle } from 'react-icons/fa';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('upasanacatering@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAdmin();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (token && adminData) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await axiosInstance.post('/admin/login', {
        email: email.trim().toLowerCase(),
        password: password
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // Store in localStorage
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        
        // Update context
        const result = await login(email, password);
        
        if (result.success) {
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 800);
        } else {
          setError('Login successful but session setup failed. Please try again.');
          setIsLoading(false);
        }
      } else {
        setError(response.data.error || 'Invalid email or password. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
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

        {/* Simple Admin Note */}
        <div className="admin-note">
          <p>For authorized administrators only. Contact support if you need access.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;