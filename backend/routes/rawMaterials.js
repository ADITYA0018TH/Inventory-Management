const express = require('express');
const router = express.Router();
const RawMaterial = require('../models/RawMaterial');
const { auth, adminOnly } = require('../middleware/auth');

// GET all raw materials
router.get('/', auth, async (req, res) => {
    try {
        const materials = await RawMaterial.find().sort({ lastUpdated: -1 });
        res.json(materials);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET low stock alerts (below threshold)
router.get('/alerts', auth, async (req, res) => {
    try {
        const alerts = await RawMaterial.find({
            $expr: { $lt: ['$currentStock', '$minimumThreshold'] }
        });
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST create raw material
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const material = new RawMaterial(req.body);
        await material.save();
        res.status(201).json(material);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT update raw material
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const material = await RawMaterial.findByIdAndUpdate(
            req.params.id,
            { ...req.body, lastUpdated: Date.now() },
            { new: true }
        );
        if (!material) return res.status(404).json({ message: 'Material not found' });
        res.json(material);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT stock-in (add stock)
router.put('/:id/stock-in', auth, adminOnly, async (req, res) => {
    try {
        const { quantity } = req.body;
        const material = await RawMaterial.findByIdAndUpdate(
            req.params.id,
            { $inc: { currentStock: quantity }, lastUpdated: Date.now() },
            { new: true }
        );
        if (!material) return res.status(404).json({ message: 'Material not found' });
        res.json(material);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE raw material
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const material = await RawMaterial.findByIdAndDelete(req.params.id);
        if (!material) return res.status(404).json({ message: 'Material not found' });
        res.json({ message: 'Material deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
