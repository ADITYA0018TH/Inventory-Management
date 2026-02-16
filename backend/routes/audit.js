const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { auth, adminOnly } = require('../middleware/auth');

// Helper function to log actions (used by other routes)
const logAction = async (userId, userName, action, entity, entityId, details) => {
    try {
        await AuditLog.create({ userId, userName, action, entity, entityId, details });
    } catch (err) {
        console.error('Audit log error:', err.message);
    }
};

// GET audit logs (admin only, paginated)
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            AuditLog.find()
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit),
            AuditLog.countDocuments()
        ]);

        res.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
module.exports.logAction = logAction;
