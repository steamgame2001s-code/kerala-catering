import React, { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaImage, FaSpinner, FaArrowLeft, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import './AdminPages.css';

const FestivalMenuManagement = () => {
  const navigate = useNavigate();
  const [festivals, setFestivals] = useState([]);
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFestivals();
  }, []);

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📋 Fetching festivals for menu management...');
      
      const response = await axiosInstance.get('/admin/festivals-menu-management');
      
      console.log('✅ Response:', response.data);
      
      if (response.data.success) {
        console.log(`Loaded ${response.data.festivals.length} festivals`);
        setFestivals(response.data.festivals);
      } else {
        console.error('API error:', response.data.error);
        setError(response.data.error || 'Failed to load festivals');
      }
    } catch (error) {
      console.error('Error fetching festivals:', error);
      setError('Failed to load festivals. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('❌ Image size should be less than 10MB');
        return;
      }
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('❌ Please select a valid image file (JPG, PNG, GIF, WEBP)');
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview('');
    const fileInput = document.getElementById('menu-image-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFestival) {
      alert('❌ Please select a festival');
      return;
    }
    
    if (!imageFile) {
      alert('❌ Please select an image');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('caption', caption);

      console.log('📤 Uploading to festival:', selectedFestival);
      
      const response = await axiosInstance.post(
        `/admin/festivals/${selectedFestival}/menu-images`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      const data = response.data;
      
      if (response.status === 201 && data.success) {
        alert('✅ Menu image uploaded successfully!');
        
        // Clear form
        clearImageSelection();
        setCaption('');
        
        // Refresh data
        fetchFestivals();
      } else {
        alert(`❌ ${data.error || 'Failed to upload image'}`);
      }
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert(`❌ Upload failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (festivalId, imageId) => {
    if (!window.confirm('Are you sure you want to delete this menu image?')) {
      return;
    }

    try {
      const response = await axiosInstance.delete(
        `/admin/festivals/${festivalId}/menu-images/${imageId}`
      );

      const data = response.data;

      if (data.success) {
        alert('✅ Menu image deleted successfully!');
        fetchFestivals();
      } else {
        alert(`❌ ${data.error || 'Failed to delete image'}`);
      }
    } catch (error) {
      console.error('❌ Delete failed:', error);
      alert('❌ Failed to delete image. Please try again.');
    }
  };

  const goToFestivalDetails = (festivalSlug) => {
    navigate(`/festivals/${festivalSlug}`);
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading festivals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="page-header">
          <h2>Festival Menu Images</h2>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button className="btn-primary mt-3" onClick={fetchFestivals}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const selectedFestivalData = festivals.find(f => f._id === selectedFestival);
  const canUpload = selectedFestivalData?.menuImages?.length < 2;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/admin/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FaArrowLeft /> Back
          </button>
          <div>
            <h2>Festival Menu Images</h2>
            <p className="page-description">Upload and manage festival menu images (max 2 per festival)</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column - Upload Form */}
        <div className="dashboard-card">
          <h3><FaUpload /> Upload Menu Image</h3>
          
          <form onSubmit={handleUpload} style={{ marginTop: '20px' }}>
            {/* Festival Selection */}
            <div className="form-group mb-4">
              <label>Select Festival *</label>
              <select
                className="form-control"
                value={selectedFestival || ''}
                onChange={(e) => setSelectedFestival(e.target.value)}
                required
              >
                <option value="">Choose a festival...</option>
                {festivals.map((festival) => (
                  <option key={festival._id} value={festival._id}>
                    {festival.name} ({festival.menuImages?.length || 0}/2 images)
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div className="form-group mb-4">
              <label>Menu Image *</label>
              <input
                type="file"
                id="menu-image-upload"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
                required
                disabled={!selectedFestival || !canUpload}
              />
              <small className="form-text">
                Max size: 10MB | Formats: JPG, PNG, GIF, WEBP
              </small>
              
              {imagePreview && (
                <div className="img-preview mt-3">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    onClick={clearImageSelection}
                    className="btn-delete-small mt-2"
                    style={{ width: '100%' }}
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="form-group mb-4">
              <label>Caption (Optional)</label>
              <input
                type="text"
                className="form-control"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="E.g., Traditional Christmas Menu"
                disabled={!selectedFestival || !canUpload}
              />
            </div>

            {/* Upload Button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={uploading || !selectedFestival || !imageFile || !canUpload}
              style={{ width: '100%' }}
            >
              {uploading ? (
                <>
                  <FaSpinner className="me-2 spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload className="me-2" />
                  Upload Menu Image
                </>
              )}
            </button>

            {/* Upload Limit Warning */}
            {selectedFestivalData && !canUpload && (
              <div className="alert alert-info mt-3">
                <strong>⚠️ Maximum Reached:</strong> This festival already has 2 menu images.
                Delete an existing image to upload a new one.
              </div>
            )}
          </form>
        </div>

        {/* Right Column - Current Images */}
        <div className="dashboard-card">
          <h3><FaImage /> Current Menu Images</h3>
          
          {selectedFestivalData ? (
            <>
              <div className="alert alert-info mb-3">
                <strong>{selectedFestivalData.name}</strong> - 
                {selectedFestivalData.menuImages?.length || 0}/2 images uploaded
                <button
                  className="btn-secondary btn-sm float-end"
                  onClick={() => goToFestivalDetails(selectedFestivalData.slug)}
                  style={{ padding: '4px 12px', fontSize: '12px' }}
                >
                  View Festival
                </button>
              </div>

              {selectedFestivalData.menuImages && selectedFestivalData.menuImages.length > 0 ? (
                <div className="menu-images-grid">
                  {selectedFestivalData.menuImages.map((image, index) => (
                    <div key={image._id} className="menu-image-card">
                      <div className="menu-image-container">
                        <img
                          src={image.imageUrl}
                          alt={image.caption || `Menu ${index + 1}`}
                          className="menu-image"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x200/FF6B35/FFFFFF?text=Menu+Image';
                          }}
                        />
                        <div className="menu-image-overlay">
                          <button
                            className="btn-delete-small"
                            onClick={() => handleDelete(selectedFestivalData._id, image._id)}
                            title="Delete image"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <div className="menu-image-footer">
                        <div className="menu-image-info">
                          <strong>{image.caption || `Menu Image ${index + 1}`}</strong>
                          <small>Order: {index + 1}</small>
                        </div>
                        <span className="badge badge-primary">#{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaImage className="empty-icon" />
                  <p>No menu images uploaded yet</p>
                  <small>Upload your first menu image above</small>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <FaImage className="empty-icon" />
              <p>Select a festival to view menu images</p>
            </div>
          )}
        </div>
      </div>

      {/* Festival Overview Grid */}
      <div className="dashboard-card mt-4">
        <h3>All Festivals Overview</h3>
        <div className="festivals-overview-grid">
          {festivals.map((festival) => (
            <div
              key={festival._id}
              className={`festival-overview-card ${selectedFestival === festival._id ? 'selected' : ''}`}
              onClick={() => setSelectedFestival(festival._id)}
            >
              <div className="festival-overview-content">
                <img
                  src={festival.image}
                  alt={festival.name}
                  className="festival-overview-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/60x60/FF6B35/FFFFFF?text=Festival';
                  }}
                />
                <div className="festival-overview-info">
                  <h4>{festival.name}</h4>
                  <small>
                    {festival.isActive ? '✅ Active' : '❌ Inactive'} | 
                    {festival.menuImages?.length || 0}/2 images
                  </small>
                </div>
                {festival.menuImages?.length === 2 && (
                  <div className="complete-icon">✓</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FestivalMenuManagement;