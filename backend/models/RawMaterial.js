const mongoose = require('mongoose');

const RawMaterialSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Paracetamol Powder"
    unit: { type: String, required: true }, // e.g., "kg", "liters"
    currentStock: { type: Number, default: 0 },
    minimumThreshold: { type: Number, default: 10 }, // Triggers alert if stock < 10
    supplier: { type: String },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RawMaterial', RawMaterialSchema);
