import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebook } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (formData.email === 'demo@keralacatering.com' && formData.password === 'password') {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid email or password');
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleSocialLogin = (provider) => {
    toast.success(`Continue with ${provider} (demo)`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="md:flex">
          {/* Left Side - Image */}
          <div className="md:w-2/5 bg-gradient-to-br from-primary to-secondary p-12 hidden md:flex flex-col justify-center text-white">
            <div>
              <h2 className="text-4xl font-playfair font-bold mb-6">Welcome Back!</h2>
              <p className="text-lg opacity-90 mb-10">
                Sign in to access your orders, track deliveries, and manage your account.
              </p>
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Track Orders</h4>
                    <p className="text-sm opacity-80">Real-time order tracking</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                    <span className="text-2xl">💳</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Quick Checkout</h4>
                    <p className="text-sm opacity-80">Save payment methods</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Exclusive Offers</h4>
                    <p className="text-sm opacity-80">Special festival discounts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-3/5 p-8 md:p-12">
            <div className="text-center mb-10">
              <Link to="/" className="inline-flex items-center space-x-2 mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">KC</span>
                </div>
                <span className="text-2xl font-bold text-dark">Kerala Catering</span>
              </Link>
              <h1 className="text-3xl font-bold text-dark mb-3">Sign In to Your Account</h1>
              <p className="text-gray-600">Enter your credentials to continue</p>
            </div>

            {/* Social Login Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => handleSocialLogin('Google')}
                className="flex-1 flex items-center justify-center gap-3 py-3 border-2 border-gray-300 rounded-xl hover:border-primary transition-colors"
              >
                <FaGoogle className="text-red-500 text-xl" />
                <span className="font-medium">Google</span>
              </button>
              <button
                onClick={() => handleSocialLogin('Facebook')}
                className="flex-1 flex items-center justify-center gap-3 py-3 border-2 border-gray-300 rounded-xl hover:border-primary transition-colors"
              >
                <FaFacebook className="text-blue-600 text-xl" />
                <span className="font-medium">Facebook</span>
              </button>
            </div>

            <div className="flex items-center my-8">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-500">Or continue with email</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="remember" className="mr-2" />
                    <label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>
                  <Link to="/forgot-password" className="text-primary hover:text-secondary font-medium">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-bold mb-2">Demo Credentials:</h4>
              <p className="text-sm text-gray-600">Email: demo@keralacatering.com</p>
              <p className="text-sm text-gray-600">Password: password</p>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-8">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-bold hover:text-secondary">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;