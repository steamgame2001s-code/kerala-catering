// frontend/src/components/admin/FestivalMenuManagement.jsx - COMPLETELY FIXED
import React, { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaImage, FaSpinner } from 'react-icons/fa';
import axiosInstance from '../../api/axiosConfig';
import './FestivalMenuManagement.css';

const FestivalMenuManagement = () => {
  const [festivals, setFestivals] = useState([]);
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');

  // FALLBACK IMAGES (SVG data URLs)
  const FALLBACK_IMAGES = {
    menu: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23ff6b35'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='18' fill='white' text-anchor='middle'%3EMenu Image%3C/text%3E%3C/svg%3E",
    notFound: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23e74c3c'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='12' fill='white' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E"
  };

  useEffect(() => {
    fetchFestivals();
  }, []);

  const getAbsoluteImageUrl = (url) => {
    if (!url) return FALLBACK_IMAGES.menu;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/')) {
      // For relative URLs, prepend with API URL if needed
      const apiUrl = process.env.REACT_APP_API_URL || '';
      return apiUrl ? `${apiUrl}${url}` : url;
    }
    return url;
  };

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🌐 Fetching festivals using axiosInstance');
      
      const response = await axiosInstance.get('/admin/festivals');
      
      console.log('✅ API response:', response.data);
      
      if (response.data.success) {
        const festivalsData = response.data.festivals || [];
        console.log(`Loaded ${festivalsData.length} festivals`);
        setFestivals(festivalsData);
        
        // Auto-select first festival if none selected
        if (festivalsData.length > 0 && !selectedFestival) {
          setSelectedFestival(festivalsData[0]._id);
        }
      } else {
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
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        alert('❌ Image size should be less than 5MB');
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

      console.log('📤 Uploading to festival ID:', selectedFestival);
      console.log('📊 File:', imageFile.name, imageFile.type, `${(imageFile.size / 1024).toFixed(2)} KB`);
      
      const response = await axiosInstance.post(
        `/admin/festivals/${selectedFestival}/menu-images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const data = response.data;
      
      if (data.success) {
        alert('✅ Menu image uploaded successfully!');
        
        // Reset form
        setImageFile(null);
        setImagePreview('');
        setCaption('');
        
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        // Refresh data
        fetchFestivals();
      } else {
        alert(`❌ ${data.error || 'Failed to upload image'}`);
      }
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert('❌ Failed to upload image. Please try again.');
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

  if (loading) {
    return (
      <div className="menu-management-loading">
        <div className="loading-spinner"></div>
        <p>Loading festivals...</p>
      </div>
    );
  }

  const selectedFestivalData = festivals.find(f => f._id === selectedFestival);

  return (
    <div className="festival-menu-management">
      <div className="page-header">
        <h2>Festival Menu Images</h2>
        <p className="page-description">Upload and manage festival menu images (max 2 per festival)</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchFestivals} className="error-retry-btn">
            Retry
          </button>
        </div>
      )}

      <div className="menu-management-row">
        {/* Left Column - Upload Form */}
        <div className="menu-management-col">
          <div className="admin-card upload-form-card">
            <div className="card-header">
              <h3><FaUpload className="header-icon" /> Upload Menu Image</h3>
            </div>
            <div className="card-content">
              <form onSubmit={handleUpload}>
                <div className="form-group">
                  <label htmlFor="festival-select">Select Festival *</label>
                  <select
                    id="festival-select"
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

                <div className="form-group">
                  <label htmlFor="image-upload">Menu Image *</label>
                  <input
                    id="image-upload"
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                  />
                  <small className="form-text">Max size: 5MB | Formats: JPG, PNG, GIF, WEBP</small>
                  
                  {imagePreview && (
                    <div className="image-preview-upload">
                      <h6>Preview:</h6>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="preview-image"
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="caption-input">Caption (Optional)</label>
                  <input
                    id="caption-input"
                    type="text"
                    className="form-control"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="E.g., Traditional Christmas Menu"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary upload-btn"
                  disabled={uploading || !selectedFestival || !imageFile}
                >
                  {uploading ? (
                    <>
                      <FaSpinner className="icon-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload className="icon" />
                      Upload Menu Image
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column - Current Images */}
        <div className="menu-management-col">
          <div className="admin-card current-images-card">
            <div className="card-header">
              <h3><FaImage className="header-icon" /> Current Menu Images</h3>
            </div>
            <div className="card-content">
              {selectedFestivalData ? (
                <>
                  <div className="festival-info-alert">
                    <strong>{selectedFestivalData.name}</strong> - {selectedFestivalData.menuImages?.length || 0}/2 images uploaded
                  </div>

                  {selectedFestivalData.menuImages && selectedFestivalData.menuImages.length > 0 ? (
                    <div className="menu-images-grid">
                      {selectedFestivalData.menuImages.map((image, index) => (
                        <div key={image._id} className="menu-image-card">
                          <div className="menu-image-container">
                            <img
                              src={getAbsoluteImageUrl(image.imageUrl)}
                              alt={image.caption || `Menu ${index + 1}`}
                              className="menu-image"
                              onError={(e) => {
                                e.target.src = FALLBACK_IMAGES.menu;
                                e.target.onerror = null;
                              }}
                            />
                          </div>
                          <div className="menu-image-footer">
                            <div className="menu-image-info">
                              <strong>{image.caption || `Menu Image ${index + 1}`}</strong>
                              <small>Order: {index + 1}</small>
                            </div>
                            <button
                              className="btn-delete-small"
                              onClick={() => handleDelete(selectedFestivalData._id, image._id)}
                              title="Delete image"
                              aria-label="Delete image"
                            >
                              <FaTrash />
                            </button>
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
                  <small>Choose a festival from the dropdown above</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Festival Overview Grid */}
      <div className="festivals-overview-section">
        <h3>All Festivals Overview</h3>
        <div className="festivals-overview-grid">
          {festivals.map((festival) => (
            <div
              key={festival._id}
              className={`festival-overview-card ${selectedFestival === festival._id ? 'selected' : ''}`}
              onClick={() => setSelectedFestival(festival._id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedFestival(festival._id);
                }
              }}
            >
              <div className="festival-overview-content">
                <div className="festival-image-wrapper">
                  <img
                    src={getAbsoluteImageUrl(festival.image)}
                    alt={festival.name}
                    className="festival-overview-image"
                    onError={(e) => {
                      e.target.src = FALLBACK_IMAGES.notFound;
                      e.target.onerror = null;
                    }}
                  />
                  <div className="image-count-badge">
                    {festival.menuImages?.length || 0}/2
                  </div>
                </div>
                <div className="festival-overview-info">
                  <h4>{festival.name}</h4>
                  <small>
                    {festival.menuImages?.length === 2 ? 'Full' : 
                     festival.menuImages?.length === 1 ? '1 image' : 
                     'No images'}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FestivalMenuManagement;