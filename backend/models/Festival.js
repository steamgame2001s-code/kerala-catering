// backend/models/Festival.js - UPDATED WITH CLOUDINARY FIELDS
const mongoose = require('mongoose');

const festivalSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String, 
    required: true 
  },
  // NEW: Cloudinary public ID for main image
  cloudinaryImageId: { 
    type: String 
  },
  
  bannerImage: { 
    type: String 
  },
  // NEW: Cloudinary public ID for banner image
  cloudinaryBannerId: { 
    type: String 
  },
  
  // MENU IMAGES - Maximum 2 per festival
  menuImages: [{
    imageUrl: { 
      type: String, 
      required: true 
    },
    // NEW: Cloudinary public ID for menu images
    cloudinaryPublicId: { 
      type: String 
    },
    caption: { 
      type: String, 
      default: '' 
    },
    order: { 
      type: Number, 
      default: 0 
    },
    uploadedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  
  rating: { 
    type: Number, 
    default: 4.5,
    min: 0,
    max: 5
  },
  reviewCount: { 
    type: Number, 
    default: 0 
  },
  
  categories: [String],
  popularItems: [String],
  
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  metaTitle: String,
  metaDescription: String,
  seoKeywords: [String],
  
  contactInfo: {
    whatsappNumber: { 
      type: String, 
      default: '+919387431366' 
    },
    callNumber: { 
      type: String, 
      default: '+919387431366' 
    },
    email: { 
      type: String, 
      default: 'info@upasanacatering.com' 
    }
  },
  
  talkToUs: {
    title: {
      type: String,
      default: 'Need Customization?'
    },
    description: {
      type: String,
      default: 'Talk to our expert chefs to customize this festival menu.'
    },
    buttonText: {
      type: String,
      default: 'Chat on WhatsApp'
    }
  },
  
  festivalDates: String,
  deliveryInfo: String,
  specialNote: String,
  highlights: [String],
  tags: [String]
}, { 
  timestamps: true 
});

// Ensure max 2 menu images
festivalSchema.pre('save', function(next) {
  if (this.menuImages && this.menuImages.length > 2) {
    this.menuImages = this.menuImages.slice(0, 2);
  }
  next();
});

// Index for performance
festivalSchema.index({ slug: 1 });
festivalSchema.index({ isActive: 1, isFeatured: -1 });

module.exports = mongoose.models.Festival || mongoose.model('Festival', festivalSchema);