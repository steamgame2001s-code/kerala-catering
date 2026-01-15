// backend/routes/inquiryRoutes.js
const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');

// Save inquiry to database
router.post('/save-inquiry', async (req, res) => {
  try {
    const { name, phone, location, email, event, menu, comments } = req.body;
    
    const inquiryId = `UP${Date.now().toString().slice(-8)}`;
    
    const inquiry = new Inquiry({
      name,
      phone,
      location,
      email: email || undefined,
      event: event || undefined,
      menu: menu || undefined,
      comments: comments || undefined,
      inquiryId,
      status: 'new',
      whatsappSent: true, // We'll send WhatsApp from frontend
      emailSent: false, // Email will be sent separately
      createdAt: new Date()
    });
    
    await inquiry.save();
    
    console.log(`✅ Inquiry saved: ${inquiryId} - ${name}`);
    
    res.status(201).json({ 
      success: true, 
      message: 'Inquiry saved successfully',
      inquiryId: inquiryId,
      data: {
        name,
        phone,
        location,
        inquiryId
      }
    });
    
  } catch (error) {
    console.error('Error saving inquiry:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save inquiry',
      error: error.message 
    });
  }
});

// Get all inquiries (for admin panel later)
router.get('/inquiries', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      count: inquiries.length,
      inquiries 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch inquiries' 
    });
  }
});

module.exports = router;