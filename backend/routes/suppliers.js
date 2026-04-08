const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const { auth, adminOnly } = require('../middleware/auth');

// Helper: auto-calculate supplier rating from PO history
async function calcAutoRating(supplierId) {
    const pos = await PurchaseOrder.find({ supplierId, status: 'Received' });
    if (pos.length === 0) return null;

    // Score based on: % of POs received (vs sent), avg items fulfilled
    const allPos = await PurchaseOrder.find({ supplierId });
    const receivedCount = pos.length;
    const totalSent = allPos.filter(p => ['Sent', 'Received'].includes(p.status)).length;
    const deliveryRate = totalSent > 0 ? receivedCount / totalSent : 1;

    // Map delivery rate to 1-5 scale
    const rating = Math.min(5, Math.max(1, Math.round(deliveryRate * 5)));
    return rating;
}

// GET all suppliers with auto-rating
router.get('/', auth, async (req, res) => {
    try {
        const suppliers = await Supplier.find().populate('materials', 'name unit').sort({ name: 1 });
        // Attach auto-rating to each supplier
        const withRatings = await Promise.all(suppliers.map(async (s) => {
            const autoRating = await calcAutoRating(s._id);
            const obj = s.toObject();
            obj.autoRating = autoRating;
            obj.effectiveRating = autoRating !== null ? autoRating : s.rating;
            return obj;
        }));
        res.json(withRatings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET supplier performance details
router.get('/:id/performance', auth, async (req, res) => {
    try {
        const pos = await PurchaseOrder.find({ supplierId: req.params.id })
            .populate('items.materialId', 'name unit')
            .sort({ createdAt: -1 });

        const total = pos.length;
        const received = pos.filter(p => p.status === 'Received').length;
        const pending = pos.filter(p => ['Draft', 'Approved', 'Sent'].includes(p.status)).length;
        const totalValue = pos.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        const deliveryRate = total > 0 ? ((received / total) * 100).toFixed(1) : 0;

        res.json({ total, received, pending, totalValue, deliveryRate, recentOrders: pos.slice(0, 5) });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST create supplier
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const supplier = new Supplier(req.body);
        await supplier.save();
        const populated = await Supplier.findById(supplier._id).populate('materials', 'name unit');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT update supplier
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('materials', 'name unit');
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        res.json(supplier);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE supplier
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        res.json({ message: 'Supplier deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
