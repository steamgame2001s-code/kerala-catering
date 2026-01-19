// frontend/src/components/FestivalCard.jsx - COMPLETELY FIXED
import React from 'react';
import { FaEdit, FaTrash, FaStar, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Local fallback images (SVG data URLs)
const FALLBACK_IMAGES = {
  festival: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23ff6b35'/%3E%3Ctext x='50%25' y='45%25' font-family='Arial, sans-serif' font-size='24' font-weight='bold' fill='white' text-anchor='middle'%3EFestival%3C/text%3E%3Ctext x='50%25' y='60%25' font-family='Arial, sans-serif' font-size='18' fill='white' text-anchor='middle'%3EImage%3C/text%3E%3C/svg%3E",
  notFound: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23e74c3c'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='20' fill='white' text-anchor='middle' dy='.3em'%3EImage Not Found%3C/text%3E%3C/svg%3E"
};

const FestivalCard = ({ festival, isAdmin = false, onEdit, onDelete }) => {
  // Get image URL - convert relative paths to absolute
  const getImageUrl = (imagePath) => {
    if (!imagePath) return FALLBACK_IMAGES.festival;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads/') || imagePath.startsWith('/images/')) {
      return `${window.location.origin}${imagePath}`;
    }
    
    return imagePath;
  };

  const imageUrl = getImageUrl(festival.image);

  return (
    <div className="admin-card">
      <div className="card-image-container">
        <img 
          src={imageUrl}
          alt={festival.name}
          className="card-image"
          onError={(e) => {
            e.target.src = FALLBACK_IMAGES.notFound;
            e.target.onerror = null; // Prevent infinite loop
          }}
        />
        <div className="image-overlay">
          {festival.isFeatured && (
            <span className="overlay-badge overlay-featured">
              <FaStar /> Featured
            </span>
          )}
          {!festival.isActive && (
            <span className="overlay-badge overlay-inactive">
              Inactive
            </span>
          )}
        </div>
      </div>
      
      <div className="card-content">
        <div className="card-header-row">
          <h3 className="card-title">{festival.name}</h3>
          <span className={`status-badge ${festival.isActive ? 'active' : 'inactive'}`}>
            {festival.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <p className="card-description">
          {festival.description ? 
            (festival.description.length > 100 
              ? `${festival.description.substring(0, 100)}...` 
              : festival.description)
            : 'No description available'
          }
        </p>
        
        <div className="card-meta">
          <div className="meta-item">
            <FaCalendarAlt className="meta-icon" />
            <span className="meta-label">Slug:</span>
            <span className="meta-value">{festival.slug}</span>
          </div>
          {festival.rating && (
            <div className="meta-item">
              <FaStar className="meta-icon" style={{ color: '#f1c40f' }} />
              <span className="meta-value">{festival.rating}/5</span>
            </div>
          )}
        </div>
        
        {festival.categories && festival.categories.length > 0 && (
          <div className="card-badges">
            {festival.categories.slice(0, 3).map((category, index) => (
              <span key={index} className="badge badge-category">
                {category}
              </span>
            ))}
            {festival.categories.length > 3 && (
              <span className="badge badge-more">
                +{festival.categories.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {isAdmin ? (
          <div className="card-actions">
            <button 
              className="btn-edit"
              onClick={() => onEdit(festival)}
            >
              <FaEdit /> Edit
            </button>
            <button 
              className="btn-delete"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${festival.name}"?`)) {
                  onDelete(festival._id);
                }
              }}
            >
              <FaTrash /> Delete
            </button>
          </div>
        ) : (
          <Link 
            to={`/festival/${festival.slug}`}
            className="btn-primary card-view-btn"
          >
            View Details & Menu
          </Link>
        )}
      </div>
    </div>
  );
};

export default FestivalCard;