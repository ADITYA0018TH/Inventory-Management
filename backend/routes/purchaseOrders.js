const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/PurchaseOrder');
const RawMaterial = require('../models/RawMaterial');
const Supplier = require('../models/Supplier');
const { auth, adminOnly } = require('../middleware/auth');

// POST auto-generate POs for low-stock materials
router.post('/auto-generate', auth, adminOnly, async (req, res) => {
    try {
        // Find materials below minimum threshold
        const lowStockMaterials = await RawMaterial.find({
            $expr: { $lt: ['$currentStock', '$minimumThreshold'] }
        });

        if (lowStockMaterials.length === 0) {
            return res.json({ message: 'All materials are above threshold', generated: [] });
        }

        // Find suppliers linked to these materials
        const suppliers = await Supplier.find({ status: 'Active' }).populate('materials');
        const generatedPOs = [];

        for (const supplier of suppliers) {
            const supplierMaterialIds = supplier.materials.map(m => m._id.toString());
            const matchingMaterials = lowStockMaterials.filter(m =>
                supplierMaterialIds.includes(m._id.toString())
            );

            if (matchingMaterials.length === 0) continue;

            const count = await PurchaseOrder.countDocuments();
            const poNumber = `PO-${new Date().getFullYear()}-${String(count + generatedPOs.length + 1).padStart(4, '0')}`;

            const items = matchingMaterials.map(m => ({
                materialId: m._id,
                quantity: Math.max((m.minimumThreshold * 3) - m.currentStock, m.minimumThreshold),
                unit: m.unit,
                unitPrice: 0
            }));

            const po = new PurchaseOrder({
                poNumber,
                supplierId: supplier._id,
                items,
                status: 'Draft',
                notes: 'Auto-generated from low stock alert'
            });
            await po.save();
            generatedPOs.push(po);
        }

        const populated = await PurchaseOrder.find({ _id: { $in: generatedPOs.map(p => p._id) } })
            .populate('supplierId', 'name contactPerson email')
            .populate('items.materialId', 'name unit');

        res.status(201).json({ message: `Generated ${populated.length} purchase order(s)`, generated: populated });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET all purchase orders
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const pos = await PurchaseOrder.find()
            .populate('supplierId', 'name contactPerson email')
            .populate('items.materialId', 'name unit')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(pos);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST create manual PO
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const { supplierId, items, notes } = req.body;
        const count = await PurchaseOrder.countDocuments();
        const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

        const totalAmount = items.reduce((sum, i) => sum + (i.quantity * (i.unitPrice || 0)), 0);

        const po = new PurchaseOrder({ poNumber, supplierId, items, totalAmount, notes });
        await po.save();

        const populated = await PurchaseOrder.findById(po._id)
            .populate('supplierId', 'name contactPerson email')
            .populate('items.materialId', 'name unit');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT update PO status (approval workflow)
router.put('/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const update = { status: req.body.status };
        if (req.body.status === 'Approved') {
            update.approvedBy = req.user.id;
            update.approvedAt = Date.now();
        }
        if (req.body.status === 'Received') {
            // Auto-update raw material stock on receive
            const po = await PurchaseOrder.findById(req.params.id);
            if (po) {
                for (const item of po.items) {
                    await RawMaterial.findByIdAndUpdate(item.materialId, {
                        $inc: { currentStock: item.quantity },
                        lastUpdated: Date.now()
                    });
                }
            }
        }
        const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, update, { new: true })
            .populate('supplierId', 'name contactPerson email')
            .populate('items.materialId', 'name unit')
            .populate('approvedBy', 'name');
        if (!po) return res.status(404).json({ message: 'PO not found' });
        res.json(po);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
