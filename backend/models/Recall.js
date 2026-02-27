const mongoose = require('mongoose');

const RecallSchema = new mongoose.Schema({
    recallId: { type: String, required: true, unique: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    reason: { type: String, required: true },
    severity: { type: String, enum: ['Class I', 'Class II', 'Class III'], required: true },
    status: { type: String, enum: ['Initiated', 'In Progress', 'Completed'], default: 'Initiated' },
    affectedDistributors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    initiatedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    notes: { type: String }
});

module.exports = mongoose.model('Recall', RecallSchema);
