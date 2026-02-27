const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');
const { logAction } = require('./audit');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, companyName, gstNumber } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name, email, password: hashedPassword,
            role: role || 'distributor',
            companyName, gstNumber
        });
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        await logAction(user._id, user.name, 'Registered', 'User', user._id, `New ${user.role} account created`);

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, companyName: user.companyName }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.isActive) return res.status(403).json({ message: 'Account has been deactivated. Contact admin.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Check if 2FA is enabled
        if (user.twoFactorEnabled) {
            // Return a temporary token that only allows 2FA validation
            const tempToken = jwt.sign(
                { id: user._id, role: user.role, name: user.name, requires2FA: true },
                process.env.JWT_SECRET,
                { expiresIn: '5m' }
            );
            return res.json({ requires2FA: true, tempToken });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        await logAction(user._id, user.name, 'Logged In', 'User', user._id, `${user.role} logged in`);

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, companyName: user.companyName }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, companyName, gstNumber } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, companyName, gstNumber },
            { new: true }
        ).select('-password');
        await logAction(req.user.id, req.user.name, 'Updated Profile', 'User', req.user.id, 'Profile information updated');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT /api/auth/change-password
router.put('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        await logAction(req.user.id, req.user.name, 'Changed Password', 'User', req.user.id, 'Password changed');
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/auth/users (admin only)
router.get('/users', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT /api/auth/users/:id/toggle (admin only)
router.put('/users/:id/toggle', auth, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isActive = !user.isActive;
        await user.save();

        await logAction(req.user.id, req.user.name, user.isActive ? 'Activated User' : 'Deactivated User', 'User', user._id, `${user.email} ${user.isActive ? 'activated' : 'deactivated'}`);
        res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user: { id: user._id, isActive: user.isActive } });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/auth/2fa/setup — generate secret and QR
router.post('/2fa/setup', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.twoFactorEnabled) return res.status(400).json({ message: '2FA is already enabled' });

        const secret = speakeasy.generateSecret({
            name: `PharmaLink (${user.email})`,
            issuer: 'PharmaLink'
        });

        user.twoFactorSecret = secret.base32;
        await user.save();

        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
        res.json({ secret: secret.base32, qrCode: qrCodeUrl });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/auth/2fa/verify — verify token and enable 2FA
router.post('/2fa/verify', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { token } = req.body;

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 2
        });

        if (!verified) return res.status(400).json({ message: 'Invalid verification code' });

        user.twoFactorEnabled = true;
        await user.save();
        await logAction(req.user.id, req.user.name, 'Enabled 2FA', 'User', req.user.id, 'Two-factor authentication enabled');

        res.json({ message: '2FA enabled successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/auth/2fa/validate — validate TOTP on login
router.post('/2fa/validate', async (req, res) => {
    try {
        const { tempToken, token } = req.body;
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

        if (!decoded.requires2FA) return res.status(400).json({ message: 'Invalid request' });

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 2
        });

        if (!verified) return res.status(400).json({ message: 'Invalid 2FA code' });

        const fullToken = jwt.sign(
            { id: user._id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        await logAction(user._id, user.name, 'Logged In (2FA)', 'User', user._id, `${user.role} logged in with 2FA`);

        res.json({
            token: fullToken,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, companyName: user.companyName }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/auth/2fa/disable — disable 2FA
router.post('/2fa/disable', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.twoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        await user.save();
        await logAction(req.user.id, req.user.name, 'Disabled 2FA', 'User', req.user.id, 'Two-factor authentication disabled');
        res.json({ message: '2FA disabled' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
