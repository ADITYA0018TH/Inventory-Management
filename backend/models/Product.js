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
    }],
    storageConditions: {
        minTemp: { type: Number, default: 15 },
        maxTemp: { type: Number, default: 25 },
        minHumidity: { type: Number, default: 30 },
        maxHumidity: { type: Number, default: 60 }
    },
    // Custom QC test templates per product type
    qcTests: [{
        name: { type: String, required: true },
        description: { type: String }
    }],
    // Cost per unit of raw material used (for batch cost tracking)
    materialCosts: [{
        materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial' },
        costPerUnit: { type: Number, default: 0 }
    }]
});

module.exports = mongoose.model('Product', ProductSchema);
