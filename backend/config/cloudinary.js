// backend/config/cloudinary.js - FINAL FIXED VERSION WITH SHARP COMPRESSION
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const sharp = require('sharp');
const { Readable } = require('stream');

// ========== CLOUDINARY CONFIGURATION ==========
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
  .catch(err => console.error('❌ Cloudinary connection error:', err.message));

// ========== HELPER: COMPRESS IMAGE BUFFER ==========
const compressImage = async (buffer, maxWidth, maxHeight, quality = 85) => {
  try {
    console.log(`🔄 Compressing image (max: ${maxWidth}x${maxHeight}, quality: ${quality}%)`);
    
    const compressed = await sharp(buffer)
      .resize(maxWidth, maxHeight, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: quality,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer();
    
    const originalSize = (buffer.length / 1024).toFixed(2);
    const compressedSize = (compressed.length / 1024).toFixed(2);
    const savings = (((buffer.length - compressed.length) / buffer.length) * 100).toFixed(1);
    
    console.log(`✅ Compressed: ${originalSize}KB → ${compressedSize}KB (saved ${savings}%)`);
    
    return compressed;
  } catch (error) {
    console.error('❌ Compression error:', error.message);
    return buffer; // Return original if compression fails
  }
};

// ========== HELPER: CONVERT BUFFER TO STREAM ==========
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// ========== FESTIVAL STORAGE ==========
const festivalStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    try {
      // Read file buffer
      const chunks = [];
      for await (const chunk of file.stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      
      // Compress image
      const compressed = await compressImage(buffer, 1200, 800, 85);
      
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      
      return {
        folder: 'kerala-catering/festivals',
        format: 'jpg',
        public_id: `festival-${timestamp}-${random}`,
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      };
    } catch (error) {
      console.error('Festival storage error:', error);
      throw error;
    }
  }
});

const uploadFestival = multer({
  storage: festivalStorage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB before compression
    files: 1 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = file.originalname.toLowerCase().split('.').pop();
    const mimetype = file.mimetype;
    
    if (allowedTypes.test(ext) && allowedTypes.test(mimetype)) {
      console.log(`✅ Festival image accepted: ${file.originalname}`);
      return cb(null, true);
    }
    
    console.log(`❌ Rejected file: ${file.originalname}`);
    cb(new Error('Only JPG, PNG, and WEBP images are allowed!'));
  }
});

// ========== FESTIVAL MENU STORAGE ==========
const festivalMenuStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    try {
      const chunks = [];
      for await (const chunk of file.stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      
      // Compress menu images (larger size for readability)
      const compressed = await compressImage(buffer, 1600, 1200, 90);
      
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      
      return {
        folder: 'kerala-catering/festival-menus',
        format: 'jpg',
        public_id: `menu-${timestamp}-${random}`,
        transformation: [
          { quality: 'auto:best' },
          { fetch_format: 'auto' }
        ]
      };
    } catch (error) {
      console.error('Menu storage error:', error);
      throw error;
    }
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
  params: async (req, file) => {
    try {
      const chunks = [];
      for await (const chunk of file.stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      
      // Compress food images (square format)
      const compressed = await compressImage(buffer, 800, 800, 85);
      
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      
      return {
        folder: 'kerala-catering/food-items',
        format: 'jpg',
        public_id: `food-${timestamp}-${random}`,
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      };
    } catch (error) {
      console.error('Food storage error:', error);
      throw error;
    }
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
  params: async (req, file) => {
    try {
      const chunks = [];
      for await (const chunk of file.stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      
      // Compress gallery images
      const compressed = await compressImage(buffer, 1400, 1000, 88);
      
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      
      return {
        folder: 'kerala-catering/gallery',
        format: 'jpg',
        public_id: `gallery-${timestamp}-${random}`,
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      };
    } catch (error) {
      console.error('Gallery storage error:', error);
      throw error;
    }
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
    // Example: https://res.cloudinary.com/dlgrdnghb/image/upload/v1234567890/kerala-catering/festivals/festival-123.jpg
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
      return true; // Consider this a success since image doesn't exist
    } else {
      console.log('⚠️ Unexpected deletion response:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error deleting image from Cloudinary:', error.message);
    return false;
  }
};

// ========== BULK DELETE HELPER ==========
const deleteMultipleImages = async (imageUrls) => {
  console.log(`🗑️ Bulk delete: ${imageUrls.length} images`);
  
  const results = await Promise.allSettled(
    imageUrls.map(url => deleteImage(url))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
  const failed = results.length - successful;
  
  console.log(`✅ Bulk delete complete: ${successful} deleted, ${failed} failed`);
  
  return { successful, failed };
};

// ========== EXPORTS ==========
module.exports = {
  cloudinary,
  uploadFestival,
  uploadFestivalMenu,
  uploadFoodItem,
  uploadGallery,
  deleteImage,
  deleteMultipleImages,
  compressImage
};

console.log('📦 Cloudinary module loaded with Sharp compression enabled');