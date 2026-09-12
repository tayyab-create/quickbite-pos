const mongoose = require('mongoose');

const CATEGORIES = ['Burgers', 'Chicken', 'Sides', 'Drinks', 'Desserts', 'Combos'];

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: CATEGORIES,
  },
  emoji: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  popular: {
    type: Boolean,
    default: false,
  },
  available: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

menuItemSchema.index({ category: 1 });
menuItemSchema.index({ available: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
module.exports.CATEGORIES = CATEGORIES;
