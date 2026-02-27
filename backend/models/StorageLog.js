const mongoose = require('mongoose');

const StorageLogSchema = new mongoose.Schema({
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    recordedAt: { type: Date, default: Date.now },
    isViolation: { type: Boolean, default: false },
    violationDetails: { type: String },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('StorageLog', StorageLogSchema);
