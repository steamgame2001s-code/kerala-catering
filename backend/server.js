// backend/server.js - FINAL VERSION WITH CLOUDINARY INTEGRATION
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');

// Import Cloudinary configuration from config file
const { 
  cloudinary,
  uploadFestival, 
  uploadFestivalMenu, 
  uploadFoodItem, 
  uploadGallery,
  deleteImage 
} = require('./config/cloudinary');

dotenv.config();

// Initialize SendGrid if API key exists
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid configured');
} else {
  console.log('⚠️ SendGrid not configured');
}

// Import models
const Admin = require('./models/Admin');
const Festival = require('./models/Festival');
const FoodItem = require('./models/FoodItem');
const Gallery = require('./models/Gallery');
const User = require('./models/User');
const Inquiry = require('./models/Inquiry');
const UserAction = require('./models/UserAction');

const app = express();

// ========== MIDDLEWARE ==========
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:10000',
  'https://kerala-catering.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    console.log('🌍 Request from origin:', origin);
    
    if (!origin) {
      console.log('✅ No origin (allowed)');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Origin in whitelist');
      return callback(null, true);
    }
    
    if (origin.endsWith('.vercel.app')) {
      console.log('✅ Vercel deployment domain (allowed)');
      return callback(null, true);
    }
    
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      console.log('✅ Localhost (allowed)');
      return callback(null, true);
    }
    
    console.log('❌ CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
}));

console.log('\n🔒 CORS Configuration:');
console.log('Allowed origins:', allowedOrigins);
console.log('+ All *.vercel.app domains');
console.log('+ All localhost ports');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =================== MONGODB CONNECTION ===================
console.log('🔄 Connecting to MongoDB Atlas...');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kerala-catering', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 10000,
})
.then(() => {
    console.log('✅ MongoDB Atlas Connected Successfully!');
    
    setTimeout(() => {
        console.log(`📊 Database: ${mongoose.connection.name || 'kerala-catering'}`);
        console.log(`📍 Host: ${mongoose.connection.host}`);
        
        Festival.countDocuments()
            .then(count => console.log(`🎉 Total festivals in database: ${count}`))
            .catch(err => console.error('❌ Count query failed:', err));
    }, 1000);
})
.catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check MONGODB_URI in .env file');
    console.log('2. Whitelist IP in MongoDB Atlas');
    console.log('3. Check username/password in connection string');
});

// =================== AUTHENTICATION MIDDLEWARE ===================
const authenticateAdmin = (req, res, next) => {
    try {
        let token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token && req.query.token) {
            token = req.query.token;
        }
        
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }
        
        if (!token) {
            console.log('⚠️ No token provided for admin route:', req.path);
            return res.status(401).json({ 
                success: false, 
                error: 'Access denied. No token provided.',
                message: 'Please login first'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
            return res.status(403).json({ 
                success: false, 
                error: 'Access denied. Admin only.' 
            });
        }

        req.adminId = decoded.id;
        req.adminEmail = decoded.email;
        req.adminRole = decoded.role;
        
        console.log(`✅ Admin authenticated: ${decoded.email} (${decoded.role})`);
        next();
    } catch (error) {
        console.error('❌ Auth error:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid token',
                message: 'Please login again'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                error: 'Token expired',
                message: 'Please login again'
            });
        }
        
        res.status(500).json({ 
            success: false, 
            error: 'Authentication failed' 
        });
    }
};

// =================== DEBUG MIDDLEWARE ===================
const debugFormData = (req, res, next) => {
  console.log('\n🔍 === INCOMING REQUEST DEBUG ===');
  console.log('📍 URL:', req.originalUrl);
  console.log('📋 Method:', req.method);
  console.log('📦 Content-Type:', req.headers['content-type']);
  console.log('📄 req.body:', JSON.stringify(req.body, null, 2));
  console.log('📎 req.files:', req.files);
  console.log('📎 req.file:', req.file);
  console.log('================================\n');
  next();
};

// =================== TEST ENDPOINTS ===================
app.get('/api/ping', (req, res) => {
    res.json({
        success: true,
        message: 'pong',
        timestamp: new Date().toISOString(),
        server: 'Kerala Catering Backend',
        version: '1.0.0'
    });
});

app.get('/api/health', async (req, res) => {
  try {
    const festivalCount = await Festival.countDocuments();
    const foodCount = await FoodItem.countDocuments();
    
    res.json({
      status: 'healthy',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      counts: {
        festivals: festivalCount,
        foodItems: foodCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
});

app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    origin: req.headers.origin,
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString()
  });
});

// =================== CLOUDINARY TEST ENDPOINT ===================
app.get('/api/test-cloudinary', async (req, res) => {
  try {
    const pingResult = await cloudinary.api.ping();
    
    // Get Cloudinary account info
    const cloudinaryConfig = cloudinary.config();
    
    res.json({
      success: true,
      message: 'Cloudinary connection successful',
      cloudinary: {
        cloud_name: cloudinaryConfig.cloud_name,
        api_key: cloudinaryConfig.api_key ? '✓ Configured' : '❌ Missing',
        api_secret: cloudinaryConfig.api_secret ? '✓ Configured' : '❌ Missing',
        ping: pingResult
      },
      note: 'Cloudinary images will be stored in: kerala-catering/ folder'
    });
  } catch (error) {
    console.error('❌ Cloudinary test error:', error);
    res.status(500).json({
      success: false,
      message: 'Cloudinary connection failed',
      error: error.message
    });
  }
});

