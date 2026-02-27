const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Should be hashed in a real app
    role: {
        type: String,
        enum: ['admin', 'distributor'],
        default: 'distributor'
    },
    companyName: { type: String }, // For distributors
    gstNumber: { type: String },   // Optional
    isActive: { type: Boolean, default: true },
    twoFactorSecret: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
