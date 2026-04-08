const express = require('express');
const router = express.Router();
const QualityCheck = require('../models/QualityCheck');
const Batch = require('../models/Batch');
const Product = require('../models/Product');
const { auth, adminOnly, qualityAccess } = require('../middleware/auth');

// GET all QC records
router.get('/', auth, async (req, res) => {
    try {
        const checks = await QualityCheck.find()
            .populate({ path: 'batchId', populate: { path: 'productId', select: 'name type sku' } })
            .sort({ createdAt: -1 });
        res.json(checks);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET QC for specific batch
router.get('/batch/:batchId', auth, async (req, res) => {
    try {
        const checks = await QualityCheck.find({ batchId: req.params.batchId })
            .populate({ path: 'batchId', populate: { path: 'productId', select: 'name type sku' } })
            .sort({ createdAt: -1 });
        res.json(checks);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET test templates for a batch's product
router.get('/templates/:batchId', auth, async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.batchId).populate('productId', 'name type qcTests');
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        const product = batch.productId;
        // Return product-defined tests or defaults
        const defaultTests = [
            { name: 'Visual Inspection', description: 'Check for physical defects, color, shape' },
            { name: 'pH Level', description: 'Measure acidity/alkalinity' },
            { name: 'Dissolution', description: 'Rate of dissolution in standard medium' },
            { name: 'Assay', description: 'Active ingredient content verification' }
        ];
        const tests = product.qcTests && product.qcTests.length > 0 ? product.qcTests : defaultTests;
        res.json({ product: { name: product.name, type: product.type }, tests });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST submit QC results
router.post('/', auth, qualityAccess, async (req, res) => {
    try {
        const { batchId, inspector, tests, notes } = req.body;

        // Determine overall status
        const allPass = tests.every(t => t.status === 'Pass');
        const anyFail = tests.some(t => t.status === 'Fail');
        const overallStatus = anyFail ? 'Fail' : allPass ? 'Pass' : 'Pending';

        const qc = new QualityCheck({ batchId, inspector, tests, overallStatus, notes });
        await qc.save();

        // If passed, update batch status to Released
        if (overallStatus === 'Pass') {
            await Batch.findByIdAndUpdate(batchId, { status: 'Released' });
        }

        const populated = await QualityCheck.findById(qc._id)
            .populate({ path: 'batchId', populate: { path: 'productId', select: 'name type sku' } });
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT update QC record
router.put('/:id', auth, qualityAccess, async (req, res) => {
    try {
        const qc = await QualityCheck.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate({ path: 'batchId', populate: { path: 'productId', select: 'name type sku' } });
        if (!qc) return res.status(404).json({ message: 'QC record not found' });
        res.json(qc);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
