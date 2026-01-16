import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSpinner, FaUpload } from 'react-icons/fa';
import axiosInstance from '../../api/axiosConfig'; // ADD THIS IMPORT
import '../../components/admin/AdminPages.css';

const MenuManagement = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'main-course',
    festival: '',
    originalPrice: '',
    calories: '',
    prepTime: '',
    serves: '',
    spicyLevel: '1',
    ingredients: '',
    isBestSeller: false,
    isAvailable: true,
    isActive: true
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🍽️ Fetching food items...');
      
      const response = await axiosInstance.get('/admin/food-items');
      
      console.log('✅ Response:', response.data);
      
      if (response.data.success) {
        setFoodItems(response.data.foodItems || []);
      } else {
        setError(response.data.error || 'Failed to load data');
      }
      
    } catch (error) {
      console.error('❌ Error fetching food items:', error);
      setError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    console.log('Editing food item:', item);
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category || 'main-course',
      festival: item.festival || '',
      originalPrice: item.originalPrice || '',
      calories: item.calories || '',
      prepTime: item.prepTime || '',
      serves: item.serves || '',
      spicyLevel: item.spicyLevel || '1',
      ingredients: item.ingredients ? item.ingredients.join(', ') : '',
      isBestSeller: item.isBestSeller || false,
      isAvailable: item.isAvailable !== false,
      isActive: item.isActive !== false
    });
    
    if (item.image) setImagePreview(item.image);
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/admin/food-items/${id}`);
      
      if (response.data.success) {
        alert('Food item deleted successfully!');
        fetchFoodItems();
      } else {
        alert(response.data.error || 'Failed to delete food item');
      }
    } catch (error) {
      console.error('Failed to delete food item:', error);
      alert('Failed to delete food item: ' + error.message);
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
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('festival', formData.festival);
      formDataToSend.append('originalPrice', formData.originalPrice || '');
      formDataToSend.append('calories', formData.calories || '');
      formDataToSend.append('prepTime', formData.prepTime || '');
      formDataToSend.append('serves', formData.serves || '');
      formDataToSend.append('spicyLevel', formData.spicyLevel);
      formDataToSend.append('ingredients', formData.ingredients);
      formDataToSend.append('isBestSeller', formData.isBestSeller);
      formDataToSend.append('isAvailable', formData.isAvailable);
      formDataToSend.append('isActive', formData.isActive);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      let response;
      if (editingItem) {
        response = await axiosInstance.put(`/admin/food-items/${editingItem._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axiosInstance.post('/admin/food-items', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      if (response.data.success) {
        alert(editingItem ? 'Food item updated successfully!' : 'Food item added successfully!');
        setShowForm(false);
        setEditingItem(null);
        resetForm();
        fetchFoodItems();
      } else {
        alert(response.data.error || 'Failed to save food item');
      }
    } catch (error) {
      console.error('Failed to save food item:', error);
      alert('Failed to save food item: ' + error.message);
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
      originalPrice: '',
      calories: '',
      prepTime: '',
      serves: '',
      spicyLevel: '1',
      ingredients: '',
      isBestSeller: false,
      isAvailable: true,
      isActive: true
    });
    setImageFile(null);
    setImagePreview('');
  };

  if (error) {
    return (
      <div className="admin-page">
        <div className="error-container">
          <h2>Error Loading Menu Items</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchFoodItems}>Try Again</button>
        </div>
      </div>
    );
  }

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
        <button className="btn-primary" onClick={() => { resetForm(); setEditingItem(null); setShowForm(true); }}>
          <FaPlus className="me-2" /> Add New Food Item
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{foodItems.length}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{foodItems.filter(f => f.isBestSeller).length}</span>
          <span className="stat-label">Best Sellers</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{foodItems.filter(f => f.isAvailable).length}</span>
          <span className="stat-label">Available</span>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Festival</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {foodItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  <div className="empty-state">
                    <div className="empty-icon">🍽️</div>
                    <h3>No Food Items Found</h3>
                    <p>Add your first food item to get started!</p>
                  </div>
                </td>
              </tr>
            ) : (
              foodItems.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="table-image"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/60x60?text=No+Image'; }}
                    />
                  </td>
                  <td>
                    <strong>{item.name}</strong>
                    <small>{item.description?.substring(0, 50)}...</small>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.festival || 'General'}</td>
                  <td>₹{item.originalPrice}</td>
                  <td>
                    <span className={`status-badge ${item.isAvailable ? 'active' : 'inactive'}`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    {item.isBestSeller && <span className="best-seller-badge">Best Seller</span>}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-edit" onClick={() => handleEdit(item)} title="Edit">
                        <FaEdit />
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(item._id)} title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => !formSubmitting && setShowForm(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Food Item' : 'Add New Food Item'}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)} disabled={formSubmitting}>
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Food Name *</label>
                    <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  
                  <div className="form-group">
                    <label>Category *</label>
                    <select className="form-control" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                      <option value="main-course">Main Course</option>
                      <option value="appetizer">Appetizer</option>
                      <option value="dessert">Dessert</option>
                      <option value="beverage">Beverage</option>
                      <option value="snack">Snack</option>
                      <option value="breakfast">Breakfast</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea className="form-control" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Festival (Optional)</label>
                    <input type="text" className="form-control" value={formData.festival} onChange={(e) => setFormData({...formData, festival: e.target.value})} placeholder="e.g., Christmas, Onam" />
                  </div>
                  
                  <div className="form-group">
                    <label>Original Price (₹) *</label>
                    <input type="number" className="form-control" value={formData.originalPrice} onChange={(e) => setFormData({...formData, originalPrice: e.target.value})} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Calories (Optional)</label>
                    <input type="number" className="form-control" value={formData.calories} onChange={(e) => setFormData({...formData, calories: e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label>Prep Time (minutes)</label>
                    <input type="number" className="form-control" value={formData.prepTime} onChange={(e) => setFormData({...formData, prepTime: e.target.value})} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Serves</label>
                    <input type="number" className="form-control" value={formData.serves} onChange={(e) => setFormData({...formData, serves: e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label>Spicy Level (1-5)</label>
                    <select className="form-control" value={formData.spicyLevel} onChange={(e) => setFormData({...formData, spicyLevel: e.target.value})}>
                      <option value="1">Mild</option>
                      <option value="2">Medium</option>
                      <option value="3">Spicy</option>
                      <option value="4">Very Spicy</option>
                      <option value="5">Extreme</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Ingredients (comma separated)</label>
                  <input type="text" className="form-control" value={formData.ingredients} onChange={(e) => setFormData({...formData, ingredients: e.target.value})} placeholder="e.g., Rice, Chicken, Spices, Onion" />
                </div>

                <div className="form-group">
                  <label>Food Image *</label>
                  <div className="image-upload-container">
                    <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} required={!editingItem && !imagePreview} />
                    {(imagePreview || (editingItem && !imageFile)) && (
                      <div className="image-preview-upload">
                        <h6>Preview:</h6>
                        <div className="preview-image-container">
                          <img src={imagePreview || editingItem?.image} alt="Preview" className="preview-image" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Preview+Not+Available'; }} />
                          {!imageFile && editingItem && <div className="current-image-note"><FaEye /> Current Image</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-check-group">
                  <label className="form-check">
                    <input type="checkbox" checked={formData.isBestSeller} onChange={(e) => setFormData({...formData, isBestSeller: e.target.checked})} />
                    <span>Best Seller</span>
                  </label>
                  
                  <label className="form-check">
                    <input type="checkbox" checked={formData.isAvailable} onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})} />
                    <span>Available for Order</span>
                  </label>
                  
                  <label className="form-check">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
                    <span>Active (Show on website)</span>
                  </label>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} disabled={formSubmitting}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={formSubmitting}>
                    {formSubmitting ? <><FaSpinner className="me-2 spin" /> Saving...</> : editingItem ? 'Update Food Item' : 'Add Food Item'}
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