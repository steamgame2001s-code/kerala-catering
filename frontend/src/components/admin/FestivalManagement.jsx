// frontend/src/components/admin/FestivalManagement.jsx - FIXED WITH DIRECT FETCH
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSpinner, FaUpload } from 'react-icons/fa';
import FestivalCard from '../FestivalCard';
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

  // ADD THESE STATES FOR FILE UPLOAD
  const [imageFile, setImageFile] = useState(null);
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [bannerImagePreview, setBannerImagePreview] = useState('');

  useEffect(() => {
    console.log('🎬 FestivalManagement component mounted');
    fetchFestivals();
  }, []);

  // FIXED: Using direct fetch instead of axiosInstance
  const fetchFestivals = async () => {
    console.log('🚀 fetchFestivals called');
    
    try {
      setLoading(true);
      setError('');
      
      // Get token from localStorage
      const token = localStorage.getItem('adminToken');
      console.log('📊 Token exists:', !!token);
      
      if (!token) {
        console.error('❌ No token found');
        setError('Not logged in as admin');
        window.location.href = '/admin/login';
        return;
      }
      
      console.log('🌐 Making API request to /admin/festivals...');
      
      // USE DIRECT FETCH - THIS WE KNOW WORKS
      const response = await fetch('http://localhost:5000/api/admin/festivals', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      // Handle unauthorized
      if (response.status === 401) {
        console.error('❌ 401 Unauthorized');
        localStorage.removeItem('adminToken');
        setError('Session expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
        return;
      }
      
      // Handle other errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP error:', response.status, errorText);
        setError(`Server error: ${response.status}`);
        return;
      }
      
      // Parse successful response
      const data = await response.json();
      console.log('✅ API response success:', data.success);
      console.log('🎉 Festivals count:', data.festivals?.length || 0);
      
      if (data.success) {
        setFestivals(data.festivals);
      } else {
        setError(data.error || 'Failed to load festivals');
      }
      
    } catch (error) {
      console.error('💥 Network error:', error);
      setError('Network error: ' + error.message);
    } finally {
      console.log('🏁 Loading complete');
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
    
    // Set image previews if images exist
    if (festival.image) {
      setImagePreview(festival.image);
    }
    if (festival.bannerImage) {
      setBannerImagePreview(festival.bannerImage);
    }
    
    // Clear file states
    setImageFile(null);
    setBannerImageFile(null);
    
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this festival? This will also remove all associated food items!')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/festivals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Festival deleted successfully!');
        fetchFestivals();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete festival');
      }
    } catch (error) {
      console.error('Failed to delete festival:', error);
      alert('Failed to delete festival');
    }
  };

  // ADD FILE HANDLING FUNCTIONS
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
      const token = localStorage.getItem('adminToken');
      
      // Prepare FormData for file upload
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
      
      // Add image files if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (editingFestival && editingFestival.image && !imageFile) {
        // If editing and no new file, keep existing image URL
        formDataToSend.append('imageUrl', editingFestival.image);
      }
      
      if (bannerImageFile) {
        formDataToSend.append('bannerImage', bannerImageFile);
      } else if (editingFestival && editingFestival.bannerImage && !bannerImageFile) {
        // If editing and no new file, keep existing banner image URL
        formDataToSend.append('bannerImageUrl', editingFestival.bannerImage);
      }

      let url, method;
      if (editingFestival) {
        url = `http://localhost:5000/api/admin/festivals/${editingFestival._id}`;
        method = 'PUT';
      } else {
        url = 'http://localhost:5000/api/admin/festivals';
        method = 'POST';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(editingFestival ? 'Festival updated successfully!' : 'Festival added successfully!');
        setShowForm(false);
        setEditingFestival(null);
        resetForm();
        fetchFestivals();
      } else {
        alert(data.error || 'Failed to save festival');
      }
    } catch (error) {
      console.error('Failed to save festival:', error);
      alert('Failed to save festival. Please try again.');
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

  // ADD ERROR DISPLAY
  if (error) {
    return (
      <div className="admin-page">
        <div className="error-container">
          <h2>Error Loading Festivals</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchFestivals}>
            Try Again
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => window.location.href = '/admin/login'}
            style={{ marginLeft: '10px' }}
          >
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
        <button 
          className="btn-primary"
          onClick={() => {
            resetForm();
            setEditingFestival(null);
            setShowForm(true);
          }}
        >
          <FaPlus className="me-2" /> Add New Festival
        </button>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{festivals.length}</span>
          <span className="stat-label">Total Festivals</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {festivals.filter(f => f.isFeatured).length}
          </span>
          <span className="stat-label">Featured</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {festivals.filter(f => f.isActive).length}
          </span>
          <span className="stat-label">Active</span>
        </div>
      </div>

      {/* Festivals Grid */}
      <div className="festivals-grid">
        {festivals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <h3>No Festivals Found</h3>
            <p>Add your first festival to get started!</p>
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
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

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => !formSubmitting && setShowForm(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingFestival ? 'Edit Festival' : 'Add New Festival'}</h3>
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
                    <label>Festival Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      placeholder="e.g., Christmas, Onam, Vishu"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Slug *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      required
                      placeholder="christmas, onam, vishu"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    required
                    placeholder="Brief description of the festival"
                  />
                </div>

                {/* UPDATED IMAGE UPLOAD SECTION */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Main Image *</label>
                    <div className="image-upload-container">
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'main')}
                        required={!editingFestival && !imagePreview}
                      />
                      
                      {(imagePreview || (editingFestival && !imageFile)) && (
                        <div className="image-preview-upload">
                          <h6>Preview:</h6>
                          <div className="preview-image-container">
                            <img
                              src={imagePreview || editingFestival?.image}
                              alt="Main Preview"
                              className="preview-image"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x200?text=Preview+Not+Available';
                              }}
                            />
                            {!imageFile && editingFestival && (
                              <div className="current-image-note">
                                <FaEye /> Current Image
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Banner Image (Optional)</label>
                    <div className="image-upload-container">
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'banner')}
                      />
                      
                      {(bannerImagePreview || (editingFestival && !bannerImageFile)) && (
                        <div className="image-preview-upload">
                          <h6>Preview:</h6>
                          <div className="preview-image-container">
                            <img
                              src={bannerImagePreview || editingFestival?.bannerImage}
                              alt="Banner Preview"
                              className="preview-image"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/600x300?text=Banner+Preview';
                              }}
                            />
                            {!bannerImageFile && editingFestival && (
                              <div className="current-image-note">
                                <FaEye /> Current Image
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rest of your form fields remain the same */}
                <div className="form-row">
                  
                  <div className="form-group">
                    <label>Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      className="form-control"
                      value={formData.rating}
                      onChange={(e) => setFormData({...formData, rating: e.target.value})}
                      placeholder="4.5"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Review Count</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.reviewCount}
                      onChange={(e) => setFormData({...formData, reviewCount: e.target.value})}
                      placeholder="124"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Categories (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.categories}
                      onChange={(e) => setFormData({...formData, categories: e.target.value})}
                      placeholder="Biriyani, Roast, Fish Curry, Desserts"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Popular Items (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.popularItems}
                      onChange={(e) => setFormData({...formData, popularItems: e.target.value})}
                      placeholder="Chicken Biriyani, Beef Roast, Plum Cake"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Festival Dates</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.festivalDates}
                      onChange={(e) => setFormData({...formData, festivalDates: e.target.value})}
                      placeholder="Dec 24-26, 2024"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Delivery Info</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.deliveryInfo}
                      onChange={(e) => setFormData({...formData, deliveryInfo: e.target.value})}
                      placeholder="Free delivery on orders above ₹500"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Special Note</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.specialNote}
                      onChange={(e) => setFormData({...formData, specialNote: e.target.value})}
                      placeholder="Order before Dec 20th for guaranteed delivery"
                    />
                  </div>

                <div className="form-group">
                  <label>Highlights (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.highlights}
                    onChange={(e) => setFormData({...formData, highlights: e.target.value})}
                    placeholder="Traditional recipes, Fresh ingredients, Hygienic preparation"
                  />
                </div>

                <div className="form-group">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="Festive Special, Traditional, Family Meal"
                  />
                </div>

                <div className="form-check-group">
                  <label className="form-check">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    />
                    <span>Featured Festival</span>
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