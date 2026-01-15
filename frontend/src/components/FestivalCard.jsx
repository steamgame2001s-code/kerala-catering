// frontend/src/components/FestivalCard.jsx
import React from 'react';
import { FaEdit, FaTrash, FaStar, FaCalendarAlt, FaRupeeSign } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FestivalCard = ({ festival, isAdmin = false, onEdit, onDelete }) => {
  return (
    <div className="admin-card">
      <div className="card-image-container">
        <img 
          src={festival.image || 'https://via.placeholder.com/400x250?text=Festival+Image'} 
          alt={festival.name}
          className="card-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x250?text=Image+Not+Found';
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
          {festival.description || 'No description available'}
        </p>
        
        <div className="card-meta">
          <div className="meta-item">
            <FaCalendarAlt className="meta-icon" />
            <span className="meta-label">Slug:</span>
            <span className="meta-value">{festival.slug}</span>
          </div>
        </div>
        
        {festival.categories && festival.categories.length > 0 && (
          <div className="card-badges">
            {festival.categories.map((category, index) => (
              <span key={index} className="badge badge-category">
                {category}
              </span>
            ))}
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
              onClick={() => onDelete(festival._id)}
            >
              <FaTrash /> Delete
            </button>
          </div>
        ) : (
          <Link 
            to={`/festival/${festival.slug}`}
            className="btn-primary"
            style={{ display: 'block', textAlign: 'center', marginTop: '15px' }}
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
};

export default FestivalCard;