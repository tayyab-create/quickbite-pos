const express = require('express');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

/**
 * GET /api/menu
 * Fetch all available menu items. Use ?all=true to fetch all items regardless of availability.
 */
router.get('/', async (req, res) => {
  try {
    const { category, all } = req.query;
    const filter = {};

    if (all !== 'true') {
      filter.available = true;
    }

    if (category) {
      filter.category = category;
    }

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu items', details: err.message });
  }
});

/**
 * POST /api/menu
 * Create a new menu item
 */
router.post('/', async (req, res) => {
  try {
    const itemData = req.body;
    const item = new MenuItem(itemData);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create menu item', details: err.message });
  }
});

/**
 * GET /api/menu/:id
 * Fetch a single menu item by ID.
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu item', details: err.message });
  }
});

/**
 * PATCH /api/menu/:id
 * Update a menu item
 */
router.patch('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update menu item', details: err.message });
  }
});

/**
 * DELETE /api/menu/:id
 * Delete a menu item
 */
router.delete('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete menu item', details: err.message });
  }
});

module.exports = router;
