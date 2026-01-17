// backend/routes/festivals.js - CREATE THIS NEW FILE
// This handles PUBLIC festival routes (no authentication required)

const express = require('express');
const router = express.Router();
const Festival = require('../models/Festival');

// ========== GET ALL ACTIVE FESTIVALS (PUBLIC) ==========
router.get('/festivals', async (req, res) => {
  try {
    console.log('📋 Fetching active festivals (public)');
    
    const festivals = await Festival.find({ 
      isActive: true 
    }).sort({ isFeatured: -1, createdAt: -1 });
    
    console.log(`✅ Found ${festivals.length} active festivals`);
    
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

// ========== GET FESTIVAL BY SLUG (PUBLIC) ==========
router.get('/festival/:slug', async (req, res) => {
  try {
    console.log('🔍 Fetching festival by slug:', req.params.slug);
    
    const festival = await Festival.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });
    
    if (!festival) {
      console.log('❌ Festival not found with slug:', req.params.slug);
      return res.status(404).json({
        success: false,
        error: 'Festival not found'
      });
    }
    
    console.log('✅ Festival found:', festival.name);
    console.log('📸 Menu images:', festival.menuImages?.length || 0);
    
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

// ========== GET FEATURED FESTIVALS (PUBLIC) ==========
router.get('/festivals/featured', async (req, res) => {
  try {
    console.log('⭐ Fetching featured festivals');
    
    const festivals = await Festival.find({ 
      isActive: true,
      isFeatured: true 
    }).limit(6);
    
    console.log(`✅ Found ${festivals.length} featured festivals`);
    
    res.json({
      success: true,
      festivals: festivals
    });
  } catch (error) {
    console.error('❌ Error fetching featured festivals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured festivals',
      message: error.message
    });
  }
});

module.exports = router;