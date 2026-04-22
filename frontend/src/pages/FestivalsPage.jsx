import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import './FestivalsPage.css';

const FestivalsPage = () => {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching festivals from API...');
      console.log('📡 API Base URL:', axios.defaults.baseURL);
      
      const response = await axios.get('/festivals', {
        timeout: 60000
      });
      
      console.log('✅ API Response:', response.data);
      
      if (response.data.success) {
        setFestivals(response.data.festivals || []);
        console.log(`✅ Loaded ${response.data.festivals?.length || 0} festivals`);
      } else if (Array.isArray(response.data)) {
        setFestivals(response.data);
        console.log(`✅ Loaded ${response.data.length} festivals (array format)`);
      } else {
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('❌ Fetch Error:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Backend is waking up... Please wait 30 seconds and try again.');
      } else if (err.message === 'Network Error') {
        setError('Cannot connect to server. Backend may be sleeping (Render free tier).');
      } else if (err.response?.status === 404) {
        setError('Festivals endpoint not found. Check backend routes.');
      } else {
        setError(err.response?.data?.error || 'Failed to load festivals. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFestivals();
  }, []);

  const handleRetry = () => {
    setRetryCount(retryCount + 1);
    fetchFestivals();
  };

  const handleFestivalClick = (festivalId, slug) => {
    const route = slug || festivalId;
    navigate(`/festival/${route}`);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const baseURL = process.env.REACT_APP_API_URL || '';
    return `${baseURL}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="festivals-page">
        <div className="loading-container-custom">
          <div className="loading-spinner-custom"></div>
          <p className="loading-text-custom">
            {retryCount === 0 
              ? "Discovering festival delights..." 
              : `Retry attempt #${retryCount}...`}
          </p>
          {retryCount === 0 && (
            <p className="text-sm text-gray-500 mt-2 italic">
              First load may take 30-60 seconds if backend is sleeping
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="festivals-page">
        <div className="empty-state-custom">
          <div className="empty-icon">⚠️</div>
          <h3 className="empty-title">Unable to Load Festivals</h3>
          <p className="empty-text">{error}</p>
          <button className="refresh-btn" onClick={handleRetry}>
            🔄 Try Again
          </button>
          
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Debug Information
            </summary>
            <pre className="mt-2 p-4 bg-gray-50 rounded text-xs overflow-auto">
API URL: {axios.defaults.baseURL}
Retry Count: {retryCount}
Time: {new Date().toLocaleString()}
Environment: {process.env.NODE_ENV}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="festivals-page">
      {/* Hero Banner */}
      <div className="festivals-hero">
        <div className="hero-content">
          <h1 className="hero-title">Celebrate with Tradition</h1>
          <p className="hero-subtitle">
            Experience authentic Kerala festival feasts, crafted with love and tradition
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="container mx-auto px-4">
        <div className="stats-bar">
          <div className="stats-count">{festivals.length}+</div>
          <div className="stats-label">Festival Specials</div>
        </div>
      </div>

      {/* Festivals Grid */}
      <div className="container mx-auto px-4">
        <div className="section-header-custom">
          <h2 className="section-title-custom">Our Festival Collection</h2>
          <p className="section-subtitle-custom">
            From Onam Sadhya to Christmas feasts, celebrate every occasion with us
          </p>
        </div>

        {festivals.length > 0 ? (
          <div className="festivals-grid">
            {festivals.map((festival) => (
              <div 
                key={festival._id} 
                className="festival-card-custom"
                onClick={() => handleFestivalClick(festival._id, festival.slug)}
              >
                <div className="card-image-wrapper">
                  <img 
                    src={getImageUrl(festival.image || festival.bannerImage)} 
                    alt={festival.name}
                    className="festival-card-image"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop';
                      e.target.onerror = null;
                    }}
                  />
                  {festival.isFeatured && (
                    <div className="featured-badge">Featured</div>
                  )}
                  <div className="rating-badge">
                    <span className="star-icon">★</span>
                    <span>{festival.rating || '4.8'}</span>
                  </div>
                </div>
                
                <div className="card-content-custom">
                  <h3 className="festival-card-title">{festival.name}</h3>
                  <p className="festival-card-description">
                    {festival.description || 'Experience the authentic flavors of this traditional festival feast, prepared with care and served with love.'}
                  </p>
                  
                  <div className="card-footer-custom">
                    <div className="price-info">
                      <span className="price-label">Starting at</span>
                      <span className="price-value">₹{festival.price || '2499'}</span>
                    </div>
                    <button className="explore-btn">
                      Explore <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-custom">
            <div className="empty-icon">🎉</div>
            <h3 className="empty-title">Coming Soon!</h3>
            <p className="empty-text">
              New festival specials are being prepared. Check back soon!
            </p>
            <button className="refresh-btn" onClick={fetchFestivals}>
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FestivalsPage;