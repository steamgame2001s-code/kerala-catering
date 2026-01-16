// frontend/src/pages/FestivalsPage.jsx - PRODUCTION READY
import React, { useState, useEffect } from 'react';
import FestivalCard from '../components/FestivalCard';
import axios from '../api/axiosConfig';

const FestivalsPage = () => {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching festivals from API...');
      console.log('📡 API Base URL:', axios.defaults.baseURL);
      
      // Use axios config (already has correct URL)
      const response = await axios.get('/festivals', {
        timeout: 60000 // 60 seconds for first request (Render cold start)
      });
      
      console.log('✅ API Response:', response.data);
      
      if (response.data.success) {
        setFestivals(response.data.festivals || []);
        console.log(`✅ Loaded ${response.data.festivals.length} festivals`);
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg font-semibold">Loading festivals...</p>
          {retryCount === 0 && (
            <p className="mt-2 text-gray-500 text-sm italic">
              First load may take 30-60 seconds if backend is sleeping
            </p>
          )}
          {retryCount > 0 && (
            <p className="mt-2 text-gray-500 text-sm">
              Retry attempt #{retryCount}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-4 bg-gray-50">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-lg">
          <div className="text-orange-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition-all duration-300 hover:shadow-lg"
          >
            🔄 Try Again
          </button>
          
          {/* Debug Info */}
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
    <div className="festivals-page bg-gray-50 min-h-screen">
      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-r from-orange-500 to-orange-600 shadow-xl">
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Our Festivals
          </h1>
          <p className="text-lg md:text-xl">Experience authentic Kerala festival feasts</p>
        </div>
      </div>
      <br />
      
      {/* Festivals Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-3xl font-bold text-gray-800">Available Festivals</h2>
            <span className="bg-orange-100 text-orange-700 px-5 py-2 rounded-full font-semibold">
              {festivals.length} {festivals.length === 1 ? 'festival' : 'festivals'}
            </span>
          </div>
          <p className="text-gray-600 mt-2">
            Explore our authentic Kerala festival catering services
          </p>
        </div>

        {festivals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {festivals.map((festival) => (
              <FestivalCard 
                key={festival._id}
                festival={festival}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No festivals available</h3>
            <p className="text-gray-500 mb-6">Check back soon for upcoming festival specials.</p>
            <button 
              onClick={handleRetry}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition-all duration-300 hover:shadow-lg"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FestivalsPage;