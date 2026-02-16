const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// GET conversations — list users I've messaged with
router.get('/conversations', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const messages = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        }).sort({ createdAt: -1 });

        // Build unique conversation partners
        const seen = new Set();
        const partnerIds = [];
        for (const m of messages) {
            const partnerId = m.senderId.toString() === userId ? m.receiverId.toString() : m.senderId.toString();
            if (!seen.has(partnerId)) {
                seen.add(partnerId);
                partnerIds.push(partnerId);
            }
        }

        const users = await User.find({ _id: { $in: partnerIds } }).select('name email role companyName');
        const conversations = users.map(u => {
            const lastMsg = messages.find(m =>
                (m.senderId.toString() === u._id.toString() && m.receiverId.toString() === userId) ||
                (m.receiverId.toString() === u._id.toString() && m.senderId.toString() === userId)
            );
            const unread = messages.filter(m =>
                m.senderId.toString() === u._id.toString() && m.receiverId.toString() === userId && !m.read
            ).length;
            return {
                user: u,
                lastMessage: lastMsg?.content || '',
                lastMessageTime: lastMsg?.createdAt,
                unread
            };
        });

        res.json(conversations);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET users available to chat with
router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.id } }).select('name email role companyName');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET messages with a specific user
router.get('/:userId', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { senderId: req.user.id, receiverId: req.params.userId },
                { senderId: req.params.userId, receiverId: req.user.id }
            ]
        }).sort({ createdAt: 1 });

        // Mark received messages as read
        await Message.updateMany(
            { senderId: req.params.userId, receiverId: req.user.id, read: false },
            { read: true }
        );

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST send message
router.post('/', auth, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const message = new Message({ senderId: req.user.id, receiverId, content });
        await message.save();
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET unread count
router.get('/unread/count', auth, async (req, res) => {
    try {
        const count = await Message.countDocuments({ receiverId: req.user.id, read: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
