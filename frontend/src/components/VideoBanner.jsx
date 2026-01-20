import React, { useEffect, useRef, useState } from 'react';
import './VideoBanner.css';

const VideoBanner = () => {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [posterError, setPosterError] = useState(false);
  
  // Use environment variables or fallbacks
  const cloudinaryVideoUrl = process.env.REACT_APP_CLOUDINARY_VIDEO_URL || 
    "https://res.cloudinary.com/dlgrdnghb/video/upload/f_auto,q_auto:good/v1768471729/catering-promo_xmczkq.mp4";

  // Fallback poster images in case the Cloudinary one is broken
  const FALLBACK_POSTERS = [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80",
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80"
  ];

  // Original poster URL - but we'll handle errors
  const originalPosterUrl = process.env.REACT_APP_CLOUDINARY_POSTER_URL || 
    "https://res.cloudinary.com/dlgrdnghb/image/upload/f_auto,q_auto,w_1280/v1768471729/catering-promo_xmczkq.jpg";

  // Current poster URL - starts with original, falls back if error
  const [currentPosterUrl, setCurrentPosterUrl] = useState(originalPosterUrl);
  
  useEffect(() => {
    // Check if user is "logged in" (you might want to connect this to your actual auth)
    const checkLoginStatus = () => {
      // For now, always show the video banner for all users
      // You can modify this based on your requirements
      const shouldShowVideo = true; // Always show for now
      
      if (shouldShowVideo) {
        setIsVisible(true);
        
        // Start video after a small delay for better UX
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(error => {
              console.log('Autoplay prevented:', error);
              // Handle autoplay restrictions - show play button maybe
            });
          }
        }, 500);
      }
    };

    checkLoginStatus();
  }, []);

  const handlePosterError = () => {
    if (!posterError) {
      setPosterError(true);
      // Rotate through fallback posters
      const randomIndex = Math.floor(Math.random() * FALLBACK_POSTERS.length);
      setCurrentPosterUrl(FALLBACK_POSTERS[randomIndex]);
    }
  };

  // Optional: Add a video error handler
  const handleVideoError = (e) => {
    console.error('Video error:', e);
    // You could show a static image instead of the video
    // Or try a different video source
  };

  if (!isVisible) return null;

  return (
    <div className="video-banner-container">
      <div className="video-overlay"></div>
      <video
        ref={videoRef}
        className="background-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={currentPosterUrl}
        onError={handleVideoError}
      >
        {/* Cloudinary video source */}
        <source 
          src={cloudinaryVideoUrl}
          type="video/mp4" 
        />
        
        {/* Optional: Fallback video source if Cloudinary fails */}
        <source 
          src="https://assets.mixkit.co/videos/preview/mixkit-spices-and-ingredients-for-cooking-on-a-table-41539-large.mp4"
          type="video/mp4"
        />
        
        {/* Fallback text for browsers that don't support video */}
        Your browser does not support the video tag.
      </video>
      
      {/* Optional: Content overlay on the video */}
      <div className="video-content">
        <h2 className="video-title">Experience Culinary Excellence</h2>
        <p className="video-subtitle">Fresh ingredients, traditional recipes, unforgettable flavors</p>
      </div>

      {/* Debug info - remove in production */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.5)',
        color: 'white',
        padding: '5px 10px',
        fontSize: '12px',
        borderRadius: '4px',
        display: 'none' // Set to 'block' for debugging
      }}>
        Poster: {posterError ? 'Using fallback' : 'Original'}
      </div>
    </div>
  );
};

export default VideoBanner;