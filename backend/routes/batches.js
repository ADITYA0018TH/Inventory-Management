const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const crypto = require('crypto');
const Batch = require('../models/Batch');
const Product = require('../models/Product');
const RawMaterial = require('../models/RawMaterial');
const QRCode = require('qrcode');
const { auth, adminOnly } = require('../middleware/auth');

// Helper: generate SHA-256 hash for blockchain
function generateHash(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

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

// GET expiry heatmap — batches grouped by 30/60/90 day windows
router.get('/expiry-heatmap', auth, adminOnly, async (req, res) => {
    try {
        const now = new Date();
        const d30 = new Date(now.getTime() + 30 * 86400000);
        const d60 = new Date(now.getTime() + 60 * 86400000);
        const d90 = new Date(now.getTime() + 90 * 86400000);

        const [critical, warning, caution, expired] = await Promise.all([
            Batch.find({ expDate: { $gte: now, $lte: d30 }, status: { $nin: ['Shipped'] } }).populate('productId', 'name type'),
            Batch.find({ expDate: { $gt: d30, $lte: d60 }, status: { $nin: ['Shipped'] } }).populate('productId', 'name type'),
            Batch.find({ expDate: { $gt: d60, $lte: d90 }, status: { $nin: ['Shipped'] } }).populate('productId', 'name type'),
            Batch.find({ expDate: { $lt: now }, status: { $nin: ['Shipped'] } }).populate('productId', 'name type')
        ]);

        res.json({ expired, critical, warning, caution });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET FEFO suggestion for a product — batches sorted by earliest expiry
router.get('/fefo-suggest/:productId', auth, async (req, res) => {
    try {
        const batches = await Batch.find({
            productId: req.params.productId,
            status: 'Released',
            expDate: { $gte: new Date() }
        }).sort({ expDate: 1 }).populate('productId', 'name type');
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

        // 4. Create the batch with genesis hash block
        const genesisData = { batchId, productId, quantityProduced, mfgDate, expDate, event: 'Created', timestamp: Date.now() };
        const genesisHash = generateHash(genesisData);

        const batch = new Batch({
            batchId, productId, quantityProduced,
            mfgDate, expDate,
            qrCodeData: qrCodeImage,
            hashChain: [{
                event: 'Batch Created',
                hash: genesisHash,
                previousHash: '0',
                timestamp: Date.now(),
                actor: req.user.name || 'Admin'
            }]
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

// PUT update batch status — with blockchain hash chain
router.put('/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        const previousHash = batch.hashChain.length > 0 ? batch.hashChain[batch.hashChain.length - 1].hash : '0';
        const newData = { batchId: batch.batchId, event: `Status: ${req.body.status}`, previousHash, timestamp: Date.now() };
        const newHash = generateHash(newData);

        batch.status = req.body.status;
        batch.hashChain.push({
            event: `Status changed to ${req.body.status}`,
            hash: newHash,
            previousHash,
            timestamp: Date.now(),
            actor: req.user.name || 'Admin'
        });
        await batch.save();

        const populated = await Batch.findById(batch._id).populate('productId', 'name type sku');
        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET hash chain for a batch
router.get('/:id/chain', auth, async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id, 'batchId hashChain').populate('productId', 'name');
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        res.json({ batchId: batch.batchId, chain: batch.hashChain });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET verify chain integrity
router.get('/:id/verify-chain', auth, async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id, 'batchId hashChain');
        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        let isValid = true;
        const chain = batch.hashChain;
        for (let i = 1; i < chain.length; i++) {
            if (chain[i].previousHash !== chain[i - 1].hash) {
                isValid = false;
                break;
            }
        }

        res.json({ batchId: batch.batchId, chainLength: chain.length, isValid, message: isValid ? 'Supply chain integrity verified ✓' : 'WARNING: Chain integrity compromised!' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
