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
      'sadhya',      // Added
      'biriyani',    // Added
      'curry',       // Added
      'roast',       // Added - THIS WAS MISSING!
      'fish-curry',  // Added
      'seafood',     // Added for completeness
      'breakfast',   // Added for completeness
      'lunch',       // Added for completeness
      'snacks'       // Added for completeness
    ], 
    default: 'main-course' 
  },
  festival: { type: String, ref: 'Festival' },
  image: String,
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
  }
}, { timestamps: true });

module.exports = mongoose.models.FoodItem || mongoose.model('FoodItem', foodItemSchema);