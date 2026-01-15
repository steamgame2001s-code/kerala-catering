import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { FaLock, FaEnvelope, FaSignInAlt, FaArrowLeft, FaKey } from 'react-icons/fa';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, admin } = useAdmin();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (admin) {
      console.log('Already logged in, redirecting to dashboard');
      navigate('/admin/dashboard');
    }
  }, [admin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('Form submitted:', { email, password });
    
    const result = await login(email, password);
    console.log('Login result:', result);
    
    setIsLoading(false);
    
    if (result.success) {
      console.log('Login successful! Admin data:', result.admin);
      // Force redirect to dashboard
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 100);
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
              <span className="loading">Logging in...</span>
            ) : (
              <>
                <FaSignInAlt /> Login to Dashboard
              </>
            )}
          </button>
        </form>

        {/* Debug Info (Remove in production) */}
      </div>
    </div>
  );
};

export default AdminLogin;