const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import models
const Festival = require('../models/Festival');
const FoodItem = require('../models/FoodItem');
const Gallery = require('../models/Gallery');
const Inquiry = require('../models/Inquiry');
const UserAction = require('../models/UserAction');

// Import middleware
const { verifyAdmin } = require('../middleware/authMiddleware');

// ========== SIMPLIFIED FESTIVAL UPLOAD CONFIG ==========
// We'll use a simpler approach for now

const festivalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/festivals/');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    
    // Determine if it's main or banner image
    const fieldName = file.fieldname === 'image' ? 'main' : 'banner';
    cb(null, `festival-${fieldName}-${uniqueSuffix}${ext}`);
  }
});

// IMPORTANT: Use .fields() for multiple images
const uploadFestival = multer({
  storage: festivalStorage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 2 // Max 2 files (main + banner)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      console.log(`✅ Accepted: ${file.fieldname} - ${file.originalname}`);
      return cb(null, true);
    }
    
    console.log(`❌ Rejected: ${file.fieldname} - ${file.originalname}`);
    cb(new Error('Only image files are allowed!'));
  }
});

// ========== MENU IMAGES CONFIG ==========
const menuStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/festival-menus/');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `menu-${uniqueSuffix}${ext}`);
  }
});

const uploadMenuImage = multer({
  storage: menuStorage,
  limits: { 
    fileSize: 10 * 1024 * 1024,
    files: 1 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// ========== HELPER FUNCTIONS ==========
const convertToArray = (str) => {
  if (!str) return [];
  return str.split(',').map(item => item.trim()).filter(Boolean);
};

const parseBoolean = (value) => {
  if (value === 'true' || value === true || value === '1') return true;
  if (value === 'false' || value === false || value === '0') return false;
  return Boolean(value);
};

// ========== DASHBOARD STATS ==========
router.get('/dashboard/stats', verifyAdmin, async (req, res) => {
  try {
    console.log('\n📊 === FETCHING DASHBOARD STATS ===');
    
    const [
      festivalsCount,
      foodItemsCount,
      galleryCount,
      totalInquiries,
      pendingInquiries
    ] = await Promise.all([
      Festival.countDocuments(),
      FoodItem.countDocuments(),
      Gallery.countDocuments(),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: { $in: ['new', 'pending'] } })
    ]);
    
    const stats = {
      festivals: festivalsCount,
      foodItems: foodItemsCount,
      gallery: galleryCount,
      totalInquiries: totalInquiries,
      pendingInquiries: pendingInquiries
    };
    
    console.log('✅ Stats compiled:', stats);
    
    res.json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats',
      message: error.message
    });
  }
});

// ========== GET ALL FESTIVALS (ADMIN) ==========
router.get('/festivals', verifyAdmin, async (req, res) => {
  try {
    console.log('📋 Fetching all festivals for admin');
    
    const festivals = await Festival.find().sort({ createdAt: -1 });
    
    console.log(`✅ Found ${festivals.length} festivals`);
    
    res.json({
      success: true,
      festivals: festivals
    });
  } catch (error) {
    console.error('❌ Error fetching festivals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch festivals',
      message: error.message
    });
  }
});

