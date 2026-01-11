const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.get('/test-email', async (req, res) => {
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Send test email
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.SMTP_USER, // Send to yourself
            subject: 'Test Email from NGO Website',
            html: `
                <h1>Test Email</h1>
                <p>This is a test email from your NGO website.</p>
                <p>If you're seeing this, your email configuration is working correctly!</p>
                <p>Time sent: ${new Date().toLocaleString()}</p>
            `
        });

        res.json({ message: 'Test email sent successfully!' });
    } catch (error) {
        console.error('Email Test Error:', error);
        res.status(500).json({ message: 'Failed to send test email', error: error.message });
    }
});

module.exports = router; 