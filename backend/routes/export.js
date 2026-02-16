const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const RawMaterial = require('../models/RawMaterial');
const Batch = require('../models/Batch');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');

// GET export inventory as CSV
router.get('/inventory', auth, adminOnly, async (req, res) => {
    try {
        const materials = await RawMaterial.find().lean();
        const fields = ['name', 'unit', 'currentStock', 'minimumThreshold', 'supplier', 'lastUpdated'];
        const parser = new Parser({ fields });
        const csv = parser.parse(materials);
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename=inventory.csv');
        res.send(csv);
    } catch (err) {
        res.status(500).json({ message: 'Export failed', error: err.message });
    }
});

// GET export batches as CSV
router.get('/batches', auth, adminOnly, async (req, res) => {
    try {
        const batches = await Batch.find().populate('productId', 'name sku').lean();
        const data = batches.map(b => ({
            batchId: b.batchId,
            product: b.productId?.name || '',
            sku: b.productId?.sku || '',
            quantityProduced: b.quantityProduced,
            mfgDate: b.mfgDate,
            expDate: b.expDate,
            status: b.status
        }));
        const fields = ['batchId', 'product', 'sku', 'quantityProduced', 'mfgDate', 'expDate', 'status'];
        const parser = new Parser({ fields });
        const csv = parser.parse(data);
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename=batches.csv');
        res.send(csv);
    } catch (err) {
        res.status(500).json({ message: 'Export failed', error: err.message });
    }
});

// GET export orders as CSV
router.get('/orders', auth, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('distributorId', 'name companyName')
            .populate('items.productId', 'name sku')
            .lean();
        const data = orders.map(o => ({
            orderId: o._id,
            distributor: o.distributorId?.name || '',
            company: o.distributorId?.companyName || '',
            items: o.items.map(i => `${i.productId?.name} x${i.quantity}`).join('; '),
            totalAmount: o.totalAmount,
            status: o.status,
            orderDate: o.orderDate,
            invoiceNumber: o.invoiceNumber || ''
        }));
        const fields = ['orderId', 'distributor', 'company', 'items', 'totalAmount', 'status', 'orderDate', 'invoiceNumber'];
        const parser = new Parser({ fields });
        const csv = parser.parse(data);
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename=orders.csv');
        res.send(csv);
    } catch (err) {
        res.status(500).json({ message: 'Export failed', error: err.message });
    }
});

module.exports = router;
