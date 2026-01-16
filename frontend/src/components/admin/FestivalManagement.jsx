import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSpinner, FaUpload } from 'react-icons/fa';
import FestivalCard from '../FestivalCard';
import axiosInstance from '../../api/axiosConfig'; // ADD THIS IMPORT
import '../../components/admin/AdminPages.css';

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

  useEffect(() => {
    fetchFestivals();
  }, []);

  // FIXED: Using axiosInstance
  const fetchFestivals = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🚀 Fetching festivals via axios...');
      
      const response = await axiosInstance.get('/admin/festivals');
      
      console.log('✅ API Response:', response.data);
      
      if (response.data.success) {
        console.log(`🎉 Loaded ${response.data.festivals?.length || 0} festivals`);
        setFestivals(response.data.festivals || []);
      } else {
        setError(response.data.error || 'Failed to load festivals');
      }
      
    } catch (error) {
      console.error('💥 Error fetching festivals:', error);
      setError('Failed to load festivals. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (festival) => {
    console.log('Editing festival:', festival);
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
    
    if (festival.image) setImagePreview(festival.image);
    if (festival.bannerImage) setBannerImagePreview(festival.bannerImage);
    
    setImageFile(null);
    setBannerImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this festival? This will also remove all associated food items!')) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/admin/festivals/${id}`);
      
      if (response.data.success) {
        alert('Festival deleted successfully!');
        fetchFestivals();
      } else {
        alert(response.data.error || 'Failed to delete festival');
      }
    } catch (error) {
      console.error('Failed to delete festival:', error);
      alert('Failed to delete festival: ' + error.message);
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
      formDataToSend.append('slug', formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'));
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
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      if (bannerImageFile) {
        formDataToSend.append('bannerImage', bannerImageFile);
      }

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
        alert(response.data.error || 'Failed to save festival');
      }
    } catch (error) {
      console.error('Failed to save festival:', error);
      alert('Failed to save festival: ' + error.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
    setImageFile(null);
    setBannerImageFile(null);
    setImagePreview('');
    setBannerImagePreview('');
  };

  if (error) {
    return (
      <div className="admin-page">
        <div className="error-container">
          <h2>Error Loading Festivals</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchFestivals}>Try Again</button>
          <button className="btn-secondary" onClick={() => window.location.href = '/admin/login'}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
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
          <FaPlus className="me-2" /> Add New Festival
        </button>
      </div>

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
              <FaPlus className="me-2" /> Add First Festival
            </button>
          </div>
        ) : (
          <div className="row">
            {festivals.map((festival) => (
              <FestivalCard 
                key={festival._id}
                festival={festival}
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
              <h3>{editingFestival ? 'Edit Festival' : 'Add New Festival'}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)} disabled={formSubmitting}>
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Festival Name *</label>
                    <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  
                  <div className="form-group">
                    <label>Slug *</label>
                    <input type="text" className="form-control" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea className="form-control" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Main Image *</label>
                    <div className="image-upload-container">
                      <input type="file" className="form-control" accept="image/*" onChange={(e) => handleImageChange(e, 'main')} required={!editingFestival && !imagePreview} />
                      {(imagePreview || (editingFestival && !imageFile)) && (
                        <div className="image-preview-upload">
                          <h6>Preview:</h6>
                          <div className="preview-image-container">
                            <img src={imagePreview || editingFestival?.image} alt="Main Preview" className="preview-image" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Preview+Not+Available'; }} />
                            {!imageFile && editingFestival && <div className="current-image-note"><FaEye /> Current Image</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Banner Image (Optional)</label>
                    <div className="image-upload-container">
                      <input type="file" className="form-control" accept="image/*" onChange={(e) => handleImageChange(e, 'banner')} />
                      {(bannerImagePreview || (editingFestival && !bannerImageFile)) && (
                        <div className="image-preview-upload">
                          <h6>Preview:</h6>
                          <div className="preview-image-container">
                            <img src={bannerImagePreview || editingFestival?.bannerImage} alt="Banner Preview" className="preview-image" onError={(e) => { e.target.src = 'https://via.placeholder.com/600x300?text=Banner+Preview'; }} />
                            {!bannerImageFile && editingFestival && <div className="current-image-note"><FaEye /> Current Image</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Rating</label>
                    <input type="number" step="0.1" min="0" max="5" className="form-control" value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label>Review Count</label>
                    <input type="number" className="form-control" value={formData.reviewCount} onChange={(e) => setFormData({...formData, reviewCount: e.target.value})} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Categories (comma separated)</label>
                    <input type="text" className="form-control" value={formData.categories} onChange={(e) => setFormData({...formData, categories: e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label>Popular Items (comma separated)</label>
                    <input type="text" className="form-control" value={formData.popularItems} onChange={(e) => setFormData({...formData, popularItems: e.target.value})} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Festival Dates</label>
                    <input type="text" className="form-control" value={formData.festivalDates} onChange={(e) => setFormData({...formData, festivalDates: e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label>Delivery Info</label>
                    <input type="text" className="form-control" value={formData.deliveryInfo} onChange={(e) => setFormData({...formData, deliveryInfo: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Special Note</label>
                  <input type="text" className="form-control" value={formData.specialNote} onChange={(e) => setFormData({...formData, specialNote: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Highlights (comma separated)</label>
                  <input type="text" className="form-control" value={formData.highlights} onChange={(e) => setFormData({...formData, highlights: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Tags (comma separated)</label>
                  <input type="text" className="form-control" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} />
                </div>

                <div className="form-check-group">
                  <label className="form-check">
                    <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} />
                    <span>Featured Festival</span>
                  </label>
                  
                  <label className="form-check">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
                    <span>Active (Show on website)</span>
                  </label>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} disabled={formSubmitting}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={formSubmitting}>
                    {formSubmitting ? <><FaSpinner className="me-2 spin" /> Saving...</> : editingFestival ? 'Update Festival' : 'Add Festival'}
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