// ========== CREATE FESTIVAL (FIXED) ==========
router.post('/festivals', 
  verifyAdmin, 
  uploadFestival.fields([
    { name: 'image', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 }
  ]), 
  async (req, res) => {
    try {
      console.log('\n➕ === CREATING NEW FESTIVAL ===');
      console.log('Body:', req.body);
      console.log('Files:', req.files);
      
      // Validate required fields
      if (!req.body.name || !req.body.description) {
        return res.status(400).json({
          success: false,
          error: 'Name and description are required'
        });
      }
      
      // Generate slug if not provided
      const slug = req.body.slug || 
        req.body.name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
      
      // Check for existing festival
      const existingFestival = await Festival.findOne({ slug });
      if (existingFestival) {
        return res.status(400).json({
          success: false,
          error: 'Festival with this slug already exists'
        });
      }
      
      // Build festival data
      const festivalData = {
        name: req.body.name,
        slug: slug,
        description: req.body.description,
        rating: parseFloat(req.body.rating) || 4.5,
        reviewCount: parseInt(req.body.reviewCount) || 0,
        isFeatured: parseBoolean(req.body.isFeatured),
        isActive: parseBoolean(req.body.isActive !== undefined ? req.body.isActive : true)
      };
      
      // Handle main image
      if (req.files && req.files.image && req.files.image[0]) {
        festivalData.image = `/uploads/festivals/${req.files.image[0].filename}`;
        console.log('✅ Main image saved:', festivalData.image);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Main image is required'
        });
      }
      
      // Handle banner image (optional)
      if (req.files && req.files.bannerImage && req.files.bannerImage[0]) {
        festivalData.bannerImage = `/uploads/festivals/${req.files.bannerImage[0].filename}`;
        console.log('✅ Banner image saved:', festivalData.bannerImage);
      }
      
      // Handle array fields
      if (req.body.categories) {
        festivalData.categories = convertToArray(req.body.categories);
      }
      if (req.body.popularItems) {
        festivalData.popularItems = convertToArray(req.body.popularItems);
      }
      if (req.body.highlights) {
        festivalData.highlights = convertToArray(req.body.highlights);
      }
      if (req.body.tags) {
        festivalData.tags = convertToArray(req.body.tags);
      }
      
      // Handle optional fields
      if (req.body.festivalDates) festivalData.festivalDates = req.body.festivalDates;
      if (req.body.deliveryInfo) festivalData.deliveryInfo = req.body.deliveryInfo;
      if (req.body.specialNote) festivalData.specialNote = req.body.specialNote;
      if (req.body.metaTitle) festivalData.metaTitle = req.body.metaTitle;
      if (req.body.metaDescription) festivalData.metaDescription = req.body.metaDescription;
      if (req.body.seoKeywords) festivalData.seoKeywords = convertToArray(req.body.seoKeywords);
      
      console.log('📦 Festival data prepared:', festivalData);
      
      // Create and save festival
      const festival = new Festival(festivalData);
      await festival.save();
      
      console.log('✅ Festival created successfully:', festival.name);
      console.log('=====================================\n');
      
      res.status(201).json({
        success: true,
        message: 'Festival created successfully',
        festival: festival
      });
      
    } catch (error) {
      console.error('❌ Error creating festival:', error);
      console.log('=====================================\n');
      
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: 'Festival with this slug already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to create festival',
        message: error.message
      });
    }
  }
);

