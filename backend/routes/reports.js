const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Batch = require('../models/Batch');
const RawMaterial = require('../models/RawMaterial');
const { auth, adminOnly } = require('../middleware/auth');

// GET sales trend — monthly revenue from orders
router.get('/sales-trend', auth, adminOnly, async (req, res) => {
    try {
        const months = 12;
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

        const pipeline = await Order.aggregate([
            { $match: { orderDate: { $gte: start }, status: { $in: ['Approved', 'Shipped', 'Delivered'] } } },
            {
                $group: {
                    _id: { year: { $year: '$orderDate' }, month: { $month: '$orderDate' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const data = [];
        for (let i = 0; i < months; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const found = pipeline.find(p => p._id.year === y && p._id.month === m);
            data.push({
                month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
                revenue: found ? found.revenue : 0,
                orders: found ? found.orders : 0
            });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET production volume — monthly units produced
router.get('/production', auth, adminOnly, async (req, res) => {
    try {
        const months = 12;
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

        const pipeline = await Batch.aggregate([
            { $match: { mfgDate: { $gte: start } } },
            {
                $group: {
                    _id: { year: { $year: '$mfgDate' }, month: { $month: '$mfgDate' } },
                    totalUnits: { $sum: '$quantityProduced' },
                    batches: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const data = [];
        for (let i = 0; i < months; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const found = pipeline.find(p => p._id.year === y && p._id.month === m);
            data.push({
                month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
                totalUnits: found ? found.totalUnits : 0,
                batches: found ? found.batches : 0
            });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET stock consumption — current stock levels
router.get('/stock-consumption', auth, adminOnly, async (req, res) => {
    try {
        const materials = await RawMaterial.find().sort({ name: 1 });
        const data = materials.map(m => ({
            name: m.name,
            currentStock: m.currentStock,
            threshold: m.minimumThreshold,
            unit: m.unit,
            usage: Math.max(0, m.minimumThreshold * 5 - m.currentStock) // estimated usage
        }));
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
