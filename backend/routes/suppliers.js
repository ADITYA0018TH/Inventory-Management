const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const { auth, adminOnly } = require('../middleware/auth');

// GET all suppliers
router.get('/', auth, async (req, res) => {
    try {
        const suppliers = await Supplier.find().populate('materials', 'name unit').sort({ name: 1 });
        res.json(suppliers);
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
