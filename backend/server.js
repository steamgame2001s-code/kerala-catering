// backend/server.js - UPDATED WITH PROPER CORS FOR VERCEl
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('cloudinary').v2; // ADDED: Cloudinary

dotenv.config();

// Cloudinary Configuration - ADDED
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlgrdnghb',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log('☁️ Cloudinary configured:', process.env.CLOUDINARY_CLOUD_NAME ? 'Yes' : 'No');

// Import models
const Admin = require('./models/Admin');
const Festival = require('./models/Festival');
const FoodItem = require('./models/FoodItem');
const Gallery = require('./models/Gallery');
const Order = require('./models/Order');
const User = require('./models/User');
const Inquiry = require('./models/Inquiry');
const UserAction = require('./models/UserAction'); // ADDED: User Action model

const app = express();

// ========== MIDDLEWARE ==========
// UPDATED CORS CONFIGURATION FOR VERCEl
const allowedOrigins = [
  'http://localhost:3000',
  'https://kerala-catering.vercel.app',
  'https://kerala-catering-*.vercel.app',  // For Vercel preview deployments
  'https://*.vercel.app'  // All Vercel subdomains
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check exact matches
    if (allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        // Handle wildcard patterns
        const pattern = allowedOrigin.replace('*', '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(origin);
      }
      return allowedOrigin === origin;
    })) {
      return callback(null, true);
    }
    
    // Special check for Vercel preview URLs
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    console.log('❌ CORS blocked origin:', origin);
    console.log('✅ Allowed origins:', allowedOrigins);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== FILE UPLOAD CONFIGURATION ==========
// Create all necessary directories
const uploadsDir = path.join(__dirname, 'uploads');
const festivalsDir = path.join(uploadsDir, 'festivals');
const festivalMenusDir = path.join(uploadsDir, 'festival-menus');
const foodItemsDir = path.join(uploadsDir, 'food-items');
const galleryDir = path.join(uploadsDir, 'gallery');

[uploadsDir, festivalsDir, festivalMenusDir, foodItemsDir, galleryDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('📁 Created directory:', dir);
  }
});

// ========== MULTER STORAGE CONFIGURATIONS ==========

// 1. FESTIVAL IMAGES (main image and banner)
const festivalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, festivalsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'festival-' + uniqueSuffix + ext);
  }
});

// 2. FESTIVAL MENU IMAGES
const festivalMenuStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, festivalMenusDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'menu-' + uniqueSuffix + ext);
  }
});

// 3. FOOD ITEM IMAGES
const foodItemStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, foodItemsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'food-' + uniqueSuffix + ext);
  }
});

// 4. GALLERY IMAGES
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, galleryDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'gallery-' + uniqueSuffix + ext);
  }
});

// File filter for all uploads
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

// Create multer instances
const uploadFestival = multer({
  storage: festivalStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFileFilter
});

const uploadFestivalMenu = multer({
  storage: festivalMenuStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFileFilter
});

const uploadFoodItem = multer({
  storage: foodItemStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFileFilter
});

const uploadGallery = multer({
  storage: galleryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFileFilter
});

// ========== SERVE STATIC FILES ==========
app.use('/uploads', express.static(uploadsDir));
console.log('✅ Static files served from:', uploadsDir);

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