// ========== UPDATE FESTIVAL (FIXED) ==========
router.put('/festivals/:id', 
  verifyAdmin, 
  uploadFestival.fields([
    { name: 'image', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 }
  ]), 
  async (req, res) => {
    try {
      console.log('\n✏️ === UPDATING FESTIVAL ===');
      console.log('Festival ID:', req.params.id);
      console.log('Body:', req.body);
      console.log('Files:', req.files);
      
      const festival = await Festival.findById(req.params.id);
      
      if (!festival) {
        return res.status(404).json({
          success: false,
          error: 'Festival not found'
        });
      }
      
      // Update basic fields
      if (req.body.name) festival.name = req.body.name;
      if (req.body.slug) festival.slug = req.body.slug;
      if (req.body.description) festival.description = req.body.description;
      
      if (req.body.rating !== undefined) festival.rating = parseFloat(req.body.rating);
      if (req.body.reviewCount !== undefined) festival.reviewCount = parseInt(req.body.reviewCount);
      
      if (req.body.isFeatured !== undefined) festival.isFeatured = parseBoolean(req.body.isFeatured);
      if (req.body.isActive !== undefined) festival.isActive = parseBoolean(req.body.isActive);
      
      // Handle main image update
      if (req.files && req.files.image && req.files.image[0]) {
        // Delete old main image if exists
        if (festival.image && festival.image.startsWith('/uploads/')) {
          const oldPath = path.join(__dirname, '..', festival.image);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            console.log('🗑️ Old main image deleted');
          }
        }
        festival.image = `/uploads/festivals/${req.files.image[0].filename}`;
        console.log('✅ Main image updated:', festival.image);
      }
      
      // Handle banner image update
      if (req.files && req.files.bannerImage && req.files.bannerImage[0]) {
        // Delete old banner image if exists
        if (festival.bannerImage && festival.bannerImage.startsWith('/uploads/')) {
          const oldPath = path.join(__dirname, '..', festival.bannerImage);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            console.log('🗑️ Old banner image deleted');
          }
        }
        festival.bannerImage = `/uploads/festivals/${req.files.bannerImage[0].filename}`;
        console.log('✅ Banner image updated:', festival.bannerImage);
      } else if (req.body.bannerImage === '' || req.body.bannerImage === 'null') {
        // Remove banner image if explicitly cleared
        if (festival.bannerImage && festival.bannerImage.startsWith('/uploads/')) {
          const oldPath = path.join(__dirname, '..', festival.bannerImage);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        festival.bannerImage = null;
        console.log('🗑️ Banner image removed');
      }
      
      // Handle array fields
      if (req.body.categories !== undefined) {
        festival.categories = convertToArray(req.body.categories);
      }
      if (req.body.popularItems !== undefined) {
        festival.popularItems = convertToArray(req.body.popularItems);
      }
      if (req.body.highlights !== undefined) {
        festival.highlights = convertToArray(req.body.highlights);
      }
      if (req.body.tags !== undefined) {
        festival.tags = convertToArray(req.body.tags);
      }
      
      // Update optional fields
      const optionalFields = ['festivalDates', 'deliveryInfo', 'specialNote', 'metaTitle', 'metaDescription'];
      optionalFields.forEach(field => {
        if (req.body[field] !== undefined) {
          festival[field] = req.body[field];
        }
      });
      
      if (req.body.seoKeywords !== undefined) {
        festival.seoKeywords = convertToArray(req.body.seoKeywords);
      }
      
      console.log('📦 Updated festival data:', {
        name: festival.name,
        slug: festival.slug,
        hasBannerImage: !!festival.bannerImage,
        bannerImage: festival.bannerImage
      });
      
      await festival.save();
      
      console.log('✅ Festival updated successfully');
      console.log('=====================================\n');
      
      res.json({
        success: true,
        message: 'Festival updated successfully',
        festival: festival
      });
      
    } catch (error) {
      console.error('❌ Error updating festival:', error);
      console.log('=====================================\n');
      
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: 'Festival with this slug already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to update festival',
        message: error.message
      });
    }
  }
);

// ========== DELETE FESTIVAL ==========
router.delete('/festivals/:id', verifyAdmin, async (req, res) => {
  try {
    console.log('\n🗑️ === DELETING FESTIVAL ===');
    console.log('Festival ID:', req.params.id);
    
    const festival = await Festival.findById(req.params.id);
    
    if (!festival) {
      return res.status(404).json({
        success: false,
        error: 'Festival not found'
      });
    }
    
    // Delete associated images
    if (festival.image && festival.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', festival.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('🗑️ Main image deleted');
      }
    }
    
    if (festival.bannerImage && festival.bannerImage.startsWith('/uploads/')) {
      const bannerPath = path.join(__dirname, '..', festival.bannerImage);
      if (fs.existsSync(bannerPath)) {
        fs.unlinkSync(bannerPath);
        console.log('🗑️ Banner image deleted');
      }
    }
    
    // Delete menu images
    if (festival.menuImages && festival.menuImages.length > 0) {
      festival.menuImages.forEach(menuImage => {
        if (menuImage.imageUrl && menuImage.imageUrl.startsWith('/uploads/')) {
          const menuPath = path.join(__dirname, '..', menuImage.imageUrl);
          if (fs.existsSync(menuPath)) {
            fs.unlinkSync(menuPath);
          }
        }
      });
      console.log('🗑️ Menu images deleted');
    }
    
    await Festival.findByIdAndDelete(req.params.id);
    
    console.log('✅ Festival deleted successfully:', festival.name);
    console.log('=====================================\n');
    
    res.json({
      success: true,
      message: 'Festival deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting festival:', error);
    console.log('=====================================\n');
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete festival',
      message: error.message
    });
  }
});

