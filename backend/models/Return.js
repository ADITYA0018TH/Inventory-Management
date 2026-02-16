const mongoose = require('mongoose');

const ReturnSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    distributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    batchId: { type: String },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    reason: { type: String, required: true },
    type: { type: String, enum: ['Return', 'Recall'], required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Completed'], default: 'Pending' },
    quantity: { type: Number, required: true },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date }
});

module.exports = mongoose.model('Return', ReturnSchema);
