// frontend/src/pages/GalleryPage.jsx
import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';

const GalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('/gallery');
        
        console.log('Gallery API Response:', response.data);
        
        if (response.data.success) {
          setGalleryItems(response.data.gallery || response.data.items || response.data);
        } else if (Array.isArray(response.data)) {
          setGalleryItems(response.data);
        } else {
          // Create mock data if API returns unexpected format
          setGalleryItems([
            {
              _id: '1',
              title: "Onam Sadhya Spread",
              description: "Traditional Onam feast served on banana leaf",
              imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
              category: "festival",
              featured: true
            },
            {
              _id: '2',
              title: "Christmas Feast",
              description: "Kerala style Christmas celebration",
              imageUrl: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
              category: "festival",
              featured: true
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching gallery:', err);
        setError('Failed to load gallery. Please check if backend server is running.');
        // Set mock data for development
        setGalleryItems([
          {
            _id: '1',
            title: "Onam Sadhya Spread",
            description: "Traditional Onam feast served on banana leaf",
            imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            category: "festival",
            featured: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

  // Extract unique categories from gallery items
  const allCategories = ['all'];
  if (galleryItems.length > 0) {
    const uniqueCategories = [...new Set(galleryItems.map(item => item.category).filter(Boolean))];
    allCategories.push(...uniqueCategories);
  } else {
    allCategories.push('festival', 'food', 'kitchen', 'event');
  }
  
  const filteredItems = activeCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg font-semibold">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error && galleryItems.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-4 bg-gray-50">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-lg">
          <div className="text-orange-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition-all duration-300 hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-page bg-gray-50 min-h-screen">
      {/* Professional Banner - Changed to white text */}
      <section className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20 px-6 shadow-xl">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Our Gallery
          </h1>
          <p className="text-xl md:text-2xl">
            A visual journey through Kerala's culinary traditions
          </p>
        </div>
      </section>
<br></br>
      {/* Category Filters */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-3xl font-bold text-gray-800">Gallery Collection</h2>
            <span className="bg-orange-100 text-orange-700 px-5 py-2 rounded-full font-semibold">
              {filteredItems.length} {filteredItems.length === 1 ? 'image' : 'images'}
            </span>
          </div>
          <p className="text-gray-600 mt-2">
            Explore our collection of authentic Kerala culinary experiences
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full capitalize transition-all duration-300 font-semibold ${
                activeCategory === category
                  ? 'bg-orange-500 text-white shadow-lg transform -translate-y-1'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              {category === 'all' ? 'All Photos' : category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div 
                key={item._id} 
                className="gallery-item bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200"
              >
                <div className="relative">
                  <img 
                    src={item.imageUrl || item.image} 
                    alt={item.title}
                    className="w-full h-72 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  {item.featured && (
                    <span className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      Featured
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <h3 className="text-white text-2xl font-bold">{item.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4 leading-relaxed">{item.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                      {item.category || 'Uncategorized'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">📷</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No images found</h3>
            <p className="text-gray-500 mb-6">No gallery items available for this category.</p>
            <button 
              onClick={() => setActiveCategory('all')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg font-semibold transition-all duration-300 transform hover:-translate-y-1"
            >
              View All Photos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;