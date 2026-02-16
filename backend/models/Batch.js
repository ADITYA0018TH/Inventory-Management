const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
    batchId: { type: String, required: true, unique: true }, // e.g., "AST-2026-001"
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantityProduced: { type: Number, required: true },
    mfgDate: { type: Date, required: true },
    expDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['In Production', 'Quality Check', 'Released', 'Shipped'],
        default: 'In Production'
    },
    qrCodeData: { type: String } // The string encoded in the QR
});

module.exports = mongoose.model('Batch', BatchSchema);
