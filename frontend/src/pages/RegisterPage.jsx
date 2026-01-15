import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight
} from 'react-icons/fa';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    receiveOffers: true
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Mock registration - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production: Call your backend API
      // const response = await fetch('http://localhost:5000/api/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formData.name,
      //     email: formData.email,
      //     phone: formData.phone,
      //     password: formData.password,
      //     receiveOffers: formData.receiveOffers
      //   })
      // });
      
      // Simulate successful registration
      const mockUser = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'customer',
        joinDate: new Date().toISOString()
      };
      
      // Call register function from AuthContext
      register(mockUser);
      
      setRegistrationSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ 
        submit: 'Registration failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (registrationSuccess) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <div className="display-1 text-success mb-3">
                    <FaCheckCircle />
                  </div>
                  <h2 className="fw-bold mb-3">Registration Successful!</h2>
                  <p className="text-muted mb-4">
                    Welcome to Kerala Catering, {formData.name}! Your account has been created successfully.
                  </p>
                </div>
                
                <div className="alert alert-info mb-4">
                  <p className="mb-0">
                    You will be redirected to the login page shortly. 
                    Please login with your credentials to start ordering.
                  </p>
                </div>
                
                <div className="d-flex justify-content-center gap-3">
                  <button 
                    className="btn btn-primary px-5"
                    onClick={() => navigate('/login')}
                  >
                    Go to Login
                  </button>
                  <button 
                    className="btn btn-outline-primary px-5"
                    onClick={() => navigate('/')}
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="card shadow-lg border-0">
              <div className="row g-0">
                {/* Left Side - Form */}
                <div className="col-md-7">
                  <div className="card-body p-5">
                    <div className="text-center mb-4">
                      <h2 className="fw-bold">Create Account</h2>
                      <p className="text-muted">Join Kerala Catering family</p>
                    </div>
                    
                    {errors.submit && (
                      <div className="alert alert-danger">
                        <FaTimesCircle className="me-2" />
                        {errors.submit}
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                      {/* Name Field */}
                      <div className="mb-4">
                        <label className="form-label fw-bold">Full Name</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaUser />
                          </span>
                          <input
                            type="text"
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                          />
                          {errors.name && (
                            <div className="invalid-feedback">{errors.name}</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Email Field */}
                      <div className="mb-4">
                        <label className="form-label fw-bold">Email Address</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaEnvelope />
                          </span>
                          <input
                            type="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                          />
                          {errors.email && (
                            <div className="invalid-feedback">{errors.email}</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Phone Field */}
                      <div className="mb-4">
                        <label className="form-label fw-bold">Phone Number</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaPhone />
                          </span>
                          <input
                            type="tel"
                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="10-digit mobile number"
                          />
                          {errors.phone && (
                            <div className="invalid-feedback">{errors.phone}</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Password Field */}
                      <div className="mb-4">
                        <label className="form-label fw-bold">Password</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaLock />
                          </span>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Create a strong password"
                          />
                          <button 
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                          {errors.password && (
                            <div className="invalid-feedback">{errors.password}</div>
                          )}
                        </div>
                        <div className="form-text">
                          Password must be at least 6 characters with uppercase, lowercase, and number
                        </div>
                      </div>
                      
                      {/* Confirm Password Field */}
                      <div className="mb-4">
                        <label className="form-label fw-bold">Confirm Password</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaLock />
                          </span>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm your password"
                          />
                          <button 
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={toggleConfirmPasswordVisibility}
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                          {errors.confirmPassword && (
                            <div className="invalid-feedback">{errors.confirmPassword}</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Terms Checkbox */}
                      <div className="mb-4">
                        <div className="form-check">
                          <input
                            className={`form-check-input ${errors.agreeToTerms ? 'is-invalid' : ''}`}
                            type="checkbox"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleInputChange}
                            id="agreeToTerms"
                          />
                          <label className="form-check-label" htmlFor="agreeToTerms">
                            I agree to the{' '}
                            <Link to="/terms" className="text-primary">
                              Terms and Conditions
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="text-primary">
                              Privacy Policy
                            </Link>
                          </label>
                          {errors.agreeToTerms && (
                            <div className="invalid-feedback d-block">{errors.agreeToTerms}</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Marketing Checkbox */}
                      <div className="mb-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="receiveOffers"
                            checked={formData.receiveOffers}
                            onChange={handleInputChange}
                            id="receiveOffers"
                          />
                          <label className="form-check-label" htmlFor="receiveOffers">
                            Send me festival offers, new menu updates, and promotions
                          </label>
                        </div>
                      </div>
                      
                      {/* Submit Button */}
                      <div className="d-grid mb-4">
                        <button 
                          type="submit" 
                          className="btn btn-primary btn-lg"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Creating Account...
                            </>
                          ) : (
                            <>
                              Create Account
                              <FaArrowRight className="ms-2" />
                            </>
                          )}
                        </button>
                      </div>
                      
                      {/* Divider */}
                      <div className="divider d-flex align-items-center my-4">
                        <p className="text-center mx-3 mb-0 text-muted">OR</p>
                      </div>
                      
                      {/* Social Login */}
                      <div className="text-center mb-4">
                        <p className="text-muted mb-3">Sign up with</p>
                        <div className="d-flex justify-content-center gap-3">
                          <button type="button" className="btn btn-outline-primary btn-lg">
                            <i className="fab fa-google"></i>
                          </button>
                          <button type="button" className="btn btn-outline-primary btn-lg">
                            <i className="fab fa-facebook-f"></i>
                          </button>
                          <button type="button" className="btn btn-outline-primary btn-lg">
                            <i className="fab fa-apple"></i>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                
                {/* Right Side - Banner */}
                <div className="col-md-5 d-none d-md-block bg-primary text-white">
                  <div className="card-body p-5 d-flex flex-column justify-content-center h-100">
                    <div className="text-center mb-5">
                      <h2 className="fw-bold mb-3">Welcome!</h2>
                      <p className="mb-4">
                        Join thousands of happy customers enjoying authentic Kerala festival food.
                      </p>
                    </div>
                    
                    <div className="mb-5">
                      <h5 className="mb-4">Benefits of joining:</h5>
                      <ul className="list-unstyled">
                        <li className="mb-3">
                          <FaCheckCircle className="me-3" />
                          Quick checkout & order tracking
                        </li>
                        <li className="mb-3">
                          <FaCheckCircle className="me-3" />
                          Exclusive festival offers & discounts
                        </li>
                        <li className="mb-3">
                          <FaCheckCircle className="me-3" />
                          Save favorite items & addresses
                        </li>
                        <li className="mb-3">
                          <FaCheckCircle className="me-3" />
                          Priority customer support
                        </li>
                        <li>
                          <FaCheckCircle className="me-3" />
                          Early access to new menus
                        </li>
                      </ul>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="text-center">
                        <p className="mb-3">Already have an account?</p>
                        <Link to="/login" className="btn btn-outline-light btn-lg w-100">
                          Sign In Here
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Banner */}
            <div className="card bg-primary text-white mt-4 d-md-none">
              <div className="card-body p-4 text-center">
                <h5 className="mb-3">Already have an account?</h5>
                <Link to="/login" className="btn btn-outline-light">
                  Sign In Here
                </Link>
              </div>
            </div>
            
            {/* Security Note */}
            <div className="text-center mt-4">
              <p className="text-muted small">
                <FaLock className="me-2" />
                Your information is secured with 256-bit SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;