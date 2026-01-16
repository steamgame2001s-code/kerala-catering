import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
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
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate and scroll to top
  const handleNavigation = (path) => {
    navigate(path);
    // Use setTimeout to ensure navigation completes first
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
  };

  const handleWhatsAppClick = () => {
    trackAction('whatsapp', {
      userInfo: 'Footer WhatsApp Button'
    });

    const phoneNumber = '919447975836';
    const message = 'Hello Upasana Catering! I am interested in your services.';
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/upasanacaterers/', '_blank');
  };

  const handlePhoneClick = () => {
    trackAction('call', {
      userInfo: 'Footer Phone Number'
    });
    
    window.location.href = 'tel:+919447975836';
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:upasanacatering@gmail.com';
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Logo Section */}
          <div className="footer-logo">
            <h3>UPASANA</h3>
            <p>CATERING, SERVICE AND EVENTS</p>
            <p>Authentic Kerala cuisine delivered to your doorstep.</p>
            <br />
            <p>Serving customers across Alappuzha and Ernakulam districts</p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <button 
                  onClick={() => handleNavigation('/')} 
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'none', padding: 0, font: 'inherit', textAlign: 'left', width: '100%' }}
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/menu')} 
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'none', padding: 0, font: 'inherit', textAlign: 'left', width: '100%' }}
                >
                  Menu
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/festivals')} 
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'none', padding: 0, font: 'inherit', textAlign: 'left', width: '100%' }}
                >
                  Festivals
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/gallery')} 
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'none', padding: 0, font: 'inherit', textAlign: 'left', width: '100%' }}
                >
                  Gallery
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/about')} 
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'none', padding: 0, font: 'inherit', textAlign: 'left', width: '100%' }}
                >
                  About
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p>
              <i className="fas fa-map-marker-alt"></i> 
              Upasana Caterings, Kuthiathodu, Cherthala, Alappuzha, Kerala, India
            </p>
            <p>
              <i className="fas fa-phone"></i> 
              <button 
                onClick={handlePhoneClick}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  font: 'inherit'
                }}
              >
                +91 94479 75836
              </button>
            </p>
            <p>
              <i className="fas fa-envelope"></i> 
              <button
                onClick={handleEmailClick}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  font: 'inherit'
                }}
              >
                upasanacatering@gmail.com
              </button>
            </p>
            
            {/* Social Media */}
            <div className="social-icons">
              <button 
                className="social-icon instagram"
                onClick={handleInstagramClick}
                aria-label="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </button>
              
              <button 
                className="social-icon whatsapp"
                onClick={handleWhatsAppClick}
                aria-label="WhatsApp"
              >
                <i className="fab fa-whatsapp"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 1998 UPASANA Catering. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;