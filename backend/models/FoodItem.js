// backend/models/FoodItem.js - UPDATED WITH CLOUDINARY FIELD
const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  originalPrice: Number,
  category: { 
    type: String, 
    enum: [
      'veg', 
      'non-veg', 
      'dessert', 
      'drink', 
      'main-course', 
      'appetizer',
      'sadhya',
      'biriyani',
      'curry',
      'roast',
      'fish-curry',
      'seafood',
      'breakfast',
      'lunch',
      'snacks'
    ], 
    default: 'main-course' 
  },
  festival: { type: String, ref: 'Festival' },
  image: String,
  // NEW: Cloudinary public ID for food item image
  cloudinaryImageId: { 
    type: String 
  },
  isBestSeller: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  calories: Number,
  prepTime: Number,
  serves: Number,
  ingredients: [String],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  // NEW: Spicy level for food items
  spicyLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  }
}, { timestamps: true });

// Index for better query performance
foodItemSchema.index({ festival: 1, isActive: 1 });
foodItemSchema.index({ isBestSeller: -1 });
foodItemSchema.index({ category: 1 });

module.exports = mongoose.models.FoodItem || mongoose.model('FoodItem', foodItemSchema);