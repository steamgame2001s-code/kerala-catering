import React, { useEffect, useRef, useState } from 'react';
import './VideoBanner.css';

const VideoBanner = () => {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // At the top of VideoBanner.jsx, replace hardcoded URLs with:
const cloudinaryVideoUrl = process.env.REACT_APP_CLOUDINARY_VIDEO_URL || 
  "https://res.cloudinary.com/dlgrdnghb/video/upload/f_auto,q_auto:good/v1768471729/catering-promo_xmczkq.mp4";

const posterUrl = process.env.REACT_APP_CLOUDINARY_POSTER_URL || 
  "https://res.cloudinary.com/dlgrdnghb/image/upload/f_auto,q_auto,w_1280/v1768471729/catering-promo_xmczkq.jpg";
  
  // Simulate "login" detection - you might want to connect this to your actual auth
  useEffect(() => {
    // Check if user is "logged in" (you should replace this with your actual auth check)
    const checkLoginStatus = () => {
      // For demonstration, let's assume user is logged in when they visit
      // You can replace this with actual authentication logic
      const isLoggedIn = true; // Replace with your actual auth check
      
      if (isLoggedIn) {
        setIsVisible(true);
        
        // Start video after a small delay for better UX
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(error => {
              console.log('Autoplay prevented:', error);
              // Handle autoplay restrictions
            });
          }
        }, 500);
      }
    };

    checkLoginStatus();

    // Optional: Listen for login events if your app has them
    // window.addEventListener('userLoggedIn', checkLoginStatus);
    
    // return () => {
    //   window.removeEventListener('userLoggedIn', checkLoginStatus);
    // };
  }, []);

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
        poster={posterUrl}
      >
        {/* Cloudinary video source */}
        <source 
          src={cloudinaryVideoUrl}
          type="video/mp4" 
        />
        
        {/* Fallback text for browsers that don't support video */}
        Your browser does not support the video tag.
      </video>
      
      {/* Optional: Content overlay on the video */}
      <div className="video-content">
        <h2 className="video-title">Experience Culinary Excellence</h2>
        <p className="video-subtitle">Fresh ingredients, traditional recipes, unforgettable flavors</p>
        
        {/* Optional: Add a button to toggle mute */}
    
      </div>
    </div>
  );
};

export default VideoBanner;