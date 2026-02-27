const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');

// GET demand prediction for a product using Simple Moving Average
router.get('/predict/:productId', auth, adminOnly, async (req, res) => {
    try {
        const { productId } = req.params;
        const months = 12;
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - months, 1);

        const pipeline = await Order.aggregate([
            { $match: { orderDate: { $gte: start }, status: { $in: ['Approved', 'Shipped', 'Delivered'] } } },
            { $unwind: '$items' },
            { $match: { 'items.productId': require('mongoose').Types.ObjectId.createFromHexString(productId) } },
            {
                $group: {
                    _id: { year: { $year: '$orderDate' }, month: { $month: '$orderDate' } },
                    totalQuantity: { $sum: '$items.quantity' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Build monthly data
        const monthlyData = [];
        for (let i = 0; i < months; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const found = pipeline.find(p => p._id.year === y && p._id.month === m);
            monthlyData.push({
                month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
                actual: found ? found.totalQuantity : 0
            });
        }

        // Simple Moving Average (window=3)
        const window = 3;
        for (let i = 0; i < monthlyData.length; i++) {
            if (i < window) {
                monthlyData[i].predicted = null;
            } else {
                const avg = (monthlyData[i - 1].actual + monthlyData[i - 2].actual + monthlyData[i - 3].actual) / window;
                monthlyData[i].predicted = Math.round(avg);
            }
        }

        // Predict next 3 months
        const forecast = [];
        const lastActuals = monthlyData.slice(-window).map(d => d.actual);
        for (let i = 1; i <= 3; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const avg = Math.round(lastActuals.reduce((a, b) => a + b, 0) / window);
            forecast.push({
                month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
                predicted: avg,
                actual: null
            });
            lastActuals.shift();
            lastActuals.push(avg);
        }

        const product = await Product.findById(productId, 'name type');
        res.json({ product, historical: monthlyData, forecast, window });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET predictions for all products
router.get('/all', auth, adminOnly, async (req, res) => {
    try {
        const products = await Product.find({}, 'name type');
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

        const pipeline = await Order.aggregate([
            { $match: { orderDate: { $gte: threeMonthsAgo }, status: { $in: ['Approved', 'Shipped', 'Delivered'] } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    avgMonthlyDemand: { $avg: '$items.quantity' },
                    totalOrdered: { $sum: '$items.quantity' },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        const predictions = products.map(p => {
            const data = pipeline.find(d => d._id.toString() === p._id.toString());
            return {
                product: p,
                avgMonthlyDemand: data ? Math.round(data.avgMonthlyDemand) : 0,
                totalOrdered: data ? data.totalOrdered : 0,
                predictedNextMonth: data ? Math.round(data.avgMonthlyDemand) : 0,
                trend: data && data.avgMonthlyDemand > 0 ? 'Active' : 'Low'
            };
        });

        res.json(predictions);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
