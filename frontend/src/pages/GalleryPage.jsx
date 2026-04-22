import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import './GalleryPage.css';

const GalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState(['all']);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching gallery data...');
      const response = await axios.get('/gallery', { timeout: 60000 });
      
      console.log('✅ Gallery API Response:', response.data);
      
      let items = [];
      if (response.data.success) {
        items = response.data.gallery || response.data.items || [];
      } else if (Array.isArray(response.data)) {
        items = response.data;
      } else {
        // Fallback mock data for development
        items = [
          {
            _id: '1',
            title: "Onam Sadhya Spread",
            description: "Traditional Onam feast served on banana leaf with 26+ items",
            imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=450&fit=crop",
            category: "Festival",
            featured: true,
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            title: "Christmas Feast",
            description: "Kerala style Christmas celebration with traditional delicacies",
            imageUrl: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=600&h=450&fit=crop",
            category: "Festival",
            featured: true,
            createdAt: new Date().toISOString()
          },
          {
            _id: '3',
            title: "Biriyani Platter",
            description: "Authentic Kerala style biriyani with raita and salad",
            imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a5f8?w=600&h=450&fit=crop",
            category: "Main Course",
            featured: false,
            createdAt: new Date().toISOString()
          },
          {
            _id: '4',
            title: "Traditional Setup",
            description: "Elegant dining setup for grand occasions",
            imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=450&fit=crop",
            category: "Setup",
            featured: false,
            createdAt: new Date().toISOString()
          }
        ];
      }
      
      setGalleryItems(items);
      
      // Extract unique categories
      const uniqueCategories = ['all', ...new Set(items.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      console.log(`✅ Loaded ${items.length} gallery items with ${uniqueCategories.length - 1} categories`);
      
    } catch (err) {
      console.error('❌ Gallery fetch error:', err);
      setError(err.message || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const baseURL = process.env.REACT_APP_API_URL || '';
    return `${baseURL}${imagePath}`;
  };

  const filteredItems = activeCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="gallery-page">
        <div className="loading-container-custom">
          <div className="loading-spinner-custom"></div>
          <p className="loading-text-custom">Loading beautiful moments...</p>
          <p className="text-sm text-gray-500 mt-2 italic">
            First load may take 30-60 seconds if backend is sleeping
          </p>
        </div>
      </div>
    );
  }

  if (error && galleryItems.length === 0) {
    return (
      <div className="gallery-page">
        <div className="empty-gallery">
          <div className="empty-gallery-icon">📸</div>
          <h3 className="empty-gallery-title">Unable to Load Gallery</h3>
          <p className="empty-text">{error}</p>
          <button className="refresh-btn" onClick={fetchGalleryData}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      {/* Hero Banner */}
      <div className="gallery-hero">
        <div className="gallery-hero-content">
          <h1 className="gallery-hero-title">Our Culinary Journey</h1>
          <p className="gallery-hero-subtitle">
            A visual feast celebrating Kerala's rich culinary heritage
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <div className="filter-container">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category === 'all' ? 'All Photos' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="gallery-container">
        {filteredItems.length > 0 ? (
          <>
            <div className="gallery-grid">
              {filteredItems.map((item, index) => (
                <div 
                  key={item._id || index} 
                  className="gallery-item-custom"
                  onClick={() => setSelectedImage(item)}
                >
                  <div className="gallery-image-wrapper-custom">
                    <img 
                      src={getImageUrl(item.imageUrl || item.image)} 
                      alt={item.title || 'Gallery image'}
                      className="gallery-image-custom"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=450&fit=crop';
                        e.target.onerror = null;
                      }}
                    />
                    {item.featured && (
                      <div className="featured-badge-custom">Featured</div>
                    )}
                    <button className="view-btn">
                      🔍
                    </button>
                    <div className="gallery-overlay-custom">
                      <h3 className="gallery-title-custom">{item.title || 'Delicious Moments'}</h3>
                      <span className="gallery-category-custom">
                        {item.category || 'Cuisine'}
                      </span>
                    </div>
                  </div>
                  <div className="gallery-card-footer">
                    <span className="gallery-date">
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.category || 'Uncategorized'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="gallery-stats">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{galleryItems.length}+</span>
                  <span className="stat-label">Moments Captured</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{categories.length - 1}</span>
                  <span className="stat-label">Categories</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">10+</span>
                  <span className="stat-label">Years of Excellence</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-gallery">
            <div className="empty-gallery-icon">🖼️</div>
            <h3 className="empty-gallery-title">No Images Found</h3>
            <p className="empty-text">
              {activeCategory === 'all' 
                ? 'Our gallery is being updated. Check back soon for beautiful visuals!' 
                : `No images available in the "${activeCategory}" category.`}
            </p>
            {activeCategory !== 'all' && (
              <button className="refresh-btn" onClick={() => setActiveCategory('all')}>
                View All Photos
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-modal" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>✕</button>
            <img 
              src={getImageUrl(selectedImage.imageUrl || selectedImage.image)} 
              alt={selectedImage.title}
              className="lightbox-image"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop';
              }}
            />
            {selectedImage.title && (
              <div className="lightbox-caption">{selectedImage.title}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;