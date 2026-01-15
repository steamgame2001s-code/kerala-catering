const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['festival', 'food', 'event', 'chef', 'kitchen'],
    default: 'food'
  },
  festival: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Festival'
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gallery', gallerySchema);