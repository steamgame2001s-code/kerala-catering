// backend/config/cloudinary.js - FIXED VERSION
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary - FIXED: Use your actual cloud name as fallback
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlgrdnghb',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️ Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlgrdnghb',
  api_key: process.env.CLOUDINARY_API_KEY ? '✓ Set' : '❌ Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '❌ Missing'
});

// Test connection
cloudinary.api.ping()
  .then(() => console.log('✅ Cloudinary connected successfully'))
  .catch(err => console.error('❌ Cloudinary connection error:', err));

// ========== FESTIVAL STORAGE ==========
const festivalStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kerala-catering/festivals',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 500, crop: 'limit', quality: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      return `festival-${timestamp}-${random}`;
    }
  }
});

const uploadFestival = multer({
  storage: festivalStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPG, PNG, GIF, WEBP) are allowed!'));
  }
});

// ========== FESTIVAL MENU STORAGE ==========
const festivalMenuStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kerala-catering/festival-menus',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      return `menu-${timestamp}-${random}`;
    }
  }
});

const uploadFestivalMenu = multer({
  storage: festivalMenuStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// ========== FOOD ITEMS STORAGE ==========
const foodItemStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kerala-catering/food-items',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 600, height: 600, crop: 'limit', quality: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      return `food-${timestamp}-${random}`;
    }
  }
});

const uploadFoodItem = multer({
  storage: foodItemStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// ========== GALLERY STORAGE ==========
const galleryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kerala-catering/gallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1000, height: 800, crop: 'limit', quality: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      return `gallery-${timestamp}-${random}`;
    }
  }
});

const uploadGallery = multer({
  storage: galleryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// ========== DELETE IMAGE HELPER ==========
const deleteImage = async (imageUrl) => {
  try {
    // Extract public_id from Cloudinary URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234/kerala-catering/festivals/festival-123.jpg
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) {
      console.log('⚠️ Not a Cloudinary URL, skipping deletion');
      return false;
    }
    
    // Get everything after 'upload/v123456/'
    const publicIdWithFolder = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithFolder.replace(/\.[^/.]+$/, ''); // Remove extension
    
    console.log('🗑️ Deleting from Cloudinary:', publicId);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log('✅ Image deleted from Cloudinary');
      return true;
    } else {
      console.log('⚠️ Image deletion response:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error deleting image from Cloudinary:', error);
    return false;
  }
};

module.exports = {
  cloudinary,
  uploadFestival,
  uploadFestivalMenu,
  uploadFoodItem,
  uploadGallery,
  deleteImage
};