// =================== EMAIL TEST ENDPOINT ===================
app.get('/api/email/test', async (req, res) => {
  try {
    console.log('📧 Testing email configuration...');
    
    const hasSendGrid = !!process.env.SENDGRID_API_KEY;
    
    if (!hasSendGrid) {
      return res.status(200).json({
        success: true,
        message: 'Email service is not configured - using WhatsApp mode',
        provider: 'WhatsApp Only',
        note: 'System is running in WhatsApp-only mode. Inquiries will be logged to database.'
      });
    }
    
    const toEmail = process.env.BUSINESS_EMAIL || 'upasanacatering@gmail.com';
    
    const msg = {
      to: toEmail,
      from: {
        email: 'upasanawebemail@gmail.com',
        name: 'Upasana Catering Test'
      },
      subject: '✅ Test Email - Upasana Catering',
      text: `This is a test email sent from your catering website backend.\n\nProvider: SendGrid\nTO: ${toEmail}\nTime: ${new Date().toLocaleString()}`,
      html: `
        <h1>✅ Test Email Successful!</h1>
        <p>Your catering website email system is working correctly via SendGrid.</p>
        <p><strong>Provider:</strong> SendGrid</p>
        <p><strong>TO:</strong> ${toEmail}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `
    };

    const response = await sgMail.send(msg);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Test email sent successfully via SendGrid',
      to: toEmail,
      provider: 'SendGrid',
      status: response[0].statusCode,
      messageId: response[0].headers['x-message-id']
    });
    
  } catch (error) {
    console.error('❌ Email test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to test email configuration',
      error: error.message
    });
  }
});