// =================== EMAIL CONFIGURATION ===================
console.log('\n📧 Email Configuration:');
console.log(`FROM (Website): ${process.env.EMAIL_USER || 'Not configured'}`);
console.log(`TO (Business): ${process.env.BUSINESS_EMAIL || 'Not configured'}`);
console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '✓ Set (' + process.env.EMAIL_PASS.length + ' chars)' : '❌ NOT SET'}`);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test email connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error.message);
    console.error('   Please check EMAIL_USER and EMAIL_PASS in .env');
    console.error('   Make sure you are using a Gmail App Password');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
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

// ADD THIS NEW ENDPOINT FOR CORS TESTING
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    origin: req.headers.origin,
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString()
  });
});

// =================== EMAIL & INQUIRY ROUTES ===================
app.get('/api/email/test', async (req, res) => {
  try {
    console.log('📧 Testing email configuration...');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: 'Email credentials not configured in .env file',
        required: ['EMAIL_USER', 'EMAIL_PASS']
      });
    }

    const toEmail = process.env.BUSINESS_EMAIL || process.env.EMAIL_USER;
    
    const mailOptions = {
      from: `"Upasana Catering Test" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: '✅ Test Email - Upasana Catering Backend',
      text: `This is a test email sent from your catering website backend.\n\nFROM: ${process.env.EMAIL_USER}\nTO: ${toEmail}\nTime: ${new Date().toLocaleString()}`,
      html: `
        <h1>✅ Test Email Successful!</h1>
        <p>Your catering website email system is working correctly.</p>
        <p><strong>FROM:</strong> ${process.env.EMAIL_USER}</p>
        <p><strong>TO:</strong> ${toEmail}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p>If you received this email at ${toEmail}, your email configuration is correct.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Test email sent successfully:', info.messageId);
    console.log(`📨 Sent FROM: ${process.env.EMAIL_USER}`);
    console.log(`📨 Sent TO: ${toEmail}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Test email sent successfully',
      from: process.env.EMAIL_USER,
      to: toEmail,
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Email test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test email',
      error: error.message,
      stack: error.stack
    });
  }
});

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
    const formattedDate = new Date().toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    const toEmail = process.env.BUSINESS_EMAIL || process.env.EMAIL_USER;
    
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
              <div class="field"><span class="field-label">Date:</span> <span class="field-value">${formattedDate}</span></div>
              <div class="field"><span class="field-label">Time:</span> <span class="field-value">${formattedTime}</span></div>
              <div class="field"><span class="field-label">Source:</span> <span class="field-value">Website Menu Page</span></div>
            </div>
            
            <div class="footer">
              <p><strong>Action Required:</strong> Please contact customer within 24 hours</p>
              <p><em>WhatsApp: ${phone} | Email: ${email || 'Use reply-to address'}</em></p>
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
      Date: ${formattedDate}
      Time: ${formattedTime}
      Source: Website Menu Page
      
      ====================================
      ACTION REQUIRED: Contact within 24 hours
      WhatsApp: ${phone}
      ${email ? `Email: ${email}` : ''}
    `;

    const mailOptions = {
      from: `"Upasana Catering Website" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      replyTo: email || process.env.EMAIL_USER,
      subject: `🍽️ New Menu Inquiry - ${name} - ${inquiryId}`,
      html: htmlTemplate,
      text: textTemplate
    };

    await transporter.sendMail(mailOptions);
    
    console.log(`✅ Inquiry email sent for ID: ${inquiryId}`);
    
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
        status: 'new'
      });
      await inquiry.save();
      console.log(`💾 Inquiry saved to database: ${inquiryId}`);
      
      // Log the inquiry as an action
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
          userInfo: `${name} (${phone})`
        });
        await action.save();
        console.log(`📊 Action logged for inquiry: ${inquiryId}`);
      } catch (actionError) {
        console.error('Failed to log action:', actionError.message);
      }
      
    } catch (dbError) {
      console.error('Failed to save inquiry to database:', dbError.message);
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Inquiry email sent successfully',
      inquiryId: inquiryId,
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
    console.error('❌ Email sending error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send inquiry email',
      error: error.message 
    });
  }
});

// =================== USER ACTION TRACKING ROUTES ===================
// ADDED: User action tracking routes

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

// Get recent actions (for admin dashboard)
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

// Get action statistics
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

