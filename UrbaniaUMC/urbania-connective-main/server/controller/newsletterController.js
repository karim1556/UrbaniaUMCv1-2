const NewsletterSubscription = require('../models/NewsletterSubscription');
const { validateObjectId } = require('../utils/validation');
const nodemailer = require('nodemailer');

// Subscribe to newsletter
exports.subscribe = async (req, res) => {
    try {
        const { email, name, preferences } = req.body;

        // Check if already subscribed
        let subscription = await NewsletterSubscription.findOne({ email });
        if (subscription) {
            if (subscription.status === 'unsubscribed') {
                // Reactivate subscription
                subscription.status = 'active';
                subscription.preferences = preferences;
                subscription.metadata = {
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                    source: req.body.source
                };
                await subscription.save();
            } else {
                return res.status(400).json({ message: 'Already subscribed to newsletter' });
            }
        } else {
            // Create new subscription
            subscription = new NewsletterSubscription({
                email,
                name,
                preferences,
                metadata: {
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                    source: req.body.source
                }
            });
            await subscription.save();
        }

        res.status(201).json(subscription);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Unsubscribe from newsletter
exports.unsubscribe = async (req, res) => {
    try {
        const { token } = req.params;
        const subscription = await NewsletterSubscription.findOne({ unsubscribeToken: token });

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        subscription.status = 'unsubscribed';
        await subscription.save();

        res.json({ message: 'Successfully unsubscribed from newsletter' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all subscribers (admin only)
exports.getAllSubscribers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view subscribers' });
        }

        const { status, category } = req.query;
        const query = {};

        if (status) query.status = status;
        if (category) query['preferences.categories'] = category;

        const subscribers = await NewsletterSubscription.find(query)
            .sort({ subscribedAt: -1 });
        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update subscriber preferences
exports.updatePreferences = async (req, res) => {
    try {
        const { email } = req.params;
        const { preferences } = req.body;

        const subscription = await NewsletterSubscription.findOne({ email });
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        subscription.preferences = preferences;
        await subscription.save();

        res.json(subscription);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Send newsletter (admin only)
exports.sendNewsletter = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to send newsletters' });
        }

        const { subject, content, category } = req.body;

        // Get active subscribers based on category preference
        const query = { status: 'active' };
        if (category) {
            query['preferences.categories'] = category;
        }

        const subscribers = await NewsletterSubscription.find(query);

        // Configure email transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Send emails to subscribers
        const emailPromises = subscribers.map(async (subscriber) => {
            try {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM,
                    to: subscriber.email,
                    subject: subject,
                    html: content,
                    text: content.replace(/<[^>]*>/g, '')
                });

                // Update last email sent timestamp
                subscriber.lastEmailSent = new Date();
                await subscriber.save();
            } catch (error) {
                console.error(`Failed to send email to ${subscriber.email}:`, error);
                // Mark as bounced if email fails
                subscriber.status = 'bounced';
                await subscriber.save();
            }
        });

        await Promise.all(emailPromises);

        res.json({ message: 'Newsletter sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get subscription statistics (admin only)
exports.getStatistics = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view statistics' });
        }

        const stats = await NewsletterSubscription.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const categoryStats = await NewsletterSubscription.aggregate([
            { $unwind: '$preferences.categories' },
            {
                $group: {
                    _id: '$preferences.categories',
                    count: { $sum: 1 }
                }
            }
        ]);

        const frequencyStats = await NewsletterSubscription.aggregate([
            {
                $group: {
                    _id: '$preferences.frequency',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            statusStats: stats,
            categoryStats,
            frequencyStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 