// frontend/src/components/admin/FestivalMenuImages.jsx - COMPLETE FIXED
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUpload, FaTrash, FaSpinner, FaImage, FaFileUpload } from 'react-icons/fa';
import './FestivalMenuImages.css';

const FestivalMenuImages = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [festival, setFestival] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  // Get API URL from environment variable
  const API_URL = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    fetchFestival();
  }, [id]);

  const getAbsoluteImageUrl = (url) => {
    if (!url) return '';
    
    // If URL already has http:// or https://, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // For relative paths
    if (url.startsWith('/')) {
      return `${API_URL}${url}`;
    }
    
    return `${API_URL}/${url}`;
  };

  const fetchFestival = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        navigate('/admin/login');
        return;
      }

      console.log('🔍 Fetching festival:', id);
      
      const response = await fetch(`${API_URL}/api/admin/festivals/${id}/menu`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success && data.festival) {
        console.log('✅ Festival loaded:', data.festival.name);
        setFestival(data.festival);
      } else {
        throw new Error(data.error || 'Failed to load festival');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('❌ Invalid file type. Use JPG, PNG, GIF, or WEBP');
      return;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('❌ File too large. Maximum 10MB');
      return;
    }
    
    console.log('✅ File selected:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });
    
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearFileSelection = () => {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('image-file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    console.log('\n🚀 === UPLOAD STARTED ===');
    
    if (!imageFile) {
      alert('❌ Please select an image file');
      return;
    }

    try {
      setUploading(true);
      
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        alert('❌ Not authenticated. Please login.');
        navigate('/admin/login');
        return;
      }
      
      console.log('📤 Preparing upload...');
      console.log('Festival ID:', id);
      console.log('File:', imageFile.name, imageFile.type, `${(imageFile.size / 1024).toFixed(2)} KB`);
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', imageFile); // Field name MUST be 'image'
      formData.append('caption', caption.trim());
      
      console.log('📦 FormData created with fields:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `${value.name} (${value.type})` : value);
      }
      
      console.log('🌐 Sending request to server...');
      
      // Make fetch request
      const response = await fetch(
        `${API_URL}/api/admin/festivals/${id}/menu-images`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // DO NOT set Content-Type - browser sets it automatically with boundary
          },
          body: formData
        }
      );

      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (response.ok && data.success) {
        console.log('✅ Upload successful!');
        alert('✅ Menu image uploaded successfully!');
        
        // Reset form
        setImageFile(null);
        setImagePreview(null);
        setCaption('');
        clearFileSelection();
        
        // Refresh data
        fetchFestival();
      } else {
        console.error('❌ Upload failed:', data.error);
        alert(`❌ Upload failed: ${data.error || 'Unknown error'}`);
      }
      
    } catch (err) {
      console.error('💥 Upload error:', err);
      alert(`❌ Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      console.log('=====================================\n');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Delete this menu image?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(
        `${API_URL}/api/admin/festivals/${id}/menu-images/${imageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('✅ Image deleted!');
        fetchFestival();
      } else {
        alert(`❌ ${data.error || 'Failed to delete'}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('❌ Failed to delete image');
    }
  };

  if (loading) {
    return (
      <div className="admin-page loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !festival) {
    return (
      <div className="admin-page error-container">
        <h3>Error</h3>
        <p>{error || 'Festival not found'}</p>
        <button 
          onClick={() => navigate('/admin/dashboard/festival-menu')}
          className="error-back-btn"
        >
          Back to Festivals
        </button>
      </div>
    );
  }

  const currentImageCount = festival.menuImages ? festival.menuImages.length : 0;
  const canUpload = currentImageCount < 2;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="festival-menu-header">
        <button 
          onClick={() => navigate('/admin/dashboard/festival-menu')}
          className="back-btn"
        >
          <FaArrowLeft /> Back
        </button>
        <div className="header-info">
          <h2>
            📋 {festival.name} - Menu Images
          </h2>
          <p>
            {currentImageCount}/2 images uploaded
          </p>
        </div>
      </div>

      <div className="menu-images-grid">
        
        {/* UPLOAD FORM */}
        <div className="upload-card">
          <h3>
            📤 Upload Image
          </h3>
          
          {canUpload ? (
            <form onSubmit={handleUpload}>
              {/* File Input */}
              <div className="file-upload-section">
                <label htmlFor="image-file-input">
                  Image File *
                </label>
                
                <input
                  type="file"
                  id="image-file-input"
                  name="image"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                
                <button
                  type="button"
                  onClick={() => document.getElementById('image-file-input').click()}
                  disabled={uploading}
                  className="file-upload-btn"
                >
                  <FaFileUpload size={24} />
                  {imageFile ? 'Change Image' : 'Select Image'}
                </button>
                
                <small className="file-upload-hint">
                  JPG, PNG, GIF, WEBP (Max 10MB)
                </small>
              </div>
              
              {/* Preview */}
              {imagePreview && (
                <div className="image-preview-section">
                  <label>Preview:</label>
                  <div className="preview-container">
                    <img 
                      src={imagePreview} 
                      alt="Preview"
                    />
                    <button
                      type="button"
                      onClick={clearFileSelection}
                      className="preview-remove-btn"
                    >
                      ×
                    </button>
                  </div>
                  <div className="file-info-badge">
                    ✓ {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                  </div>
                </div>
              )}
              
              {/* Caption */}
              <div className="caption-section">
                <label htmlFor="caption-input">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  id="caption-input"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g., Lunch Menu, Dinner Menu"
                  disabled={uploading}
                  className="caption-input"
                />
              </div>
              
              {/* Submit */}
              <button 
                type="submit" 
                disabled={uploading || !imageFile}
                className="upload-submit-btn"
              >
                {uploading ? (
                  <>
                    <FaSpinner className="spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaUpload />
                    Upload Image
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="max-upload-warning">
              <FaImage />
              <p>
                Maximum 2 images reached
              </p>
            </div>
          )}
        </div>

        {/* CURRENT IMAGES */}
        <div className="current-images-card">
          <h3>
            📷 Current Images ({currentImageCount}/2)
          </h3>
          
          {currentImageCount === 0 ? (
            <div className="no-images-state">
              <FaImage />
              <p>No images uploaded yet</p>
            </div>
          ) : (
            <div className="images-display-grid">
              {festival.menuImages.map((image, index) => (
                <div key={image._id || index} className="menu-image-item">
                  <div className="menu-image-wrapper">
                    <img
                      src={getAbsoluteImageUrl(image.imageUrl)}
                      alt={`Menu ${index + 1}`}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x180/FF6B35/FFFFFF?text=Image';
                      }}
                    />
                    <button
                      onClick={() => handleDeleteImage(image._id)}
                      className="delete-image-btn"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="menu-image-info">
                    <h4>
                      {image.caption || `Menu ${index + 1}`}
                    </h4>
                    <p>
                      {image.imageUrl}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FestivalMenuImages;