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

module.exports = { sendEmail };
