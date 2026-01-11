const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tier: {
        type: String,
        enum: ['basic', 'premium', 'lifetime'],
        default: 'basic'
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: function () {
            return this.tier !== 'lifetime';
        }
    },
    benefits: [{
        type: String,
        enum: [
            'newsletter_access',
            'event_priority',
            'exclusive_content',
            'volunteer_opportunities',
            'donation_receipts',
            'member_discounts'
        ]
    }],
    paymentHistory: [{
        amount: Number,
        date: Date,
        transactionId: String,
        status: String
    }],
    autoRenew: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Add index for faster queries
membershipSchema.index({ user: 1, status: 1 });
membershipSchema.index({ endDate: 1 });

// Virtual for checking if membership is active
membershipSchema.virtual('isActive').get(function () {
    if (this.tier === 'lifetime') return true;
    return this.status === 'active' && this.endDate > new Date();
});

// Method to check if member has specific benefit
membershipSchema.methods.hasBenefit = function (benefit) {
    return this.benefits.includes(benefit);
};

// Method to renew membership
membershipSchema.methods.renew = async function (duration) {
    if (this.tier === 'lifetime') return false;

    const newEndDate = new Date();
    newEndDate.setMonth(newEndDate.getMonth() + duration);

    this.endDate = newEndDate;
    this.status = 'active';
    await this.save();
    return true;
};

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership; 