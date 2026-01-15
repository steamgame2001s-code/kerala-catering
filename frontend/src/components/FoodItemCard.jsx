// frontend/src/components/FoodItemCard.jsx
import React from 'react';
import { FaEdit, FaTrash, FaStar, FaFire, FaClock, FaUsers } from 'react-icons/fa';

const FoodItemCard = ({ item, isAdmin = false, onEdit, onDelete }) => {
  return (
    <div className="admin-card">
      <div className="card-image-container">
        <img 
          src={item.image || 'https://via.placeholder.com/400x250?text=Food+Image'} 
          alt={item.name}
          className="card-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x250?text=Image+Not+Found';
          }}
        />
        <div className="image-overlay">
          {item.isBestSeller && (
            <span className="overlay-badge overlay-featured">
              <FaStar /> Best Seller
            </span>
          )}
          {!item.isAvailable && (
            <span className="overlay-badge overlay-inactive">
              Out of Stock
            </span>
          )}
        </div>
      </div>
      
      <div className="card-content">
        <div className="card-header-row">
          <h3 className="card-title">{item.name}</h3>
          <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
            {item.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <p className="card-description">
          {item.description || 'No description available'}
        </p>
        
        
        <div className="card-badges">
          <span className="badge badge-category">
            {item.category}
          </span>
          
          {item.calories && (
            <span className="badge" style={{ background: 'linear-gradient(135deg, #FF6B6B, #EE5A52)' }}>
              <FaFire style={{ marginRight: '5px' }} /> {item.calories} Cal
            </span>
          )}
          
          {item.prepTime && (
            <span className="badge" style={{ background: 'linear-gradient(135deg, #4ECDC4, #44A08D)' }}>
              <FaClock style={{ marginRight: '5px' }} /> {item.prepTime} min
            </span>
          )}
          
          {item.serves && (
            <span className="badge" style={{ background: 'linear-gradient(135deg, #A29BFE, #6C5CE7)' }}>
              <FaUsers style={{ marginRight: '5px' }} /> Serves {item.serves}
            </span>
          )}
          
          {item.spicyLevel > 0 && (
            <span className="badge" style={{ background: 'linear-gradient(135deg, #FF8C42, #FF6B35)' }}>
              {item.spicyLevel === 1 ? '🌶️ Mild' : 
               item.spicyLevel === 2 ? '🌶️🌶️ Medium' : 
               item.spicyLevel === 3 ? '🌶️🌶️🌶️ Spicy' : 
               '🌶️🌶️🌶️🌶️ Hot'}
            </span>
          )}
        </div>
        
        {isAdmin ? (
          <div className="card-actions">
            <button 
              className="btn-edit"
              onClick={() => onEdit(item)}
            >
              <FaEdit /> Edit
            </button>
            <button 
              className="btn-delete"
              onClick={() => onDelete(item._id)}
            >
              <FaTrash /> Delete
            </button>
          </div>
        ) : (
          <div className="card-actions">
            <button className="btn-edit" style={{ background: '#4CAF50' }}>
              Add to Cart
            </button>
            <button className="btn-delete" style={{ background: '#2196F3' }}>
              Quick View
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodItemCard;