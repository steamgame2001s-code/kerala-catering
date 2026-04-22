import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const trackAction = async (type, additionalData = {}) => {
    try {
      await axios.post('/actions/log', {
        type,
        page: window.location.pathname,
        ...additionalData,
      });
    } catch (error) {
      console.error('Error tracking action:', error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppClick = () => {
    trackAction('whatsapp', { userInfo: 'Footer WhatsApp Button' });
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
    trackAction('call', { userInfo: 'Footer Phone Number' });
    window.location.href = 'tel:+919447975836';
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:upasanacatering@gmail.com';
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
    { label: 'Festivals', path: '/festivals' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'About', path: '/about' },
  ];

  return (
    <>
      <footer className="footer">
        <div className="footer-container">

          {/* Main Content */}
          <div className="footer-top">
            <div className="footer-content">

              {/* Brand */}
              <div className="footer-logo">
                <h3 className="footer-logo-name">
                  Up<span>a</span>sana
                </h3>
                <p className="footer-logo-tagline">Catering, Service &amp; Events</p>
                <div className="footer-logo-divider" />
                <p className="footer-logo-desc">
                  Authentic Kerala cuisine crafted with tradition and care —
                  delivered to your doorstep for every celebration.
                </p>
                <span className="footer-logo-service-area">
                  <i className="fas fa-map-marker-alt" />
                  Serving Alappuzha &amp; Ernakulam districts
                </span>
              </div>

              {/* Quick Links */}
              <div className="footer-links">
                <h4>Navigation</h4>
                <ul>
                  {navLinks.map(({ label, path }) => (
                    <li key={path}>
                      <button
                        className="footer-nav-btn"
                        onClick={() => handleNavigation(path)}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div className="footer-contact">
                <h4>Get in Touch</h4>

                <div className="footer-contact-item">
                  <div className="footer-contact-icon">
                    <i className="fas fa-map-marker-alt" />
                  </div>
                  <div className="footer-contact-text">
                    <span className="footer-contact-label">Address</span>
                    <span className="footer-contact-value">
                      Kuthiathodu, Cherthala,<br />
                      Alappuzha, Kerala, India
                    </span>
                  </div>
                </div>

                <div className="footer-contact-item">
                  <div className="footer-contact-icon">
                    <i className="fas fa-phone" />
                  </div>
                  <div className="footer-contact-text">
                    <span className="footer-contact-label">Phone</span>
                    <button className="footer-contact-link" onClick={handlePhoneClick}>
                      +91 94479 75836
                    </button>
                  </div>
                </div>

                <div className="footer-contact-item">
                  <div className="footer-contact-icon">
                    <i className="fas fa-envelope" />
                  </div>
                  <div className="footer-contact-text">
                    <span className="footer-contact-label">Email</span>
                    <button className="footer-contact-link" onClick={handleEmailClick}>
                      upasanacatering@gmail.com
                    </button>
                  </div>
                </div>

                <div className="social-icons">
                  <button
                    className="social-icon instagram"
                    onClick={handleInstagramClick}
                    aria-label="Follow us on Instagram"
                    title="Instagram"
                  >
                    <i className="fab fa-instagram" />
                  </button>
                  <button
                    className="social-icon whatsapp"
                    onClick={handleWhatsAppClick}
                    aria-label="Chat with us on WhatsApp"
                    title="WhatsApp"
                  >
                    <i className="fab fa-whatsapp" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div className="footer-divider" />

          <div className="footer-bottom">
            <p className="footer-bottom-copy">
              &copy; 1998&ndash;{currentYear} <strong>Upasana Catering</strong>. All rights reserved.
            </p>
            <span className="footer-bottom-badge">Est. 1998 · Kerala, India</span>
          </div>

        </div>
      </footer>

      {/* Scroll to top */}
      <button
        className={`footer-scroll-top${showScrollTop ? ' visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Back to top"
      >
        <i className="fas fa-chevron-up" />
      </button>
    </>
  );
};

export default Footer;