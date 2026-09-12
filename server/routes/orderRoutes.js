const express = require('express');
const Order = require('../models/Order');

const router = express.Router();

/**
 * GET /api/orders/stats/today
 * Dashboard stats for today
 */
router.get('/stats/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const matchToday = { createdAt: { $gte: today } };

    const stats = await Order.aggregate([
      { $match: matchToday },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$total' },
          count: { $sum: 1 },
          avgOrderValue: { $avg: '$total' }
        }
      }
    ]);

    const itemsAggregation = await Order.aggregate([
      { $match: matchToday },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      summary: stats[0] || { revenue: 0, count: 0, avgOrderValue: 0 },
      topItems: itemsAggregation
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch today stats', details: err.message });
  }
});

/**
 * GET /api/orders/stats/hourly
 * Hourly orders and revenue for today
 */
router.get('/stats/hourly', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hourlyStats = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(hourlyStats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hourly stats', details: err.message });
  }
});

/**
 * POST /api/orders
 * Create a new order.
 */
router.post('/', async (req, res) => {
  try {
    const { 
      items, subtotal, tax, total, 
      orderType, customerName, paymentMethod, amountTendered, discount 
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    const order = new Order({
      items,
      subtotal,
      tax,
      total,
      orderType,
      customerName,
      paymentMethod,
      amountTendered,
      discount
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

/**
 * GET /api/orders
 * List orders, optionally filtered by status. Sorted newest first.
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

/**
 * GET /api/orders/:id
 * Fetch a single order by ID.
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order', details: err.message });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Update the status of an order. Expects { status }.
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['preparing', 'ready', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order', details: err.message });
  }
});

module.exports = router;
