const express = require('express');
const router = express.Router();
const Recall = require('../models/Recall');
const Batch = require('../models/Batch');
const Order = require('../models/Order');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

// POST initiate recall
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const { batchId, reason, severity, notes } = req.body;
        const batch = await Batch.findById(batchId).populate('productId', 'name');
        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        // Find affected distributors from orders containing this batch
        const orders = await Order.find({ 'items.batchId': batch.batchId }).populate('distributorId', 'name email companyName');
        const affectedDistributorIds = [...new Set(orders.map(o => o.distributorId?._id?.toString()).filter(Boolean))];

        const count = await Recall.countDocuments();
        const recallId = `RCL-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

        const recall = new Recall({
            recallId,
            batchId: batch._id,
            productId: batch.productId._id,
            reason,
            severity,
            notes,
            initiatedBy: req.user.id,
            affectedDistributors: affectedDistributorIds
        });
        await recall.save();

        // Notify affected distributors via email
        const uniqueDistributors = orders.reduce((acc, o) => {
            if (o.distributorId && !acc.find(d => d._id.toString() === o.distributorId._id.toString())) {
                acc.push(o.distributorId);
            }
            return acc;
        }, []);

        for (const dist of uniqueDistributors) {
            sendEmail(
                dist.email,
                `⚠️ PRODUCT RECALL — ${severity} — ${batch.productId.name}`,
                `<h2>PharmaLink Product Recall Notice</h2>
                <p>Dear ${dist.name},</p>
                <p>A <strong>${severity}</strong> recall has been initiated for:</p>
                <ul>
                    <li><strong>Product:</strong> ${batch.productId.name}</li>
                    <li><strong>Batch:</strong> ${batch.batchId}</li>
                    <li><strong>Reason:</strong> ${reason}</li>
                    <li><strong>Recall ID:</strong> ${recallId}</li>
                </ul>
                <p>Please stop all distribution of this batch immediately and contact us for return instructions.</p>
                <p>— PharmaLink Team</p>`
            ).catch(err => console.error('Recall email failed:', err));
        }

        const populated = await Recall.findById(recall._id)
            .populate('batchId', 'batchId')
            .populate('productId', 'name type')
            .populate('initiatedBy', 'name')
            .populate('affectedDistributors', 'name email companyName');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET all recalls
router.get('/', auth, async (req, res) => {
    try {
        const recalls = await Recall.find()
            .populate('batchId', 'batchId')
            .populate('productId', 'name type')
            .populate('initiatedBy', 'name')
            .populate('affectedDistributors', 'name email companyName')
            .sort({ initiatedAt: -1 });
        res.json(recalls);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT update recall status
router.put('/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const update = { status: req.body.status };
        if (req.body.status === 'Completed') update.completedAt = Date.now();
        const recall = await Recall.findByIdAndUpdate(req.params.id, update, { new: true })
            .populate('batchId', 'batchId')
            .populate('productId', 'name type')
            .populate('affectedDistributors', 'name email companyName');
        if (!recall) return res.status(404).json({ message: 'Recall not found' });
        res.json(recall);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET affected distributors for a recall
router.get('/:id/affected', auth, async (req, res) => {
    try {
        const recall = await Recall.findById(req.params.id)
            .populate('affectedDistributors', 'name email companyName phone');
        if (!recall) return res.status(404).json({ message: 'Recall not found' });
        res.json(recall.affectedDistributors);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
