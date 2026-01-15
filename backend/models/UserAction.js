const mongoose = require('mongoose');

const userActionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['whatsapp', 'call', 'form'],
    required: true
  },
  name: {
    type: String
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  message: {
    type: String
  },
  userInfo: {
    type: String // For storing additional user context
  },
  page: {
    type: String // Which page was the action taken from
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
userActionSchema.index({ createdAt: -1 });
userActionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('UserAction', userActionSchema);