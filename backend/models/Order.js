const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    distributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true },
        batchId: { type: String } // Filled by Admin when fulfilling order
    }],
    totalAmount: { type: Number },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Shipped', 'Delivered'],
        default: 'Pending'
    },
    orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
