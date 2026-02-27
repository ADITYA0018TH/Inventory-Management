const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

// GET generate PDF invoice for an order
router.get('/:orderId/pdf', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('distributorId', 'name companyName email gstNumber address')
            .populate('items.productId', 'name type pricePerUnit sku');

        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (req.user.role === 'distributor' && order.distributorId._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice-${order.invoiceNumber || order._id}.pdf`);
        doc.pipe(res);

        // --- Header ---
        doc.fontSize(24).font('Helvetica-Bold').fillColor('#1a56db')
            .text('PharmaLink', 50, 50);
        doc.fontSize(9).font('Helvetica').fillColor('#666')
            .text('Pharmaceutical Supply Chain Management', 50, 78);
        doc.fontSize(9).text('Email: admin@pharmalink.com | Phone: +91-9876543210', 50, 90);

        // Invoice title
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#333')
            .text('TAX INVOICE', 400, 50, { align: 'right' });
        doc.fontSize(10).font('Helvetica').fillColor('#666')
            .text(`Invoice #: ${order.invoiceNumber || 'N/A'}`, 400, 75, { align: 'right' });
        doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString('en-IN')}`, 400, 90, { align: 'right' });
        doc.text(`Status: ${order.status}`, 400, 105, { align: 'right' });

        // Divider
        doc.moveTo(50, 125).lineTo(545, 125).strokeColor('#ddd').stroke();

        // Bill To section
        const dist = order.distributorId;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#333')
            .text('BILL TO:', 50, 140);
        doc.fontSize(10).font('Helvetica').fillColor('#555');
        let yPos = 155;
        if (dist?.companyName) { doc.text(dist.companyName, 50, yPos); yPos += 14; }
        if (dist?.name) { doc.text(dist.name, 50, yPos); yPos += 14; }
        if (dist?.email) { doc.text(dist.email, 50, yPos); yPos += 14; }
        if (dist?.gstNumber) { doc.text(`GST: ${dist.gstNumber}`, 50, yPos); yPos += 14; }
        if (dist?.address) { doc.text(dist.address, 50, yPos); yPos += 14; }

        // Items Table Header
        const tableTop = Math.max(yPos + 20, 230);
        doc.fillColor('#1a56db').rect(50, tableTop, 495, 22).fill();
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
        doc.text('#', 55, tableTop + 6, { width: 25 });
        doc.text('Product', 80, tableTop + 6, { width: 140 });
        doc.text('SKU', 220, tableTop + 6, { width: 70 });
        doc.text('Type', 290, tableTop + 6, { width: 60 });
        doc.text('Qty', 350, tableTop + 6, { width: 45, align: 'right' });
        doc.text('Unit Price', 400, tableTop + 6, { width: 60, align: 'right' });
        doc.text('Total', 470, tableTop + 6, { width: 70, align: 'right' });

        // Items rows
        let y = tableTop + 28;
        order.items.forEach((item, idx) => {
            const bg = idx % 2 === 0 ? '#f8f9fa' : '#ffffff';
            doc.fillColor(bg).rect(50, y - 4, 495, 20).fill();

            const p = item.productId;
            const lineTotal = item.quantity * (p?.pricePerUnit || 0);

            doc.fontSize(9).font('Helvetica').fillColor('#333');
            doc.text(String(idx + 1), 55, y, { width: 25 });
            doc.text(p?.name || 'Unknown', 80, y, { width: 140 });
            doc.text(p?.sku || '-', 220, y, { width: 70 });
            doc.text(p?.type || '-', 290, y, { width: 60 });
            doc.text(String(item.quantity), 350, y, { width: 45, align: 'right' });
            doc.text(`₹${(p?.pricePerUnit || 0).toLocaleString()}`, 400, y, { width: 60, align: 'right' });
            doc.text(`₹${lineTotal.toLocaleString()}`, 470, y, { width: 70, align: 'right' });

            if (item.batchId) {
                doc.fontSize(7).fillColor('#888').text(`Batch: ${item.batchId}`, 80, y + 11);
                y += 10;
            }
            y += 20;
        });

        // Totals
        doc.moveTo(350, y + 5).lineTo(545, y + 5).strokeColor('#ddd').stroke();
        y += 15;
        const subtotal = order.totalAmount || 0;
        const gst = subtotal * 0.18;
        const grandTotal = subtotal + gst;

        doc.fontSize(10).font('Helvetica').fillColor('#333');
        doc.text('Subtotal:', 370, y, { width: 90, align: 'right' });
        doc.text(`₹${subtotal.toLocaleString()}`, 470, y, { width: 70, align: 'right' });
        y += 18;
        doc.text('GST (18%):', 370, y, { width: 90, align: 'right' });
        doc.text(`₹${gst.toLocaleString()}`, 470, y, { width: 70, align: 'right' });
        y += 18;
        doc.moveTo(350, y).lineTo(545, y).strokeColor('#1a56db').lineWidth(1.5).stroke();
        y += 8;
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a56db');
        doc.text('Grand Total:', 350, y, { width: 110, align: 'right' });
        doc.text(`₹${grandTotal.toLocaleString()}`, 460, y, { width: 80, align: 'right' });

        // Footer
        const footerY = 720;
        doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor('#ddd').lineWidth(0.5).stroke();
        doc.fontSize(8).font('Helvetica').fillColor('#999');
        doc.text('This is a computer-generated invoice. No signature required.', 50, footerY + 10, { align: 'center', width: 495 });
        doc.text('PharmaLink — Pharmaceutical Supply Chain Management System', 50, footerY + 22, { align: 'center', width: 495 });

        doc.end();
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
