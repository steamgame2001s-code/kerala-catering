// frontend/src/components/admin/GalleryManagement.jsx - COMPLETELY FIXED
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes } from 'react-icons/fa';
import axiosInstance from '../../api/axiosConfig';
import './GalleryManagement.css';

const GalleryManagement = () => {
  const [gallery, setGallery] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [festivalsLoading, setFestivalsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'food',
    festival: '',
    order: '0',
    tags: '',
    featured: false,
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // FALLBACK IMAGES (SVG data URLs)
  const FALLBACK_IMAGES = {
    gallery: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23ff6b35'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='20' fill='white' text-anchor='middle'%3EGallery Image%3C/text%3E%3C/svg%3E",
    preview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23f59e0b'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='18' fill='white' text-anchor='middle'%3EImage Preview%3C/text%3E%3C/svg%3E"
  };

  // Available categories
  const categories = [
    { value: 'food', label: 'Food' },
    { value: 'event', label: 'Event' },
    { value: 'preparation', label: 'Preparation' },
    { value: 'festival', label: 'Festival' },
    { value: 'testimonial', label: 'Testimonial' },
    { value: 'team', label: 'Team' },
    { value: 'facilities', label: 'Facilities' }
  ];

  useEffect(() => {
    fetchGallery();
    fetchFestivals();
  }, []);

  // Fetch gallery items
  const fetchGallery = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axiosInstance.get('/admin/gallery');
      
      if (response.data.success) {
        setGallery(response.data.gallery || []);
      } else {
        setError(response.data.error || 'Failed to load gallery items');
      }
    } catch (error) {
      console.error('❌ Error fetching gallery:', error);
      setError('Failed to load gallery items. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch festivals for dropdown
  const fetchFestivals = async () => {
    try {
      setFestivalsLoading(true);
      
      const response = await axiosInstance.get('/admin/festivals');
      
      if (response.data.success) {
        setFestivals(response.data.festivals || []);
      }
    } catch (error) {
      console.error('❌ Error fetching festivals:', error);
      // Don't show error to user, just log it
    } finally {
      setFestivalsLoading(false);
    }
  };

  const getAbsoluteImageUrl = (url) => {
    if (!url) return FALLBACK_IMAGES.gallery;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If it's a relative path, prepend with base URL
    if (url.startsWith('/')) {
      const baseUrl = process.env.REACT_APP_API_URL || window.location.origin;
      return `${baseUrl}${url}`;
    }
    return url;
  };

  const handleEdit = (item) => {
    console.log('Editing gallery item:', item);
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category || 'food',
      festival: item.festival?._id || item.festival || '',
      order: item.order?.toString() || '0',
      tags: item.tags ? item.tags.join(', ') : '',
      featured: item.featured || false,
      isActive: item.isActive !== false
    });
    
    // Set image preview
    if (item.imageUrl) {
      setImagePreview(getAbsoluteImageUrl(item.imageUrl));
    } else {
      setImagePreview('');
    }
    
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery item?')) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/admin/gallery/${id}`);
      
      if (response.data.success) {
        alert('✅ Gallery item deleted successfully!');
        fetchGallery();
      } else {
        alert(`❌ ${response.data.error || 'Failed to delete gallery item'}`);
      }
    } catch (error) {
      console.error('Failed to delete gallery item:', error);
      alert('❌ Failed to delete gallery item');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('❌ Image size should be less than 10MB');
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('❌ Please select a valid image file (JPG, PNG, GIF, WEBP)');
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImagePreview = () => {
    setImageFile(null);
    setImagePreview('');
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const prepareFormData = () => {
    const formDataToSend = new FormData();
    
    // Append all form fields
    formDataToSend.append('title', formData.title.trim());
    formDataToSend.append('description', formData.description?.trim() || '');
    formDataToSend.append('category', formData.category);
    formDataToSend.append('festival', formData.festival || '');
    formDataToSend.append('order', formData.order || '0');
    
    // Handle tags - convert comma separated string to array
    if (formData.tags.trim()) {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      formDataToSend.append('tags', JSON.stringify(tagsArray));
    } else {
      formDataToSend.append('tags', '[]');
    }
    
    formDataToSend.append('featured', formData.featured.toString());
    formDataToSend.append('isActive', formData.isActive.toString());
    
    // Append image file if exists
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    } else if (editingItem && !imageFile && editingItem.imageUrl) {
      // When editing without new image, send current image URL
      formDataToSend.append('currentImageUrl', editingItem.imageUrl);
    }
    
    return formDataToSend;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('❌ Title is required');
      return;
    }
    
    setFormSubmitting(true);

    try {
      const formDataToSend = prepareFormData();
      let url, method;
      
      if (editingItem) {
        url = `/admin/gallery/${editingItem._id}`;
        method = 'PUT';
      } else {
        url = '/admin/gallery';
        method = 'POST';
      }

      console.log(`📤 Sending ${method} request to: ${url}`);
      
      const response = await axiosInstance({
        method: method,
        url: url,
        data: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Response:', response.data);
      
      if (response.data.success) {
        alert(editingItem ? '✅ Gallery item updated successfully!' : '✅ Gallery item added successfully!');
        setShowForm(false);
        setEditingItem(null);
        resetForm();
        fetchGallery();
      } else {
        alert(`❌ ${response.data.error || 'Failed to save gallery item'}`);
      }
    } catch (error) {
      console.error('❌ Failed to save gallery item:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      
      // More specific error messages
      if (error.response?.status === 500) {
        alert('❌ Server error. Please check if the backend is running properly.');
      } else if (error.response?.status === 413) {
        alert('❌ File too large. Please select a smaller image.');
      } else if (error.response?.status === 400) {
        alert('❌ Invalid data. Please check all required fields.');
      } else if (!navigator.onLine) {
        alert('❌ Network error. Please check your internet connection.');
      } else {
        alert('❌ Failed to save gallery item. Please try again.');
      }
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
      order: '0',
      tags: '',
      featured: false,
      isActive: true
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleFormClose = () => {
    if (!formSubmitting) {
      setShowForm(false);
      setEditingItem(null);
      resetForm();
    }
  };

  if (loading) {
    return (
      <div className="gallery-management-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading gallery items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-management-page">
        <div className="page-header">
          <div>
            <h2>Gallery Management</h2>
            <p className="page-description">Manage your catering gallery images</p>
          </div>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button className="btn-primary mt-3" onClick={fetchGallery}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalItems = gallery.length;
  const featuredItems = gallery.filter(item => item.featured).length;
  const activeItems = gallery.filter(item => item.isActive).length;

  return (
    <div className="gallery-management-page">
      <div className="page-header">
        <div>
          <h2>Gallery Management</h2>
          <p className="page-description">Manage your catering gallery images</p>
        </div>
        {/* FIXED: This should be the "Add New Gallery Item" button, NOT a form submission button */}
        <button 
          className="btn-primary" 
          onClick={() => { resetForm(); setEditingItem(null); setShowForm(true); }}
          aria-label="Add new gallery item"
        >
          <FaPlus className="icon-spacing" /> Add New Gallery Item
        </button>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{totalItems}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{featuredItems}</span>
          <span className="stat-label">Featured</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{activeItems}</span>
          <span className="stat-label">Active</span>
        </div>
      </div>

      {/* Gallery Items Grid */}
      {gallery.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📷</div>
          <h3>No Gallery Items Found</h3>
          <p>Add your first gallery item to get started!</p>
          <button 
            className="btn-primary mt-3" 
            onClick={() => { resetForm(); setEditingItem(null); setShowForm(true); }}
          >
            <FaPlus className="icon-spacing" /> Add Gallery Item
          </button>
        </div>
      ) : (
        <div className="gallery-grid">
          {gallery.map((item) => (
            <div key={item._id} className="gallery-card">
              <div className="gallery-image">
                <img 
                  src={getAbsoluteImageUrl(item.imageUrl)} 
                  alt={item.title}
                  loading="lazy"
                  onError={(e) => { 
                    e.target.src = FALLBACK_IMAGES.gallery;
                    e.target.onerror = null;
                  }}
                />
                {item.featured && <span className="featured-badge">Featured</span>}
              </div>
              <div className="gallery-content">
                <h4>{item.title}</h4>
                {item.description && (
                  <p className="gallery-description">
                    {item.description.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}
                  </p>
                )}
                <div className="gallery-meta">
                  <span className="gallery-category">{item.category}</span>
                  {item.festival && (
                    <span className="gallery-festival">
                      {item.festival.name || item.festival}
                    </span>
                  )}
                  <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="gallery-actions">
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEdit(item)}
                    aria-label={`Edit ${item.title}`}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(item._id)}
                    aria-label={`Delete ${item.title}`}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gallery Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={handleFormClose}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}</h3>
              <button 
                className="modal-close" 
                onClick={handleFormClose} 
                disabled={formSubmitting}
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {/* Title and Category Row */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input 
                      id="title"
                      type="text" 
                      className="form-control" 
                      value={formData.title} 
                      onChange={(e) => setFormData({...formData, title: e.target.value})} 
                      required 
                      disabled={formSubmitting}
                      placeholder="Enter gallery item title"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select 
                      id="category"
                      className="form-control" 
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})} 
                      required
                      disabled={formSubmitting}
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea 
                    id="description"
                    className="form-control" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    rows="3" 
                    disabled={formSubmitting}
                    placeholder="Enter description (optional)"
                  />
                </div>

                {/* Festival and Order Row */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="festival">Festival (Optional)</label>
                    <select 
                      id="festival"
                      className="form-control" 
                      value={formData.festival} 
                      onChange={(e) => setFormData({...formData, festival: e.target.value})} 
                      disabled={formSubmitting || festivalsLoading}
                    >
                      <option value="">No Festival</option>
                      {festivals.map(festival => (
                        <option key={festival._id} value={festival._id}>
                          {festival.name}
                        </option>
                      ))}
                    </select>
                    {festivalsLoading && <small>Loading festivals...</small>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="order">Display Order</label>
                    <input 
                      id="order"
                      type="number" 
                      className="form-control" 
                      value={formData.order} 
                      onChange={(e) => setFormData({...formData, order: e.target.value})} 
                      min="0"
                      max="999"
                      disabled={formSubmitting}
                      placeholder="0"
                    />
                    <small className="form-text">Lower numbers appear first</small>
                  </div>
                </div>

                {/* Tags */}
                <div className="form-group">
                  <label htmlFor="tags">Tags (comma separated)</label>
                  <input 
                    id="tags"
                    type="text" 
                    className="form-control" 
                    value={formData.tags} 
                    onChange={(e) => setFormData({...formData, tags: e.target.value})} 
                    placeholder="e.g., Traditional, Spicy, Healthy" 
                    disabled={formSubmitting}
                  />
                  <small className="form-text">Separate tags with commas</small>
                </div>

                {/* Image Upload */}
                <div className="form-group">
                  <label htmlFor="image-upload">Gallery Image *</label>
                  <div className="image-upload-container">
                    <input 
                      id="image-upload"
                      type="file" 
                      className="form-control" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      required={!editingItem && !imagePreview} 
                      disabled={formSubmitting}
                    />
                    <small className="form-text">Max size: 10MB | Formats: JPG, PNG, GIF, WEBP</small>
                    
                    {/* Image Preview */}
                    {(imagePreview || (editingItem && editingItem.imageUrl)) && (
                      <div className="image-preview-upload mt-3">
                        <h6>Preview:</h6>
                        <div className="preview-image-container">
                          <img 
                            src={imagePreview || getAbsoluteImageUrl(editingItem.imageUrl)} 
                            alt="Preview" 
                            className="preview-image" 
                            onError={(e) => { 
                              e.target.src = FALLBACK_IMAGES.preview;
                              e.target.onerror = null;
                            }} 
                          />
                          <button
                            type="button"
                            className="preview-remove-btn"
                            onClick={clearImagePreview}
                            disabled={formSubmitting}
                            aria-label="Remove image"
                          >
                            <FaTimes />
                          </button>
                          {!imageFile && editingItem && (
                            <div className="current-image-note">
                              <FaEye /> Current Image
                            </div>
                          )}
                        </div>
                        <small className="form-text mt-2">
                          {imageFile ? 'New image selected' : 'Current image'}
                        </small>
                      </div>
                    )}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="form-check-group">
                  <label className="form-check">
                    <input 
                      type="checkbox" 
                      checked={formData.featured} 
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})} 
                      disabled={formSubmitting}
                    />
                    <span>Featured Item</span>
                  </label>
                  
                  <label className="form-check">
                    <input 
                      type="checkbox" 
                      checked={formData.isActive} 
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})} 
                      disabled={formSubmitting}
                    />
                    <span>Active (Show on website)</span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={handleFormClose} 
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
                        <FaSpinner className="icon-spacing spin" /> Saving...
                      </>
                    ) : editingItem ? (
                      <>
                        <FaEdit className="icon-spacing" /> Update Gallery Item
                      </>
                    ) : (
                      <>
                        <FaPlus className="icon-spacing" /> Add Gallery Item
                      </>
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