// COMPLETE SECTION TO ADD/REPLACE IN backend/routes/admin.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ========== FESTIVAL MENU IMAGES MULTER CONFIG ==========
const menuStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/festival-menus/');
    
    // Create directory if it doesn't exist
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      console.log('✅ File type valid:', file.mimetype);
      return cb(null, true);
    } else {
      console.log('❌ Invalid file type:', file.mimetype);
      cb(new Error('Only image files (JPG, PNG, GIF) are allowed!'));
    }
  }
});

// ========== UPLOAD MENU IMAGE ROUTE (FILE UPLOAD) ==========
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
      // Priority 2: Check for URL in body (fallback for URL-based uploads)
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

// ========== DELETE MENU IMAGE ROUTE ==========
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