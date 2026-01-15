const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'Admin'
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'content_manager'],
    default: 'admin'
  },
  profileImage: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  
  // Password Reset Fields
  resetPasswordOTP: String,
  resetPasswordOTPExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  permissions: {
    manageFestivals: { type: Boolean, default: true },
    manageMenu: { type: Boolean, default: true },
    manageGallery: { type: Boolean, default: true },
    manageOrders: { type: Boolean, default: true },
    manageUsers: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(`✅ Password hashed for: ${this.email}`);
    next();
  } catch (error) {
    console.error('❌ Password hashing error:', error);
    next(error);
  }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('❌ Password comparison error:', error);
    return false;
  }
};

module.exports = mongoose.model('Admin', adminSchema);