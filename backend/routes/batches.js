const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Batch = require('../models/Batch');
const Product = require('../models/Product');
const RawMaterial = require('../models/RawMaterial');
const QRCode = require('qrcode');
const { auth, adminOnly } = require('../middleware/auth');

// GET all batches
router.get('/', auth, async (req, res) => {
    try {
        const batches = await Batch.find().populate('productId', 'name type sku').sort({ mfgDate: -1 });
        res.json(batches);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET expiring batches (next 30 days)
router.get('/expiring', auth, async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const batches = await Batch.find({
            expDate: { $gte: now, $lte: thirtyDaysLater },
            status: { $ne: 'Shipped' }
        }).populate('productId', 'name type');
        res.json(batches);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET single batch by batchId string (for verification)
router.get('/verify/:batchId', async (req, res) => {
    try {
        const batch = await Batch.findOne({ batchId: req.params.batchId })
            .populate('productId', 'name type sku pricePerUnit description');
        if (!batch) return res.status(404).json({ message: 'Batch not found. This product may be counterfeit.', verified: false });
        res.json({ verified: true, batch });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST create batch — THE CORE FORMULA LOGIC
router.post('/', auth, adminOnly, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { batchId, productId, quantityProduced, mfgDate, expDate } = req.body;

        // 1. Get the product with its formula
        const product = await Product.findById(productId).populate('formula.materialId');
        if (!product) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Product not found' });
        }

        // 2. Check if sufficient raw materials exist & deduct
        for (const ingredient of product.formula) {
            const totalRequired = ingredient.quantityRequired * quantityProduced;
            const material = await RawMaterial.findById(ingredient.materialId._id).session(session);

            if (!material) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: `Raw material "${ingredient.materialId.name}" not found in inventory.`
                });
            }

            if (material.currentStock < totalRequired) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: `Insufficient stock for "${material.name}". Need ${totalRequired} ${material.unit}, have ${material.currentStock} ${material.unit}.`
                });
            }

            // Deduct stock
            material.currentStock -= totalRequired;
            material.lastUpdated = Date.now();
            await material.save({ session });
        }

        // 3. Generate QR code data
        const qrData = JSON.stringify({
            batchId,
            product: product.name,
            type: product.type,
            quantityProduced,
            mfgDate,
            expDate,
            manufacturer: 'PharmaLink Pharmaceuticals',
            verified: true
        });
        const qrCodeImage = await QRCode.toDataURL(qrData);

        // 4. Create the batch
        const batch = new Batch({
            batchId, productId, quantityProduced,
            mfgDate, expDate,
            qrCodeData: qrCodeImage
        });
        await batch.save({ session });

        await session.commitTransaction();

        const populatedBatch = await Batch.findById(batch._id).populate('productId', 'name type sku');
        res.status(201).json(populatedBatch);
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Server error', error: err.message });
    } finally {
        session.endSession();
    }
});

// PUT update batch status
router.put('/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const batch = await Batch.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        ).populate('productId', 'name type sku');
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        res.json(batch);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
