const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
    if (transporter) return transporter;
    // Create Ethereal test account (no real emails sent)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
    });
    console.log('📧 Ethereal email account:', testAccount.user);
    return transporter;
}

async function sendEmail(to, subject, html) {
    try {
        const t = await getTransporter();
        const info = await t.sendMail({
            from: '"PharmaLink" <noreply@pharmalink.com>',
            to, subject, html
        });
        console.log('📧 Email sent — Preview:', nodemailer.getTestMessageUrl(info));
        return { success: true, previewUrl: nodemailer.getTestMessageUrl(info) };
    } catch (err) {
        console.error('📧 Email error:', err.message);
        return { success: false, error: err.message };
    }
}

// Template: Order Confirmation
async function sendOrderConfirmation(to, name, invoiceNumber, totalAmount, items) {
    const itemRows = items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.price?.toLocaleString()}</td></tr>`).join('');
    return sendEmail(to, `Order Confirmed — ${invoiceNumber}`,
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#1a56db;color:#fff;padding:20px;text-align:center"><h2>PharmaLink</h2></div>
            <div style="padding:20px;background:#f8f9fa">
                <p>Hi ${name},</p>
                <p>Your order <strong>${invoiceNumber}</strong> has been placed successfully!</p>
                <table style="width:100%;border-collapse:collapse;margin:15px 0">
                    <tr style="background:#e2e8f0"><th style="padding:8px;text-align:left">Product</th><th>Qty</th><th>Price</th></tr>
                    ${itemRows}
                </table>
                <p style="font-size:18px"><strong>Total: ₹${totalAmount?.toLocaleString()}</strong></p>
                <p>We will notify you when the order status changes.</p>
                <p>— PharmaLink Team</p>
            </div>
        </div>`
    );
}

// Template: Expiry Warning
async function sendExpiryWarning(to, name, batches) {
    const batchList = batches.map(b => `<li><strong>${b.batchId}</strong> — ${b.productName} — Expires: ${new Date(b.expDate).toLocaleDateString()}</li>`).join('');
    return sendEmail(to, '⚠️ Batch Expiry Warning — PharmaLink',
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#f59e0b;color:#fff;padding:20px;text-align:center"><h2>⚠️ Expiry Alert</h2></div>
            <div style="padding:20px;background:#f8f9fa">
                <p>Hi ${name},</p>
                <p>The following batches are expiring within 30 days:</p>
                <ul>${batchList}</ul>
                <p>Please take action to manage these batches.</p>
                <p>— PharmaLink Team</p>
            </div>
        </div>`
    );
}

module.exports = { sendEmail, sendOrderConfirmation, sendExpiryWarning };
