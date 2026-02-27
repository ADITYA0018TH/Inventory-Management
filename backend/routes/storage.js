const express = require('express');
const router = express.Router();
const StorageLog = require('../models/StorageLog');
const Batch = require('../models/Batch');
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');

// POST log a storage reading
router.post('/log', auth, adminOnly, async (req, res) => {
    try {
        const { batchId, warehouseId, temperature, humidity } = req.body;

        const batch = await Batch.findById(batchId).populate('productId');
        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        const product = batch.productId;
        let isViolation = false;
        let violationDetails = '';
        const sc = product.storageConditions || {};

        if (temperature < (sc.minTemp || 15) || temperature > (sc.maxTemp || 25)) {
            isViolation = true;
            violationDetails += `Temperature ${temperature}°C out of range (${sc.minTemp || 15}-${sc.maxTemp || 25}°C). `;
        }
        if (humidity < (sc.minHumidity || 30) || humidity > (sc.maxHumidity || 60)) {
            isViolation = true;
            violationDetails += `Humidity ${humidity}% out of range (${sc.minHumidity || 30}-${sc.maxHumidity || 60}%). `;
        }

        const log = new StorageLog({
            batchId, warehouseId: warehouseId || undefined,
            temperature, humidity,
            isViolation, violationDetails: violationDetails.trim(),
            recordedBy: req.user.id
        });
        await log.save();
        res.status(201).json(log);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET storage logs for a batch
router.get('/logs/:batchId', auth, async (req, res) => {
    try {
        const logs = await StorageLog.find({ batchId: req.params.batchId })
            .populate('warehouseId', 'name')
            .sort({ recordedAt: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET all violations
router.get('/violations', auth, adminOnly, async (req, res) => {
    try {
        const violations = await StorageLog.find({ isViolation: true })
            .populate({ path: 'batchId', populate: { path: 'productId', select: 'name type' }, select: 'batchId' })
            .populate('warehouseId', 'name')
            .sort({ recordedAt: -1 })
            .limit(100);
        res.json(violations);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET storage summary stats
router.get('/stats', auth, adminOnly, async (req, res) => {
    try {
        const totalLogs = await StorageLog.countDocuments();
        const totalViolations = await StorageLog.countDocuments({ isViolation: true });
        const complianceRate = totalLogs > 0 ? ((totalLogs - totalViolations) / totalLogs * 100).toFixed(1) : 100;
        const recentViolations = await StorageLog.find({ isViolation: true })
            .sort({ recordedAt: -1 }).limit(5)
            .populate({ path: 'batchId', populate: { path: 'productId', select: 'name' }, select: 'batchId' });
        res.json({ totalLogs, totalViolations, complianceRate, recentViolations });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
