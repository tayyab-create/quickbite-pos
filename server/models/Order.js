const mongoose = require('mongoose');
const Counter = require('./Counter');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  emoji: {
    type: String,
    default: '🍔',
  },
  notes: {
    type: String,
    default: '',
  },
  discount: {
    type: Number,
    default: 0,
  },
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    unique: true,
  },
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'],
    default: 'dine-in',
  },
  customerName: {
    type: String,
    default: '',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', null],
    default: null,
  },
  amountTendered: {
    type: Number,
    default: null,
  },
  discount: {
    type: Number,
    default: 0,
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['preparing', 'ready', 'completed', 'cancelled'],
    default: 'preparing',
  },
}, {
  timestamps: true,
});

// Auto-assign order number before saving
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = await Counter.getNextSequence('orderNumber');
  }
  next();
});

orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
