const jwt = require('jsonwebtoken');

// Verify JWT token
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Check if user is admin
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

// Admin or quality inspector
const qualityAccess = (req, res, next) => {
    if (!['admin', 'quality_inspector'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied.' });
    }
    next();
};

// Admin or warehouse manager
const warehouseAccess = (req, res, next) => {
    if (!['admin', 'warehouse_manager'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied.' });
    }
    next();
};

module.exports = { auth, adminOnly, qualityAccess, warehouseAccess };
