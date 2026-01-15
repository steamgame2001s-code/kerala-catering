const express = require('express');
const router = express.Router();
const UserAction = require('../models/UserAction');

// Log a user action (WhatsApp, Call, Form)
router.post('/log', async (req, res) => {
  try {
    const { type, name, phone, email, message, page, userInfo } = req.body;

    // Validate action type
    if (!['whatsapp', 'call', 'form'].includes(type)) {
      return res.status(400).json({ message: 'Invalid action type' });
    }

    // Get IP address
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Create action log
    const action = new UserAction({
      type,
      name: name || '',
      phone: phone || '',
      email: email || '',
      message: message || '',
      page: page || '',
      ipAddress,
      userInfo: userInfo || name || phone || email || 'Anonymous'
    });

    await action.save();

    res.status(201).json({ 
      success: true,
      message: 'Action logged successfully',
      actionId: action._id 
    });
  } catch (error) {
    console.error('Error logging action:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get recent actions (for admin dashboard)
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const actions = await UserAction.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      actions
    });
  } catch (error) {
    console.error('Error fetching actions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get action statistics
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalActions, todayActions, actionsByType] = await Promise.all([
      UserAction.countDocuments(),
      UserAction.countDocuments({ createdAt: { $gte: today } }),
      UserAction.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const stats = {
      total: totalActions,
      today: todayActions,
      byType: actionsByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching action stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;