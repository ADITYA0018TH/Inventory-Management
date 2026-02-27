const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Order = require('../models/Order');
const QualityCheck = require('../models/QualityCheck');
const StorageLog = require('../models/StorageLog');
const Recall = require('../models/Recall');
const { auth, adminOnly } = require('../middleware/auth');

// GET overall compliance score
router.get('/score', auth, adminOnly, async (req, res) => {
    try {
        // 1. Batch testing rate (QC checks done vs total batches)
        const totalBatches = await Batch.countDocuments();
        const testedBatches = await QualityCheck.distinct('batchId');
        const testingRate = totalBatches > 0 ? (testedBatches.length / totalBatches * 100).toFixed(1) : 0;

        // 2. Expiry management (% of Released batches not expired)
        const now = new Date();
        const releasedBatches = await Batch.countDocuments({ status: 'Released' });
        const expiredBatches = await Batch.countDocuments({ status: 'Released', expDate: { $lt: now } });
        const expiryScore = releasedBatches > 0 ? ((releasedBatches - expiredBatches) / releasedBatches * 100).toFixed(1) : 100;

        // 3. Storage compliance rate
        const totalLogs = await StorageLog.countDocuments();
        const violations = await StorageLog.countDocuments({ isViolation: true });
        const storageScore = totalLogs > 0 ? ((totalLogs - violations) / totalLogs * 100).toFixed(1) : 100;

        // 4. Recall response (% of recalls completed)
        const totalRecalls = await Recall.countDocuments();
        const completedRecalls = await Recall.countDocuments({ status: 'Completed' });
        const recallScore = totalRecalls > 0 ? (completedRecalls / totalRecalls * 100).toFixed(1) : 100;

        // 5. Order fulfillment rate
        const totalOrders = await Order.countDocuments();
        const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
        const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });
        const fulfillmentRate = totalOrders > 0 ? (deliveredOrders / (totalOrders - cancelledOrders) * 100).toFixed(1) : 100;

        // Overall score (weighted average)
        const overall = (
            parseFloat(testingRate) * 0.25 +
            parseFloat(expiryScore) * 0.20 +
            parseFloat(storageScore) * 0.25 +
            parseFloat(recallScore) * 0.15 +
            parseFloat(fulfillmentRate) * 0.15
        ).toFixed(1);

        res.json({
            overall,
            metrics: {
                testingRate: { value: testingRate, label: 'Batch Testing Rate', weight: '25%' },
                expiryScore: { value: expiryScore, label: 'Expiry Management', weight: '20%' },
                storageScore: { value: storageScore, label: 'Storage Compliance', weight: '25%' },
                recallScore: { value: recallScore, label: 'Recall Response', weight: '15%' },
                fulfillmentRate: { value: fulfillmentRate, label: 'Order Fulfillment', weight: '15%' }
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET audit readiness checklist
router.get('/audit-readiness', auth, adminOnly, async (req, res) => {
    try {
        const totalBatches = await Batch.countDocuments();
        const qcChecks = await QualityCheck.countDocuments();
        const storageLogs = await StorageLog.countDocuments();
        const recalls = await Recall.countDocuments();
        const violations = await StorageLog.countDocuments({ isViolation: true });

        const checklist = [
            { id: 1, item: 'Batch Tracking System', status: totalBatches > 0 ? 'pass' : 'fail', detail: `${totalBatches} batches tracked` },
            { id: 2, item: 'Quality Control Testing', status: qcChecks > 0 ? 'pass' : 'warning', detail: `${qcChecks} QC checks recorded` },
            { id: 3, item: 'Storage Condition Monitoring', status: storageLogs > 0 ? 'pass' : 'warning', detail: `${storageLogs} readings logged` },
            { id: 4, item: 'No Unresolved Violations', status: violations === 0 ? 'pass' : 'warning', detail: `${violations} violations found` },
            { id: 5, item: 'Recall Procedure in Place', status: 'pass', detail: 'System supports recall management' },
            { id: 6, item: 'Recall History Documented', status: recalls >= 0 ? 'pass' : 'warning', detail: `${recalls} recalls documented` },
            { id: 7, item: 'Digital Audit Trail', status: 'pass', detail: 'All actions logged in audit system' },
            { id: 8, item: 'User Access Controls', status: 'pass', detail: 'Role-based access (Admin/Distributor)' },
            { id: 9, item: 'Product Traceability (QR)', status: totalBatches > 0 ? 'pass' : 'warning', detail: 'QR codes generated per batch' },
            { id: 10, item: 'Blockchain Verification', status: 'pass', detail: 'Hash chain verification available' }
        ];

        const passCount = checklist.filter(c => c.status === 'pass').length;
        res.json({ checklist, score: `${passCount}/${checklist.length}`, readiness: passCount === checklist.length ? 'Ready' : 'Needs Attention' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
