const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// GET user's notifications
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        const unreadCount = await Notification.countDocuments({ userId: req.user.id, read: false });
        res.json({ notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT mark single notification as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ message: 'Marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT mark all as read
router.put('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
        res.json({ message: 'All marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Helper function to create and emit notification
async function createNotification(io, userId, type, title, message, link = '') {
    try {
        const notification = new Notification({ userId, type, title, message, link });
        await notification.save();
        if (io) {
            io.to(userId.toString()).emit('notification', notification);
        }
        return notification;
    } catch (err) {
        console.error('Failed to create notification:', err.message);
    }
}

module.exports = router;
module.exports.createNotification = createNotification;
