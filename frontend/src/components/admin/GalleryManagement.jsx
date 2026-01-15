// frontend/src/components/admin/GalleryManagement.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaEdit, FaTrash, FaPlus, FaImage, FaSpinner, 
  FaEye, FaStar, FaCalendarAlt, FaTags 
} from 'react-icons/fa';
import '../../components/admin/AdminPages.css';

const GalleryManagement = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'food',
    festival: '',
    tags: '',
    featured: false,
    order: 0,
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
      
      // Fetch gallery items
      const galleryResponse = await axios.get('http://localhost:5000/api/gallery', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch festivals for dropdown
      const festivalsResponse = await axios.get('http://localhost:5000/api/festivals');
      
      console.log('Gallery API Response:', galleryResponse.data);
      
      // Handle different response structures
      if (galleryResponse.data.success) {
        // If response has success property and items array
        setGalleryItems(galleryResponse.data.gallery || galleryResponse.data.items || []);
      } else if (Array.isArray(galleryResponse.data)) {
        // If response is directly an array
        setGalleryItems(galleryResponse.data);
      } else {
        console.error('Unexpected gallery response format:', galleryResponse.data);
        setGalleryItems([]);
      }
      
      // Set festivals
      if (festivalsResponse.data.success) {
        setFestivals(festivalsResponse.data.festivals || []);
      } else if (Array.isArray(festivalsResponse.data)) {
        setFestivals(festivalsResponse.data);
      } else {
        setFestivals([]);
      }
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Set empty arrays on error
      setGalleryItems([]);
      setFestivals([]);
      alert('Failed to load gallery items. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = (item) => {
    console.log('Editing item:', item);
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'food',
      festival: item.festival?._id || item.festival || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      featured: item.featured || false,
      order: item.order || 0,
      isActive: item.isActive !== undefined ? item.isActive : true
    });
    setImagePreview(item.imageUrl || item.image || '');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:5000/api/admin/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Gallery item deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Failed to delete gallery item:', error);
      alert('Failed to delete gallery item');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');
      
      // Prepare form data
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('festival', formData.festival);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('featured', formData.featured);
      formDataToSend.append('order', formData.order);
      formDataToSend.append('isActive', formData.isActive);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      let response;
      if (editingItem) {
        response = await axios.put(
          `http://localhost:5000/api/admin/gallery/${editingItem._id}`,
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
          'http://localhost:5000/api/admin/gallery',
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
        alert(editingItem ? 'Gallery item updated successfully!' : 'Gallery item added successfully!');
        setShowForm(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Failed to save gallery item:', error);
      alert(error.response?.data?.error || 'Failed to save gallery item. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'food',
      festival: '',
      tags: '',
      featured: false,
      order: 0,
      isActive: true
    });
    setImageFile(null);
    setImagePreview('');
    setEditingItem(null);
  };

  const categories = [
    { value: 'food', label: 'Food', icon: '🍽️' },
    { value: 'festival', label: 'Festival', icon: '🎉' },
    { value: 'event', label: 'Event', icon: '📅' },
    { value: 'chef', label: 'Chef', icon: '👨‍🍳' },
    { value: 'kitchen', label: 'Kitchen', icon: '🏪' },
    { value: 'preparation', label: 'Preparation', icon: '🔪' },
    { value: 'delivery', label: 'Delivery', icon: '🚚' }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading gallery items...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h2>Gallery Management</h2>
          <p>Manage all images, videos and gallery content</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <FaPlus className="me-2" /> Add New Item
        </button>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{galleryItems.length}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {galleryItems.filter(item => item.featured).length}
          </span>
          <span className="stat-label">Featured</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {galleryItems.filter(item => item.isActive).length}
          </span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {new Set(galleryItems.map(item => item.category)).size}
          </span>
          <span className="stat-label">Categories</span>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="gallery-grid">
        {!Array.isArray(galleryItems) || galleryItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📷</div>
            <h3>No Gallery Items Found</h3>
            <p>Add your first gallery item to showcase your amazing work!</p>
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FaPlus className="me-2" /> Add First Item
            </button>
          </div>
        ) : (
          <div className="row">
            {galleryItems.map((item) => (
              <div key={item._id} className="admin-card gallery-card">
                <div className="card-image-container">
                  <img 
                    src={item.imageUrl || item.image || 'https://via.placeholder.com/400x250?text=Gallery+Image'} 
                    alt={item.title}
                    className="card-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x250?text=Image+Not+Found';
                    }}
                  />
                  <div className="image-overlay">
                    {item.featured && (
                      <span className="overlay-badge overlay-featured">
                        <FaStar /> Featured
                      </span>
                    )}
                    {!item.isActive && (
                      <span className="overlay-badge overlay-inactive">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="card-header-row">
                    <h3 className="card-title">{item.title || 'Untitled'}</h3>
                    <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="card-description">
                    {item.description || 'No description available'}
                  </p>
                  
                  <div className="card-meta">
                    <div className="meta-item">
                      <FaCalendarAlt className="meta-icon" />
                      <span className="meta-label">Category:</span>
                      <span className="meta-value">
                        {categories.find(c => c.value === item.category)?.label || item.category}
                      </span>
                    </div>
                    
                    {item.festival && (
                      <div className="meta-item">
                        <FaCalendarAlt className="meta-icon" />
                        <span className="meta-label">Festival:</span>
                        <span className="meta-value">
                          {item.festival.name || item.festival}
                        </span>
                      </div>
                    )}
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="meta-item">
                        <FaTags className="meta-icon" />
                        <span className="meta-label">Tags:</span>
                        <div className="tags-container">
                          {Array.isArray(item.tags) ? (
                            item.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="tag">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="tag">{item.tags}</span>
                          )}
                          {Array.isArray(item.tags) && item.tags.length > 3 && (
                            <span className="tag-more">+{item.tags.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(item)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(item._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => !formSubmitting && setShowForm(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}</h3>
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
                    <label>Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Traditional Onam Sadhya"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      className="form-control"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe this gallery item..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Festival (Optional)</label>
                    <select
                      className="form-control"
                      name="festival"
                      value={formData.festival}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Festival</option>
                      {festivals.map(f => (
                        <option key={f._id} value={f._id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Display Order</label>
                    <input
                      type="number"
                      className="form-control"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="0"
                    />
                    <small className="form-text">Lower numbers appear first</small>
                  </div>
                </div>

                <div className="form-group">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., traditional, spicy, festive, kerala"
                  />
                  <small className="form-text">Add relevant keywords separated by commas</small>
                </div>

                {/* Image Upload */}
                <div className="form-group">
                  <label>
                    {editingItem ? 'Update Image (Leave empty to keep current)' : 'Image *'}
                  </label>
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
                            src={imagePreview || (editingItem?.imageUrl || editingItem?.image)}
                            alt="Preview"
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

                <div className="form-check-group">
                  <label className="form-check">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                    />
                    <span>Featured Item</span>
                    <small>Show this item in featured section</small>
                  </label>
                  
                  <label className="form-check">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span>Active</span>
                    <small>Show this item on the website</small>
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

export default GalleryManagement;