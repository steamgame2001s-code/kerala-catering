// backend/routes/admin.js - COMPLETE FILE

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

// ========== FESTIVAL MULTER CONFIG ==========
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
    cb(null, `festival-${uniqueSuffix}${ext}`);
  }
});

const uploadFestival = multer({
  storage: festivalStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
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

// ========== MENU IMAGES MULTER CONFIG ==========
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
  limits: { fileSize: 5 * 1024 * 1024 },
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

// ========== DASHBOARD STATS ENDPOINT ==========
router.get('/dashboard/stats', verifyAdmin, async (req, res) => {
  try {
    console.log('\n📊 === FETCHING DASHBOARD STATS ===');
    
    // Get counts in parallel for better performance
    const [
      festivalsCount,
      foodItemsCount,
      galleryCount,
      totalInquiries,
      pendingInquiries,
      recentInquiries,
      recentActions
    ] = await Promise.all([
      // Count festivals
      Festival.countDocuments(),
      
      // Count food items
      FoodItem.countDocuments(),
      
      // Count gallery items
      Gallery.countDocuments(),
      
      // Count all inquiries
      Inquiry.countDocuments(),
      
      // Count pending inquiries
      Inquiry.countDocuments({ status: { $in: ['new', 'pending'] } }),
      
      // Get recent 10 inquiries
      Inquiry.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      
      // Get recent 10 user actions
      UserAction.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);
    
    // Count festival menu images
    const festivalsWithMenus = await Festival.find({ 
      menuImages: { $exists: true, $ne: [] } 
    });
    const festivalMenuCount = festivalsWithMenus.reduce((total, festival) => {
      return total + (festival.menuImages ? festival.menuImages.length : 0);
    }, 0);
    
    // Format recent activities from user actions
    const recentActivities = recentActions.map(action => ({
      type: action.type,
      action: `${action.type.charAt(0).toUpperCase() + action.type.slice(1)} action`,
      details: action.userInfo || action.name || action.phone || 'User interaction',
      timestamp: action.createdAt,
      page: action.page
    }));
    
    // Prepare stats object
    const stats = {
      festivals: festivalsCount,
      foodItems: foodItemsCount,
      totalMenuItems: foodItemsCount, // Alias
      gallery: galleryCount,
      festivalMenu: festivalMenuCount,
      totalInquiries: totalInquiries,
      pendingInquiries: pendingInquiries,
      totalActions: recentActions.length,
      recentActivities: recentActivities,
      recentInquiries: recentInquiries.map(inq => ({
        _id: inq._id,
        name: inq.name,
        email: inq.email,
        phone: inq.phone,
        message: inq.comments || inq.message,
        status: inq.status || 'new',
        createdAt: inq.createdAt
      }))
    };
    
    console.log('✅ Stats compiled:', {
      festivals: stats.festivals,
      foodItems: stats.foodItems,
      gallery: stats.gallery,
      festivalMenu: stats.festivalMenu,
      inquiries: stats.totalInquiries,
      activities: stats.recentActivities.length
    });
    console.log('=====================================\n');
    
    res.json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    console.log('=====================================\n');
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats',
      message: error.message
    });
  }
});

// ========== RECENT ACTIVITIES ENDPOINT ==========
router.get('/dashboard/activities', verifyAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const actions = await UserAction.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    const activities = actions.map(action => ({
      type: action.type,
      action: `${action.type.charAt(0).toUpperCase() + action.type.slice(1)} action`,
      details: action.userInfo || action.name || action.phone || 'User interaction',
      timestamp: action.createdAt,
      page: action.page
    }));
    
    res.json({
      success: true,
      activities: activities
    });
    
  } catch (error) {
    console.error('❌ Error fetching activities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activities',
      message: error.message
    });
  }
});

