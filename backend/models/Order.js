const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    distributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true },
        batchId: { type: String }
    }],
    totalAmount: { type: Number },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    invoiceNumber: { type: String },
    tracking: [{
        status: { type: String, required: true },
        location: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String }
    }],
    orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
