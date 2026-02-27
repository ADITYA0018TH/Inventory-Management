const mongoose = require('mongoose');

const WarehouseStockSchema = new mongoose.Schema({
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
    quantity: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate warehouse-material combos
WarehouseStockSchema.index({ warehouseId: 1, materialId: 1 }, { unique: true });

module.exports = mongoose.model('WarehouseStock', WarehouseStockSchema);