// ========== RECENT INQUIRIES ENDPOINT ==========
router.get('/dashboard/inquiries', verifyAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const inquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    res.json({
      success: true,
      inquiries: inquiries
    });
    
  } catch (error) {
    console.error('❌ Error fetching inquiries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inquiries',
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

// ========== GET SINGLE FESTIVAL BY ID (ADMIN) ==========
router.get('/festivals/:id', verifyAdmin, async (req, res) => {
  try {
    console.log('🔍 Fetching festival:', req.params.id);
    
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

// ========== CREATE FESTIVAL ==========
router.post('/festivals', 
  verifyAdmin, 
  uploadFestival.fields([
    { name: 'image', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 }
  ]), 
  async (req, res) => {
    try {
      console.log('➕ Creating new festival');
      console.log('Body:', req.body);
      console.log('Files:', req.files);
      
      const festivalData = {
        name: req.body.name,
        slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-'),
        description: req.body.description,
        rating: req.body.rating || 4.5,
        reviewCount: req.body.reviewCount || 0,
        isFeatured: req.body.isFeatured === 'true',
        isActive: req.body.isActive === 'true'
      };
      
      // Handle main image
      if (req.files && req.files.image && req.files.image[0]) {
        festivalData.image = `/uploads/festivals/${req.files.image[0].filename}`;
      } else if (req.body.imageUrl) {
        festivalData.image = req.body.imageUrl;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Main image is required'
        });
      }
      
      // Handle banner image
      if (req.files && req.files.bannerImage && req.files.bannerImage[0]) {
        festivalData.bannerImage = `/uploads/festivals/${req.files.bannerImage[0].filename}`;
      } else if (req.body.bannerImageUrl) {
        festivalData.bannerImage = req.body.bannerImageUrl;
      }
      
      // Handle arrays
      if (req.body.categories) {
        festivalData.categories = req.body.categories.split(',').map(c => c.trim()).filter(Boolean);
      }
      if (req.body.popularItems) {
        festivalData.popularItems = req.body.popularItems.split(',').map(p => p.trim()).filter(Boolean);
      }
      if (req.body.highlights) {
        festivalData.highlights = req.body.highlights.split(',').map(h => h.trim()).filter(Boolean);
      }
      if (req.body.tags) {
        festivalData.tags = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
      
      // Handle optional fields
      if (req.body.festivalDates) festivalData.festivalDates = req.body.festivalDates;
      if (req.body.deliveryInfo) festivalData.deliveryInfo = req.body.deliveryInfo;
      if (req.body.specialNote) festivalData.specialNote = req.body.specialNote;
      
      const festival = new Festival(festivalData);
      await festival.save();
      
      console.log('✅ Festival created:', festival.name);
      
      res.status(201).json({
        success: true,
        message: 'Festival created successfully',
        festival: festival
      });
      
    } catch (error) {
      console.error('❌ Error creating festival:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create festival',
        message: error.message
      });
    }
  }
);

// ========== UPDATE FESTIVAL ==========
router.put('/festivals/:id', 
  verifyAdmin, 
  uploadFestival.fields([
    { name: 'image', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 }
  ]), 
  async (req, res) => {
    try {
      console.log('✏️ Updating festival:', req.params.id);
      
      const festival = await Festival.findById(req.params.id);
      
      if (!festival) {
        return res.status(404).json({
          success: false,
          error: 'Festival not found'
        });
      }
      
      // Update basic fields
      festival.name = req.body.name || festival.name;
      festival.slug = req.body.slug || festival.slug;
      festival.description = req.body.description || festival.description;
      festival.rating = req.body.rating || festival.rating;
      festival.reviewCount = req.body.reviewCount || festival.reviewCount;
      festival.isFeatured = req.body.isFeatured === 'true';
      festival.isActive = req.body.isActive === 'true';
      
      // Update main image
      if (req.files && req.files.image && req.files.image[0]) {
        festival.image = `/uploads/festivals/${req.files.image[0].filename}`;
      } else if (req.body.imageUrl) {
        festival.image = req.body.imageUrl;
      }
      
      // Update banner image
      if (req.files && req.files.bannerImage && req.files.bannerImage[0]) {
        festival.bannerImage = `/uploads/festivals/${req.files.bannerImage[0].filename}`;
      } else if (req.body.bannerImageUrl) {
        festival.bannerImage = req.body.bannerImageUrl;
      }
      
      // Update arrays
      if (req.body.categories) {
        festival.categories = req.body.categories.split(',').map(c => c.trim()).filter(Boolean);
      }
      if (req.body.popularItems) {
        festival.popularItems = req.body.popularItems.split(',').map(p => p.trim()).filter(Boolean);
      }
      if (req.body.highlights) {
        festival.highlights = req.body.highlights.split(',').map(h => h.trim()).filter(Boolean);
      }
      if (req.body.tags) {
        festival.tags = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
      
      // Update optional fields
      if (req.body.festivalDates) festival.festivalDates = req.body.festivalDates;
      if (req.body.deliveryInfo) festival.deliveryInfo = req.body.deliveryInfo;
      if (req.body.specialNote) festival.specialNote = req.body.specialNote;
      
      await festival.save();
      
      console.log('✅ Festival updated:', festival.name);
      
      res.json({
        success: true,
        message: 'Festival updated successfully',
        festival: festival
      });
      
    } catch (error) {
      console.error('❌ Error updating festival:', error);
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
    console.log('🗑️ Deleting festival:', req.params.id);
    
    const festival = await Festival.findById(req.params.id);
    
    if (!festival) {
      return res.status(404).json({
        success: false,
        error: 'Festival not found'
      });
    }
    
    await Festival.findByIdAndDelete(req.params.id);
    
    console.log('✅ Festival deleted:', festival.name);
    
    res.json({
      success: true,
      message: 'Festival deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting festival:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete festival',
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
      console.log('\n📸 === MENU IMAGE UPLOAD REQUEST ===');
      console.log('Festival ID:', req.params.id);
      console.log('File received:', req.file ? 'YES' : 'NO');
      console.log('Body:', req.body);
      
      if (req.file) {
        console.log('File details:', {
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype
        });
      }
      
      const festival = await Festival.findById(req.params.id);
      
      if (!festival) {
        console.log('❌ Festival not found');
        return res.status(404).json({ 
          success: false, 
          error: 'Festival not found' 
        });
      }
      
      console.log('✅ Festival found:', festival.name);
      
      // Initialize menuImages array if doesn't exist
      if (!festival.menuImages) {
        festival.menuImages = [];
      }
      
      // Check maximum limit
      if (festival.menuImages.length >= 2) {
        console.log('❌ Maximum limit reached');
        return res.status(400).json({ 
          success: false, 
          error: 'Maximum 2 menu images allowed per festival' 
        });
      }
      
      let imageUrl;
      
      // Priority 1: Check for uploaded file
      if (req.file) {
        imageUrl = `/uploads/festival-menus/${req.file.filename}`;
        console.log('✅ Using uploaded file:', imageUrl);
      } 
      // Priority 2: Check for URL in body
      else if (req.body.imageUrl) {
        imageUrl = req.body.imageUrl;
        console.log('✅ Using provided URL:', imageUrl);
      } 
      // Error: No image provided
      else {
        console.log('❌ No image provided');
        return res.status(400).json({ 
          success: false, 
          error: 'No image provided. Please upload a file.' 
        });
      }
      
      const menuImage = {
        imageUrl: imageUrl,
        caption: req.body.caption || '',
        order: festival.menuImages.length,
        uploadedAt: new Date()
      };
      
      festival.menuImages.push(menuImage);
      await festival.save();
      
      console.log('✅ Menu image added successfully');
      console.log('Total images now:', festival.menuImages.length);
      console.log('=====================================\n');
      
      res.status(201).json({ 
        success: true, 
        message: 'Menu image uploaded successfully',
        menuImage: menuImage,
        festival: festival
      });
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      console.log('=====================================\n');
      
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
      console.log('\n🗑️ === DELETE MENU IMAGE REQUEST ===');
      console.log('Festival ID:', req.params.festivalId);
      console.log('Image ID:', req.params.imageId);
      
      const festival = await Festival.findById(req.params.festivalId);
      
      if (!festival) {
        return res.status(404).json({ 
          success: false, 
          error: 'Festival not found' 
        });
      }
      
      if (!festival.menuImages || festival.menuImages.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'No menu images found' 
        });
      }
      
      // Find image index
      const imageIndex = festival.menuImages.findIndex(img => 
        img._id && img._id.toString() === req.params.imageId
      );
      
      if (imageIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          error: 'Menu image not found' 
        });
      }
      
      // Get image path for file deletion
      const imagePath = festival.menuImages[imageIndex].imageUrl;
      
      // Remove from array
      festival.menuImages.splice(imageIndex, 1);
      
      // Reorder remaining images
      festival.menuImages.forEach((img, index) => {
        img.order = index;
      });
      
      await festival.save();
      
      // Delete physical file if it's a local upload
      if (imagePath && imagePath.startsWith('/uploads/')) {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log('✅ Physical file deleted:', fullPath);
        }
      }
      
      console.log('✅ Menu image deleted successfully');
      console.log('=====================================\n');
      
      res.json({ 
        success: true, 
        message: 'Menu image deleted successfully',
        festival: festival
      });
      
    } catch (error) {
      console.error('❌ Delete error:', error);
      console.log('=====================================\n');
      
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete menu image',
        message: error.message 
      });
    }
  }
);

// ========== GET FESTIVAL WITH MENU (ADMIN) ==========
router.get('/festivals/:id/menu', verifyAdmin, async (req, res) => {
  try {
    console.log('📋 Fetching festival with menu:', req.params.id);
    
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

module.exports = router;