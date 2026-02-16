const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Aster Cold Relief"
    type: { type: String, enum: ['Tablet', 'Syrup', 'Injection'] },
    pricePerUnit: { type: Number, required: true },
    sku: { type: String, unique: true }, // Stock Keeping Unit
    description: { type: String },
    // Formula: What materials are needed for 1 unit?
    formula: [{
        materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial' },
        quantityRequired: { type: Number } // e.g., 0.5 (kg)
    }]
});

module.exports = mongoose.model('Product', ProductSchema);
