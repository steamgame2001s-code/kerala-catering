import React, { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaImage, FaSpinner } from 'react-icons/fa';
import axiosInstance from '../../api/axiosConfig'; // ADD THIS IMPORT
import '../../components/admin/AdminPages.css';

const FestivalMenuManagement = () => {
  const [festivals, setFestivals] = useState([]);
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [caption, setCaption] = useState('');

  useEffect(() => {
    fetchFestivals();
  }, []);

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      
      console.log('📋 Fetching festivals for menu management...');
      
      const response = await axiosInstance.get('/admin/festivals/menu-management');
      
      console.log('✅ Response:', response.data);
      
      if (response.data.success) {
        console.log(`Loaded ${response.data.festivals.length} festivals`);
        setFestivals(response.data.festivals);
      } else {
        console.error('API error:', response.data.error);
        alert(response.data.error || 'Failed to load festivals');
      }
    } catch (error) {
      console.error('Error fetching festivals:', error);
      alert('Failed to load festivals. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPG, PNG, GIF, etc.)');
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFestival) {
      alert('Please select a festival');
      return;
    }
    
    if (!imageFile) {
      alert('Please select an image');
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
        alert('Menu image uploaded successfully!');
        
        setImageFile(null);
        setImagePreview('');
        setCaption('');
        
        fetchFestivals();
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
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
        alert('Menu image deleted successfully!');
        fetchFestivals();
      } else {
        alert(data.error || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading festivals...</p>
      </div>
    );
  }

  const selectedFestivalData = festivals.find(f => f._id === selectedFestival);

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Festival Menu Images</h2>
        <p className="page-description">Upload and manage festival menu images (max 2 per festival)</p>
      </div>

      <div className="row">
        {/* Left Column - Upload Form */}
        <div className="col-md-6">
          <div className="admin-card">
            <div className="card-header">
              <h3><FaUpload /> Upload Menu Image</h3>
            </div>
            <div className="card-content">
              <form onSubmit={handleUpload}>
                <div className="form-group">
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

                <div className="form-group">
                  <label>Menu Image *</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                  />
                  <small className="form-text">Max size: 5MB | Formats: JPG, PNG, GIF</small>
                  
                  {imagePreview && (
                    <div className="image-preview-upload mt-3">
                      <h6>Preview:</h6>
                      <img src={imagePreview} alt="Preview" className="preview-image" />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Caption (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="E.g., Traditional Christmas Menu"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={uploading || !selectedFestival || !imageFile}
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
              </form>
            </div>
          </div>
        </div>

        {/* Right Column - Current Images */}
        <div className="col-md-6">
          <div className="admin-card">
            <div className="card-header">
              <h3><FaImage /> Current Menu Images</h3>
            </div>
            <div className="card-content">
              {selectedFestivalData ? (
                <>
                  <div className="alert alert-info mb-3">
                    <strong>{selectedFestivalData.name}</strong> - {selectedFestivalData.menuImages?.length || 0}/2 images uploaded
                  </div>

                  {selectedFestivalData.menuImages && selectedFestivalData.menuImages.length > 0 ? (
                    <div className="menu-images-grid">
                      {selectedFestivalData.menuImages.map((image, index) => (
                        <div key={image._id} className="menu-image-card">
                          <img
                            src={image.imageUrl}
                            alt={image.caption || `Menu ${index + 1}`}
                            className="menu-image"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                            }}
                          />
                          <div className="menu-image-footer">
                            <div className="menu-image-info">
                              <strong>{image.caption || `Menu Image ${index + 1}`}</strong>
                              <small>Order: {index + 1}</small>
                            </div>
                            <button
                              className="btn-delete-small"
                              onClick={() => handleDelete(selectedFestivalData._id, image._id)}
                              title="Delete image"
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Festival Overview Grid */}
      <div className="mt-5">
        <h3 className="mb-4">All Festivals Overview</h3>
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
                    e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                  }}
                />
                <div className="festival-overview-info">
                  <h4>{festival.name}</h4>
                  <small>{festival.menuImages?.length || 0}/2 images</small>
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