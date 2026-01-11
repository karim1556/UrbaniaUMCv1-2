const Membership = require('../models/Membership');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { validateObjectId } = require('../utils/validation');

// Membership tiers and their prices (in paise)
const MEMBERSHIP_TIERS = {
    basic: {
        price: 50000, // ₹500
        duration: 12, // months
        benefits: ['newsletter_access', 'event_priority']
    },
    premium: {
        price: 100000, // ₹1000
        duration: 12,
        benefits: ['newsletter_access', 'event_priority', 'exclusive_content', 'volunteer_opportunities']
    },
    lifetime: {
        price: 500000, // ₹5000
        duration: null,
        benefits: ['newsletter_access', 'event_priority', 'exclusive_content', 'volunteer_opportunities', 'donation_receipts', 'member_discounts']
    }
};

// Create a new membership
const createMembership = async (req, res) => {
    try {
        const { tier, paymentMethodId } = req.body;
        const userId = req.user._id;

        // Validate tier
        if (!MEMBERSHIP_TIERS[tier]) {
            return res.status(400).json({ message: 'Invalid membership tier' });
        }

        // Check if user already has an active membership
        const existingMembership = await Membership.findOne({
            user: userId,
            status: 'active'
        });

        if (existingMembership) {
            return res.status(400).json({ message: 'User already has an active membership' });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: MEMBERSHIP_TIERS[tier].price,
            currency: 'inr',
            payment_method: paymentMethodId,
            confirm: true,
            return_url: `${process.env.FRONTEND_URL}/membership/success`,
            cancel_url: `${process.env.FRONTEND_URL}/membership/cancel`
        });

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment failed' });
        }

        // Create membership
        const membership = new Membership({
            user: userId,
            tier,
            benefits: MEMBERSHIP_TIERS[tier].benefits,
            paymentHistory: [{
                amount: MEMBERSHIP_TIERS[tier].price / 100,
                date: new Date(),
                transactionId: paymentIntent.id,
                status: 'succeeded'
            }]
        });

        if (tier !== 'lifetime') {
            membership.endDate = new Date();
            membership.endDate.setMonth(membership.endDate.getMonth() + MEMBERSHIP_TIERS[tier].duration);
        }

        await membership.save();

        res.status(201).json(membership);
    } catch (error) {
        console.error('Membership Creation Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get user's membership
const getUserMembership = async (req, res) => {
    try {
        const membership = await Membership.findOne({ user: req.user._id })
            .populate('user', 'name email');

        if (!membership) {
            return res.status(404).json({ message: 'No membership found' });
        }

        res.json(membership);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all memberships (admin only)
const getAllMemberships = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const memberships = await Membership.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json(memberships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update membership status (admin only)
const updateMembershipStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { membershipId } = req.params;
        const { status } = req.body;

        if (!validateObjectId(membershipId)) {
            return res.status(400).json({ message: 'Invalid membership ID' });
        }

        const membership = await Membership.findById(membershipId);
        if (!membership) {
            return res.status(404).json({ message: 'Membership not found' });
        }

        membership.status = status;
        await membership.save();

        res.json(membership);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cancel membership
const cancelMembership = async (req, res) => {
    try {
        const membership = await Membership.findOne({ user: req.user._id });
        if (!membership) {
            return res.status(404).json({ message: 'Membership not found' });
        }

        membership.status = 'cancelled';
        membership.autoRenew = false;
        await membership.save();

        res.json({ message: 'Membership cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createMembership,
    getUserMembership,
    getAllMemberships,
    updateMembershipStatus,
    cancelMembership
}; 