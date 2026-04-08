const mongoose = require('mongoose');

const ComplianceSnapshotSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    overall: { type: Number },
    testingRate: { type: Number },
    expiryScore: { type: Number },
    storageScore: { type: Number },
    recallScore: { type: Number },
    fulfillmentRate: { type: Number }
});

module.exports = mongoose.model('ComplianceSnapshot', ComplianceSnapshotSchema);
