import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaLock, FaCheck, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import './ResetPassword.css';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [email, setEmail] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get token and email from navigation state
    if (location.state?.resetToken && location.state?.email) {
      setResetToken(location.state.resetToken);
      setEmail(location.state.email);
    } else {
      // If no token, redirect to forgot password
      navigate('/admin/forgot-password');
    }
  }, [location, navigate]);

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          resetToken, 
          newPassword 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('Password reset successful! Redirecting to login...');
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/admin/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Reset password error:', err);
    }
    
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        {/* Back Button */}
        <Link to="/admin/verify-otp" className="back-button">
          <FaArrowLeft /> Back
        </Link>

        {/* Header */}
        <div className="logo-section">
          <div className="logo-circle">
            <FaLock size={28} />
          </div>
          <h1>Set New Password</h1>
          <p className="subtitle">Create a new password for {email}</p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="newPassword">
              <FaLock className="icon" /> New Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
                className="form-input"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
                tabIndex="-1"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <p className="form-hint">
              Password must be at least 6 characters long.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <FaLock className="icon" /> Confirm New Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                className="form-input"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={toggleConfirmPasswordVisibility}
                tabIndex="-1"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Password Strength */}
          {newPassword && (
            <div className="password-strength">
              <div className={`strength-bar ${newPassword.length >= 6 ? 'strong' : 'weak'}`}></div>
              <span className="strength-text">
                {newPassword.length >= 6 ? '✅ Strong password' : '❌ Weak password'}
              </span>
            </div>
          )}

          {/* Messages */}
          {message && (
            <div className="success-message">
              ✅ {message}
            </div>
          )}
          
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading || !newPassword || !confirmPassword}
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" /> Resetting Password...
              </>
            ) : (
              <>
                <FaCheck /> Reset Password
              </>
            )}
          </button>

          {/* Security Note */}
          <div className="security-note">
            <h4>🔒 Security Tips:</h4>
            <ul>
              <li>Use a combination of letters, numbers, and symbols</li>
              <li>Avoid using personal information in your password</li>
              <li>Don't reuse passwords from other accounts</li>
              <li>Consider using a password manager</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;