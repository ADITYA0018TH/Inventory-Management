const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    action: { type: String, required: true }, // e.g., "Created Batch", "Updated Order Status"
    entity: { type: String }, // e.g., "Batch", "Order", "Product"
    entityId: { type: String },
    details: { type: String }, // Human-readable description
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
