const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
    quantity: { type: Number, default: 1 },

  }],
  expiresAt: { type: Date, default: () => new Date(+new Date() + 7*24*60*60*1000) } // 7 days
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);