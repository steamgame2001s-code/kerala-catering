// frontend/src/pages/FestivalDetailPage.jsx - FIXED VERSION WITH PROFESSIONAL GALLERY
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Helper function to get absolute image URLs
const getAbsoluteImageUrl = (url) => {
  if (!url) return null;
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  const apiUrl = process.env.REACT_APP_API_URL || '';
  
  if (url.startsWith('/uploads')) {
    return `${apiUrl}${url}`;
  }
  
  return `${apiUrl}/${url.replace(/^\//, '')}`;
};

// Menu Gallery Component with Modal
const MenuGallery = ({ festival }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  console.log('🖼️ MenuGallery rendering with festival:', festival?.name);
  console.log('📸 Menu images:', festival?.menuImages);
  
  if (!festival?.menuImages || festival.menuImages.length === 0) {
    console.log('⚠️ No menu images found');
    return (
      <div className="menu-gallery mb-12">
        <h3 className="text-3xl font-bold mb-6 text-gray-800">
          Festival Menu Gallery
        </h3>
        <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-300">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg">No menu images uploaded yet.</p>
          <p className="text-gray-400 text-sm mt-2">Check back soon for menu previews.</p>
        </div>
      </div>
    );
  }
  
  const openImageModal = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
    setModalOpen(true);
    // Prevent background scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const goToNextImage = () => {
    const nextIndex = (currentIndex + 1) % festival.menuImages.length;
    setSelectedImage(festival.menuImages[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const goToPrevImage = () => {
    const prevIndex = (currentIndex - 1 + festival.menuImages.length) % festival.menuImages.length;
    setSelectedImage(festival.menuImages[prevIndex]);
    setCurrentIndex(prevIndex);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!modalOpen) return;
      
      if (e.key === 'Escape') {
        closeImageModal();
      } else if (e.key === 'ArrowRight') {
        goToNextImage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, currentIndex]);

  console.log(`✅ Rendering ${festival.menuImages.length} menu images`);
  
  return (
    <>
      <div className="menu-gallery mb-12">
        <h3 className="text-3xl font-bold mb-6 text-gray-800">
          Festival Menu Gallery
        </h3>
        <p className="text-gray-600 mb-6">
          Explore our authentic {festival.name} menu selections
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {festival.menuImages.map((menuImage, index) => {
            const absoluteUrl = getAbsoluteImageUrl(menuImage.imageUrl);
            
            console.log(`🔗 Image ${index + 1}:`, {
              original: menuImage.imageUrl,
              absolute: absoluteUrl,
              caption: menuImage.caption
            });
            
            return (
              <div 
                key={menuImage._id || index} 
                className="group cursor-pointer rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-4 border-orange-500 bg-white"
                onClick={() => openImageModal(menuImage, index)}
              >
                <div className="relative h-80 md:h-96">
                  {absoluteUrl ? (
                    <img 
                      src={absoluteUrl} 
                      alt={menuImage.caption || `${festival.name} menu ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        console.error('❌ Failed to load menu image:', menuImage.imageUrl);
                        e.target.src = 'https://via.placeholder.com/800x600/FF6B35/FFFFFF?text=Menu+Image';
                        e.target.className = "w-full h-full object-contain bg-gray-100 p-8";
                      }}
                      onLoad={() => {
                        console.log('✅ Menu image loaded successfully:', absoluteUrl);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Image not available</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                    Menu {index + 1}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                    <div className="p-6 text-white w-full">
                      <p className="text-lg font-semibold mb-2">
                        {menuImage.caption || `${festival.name} Menu`}
                      </p>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-sm">Click to view full size</span>
                      </div>
                    </div>
                  </div>
                </div>
                {menuImage.caption && (
                  <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50">
                    <p className="text-lg font-semibold text-gray-800">
                      {menuImage.caption}
                    </p>
                    <div className="mt-2 flex items-center text-gray-600 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                      </svg>
                      Click to enlarge
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-10 mb-6 border-t-2 border-orange-200"></div>
      </div>

      {/* Image Modal */}
      {modalOpen && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          {/* Close button */}
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all duration-300"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation buttons */}
          {festival.menuImages.length > 1 && (
            <>
              <button
                onClick={goToPrevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all duration-300"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all duration-300"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
            {currentIndex + 1} / {festival.menuImages.length}
          </div>

          {/* Main image */}
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={getAbsoluteImageUrl(selectedImage.imageUrl)}
              alt={selectedImage.caption || `${festival.name} menu`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/1200x800/FF6B35/FFFFFF?text=Menu+Image';
                e.target.className = "max-w-full max-h-full object-contain bg-gray-800 p-8 rounded-lg";
              }}
            />
            
            {/* Loading indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>

          {/* Caption */}
          {selectedImage.caption && (
            <div className="absolute bottom-4 left-0 right-0 mx-auto max-w-4xl bg-black/70 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white text-lg font-semibold text-center">
                {selectedImage.caption}
              </p>
            </div>
          )}

          {/* Keyboard hint */}
          <div className="absolute bottom-4 right-4 hidden md:block bg-black/50 rounded-lg p-2">
            <p className="text-white/70 text-xs">
              Use <span className="inline-block bg-white/20 px-2 py-1 rounded mx-1">←</span> and 
              <span className="inline-block bg-white/20 px-2 py-1 rounded mx-1">→</span> to navigate • 
              <span className="inline-block bg-white/20 px-2 py-1 rounded mx-1">ESC</span> to close
            </p>
          </div>
        </div>
      )}
    </>
  );
};

const FestivalDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [festival, setFestival] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('menu');

  // FIXED: Get API URL from environment variable with fallback
  const API_URL = process.env.REACT_APP_API_URL || 'https://your-backend-url.onrender.com';

  useEffect(() => {
    const fetchFestivalData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔍 Fetching festival data for slug: ${slug}`);
        console.log('🌐 API_URL:', API_URL);
        
        // FIXED: Try multiple possible routes
        const possibleRoutes = [
          `/api/festival/${slug}`,
          `/api/festivals/${slug}`,
          `/festival/${slug}`,
          `/festivals/${slug}`
        ];
        
        let response = null;
        let successRoute = null;
        
        for (const route of possibleRoutes) {
          try {
            console.log(`🌐 Trying route: ${API_URL}${route}`);
            
            const testResponse = await fetch(`${API_URL}${route}`);
            
            console.log(`📡 Response for ${route}: ${testResponse.status}`);
            
            if (testResponse.ok) {
              response = testResponse;
              successRoute = route;
              break;
            }
          } catch (err) {
            console.log(`❌ Route ${route} failed:`, err.message);
            continue;
          }
        }
        
        if (!response || !response.ok) {
          if (!response) {
            throw new Error(`Could not connect to server. Please check:\n1. Backend is running\n2. REACT_APP_API_URL is set to: ${API_URL}\n3. Network connection`);
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log(`✅ Successfully connected using route: ${successRoute}`);
        
        const data = await response.json();
        console.log('📦 API Response:', data);
        
        if (data.success) {
          console.log('✅ Festival loaded:', data.festival.name);
          console.log('📸 Menu images in festival:', data.festival.menuImages);
          setFestival(data.festival);
        } else {
          setError(data.error || 'Festival not found');
        }
        
      } catch (err) {
        console.error('❌ Error fetching festival:', err);
        setError(err.message || 'Failed to load festival details');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchFestivalData();
    } else {
      setError('No festival specified');
      setLoading(false);
    }
  }, [slug, API_URL]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading festival details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
            <p className="text-sm text-yellow-800">
              <strong>Troubleshooting:</strong><br/>
              • Check if backend is running<br/>
              • Verify REACT_APP_API_URL in .env: {API_URL}<br/>
              • Ensure the festival route exists in backend<br/>
              • Check network connection
            </p>
          </div>
          
          <div className="space-x-4">
            <button 
              onClick={() => navigate('/festivals')}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors duration-300"
            >
              Browse Festivals
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!festival) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-400 text-5xl mb-4">❓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Festival not found</h2>
          <p className="text-gray-600 mb-6">The festival you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/festivals')}
            className="px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors duration-300"
          >
            Browse Festivals
          </button>
        </div>
      </div>
    );
  }

  // WhatsApp contact info - HARDCODED
  const whatsappNumber = '9447975836';
  const whatsappMessage = `Hello! I'm interested in the ${festival.name} festival menu.`;
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const callNumber = '+919447975836';

  return (
    <div className="festival-detail-page">
      {/* Banner Section */}
      <div 
        className="relative h-96 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${getAbsoluteImageUrl(festival.bannerImage || festival.image)})`,
          backgroundPosition: 'center 30%'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{festival.name}</h1>
          <p className="text-lg md:text-xl max-w-3xl">{festival.description}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center">
              <span className="text-yellow-400 text-2xl mr-2">★</span>
              <span className="text-xl">{festival.rating || '4.5'}</span>
              <span className="text-gray-300 ml-2">({festival.reviewCount || 0} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="tabs mb-8">
              <div className="flex border-b">
                <button 
                  className={`px-6 py-3 font-semibold ${activeTab === 'menu' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-orange-500'}`}
                  onClick={() => setActiveTab('menu')}
                >
                  Menu
                </button>
                <button 
                  className={`px-6 py-3 font-semibold ${activeTab === 'about' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-orange-500'}`}
                  onClick={() => setActiveTab('about')}
                >
                  About Festival
                </button>
                <button 
                  className={`px-6 py-3 font-semibold ${activeTab === 'info' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-orange-500'}`}
                  onClick={() => setActiveTab('info')}
                >
                  Information
                </button>
              </div>
            </div>

            {/* Menu Items Tab */}
            {activeTab === 'menu' && (
              <>
                <MenuGallery festival={festival} />
                <div className="mt-8 text-gray-500 text-sm">
                  <p>We respond within 15 minutes during business hours (9 AM - 9 PM)</p>
                </div>
              </>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="festival-info bg-gray-50 rounded-lg p-8">
                <h3 className="text-3xl font-bold mb-6">About {festival.name}</h3>
                
                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-6 text-lg leading-relaxed">{festival.description}</p>
                  
                  {festival.highlights && festival.highlights.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-2xl font-semibold mb-6">Festival Highlights</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {festival.highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                            <span className="text-green-500 text-xl mr-3 mt-1">✓</span>
                            <span className="text-gray-700 text-lg">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-10 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-l-4 border-orange-500">
                    <h4 className="text-2xl font-bold text-gray-800 mb-4">Traditional Significance</h4>
                    <p className="text-gray-700 mb-4">
                      {festival.name} is celebrated with traditional dishes that have been passed down through generations. 
                      Each dish holds cultural significance and is prepared with authentic ingredients and methods.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-white p-4 rounded-lg">
                        <h5 className="font-bold text-gray-800 mb-2">Traditional Preparation</h5>
                        <p className="text-gray-600">Prepared using age-old family recipes</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <h5 className="font-bold text-gray-800 mb-2">Authentic Ingredients</h5>
                        <p className="text-gray-600">Sourced from trusted local vendors</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Information Tab */}
            {activeTab === 'info' && (
              <div className="festival-info bg-gray-50 rounded-lg p-8">
                <h3 className="text-3xl font-bold mb-6">Festival Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <h4 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                        </svg>
                        Festival Dates
                      </h4>
                      <p className="text-gray-600 text-lg">{festival.festivalDates || 'Check calendar for specific dates'}</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <h4 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4v1a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-2.5h-2A3.5 3.5 0 0114.5 9V7.5h-2A3.5 3.5 0 019 4H3z"/>
                          <path d="M14 7h4a1 1 0 011 1v2.5a1.5 1.5 0 01-1.5 1.5h-3.5V7z"/>
                        </svg>
                        Service Type
                      </h4>
                      <p className="text-gray-600 text-lg">Takeaway Only</p>
                    </div>
                    
                    {festival.specialNote && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl">
                        <h4 className="text-xl font-semibold text-yellow-800 mb-3">Important Note</h4>
                        <p className="text-yellow-700 text-lg">{festival.specialNote}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    {festival.popularItems && festival.popularItems.length > 0 && (
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Most Popular Items</h4>
                        <div className="flex flex-wrap gap-3">
                          {festival.popularItems.map((item, idx) => (
                            <span key={idx} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {festival.tags && festival.tags.length > 0 && (
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Menu Tags</h4>
                        <div className="flex flex-wrap gap-3">
                          {festival.tags.map((tag, idx) => (
                            <span key={idx} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200">
                      <h4 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-gray-600 mb-1">For inquiries and orders:</p>
                          <p className="font-semibold text-gray-800">Phone: +91 9447975836</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Business Hours:</p>
                          <p className="font-semibold text-gray-800">9:00 AM - 9:00 PM (Everyday)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Festival Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Festival Details</h3>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-medium">Preparation Time: {festival.prepTime || '2-3 hours'}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-medium">Serves: {festival.serves || '5-10 people'}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-medium">Takeaway:</span>
                    <a 
                      href="https://www.google.com/maps?q=9.810390387387123,76.31189614366284"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:text-orange-600 text-sm font-medium mt-1 inline-flex items-center ml-2"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                      Location
                    </a>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                  </div>
                  <p className="text-sm text-gray-500">Prices may vary based on customization and quantity</p>
                  <br />
                  <p className="text-sm text-gray-500">🚚 Delivery not included unless pre-agreed</p>
                </div>
                
                <div className="space-y-3">
                  <a 
                    href={whatsappURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
                    </svg>
                    WhatsApp Inquiry
                  </a>
                  
                  <a 
                    href={`tel:${callNumber}`}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    Call for Details
                  </a>
                </div>
                
                <div className="text-sm text-gray-500 space-y-3 pt-6 border-t">
                  <p className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Authentic traditional preparation</span>
                  </p>
                  <p className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Fresh ingredients daily</span>
                  </p>
                  <p className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Hygienic preparation & packaging</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FestivalDetailPage;