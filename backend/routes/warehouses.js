const express = require('express');
const router = express.Router();
const Warehouse = require('../models/Warehouse');
const WarehouseStock = require('../models/WarehouseStock');
const RawMaterial = require('../models/RawMaterial');
const { auth, adminOnly } = require('../middleware/auth');

// GET all warehouses
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const warehouses = await Warehouse.find().populate('managerId', 'name').sort({ createdAt: -1 });
        // Attach stock count per warehouse
        const result = [];
        for (const wh of warehouses) {
            const stockItems = await WarehouseStock.countDocuments({ warehouseId: wh._id });
            const totalQty = await WarehouseStock.aggregate([
                { $match: { warehouseId: wh._id } },
                { $group: { _id: null, total: { $sum: '$quantity' } } }
            ]);
            result.push({
                ...wh.toObject(),
                stockItems,
                totalQuantity: totalQty.length > 0 ? totalQty[0].total : 0
            });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST create warehouse
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const { name, location, capacity, managerId } = req.body;
        const warehouse = new Warehouse({ name, location, capacity, managerId });
        await warehouse.save();
        res.status(201).json(warehouse);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT update warehouse
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
        res.json(warehouse);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET stock levels for a warehouse
router.get('/:id/stock', auth, adminOnly, async (req, res) => {
    try {
        const stock = await WarehouseStock.find({ warehouseId: req.params.id })
            .populate('materialId', 'name unit currentStock minimumThreshold');
        res.json(stock);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST add/update stock in a warehouse
router.post('/:id/stock', auth, adminOnly, async (req, res) => {
    try {
        const { materialId, quantity } = req.body;
        const stock = await WarehouseStock.findOneAndUpdate(
            { warehouseId: req.params.id, materialId },
            { $inc: { quantity }, lastUpdated: Date.now() },
            { upsert: true, new: true }
        );
        res.json(stock);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST inter-warehouse transfer
router.post('/transfer', auth, adminOnly, async (req, res) => {
    try {
        const { fromWarehouseId, toWarehouseId, materialId, quantity } = req.body;

        // Deduct from source
        const source = await WarehouseStock.findOne({ warehouseId: fromWarehouseId, materialId });
        if (!source || source.quantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock in source warehouse' });
        }

        source.quantity -= quantity;
        source.lastUpdated = Date.now();
        await source.save();

        // Add to destination
        await WarehouseStock.findOneAndUpdate(
            { warehouseId: toWarehouseId, materialId },
            { $inc: { quantity }, lastUpdated: Date.now() },
            { upsert: true, new: true }
        );

        res.json({ message: `Transferred ${quantity} units successfully` });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
