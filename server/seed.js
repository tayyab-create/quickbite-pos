const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Counter = require('./models/Counter');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fastfood_pos';

const menuItems = [
  // Burgers
  { name: 'Classic Smash Burger', price: 6.99, category: 'Burgers', emoji: '🍔', description: 'Juicy beef patty with lettuce, tomato & special sauce', popular: true },
  { name: 'Double Cheese Burger', price: 9.49, category: 'Burgers', emoji: '🍔', description: 'Two patties stacked with melted American cheese', popular: true },
  { name: 'Bacon BBQ Burger', price: 10.99, category: 'Burgers', emoji: '🥓', description: 'Smoky bacon, crispy onion rings & BBQ glaze', popular: false },
  { name: 'Mushroom Swiss Burger', price: 9.99, category: 'Burgers', emoji: '🍄', description: 'Sautéed mushrooms & melted Swiss cheese', popular: false },
  { name: 'Veggie Burger', price: 7.99, category: 'Burgers', emoji: '🥬', description: 'Plant-based patty with avocado & chipotle mayo', popular: false },

  // Chicken
  { name: 'Crispy Chicken Sandwich', price: 7.49, category: 'Chicken', emoji: '🍗', description: 'Buttermilk fried chicken with pickles & mayo', popular: true },
  { name: 'Spicy Chicken Deluxe', price: 8.49, category: 'Chicken', emoji: '🌶️', description: 'Nashville hot chicken with pepper jack & slaw', popular: true },
  { name: 'Chicken Tenders (6pc)', price: 7.99, category: 'Chicken', emoji: '🍗', description: 'Hand-breaded crispy tenders with dipping sauce', popular: false },
  { name: 'Grilled Chicken Wrap', price: 6.99, category: 'Chicken', emoji: '🌯', description: 'Grilled chicken, fresh veggies & ranch in a tortilla', popular: false },
  { name: 'Chicken Nuggets (10pc)', price: 5.99, category: 'Chicken', emoji: '🍗', description: 'Golden crispy nuggets with your choice of sauce', popular: true },

  // Sides
  { name: 'Classic Fries', price: 2.99, category: 'Sides', emoji: '🍟', description: 'Golden crispy fries with sea salt', popular: true },
  { name: 'Loaded Cheese Fries', price: 4.99, category: 'Sides', emoji: '🧀', description: 'Fries topped with cheese sauce, bacon & jalapeños', popular: false },
  { name: 'Onion Rings', price: 3.99, category: 'Sides', emoji: '🧅', description: 'Beer-battered and deep fried to perfection', popular: false },
  { name: 'Mozzarella Sticks', price: 4.99, category: 'Sides', emoji: '🧀', description: 'Crispy outside, melty mozzarella inside', popular: false },
  { name: 'Garden Salad', price: 3.99, category: 'Sides', emoji: '🥗', description: 'Fresh mixed greens with cherry tomatoes & croutons', popular: false },

  // Drinks
  { name: 'Coca-Cola', price: 1.99, category: 'Drinks', emoji: '🥤', description: 'Ice cold classic Coca-Cola', popular: true },
  { name: 'Sprite', price: 1.99, category: 'Drinks', emoji: '🥤', description: 'Crisp lemon-lime refreshment', popular: false },
  { name: 'Iced Tea', price: 1.99, category: 'Drinks', emoji: '🧊', description: 'Fresh-brewed unsweetened iced tea', popular: false },
  { name: 'Chocolate Milkshake', price: 4.99, category: 'Drinks', emoji: '🥛', description: 'Thick & creamy chocolate shake with whipped cream', popular: true },
  { name: 'Strawberry Lemonade', price: 2.99, category: 'Drinks', emoji: '🍓', description: 'Sweet strawberry meets tangy lemonade', popular: false },

  // Desserts
  { name: 'Chocolate Brownie', price: 3.49, category: 'Desserts', emoji: '🍫', description: 'Warm fudgy brownie with chocolate chips', popular: false },
  { name: 'Apple Pie', price: 2.99, category: 'Desserts', emoji: '🥧', description: 'Flaky crust with cinnamon apple filling', popular: true },
  { name: 'Vanilla Sundae', price: 3.99, category: 'Desserts', emoji: '🍨', description: 'Creamy vanilla ice cream with hot fudge & cherry', popular: false },
  { name: 'Cookie Dough Bites', price: 3.49, category: 'Desserts', emoji: '🍪', description: 'Warm cookie dough bites dusted with powdered sugar', popular: false },

  // Combos
  { name: 'Burger Combo', price: 10.99, category: 'Combos', emoji: '🍱', description: 'Classic Smash Burger + Fries + Drink', popular: true },
  { name: 'Chicken Combo', price: 11.49, category: 'Combos', emoji: '🍱', description: 'Crispy Chicken Sandwich + Fries + Drink', popular: true },
  { name: 'Nuggets Combo', price: 9.49, category: 'Combos', emoji: '🍱', description: '10pc Nuggets + Fries + Drink', popular: false },
  { name: 'Tenders Combo', price: 11.99, category: 'Combos', emoji: '🍱', description: '6pc Tenders + Fries + Drink + Dipping Sauce', popular: false },
  { name: 'Family Feast', price: 29.99, category: 'Combos', emoji: '👨‍👩‍👧‍👦', description: '4 Burgers + 2 Large Fries + 4 Drinks', popular: true },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing menu items and reset order counter
    await MenuItem.deleteMany({});
    await Counter.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert menu items
    const inserted = await MenuItem.insertMany(menuItems);
    console.log(`🍔 Inserted ${inserted.length} menu items`);

    // Initialize order counter
    await Counter.create({ name: 'orderNumber', value: 0 });
    console.log('🔢 Order counter initialized');

    console.log('\n✅ Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
