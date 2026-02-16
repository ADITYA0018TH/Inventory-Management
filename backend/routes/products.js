const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');

// GET all products
router.get('/', auth, async (req, res) => {
    try {
        const products = await Product.find().populate('formula.materialId', 'name unit currentStock');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET single product
router.get('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('formula.materialId', 'name unit currentStock');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST create product
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        const populated = await product.populate('formula.materialId', 'name unit currentStock');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT update product
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('formula.materialId', 'name unit currentStock');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE product
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
