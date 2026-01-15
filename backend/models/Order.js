const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  festival: { type: String, required: true },
  items: [{
    name: String,
    foodId: mongoose.Schema.Types.ObjectId,
    quantity: Number,
    image: String
  }],
  subtotal: Number,
  deliveryCharge: Number,
  gst: Number,
  total: { type: Number, required: true },
  paymentId: { type: String, required: true },
  paymentStatus: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'], default: 'pending' },
  deliveryDate: { type: Date, required: true },
  deliveryTime: { type: String, required: true },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  customerNotes: String,
  createdAt: { type: Date, default: Date.now }
});

// Generate order ID before save
OrderSchema.pre('save', function(next) {
  if (!this.orderId) {
    const date = new Date();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderId = `KC${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);