// backend/config/cloudinary.js - SIMPLIFIED FIXED VERSION
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// ========== CLOUDINARY CONFIGURATION ==========
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlgrdnghb',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️ Cloudinary Config Check:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlgrdnghb',
  api_key: process.env.CLOUDINARY_API_KEY ? '✓ Set' : '❌ Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '❌ Missing'
});

// Test connection
cloudinary.api.ping()
  .then(() => console.log('✅ Cloudinary connected successfully'))
  .catch(err => console.error('❌ Cloudinary connection error:', err.message));

// ========== FESTIVAL STORAGE (SIMPLIFIED) ==========
const festivalStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kerala-catering/festivals',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ],
    format: 'jpg'
  }
});

const uploadFestival = multer({
  storage: festivalStorage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const ext = file.originalname.toLowerCase().split('.').pop();
    const mimetype = file.mimetype;
    
    if (allowedTypes.test(ext) && allowedTypes.test(mimetype)) {
      console.log(`✅ Festival image accepted: ${file.originalname}`);
      return cb(null, true);
    }
    
    console.log(`❌ Rejected file: ${file.originalname}`);
    cb(new Error('Only JPG, PNG, WEBP, and GIF images are allowed!'));
  }
});

// ========== FESTIVAL MENU STORAGE ==========
const festivalMenuStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kerala-catering/festival-menus',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1600, height: 1200, crop: 'limit' },
      { quality: 'auto:best' },
      { fetch_format: 'auto' }
    ]
  }
});

const uploadFestivalMenu = multer({
  storage: festivalMenuStorage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = file.originalname.toLowerCase().split('.').pop();
    const mimetype = file.mimetype;
    
    if (allowedTypes.test(ext) && allowedTypes.test(mimetype)) {
      console.log(`✅ Menu image accepted: ${file.originalname}`);
      return cb(null, true);
    }
    
    console.log(`❌ Rejected file: ${file.originalname}`);
    cb(new Error('Only JPG, PNG, and WEBP images are allowed!'));
  }
});

// ========== FOOD ITEMS STORAGE ==========
const foodItemStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kerala-catering/food-items',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]
  }
});

const uploadFoodItem = multer({
  storage: foodItemStorage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = file.originalname.toLowerCase().split('.').pop();
    const mimetype = file.mimetype;
    
    if (allowedTypes.test(ext) && allowedTypes.test(mimetype)) {
      console.log(`✅ Food image accepted: ${file.originalname}`);
      return cb(null, true);
    }
    
    console.log(`❌ Rejected file: ${file.originalname}`);
    cb(new Error('Only JPG, PNG, and WEBP images are allowed!'));
  }
});

// ========== GALLERY STORAGE ==========
const galleryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kerala-catering/gallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1400, height: 1000, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]
  }
});

const uploadGallery = multer({
  storage: galleryStorage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = file.originalname.toLowerCase().split('.').pop();
    const mimetype = file.mimetype;
    
    if (allowedTypes.test(ext) && allowedTypes.test(mimetype)) {
      console.log(`✅ Gallery image accepted: ${file.originalname}`);
      return cb(null, true);
    }
    
    console.log(`❌ Rejected file: ${file.originalname}`);
    cb(new Error('Only JPG, PNG, and WEBP images are allowed!'));
  }
});

// ========== DELETE IMAGE HELPER ==========
const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) {
      console.log('⚠️ No image URL provided for deletion');
      return false;
    }

    // Check if it's a Cloudinary URL
    if (!imageUrl.includes('cloudinary.com')) {
      console.log('⚠️ Not a Cloudinary URL, skipping deletion:', imageUrl);
      return false;
    }

    // Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) {
      console.log('⚠️ Could not find "upload" in URL, skipping deletion');
      return false;
    }
    
    // Get path after 'upload/v123456/'
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    
    // Remove file extension to get public_id
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    
    console.log('🗑️ Attempting to delete from Cloudinary:', publicId);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log('✅ Image deleted from Cloudinary successfully');
      return true;
    } else if (result.result === 'not found') {
      console.log('⚠️ Image not found in Cloudinary (may have been deleted already)');
      return true;
    } else {
      console.log('⚠️ Unexpected deletion response:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error deleting image from Cloudinary:', error.message);
    return false;
  }
};

// ========== EXPORTS ==========
module.exports = {
  cloudinary,
  uploadFestival,
  uploadFestivalMenu,
  uploadFoodItem,
  uploadGallery,
  deleteImage
};

console.log('📦 Cloudinary module loaded successfully');