// =================== SEND INQUIRY ENDPOINT ===================
app.post('/api/email/send-inquiry', async (req, res) => {
  try {
    console.log('📧 Received inquiry request:', req.body);
    
    const { 
      name, 
      phone, 
      location, 
      email, 
      event, 
      menu, 
      comments
    } = req.body;
    
    if (!name || !phone || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const inquiryId = `UP${Date.now().toString().slice(-8)}`;
    
    let emailSent = false;
    let emailProvider = 'None';
    
    // Try SendGrid
    if (process.env.SENDGRID_API_KEY) {
      try {
        const toEmail = process.env.BUSINESS_EMAIL || 'upasanacatering@gmail.com';
        
        const htmlTemplate = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .section { margin-bottom: 20px; }
              .section-title { color: #f97316; font-weight: bold; font-size: 18px; margin-bottom: 10px; }
              .field { margin-bottom: 8px; }
              .field-label { font-weight: bold; color: #4b5563; }
              .field-value { color: #1f2937; }
              .priority { background: #dc2626; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; margin-left: 10px; }
              .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌟 New Menu Inquiry 🌟</h1>
                <h2>Upasana Catering Services</h2>
              </div>
              
              <div class="content">
                <div class="section">
                  <div class="section-title">
                    👤 Customer Information <span class="priority">NEW INQUIRY</span>
                  </div>
                  <div class="field"><span class="field-label">Name:</span> <span class="field-value">${name}</span></div>
                  <div class="field"><span class="field-label">Phone:</span> <span class="field-value">${phone}</span></div>
                  <div class="field"><span class="field-label">Location:</span> <span class="field-value">${location}</span></div>
                  <div class="field"><span class="field-label">Email:</span> <span class="field-value">${email || 'Not provided'}</span></div>
                </div>
                
                <div class="section">
                  <div class="section-title">📅 Event Details</div>
                  <div class="field"><span class="field-label">Event Type:</span> <span class="field-value">${event || 'Not specified'}</span></div>
                  <div class="field"><span class="field-label">Preferred Menu:</span> <span class="field-value">${menu || 'Not selected'}</span></div>
                </div>
                
                ${comments ? `
                <div class="section">
                  <div class="section-title">💬 Special Requests</div>
                  <div style="background: #fff7ed; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;">
                    ${comments.replace(/\n/g, '<br>')}
                  </div>
                </div>
                ` : ''}
                
                <div class="section">
                  <div class="section-title">📊 Inquiry Summary</div>
                  <div class="field"><span class="field-label">Inquiry ID:</span> <span class="field-value">${inquiryId}</span></div>
                  <div class="field"><span class="field-label">Date:</span> <span class="field-value">${new Date().toLocaleDateString('en-IN')}</span></div>
                  <div class="field"><span class="field-label">Time:</span> <span class="field-value">${new Date().toLocaleTimeString('en-IN')}</span></div>
                  <div class="field"><span class="field-label">Source:</span> <span class="field-value">Website Menu Page</span></div>
                </div>
                
                <div class="footer">
                  <p><strong>Action Required:</strong> Please contact customer within 24 hours</p>
                  <p><em>WhatsApp: ${phone} | Email: ${email || 'Not provided'}</em></p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        const textTemplate = `
          NEW MENU INQUIRY - UPASANA CATERING
          ====================================
          
          Customer Information:
          --------------------
          Name: ${name}
          Phone: ${phone}
          Location: ${location}
          Email: ${email || 'Not provided'}
          
          Event Details:
          --------------
          Event Type: ${event || 'Not specified'}
          Preferred Menu: ${menu || 'Not selected'}
          
          ${comments ? `Special Requests:\n${comments}\n\n` : ''}
          
          Inquiry Summary:
          ---------------
          Inquiry ID: ${inquiryId}
          Date: ${new Date().toLocaleDateString('en-IN')}
          Time: ${new Date().toLocaleTimeString('en-IN')}
          Source: Website Menu Page
          
          ====================================
          ACTION REQUIRED: Contact within 24 hours
          WhatsApp: ${phone}
          ${email ? `Email: ${email}` : ''}
        `;

        const msg = {
          to: toEmail,
          from: {
            email: 'upasanawebemail@gmail.com',
            name: 'Upasana Catering Website'
          },
          replyTo: email || 'upasanacatering@gmail.com',
          subject: `🍽️ New Menu Inquiry - ${name} - ${inquiryId}`,
          html: htmlTemplate,
          text: textTemplate
        };

        await sgMail.send(msg);
        
        emailSent = true;
        emailProvider = 'SendGrid';
        console.log(`✅ Inquiry sent via SendGrid: ${inquiryId}`);
        
      } catch (sendGridError) {
        console.log('SendGrid failed:', sendGridError.message);
      }
    }
    
    // Save to database regardless of email success
    try {
      const inquiry = new Inquiry({
        inquiryId,
        name,
        phone,
        location,
        email,
        event,
        menu,
        comments,
        status: 'new',
        emailProvider: emailSent ? emailProvider : 'Failed'
      });
      await inquiry.save();
      console.log(`💾 Inquiry saved to database: ${inquiryId}`);
      
      // Log user action
      try {
        const action = new UserAction({
          type: 'inquiry',
          name: name,
          phone: phone,
          email: email || '',
          message: comments || '',
          page: req.headers.referer || 'Menu Page',
          festival: menu || '',
          priority: 'high',
          status: 'new',
          userInfo: `${name} (${phone})`,
          emailProvider: emailSent ? emailProvider : 'Failed'
        });
        await action.save();
        console.log(`📊 Action logged: ${action._id}`);
      } catch (actionError) {
        console.error('Action log error:', actionError.message);
      }
      
    } catch (dbError) {
      console.error('Database save error:', dbError.message);
    }
    
    // Return WhatsApp URL for frontend
    const whatsappMessage = `Hello! I'm ${name}. I'm interested in your catering services for ${event || 'an event'} at ${location}. Preferred menu: ${menu || 'Not specified'}. ${comments ? `Special requests: ${comments}` : ''}`;
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/919447975836?text=${encodedMessage}`;
    
    // Return success response
    res.status(200).json({ 
      success: true, 
      message: emailSent ? 'Inquiry sent successfully' : 'Inquiry logged to database',
      inquiryId: inquiryId,
      provider: emailSent ? emailProvider : 'WhatsApp Only',
      whatsappUrl: whatsappUrl,
      data: {
        name,
        phone,
        location,
        email: email || null,
        event: event || null,
        menu: menu || null,
        inquiryId
      }
    });
    
  } catch (error) {
    console.error('❌ Inquiry processing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process inquiry',
      error: error.message 
    });
  }
});

// =================== USER ACTION TRACKING ROUTES ===================
app.post('/api/actions/log', async (req, res) => {
  try {
    const { type, name, phone, email, message, page, userInfo } = req.body;

    console.log('📊 [ACTION] Logging user action:', { type, name, phone });

    // Validate action type
    if (!['whatsapp', 'call', 'form'].includes(type)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid action type' 
      });
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

    console.log('✅ [ACTION] Action logged successfully:', action._id);

    res.status(201).json({ 
      success: true,
      message: 'Action logged successfully',
      actionId: action._id 
    });
  } catch (error) {
    console.error('❌ [ACTION] Error logging action:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

app.get('/api/actions/recent', async (req, res) => {
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
    console.error('❌ [ACTION] Error fetching actions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

app.get('/api/actions/stats', async (req, res) => {
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
    console.error('❌ [ACTION] Error fetching action stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// =================== FORGOT PASSWORD ENDPOINTS ===================
// (Keep all your existing forgot password, verify OTP, reset password endpoints here)
// They should remain unchanged as they don't involve file uploads

// =================== PUBLIC ROUTES ===================
app.get('/api/festivals', async (req, res) => {
  try {
    console.log(`🌐 GET /api/festivals from origin: ${req.headers.origin}`);
    const festivals = await Festival.find({ isActive: true }).sort({ isFeatured: -1, createdAt: -1 });
    
    res.json({
      success: true,
      festivals,
      count: festivals.length
    });
  } catch (error) {
    console.error('Get festivals error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/api/festival/:slug', async (req, res) => {
  try {
    const festival = await Festival.findOne({
      slug: req.params.slug,
      isActive: true
    });

    if (!festival) {
      return res.status(404).json({ success: false, error: 'Festival not found' });
    }

    const foodItems = await FoodItem.find({ 
      festival: festival.slug,
      isActive: true 
    }).sort({ isBestSeller: -1, createdAt: -1 });

    res.json({ 
      success: true, 
      festival, 
      foodItems: foodItems || [] 
    });
  } catch (error) {
    console.error('Get festival error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/api/food', async (req, res) => {
  try {
    const { festival } = req.query;
    let query = { isActive: true };

    if (festival) {
      query.festival = festival;
    }

    const foodItems = await FoodItem.find(query).sort({ isBestSeller: -1, createdAt: -1 });
    res.json({ 
      success: true, 
      foodItems,
      count: foodItems.length 
    });
  } catch (error) {
    console.error('Get food items error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/api/food/festival/:slug', async (req, res) => {
  try {
    const foodItems = await FoodItem.find({
      festival: req.params.slug,
      isActive: true
    }).sort({ isBestSeller: -1, createdAt: -1 });

    res.json({ 
      success: true, 
      foodItems,
      count: foodItems.length 
    });
  } catch (error) {
    console.error('Get festival food items error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      phone,
      role: 'user'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/api/gallery', async (req, res) => {
  try {
    const gallery = await Gallery.find({ isActive: true })
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .populate('festival', 'name slug');
    
    res.json({ 
      success: true, 
      gallery,
      count: gallery.length 
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/api/gallery/category/:category', async (req, res) => {
  try {
    const gallery = await Gallery.find({
      category: req.params.category,
      isActive: true
    }).sort({ featured: -1, order: 1, createdAt: -1 });
    
    res.json({ 
      success: true, 
      gallery,
      count: gallery.length 
    });
  } catch (error) {
    console.error('Get gallery by category error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// =================== ADMIN ROUTES ===================
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`🔐 Admin login attempt: ${email} from origin: ${req.headers.origin}`);
    
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log('❌ Admin not found:', email);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    if (!admin.isActive) {
      return res.status(403).json({ 
        success: false, 
        error: 'Account deactivated' 
      });
    }
    
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    admin.lastLogin = new Date();
    await admin.save();
    
    const token = jwt.sign(
      { 
        id: admin._id, 
        email: admin.email, 
        role: admin.role,
        name: admin.name,
        username: admin.username
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log(`✅ Admin login successful: ${admin.email} (${admin.role})`);
    
    res.json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      token,
      expiresIn: '24h'
    });
    
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
});

// Get all inquiries
app.get('/api/admin/inquiries', authenticateAdmin, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      count: inquiries.length,
      inquiries 
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch inquiries' 
    });
  }
});

// =================== ADMIN DASHBOARD & PROFILE ROUTES ===================
app.get('/api/admin/dashboard/stats', authenticateAdmin, async (req, res) => {
  try {
    console.log('📊 [DASHBOARD] Fetching dashboard stats...');

    const [
      festivalsCount,
      foodItemsCount,
      galleryCount,
      usersCount,
      inquiriesCount,
      totalActions,
      pendingInquiries,
      recentFestivals,
      recentFoodItems,
      recentInquiries,
      recentActions
    ] = await Promise.all([
      Festival.countDocuments(),
      FoodItem.countDocuments(),
      Gallery.countDocuments(),
      User.countDocuments(),
      Inquiry.countDocuments(),
      UserAction.countDocuments(),
      Inquiry.countDocuments({ status: { $ne: 'responded' } }),
      Festival.find().sort({ createdAt: -1 }).limit(3),
      FoodItem.find().sort({ createdAt: -1 }).limit(3),
      Inquiry.find().sort({ createdAt: -1 }).limit(8).lean(),
      UserAction.find().sort({ createdAt: -1 }).limit(8).lean()
    ]);

    const recentActivities = [
      ...recentFestivals.map(f => ({
        type: 'festival',
        action: `Added festival: ${f.name}`,
        time: f.createdAt
      })),
      ...recentFoodItems.map(f => ({
        type: 'menu',
        action: `Added menu item: ${f.name}`,
        time: f.createdAt
      })),
      ...recentInquiries.map(i => ({
        type: 'inquiry',
        action: `New inquiry from: ${i.name}`,
        time: i.createdAt
      })),
      ...recentActions.map(a => ({
        type: a.type,
        action: `${a.type === 'whatsapp' ? 'WhatsApp' : a.type === 'call' ? 'Call' : 'Form'} - ${a.userInfo || 'Anonymous'}`,
        time: a.createdAt
      }))
    ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 10)
    .map(activity => ({
      ...activity,
      time: new Date(activity.time).toLocaleString()
    }));

    console.log(`✅ [DASHBOARD] Stats compiled:
      - Festivals: ${festivalsCount}
      - Food Items: ${foodItemsCount}
      - Gallery: ${galleryCount}
      - Users: ${usersCount}
      - Total Inquiries: ${inquiriesCount}
      - Pending Inquiries: ${pendingInquiries}
      - Total Actions: ${totalActions}
      - Recent Activities: ${recentActivities.length}
    `);

    res.json({
      success: true,
      stats: {
        festivals: festivalsCount,
        foodItems: foodItemsCount,
        gallery: galleryCount,
        totalUsers: usersCount,
        totalInquiries: inquiriesCount,
        totalActions: totalActions,
        pendingInquiries: pendingInquiries,
        totalMenuItems: foodItemsCount,
        recentActivities: recentActivities,
        recentInquiries: recentInquiries,
        recentActions: recentActions
      }
    });

  } catch (error) {
    console.error('❌ [DASHBOARD] Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
});

app.get('/api/admin/profile', authenticateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select('-password');
    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }
    res.json({ success: true, admin });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// =================== FESTIVAL MENU IMAGES ROUTES ===================
app.get('/api/admin/festivals-menu-management', authenticateAdmin, async (req, res) => {
  try {
    const festivals = await Festival.find()
      .select('_id name slug image menuImages isActive')
      .sort({ name: 1 });
    res.json({ success: true, festivals, count: festivals.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/festivals/menu-management', authenticateAdmin, async (req, res) => {
  try {
    console.log('📋 [MENU-MGMT] Fetching festivals for menu management page');
    console.log(`🔑 Admin: ${req.adminEmail}`);
    
    const festivals = await Festival.find()
      .select('_id name slug image bannerImage menuImages isFeatured isActive description')
      .sort({ name: 1 });
    
    console.log(`✅ Found ${festivals.length} festivals`);
    
    res.json({
      success: true,
      festivals: festivals,
      count: festivals.length,
      message: `Found ${festivals.length} festivals`
    });
  } catch (error) {
    console.error('❌ [MENU-MGMT] Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load festivals',
      message: error.message,
      festivals: []
    });
  }
});

// UPLOAD menu image for festival (to Cloudinary)
app.post('/api/admin/festivals/:festivalId/menu-images',
  authenticateAdmin,
  uploadFestivalMenu.single('image'),
  async (req, res) => {
    try {
      console.log('📸 Uploading menu image for festival:', req.params.festivalId);
      
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No image file provided' });
      }
      
      const festival = await Festival.findById(req.params.festivalId);
      if (!festival) {
        return res.status(404).json({ success: false, error: 'Festival not found' });
      }
      
      // Check limit
      if (festival.menuImages && festival.menuImages.length >= 2) {
        return res.status(400).json({ 
          success: false, 
          error: 'Maximum 2 menu images allowed per festival' 
        });
      }
      
      const menuImage = {
        imageUrl: req.file.path, // Cloudinary URL
        cloudinaryPublicId: req.file.filename, // Cloudinary public ID
        caption: req.body.caption || '',
        order: festival.menuImages ? festival.menuImages.length : 0
      };
      
      festival.menuImages.push(menuImage);
      await festival.save();
      
      console.log('✅ Menu image uploaded to Cloudinary:', req.file.path);
      res.json({ success: true, festival, menuImage });
    } catch (error) {
      console.error('❌ Upload error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// DELETE menu image (from Cloudinary)
app.delete('/api/admin/festivals/:festivalId/menu-images/:imageId',
  authenticateAdmin,
  async (req, res) => {
    try {
      const festival = await Festival.findById(req.params.festivalId);
      if (!festival) {
        return res.status(404).json({ success: false, error: 'Festival not found' });
      }
      
      const imageIndex = festival.menuImages.findIndex(
        img => img._id.toString() === req.params.imageId
      );
      
      if (imageIndex === -1) {
        return res.status(404).json({ success: false, error: 'Image not found' });
      }
      
      const imageToDelete = festival.menuImages[imageIndex];
      
      // Delete from Cloudinary if public ID exists
      if (imageToDelete.imageUrl) {
        await deleteImage(imageToDelete.imageUrl);
        console.log('✅ Image deleted from Cloudinary');
      }
      
      festival.menuImages.splice(imageIndex, 1);
      await festival.save();
      
      res.json({ success: true, message: 'Menu image deleted', festival });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// =================== FESTIVAL ROUTES (WITH CLOUDINARY) ===================
app.get('/api/admin/festivals', authenticateAdmin, async (req, res) => {
  try {
    console.log('📋 Fetching admin festivals...');
    const festivals = await Festival.find().sort({ createdAt: -1 });
    
    console.log(`✅ Found ${festivals.length} festivals`);
    res.json({ 
      success: true, 
      festivals,
      count: festivals.length 
    });
  } catch (error) {
    console.error('❌ Get admin festivals error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      details: error.message 
    });
  }
});

// CREATE festival with image upload (to Cloudinary)
app.post('/api/admin/festivals', 
  authenticateAdmin, 
  uploadFestival.fields([
    { name: 'image', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 }
  ]),
  debugFormData,
  async (req, res) => {
    try {
      console.log('📝 Creating festival with Cloudinary upload');
      
      const festivalData = {
        name: req.body.name,
        slug: req.body.slug || '',
        description: req.body.description || '',
        rating: req.body.rating ? parseFloat(req.body.rating) : undefined,
        reviewCount: req.body.reviewCount ? parseInt(req.body.reviewCount) : undefined,
        festivalDates: req.body.festivalDates || '',
        deliveryInfo: req.body.deliveryInfo || '',
        specialNote: req.body.specialNote || '',
        isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
        isActive: req.body.isActive === 'true' || req.body.isActive === true || req.body.isActive !== 'false'
      };
      
      // Handle image upload to Cloudinary
      if (req.files?.image) {
        festivalData.image = req.files.image[0].path; // Cloudinary URL
        festivalData.cloudinaryImageId = req.files.image[0].filename; // Cloudinary public ID
        console.log('✅ Main image uploaded to Cloudinary:', festivalData.image);
      }
      
      // Handle banner image upload to Cloudinary
      if (req.files?.bannerImage) {
        festivalData.bannerImage = req.files.bannerImage[0].path;
        festivalData.cloudinaryBannerId = req.files.bannerImage[0].filename;
        console.log('✅ Banner image uploaded to Cloudinary:', festivalData.bannerImage);
      }
      
      // Auto-generate slug if not provided
      if (!festivalData.slug && festivalData.name) {
        festivalData.slug = festivalData.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
      }
      
      // Parse array fields if they're strings
      if (req.body.categories) {
        festivalData.categories = typeof req.body.categories === 'string' 
          ? req.body.categories.split(',').map(c => c.trim()).filter(Boolean)
          : req.body.categories;
      }
      
      if (req.body.popularItems) {
        festivalData.popularItems = typeof req.body.popularItems === 'string'
          ? req.body.popularItems.split(',').map(p => p.trim()).filter(Boolean)
          : req.body.popularItems;
      }
      
      if (req.body.highlights) {
        festivalData.highlights = typeof req.body.highlights === 'string'
          ? req.body.highlights.split(',').map(h => h.trim()).filter(Boolean)
          : req.body.highlights;
      }
      
      if (req.body.tags) {
        festivalData.tags = typeof req.body.tags === 'string'
          ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean)
          : req.body.tags;
      }
      
      console.log('Final festival data:', JSON.stringify(festivalData, null, 2));
      
      // Validate required fields
      if (!festivalData.name) {
        return res.status(400).json({ 
          success: false, 
          error: 'Name is required',
          received: req.body
        });
      }
      
      if (!festivalData.description) {
        return res.status(400).json({ 
          success: false, 
          error: 'Description is required',
          received: req.body
        });
      }
      
      if (!festivalData.image) {
        return res.status(400).json({ 
          success: false, 
          error: 'Image is required',
          received: req.body
        });
      }
      
      const festival = new Festival(festivalData);
      await festival.save();
      
      console.log(`✅ Festival created: ${festival.name} (ID: ${festival._id})`);
      res.status(201).json({ success: true, festival });
      
    } catch (error) {
      console.error('❌ Create festival error:', error);
      console.error('Received body:', req.body);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        receivedData: req.body
      });
    }
  }
);

// UPDATE festival with optional image upload
app.put('/api/admin/festivals/:id', 
  authenticateAdmin,
  uploadFestival.fields([
    { name: 'image', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const festival = await Festival.findById(req.params.id);
      if (!festival) {
        return res.status(404).json({ success: false, error: 'Festival not found' });
      }
      
      const festivalData = { ...req.body };
      
      // Handle new image upload
      if (req.files?.image) {
        // Delete old image from Cloudinary if exists
        if (festival.image && festival.image.includes('cloudinary.com')) {
          await deleteImage(festival.image);
        }
        
        festivalData.image = req.files.image[0].path;
        festivalData.cloudinaryImageId = req.files.image[0].filename;
      }
      
      // Handle new banner image upload
      if (req.files?.bannerImage) {
        // Delete old banner image from Cloudinary if exists
        if (festival.bannerImage && festival.bannerImage.includes('cloudinary.com')) {
          await deleteImage(festival.bannerImage);
        }
        
        festivalData.bannerImage = req.files.bannerImage[0].path;
        festivalData.cloudinaryBannerId = req.files.bannerImage[0].filename;
      }
      
      // Parse array fields
      if (typeof festivalData.categories === 'string') {
        festivalData.categories = festivalData.categories.split(',').map(c => c.trim()).filter(Boolean);
      }
      if (typeof festivalData.popularItems === 'string') {
        festivalData.popularItems = festivalData.popularItems.split(',').map(p => p.trim()).filter(Boolean);
      }
      
      const updatedFestival = await Festival.findByIdAndUpdate(
        req.params.id,
        festivalData,
        { new: true, runValidators: true }
      );
      
      res.json({ success: true, festival: updatedFestival });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// DELETE festival (and images from Cloudinary)
app.delete('/api/admin/festivals/:id', authenticateAdmin, async (req, res) => {
  try {
    const festival = await Festival.findById(req.params.id);
    if (!festival) {
      return res.status(404).json({ success: false, error: 'Festival not found' });
    }
    
    // Delete images from Cloudinary
    if (festival.image && festival.image.includes('cloudinary.com')) {
      await deleteImage(festival.image);
    }
    
    if (festival.bannerImage && festival.bannerImage.includes('cloudinary.com')) {
      await deleteImage(festival.bannerImage);
    }
    
    // Also delete menu images if any
    if (festival.menuImages && festival.menuImages.length > 0) {
      for (const menuImage of festival.menuImages) {
        if (menuImage.imageUrl && menuImage.imageUrl.includes('cloudinary.com')) {
          await deleteImage(menuImage.imageUrl);
        }
      }
    }
    
    // Delete festival from database
    await Festival.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Festival deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// =================== FOOD ITEM ROUTES (WITH CLOUDINARY) ===================
app.get('/api/admin/food-items', authenticateAdmin, async (req, res) => {
  try {
    const foodItems = await FoodItem.find().sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      foodItems,
      count: foodItems.length 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// CREATE food item with image upload (to Cloudinary)
app.post('/api/admin/food-items',
  authenticateAdmin,
  uploadFoodItem.single('image'),
  debugFormData,
  async (req, res) => {
    try {
      console.log('📝 Creating food item with Cloudinary upload');
      
      const foodItemData = {
        name: req.body.name,
        description: req.body.description || '',
        originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined,
        category: req.body.category || 'main-course',
        festival: req.body.festival || '',
        calories: req.body.calories ? parseInt(req.body.calories) : undefined,
        prepTime: req.body.prepTime ? parseInt(req.body.prepTime) : undefined,
        serves: req.body.serves ? parseInt(req.body.serves) : undefined,
        spicyLevel: req.body.spicyLevel ? parseInt(req.body.spicyLevel) : 1,
        isBestSeller: req.body.isBestSeller === 'true' || req.body.isBestSeller === true,
        isAvailable: req.body.isAvailable === 'true' || req.body.isAvailable === true || req.body.isAvailable !== 'false',
        isActive: req.body.isActive === 'true' || req.body.isActive === true || req.body.isActive !== 'false'
      };
      
      // Handle image upload to Cloudinary
      if (req.file) {
        foodItemData.image = req.file.path; // Cloudinary URL
        foodItemData.cloudinaryImageId = req.file.filename; // Cloudinary public ID
        console.log('✅ Food image uploaded to Cloudinary:', foodItemData.image);
      }
      
      // Auto-generate slug
      if (!foodItemData.slug && foodItemData.name) {
        foodItemData.slug = foodItemData.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
      }
      
      // Parse ingredients if string
      if (req.body.ingredients) {
        if (typeof req.body.ingredients === 'string') {
          foodItemData.ingredients = req.body.ingredients
            .split(',')
            .map(i => i.trim())
            .filter(Boolean);
        } else {
          foodItemData.ingredients = req.body.ingredients;
        }
      }
      
      // Validate required fields
      if (!foodItemData.name) {
        return res.status(400).json({ 
          success: false, 
          error: 'Name is required',
          received: req.body
        });
      }
      
      const foodItem = new FoodItem(foodItemData);
      await foodItem.save();
      
      console.log(`✅ Food item created: ${foodItem.name} (ID: ${foodItem._id})`);
      res.status(201).json({ success: true, foodItem });
      
    } catch (error) {
      console.error('❌ Create food item error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        receivedData: req.body 
      });
    }
  }
);

// UPDATE food item with optional image upload
app.put('/api/admin/food-items/:id',
  authenticateAdmin,
  uploadFoodItem.single('image'),
  async (req, res) => {
    try {
      const foodItem = await FoodItem.findById(req.params.id);
      if (!foodItem) {
        return res.status(404).json({ success: false, error: 'Food item not found' });
      }
      
      const foodItemData = { ...req.body };
      
      // Handle new image upload
      if (req.file) {
        // Delete old image from Cloudinary if exists
        if (foodItem.image && foodItem.image.includes('cloudinary.com')) {
          await deleteImage(foodItem.image);
        }
        
        foodItemData.image = req.file.path;
        foodItemData.cloudinaryImageId = req.file.filename;
      }
      
      // Parse ingredients
      if (typeof foodItemData.ingredients === 'string') {
        foodItemData.ingredients = foodItemData.ingredients
          .split(',')
          .map(i => i.trim())
          .filter(Boolean);
      }
      
      const updatedFoodItem = await FoodItem.findByIdAndUpdate(
        req.params.id,
        foodItemData,
        { new: true, runValidators: true }
      );
      
      res.json({ success: true, foodItem: updatedFoodItem });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// DELETE food item (and image from Cloudinary)
app.delete('/api/admin/food-items/:id', authenticateAdmin, async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }
    
    // Delete image from Cloudinary if exists
    if (foodItem.image && foodItem.image.includes('cloudinary.com')) {
      await deleteImage(foodItem.image);
    }
    
    await FoodItem.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Food item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// =================== GALLERY ROUTES (WITH CLOUDINARY) ===================
app.get('/api/admin/gallery', authenticateAdmin, async (req, res) => {
  try {
    const gallery = await Gallery.find()
      .populate('festival', 'name slug')
      .sort({ createdAt: -1 });
    res.json({ success: true, gallery, count: gallery.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// CREATE gallery item with image upload (to Cloudinary)
app.post('/api/admin/gallery',
  authenticateAdmin,
  uploadGallery.single('image'),
  debugFormData,
  async (req, res) => {
    try {
      console.log('📝 Creating gallery item with Cloudinary upload');
      
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'Image file is required',
          received: req.body
        });
      }
      
      const galleryData = {
        title: req.body.title,
        description: req.body.description || '',
        category: req.body.category || 'food',
        festival: req.body.festival || null,
        order: req.body.order ? parseInt(req.body.order) : 0,
        featured: req.body.featured === 'true' || req.body.featured === true,
        isActive: req.body.isActive === 'true' || req.body.isActive === true || req.body.isActive !== 'false',
        imageUrl: req.file.path, // Cloudinary URL
        cloudinaryPublicId: req.file.filename // Cloudinary public ID
      };
      
      // Parse tags if string
      if (req.body.tags) {
        galleryData.tags = typeof req.body.tags === 'string'
          ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean)
          : req.body.tags;
      }
      
      // Validate
      if (!galleryData.title) {
        return res.status(400).json({ 
          success: false, 
          error: 'Title is required',
          received: req.body
        });
      }
      
      const galleryItem = new Gallery(galleryData);
      await galleryItem.save();
      
      console.log(`✅ Gallery item created: ${galleryItem.title} (ID: ${galleryItem._id})`);
      res.status(201).json({ success: true, galleryItem });
      
    } catch (error) {
      console.error('❌ Create gallery error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        receivedData: req.body
      });
    }
  }
);

// UPDATE gallery item with optional image upload
app.put('/api/admin/gallery/:id',
  authenticateAdmin,
  uploadGallery.single('image'),
  async (req, res) => {
    try {
      const galleryItem = await Gallery.findById(req.params.id);
      if (!galleryItem) {
        return res.status(404).json({ success: false, error: 'Gallery item not found' });
      }
      
      const galleryData = { ...req.body };
      
      // Handle new image upload
      if (req.file) {
        // Delete old image from Cloudinary if exists
        if (galleryItem.imageUrl && galleryItem.imageUrl.includes('cloudinary.com')) {
          await deleteImage(galleryItem.imageUrl);
        }
        
        galleryData.imageUrl = req.file.path;
        galleryData.cloudinaryPublicId = req.file.filename;
      }
      
      // Parse tags
      if (typeof galleryData.tags === 'string') {
        galleryData.tags = galleryData.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean);
      }
      
      const updatedGalleryItem = await Gallery.findByIdAndUpdate(
        req.params.id,
        galleryData,
        { new: true, runValidators: true }
      );
      
      res.json({ success: true, galleryItem: updatedGalleryItem });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// DELETE gallery item (and image from Cloudinary)
app.delete('/api/admin/gallery/:id', authenticateAdmin, async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }
    
    // Delete image from Cloudinary if exists
    if (galleryItem.imageUrl && galleryItem.imageUrl.includes('cloudinary.com')) {
      await deleteImage(galleryItem.imageUrl);
    }
    
    await Gallery.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Gallery item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// =================== SEED ENDPOINT ===================
app.get('/api/seed', async (req, res) => {
  try {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      return res.status(400).json({
        success: false,
        error: 'Admin credentials not configured'
      });
    }

    await Festival.deleteMany({});
    await FoodItem.deleteMany({});
    await Admin.deleteMany({});
    await Inquiry.deleteMany({});
    await UserAction.deleteMany({});

    const admin = new Admin({
      username: 'superadmin',
      name: 'Super Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'superadmin'
    });
    await admin.save();

    const festivals = [
      {
        name: 'Christmas',
        slug: 'christmas',
        description: 'Experience the joy of Kerala Christmas with our traditional feast.',
        image: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        rating: 4.8,
        reviewCount: 124,
        categories: ['Biriyani', 'Roast', 'Fish Curry', 'Desserts'],
        popularItems: ['Chicken Biriyani', 'Beef Roast', 'Fish Molee', 'Plum Cake'],
        isFeatured: true,
        isActive: true
      },
      {
        name: 'Onam',
        slug: 'onam',
        description: 'Complete Onam Sadhya with 26+ traditional items served on banana leaf.',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1567188040759-8c8916b4e6f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        rating: 4.9,
        reviewCount: 218,
        categories: ['Sadhya', 'Payasam', 'Pickles', 'Banana Chips'],
        popularItems: ['Onam Sadhya', 'Avial', 'Sambar', 'Payasam'],
        isFeatured: true,
        isActive: true
      }
    ];

    const createdFestivals = await Festival.insertMany(festivals);

    const foodItems = [
      {
        name: 'Chicken Biriyani',
        slug: 'chicken-biriyani',
        description: 'Traditional Kerala style biriyani',
        category: 'non-veg',
        festival: 'christmas',
        image: 'https://images.unsplash.com/photo-1563379091339-0326b3f5c8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        isBestSeller: true,
        isAvailable: true,
        isActive: true
      }
    ];

    const createdFoodItems = await FoodItem.insertMany(foodItems);

    res.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        adminEmail: process.env.ADMIN_EMAIL,
        festivals: createdFestivals.length,
        foodItems: createdFoodItems.length
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, error: 'Seed failed' });
  }
});

// =================== ROOT ROUTE ===================
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kerala Catering API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      ping: '/api/ping',
      corsTest: '/api/cors-test',
      testCloudinary: '/api/test-cloudinary',
      festivals: '/api/festivals',
      gallery: '/api/gallery',
      admin: {
        login: 'POST /api/admin/login',
        dashboard: 'GET /api/admin/dashboard/stats',
        festivals: 'GET /api/admin/festivals',
        foodItems: 'GET /api/admin/food-items',
        gallery: 'GET /api/admin/gallery'
      },
      public: {
        festivals: 'GET /api/festivals',
        festival: 'GET /api/festival/:slug',
        food: 'GET /api/food',
        gallery: 'GET /api/gallery'
      },
      email: {
        test: 'GET /api/email/test',
        inquiry: 'POST /api/email/send-inquiry'
      },
      actions: {
        log: 'POST /api/actions/log',
        stats: 'GET /api/actions/stats'
      }
    }
  });
});

// =================== GLOBAL ERROR HANDLER ===================
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err);
  
  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large. Maximum size is 5MB for food items, 10MB for gallery/menus.'
    });
  }
  
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'Please login again'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      message: 'Please login again'
    });
  }
  
  // MongoDB errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// =================== 404 HANDLER ===================
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Route ${req.originalUrl} not found`,
    path: req.originalUrl,
    method: req.method
  });
});

// =================== SERVER START ===================
const PORT = process.env.PORT || 10000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 Started at: ${new Date().toLocaleString()}`);
  console.log(`📡 Test endpoints:`);
  console.log(`   http://localhost:${PORT}/api/ping`);
  console.log(`   http://localhost:${PORT}/api/health`);
  console.log(`   http://localhost:${PORT}/api/cors-test`);
  console.log(`   http://localhost:${PORT}/api/test-cloudinary`);
  console.log(`   http://localhost:${PORT}/api/festivals`);
  console.log(`   http://localhost:${PORT}/api/email/test`);
  console.log(`\n🔑 Admin login: POST http://localhost:${PORT}/api/admin/login`);
  console.log(`   Email: ${process.env.ADMIN_EMAIL || '❌ NOT SET'}`);
  console.log(`   Password: ${process.env.ADMIN_PASSWORD ? '✓ Set in .env' : '❌ NOT SET'}`);
  console.log(`\n📨 Email Configuration:`);
  console.log(`   SendGrid: ${process.env.SENDGRID_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`\n🌐 CORS Configuration:`);
  console.log(`   Allowed origins: ${JSON.stringify(allowedOrigins)}`);
  console.log(`   + All *.vercel.app domains`);
  console.log(`   + All localhost ports`);
  console.log(`\n☁️ Cloudinary Configuration:`);
  console.log(`   Images will be uploaded to Cloudinary automatically`);
  console.log(`   Folders: kerala-catering/festivals, kerala-catering/food-items, etc.`);
});

// =================== GRACEFUL SHUTDOWN ===================
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM signal received: closing HTTP server');
  mongoose.connection.close(false, () => {
    console.log('✅ MongoDB connection closed');
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT signal received: closing HTTP server');
  mongoose.connection.close(false, () => {
    console.log('✅ MongoDB connection closed');
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  });
});

module.exports = app;