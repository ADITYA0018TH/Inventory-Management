const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');
const { sendEmail, sendOrderConfirmation } = require('../utils/email');

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

        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ message: `Product not found` });
            totalAmount += product.pricePerUnit * item.quantity;
        }

        const count = await Order.countDocuments();
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

        const order = new Order({
            distributorId: req.user.id,
            items,
            totalAmount,
            status: 'Pending',
            invoiceNumber
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

// PUT update order status (admin only) — with email notification
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

        // Send email notification (non-blocking)
        if (order.distributorId?.email) {
            sendEmail(
                order.distributorId.email,
                `Order Status Updated — ${req.body.status}`,
                `<h2>PharmaLink Order Update</h2>
                <p>Hi ${order.distributorId.name},</p>
                <p>Your order <strong>${order.invoiceNumber || order._id}</strong> has been updated to: <strong>${req.body.status}</strong></p>
                <p>Total: ₹${order.totalAmount?.toLocaleString()}</p>
                <p>— PharmaLink Team</p>`
            ).catch(err => console.error('Email send failed:', err));
        }

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

// PUT add tracking milestone
router.put('/:id/tracking', auth, adminOnly, async (req, res) => {
    try {
        const { status, location, note } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.tracking.push({ status, location, note, timestamp: Date.now() });
        await order.save();

        const populated = await Order.findById(order._id)
            .populate('distributorId', 'name companyName email')
            .populate('items.productId', 'name type pricePerUnit sku');
        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET invoice data for an order
router.get('/:id/invoice', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('distributorId', 'name companyName email phone address gstNumber')
            .populate('items.productId', 'name type pricePerUnit sku');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (req.user.role === 'distributor' && order.distributorId._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        res.json({
            invoiceNumber: order.invoiceNumber || `INV-${order._id.toString().slice(-6).toUpperCase()}`,
            orderDate: order.orderDate,
            distributor: order.distributorId,
            items: order.items.map(i => ({
                name: i.productId?.name,
                sku: i.productId?.sku,
                type: i.productId?.type,
                quantity: i.quantity,
                unitPrice: i.productId?.pricePerUnit,
                total: i.quantity * (i.productId?.pricePerUnit || 0),
                batchId: i.batchId
            })),
            totalAmount: order.totalAmount,
            status: order.status
        });
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
