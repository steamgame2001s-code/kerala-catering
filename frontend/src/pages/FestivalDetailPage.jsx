import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const FestivalDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [festival, setFestival] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('menu');

  // Helper to get absolute image URL
  const getAbsoluteImageUrl = (url) => {
    if (!url) return null;
    
    console.log('🖼️ Processing image URL:', url);
    
    // If it's already a full URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a Cloudinary URL without protocol
    if (url.includes('cloudinary.com') && !url.startsWith('http')) {
      return `https://${url.replace(/^\/\//, '')}`;
    }
    
    // If it's a local upload path
    if (url.startsWith('/uploads/')) {
      const baseURL = process.env.REACT_APP_API_URL || window.location.origin;
      // Remove /api if present in baseURL
      const cleanBaseURL = baseURL.replace(/\/api$/, '');
      const absoluteUrl = `${cleanBaseURL}${url}`;
      console.log('🌐 Converted to:', absoluteUrl);
      return absoluteUrl;
    }
    
    // Return as-is
    return url;
  };

  useEffect(() => {
    const fetchFestivalData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔍 Fetching festival data for slug: ${slug}`);
        
        // Use the API endpoint
        const API_URL = process.env.REACT_APP_API_URL || 'https://kerala-catering.onrender.com';
        
        // Try multiple routes
        const possibleRoutes = [
          `${API_URL}/api/festival/${slug}`,
          `${API_URL}/api/festivals/${slug}`,
          `${API_URL}/festival/${slug}`,
          `${API_URL}/festivals/${slug}`
        ];
        
        let response = null;
        let successRoute = null;
        
        for (const route of possibleRoutes) {
          try {
            console.log(`🌐 Trying route: ${route}`);
            
            const testResponse = await fetch(route);
            
            console.log(`📡 Response for ${route}: ${testResponse.status}`);
            
            if (testResponse.ok) {
              response = testResponse;
              successRoute = route;
              break;
            }
          } catch (err) {
            console.log(`❌ Route failed:`, err.message);
            continue;
          }
        }
        
        if (!response || !response.ok) {
          throw new Error(`Could not fetch festival. Please try again later.`);
        }
        
        console.log(`✅ Successfully connected using route: ${successRoute}`);
        
        const data = await response.json();
        console.log('📦 API Response:', data);
        
        if (data.success) {
          console.log('✅ Festival loaded:', data.festival.name);
          console.log('📸 Banner image:', data.festival.bannerImage);
          console.log('📸 Main image:', data.festival.image);
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
    }
  }, [slug]);

  // Banner section component
  const BannerSection = ({ festival }) => {
    const bannerUrl = festival.bannerImage || festival.image;
    const absoluteBannerUrl = getAbsoluteImageUrl(bannerUrl);
    
    console.log('🎨 Banner rendering:', {
      hasBannerImage: !!festival.bannerImage,
      bannerImage: festival.bannerImage,
      bannerUrl: absoluteBannerUrl,
      mainImage: festival.image
    });
    
    return (
      <div 
        className="relative h-96 bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${absoluteBannerUrl}')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/60"></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{festival.name}</h1>
          <p className="text-lg md:text-xl max-w-3xl mb-6">{festival.description}</p>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center bg-black/40 px-4 py-2 rounded-full">
              <span className="text-yellow-400 text-xl mr-2">★</span>
              <span className="text-xl">{festival.rating || '4.5'}</span>
              <span className="text-gray-300 ml-2">
                ({festival.reviewCount || 0} reviews)
              </span>
            </div>
            {festival.isFeatured && (
              <span className="bg-orange-500 px-4 py-2 rounded-full font-semibold">
                Featured
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Menu gallery component
  const MenuGallery = ({ festival }) => {
    if (!festival?.menuImages || festival.menuImages.length === 0) {
      return (
        <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-300">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg">No menu images uploaded yet.</p>
          <p className="text-gray-400 text-sm mt-2">Check back soon for menu previews.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {festival.menuImages.map((menuImage, index) => {
          const absoluteUrl = getAbsoluteImageUrl(menuImage.imageUrl);
          
          return (
            <div key={index} className="group rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="relative h-80">
                {absoluteUrl ? (
                  <img 
                    src={absoluteUrl} 
                    alt={menuImage.caption || `${festival.name} menu ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Image not available</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  Menu {index + 1}
                </div>
              </div>
              {menuImage.caption && (
                <div className="p-6 bg-white">
                  <p className="text-lg font-semibold text-gray-800">{menuImage.caption}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
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

  // No festival found
  if (!festival) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-400 text-5xl mb-4">❓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Festival not found</h2>
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

  // Contact info
  const whatsappNumber = '919387431366';
  const whatsappMessage = `Hello! I'm interested in the ${festival.name} festival menu.`;
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const callNumber = '+919387431366';

  return (
    <div className="festival-detail-page">
      {/* Banner Section */}
      <BannerSection festival={festival} />

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

            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <div className="mb-12">
                <h3 className="text-3xl font-bold mb-6 text-gray-800">
                  Festival Menu Gallery
                </h3>
                <p className="text-gray-600 mb-6">
                  Explore our authentic {festival.name} menu selections
                </p>
                <MenuGallery festival={festival} />
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="festival-info bg-gray-50 rounded-lg p-8">
                <h3 className="text-3xl font-bold mb-6">About {festival.name}</h3>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">{festival.description}</p>
                
                {festival.highlights && festival.highlights.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-2xl font-semibold mb-4">Festival Highlights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {festival.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-start p-4 bg-white rounded-lg shadow-sm">
                          <span className="text-green-500 text-xl mr-3">✓</span>
                          <span className="text-gray-700">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Information Tab */}
            {activeTab === 'info' && (
              <div className="festival-info bg-gray-50 rounded-lg p-8">
                <h3 className="text-3xl font-bold mb-6">Festival Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <h4 className="text-xl font-semibold text-gray-800 mb-3">
                        Festival Dates
                      </h4>
                      <p className="text-gray-600">{festival.festivalDates || 'Check calendar for dates'}</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <h4 className="text-xl font-semibold text-gray-800 mb-3">
                        Service Type
                      </h4>
                      <p className="text-gray-600">Takeaway Only</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {festival.popularItems && festival.popularItems.length > 0 && (
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Popular Items</h4>
                        <div className="flex flex-wrap gap-2">
                          {festival.popularItems.map((item, idx) => (
                            <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
                    <span>Preparation Time: 2-3 hours</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                    <span>Serves: 5-10 people</span>
                  </div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FestivalDetailPage;