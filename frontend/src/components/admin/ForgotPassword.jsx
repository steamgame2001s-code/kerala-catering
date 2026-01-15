import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaPaperPlane, FaSpinner } from 'react-icons/fa';
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
      const response = await fetch('http://localhost:5000/api/admin/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('OTP has been sent to your email. Please check your inbox.');
        // Redirect to verify OTP page after 2 seconds
        setTimeout(() => {
          navigate('/admin/verify-otp', { state: { email } });
        }, 2000);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Forgot password error:', err);
    }
    
    setLoading(false);
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
              Enter the email address associated with your admin account.
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
              <li>Enter your admin email address</li>
              <li>Check your email for a 6-digit OTP</li>
              <li>Enter the OTP on the next page</li>
              <li>Set your new password</li>
            </ol>
            <p className="note">
              <strong>Note:</strong> OTP is valid for 10 minutes only.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;