// =================== PASSWORD RESET ROUTES ===================
app.post('/api/admin/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('\n🔐 === FORGOT PASSWORD REQUEST ===');
    console.log(`📧 Requested email: ${email}`);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    const admin = await Admin.findOne({ email: email.toLowerCase().trim(), isActive: true });
    
    if (!admin) {
      console.log(`⚠️ Admin not found: ${email}`);
      return res.json({
        success: true,
        message: 'If an admin with this email exists, an OTP has been sent to your email'
      });
    }
    
    console.log(`✅ Admin found: ${admin.email} (${admin.username})`);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    admin.resetPasswordOTP = otp;
    admin.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await admin.save();
    
    console.log(`🔑 OTP Generated: ${otp}`);
    console.log(`⏰ Expires: ${new Date(admin.resetPasswordOTPExpires).toLocaleString()}`);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email not configured!');
      return res.status(500).json({
        success: false,
        error: 'Email service not configured'
      });
    }
    
    const mailOptions = {
      from: `"Upasana Catering Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Password Reset OTP - Upasana Catering',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .otp-box { 
              background: #1f2937; 
              color: white; 
              padding: 20px; 
              font-size: 36px; 
              font-weight: bold; 
              text-align: center; 
              letter-spacing: 8px;
              border-radius: 8px;
              margin: 30px 0;
              font-family: 'Courier New', monospace;
            }
            .warning { 
              background: #fef3c7; 
              border-left: 4px solid #f59e0b; 
              padding: 15px; 
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning strong { color: #92400e; }
            .footer { 
              background: #f9fafb; 
              padding: 20px 30px; 
              text-align: center; 
              color: #6b7280; 
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
            }
            .info-item { margin: 10px 0; }
            .info-label { font-weight: bold; color: #4b5563; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Upasana Catering Admin Portal</p>
            </div>
            
            <div class="content">
              <p>Hello <strong>${admin.username}</strong>,</p>
              
              <p>We received a request to reset your password. Use the OTP below to continue:</p>
              
              <div class="otp-box">${otp}</div>
              
              <div class="warning">
                <p><strong>⚠️ Important Security Information:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This OTP is valid for <strong>10 minutes only</strong></li>
                  <li><strong>Never share this OTP</strong> with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Your password will not change unless you complete the reset process</li>
                </ul>
              </div>
              
              <div class="info-item">
                <span class="info-label">Email:</span> ${email}
              </div>
              <div class="info-item">
                <span class="info-label">Time:</span> ${new Date().toLocaleString()}
              </div>
              <div class="info-item">
                <span class="info-label">Expires:</span> ${new Date(admin.resetPasswordOTPExpires).toLocaleString()}
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Upasana Catering Services</strong></p>
              <p style="margin: 5px 0;">This is an automated email. Please do not reply.</p>
              <p style="margin: 5px 0; font-size: 12px;">If you're having trouble, contact support.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Password Reset OTP - Upasana Catering

Hello ${admin.username},

We received a request to reset your password for the Admin Portal.

YOUR OTP: ${otp}

This OTP is valid for 10 minutes only.
Expires at: ${new Date(admin.resetPasswordOTPExpires).toLocaleString()}

IMPORTANT:
- Do not share this OTP with anyone
- If you didn't request this, please ignore this email
- Your password will not change unless you complete the reset process

Email: ${email}
Time: ${new Date().toLocaleString()}

---
Upasana Catering Services
This is an automated email. Please do not reply.
      `
    };

    console.log('📨 Attempting to send email...');
    console.log(`   FROM: ${process.env.EMAIL_USER}`);
    console.log(`   TO: ${email}`);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ OTP email sent successfully!`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log('=================================\n');
    
    res.json({
      success: true,
      message: 'OTP has been sent to your email',
      email: email,
      expiresIn: '10 minutes'
    });
    
  } catch (error) {
    console.error('\n❌ FORGOT PASSWORD ERROR:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    console.log('=================================\n');
    
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP. Please check server configuration.',
      details: error.message
    });
  }
});

app.post('/api/admin/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    console.log('\n🔐 === VERIFY OTP REQUEST ===');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 OTP: ${otp}`);
    
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required'
      });
    }
    
    const admin = await Admin.findOne({ email: email.toLowerCase().trim(), isActive: true });
    
    if (!admin) {
      console.log('❌ Admin not found');
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }
    
    console.log(`✅ Admin found: ${admin.email}`);
    
    if (!admin.resetPasswordOTP || !admin.resetPasswordOTPExpires) {
      console.log('❌ No OTP request found');
      return res.status(400).json({
        success: false,
        error: 'No OTP request found. Please request a new OTP.'
      });
    }
    
    if (admin.resetPasswordOTPExpires < Date.now()) {
      console.log('❌ OTP expired');
      admin.resetPasswordOTP = null;
      admin.resetPasswordOTPExpires = null;
      await admin.save();
      
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new one.'
      });
    }
    
    if (admin.resetPasswordOTP !== otp.trim()) {
      console.log('❌ Invalid OTP');
      console.log(`   Expected: ${admin.resetPasswordOTP}`);
      console.log(`   Received: ${otp}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP. Please check and try again.'
      });
    }
    
    console.log('✅ OTP verified successfully');
    
    const resetToken = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        type: 'password_reset',
        timestamp: Date.now()
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );
    
    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await admin.save();
    
    console.log('✅ Reset token generated');
    console.log('=================================\n');
    
    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken: resetToken,
      expiresIn: '15 minutes'
    });
    
  } catch (error) {
    console.error('\n❌ VERIFY OTP ERROR:', error);
    console.log('=================================\n');
    
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP',
      details: error.message
    });
  }
});

app.post('/api/admin/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    console.log('\n🔐 === RESET PASSWORD REQUEST ===');
    
    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Reset token and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          error: 'Reset token has expired. Please request a new OTP.'
        });
      }
      
      return res.status(400).json({
        success: false,
        error: 'Invalid reset token'
      });
    }
    
    if (decoded.type !== 'password_reset') {
      console.log('❌ Invalid token type');
      return res.status(400).json({
        success: false,
        error: 'Invalid token type'
      });
    }
    
    console.log(`✅ Token verified for: ${decoded.email}`);
    
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      console.log('❌ Admin not found');
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }
    
    if (admin.resetPasswordToken !== resetToken) {
      console.log('❌ Token mismatch');
      return res.status(400).json({
        success: false,
        error: 'Invalid reset token'
      });
    }
    
    if (admin.resetPasswordExpires < Date.now()) {
      console.log('❌ Reset token expired');
      admin.resetPasswordToken = null;
      admin.resetPasswordExpires = null;
      admin.resetPasswordOTP = null;
      admin.resetPasswordOTPExpires = null;
      await admin.save();
      
      return res.status(400).json({
        success: false,
        error: 'Reset token has expired. Please request a new OTP.'
      });
    }

    console.log('✅ Updating password...');

    admin.password = newPassword;

    admin.resetPasswordToken = null;
    admin.resetPasswordExpires = null;
    admin.resetPasswordOTP = null;
    admin.resetPasswordOTPExpires = null;

    await admin.save();

    console.log(`✅ Password reset successful for: ${admin.email}`);
    console.log('=================================\n');

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('\n❌ RESET PASSWORD ERROR:', error);
    console.log('=================================\n');
    res.status(500).json({
      success: false,
      error: 'Failed to reset password',
      details: error.message
    });
  }
});

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

// Get all inquiries (for admin panel)
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
// UPDATED: Dashboard stats route with UserAction tracking
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

    // Build recent activities array combining all types
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

// =================== FESTIVAL MENU IMAGES ROUTES (FIXED) ===================

// GET festivals for menu management
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

// Also keep the alternative route name for compatibility
app.get('/api/admin/festivals/menu-management', authenticateAdmin, async (req, res) => {
  try {
    console.log('📋 [MENU-MGMT] Fetching festivals for menu management page');
    console.log(`🔑 Admin: ${req.adminEmail}`);
    
    const festivals = await Festival.find()
      .select('_id name slug image bannerImage menuImages isFeatured isActive description')
      .sort({ name: 1 });
    
    console.log(`✅ Found ${festivals.length} festivals`);
    
    // Convert image URLs to absolute
    const festivalsWithAbsoluteUrls = festivals.map(festival => {
      const festivalObj = festival.toObject();
      
      // Convert main image to absolute URL
      if (festivalObj.image && !festivalObj.image.startsWith('http')) {
        if (festivalObj.image.startsWith('/uploads')) {
          festivalObj.image = `${req.protocol}://${req.get('host')}${festivalObj.image}`;
        } else if (festivalObj.image.startsWith('http')) {
          // Already absolute
        } else {
          festivalObj.image = `${req.protocol}://${req.get('host')}/uploads/${festivalObj.image}`;
        }
      }
      
      // Convert menu images to absolute URLs
      if (festivalObj.menuImages && festivalObj.menuImages.length > 0) {
        festivalObj.menuImages = festivalObj.menuImages.map(img => ({
          ...img,
          imageUrl: img.imageUrl.startsWith('/') ? 
            `${req.protocol}://${req.get('host')}${img.imageUrl}` : 
            `${req.protocol}://${req.get('host')}/${img.imageUrl}`
        }));
      }
      
      return festivalObj;
    });
    
    res.json({
      success: true,
      festivals: festivalsWithAbsoluteUrls,
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

// UPLOAD menu image for festival
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
        imageUrl: `/uploads/festival-menus/${req.file.filename}`,
        caption: req.body.caption || '',
        order: festival.menuImages ? festival.menuImages.length : 0
      };
      
      festival.menuImages.push(menuImage);
      await festival.save();
      
      console.log('✅ Menu image uploaded');
      res.json({ success: true, festival, menuImage });
    } catch (error) {
      console.error('❌ Upload error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// DELETE menu image
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
      
      const imagePath = festival.menuImages[imageIndex].imageUrl;
      festival.menuImages.splice(imageIndex, 1);
      await festival.save();
      
      // Delete physical file
      if (imagePath && imagePath.startsWith('/uploads/')) {
        const fullPath = path.join(__dirname, imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      
      res.json({ success: true, message: 'Menu image deleted', festival });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// =================== FESTIVAL ROUTES (WITH DEBUG) ===================

// GET all festivals for admin
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

// CREATE festival with image upload
app.post('/api/admin/festivals', 
  authenticateAdmin, 
  uploadFestival.fields([
    { name: 'image', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 }
  ]),
  debugFormData, // ADD DEBUG HERE TOO
  async (req, res) => {
    try {
      console.log('📝 Creating festival');
      console.log('Raw body:', req.body);
      
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
      
      // Handle image upload
      if (req.files?.image) {
        festivalData.image = `/uploads/festivals/${req.files.image[0].filename}`;
      }
      
      // Handle banner image upload
      if (req.files?.bannerImage) {
        festivalData.bannerImage = `/uploads/festivals/${req.files.bannerImage[0].filename}`;
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
      const festivalData = { ...req.body };
      
      // Handle new image upload
      if (req.files?.image) {
        festivalData.image = `/uploads/festivals/${req.files.image[0].filename}`;
      }
      
      // Handle new banner image upload
      if (req.files?.bannerImage) {
        festivalData.bannerImage = `/uploads/festivals/${req.files.bannerImage[0].filename}`;
      }
      
      // Parse array fields
      if (typeof festivalData.categories === 'string') {
        festivalData.categories = festivalData.categories.split(',').map(c => c.trim()).filter(Boolean);
      }
      if (typeof festivalData.popularItems === 'string') {
        festivalData.popularItems = festivalData.popularItems.split(',').map(p => p.trim()).filter(Boolean);
      }
      
      const festival = await Festival.findByIdAndUpdate(
        req.params.id,
        festivalData,
        { new: true, runValidators: true }
      );
      
      if (!festival) {
        return res.status(404).json({ success: false, error: 'Festival not found' });
      }
      
      res.json({ success: true, festival });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// DELETE festival
app.delete('/api/admin/festivals/:id', authenticateAdmin, async (req, res) => {
  try {
    const festival = await Festival.findByIdAndDelete(req.params.id);
    if (!festival) {
      return res.status(404).json({ success: false, error: 'Festival not found' });
    }
    res.json({ success: true, message: 'Festival deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// =================== FOOD ITEM ROUTES (WITH DEBUG) ===================

// GET food items for admin
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

// CREATE food item with image upload
app.post('/api/admin/food-items',
  authenticateAdmin,
  uploadFoodItem.single('image'), // This processes the file
  debugFormData, // ADD THIS - Debug what we receive
  async (req, res) => {
    try {
      console.log('📝 Creating food item');
      console.log('Raw body:', req.body);
      
      // CRITICAL: When using FormData, all fields come as strings
      // We need to manually construct the object
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
      
      console.log('Parsed foodItemData:', foodItemData);
      
      // Handle image upload
      if (req.file) {
        foodItemData.image = `/uploads/food-items/${req.file.filename}`;
        console.log('Image uploaded:', foodItemData.image);
      }
      
      // Auto-generate slug
      if (!foodItemData.slug && foodItemData.name) {
        foodItemData.slug = foodItemData.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        console.log('Generated slug:', foodItemData.slug);
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
        console.log('Parsed ingredients:', foodItemData.ingredients);
      }
      
      console.log('Final data to save:', JSON.stringify(foodItemData, null, 2));
      
      // Validate required fields before saving
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
      console.error('Error details:', error.message);
      console.error('Received body:', req.body);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        receivedData: req.body 
      });
    }
  }
);

// UPDATE food item
app.put('/api/admin/food-items/:id',
  authenticateAdmin,
  uploadFoodItem.single('image'),
  async (req, res) => {
    try {
      const foodItemData = { ...req.body };
      
      // Handle new image upload
      if (req.file) {
        foodItemData.image = `/uploads/food-items/${req.file.filename}`;
      }
      
      // Parse ingredients
      if (typeof foodItemData.ingredients === 'string') {
        foodItemData.ingredients = foodItemData.ingredients
          .split(',')
          .map(i => i.trim())
          .filter(Boolean);
      }
      
      const foodItem = await FoodItem.findByIdAndUpdate(
        req.params.id,
        foodItemData,
        { new: true, runValidators: true }
      );
      
      if (!foodItem) {
        return res.status(404).json({ success: false, error: 'Food item not found' });
      }
      
      res.json({ success: true, foodItem });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// DELETE food item
app.delete('/api/admin/food-items/:id', authenticateAdmin, async (req, res) => {
  try {
    const foodItem = await FoodItem.findByIdAndDelete(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }
    res.json({ success: true, message: 'Food item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// =================== GALLERY ROUTES (WITH DEBUG) ===================

// GET gallery for admin
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

// CREATE gallery item with image upload
app.post('/api/admin/gallery',
  authenticateAdmin,
  uploadGallery.single('image'),
  debugFormData, // ADD DEBUG
  async (req, res) => {
    try {
      console.log('📝 Creating gallery item');
      console.log('Raw body:', req.body);
      
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
        imageUrl: `/uploads/gallery/${req.file.filename}`
      };
      
      // Parse tags if string
      if (req.body.tags) {
        galleryData.tags = typeof req.body.tags === 'string'
          ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean)
          : req.body.tags;
      }
      
      console.log('Final gallery data:', JSON.stringify(galleryData, null, 2));
      
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
      console.error('Received body:', req.body);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        receivedData: req.body
      });
    }
  }
);

// UPDATE gallery item
app.put('/api/admin/gallery/:id',
  authenticateAdmin,
  uploadGallery.single('image'),
  async (req, res) => {
    try {
      const galleryData = { ...req.body };
      
      // Handle new image upload
      if (req.file) {
        galleryData.imageUrl = `/uploads/gallery/${req.file.filename}`;
      }
      
      // Parse tags
      if (typeof galleryData.tags === 'string') {
        galleryData.tags = galleryData.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean);
      }
      
      const galleryItem = await Gallery.findByIdAndUpdate(
        req.params.id,
        galleryData,
        { new: true, runValidators: true }
      );
      
      if (!galleryItem) {
        return res.status(404).json({ success: false, error: 'Gallery item not found' });
      }
      
      res.json({ success: true, galleryItem });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// DELETE gallery item
app.delete('/api/admin/gallery/:id', authenticateAdmin, async (req, res) => {
  try {
    const galleryItem = await Gallery.findByIdAndDelete(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }
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
    await UserAction.deleteMany({}); // ADDED: Clear UserAction data

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

// =================== DEBUG: CHECK MENU IMAGES IN DB ===================
app.get('/api/debug/check-menu-images/:slug', async (req, res) => {
  try {
    console.log(`🔍 DEBUG: Checking menu images for ${req.params.slug}`);
    
    const festival = await Festival.findOne({ slug: req.params.slug });
    
    if (!festival) {
      return res.status(404).json({ 
        success: false, 
        error: 'Festival not found',
        slug: req.params.slug 
      });
    }
    
    console.log('📊 Festival data:', {
      _id: festival._id,
      name: festival.name,
      slug: festival.slug,
      menuImagesCount: festival.menuImages ? festival.menuImages.length : 0,
      menuImages: festival.menuImages || []
    });
    
    // Check if files exist on disk
    const fileChecks = [];
    if (festival.menuImages && festival.menuImages.length > 0) {
      for (const img of festival.menuImages) {
        if (img.imageUrl) {
          const filePath = path.join(__dirname, img.imageUrl);
          const exists = fs.existsSync(filePath);
          fileChecks.push({
            imageUrl: img.imageUrl,
            absoluteUrl: `http://localhost:10000${img.imageUrl}`,
            filePath: filePath,
            existsOnDisk: exists,
            caption: img.caption,
            _id: img._id
          });
        }
      }
    }
    
    res.json({
      success: true,
      festival: {
        _id: festival._id,
        name: festival.name,
        slug: festival.slug,
        menuImagesCount: festival.menuImages ? festival.menuImages.length : 0
      },
      fileChecks: fileChecks,
      totalChecks: fileChecks.length,
      directoryPath: festivalMenusDir
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// =================== 404 HANDLER ===================
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Route ${req.originalUrl} not found`,
    path: req.originalUrl
  });
});

// =================== SERVER START ===================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 Test endpoints:`);
  console.log(`   http://localhost:${PORT}/api/ping`);
  console.log(`   http://localhost:${PORT}/api/health`);
  console.log(`   http://localhost:${PORT}/api/cors-test`); // ADDED
  console.log(`   http://localhost:${PORT}/api/festivals`);
  console.log(`   http://localhost:${PORT}/api/email/test`);
  console.log(`\n🔑 Admin login: POST http://localhost:${PORT}/api/admin/login`);
  console.log(`   Email: ${process.env.ADMIN_EMAIL || '❌ NOT SET'}`);
  console.log(`   Password: ${process.env.ADMIN_PASSWORD ? '✓ Set in .env' : '❌ NOT SET'}`);
  console.log(`\n📨 Email Configuration:`);
  console.log(`   FROM: ${process.env.EMAIL_USER || 'Not set'}`);
  console.log(`   TO: ${process.env.BUSINESS_EMAIL || 'Not set'}`);
  console.log(`\n🌐 CORS Configuration:`);
  console.log(`   Allowed origins: ${JSON.stringify(allowedOrigins)}`);
  console.log(`\n✨ Admin routes available:`);
  console.log(`   GET  /api/admin/festivals`);
  console.log(`   POST /api/admin/festivals (with image upload & debug)`);
  console.log(`   PUT  /api/admin/festivals/:id (with image upload)`);
  console.log(`   DELETE /api/admin/festivals/:id`);
  console.log(`   GET  /api/admin/dashboard/stats`);
  console.log(`\n📊 Action tracking routes:`);
  console.log(`   POST /api/actions/log`);
  console.log(`   GET  /api/actions/recent`);
  console.log(`   GET  /api/actions/stats`);
  console.log(`\n📸 File upload directories created:`);
  console.log(`   ${festivalsDir}`);
  console.log(`   ${festivalMenusDir}`);
  console.log(`   ${foodItemsDir}`);
  console.log(`   ${galleryDir}`);
  console.log(`\n🔍 Debug middleware active for POST routes`);
});