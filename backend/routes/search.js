const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const RawMaterial = require('../models/RawMaterial');
const Batch = require('../models/Batch');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

// GET /api/search?q=term
router.get('/', auth, async (req, res) => {
    try {
        const q = req.query.q;
        if (!q || q.length < 2) return res.json({ products: [], materials: [], batches: [], orders: [] });

        const regex = new RegExp(q, 'i');

        const [products, materials, batches, orders] = await Promise.all([
            Product.find({ $or: [{ name: regex }, { sku: regex }, { description: regex }] })
                .limit(5)
                .select('name type sku pricePerUnit'),
            RawMaterial.find({ $or: [{ name: regex }, { supplier: regex }] })
                .limit(5)
                .select('name unit currentStock supplier'),
            Batch.find({ $or: [{ batchId: regex }] })
                .limit(5)
                .populate('productId', 'name')
                .select('batchId status mfgDate expDate'),
            Order.find()
                .populate('distributorId', 'name companyName')
                .populate('items.productId', 'name')
                .limit(10)
                .then(allOrders => allOrders.filter(o =>
                    o.distributorId?.name?.match(regex) ||
                    o.distributorId?.companyName?.match(regex) ||
                    o.items.some(item => item.productId?.name?.match(regex))
                ).slice(0, 5))
        ]);

        res.json({ products, materials, batches, orders });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
