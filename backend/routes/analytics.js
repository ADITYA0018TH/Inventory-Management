const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');

// GET ABC Analysis
router.get('/abc', auth, adminOnly, async (req, res) => {
    try {
        // Aggregate revenue per product from all non-cancelled orders
        const pipeline = await Order.aggregate([
            { $match: { status: { $in: ['Approved', 'Shipped', 'Delivered'] } } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$items.productId',
                    name: { $first: '$product.name' },
                    type: { $first: '$product.type' },
                    sku: { $first: '$product.sku' },
                    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$product.pricePerUnit'] } },
                    totalQuantity: { $sum: '$items.quantity' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        const totalRevenue = pipeline.reduce((sum, p) => sum + p.totalRevenue, 0);
        let cumulativeRevenue = 0;

        const classified = pipeline.map(p => {
            cumulativeRevenue += p.totalRevenue;
            const cumulativePercentage = totalRevenue > 0 ? (cumulativeRevenue / totalRevenue) * 100 : 0;
            let category;
            if (cumulativePercentage <= 80) category = 'A';
            else if (cumulativePercentage <= 95) category = 'B';
            else category = 'C';

            return {
                ...p,
                revenuePercentage: totalRevenue > 0 ? ((p.totalRevenue / totalRevenue) * 100).toFixed(1) : 0,
                cumulativePercentage: cumulativePercentage.toFixed(1),
                category
            };
        });

        const summary = {
            A: classified.filter(p => p.category === 'A').length,
            B: classified.filter(p => p.category === 'B').length,
            C: classified.filter(p => p.category === 'C').length,
            totalRevenue
        };

        res.json({ products: classified, summary });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
