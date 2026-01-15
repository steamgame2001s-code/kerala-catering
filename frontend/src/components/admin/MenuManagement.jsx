// frontend/src/components/admin/MenuManagement.jsx - PRICE REMOVED
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSpinner, 
  FaEye
} from 'react-icons/fa';
import FoodItemCard from '../FoodItemCard';
import '../../components/admin/AdminPages.css';

const MenuManagement = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'main-course',
    festival: '',
    calories: '',
    prepTime: '',
    serves: '',
    ingredients: '',
    spicyLevel: 1,
    isBestSeller: false,
    isAvailable: true,
    isActive: true
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('adminToken');
      const foodResponse = await axios.get('http://localhost:5000/api/admin/food-items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const festivalsResponse = await axios.get('http://localhost:5000/api/festivals');
      
      if (foodResponse.data.success) {
        setFoodItems(foodResponse.data.foodItems);
      }
      
      setFestivals(festivalsResponse.data.festivals || []);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category || 'main-course',
      festival: item.festival || '',
      calories: item.calories || '',
      prepTime: item.prepTime || '',
      serves: item.serves || '',
      ingredients: item.ingredients ? item.ingredients.join(', ') : '',
      spicyLevel: item.spicyLevel || 1,
      isBestSeller: item.isBestSeller || false,
      isAvailable: item.isAvailable !== false,
      isActive: item.isActive !== false
    });
    
    if (item.image) {
      setImagePreview(item.image);
    }
    
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:5000/api/admin/food-items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Menu item deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      alert('Failed to delete menu item');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('festival', formData.festival);
      formDataToSend.append('calories', formData.calories || '');
      formDataToSend.append('prepTime', formData.prepTime || '');
      formDataToSend.append('serves', formData.serves || '');
      formDataToSend.append('ingredients', formData.ingredients);
      formDataToSend.append('spicyLevel', formData.spicyLevel);
      formDataToSend.append('isBestSeller', formData.isBestSeller);
      formDataToSend.append('isAvailable', formData.isAvailable);
      formDataToSend.append('isActive', formData.isActive);
      
      formDataToSend.append('slug', formData.name.toLowerCase().replace(/\s+/g, '-'));
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (editingItem && editingItem.image && !imageFile) {
        formDataToSend.append('imageUrl', editingItem.image);
      }

      let response;
      if (editingItem) {
        response = await axios.put(
          `http://localhost:5000/api/admin/food-items/${editingItem._id}`,
          formDataToSend,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        response = await axios.post(
          'http://localhost:5000/api/admin/food-items',
          formDataToSend,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      
      if (response.data.success) {
        alert(editingItem ? 'Menu item updated successfully!' : 'Menu item added successfully!');
        setShowForm(false);
        setEditingItem(null);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Failed to save menu item:', error);
      alert(error.response?.data?.error || 'Failed to save menu item. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'main-course',
      festival: '',
      calories: '',
      prepTime: '',
      serves: '',
      ingredients: '',
      spicyLevel: 1,
      isBestSeller: false,
      isAvailable: true,
      isActive: true
    });
    setImageFile(null);
    setImagePreview('');
  };

  const categories = [
    'main-course', 'appetizer', 'dessert', 'drink', 'sadhya', 
    'biriyani', 'curry', 'roast', 'fish-curry', 'veg', 'non-veg'
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Menu Management</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            resetForm();
            setEditingItem(null);
            setShowForm(true);
          }}
        >
          <FaPlus className="me-2" /> Add Menu Item
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{foodItems.length}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {foodItems.filter(f => f.isBestSeller).length}
          </span>
          <span className="stat-label">Best Sellers</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {foodItems.filter(f => f.isAvailable).length}
          </span>
          <span className="stat-label">Available</span>
        </div>
      </div>

      <div className="food-items-grid">
        {foodItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>No Menu Items Found</h3>
            <p>Add your first menu item to get started!</p>
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FaPlus className="me-2" /> Add First Item
            </button>
          </div>
        ) : (
          <div className="row">
            {foodItems.map((item) => (
              <FoodItemCard 
                key={item._id}
                item={item}
                isAdmin={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => !formSubmitting && setShowForm(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowForm(false)}
                disabled={formSubmitting}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Item Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      placeholder="e.g., Chicken Biriyani, Onam Sadhya"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="2"
                    placeholder="Brief description of the food item"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="form-control"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Festival (Optional)</label>
                    <select
                      className="form-control"
                      value={formData.festival}
                      onChange={(e) => setFormData({...formData, festival: e.target.value})}
                    >
                      <option value="">Select Festival</option>
                      {festivals.map(f => (
                        <option key={f._id} value={f.slug}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Food Image *</label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleImageChange}
                      required={!editingItem && !imagePreview}
                    />
                    
                    {(imagePreview || (editingItem && !imageFile)) && (
                      <div className="image-preview-upload">
                        <h6>Preview:</h6>
                        <div className="preview-image-container">
                          <img
                            src={imagePreview || editingItem?.image}
                            alt="Food Preview"
                            className="preview-image"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=Preview+Not+Available';
                            }}
                          />
                          {!imageFile && editingItem && (
                            <div className="current-image-note">
                              <FaEye /> Current Image
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Calories</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.calories}
                      onChange={(e) => setFormData({...formData, calories: e.target.value})}
                      placeholder="350"
                      min="0"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Prep Time (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.prepTime}
                      onChange={(e) => setFormData({...formData, prepTime: e.target.value})}
                      placeholder="45"
                      min="0"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Serves</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.serves}
                      onChange={(e) => setFormData({...formData, serves: e.target.value})}
                      placeholder="2"
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Ingredients (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                    placeholder="Chicken, Rice, Spices, Coconut"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Spicy Level</label>
                    <select
                      className="form-control"
                      value={formData.spicyLevel}
                      onChange={(e) => setFormData({...formData, spicyLevel: e.target.value})}
                    >
                      <option value="0">Mild</option>
                      <option value="1">Medium</option>
                      <option value="2">Spicy</option>
                      <option value="3">Hot</option>
                      <option value="4">Very Hot</option>
                    </select>
                  </div>
                </div>

                <div className="form-check-group">
                  <label className="form-check">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData({...formData, isBestSeller: e.target.checked})}
                    />
                    <span>Best Seller</span>
                  </label>
                  
                  <label className="form-check">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                    />
                    <span>Available</span>
                  </label>
                  
                  <label className="form-check">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <span>Active (Show on website)</span>
                  </label>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowForm(false)}
                    disabled={formSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? (
                      <>
                        <FaSpinner className="me-2 spin" />
                        Saving...
                      </>
                    ) : (
                      editingItem ? 'Update Item' : 'Add Item'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;