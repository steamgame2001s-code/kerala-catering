// frontend/src/components/admin/AdminLogin.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { FaLock, FaEnvelope, FaSignInAlt, FaArrowLeft, FaKey, FaExclamationCircle } from 'react-icons/fa';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, admin } = useAdmin();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (admin) {
      console.log('✅ Already logged in, redirecting to dashboard');
      navigate('/admin/dashboard');
    }
  }, [admin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true);
    
    console.log('📝 Form submitted');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    
    try {
      const result = await login(email, password);
      console.log('🔐 Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful! Admin data:', result.admin);
        
        // Show success message briefly
        setError('');
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } else {
        // Show error message
        console.log('❌ Login failed:', result.error);
        setError(result.error || 'Invalid email or password. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('An unexpected error occurred. Please try again.');
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
            />
          </div>

          {/* Forgot Password Link */}
          <div className="forgot-password-link">
            <Link to="/admin/forgot-password">
              <FaKey /> Forgot Password?
            </Link>
          </div>

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
        </form>

        {/* Debug Info (Only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info">
            <p><strong>Debug Info:</strong></p>
            <p>API URL: {process.env.REACT_APP_API_URL || 'Using default'}</p>
            <p>Environment: {process.env.NODE_ENV}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;