const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');

// GET all orders (admin sees all, distributor sees own)
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'distributor') {
            query.distributorId = req.user.id;
        }
        const orders = await Order.find(query)
            .populate('distributorId', 'name companyName email')
            .populate('items.productId', 'name type pricePerUnit sku')
            .sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST create order (distributor only)
router.post('/', auth, async (req, res) => {
    try {
        const { items } = req.body;

        // Calculate total amount
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ message: `Product not found` });
            totalAmount += product.pricePerUnit * item.quantity;
        }

        const order = new Order({
            distributorId: req.user.id,
            items,
            totalAmount,
            status: 'Pending'
        });
        await order.save();

        const populated = await Order.findById(order._id)
            .populate('distributorId', 'name companyName email')
            .populate('items.productId', 'name type pricePerUnit sku');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT update order status (admin only)
router.put('/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        )
            .populate('distributorId', 'name companyName email')
            .populate('items.productId', 'name type pricePerUnit sku');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT assign batch to order item (admin only)
router.put('/:id/assign-batch', auth, adminOnly, async (req, res) => {
    try {
        const { itemIndex, batchId } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.items[itemIndex].batchId = batchId;
        await order.save();

        const populated = await Order.findById(order._id)
            .populate('distributorId', 'name companyName email')
            .populate('items.productId', 'name type pricePerUnit sku');
        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET dashboard stats (admin)
router.get('/stats', auth, adminOnly, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        const approvedOrders = await Order.countDocuments({ status: 'Approved' });
        const shippedOrders = await Order.countDocuments({ status: 'Shipped' });
        const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });

        const revenueResult = await Order.aggregate([
            { $match: { status: { $in: ['Approved', 'Shipped', 'Delivered'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.json({
            totalOrders, pendingOrders, approvedOrders,
            shippedOrders, deliveredOrders, totalRevenue
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
