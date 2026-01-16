import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUpload, FaTrash, FaSpinner, FaImage, FaFileUpload } from 'react-icons/fa';
import axiosInstance from '../../api/axiosConfig'; // ADD THIS IMPORT
import './AdminPages.css';

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

  useEffect(() => {
    fetchFestival();
  }, [id]);

  const fetchFestival = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching festival:', id);
      
      const response = await axiosInstance.get(`/admin/festivals/${id}/menu`);
      
      const data = response.data;
      
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
    
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('❌ File too large. Maximum 10MB');
      return;
    }
    
    console.log('✅ File selected:', { name: file.name, type: file.type, size: `${(file.size / 1024).toFixed(2)} KB` });
    
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
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
      
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('caption', caption.trim());
      
      console.log('📤 Preparing upload...');
      
      const response = await axiosInstance.post(
        `/admin/festivals/${id}/menu-images`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      console.log('📡 Response status:', response.status);
      
      const data = response.data;
      
      if (response.status === 201 && data.success) {
        console.log('✅ Upload successful!');
        alert('✅ Menu image uploaded successfully!');
        
        setImageFile(null);
        setImagePreview(null);
        setCaption('');
        clearFileSelection();
        
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
      const response = await axiosInstance.delete(
        `/admin/festivals/${id}/menu-images/${imageId}`
      );

      const data = response.data;
      
      if (response.status === 200 && data.success) {
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
      <div className="admin-page" style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #FF6B35',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !festival) {
    return (
      <div className="admin-page" style={{ textAlign: 'center', padding: '50px' }}>
        <h3>Error</h3>
        <p>{error || 'Festival not found'}</p>
        <button 
          onClick={() => navigate('/admin/dashboard/festival-menu')}
          style={{
            padding: '12px 24px',
            background: '#FF6B35',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
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
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        marginBottom: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <button 
          onClick={() => navigate('/admin/dashboard/festival-menu')}
          style={{
            padding: '10px 20px',
            background: 'white',
            color: '#2D3748',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaArrowLeft /> Back
        </button>
        <div>
          <h2 style={{ margin: '0 0 5px 0', color: '#2D3748' }}>
            📋 {festival.name} - Menu Images
          </h2>
          <p style={{ margin: 0, color: '#718096' }}>
            {currentImageCount}/2 images uploaded
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        
        {/* UPLOAD FORM */}
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#2D3748' }}>
            📤 Upload Image
          </h3>
          
          {canUpload ? (
            <form onSubmit={handleUpload}>
              {/* File Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>
                  Image File *
                </label>
                
                <input
                  type="file"
                  id="image-file-input"
                  name="image"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                
                <button
                  type="button"
                  onClick={() => document.getElementById('image-file-input').click()}
                  disabled={uploading}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: '#f8fafc',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    color: '#64748b',
                    fontWeight: '600'
                  }}
                >
                  <FaFileUpload size={24} />
                  {imageFile ? 'Change Image' : 'Select Image'}
                </button>
                
                <small style={{ display: 'block', marginTop: '5px', color: '#718096' }}>
                  JPG, PNG, GIF, WEBP (Max 10MB)
                </small>
              </div>
              
              {/* Preview */}
              {imagePreview && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Preview:
                  </label>
                  <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview"
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={clearFileSelection}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '2px solid #fecaca',
                        width: '35px',
                        height: '35px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#f0fdf4',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#15803d'
                  }}>
                    ✓ {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                  </div>
                </div>
              )}
              
              {/* Caption */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g., Lunch Menu, Dinner Menu"
                  disabled={uploading}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              {/* Submit */}
              <button 
                type="submit" 
                disabled={uploading || !imageFile}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: uploading || !imageFile ? '#cbd5e1' : 'linear-gradient(135deg, #FF6B35, #FFA62B)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: uploading || !imageFile ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
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
            <div style={{
              padding: '20px',
              background: '#fef3c7',
              borderRadius: '10px',
              borderLeft: '4px solid #D69E2E',
              textAlign: 'center'
            }}>
              <FaImage style={{ fontSize: '48px', color: '#D69E2E', marginBottom: '15px' }} />
              <p style={{ margin: 0, fontWeight: '600', color: '#92400e' }}>
                Maximum 2 images reached
              </p>
            </div>
          )}
        </div>

        {/* CURRENT IMAGES */}
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#2D3748' }}>
            📷 Current Images ({currentImageCount}/2)
          </h3>
          
          {currentImageCount === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '2px dashed #cbd5e1'
            }}>
              <FaImage style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '20px' }} />
              <p style={{ color: '#718096' }}>No images uploaded yet</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {festival.menuImages.map((image, index) => (
                <div key={image._id || index} style={{
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <div style={{ height: '180px', position: 'relative' }}>
                    <img
                      src={image.imageUrl}
                      alt={`Menu ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x180/FF6B35/FFFFFF?text=Image';
                      }}
                    />
                    <button
                      onClick={() => handleDeleteImage(image._id)}
                      style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '2px solid #fecaca',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div style={{ padding: '15px' }}>
                    <h4 style={{ margin: '0 0 5px 0' }}>
                      {image.caption || `Menu ${index + 1}`}
                    </h4>
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