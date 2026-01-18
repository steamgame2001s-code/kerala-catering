// frontend/src/pages/FoodMenu.jsx
import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import './FoodMenu.css';

const FoodMenu = () => {
  const [selectedMenu, setSelectedMenu] = useState('');
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [menuCategories, setMenuCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    email: '',
    event: '',
    menu: '',
    comments: ''
  });
  const [submitting, setSubmitting] = useState(false);

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

  // Conditions list
  const conditions = [
    "These rates are applicable only on events above 200 pax",
    "All items are subject to availability",
    "Rate may be changed depending on items & the market rate of the ingredients",
    "You can add any extra items and services, at an additional costs"
  ];

  // Location options
  const locationOptions = [
    { value: '', label: 'Select Location' },
    { value: 'Ernakulam', label: 'Ernakulam' },
    { value: 'Alappuzha', label: 'Alappuzha' }
  ];

  // Event type options
  const eventOptions = [
    { value: '', label: 'Select Event Type' },
    { value: 'Wedding', label: 'Wedding' },
    { value: 'Corporate', label: 'Corporate Event' },
    { value: 'Birthday', label: 'Birthday Party' },
    { value: 'Anniversary', label: 'Anniversary' },
    { value: 'Religious', label: 'Religious Function' },
    { value: 'House Warming', label: 'House Warming' },
    { value: 'Other', label: 'Other' }
  ];

  useEffect(() => {
    fetchFoodData();
  }, []);

  const fetchFoodData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/food');
      
      if (response.data.success && response.data.foodItems) {
        const items = response.data.foodItems;
        setFoodItems(items);
        
        // Extract unique categories for filtering
        const uniqueCategories = ['all'];
        items.forEach(item => {
          if (item.category && !uniqueCategories.includes(item.category)) {
            uniqueCategories.push(item.category);
          }
        });
        
        // Extract unique menu names for dropdown
        const uniqueMenuCategories = [];
        items.forEach(item => {
          if (item.category && !uniqueMenuCategories.includes(item.category)) {
            uniqueMenuCategories.push(item.category);
          }
        });
        
        // Add standard menu options if none exist
        if (uniqueMenuCategories.length === 0) {
          uniqueMenuCategories.push(
            'Standard Menu',
            'Classy Menu', 
            'Elegant Menu',
            'Executive Menu',
            'Grand Menu',
            'Custom Package'
          );
        }
        
        setCategories(uniqueCategories);
        setMenuCategories(uniqueMenuCategories);
        
      } else {
        throw new Error('No food items found');
      }
    } catch (err) {
      console.error('Error fetching food data:', err);
      setError('Failed to load menu. Please try again later.');
      
      // Fallback to default categories
      setCategories(['all', 'Veg', 'Non-Veg', 'Starters', 'Main Course', 'Desserts']);
      setMenuCategories([
        'Standard Menu',
        'Classy Menu', 
        'Elegant Menu',
        'Executive Menu',
        'Grand Menu',
        'Custom Package'
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter items by category
  const filteredItems = activeCategory === 'all' 
    ? foodItems 
    : foodItems.filter(item => item.category === activeCategory);

  // Group items by festival for display
  const groupItemsByFestival = (items) => {
    const grouped = {};
    items.forEach(item => {
      const festivalName = item.festival || 'All Festivals';
      if (!grouped[festivalName]) {
        grouped[festivalName] = [];
      }
      grouped[festivalName].push(item);
    });
    return grouped;
  };

  const groupedItems = groupItemsByFestival(filteredItems);

  // Handle "Talk to us" button click
  const handleTalkToUs = (foodItemName, foodItemCategory) => {
    const menuName = foodItemCategory || foodItemName;
    setSelectedMenu(menuName);
    
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    setFormData(prev => ({
      ...prev,
      menu: menuName
    }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'menu') {
      setSelectedMenu(value);
    }
  };

  // Format phone number
  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0,5)} ${cleaned.slice(5)}`;
    }
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+91 ${cleaned.slice(2,7)} ${cleaned.slice(7)}`;
    }
    return phone;
  };

  // Create WhatsApp message dynamically from form data
  const createWhatsAppMessage = () => {
    const inquiryId = `UP${Date.now().toString().slice(-8)}`;
    const formattedDate = new Date().toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    const formattedPhone = formatPhoneNumber(formData.phone);

    // SIMPLIFIED MESSAGE - Better for WhatsApp encoding
    return `UPASANA CATERING - MENU INQUIRY

CUSTOMER INFORMATION
------------------------------
Name: ${formData.name}
Phone: ${formattedPhone}
Location: ${formData.location}
Email: ${formData.email || 'Not provided'}

EVENT DETAILS
------------------------------
Event Type: ${formData.event || 'Not specified'}
Preferred Menu: ${formData.menu || 'Not selected'}

SPECIAL REQUESTS
------------------------------
${formData.comments || 'No special requests'}

INQUIRY SUMMARY
------------------------------
Inquiry ID: ${inquiryId}
Date: ${formattedDate}
Time: ${formattedTime}
Source: Website Menu Page

Thank you for your inquiry!
We look forward to serving you authentic Kerala cuisine.
Our team will contact you shortly.

This is an automated inquiry from Upasana Catering website.`;
  };

  // Handle WhatsApp Click (from alternative contact buttons)
  const handleWhatsAppClick = () => {
    trackAction('whatsapp', {
      name: formData.name,
      phone: formData.phone,
      userInfo: `Menu Page Form - ${formData.name || 'Anonymous'}`
    });

    const phoneNumber = '919447975836';
    const message = 'Hello Upasana Catering! I am interested in your catering services.';
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  // Handle Call Click (from alternative contact buttons)
  const handleCallClick = () => {
    trackAction('call', {
      name: formData.name,
      phone: formData.phone,
      userInfo: `Menu Page Form - ${formData.name || 'Anonymous'}`
    });

    window.location.href = 'tel:+919447975836';
  };

  // Handle form submission - UPDATED VERSION
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    console.log('🔍 [DEBUG] Form submission started');
    console.log('🔍 [DEBUG] Form data:', formData);
    
    try {
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.location) {
        console.log('❌ [DEBUG] Validation failed - missing fields');
        alert('❌ Please fill in all required fields (Name, Phone, Location)');
        setSubmitting(false);
        return;
      }

      // Validate phone number
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanedPhone = formData.phone.replace(/\D/g, '');
      if (!phoneRegex.test(cleanedPhone) || cleanedPhone.length < 10) {
        console.log('❌ [DEBUG] Validation failed - invalid phone');
        alert('❌ Please enter a valid phone number (minimum 10 digits)');
        setSubmitting(false);
        return;
      }

      console.log('✅ [DEBUG] Form validation passed');
      
      // Generate inquiry ID
      const inquiryId = `UP${Date.now().toString().slice(-8)}`;
      console.log('📋 [DEBUG] Generated Inquiry ID:', inquiryId);

      // TRACK FORM SUBMISSION ACTION
      await trackAction('form', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: `Event: ${formData.event || 'Not specified'}, Menu: ${formData.menu || 'Not selected'}`,
        userInfo: `${formData.name} - ${formData.phone}`
      });
      
      // Step 1: Save to database via backend (NO EMAIL SENDING)
      try {
        console.log('📤 [DEBUG] Saving inquiry to database');
        
        const dbResponse = await axios.post('/email/send-inquiry', {
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
          email: formData.email,
          event: formData.event,
          menu: formData.menu,
          comments: formData.comments
        });
        
        console.log('✅ [DEBUG] Backend response:', dbResponse.data);
        
        if (dbResponse.data.success) {
          console.log('🎉 [DEBUG] Inquiry saved to database! Inquiry ID:', dbResponse.data.inquiryId);
          // Use the WhatsApp URL from backend response if available
          if (dbResponse.data.whatsappUrl) {
            console.log('🔗 [DEBUG] Opening WhatsApp from backend URL');
            window.open(dbResponse.data.whatsappUrl, '_blank');
          }
        }
      } catch (dbError) {
        console.error('❌ [DEBUG] Failed to save to database:', dbError);
        console.error('❌ [DEBUG] Error details:', dbError.response?.data || dbError.message);
        
        // Don't block the flow if database save fails - user can still send via WhatsApp
        console.log('⚠️ [DEBUG] Database save failed, proceeding with WhatsApp only');
      }

      // Step 2: Create and send WhatsApp message (only if not opened from backend)
      console.log('📱 [DEBUG] Creating WhatsApp message');
      const whatsappMessage = createWhatsAppMessage();
      
      // Proper encoding for WhatsApp
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/919447975836?text=${encodedMessage}`;
      
      console.log('🔗 [DEBUG] WhatsApp URL created');
      
      // Step 3: Open WhatsApp if not already opened from backend
      console.log('✅ [DEBUG] Opening WhatsApp');
      window.open(whatsappUrl, '_blank');
      
      // Show success message
      setTimeout(() => {
        alert(`🎉 Inquiry Prepared Successfully!\n\nDear ${formData.name},\n\n✅ WhatsApp has been opened with your inquiry details\n📋 Inquiry ID: ${inquiryId}\n📞 Our team will contact you within 24 hours\n\nThank you for choosing Upasana Catering!`);
      }, 1000);
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        location: '',
        email: '',
        event: '',
        menu: '',
        comments: ''
      });
      setSelectedMenu('');
      
      console.log('✅ [DEBUG] Form reset completed');
      
    } catch (error) {
      console.error('❌ [DEBUG] General error in form submission:', error);
      
      // Show error with fallback options
      alert(`❗ There was an error processing your inquiry.\n\nPlease contact us directly:\n\n📱 WhatsApp: https://wa.me/919447975836\n📧 Email: upasanacaterings@gmail.com\n📞 Call: +91 9447975836\n\nInclude your name and preferred menu.`);
      
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading menu...</p>
      </div>
    );
  }

  if (error && foodItems.length === 0) {
    return (
      <div className="error-container">
        <h2>Menu Not Available</h2>
        <p>{error}</p>
        <button onClick={fetchFoodData} className="retry-btn">Try Again</button>
      </div>
    );
  }

  return (
    <div className="food-menu-container">
      {/* Professional Banner Section */}
      <section className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20 px-6 shadow-xl">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Food Menu
          </h1>
          <p className="text-xl md:text-2xl mb-8">Welcome to a feast of flavors!</p>
          <p className="text-lg max-w-3xl mx-auto">
            A great meal is more than just food, it's an experience. At Upasana Catering, 
            we bring you authentic Kerala cuisine for every occasion. Browse our menu 
            and find your perfect feast.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      {categories.length > 1 && (
        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`category-btn ${activeCategory === category ? 'active' : ''}`}
            >
              {category === 'all' ? 'All Items' : category}
            </button>
          ))}
        </div>
      )}

      {/* Menu Items */}
      <div className="menu-items-section">
        {Object.keys(groupedItems).length > 0 ? (
          Object.keys(groupedItems).map((festivalName) => (
            <div key={festivalName} className="festival-menu-group">
              <h2 className="festival-name">{festivalName}</h2>
              <div className="menu-items-grid">
                {groupedItems[festivalName].map((item) => (
                  <div key={item._id} className="menu-item-card">
                    <div className="menu-item-image">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                        }}
                      />
                    </div>
                    <div className="menu-item-content">
                      <div className="menu-item-header">
                        <h3 className="menu-item-name">{item.name}</h3>
                      
                      </div>
                      {item.description && (
                        <p className="menu-item-description">{item.description}</p>
                      )}
                      {item.category && (
                        <span className="menu-item-category">{item.category}</span>
                      )}
                      
                      <div className="menu-item-actions">
                        <p className="conditions-note">
                          <span className="text-red-500">*</span> Conditions Apply
                        </p>
                        <button 
                          className="talk-to-us-btn"
                          onClick={() => handleTalkToUs(item.name, item.category)}
                          disabled={submitting}
                        >
                          {submitting ? 'Processing...' : 'Talk to us'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-items-message">
            <p>No food items available for this category.</p>
            <button onClick={() => setActiveCategory('all')} className="view-all-btn">View All Items</button>
          </div>
        )}
      </div>

      {/* Conditions Section */}
      <div className="conditions-section">
        <h3>Important Conditions</h3>
        <ul className="conditions-list">
          {conditions.map((condition, index) => (
            <li key={index}>{condition}</li>
          ))}
        </ul>
      </div>

      {/* Contact Form Section */}
      <div className="contact-section" id="contact-form">
        <div className="contact-header">
          <h2>Have Any Questions?</h2>
          <p className="contact-subtitle">Talk To Our Team</p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Name */}
            <div className="form-group">
              <label htmlFor="name">
                Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Your full name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="phone">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>

            {/* Location */}
            <div className="form-group">
              <label htmlFor="location">
                Location <span className="required">*</span>
              </label>
              <select
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleInputChange}
                className="form-select"
                disabled={submitting}
              >
                {locationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>

            {/* Event */}
            <div className="form-group">
              <label htmlFor="event">Event Type</label>
              <select
                id="event"
                name="event"
                value={formData.event}
                onChange={handleInputChange}
                className="form-select"
                disabled={submitting}
              >
                {eventOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Menu */}
            <div className="form-group">
              <label htmlFor="menu">Preferred Menu</label>
              <select
                id="menu"
                name="menu"
                value={formData.menu}
                onChange={handleInputChange}
                className="form-select"
                disabled={submitting}
              >
                <option value="">Select a menu</option>
                {menuCategories.map((menu) => (
                  <option key={menu} value={menu}>
                    {menu}
                  </option>
                ))}
              </select>
            </div>

            {/* Comments */}
            <div className="form-group full-width">
              <label htmlFor="comments">Comments / Special Requests</label>
              <textarea
                id="comments"
                name="comments"
                placeholder="Any special requirements, dietary restrictions, or questions..."
                rows="4"
                value={formData.comments}
                onChange={handleInputChange}
                disabled={submitting}
              ></textarea>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Processing...' : 'Send Inquiry via WhatsApp'}
          </button>
          
          {/* Update the button text */}
          <p className="text-center text-gray-500 text-sm mt-2">
            Note: Inquiry will be saved to our system and WhatsApp will open automatically
          </p>
          
          {/* Alternative Contact Methods */}
          <div className="alternative-contact mt-6">
            <p className="text-center text-gray-600 mb-4">Or reach us directly:</p>
            <div className="flex gap-4 justify-center">
              <button 
                type="button"
                onClick={handleWhatsAppClick} 
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
              >
                <i className="fab fa-whatsapp text-xl"></i>
                WhatsApp Us
              </button>

              <button 
                type="button"
                onClick={handleCallClick} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
              >
                <i className="fas fa-phone text-xl"></i>
                Call Us
              </button>
            </div>
          </div>
          
          <div className="privacy-note">
            <p className="text-sm text-gray-500 text-center mt-4">
              By submitting, you agree to be contacted via WhatsApp. 
              Your information will be used only to respond to your inquiry.
            </p>
            <p className="text-sm text-gray-500 text-center mt-2">
              Direct contact: 📞 +91 9447975836 | 📧 upasanacatering@gmail.com
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoodMenu;