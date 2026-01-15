const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  email: {
    type: String
  },
  event: {
    type: String
  },
  menu: {
    type: String
  },
  comments: {
    type: String
  },
  inquiryId: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'quoted', 'booked', 'cancelled'],
    default: 'new'
  },
  whatsappSent: {
    type: Boolean,
    default: false
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
inquirySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Inquiry', inquirySchema);