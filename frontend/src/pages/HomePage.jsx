// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCheck, FaShippingFast, FaCreditCard, FaHeadset, FaArrowRight } from 'react-icons/fa';
import VideoBanner from '../components/VideoBanner';
import axios from '../api/axiosConfig';
import './HomePage.css';

const HomePage = () => {
  const [festivals, setFestivals] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaCheck />,
      title: "100% Authentic Taste",
      description: "Traditional recipes passed down through generations"
    },
    {
      icon: <FaShippingFast />,
      title: "Free Delivery",
      description: "Free delivery on orders above ₹2000"
    },
    {
      icon: <FaCreditCard />,
      title: "Secure Payment",
      description: "100% secure payments with Razorpay"
    },
    {
      icon: <FaHeadset />,
      title: "24/7 Support",
      description: "Dedicated customer support for your queries"
    }
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [festivalsRes, galleryRes, foodRes] = await Promise.all([
        axios.get('/festivals'),
        axios.get('/gallery'),
        axios.get('/food')
      ]);

      // Process festivals - get first 5
      if (festivalsRes.data?.success) {
        setFestivals((festivalsRes.data.festivals || []).slice(0, 5));
      } else if (Array.isArray(festivalsRes.data)) {
        setFestivals(festivalsRes.data.slice(0, 5));
      } else {
        setFestivals([]);
      }

      // Process gallery - get first 5
      if (galleryRes.data?.success) {
        setGalleryItems((galleryRes.data.gallery || galleryRes.data.items || []).slice(0, 5));
      } else if (Array.isArray(galleryRes.data)) {
        setGalleryItems(galleryRes.data.slice(0, 5));
      } else {
        setGalleryItems([]);
      }

      // Process food items - get first 8 featured/best sellers (increased from 5)
      let foodData = [];
      
      if (foodRes.data?.success && foodRes.data.foodItems) {
        foodData = foodRes.data.foodItems;
      } else if (Array.isArray(foodRes.data)) {
        foodData = foodRes.data;
      } else if (foodRes.data?.foodItems) {
        foodData = foodRes.data.foodItems;
      }
      
      // Filter and limit to 8 items
      const featuredFood = foodData
        .filter(item => {
          // Include items that are active and available
          const isActive = item.isActive !== false; // Default to true if not set
          const isAvailable = item.isAvailable !== false; // Default to true if not set
          return isActive && isAvailable;
        })
        .sort((a, b) => {
          // Prioritize best sellers first
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          
          // Then prioritize items with displayOnHome flag
          if (a.displayOnHome && !b.displayOnHome) return -1;
          if (!a.displayOnHome && b.displayOnHome) return 1;
          
          // Finally sort by creation date or name
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        })
        .slice(0, 8);
      
      setFoodItems(featuredFood);

    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays on error
      setFestivals([]);
      setGalleryItems([]);
      setFoodItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle food item click - navigates to FoodMenu and scrolls to form
  const handleFoodItemClick = (item) => {
    // Navigate to the FoodMenu page
    navigate('/menu', { 
      state: { 
        scrollToForm: true,
        selectedMenu: item.category || item.name
      } 
    });
  };

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="spinner"></div>
        <p className="loading-text">Loading delicious content...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <VideoBanner />

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="brand-logo">
              <span className="brand-name">UPASANA</span>
              <span className="brand-tagline">CATERING SERVICES</span>
            </div>
            <h1 className="hero-title">
              <span className="hero-title-highlight">Taste the Authentic Kerala</span> 
            </h1>
            <p className="hero-subtitle">
              Experience traditional festival feasts delivered to your doorstep. From Onam Sadhya to Christmas specials, we bring Kerala to you.
            </p>
            <div className="hero-actions">
              <Link to="/festivals" className="hero-button">
                Explore Festivals
              </Link>
              <Link to="/menu" className="hero-button secondary">
                View Full Menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FESTIVALS SECTION - Horizontal Scroll */}
      {festivals.length > 0 && (
        <section className="section-white">
          <div className="container">
            <div className="section-header">
              <div className="section-title-wrapper">
                <h2 className="section-title">Festival Specials</h2>
                <p className="section-subtitle">
                  Celebrate every festival with our authentic traditional feasts
                </p>
              </div>
              <Link to="/festivals" className="view-all-link">
                View All <FaArrowRight className="arrow-icon" />
              </Link>
            </div>

            <div className="horizontal-scroll-container">
              <div className="horizontal-scroll">
                {festivals.map(festival => (
                  <div key={festival._id} className="festival-card">
                    <div className="festival-image-container">
                      <img
                        src={festival.image || festival.bannerImage || '/default-festival.jpg'}
                        alt={festival.name}
                        className="festival-image"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                          e.target.onerror = null; // Prevent infinite loop
                        }}
                      />
                    </div>
                    <div className="festival-content">
                      <h3 className="festival-name">{festival.name}</h3>
                      <p className="festival-description">
                        {festival.description || 'Traditional festival feast'}
                      </p>
                      <div className="festival-footer">
                        <Link 
                          to={`/festival/${festival.slug || festival._id}`} 
                          className="festival-link"
                        >
                          Explore <FaArrowRight />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOD ITEMS SECTION - Horizontal Scroll */}
      {foodItems.length > 0 && (
        <section className="section-gray">
          <div className="container">
            <div className="section-header">
              <div className="section-title-wrapper">
                <h2 className="section-title">Our Menu Highlights</h2>
              </div>
              <Link to="/menu" className="view-all-link">
                View Full Menu <FaArrowRight className="arrow-icon" />
              </Link>
            </div>

            <div className="horizontal-scroll-container">
              <div className="horizontal-scroll">
                {foodItems.map(item => (
                  <div 
                    key={item._id} 
                    className="food-item-card"
                    onClick={() => handleFoodItemClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="food-image-container">
                      <img 
                        src={item.image || '/default-food.jpg'} 
                        alt={item.name}
                        className="food-image"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                          e.target.onerror = null;
                        }}
                      />
                      {item.isBestSeller && (
                        <div className="best-seller-badge">
                          Best Seller
                        </div>
                      )}
                    </div>
                    <div className="food-content">
                      <h4 className="food-name">{item.name}</h4>
                      {item.category && (
                        <span className="food-category">
                          {item.category}
                        </span>
                      )}
                      <div className="food-view-details">
                        Click for quote →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Added a subtle instruction note */}
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
              </p>
            </div>
          </div>
        </section>
      )}

      {/* GALLERY SECTION - Horizontal Scroll */}
      {galleryItems.length > 0 && (
        <section className="section-white">
          <div className="container">
            <div className="section-header">
              <div className="section-title-wrapper">
                <h2 className="section-title">Gallery</h2>
                <p className="section-subtitle">A glimpse of our culinary journey</p>
              </div>
              <Link to="/gallery" className="view-all-link">
                View All <FaArrowRight className="arrow-icon" />
              </Link>
            </div>

            <div className="horizontal-scroll-container">
              <div className="horizontal-scroll">
                {galleryItems.map(item => (
                  <div key={item._id} className="gallery-item">
                    <div className="gallery-image-wrapper">
                      <img 
                        src={item.imageUrl || item.image || '/default-gallery.jpg'} 
                        alt={item.title || 'Gallery image'}
                        className="gallery-image"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                          e.target.onerror = null;
                        }}
                      />
                      <div className="gallery-overlay">
                        <span className="gallery-title">
                          {item.title || 'Our Service'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURES SECTION */}
      <section className="section-gray">
        <div className="container">
          <div className="features-header">
            <h2 className="section-title">Why Choose Us?</h2>
            <p className="section-subtitle">
              We combine tradition with convenience to deliver authentic Kerala cuisine
            </p>
          </div>

          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon-wrapper">
                  {f.icon}
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-description">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;