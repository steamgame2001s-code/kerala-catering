// frontend/src/components/admin/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import axios from '../../api/axiosConfig';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await axios.post('/admin/forgot-password', { email });
      
      if (response.data.success) {
        setMessage(response.data.message || 'OTP has been sent to your email.');
        // Store the email for OTP verification
        localStorage.setItem('resetEmail', response.data.email || email);
        // Redirect to verify OTP page after 2 seconds
        setTimeout(() => {
          navigate('/admin/verify-otp', { state: { email: response.data.email || email } });
        }, 2000);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      
      // Handle different error status codes
      if (err.response?.status === 403) {
        setError(err.response?.data?.message || 'Only the business admin email can reset passwords.');
      } else if (err.response?.status === 404) {
        setError(err.response?.data?.message || 'Admin account not found. Please contact support.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.error || 'Invalid request. Please check your email.');
      } else {
        setError(err.response?.data?.error || 'Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        {/* Back to Login Button */}
        <Link to="/admin/login" className="back-to-login">
          <FaArrowLeft /> Back to Login
        </Link>

        {/* Header */}
        <div className="logo-section">
          <div className="logo-circle">
            <FaEnvelope size={28} />
          </div>
          <h1>Reset Password</h1>
          <p className="subtitle">Enter your email to receive OTP</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="icon" /> Admin Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your admin email address"
              required
              className="form-input"
              disabled={loading}
            />
            <p className="form-hint">
              Only the authorized business email can reset passwords.
            </p>
          </div>

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
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" /> Sending OTP...
              </>
            ) : (
              <>
                <FaPaperPlane /> Send OTP
              </>
            )}
          </button>

          {/* Info Box */}
          <div className="info-box">
            <h4>📝 How it works:</h4>
            <ol>
              <li>Enter the authorized admin email address</li>
              <li>Check your email for a 6-digit OTP</li>
              <li>Enter the OTP on the next page</li>
              <li>Set your new password</li>
            </ol>
            <p className="note">
              <strong>Note:</strong> OTP is valid for 10 minutes only.
            </p>
            <p className="note">
              <strong>Security:</strong> Only the business email ({process.env.REACT_APP_BUSINESS_EMAIL || 'upasanacatering@gmail.com'}) can reset passwords.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;