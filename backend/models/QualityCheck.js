const mongoose = require('mongoose');

const QualityCheckSchema = new mongoose.Schema({
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    inspector: { type: String, required: true },
    testDate: { type: Date, default: Date.now },
    tests: [{
        name: { type: String, required: true },
        result: { type: String, required: true },
        status: { type: String, enum: ['Pass', 'Fail'], required: true }
    }],
    overallStatus: { type: String, enum: ['Pass', 'Fail', 'Pending'], default: 'Pending' },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QualityCheck', QualityCheckSchema);