// ========== GET SINGLE FESTIVAL BY ID (ADMIN) ==========
router.get('/festivals/:id', verifyAdmin, async (req, res) => {
  try {
    console.log('🔍 Fetching festival for admin:', req.params.id);
    
    const festival = await Festival.findById(req.params.id);
    
    if (!festival) {
      return res.status(404).json({
        success: false,
        error: 'Festival not found'
      });
    }
    
    res.json({
      success: true,
      festival: festival
    });
  } catch (error) {
    console.error('❌ Error fetching festival:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch festival',
      message: error.message
    });
  }
});

// ========== UPLOAD MENU IMAGE ==========
router.post('/festivals/:id/menu-images', 
  verifyAdmin, 
  uploadMenuImage.single('image'), 
  async (req, res) => {
    try {
      console.log('\n📸 === MENU IMAGE UPLOAD ===');
      console.log('Festival ID:', req.params.id);
      
      const festival = await Festival.findById(req.params.id);
      
      if (!festival) {
        return res.status(404).json({ 
          success: false, 
          error: 'Festival not found' 
        });
      }
      
      if (!festival.menuImages) {
        festival.menuImages = [];
      }
      
      // Check maximum limit
      if (festival.menuImages.length >= 2) {
        return res.status(400).json({ 
          success: false, 
          error: 'Maximum 2 menu images allowed per festival' 
        });
      }
      
      let imageUrl;
      
      if (req.file) {
        imageUrl = `/uploads/festival-menus/${req.file.filename}`;
        console.log('✅ Menu image saved:', imageUrl);
      } else {
        return res.status(400).json({ 
          success: false, 
          error: 'No image provided' 
        });
      }
      
      const menuImage = {
        imageUrl: imageUrl,
        caption: req.body.caption || '',
        order: festival.menuImages.length
      };
      
      festival.menuImages.push(menuImage);
      await festival.save();
      
      console.log('✅ Menu image added successfully');
      console.log('Total images now:', festival.menuImages.length);
      
      res.status(201).json({ 
        success: true, 
        message: 'Menu image uploaded successfully',
        menuImage: menuImage
      });
      
    } catch (error) {
      console.error('❌ Error uploading menu image:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to upload menu image',
        message: error.message 
      });
    }
  }
);

// ========== DELETE MENU IMAGE ==========
router.delete('/festivals/:festivalId/menu-images/:imageId', 
  verifyAdmin, 
  async (req, res) => {
    try {
      console.log('\n🗑️ === DELETE MENU IMAGE ===');
      
      const festival = await Festival.findById(req.params.festivalId);
      
      if (!festival || !festival.menuImages) {
        return res.status(404).json({ 
          success: false, 
          error: 'Festival or menu image not found' 
        });
      }
      
      const imageIndex = festival.menuImages.findIndex(img => 
        img._id && img._id.toString() === req.params.imageId
      );
      
      if (imageIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          error: 'Menu image not found' 
        });
      }
      
      // Get image path for deletion
      const imagePath = festival.menuImages[imageIndex].imageUrl;
      
      // Remove from array
      festival.menuImages.splice(imageIndex, 1);
      
      // Reorder remaining images
      festival.menuImages.forEach((img, index) => {
        img.order = index;
      });
      
      await festival.save();
      
      // Delete physical file
      if (imagePath && imagePath.startsWith('/uploads/')) {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log('✅ Physical file deleted');
        }
      }
      
      console.log('✅ Menu image deleted successfully');
      
      res.json({ 
        success: true, 
        message: 'Menu image deleted successfully'
      });
      
    } catch (error) {
      console.error('❌ Error deleting menu image:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete menu image',
        message: error.message 
      });
    }
  }
);

// ========== GET FESTIVAL WITH MENU ==========
router.get('/festivals/:id/menu', verifyAdmin, async (req, res) => {
  try {
    const festival = await Festival.findById(req.params.id);
    
    if (!festival) {
      return res.status(404).json({
        success: false,
        error: 'Festival not found'
      });
    }
    
    res.json({
      success: true,
      festival: festival
    });
  } catch (error) {
    console.error('❌ Error fetching festival menu:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch festival menu',
      message: error.message
    });
  }
});

module.exports = router;