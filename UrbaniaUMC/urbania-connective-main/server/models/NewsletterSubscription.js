const mongoose = require('mongoose');

const newsletterSubscriptionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        trim: true
    },
    preferences: {
        categories: [{
            type: String,
            enum: ['Events', 'News', 'Blogs', 'Donations', 'Volunteering', 'Education']
        }],
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            default: 'weekly'
        }
    },
    status: {
        type: String,
        enum: ['active', 'unsubscribed', 'bounced'],
        default: 'active'
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    lastEmailSent: {
        type: Date
    },
    unsubscribeToken: {
        type: String,
        unique: true
    },
    metadata: {
        ipAddress: String,
        userAgent: String,
        source: String
    }
}, {
    timestamps: true
});

// Generate a unique unsubscribe token before saving
newsletterSubscriptionSchema.pre('save', async function (next) {
    if (!this.unsubscribeToken) {
        this.unsubscribeToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    next();
});

const NewsletterSubscription = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);

module.exports = NewsletterSubscription; 