import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaWhatsapp, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaShoppingBag,
  FaCalendarAlt,
  FaComments
} from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    email: '',
    event: '',
    preferredMenu: '',
    comments: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Create WhatsApp message
    const whatsappMessage = `
*Catering Inquiry - Upsana Catering*

👤 *Name:* ${formData.name}
📞 *Phone:* ${formData.phone}
📍 *Location:* ${formData.location}
📧 *Email:* ${formData.email || 'Not provided'}
🎉 *Event:* ${formData.event || 'Not specified'}
🍽️ *Preferred Menu:* ${formData.preferredMenu || 'Not specified'}
💭 *Comments:* ${formData.comments || 'No comments'}

_Thank you for your inquiry! We'll contact you soon._
    `.trim();

    // WhatsApp number (replace with your actual number)
    const whatsappNumber = "919387431366"; // Your number
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Open WhatsApp
    window.open(whatsappURL, '_blank');
    
    // Show success message
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          location: '',
          email: '',
          event: '',
          preferredMenu: '',
          comments: ''
        });
        setSubmitted(false);
      }, 3000);
    }, 1500);
  };

  const quickContactButtons = [
    {
      icon: <FaWhatsapp className="fa-2x" />,
      title: "WhatsApp",
      text: "Chat with us instantly",
      color: "btn-success",
      action: () => window.open(`https://wa.me/919387431366?text=Hello%20Upsana%20Catering!%20I'm%20interested%20in%20your%20services.`, '_blank')
    },
    {
      icon: <FaPhone className="fa-2x" />,
      title: "Call Us",
      text: "+91 93874 31366",
      color: "btn-primary",
      action: () => window.location.href = 'tel:+919387431366'
    },
    {
      icon: <FaEnvelope className="fa-2x" />,
      title: "Email",
      text: "info@upsanacatering.com",
      color: "btn-info",
      action: () => window.location.href = 'mailto:info@upsanacatering.com'
    }
  ];

  return (
    <div className="contact-page">
      <div className="container py-5">
        {/* Hero Section */}
        <div className="row mb-5">
          <div className="col-12 text-center">
            <h1 className="fw-bold mb-3">Talk To Our Team</h1>
            <p className="lead text-muted">
              Have questions about our catering services? Get in touch with us!
            </p>
          </div>
        </div>

        {/* Quick Contact Buttons */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="row g-4">
              {quickContactButtons.map((btn, index) => (
                <div key={index} className="col-md-4">
                  <button 
                    className={`btn ${btn.color} w-100 h-100 py-4`}
                    onClick={btn.action}
                    style={{ minHeight: '120px' }}
                  >
                    <div className="mb-3">{btn.icon}</div>
                    <h5 className="mb-2">{btn.title}</h5>
                    <p className="mb-0 small">{btn.text}</p>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="row">
          {/* Left Column - Contact Form */}
          <div className="col-lg-8 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white">
                <h4 className="mb-0">Send Us Your Inquiry</h4>
                <p className="text-muted small mb-0">Fill the form and we'll contact you</p>
              </div>
              
              <div className="card-body">
                {submitted ? (
                  <div className="text-center py-5">
                    <FaCheckCircle className="fa-5x text-success mb-4" />
                    <h3>Inquiry Sent Successfully!</h3>
                    <p className="text-muted">
                      Thank you for your inquiry. We've opened WhatsApp for you to complete the conversation.
                    </p>
                    <p className="text-muted">
                      Our team will contact you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          <FaCheckCircle className="me-2 text-primary" />
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          <FaPhone className="me-2 text-primary" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className="form-control"
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          <FaMapMarkerAlt className="me-2 text-primary" />
                          Location *
                        </label>
                        <input
                          type="text"
                          name="location"
                          className="form-control"
                          placeholder="City, Area, Pincode"
                          value={formData.location}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          <FaEnvelope className="me-2 text-primary" />
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          <FaCalendarAlt className="me-2 text-primary" />
                          Event
                        </label>
                        <input
                          type="text"
                          name="event"
                          className="form-control"
                          placeholder="e.g., Wedding, Birthday, Corporate"
                          value={formData.event}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          <FaShoppingBag className="me-2 text-primary" />
                          Preferred Menu
                        </label>
                        <select
                          name="preferredMenu"
                          className="form-select"
                          value={formData.preferredMenu}
                          onChange={handleChange}
                        >
                          <option value="">Select a menu</option>
                          <option value="Standard Menu">Standard Menu</option>
                          <option value="Classy Menu">Classy Menu</option>
                          <option value="Elegant Menu">Elegant Menu</option>
                          <option value="Executive Menu">Executive Menu</option>
                          <option value="Grand Menu">Grand Menu</option>
                          <option value="Custom Package">Custom Package</option>
                        </select>
                      </div>
                      
                      <div className="col-12 mb-4">
                        <label className="form-label">
                          <FaComments className="me-2 text-primary" />
                          Comments / Special Requests
                        </label>
                        <textarea
                          name="comments"
                          className="form-control"
                          rows="4"
                          placeholder="Tell us about your event, number of guests, dietary requirements, etc."
                          value={formData.comments}
                          onChange={handleChange}
                        ></textarea>
                      </div>
                      
                      <div className="col-12">
                        <div className="d-grid gap-2">
                          <button 
                            type="submit" 
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <LoadingSpinner small={true} />
                                <span className="ms-2">Sending...</span>
                              </>
                            ) : (
                              <>
                                <FaWhatsapp className="me-2" />
                                Send via WhatsApp & Email
                              </>
                            )}
                          </button>
                          
                          <p className="text-muted small text-center mt-3">
                            By submitting, you'll be redirected to WhatsApp to continue the conversation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Info */}
          <div className="col-lg-4">
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Contact Information</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <h6 className="text-muted mb-3">
                    <FaMapMarkerAlt className="me-2" />
                    Our Locations
                  </h6>
                  <div className="mb-3">
                    <strong>Main Kitchen</strong>
                    <p className="mb-1 small">Kochi, Kerala</p>
                    <p className="small text-muted">Serving all over Kerala</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h6 className="text-muted mb-3">
                    <FaClock className="me-2" />
                    Business Hours
                  </h6>
                  <div className="mb-2">
                    <strong>Monday - Saturday</strong>
                    <p className="mb-0 small">8:00 AM - 10:00 PM</p>
                  </div>
                  <div>
                    <strong>Sunday</strong>
                    <p className="mb-0 small">9:00 AM - 9:00 PM</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h6 className="text-muted mb-3">
                    <FaEnvelope className="me-2" />
                    Quick Response
                  </h6>
                  <p className="small">
                    We typically respond within 30 minutes during business hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Conditions Card */}
            <div className="card shadow-sm border-warning">
              <div className="card-header bg-warning bg-opacity-10">
                <h5 className="mb-0 text-warning">Important Conditions</h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled small">
                  <li className="mb-2">
                    <FaCheckCircle className="me-2 text-success" />
                    Rates applicable for events above 200 pax
                  </li>
                  <li className="mb-2">
                    <FaCheckCircle className="me-2 text-success" />
                    All items subject to availability
                  </li>
                  <li className="mb-2">
                    <FaCheckCircle className="me-2 text-success" />
                    Rates may change based on market prices
                  </li>
                  <li className="mb-2">
                    <FaCheckCircle className="me-2 text-success" />
                    Extra items/services at additional cost
                  </li>
                  <li className="mb-2">
                    <FaCheckCircle className="me-2 text-success" />
                    Minimum 3 days advance booking required
                  </li>
                </ul>
                
                <div className="mt-3">
                  <Link to="/menu" className="btn btn-outline-primary btn-sm w-100">
                    <FaShoppingBag className="me-2" />
                    View Full Menu
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;