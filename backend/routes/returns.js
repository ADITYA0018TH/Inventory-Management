const express = require('express');
const router = express.Router();
const Return = require('../models/Return');
const { auth, adminOnly } = require('../middleware/auth');

// GET all returns/recalls
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'distributor') query.distributorId = req.user.id;
        const returns = await Return.find(query)
            .populate('orderId', 'totalAmount status orderDate')
            .populate('distributorId', 'name companyName email')
            .populate('productId', 'name type sku')
            .sort({ createdAt: -1 });
        res.json(returns);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST create return request (distributor) or recall (admin)
router.post('/', auth, async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.user.role === 'distributor') {
            data.distributorId = req.user.id;
            data.type = 'Return';
        }
        const ret = new Return(data);
        await ret.save();
        const populated = await Return.findById(ret._id)
            .populate('orderId', 'totalAmount status orderDate')
            .populate('distributorId', 'name companyName email')
            .populate('productId', 'name type sku');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT update return status (admin)
router.put('/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const update = { status: req.body.status };
        if (req.body.status === 'Completed' || req.body.status === 'Rejected') {
            update.resolvedAt = Date.now();
        }
        if (req.body.notes) update.notes = req.body.notes;
        const ret = await Return.findByIdAndUpdate(req.params.id, update, { new: true })
            .populate('orderId', 'totalAmount status orderDate')
            .populate('distributorId', 'name companyName email')
            .populate('productId', 'name type sku');
        if (!ret) return res.status(404).json({ message: 'Return not found' });
        res.json(ret);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
