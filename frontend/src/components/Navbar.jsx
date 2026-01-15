import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import './Navbar.css';
import LogoImage from './Logo.jpg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Track user actions
  const trackAction = async (type, additionalData = {}) => {
    try {
      await axios.post('/actions/log', {
        type,
        page: window.location.pathname,
        ...additionalData
      });
    } catch (error) {
      console.error('Error tracking action:', error);
      // Fail silently - don't disrupt user experience
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  const handleWhatsAppClick = () => {
    // Track WhatsApp click
    trackAction('whatsapp', {
      userInfo: 'Navbar WhatsApp Button'
    });

    const phoneNumber = '919447975836';
    const message = 'Hello Upasana Catering! I am interested in your services.';
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  const handleCallClick = () => {
    // Track Call click
    trackAction('call', {
      userInfo: 'Navbar Call Button'
    });

    window.location.href = 'tel:+919447975836';
  };

  const handleAdminLogin = () => {
    navigate('/admin/login');
    setIsOpen(false);
  };

  const menuItems = [
    { path: '/', label: 'Home', icon: 'fas fa-home' },
    { path: '/menu', label: 'Menu', icon: 'fas fa-utensils' },
    { path: '/festivals', label: 'Festivals', icon: 'fas fa-star' },
    { path: '/gallery', label: 'Gallery', icon: 'fas fa-images' },
    { path: '/about', label: 'About', icon: 'fas fa-info-circle' },
  ];

  return (
    <>
      <header className="navbar-professional">
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-brand">
            <Link to="/" className="logo-link">
              <div className="logo-wrapper">
                <img 
                  src={LogoImage} 
                  alt="Upasana Catering" 
                  className="logo-image" 
                />
                <div className="logo-text">
                  <span className="logo-main">UPASANA</span>
                  <span className="logo-sub">CATERING SERVICES</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="navbar-nav">
            <ul className="nav-list">
              {menuItems.map((item) => (
                <li key={item.label} className="nav-item">
                  <Link 
                    to={item.path} 
                    className="nav-link"
                    onClick={() => setIsOpen(false)}
                  >
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Side - Search, Login Icon & Buttons */}
          <div className="navbar-right">
            {/* Search Form */}
            <div className="search-container">
              <form className="search-form" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn" aria-label="Search">
                  <i className="fas fa-search"></i>
                </button>
              </form>
            </div>

            {/* Admin Login Icon */}
            <button 
              className="login-icon-btn"
              onClick={handleAdminLogin}
              aria-label="Admin Login"
              title="Admin Login"
            >
              <i className="fas fa-user-circle"></i>
            </button>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="btn-whatsapp" 
                onClick={handleWhatsAppClick}
                aria-label="Chat on WhatsApp"
              >
                <i className="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </button>

              <button 
                className="btn-call"
                onClick={handleCallClick}
                aria-label="Call us"
              >
                <i className="fas fa-phone"></i>
                <span>Call Us</span>
              </button>
            </div>
          </div>

          {/* Mobile Toggle Button */}
          <button 
            className="mobile-toggle" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger">
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="mobile-overlay" onClick={() => setIsOpen(false)}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            {/* Mobile Menu Header */}
            <div className="mobile-header">
              <Link to="/" className="mobile-logo" onClick={() => setIsOpen(false)}>
                <img src={LogoImage} alt="Upasana" className="mobile-logo-img" />
                <div>
                  <div className="mobile-logo-main">UPASANA</div>
                  <div className="mobile-logo-sub">CATERING</div>
                </div>
              </Link>
              <button 
                className="mobile-close" 
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Mobile Search */}
            <form className="mobile-search-form" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-search-input"
              />
              <button type="submit" className="mobile-search-btn">
                <i className="fas fa-search"></i>
              </button>
            </form>

            {/* Mobile Navigation */}
            <nav className="mobile-nav">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="mobile-nav-item"
                  onClick={() => setIsOpen(false)}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Admin Login in Mobile Menu */}
              <button 
                className="mobile-nav-item"
                onClick={handleAdminLogin}
                style={{width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer'}}
              >
                <i className="fas fa-user-circle"></i>
                <span>Admin Login</span>
              </button>
            </nav>

            {/* Mobile Contact Buttons */}
            <div className="mobile-contact">
              <button 
                className="mobile-btn-whatsapp" 
                onClick={handleWhatsAppClick}
              >
                <i className="fab fa-whatsapp"></i>
                WhatsApp
              </button>
              <button 
                className="mobile-btn-call"
                onClick={handleCallClick}
              >
                <i className="fas fa-phone"></i>
                Call +91 94479 75836
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="nav-spacer"></div>
    </>
  );
};

export default Navbar;