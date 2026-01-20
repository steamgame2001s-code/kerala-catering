// frontend/src/components/admin/FestivalManagement.jsx - COMPLETE FIXED
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaStar } from 'react-icons/fa';
import axiosInstance from '../../api/axiosConfig';
import './FestivalManagement.css';

const FestivalManagement = () => {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFestival, setEditingFestival] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    rating: '',
    reviewCount: '',
    categories: '',
    popularItems: '',
    festivalDates: '',
    deliveryInfo: '',
    specialNote: '',
    highlights: '',
    tags: '',
    isFeatured: false,
    isActive: true
  });

  const [imageFile, setImageFile] = useState(null);
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [bannerImagePreview, setBannerImagePreview] = useState('');

  const FALLBACK_IMAGES = {
    festival: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23ff6b35'/%3E%3Ctext x='50%25' y='45%25' font-family='Arial, sans-serif' font-size='24' fill='white' text-anchor='middle'%3EFestival%3C/text%3E%3Ctext x='50%25' y='60%25' font-family='Arial, sans-serif' font-size='18' fill='white' text-anchor='middle'%3EImage%3C/text%3E%3C/svg%3E",
    banner: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='300' viewBox='0 0 600 300'%3E%3Crect width='600' height='300' fill='%23ff6b35'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='24' fill='white' text-anchor='middle'%3EBanner Image Preview%3C/text%3E%3C/svg%3E"
  };

  useEffect(() => {
    fetchFestivals();
  }, []);

  const getAbsoluteImageUrl = (url) => {
    if (!url) return FALLBACK_IMAGES.festival;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads/') || url.startsWith('/images/')) {
      const baseURL = window.location.origin;
      return `${baseURL}${url}`;
    }
    return url;
  };

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Not logged in as admin');
        window.location.href = '/admin/login';
        return;
      }
      
      const response = await axiosInstance.get('/admin/festivals');
      
      if (response.data.success) {
        const festivalsData = response.data.festivals || response.data.data || [];
        setFestivals(festivalsData);
      } else {
        setError(response.data.message || 'Failed to load festivals');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        setError('Session expired. Please login again.');
        setTimeout(() => window.location.href = '/admin/login', 2000);
        return;
      }
      setError(error.message || 'Failed to load festivals');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (festival) => {
    setEditingFestival(festival);
    setFormData({
      name: festival.name,
      slug: festival.slug,
      description: festival.description || '',
      rating: festival.rating || '',
      reviewCount: festival.reviewCount || '',
      categories: festival.categories ? festival.categories.join(', ') : '',
      popularItems: festival.popularItems ? festival.popularItems.join(', ') : '',
      festivalDates: festival.festivalDates || '',
      deliveryInfo: festival.deliveryInfo || '',
      specialNote: festival.specialNote || '',
      highlights: festival.highlights ? festival.highlights.join(', ') : '',
      tags: festival.tags ? festival.tags.join(', ') : '',
      isFeatured: festival.isFeatured || false,
      isActive: festival.isActive !== false
    });
    
    setImagePreview(festival.image ? getAbsoluteImageUrl(festival.image) : FALLBACK_IMAGES.festival);
    setBannerImagePreview(festival.bannerImage ? getAbsoluteImageUrl(festival.bannerImage) : FALLBACK_IMAGES.banner);
    setImageFile(null);
    setBannerImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this festival?')) return;

    try {
      const response = await axiosInstance.delete(`/admin/festivals/${id}`);
      if (response.data.success) {
        alert('Festival deleted successfully!');
        fetchFestivals();
      } else {
        alert(response.data.message || 'Failed to delete festival');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete festival');
    }
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'main') {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        setBannerImageFile(file);
        setBannerImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('slug', formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
      formDataToSend.append('rating', formData.rating || '');
      formDataToSend.append('reviewCount', formData.reviewCount || '');
      formDataToSend.append('categories', formData.categories);
      formDataToSend.append('popularItems', formData.popularItems);
      formDataToSend.append('festivalDates', formData.festivalDates || '');
      formDataToSend.append('deliveryInfo', formData.deliveryInfo || '');
      formDataToSend.append('specialNote', formData.specialNote || '');
      formDataToSend.append('highlights', formData.highlights);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('isFeatured', formData.isFeatured);
      formDataToSend.append('isActive', formData.isActive);
      
      if (imageFile) formDataToSend.append('image', imageFile);
      if (bannerImageFile) formDataToSend.append('bannerImage', bannerImageFile);

      let response;
      if (editingFestival) {
        response = await axiosInstance.put(`/admin/festivals/${editingFestival._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axiosInstance.post('/admin/festivals', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      if (response.data.success) {
        alert(editingFestival ? 'Festival updated successfully!' : 'Festival added successfully!');
        setShowForm(false);
        setEditingFestival(null);
        resetForm();
        fetchFestivals();
      } else {
        alert(response.data.message || 'Failed to save festival');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save festival');
    } finally {
      setFormSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', slug: '', description: '', rating: '', reviewCount: '',
      categories: '', popularItems: '', festivalDates: '', deliveryInfo: '',
      specialNote: '', highlights: '', tags: '', isFeatured: false, isActive: true
    });
    setImageFile(null);
    setBannerImageFile(null);
    setImagePreview(FALLBACK_IMAGES.festival);
    setBannerImagePreview(FALLBACK_IMAGES.banner);
  };

  if (loading) {
    return (
      <div className="festival-management-loading">
        <div className="loading-spinner"></div>
        <p>Loading festivals...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Festival Management</h2>
        <button className="btn-primary" onClick={() => { resetForm(); setEditingFestival(null); setShowForm(true); }}>
          <FaPlus className="icon-spacing" /> Add New Festival
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{festivals.length}</span>
          <span className="stat-label">Total Festivals</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{festivals.filter(f => f.isFeatured).length}</span>
          <span className="stat-label">Featured</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{festivals.filter(f => f.isActive).length}</span>
          <span className="stat-label">Active</span>
        </div>
      </div>

      <div className="festivals-grid">
        {festivals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <h3>No Festivals Found</h3>
            <p>Add your first festival to get started!</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus className="icon-spacing" /> Add First Festival
            </button>
          </div>
        ) : (
          <div className="festivals-row">
            {festivals.map((festival) => (
              <div key={festival._id} className="festival-card">
                <div className="festival-image">
                  <img
                    src={getAbsoluteImageUrl(festival.image)}
                    alt={festival.name}
                    onError={(e) => { e.target.src = FALLBACK_IMAGES.festival; }}
                  />
                  <div className="festival-badges-overlay">
                    {festival.isFeatured && <span className="festival-badge featured">Featured</span>}
                    <span className={`status-badge ${festival.isActive ? 'active' : 'inactive'}`}>
                      {festival.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="festival-content">
                  <h3>{festival.name}</h3>
                  
                  <p className="festival-description">{festival.description}</p>
                  
                  <div className="festival-meta-info">
                    <div className="festival-slug">
                      <span className="meta-label">Slug:</span>
                      <span className="meta-value">{festival.slug}</span>
                    </div>
                    
                    {festival.rating && (
                      <div className="festival-rating">
                        <FaStar className="star-icon" />
                        <span>{festival.rating}/5</span>
                        {festival.reviewCount && <span className="review-count">({festival.reviewCount} reviews)</span>}
                      </div>
                    )}
                  </div>
                  
                  {festival.popularItems && festival.popularItems.length > 0 && (
                    <div className="festival-items">
                      <div className="items-tags">
                        {festival.popularItems.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="item-tag">{item}</span>
                        ))}
                        {festival.popularItems.length > 3 && (
                          <span className="item-tag more">+{festival.popularItems.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="festival-actions">
                    <button className="btn-edit" onClick={() => handleEdit(festival)}>
                      <FaEdit /> Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(festival._id)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => !formSubmitting && setShowForm(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingFestival ? 'Edit Festival' : 'Add New Festival'}</h3>
              <button className="modal-close" onClick={() => !formSubmitting && setShowForm(false)} disabled={formSubmitting}>
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Festival Name *</label>
                    <input type="text" className="form-control" value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required placeholder="e.g., Christmas, Onam, Vishu" />
                  </div>
                  
                  <div className="form-group">
                    <label>Slug *</label>
                    <input type="text" className="form-control" value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      required placeholder="christmas, onam, vishu" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea className="form-control" value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3" required placeholder="Brief description of the festival" />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Main Image *</label>
                    <input type="file" className="form-control" accept="image/*"
                      onChange={(e) => handleImageChange(e, 'main')} required={!editingFestival} />
                    {imagePreview && (
                      <div className="image-preview-upload">
                        <img src={imagePreview} alt="Preview" className="preview-image"
                          onError={(e) => { e.target.src = FALLBACK_IMAGES.festival; }} />
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Banner Image (Optional)</label>
                    <input type="file" className="form-control" accept="image/*"
                      onChange={(e) => handleImageChange(e, 'banner')} />
                    {bannerImagePreview && (
                      <div className="image-preview-upload">
                        <img src={bannerImagePreview} alt="Banner Preview" className="preview-image"
                          onError={(e) => { e.target.src = FALLBACK_IMAGES.banner; }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Rating</label>
                    <input type="number" className="form-control" value={formData.rating}
                      onChange={(e) => setFormData({...formData, rating: e.target.value})}
                      placeholder="4.5" min="0" max="5" step="0.1" />
                  </div>
                  
                  <div className="form-group">
                    <label>Review Count</label>
                    <input type="number" className="form-control" value={formData.reviewCount}
                      onChange={(e) => setFormData({...formData, reviewCount: e.target.value})}
                      placeholder="120" min="0" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Categories (comma separated)</label>
                    <input type="text" className="form-control" value={formData.categories}
                      onChange={(e) => setFormData({...formData, categories: e.target.value})}
                      placeholder="South Indian, Traditional, Vegetarian" />
                  </div>
                  
                  <div className="form-group">
                    <label>Popular Items (comma separated)</label>
                    <input type="text" className="form-control" value={formData.popularItems}
                      onChange={(e) => setFormData({...formData, popularItems: e.target.value})}
                      placeholder="Sadya, Payasam, Banana Chips" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Festival Dates</label>
                  <input type="text" className="form-control" value={formData.festivalDates}
                    onChange={(e) => setFormData({...formData, festivalDates: e.target.value})}
                    placeholder="August 20-22, 2024" />
                </div>

                <div className="form-group">
                  <label>Delivery Information</label>
                  <input type="text" className="form-control" value={formData.deliveryInfo}
                    onChange={(e) => setFormData({...formData, deliveryInfo: e.target.value})}
                    placeholder="Free delivery within 5km" />
                </div>

                <div className="form-group">
                  <label>Special Note</label>
                  <textarea className="form-control" value={formData.specialNote}
                    onChange={(e) => setFormData({...formData, specialNote: e.target.value})}
                    rows="2" placeholder="Special instructions or notes" />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Highlights (comma separated)</label>
                    <input type="text" className="form-control" value={formData.highlights}
                      onChange={(e) => setFormData({...formData, highlights: e.target.value})}
                      placeholder="Traditional, Family Pack, Spicy" />
                  </div>
                  
                  <div className="form-group">
                    <label>Tags (comma separated)</label>
                    <input type="text" className="form-control" value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="festival, food, catering, traditional" />
                  </div>
                </div>

                <div className="form-check-group">
                  <label className="form-check">
                    <input type="checkbox" checked={formData.isFeatured}
                      onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} />
                    <span>Featured Festival</span>
                  </label>
                  
                  <label className="form-check">
                    <input type="checkbox" checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
                    <span>Active (Show on website)</span>
                  </label>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary"
                    onClick={() => !formSubmitting && setShowForm(false)} disabled={formSubmitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={formSubmitting}>
                    {formSubmitting ? (
                      <><FaSpinner className="icon-spacing spin" />Saving...</>
                    ) : (
                      editingFestival ? 'Update Festival' : 'Add Festival'
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

export default FestivalManagement;