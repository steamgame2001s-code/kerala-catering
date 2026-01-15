import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaKey, FaCheck, FaSpinner, FaRedo } from 'react-icons/fa';
import './VerifyOTP.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from navigation state
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // If no email, redirect back
      navigate('/admin/forgot-password');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // If pasting OTP
      const otpArray = value.split('').slice(0, 6);
      const newOtp = [...otp];
      otpArray.forEach((digit, idx) => {
        if (idx < 6) newOtp[idx] = digit;
      });
      setOtp(newOtp);
      
      // Focus next input
      if (otpArray.length === 6) {
        document.getElementById('otp-5').focus();
      } else if (index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    } else {
      // Single digit input
      const newOtp = [...otp];
      newOtp[index] = value.replace(/[^0-9]/g, '');
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp: otpString })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('OTP verified successfully!');
        // Redirect to reset password page with token
        setTimeout(() => {
          navigate('/admin/reset-password', { 
            state: { 
              email, 
              resetToken: data.resetToken 
            } 
          });
        }, 1000);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Verify OTP error:', err);
    }
    
    setLoading(false);
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError('');
    setMessage('');
    setCanResend(false);
    setTimer(600); // Reset to 10 minutes
    
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
        setMessage('New OTP has been sent to your email.');
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0').focus();
      } else {
        setError(data.error || 'Failed to resend OTP');
        setCanResend(true);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setCanResend(true);
    }
    
    setLoading(false);
  };

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-card">
        {/* Back Button */}
        <Link to="/admin/forgot-password" className="back-button">
          <FaArrowLeft /> Back
        </Link>

        {/* Header */}
        <div className="logo-section">
          <div className="logo-circle">
            <FaKey size={28} />
          </div>
          <h1>Verify OTP</h1>
          <p className="subtitle">Enter the 6-digit code sent to {email}</p>
          
          {/* Timer */}
          <div className="timer">
            ⏱️ OTP expires in: <span className={timer < 60 ? 'expiring' : ''}>
              {formatTime(timer)}
            </span>
          </div>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-input"
                disabled={loading}
                autoFocus={index === 0}
              />
            ))}
          </div>
          
          <div className="otp-hint">
            Enter the 6-digit code from your email
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

          {/* Buttons */}
          <div className="button-group">
            <button 
              type="submit" 
              className="verify-btn"
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? (
                <>
                  <FaSpinner className="spinner" /> Verifying...
                </>
              ) : (
                <>
                  <FaCheck /> Verify OTP
                </>
              )}
            </button>
            
            <button 
              type="button" 
              className={`resend-btn ${!canResend ? 'disabled' : ''}`}
              onClick={handleResendOTP}
              disabled={!canResend || loading}
            >
              <FaRedo /> Resend OTP {!canResend && `(${formatTime(timer)})`}
            </button>
          </div>

          {/* Instructions */}
          <div className="instructions">
            <h4>📱 Need help?</h4>
            <ul>
              <li>Check your email inbox (and spam folder)</li>
              <li>Enter the 6-digit code exactly as shown</li>
              <li>Code is valid for 10 minutes only</li>
              <li>You can request a new code after 10 minutes</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;