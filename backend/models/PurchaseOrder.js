const mongoose = require('mongoose');

const PurchaseOrderSchema = new mongoose.Schema({
    poNumber: { type: String, required: true, unique: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    items: [{
        materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial' },
        quantity: { type: Number, required: true },
        unit: { type: String },
        unitPrice: { type: Number, default: 0 }
    }],
    totalAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Approved', 'Sent', 'Received'], default: 'Draft' },
    createdAt: { type: Date, default: Date.now },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    notes: { type: String }
});

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
